# Ingat untuk menginstal dependensi sebelum menjalankan file ini:
# pip install fastapi uvicorn requests

from fastapi import FastAPI, Query, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from datetime import date, datetime, timedelta, timezone
import hashlib
import hmac
import json
import math
import os
import re
import uuid
from pathlib import Path
from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
from supabase import create_client, Client
import midtransclient

load_dotenv()

# Setup Supabase Client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("WARNING: SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env!")
    
supabase: Client = create_client(supabase_url or "", supabase_key or "")

# Setup Midtrans Client
MIDTRANS_IS_PRODUCTION = os.environ.get('MIDTRANS_IS_PRODUCTION', 'false').lower() == 'true'
SNAP_JS_URL = (
    "https://app.midtrans.com/snap/snap.js" if MIDTRANS_IS_PRODUCTION
    else "https://app.sandbox.midtrans.com/snap/snap.js"
)
snap = midtransclient.Snap(
    is_production=MIDTRANS_IS_PRODUCTION,
    server_key=os.environ.get('MIDTRANS_SERVER_KEY'),
    client_key=os.environ.get('MIDTRANS_CLIENT_KEY')
)

# ─── PRODUK & HARGA ───
# TODO: harga SEMENTARA Rp20.000/botol (keputusan tim 2026-11-06); harga final diputuskan
# minggu berikutnya — konfirmasi ke tim sebelum expo.
# SATU-SATUNYA sumber harga: backend/produk.json. File yang sama dibaca frontend/next.config.ts
# saat build, jadi harga tetap tampil walau backend sedang tidak bisa dihubungi. Total
# pembayaran selalu dihitung di server (jumlah × harga), tidak pernah diambil dari browser.
# Kalau file hilang/rusak (mis. lupa ikut di-commit, salah ketik JSON), HANYA penjualan yang ditutup
# (503) — skor risiko, laporan, klaim, dan admin lain tetap jalan. Tidak ada angka harga cadangan.
try:
    _PRODUK = json.loads(Path(__file__).with_name("produk.json").read_text(encoding="utf-8"))
    HARGA_PER_BOTOL = int(_PRODUK["harga_per_botol"])
    MAKS_BOTOL_PER_PESANAN = int(_PRODUK["maks_botol_per_pesanan"])
    NAMA_PRODUK = str(_PRODUK["nama"])
    if HARGA_PER_BOTOL <= 0 or MAKS_BOTOL_PER_PESANAN <= 0 or not NAMA_PRODUK.strip():
        raise ValueError("harga, batas pesanan, dan nama wajib diisi")
    # Pilihan pengiriman + ongkir (rupiah). Tanpa blok "pengiriman" = perilaku lama: hanya diantar,
    # tanpa ongkir yang ditagih lewat web.
    PENGIRIMAN = {}
    for _kode, _opsi in (_PRODUK.get("pengiriman") or {"antar": {"label": "Diantar", "ongkir": 0}}).items():
        if _kode not in ("antar", "ambil"):
            continue
        _ongkir = int(_opsi.get("ongkir", 0))
        if _ongkir < 0 or not str(_opsi.get("label", "")).strip():
            raise ValueError(f"opsi pengiriman '{_kode}' tidak valid")
        PENGIRIMAN[_kode] = {"label": str(_opsi["label"]), "keterangan": str(_opsi.get("keterangan", "")), "ongkir": _ongkir}
    if not PENGIRIMAN:
        raise ValueError("minimal satu opsi pengiriman (antar/ambil)")
except Exception as e:
    print(f"PERINGATAN: backend/produk.json tidak valid ({e}). Checkout & pencatatan penjualan dinonaktifkan.")
    HARGA_PER_BOTOL = None
    MAKS_BOTOL_PER_PESANAN = 1
    NAMA_PRODUK = "Patchmos Spray"
    PENGIRIMAN = {}
PESAN_PRODUK_TIDAK_SIAP = "Harga produk belum dikonfigurasi di server. Pembayaran sementara tidak tersedia."

def respons_produk_tidak_siap():
    return JSONResponse(status_code=503, content={"success": False, "message": PESAN_PRODUK_TIDAK_SIAP})
SITE_URL = os.environ.get("SITE_URL", "https://mosqrisk-app.vercel.app").rstrip("/")

app = FastAPI(title="MosqRisk Backend API")

# Konfigurasi CORS agar frontend Next.js (localhost:3000) bisa melakukan fetch tanpa diblokir browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mosqrisk-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup (Supabase)
# Tabel reports dan subscribers harus dibuat di Supabase Dashboard (SQL Editor)

class Report(BaseModel):
    locationName: str = Field(min_length=2, max_length=300)
    reportType: Literal["JENTIK", "DBD", "LAINNYA"]
    description: str = Field(min_length=3, max_length=1000)

class Subscriber(BaseModel):
    locationName: str = Field(min_length=2, max_length=120)
    email: str = Field(max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class ClaimRequest(BaseModel):
    code: str = Field(min_length=4, max_length=40)

class PaymentRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=8, max_length=20, pattern=r"^\+?[0-9][0-9 \-]{6,18}$")
    # Wajib (min. 10 karakter) kalau diantar; boleh kosong kalau ambil sendiri.
    address: Optional[str] = Field(default=None, max_length=400)
    delivery: Literal["antar", "ambil"] = "antar"
    quantity: int = Field(ge=1, le=MAKS_BOTOL_PER_PESANAN)
    # Total yang dilihat pembeli di layar (termasuk ongkir). Kalau berbeda dengan hitungan server
    # (mis. harga baru saja diganti), transaksi ditolak supaya pembeli tidak kaget.
    expectedTotal: Optional[int] = None

    @model_validator(mode="after")
    def alamat_wajib_kalau_diantar(self):
        if self.delivery == "antar" and len((self.address or "").strip()) < 10:
            raise ValueError("Alamat pengiriman wajib diisi (minimal 10 karakter).")
        return self

class PaymentStatusRequest(BaseModel):
    orderId: str = Field(pattern=r"^MOSQ-\d{14}-[0-9a-f]{8}$")

class OfflineSaleRequest(BaseModel):
    quantity: int = Field(ge=1, le=500)
    paymentMethod: Literal["tunai", "qris", "transfer", "lainnya"]
    customerName: Optional[str] = Field(default=None, max_length=80)
    notes: Optional[str] = Field(default=None, max_length=300)
    soldAt: Optional[date] = None

STATUS_PESANAN = ("menunggu_pembayaran", "dibayar", "dikirim", "selesai", "batal", "gagal")

class OrderStatusUpdate(BaseModel):
    status: Literal["menunggu_pembayaran", "dibayar", "dikirim", "selesai", "batal", "gagal"]

security = HTTPBearer()

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Fail closed: tanpa ADMIN_KEY di environment, SEMUA akses admin ditolak.
    # (Dulu ada nilai default yang tertulis di kode — siapa pun bisa masuk kalau env kosong.)
    admin_key = os.getenv("ADMIN_KEY", "").strip()
    if not admin_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Akses admin belum dikonfigurasi (ADMIN_KEY kosong).",
        )
    if not hmac.compare_digest(credentials.credentials.encode(), admin_key.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

# API Endpoint JSON Publik BMKG
BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4="

# ─── MODEL RISIKO MOSQRISK v4 (2026-11-07) ───
# SATU-SATUNYA sumber parameter: backend/rumus_risiko.json (dibaca juga oleh frontend saat build
# untuk simulator & grafik di /edukasi).
#
#   Indeks = 100 × S_suhu × S_kelembapan × S_hujan        (tiap S bernilai 0–1)
#
# Bentuknya PERKALIAN, mengikuti rumus angka penularan R0 (Ross–Macdonald) yang dipakai
# Mordecai dkk. (2017): kalau satu syarat nol (mis. terlalu dingin untuk virus berkembang),
# penularan nol walau syarat lain ideal. Rumus poin yang DIJUMLAH (v1–v3) keliru di sini:
# 10 °C + lembap + hujan tetap dapat skor "Sedang".
#   S_suhu      = R0(T) Aedes aegypti × DENV, dinormalkan ke puncaknya (±29 °C). Persamaan (1)
#                 Mordecai dkk. 2017, parameter 8 kurva sifat nyamuk/virus dari S2 Text Tabel B.
#   S_kelembapan, S_hujan = pengali garis lurus antartitik — ASUMSI tim (arah pengaruh dari
#                 Schmidt dkk. 2018 dan Benedum dkk. 2018), ditulis terbuka di /edukasi.
# Kategori: TINGGI ≥ 75, SEDANG 50–74, RENDAH < 50 (keputusan tim).
#
# Riwayat:
#   v3 (07-11-2026 siang): poin dijumlah — suhu 40 (garis 18→26–29→34 °C), kelembapan 25
#     (40→80%), hujan 35 (0 mm = 10, 5–50 mm = 35, 100 mm = 20). Rata-rata harian.
#   v2 (sebelumnya): suhu Gaussian asimetris optimum 28 °C × 40; kelembapan ≥ 80% = 25,
#     60–80% linear, < 60% = (RH/60) × 10 (lompatan di 60%); hujan 0 mm = 10, 0,5–20 mm = 35,
#     20–35 mm = 20, selain itu 5; skor minimum 5; dari SATU record BMKG per 3 jam terdekat.
#   Tabel di slide PIKU (suhu 40/25/10, kelembapan 30/20/10, hujan 30/15/10) tidak pernah
#     dipakai di kode dan sumbernya tidak diketahui.

def _nilai_sifat(s, T):
    """Kurva termal satu sifat: Brière c·T·(T−T0)·√(Tm−T) atau kuadrat c·(T−T0)·(Tm−T); 0 di luar (T0, Tm)."""
    T0, Tm, c = s["T0"], s["Tm"], s["c"]
    if T <= T0 or T >= Tm:
        return 0.0
    if s["fungsi"] == "briere":
        return c * T * (T - T0) * math.sqrt(Tm - T)
    return c * (T - T0) * (Tm - T)

def r0_mentah(sifat, T):
    """Persamaan (1) Mordecai dkk. 2017 tanpa N dan r (konstan, hilang saat dinormalkan)."""
    v = {k: _nilai_sifat(s, T) for k, s in sifat.items()}
    if min(v.values()) <= 0:
        return 0.0
    mu = 1.0 / v["lf"]
    return math.sqrt(v["a"] ** 2 * v["b"] * v["c"] * math.exp(-mu / v["PDR"]) * v["EFD"] * v["pEA"] * v["MDR"] / mu ** 3)

def _cek_titik(titik, nama):
    if len(titik) < 2 or any(q[0] <= p[0] for p, q in zip(titik, titik[1:])):
        raise ValueError(f"titik {nama} harus ≥ 2 dan nilai x-nya naik")
    if any(not 0 <= y <= 1 for _, y in titik):
        raise ValueError(f"pengali {nama} harus 0–1")

try:
    RUMUS = json.loads(Path(__file__).with_name("rumus_risiko.json").read_text(encoding="utf-8"))
    SIFAT_SUHU = RUMUS["faktor"]["suhu"]["sifat"]
    if set(SIFAT_SUHU) != {"a", "EFD", "pEA", "MDR", "lf", "b", "c", "PDR"}:
        raise ValueError("sifat suhu harus a, EFD, pEA, MDR, lf, b, c, PDR")
    _cek_titik(RUMUS["faktor"]["kelembapan"]["titik"], "kelembapan")
    _cek_titik(RUMUS["faktor"]["hujan"]["titik"], "hujan")
    _cek_titik(RUMUS["bulanan"]["hujan"]["titik"], "hujan bulanan")
    # Puncak R0 dicari sekali (langkah 0,01 °C) untuk menormalkan S_suhu ke 0–1.
    R0_PUNCAK = max(r0_mentah(SIFAT_SUHU, i / 100) for i in range(500, 4500))
    if R0_PUNCAK <= 0:
        raise ValueError("kurva suhu tidak punya puncak")
    AMBANG_TINGGI = float(RUMUS["kategori"]["tinggi"])
    AMBANG_SEDANG = float(RUMUS["kategori"]["sedang"])
except Exception as e:
    # Fail closed hanya untuk skor risiko (503) — klaim, laporan, checkout, admin tetap jalan.
    print(f"PERINGATAN: backend/rumus_risiko.json tidak valid ({e}). Skor risiko dinonaktifkan.")
    RUMUS = None
PESAN_RUMUS_TIDAK_SIAP = "Rumus risiko belum dikonfigurasi di server."

def interpolasi(titik, x):
    """Garis lurus antartitik [(x, nilai), ...]; di luar rentang, nilai = titik terdekat."""
    if x <= titik[0][0]:
        return float(titik[0][1])
    for (x0, y0), (x1, y1) in zip(titik, titik[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return float(titik[-1][1])

def s_suhu(temp):
    return r0_mentah(SIFAT_SUHU, temp) / R0_PUNCAK

def nilai_faktor(temp, humidity, precipitation=0.0, titik_hujan=None):
    """Pengali 0–1 tiap faktor (S_suhu, S_kelembapan, S_hujan). Data kosong = pengali netral 1,
    kecuali suhu (tanpa suhu tidak ada skor — 0). Dikirim apa adanya ke frontend (risk_factors)."""
    f = RUMUS["faktor"]
    su = s_suhu(temp) if temp is not None else 0.0
    ke = interpolasi(f["kelembapan"]["titik"], humidity) if humidity is not None else 1.0
    hu = interpolasi(titik_hujan or f["hujan"]["titik"], precipitation) if precipitation is not None else 1.0
    return su, ke, hu

def kategori_risiko(score):
    return "TINGGI" if score >= AMBANG_TINGGI else "SEDANG" if score >= AMBANG_SEDANG else "RENDAH"

def bulatkan(x):
    # Pembulatan biasa (0,5 ke atas) — sama dengan Math.round di simulator /edukasi.
    # round() bawaan Python memakai pembulatan bankir (74,5 → 74), jadi tidak dipakai.
    return int(math.floor(x + 0.5))

def indeks_risiko(su, ke, hu):
    score = min(max(bulatkan(100 * su * ke * hu), 0), 100)
    return score, kategori_risiko(score)

def calculate_mosquito_risk(temp, humidity, precipitation=0.0):
    return indeks_risiko(*nilai_faktor(temp, humidity, precipitation))

def ringkas_hari(records):
    """Rata-rata suhu & kelembapan, total hujan, dan suhu min/maks dari record BMKG per 3 jam satu hari."""
    t = [float(x["t"]) for x in records if x.get("t") is not None]
    h = [float(x["hu"]) for x in records if x.get("hu") is not None]
    p = [float(x["tp"]) for x in records if x.get("tp") is not None]
    return {
        "suhu": round(sum(t) / len(t), 1) if t else None,
        "kelembapan": round(sum(h) / len(h), 1) if h else None,
        "hujan": round(sum(p), 1) if p else 0.0,
        "suhu_min": min(t) if t else None,
        "suhu_maks": max(t) if t else None,
        "records": len(records),
    }

def cuaca_dominan(records):
    """Satu deskripsi cuaca untuk ikon harian: hujan/petir menang, selain itu yang paling sering."""
    desc = [str(x.get("weather_desc") or "") for x in records if x.get("weather_desc")]
    if not desc:
        return None
    basah = [d for d in desc if "hujan" in d.lower() or "petir" in d.lower()]
    if basah:
        return max(set(basah), key=basah.count)
    return max(set(desc), key=desc.count)

_OFFSET_ZONA = {"Asia/Jakarta": 7, "Asia/Pontianak": 7, "Asia/Makassar": 8, "Asia/Jayapura": 9}

def tanggal_lokal_sekarang(zona):
    """Tanggal hari ini (YYYY-MM-DD) di zona waktu wilayah BMKG, tanpa bergantung pada tzdata."""
    jam = _OFFSET_ZONA.get(zona or "", 7)
    return (datetime.now(timezone.utc) + timedelta(hours=jam)).strftime("%Y-%m-%d")

def pilih_record_terdekat(cuaca_lists):
    """Pilih record prakiraan BMKG (per 3 jam) yang waktunya paling dekat dengan sekarang.
    Mengembalikan (indeks_hari, record). Cadangan: record pertama hari pertama."""
    sekarang = datetime.now(timezone.utc)
    terbaik, idx_terbaik, selisih_min = None, 0, None
    for idx, hari in enumerate(cuaca_lists):
        for item in hari or []:
            waktu = item.get('utc_datetime') or item.get('datetime') or ''
            try:
                t = datetime.strptime(waktu.replace('T', ' ').replace('Z', '')[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            except ValueError:
                continue
            selisih = abs((t - sekarang).total_seconds())
            if selisih_min is None or selisih < selisih_min:
                terbaik, idx_terbaik, selisih_min = item, idx, selisih
    if terbaik is None:
        return 0, cuaca_lists[0][0]
    return idx_terbaik, terbaik

# Simple In-Memory Cache
weather_cache = {}
CACHE_EXPIRY = 3600  # 1 hour

def fetch_city_weather(adm4_code):
    """Ambil prakiraan BMKG satu desa/kelurahan → (ringkasan, None) atau (None, pesan_galat).

    Ringkasan: cuaca "sekarang" (record per 3 jam terdekat), ringkasan HARI INI menurut tanggal
    lokal wilayah (dasar skor), dan ringkasan tiap hari prakiraan (tren 3 hari)."""
    now = datetime.now().timestamp()
    if adm4_code in weather_cache:
        cached_data, timestamp = weather_cache[adm4_code]
        if now - timestamp < CACHE_EXPIRY:
            return cached_data

    try:
        headers = {'User-Agent': 'MosqRisk-Engine/1.0'}
        response = requests.get(f"{BASE_URL}{adm4_code}", headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            try:
                cuaca_lists = data.get('data', [{}])[0].get('cuaca', [])
                if not cuaca_lists or not cuaca_lists[0]:
                    return None, "Data cuaca kosong dari BMKG"

                lokasi = data.get('lokasi', {}) or {}
                # Cuaca "sekarang": record prakiraan yang waktunya paling dekat dengan sekarang.
                idx_hari, current_weather = pilih_record_terdekat(cuaca_lists)

                # Dasar skor = daftar record HARI INI menurut tanggal lokal wilayah. Menjelang tengah malam
                # daftar hari ini bisa sudah habis — cadangannya daftar milik record terdekat.
                tanggal_hari_ini = tanggal_lokal_sekarang(lokasi.get('timezone'))
                idx_dasar = next(
                    (i for i, hari in enumerate(cuaca_lists) if hari and str(hari[0].get('local_datetime', ''))[:10] == tanggal_hari_ini),
                    idx_hari,
                )

                # Ringkasan per hari (tren 3 hari) — rumus yang sama dengan skor utama.
                trend = []
                hari_indo = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
                for daily_data in cuaca_lists:
                    if not daily_data:
                        continue
                    # Ambil record pertama untuk patokan tanggal
                    dt_str = daily_data[0].get('local_datetime')
                    if dt_str:
                        dt_obj = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                        day_name = hari_indo[dt_obj.isoweekday() % 7]
                    else:
                        day_name = "?"
                    r = ringkas_hari(daily_data)
                    score, kategori = calculate_mosquito_risk(r["suhu"], r["kelembapan"], r["hujan"])
                    trend.append({
                        "day": day_name,
                        "date": dt_str[:10] if dt_str else None,
                        "risk_score": score,
                        "risk_status": kategori,
                        # Jumlah record prakiraan per 3 jam yang dirata-rata. Hari ini & hari terakhir sering
                        # belum lengkap (mis. 3 dari 8 record) — frontend memberi catatan untuk itu.
                        "records": r["records"],
                        "temperature_celsius": r["suhu"],
                        "temperature_min": r["suhu_min"],
                        "temperature_max": r["suhu_maks"],
                        "humidity_percent": r["kelembapan"],
                        "precipitation_mm": r["hujan"],
                        "weather_desc": cuaca_dominan(daily_data),
                    })

                dasar = ringkas_hari(cuaca_lists[idx_dasar])
                hasil = {
                    "hari_ini": {**dasar, "tanggal": str(cuaca_lists[idx_dasar][0].get('local_datetime', ''))[:10] or None},
                    "sekarang": {
                        "waktu": current_weather.get('local_datetime'),
                        "suhu": current_weather.get('t'),
                        "kelembapan": current_weather.get('hu'),
                        "cuaca": current_weather.get('weather_desc'),
                        "analysis_date": current_weather.get('analysis_date'),
                    },
                    "lat": lokasi.get('lat', 0),
                    "lon": lokasi.get('lon', 0),
                    "timezone": lokasi.get('timezone'),
                    "location": {k: lokasi.get(k) for k in ("provinsi", "kotkab", "kecamatan", "desa")},
                    "trend": trend,
                }
                result = (hasil, None)
                weather_cache[adm4_code] = (result, now)
                return result
            except Exception as e:
                print(f"Struktur JSON tidak terduga untuk kode {adm4_code}: {e}")
                return None, f"JSON parse error: {str(e)}"
        else:
            print(f"Gagal akses API untuk kode {adm4_code}. Status: {response.status_code}")
            return None, f"API Error: HTTP {response.status_code}"
    except Exception as e:
        print(f"Error koneksi ke BMKG: {e}")
        return None, f"Network Error: {str(e)}"

@app.get("/api/mosqrisk")
async def get_mosqrisk_data(adm4: str = Query(..., description="Kode ADM4 BPS (contoh: 11.71.03.2001)")):
    """Endpoint utama untuk menarik skor risiko nyamuk berdasarkan kode adm4 wilayah"""
    if RUMUS is None:
        return JSONResponse(status_code=503, content={"success": False, "error": PESAN_RUMUS_TIDAK_SIAP})
    hasil, err_msg = fetch_city_weather(adm4)

    if hasil and hasil["hari_ini"]["suhu"] is not None and hasil["hari_ini"]["kelembapan"] is not None:
        h = hasil["hari_ini"]
        n_suhu, n_lembap, n_hujan = nilai_faktor(h["suhu"], h["kelembapan"], h["hujan"])
        risk_score, risk_status = indeks_risiko(n_suhu, n_lembap, n_hujan)
        sekarang = hasil["sekarang"]
        return {
            "success": True,
            "data": {
                # Dasar skor: rata-rata suhu & kelembapan + total hujan sehari (tanggal lokal wilayah)
                "temperature_celsius": h["suhu"],
                "humidity_percent": h["kelembapan"],
                "precipitation_mm": h["hujan"],
                "lat": hasil["lat"],
                "lon": hasil["lon"],
                "risk_score": risk_score,
                "risk_status": risk_status,
                "trend": hasil["trend"],
                # Pengali 0–1 per faktor (satu sumber rumus: nilai_faktor) — ditampilkan apa adanya di frontend.
                # risk_score = bulatkan(100 × suhu × kelembapan × hujan).
                "risk_factors": {
                    "suhu": {"nilai": round(n_suhu, 3)},
                    "kelembapan": {"nilai": round(n_lembap, 3)},
                    "hujan": {"nilai": round(n_hujan, 3)},
                },
                "basis": {"date": h["tanggal"], "records": h["records"], "temperature_min": h["suhu_min"], "temperature_max": h["suhu_maks"]},
                "formula_version": RUMUS.get("versi"),
                # Cuaca "sekarang" = record BMKG per 3 jam terdekat (waktu lokal wilayah) — untuk ikon & keterangan
                "current": {"time": sekarang["waktu"], "temperature": sekarang["suhu"], "humidity": sekarang["kelembapan"], "weather_desc": sekarang["cuaca"]},
                "forecast_time": sekarang["waktu"],
                "analysis_date": sekarang["analysis_date"],
                "timezone": hasil["timezone"],
                "weather_desc": sekarang["cuaca"],
                "location": hasil["location"],
                "last_updated": datetime.now().isoformat()
            }
        }
    else:
        return {
            "success": False,
            "error": f"Data cuaca tidak tersedia. {err_msg or ''}".strip()
        }

@app.get("/api/climate-trend")
async def get_climate_trend(lat: float = Query(...), lon: float = Query(...)):
    """Endpoint untuk mendapatkan tren iklim 12 bulan terakhir dari Open-Meteo"""
    if RUMUS is None:
        return JSONResponse(status_code=503, content={"success": False, "error": PESAN_RUMUS_TIDAK_SIAP})
    try:
        from dateutil.relativedelta import relativedelta
        
        # Rolling 12 bulan terakhir
        now = datetime.now()
        end_dt = now.replace(day=1) - timedelta(days=1)
        start_dt = (end_dt.replace(day=1) - relativedelta(months=11))
        
        start_date = start_dt.strftime("%Y-%m-%d")
        end_date = end_dt.strftime("%Y-%m-%d")
        
        # Label periode
        months_indo_full = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        period_label = f"{months_indo_full[start_dt.month-1]} {start_dt.year} – {months_indo_full[end_dt.month-1]} {end_dt.year}"
        
        # Open-Meteo Archive API — dengan kelembapan + kecepatan angin
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}"
            f"&start_date={start_date}&end_date={end_date}"
            f"&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,windspeed_10m_mean"
            f"&timezone=Asia%2FJakarta"
        )
        
        headers = {'User-Agent': 'MosqRisk-Engine/1.0'}
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            return {"success": False, "error": f"Open-Meteo API Error: {response.status_code}"}
            
        data = response.json()
        daily = data.get("daily", {})
        times = daily.get("time", [])
        temps = daily.get("temperature_2m_mean", [])
        precips = daily.get("precipitation_sum", [])
        humids = daily.get("relative_humidity_2m_mean", [])
        winds = daily.get("windspeed_10m_mean", [])
        
        if not times:
            return {"success": False, "error": "No daily data returned from Open-Meteo"}
        
        # Agregasi ke bulanan (key = "YYYY-MM")
        monthly_data = {}
        for i, date_str in enumerate(times):
            key = date_str[:7]
            if key not in monthly_data:
                monthly_data[key] = {"temps": [], "precips": [], "humids": [], "winds": []}
                
            if i < len(temps) and temps[i] is not None:
                monthly_data[key]["temps"].append(temps[i])
            if i < len(precips) and precips[i] is not None:
                monthly_data[key]["precips"].append(precips[i])
            if i < len(humids) and humids[i] is not None:
                monthly_data[key]["humids"].append(humids[i])
            if i < len(winds) and winds[i] is not None:
                monthly_data[key]["winds"].append(winds[i])
        
        sorted_keys = sorted(monthly_data.keys())
        months_indo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
        
        trend = []
        for key in sorted_keys:
            m_data = monthly_data[key]
            month_num = int(key.split("-")[1])
            year_num = int(key.split("-")[0])
            
            avg_temp = sum(m_data["temps"]) / len(m_data["temps"]) if m_data["temps"] else 28.0
            sum_precip = sum(m_data["precips"]) if m_data["precips"] else 0.0
            avg_humid = sum(m_data["humids"]) / len(m_data["humids"]) if m_data["humids"] else 75.0
            avg_wind = sum(m_data["winds"]) / len(m_data["winds"]) if m_data["winds"] else 8.0
            
            # ══════════════════════════════════════════════════════════════
            # RUMUS SKOR RISIKO DBD — versi BULANAN (v4, 2026-11-07)
            # ══════════════════════════════════════════════════════════════
            # Sama dengan skor harian: indeks = 100 × S_suhu × S_kelembapan × S_hujan.
            # S_suhu & S_kelembapan dari rata-rata bulan; S_hujan memakai titik "bulanan.hujan"
            # di rumus_risiko.json (total hujan sebulan, asumsi tim).
            # Riwayat v2/v3: (suhu 40 + hujan sigmoid 35 + kelembapan 25) × pengali angin 0,85–1,0.
            # Pengali angin dihapus di v4 — sumber kuantitatifnya tidak pernah tercatat.
            su, ke, hu = nilai_faktor(avg_temp, avg_humid, sum_precip, RUMUS["bulanan"]["hujan"]["titik"])
            score, _ = indeks_risiko(su, ke, hu)
            
            label = f"{months_indo[month_num-1]} '{str(year_num)[2:]}"
            
            trend.append({
                "name": label,
                "hujan": round(sum_precip, 1),
                "suhu": round(avg_temp, 1),
                "kelembapan": round(avg_humid, 1),
                "angin": round(avg_wind, 1),
                "risiko": score
            })
            
        return {
            "success": True,
            "period": period_label,
            "data": trend
        }
    except Exception as e:
        print(f"Error Open-Meteo: {e}")
        return {"success": False, "error": str(e)}

# --- EMAIL HELPERS ---
FOOTER_EMAIL = (
    "\n\nSalam,\nTim MosqRisk / Patchmos — Universitas Syiah Kuala\n{site}\n\n"
    "Kamu menerima email ini karena mendaftar notifikasi MosqRisk untuk wilayah {loc}. "
    "Untuk berhenti, balas email ini dengan kata BERHENTI."
)

LABEL_LAPORAN = {
    "JENTIK": "temuan jentik/sarang nyamuk",
    "DBD": "dugaan kasus DBD",
    "LAINNYA": "laporan lain",
}

def buat_email(gmail_user, to_addr, subject, body):
    msg = MIMEMultipart()
    msg['From'] = formataddr(("MosqRisk", gmail_user))
    msg['To'] = to_addr
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    return msg

# --- LOCAL BROADCAST LOGIC ---
LOC_PREFIXES = ['kabupaten ', 'kota ', 'provinsi ', 'kecamatan ', 'kelurahan ', 'desa ']

def clean_loc(loc_str):
    loc_str = (loc_str or "").lower()
    for p in LOC_PREFIXES:
        loc_str = loc_str.replace(p, '')
    return re.sub(r"\s+", " ", loc_str).strip()

def _ada_frasa(teks, frasa):
    return re.search(r"(?<!\w)" + re.escape(frasa) + r"(?!\w)", teks) is not None

def lokasi_cocok(lokasi_laporan, lokasi_pelanggan):
    """True kalau laporan berada di wilayah langganan pelanggan.

    Dicocokkan per frasa utuh (bukan potongan huruf), dan teks lokasi laporan yang
    terlalu pendek tidak dipakai untuk mencocokkan — supaya laporan berlokasi "a"
    tidak terkirim ke semua pelanggan.
    """
    c_rep = clean_loc(lokasi_laporan)
    c_sub = clean_loc(lokasi_pelanggan)
    if not c_rep or not c_sub:
        return False
    if c_sub == 'umum':
        return True
    if len(c_sub) >= 3 and _ada_frasa(c_rep, c_sub):
        return True
    return len(c_rep) >= 4 and _ada_frasa(c_sub, c_rep)

# Laporan asli terjadi di satu tempat. Kalau teks lokasinya cocok ke lebih dari ini
# wilayah langganan sekaligus (mis. "Medan Banda Aceh Aceh Utara ..."), laporan tetap
# disimpan tetapi TIDAK di-email-kan — mencegah endpoint publik dipakai untuk spam.
MAKS_WILAYAH_PER_LAPORAN = 2
URL_RE = re.compile(r"(https?://|www\.)\S+", re.IGNORECASE)

def tanpa_tautan(teks):
    """Hapus tautan dari teks buatan warga sebelum diteruskan lewat email resmi."""
    return URL_RE.sub("[tautan dihapus]", teks or "")

def pilih_penerima(lokasi_laporan, pelanggan):
    """Return (penerima [(email, lokasi)], mencurigakan: bool)."""
    target = [(e, l) for e, l in pelanggan if lokasi_cocok(lokasi_laporan, l)]
    wilayah = {clean_loc(l) for _, l in target if clean_loc(l) != 'umum'}
    return target, len(wilayah) > MAKS_WILAYAH_PER_LAPORAN

def send_local_broadcast(report: Report):
    try:
        response = supabase.table("subscribers").select("email, location_name").execute()
        subscribers = [(row['email'], row['location_name']) for row in response.data]

        target_emails, mencurigakan = pilih_penerima(report.locationName, subscribers)
        if mencurigakan:
            print("Lokasi laporan cocok ke terlalu banyak wilayah — email tidak dikirim (laporan tetap tersimpan).")
            return

        if target_emails:
            gmail_user = os.getenv("GMAIL_USER", "mosqrisk.official@gmail.com")
            gmail_password = os.getenv("GMAIL_PASSWORD")
            if not gmail_password:
                print("GMAIL_PASSWORD kosong — email laporan warga tidak dikirim.")
                return
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(gmail_user, gmail_password)

            label = LABEL_LAPORAN.get(report.reportType, "laporan")
            for email_addr, loc in target_emails:
                subject = f"Info warga MosqRisk: {label} di sekitar {loc}"
                body = (
                    f"Halo,\n\nMosqRisk menerima {label} dari warga di sekitar wilayahmu.\n"
                    f"Lokasi yang ditulis pelapor: {tanpa_tautan(report.locationName)}\n\n"
                    f"Isi laporan:\n\"{tanpa_tautan(report.description)}\"\n\n"
                    "Catatan: laporan ini dikirim oleh warga dan belum diverifikasi tim MosqRisk.\n\n"
                    "Langkah yang bisa dilakukan: periksa dan kuras tempat penampungan air, tutup wadah air, "
                    "dan singkirkan barang bekas yang dapat menampung air (3M Plus). "
                    f"Cek skor risiko wilayahmu: {SITE_URL}/pantau"
                    + FOOTER_EMAIL.format(site=SITE_URL, loc=loc)
                )
                msg = buat_email(gmail_user, email_addr, subject, body)
                server.sendmail(gmail_user, email_addr, msg.as_string())

            server.quit()
    except Exception as email_err:
        print(f"Error sending local broadcast: {email_err}")

@app.post("/api/reports")
async def submit_report(report: Report, background_tasks: BackgroundTasks):
    try:
        # Insert to Supabase
        supabase.table("reports").insert({
            "location_name": report.locationName.strip(),
            "report_type": report.reportType,
            "description": report.description.strip()
        }).execute()

        background_tasks.add_task(send_local_broadcast, report)

        return {"success": True, "message": "Laporan berhasil disimpan"}
    except Exception as e:
        print(f"Gagal menyimpan laporan: {e}")
        return {"success": False, "message": "Laporan gagal disimpan. Coba lagi nanti."}

@app.get("/api/reports")
async def get_reports(token: str = Depends(verify_admin)):
    try:
        response = supabase.table("reports").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/reports/{id}")
async def delete_report(id: str, token: str = Depends(verify_admin)):
    try:
        supabase.table("reports").delete().eq("id", id).execute()
        return {"success": True, "message": "Laporan berhasil dihapus"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/stats")
async def get_stats():
    """Jumlah laporan warga & pelanggan email — angka asli dari database.

    (Versi lama mengembalikan "impact_kg" hasil rumus karangan
    2,5 kg + 0,5 kg/laporan + 1,2 kg/pelanggan; sudah dihapus karena tidak berbasis data.)
    """
    try:
        reports_res = supabase.table("reports").select("id", count="exact").limit(1).execute()
        total_reports = reports_res.count if reports_res.count is not None else 0

        subs_res = supabase.table("subscribers").select("id", count="exact").limit(1).execute()
        total_subs = subs_res.count if subs_res.count is not None else 0

        return {"success": True, "total_reports": total_reports, "total_subscribers": total_subs}
    except Exception as e:
        print(f"Gagal menghitung statistik: {e}")
        return {"success": False}

def send_welcome_email(sub: Subscriber):
    try:
        gmail_user = os.getenv("GMAIL_USER", "mosqrisk.official@gmail.com")
        gmail_password = os.getenv("GMAIL_PASSWORD")
        if gmail_user == "MASUKKAN_EMAIL_DISINI": return
        if not gmail_password:
            print("GMAIL_PASSWORD kosong — email sambutan tidak dikirim.")
            return

        body = (
            f"Halo,\n\nNotifikasi email MosqRisk untuk wilayah {sub.locationName} sudah aktif.\n\n"
            "Kamu akan menerima email saat:\n"
            "- ada laporan warga (jentik, dugaan kasus DBD, dll.) di wilayah ini, atau\n"
            "- tim MosqRisk mengirim peringatan kewaspadaan.\n\n"
            f"Skor risiko terbaru bisa dicek kapan saja di {SITE_URL}/pantau. "
            "Skor dihitung dari prakiraan cuaca BMKG (suhu, kelembapan, curah hujan)."
            + FOOTER_EMAIL.format(site=SITE_URL, loc=sub.locationName)
        )
        msg = buat_email(gmail_user, sub.email, "Notifikasi MosqRisk aktif", body)

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, sub.email, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Failed sending welcome email: {e}")

@app.post("/api/subscribe")
async def subscribe_wa(sub: Subscriber, background_tasks: BackgroundTasks):
    try:
        # Check if already subscribed
        check = supabase.table("subscribers").select("*", count="exact").eq("email", sub.email).execute()
        if check.count and check.count > 0:
            # Upsert (Update location if exists)
            supabase.table("subscribers").update({
                "location_name": sub.locationName
            }).eq("email", sub.email).execute()
            return {"success": True, "message": f"Lokasi pantauan untuk email Anda berhasil diperbarui menjadi {sub.locationName}."}

        # Insert into DB
        supabase.table("subscribers").insert({
            "location_name": sub.locationName,
            "email": sub.email
        }).execute()

        background_tasks.add_task(send_welcome_email, sub)

        return {"success": True, "message": "Email terdaftar. Kamu akan menerima email saat ada laporan warga di wilayah ini atau saat tim MosqRisk mengirim peringatan."}
    except Exception as e:
        print(f"Gagal mendaftarkan email: {e}")
        return {"success": False, "message": "Gagal mendaftarkan email. Coba lagi nanti."}

@app.get("/api/subscribe")
async def get_subscribers(token: str = Depends(verify_admin)):
    try:
        response = supabase.table("subscribers").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/subscribe/{id}")
async def delete_subscriber(id: str, token: str = Depends(verify_admin)):
    try:
        supabase.table("subscribers").delete().eq("id", id).execute()
        return {"success": True, "message": "Pelanggan berhasil dihapus"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def send_broadcast_emails(rows):
    try:
        gmail_user = os.getenv("GMAIL_USER", "mosqrisk.official@gmail.com")
        gmail_password = os.getenv("GMAIL_PASSWORD")
        if gmail_user == "MASUKKAN_EMAIL_DISINI": return
        if not gmail_password:
            print("GMAIL_PASSWORD kosong — broadcast tidak dikirim.")
            return

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)

        for target_email, loc_name in rows:
            try:
                # Broadcast dikirim ke SEMUA pelanggan (belum ditarget per tingkat risiko),
                # jadi isinya tidak boleh mengklaim risiko wilayah penerima sedang tinggi.
                body = (
                    "Halo,\n\nTim MosqRisk mengirim peringatan kewaspadaan DBD kepada semua pelanggan notifikasi.\n"
                    f"Cek skor risiko terbaru untuk wilayahmu ({loc_name}) di {SITE_URL}/pantau — "
                    "skor dihitung dari prakiraan cuaca BMKG.\n\n"
                    "Langkah pencegahan 3M Plus:\n"
                    "1. Menguras tempat penampungan air\n"
                    "2. Menutup tempat penampungan air\n"
                    "3. Mendaur ulang barang bekas yang dapat menampung air\n"
                    "Plus: cegah gigitan nyamuk, misalnya dengan kelambu atau pakaian tertutup.\n\n"
                    "Jika ada anggota keluarga yang demam tinggi mendadak, segera periksakan ke puskesmas "
                    "atau fasilitas kesehatan terdekat."
                    + FOOTER_EMAIL.format(site=SITE_URL, loc=loc_name)
                )
                msg = buat_email(gmail_user, target_email, "Peringatan kewaspadaan DBD dari tim MosqRisk", body)
                server.sendmail(gmail_user, target_email, msg.as_string())
            except Exception as e:
                print(f"Failed to send to {target_email}: {e}")
        server.quit()
    except Exception as e:
        print(f"Failed to process broadcast: {e}")

@app.post("/api/admin/verify")
def verify_admin_login(token: str = Depends(verify_admin)):
    return {"success": True, "message": "Admin verified"}

@app.post("/api/broadcast")
async def broadcast_alert(background_tasks: BackgroundTasks, token: str = Depends(verify_admin)):
    try:
        response = supabase.table("subscribers").select("email, location_name").execute()
        rows = [(row['email'], row['location_name']) for row in response.data]
        
        if not rows:
            return {"success": False, "message": "Tidak ada pelanggan terdaftar."}
            
        background_tasks.add_task(send_broadcast_emails, rows)
        
        return {"success": True, "message": f"Broadcast dijadwalkan untuk {len(rows)} pelanggan."}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/claim")
async def claim_premium(req: ClaimRequest):
    try:
        code_upper = req.code.strip().upper()
        
        # Check if code exists and is not used
        result = supabase.table("premium_codes").select("*").eq("code", code_upper).execute()
        if not result.data:
            return {"success": False, "message": "Kode tidak valid atau tidak ditemukan."}
        
        code_row = result.data[0]
        if code_row.get("is_used"):
            return {"success": False, "message": "Maaf, kode ini sudah pernah diklaim sebelumnya."}

        # Mark as used — atomik: hanya berhasil kalau kode masih belum terpakai,
        # jadi dua klaim bersamaan tidak bisa sama-sama sukses.
        updated = supabase.table("premium_codes").update({"is_used": True}).eq("code", code_upper).eq("is_used", False).execute()
        if not updated.data:
            return {"success": False, "message": "Maaf, kode ini sudah pernah diklaim sebelumnya."}

        return {"success": True, "message": "Berhasil! Akses Premium aktif di perangkat ini."}
    except Exception as e:
        print(f"Gagal memproses klaim kode: {e}")
        return {"success": False, "message": "Klaim gagal diproses. Coba lagi nanti."}

# ═══════════════════════════════════════════════════════════════════
# PRODUK, PESANAN & PEMBAYARAN
# Satu tabel `orders` untuk penjualan online (checkout web + Midtrans) dan offline
# (dicatat admin). Status pembayaran online SELALU diambil dari API Midtrans di
# server — callback di browser hanya memicu pengecekan, tidak dipercaya mentah-mentah.
# ═══════════════════════════════════════════════════════════════════

# Status yang masih boleh diperbarui otomatis dari Midtrans. Setelah admin menandai
# "dikirim"/"selesai", sinkronisasi pembayaran tidak menimpa status itu lagi
# (kecuali menambah catatan bila ada refund).
STATUS_FASE_BAYAR = ("menunggu_pembayaran", "gagal")
STATUS_REFUND = ("refund", "partial_refund", "chargeback", "partial_chargeback")
# Token Snap berlaku 24 jam (default Midtrans). Pesanan tanpa transaksi setelah itu = batal.
BATAS_TOKEN_SNAP = timedelta(hours=24)
ORDER_ID_RE = re.compile(r"^MOSQ-\d{14}-[0-9a-f]{8}$")

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

def _midtrans_404(err):
    data = getattr(err, "api_response_dict", None) or {}
    return str(data.get("status_code")) == "404" or "404" in str(err)

def _lebih_tua_dari(waktu_iso, batas):
    try:
        dibuat = datetime.fromisoformat(str(waktu_iso).replace("Z", "+00:00"))
        if dibuat.tzinfo is None:
            dibuat = dibuat.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - dibuat > batas
    except (TypeError, ValueError):
        return False

def status_dari_midtrans(trx):
    """Petakan transaction_status Midtrans ke status pesanan MosqRisk."""
    ts = (trx or {}).get("transaction_status", "")
    fraud = (trx or {}).get("fraud_status") or "accept"
    if ts == "capture":
        return "dibayar" if fraud == "accept" else "menunggu_pembayaran"
    if ts == "settlement":
        return "dibayar"
    if ts in ("cancel", "expire", "refund", "partial_refund", "chargeback", "partial_chargeback"):
        return "batal"
    if ts in ("deny", "failure"):
        return "gagal"
    return "menunggu_pembayaran"  # pending, authorize, atau belum ada transaksi

def sinkron_pesanan_midtrans(order_id):
    """Cek status transaksi ke API Midtrans lalu perbarui baris `orders`.

    Return: status pesanan terbaru, atau None kalau pesanan tidak ditemukan.
    """
    res = supabase.table("orders").select("id,status,total,created_at").eq("midtrans_order_id", order_id).limit(1).execute()
    if not res.data:
        return None
    row = res.data[0]
    sekarang = row["status"]
    try:
        trx = snap.transactions.status(order_id)
    except Exception as e:
        # 404 dari Midtrans = pembeli belum memilih metode bayar di Snap.
        # Lewat masa berlaku token (24 jam) tanpa transaksi → pesanan dianggap batal.
        if _midtrans_404(e) and sekarang == "menunggu_pembayaran" and _lebih_tua_dari(row.get("created_at"), BATAS_TOKEN_SNAP):
            supabase.table("orders").update({
                "status": "batal",
                "notes": "Tidak ada transaksi di Midtrans setelah 24 jam (jendela pembayaran ditutup sebelum membayar).",
                "updated_at": _now_iso(),
            }).eq("id", row["id"]).execute()
            return "batal"
        print(f"Status Midtrans {order_id} belum tersedia: {e}")
        return sekarang

    try:
        nominal_cocok = int(float(trx.get("gross_amount", row["total"]))) == int(row["total"])
    except (TypeError, ValueError):
        nominal_cocok = False
    ts = trx.get("transaction_status")
    status_mid = status_dari_midtrans(trx) if nominal_cocok else "gagal"

    perubahan = {"midtrans_status": ts, "updated_at": _now_iso()}
    catatan = []
    if status_mid == "dibayar" and sekarang in ("menunggu_pembayaran", "gagal", "batal"):
        # Uang sudah masuk: selalu dicatat dibayar, walau admin sempat menandai batal.
        perubahan["status"] = "dibayar"
        if sekarang == "batal":
            catatan.append("Pembayaran masuk setelah pesanan ditandai batal — cek manual.")
    elif sekarang in STATUS_FASE_BAYAR:
        perubahan["status"] = status_mid
    elif ts in STATUS_REFUND:
        if sekarang == "dibayar":
            perubahan["status"] = "batal"
            catatan.append("Dana dikembalikan (refund/chargeback) di Midtrans.")
        else:
            catatan.append("Ada refund/chargeback di Midtrans — cek manual.")
    if "status" in perubahan and trx.get("payment_type"):
        perubahan["payment_method"] = trx["payment_type"]
    if not nominal_cocok:
        catatan.append("Nominal di Midtrans tidak sama dengan total pesanan — cek manual.")
    if catatan:
        perubahan["notes"] = " ".join(catatan)
    supabase.table("orders").update(perubahan).eq("id", row["id"]).execute()
    return perubahan.get("status", sekarang)

@app.get("/api/produk")
async def get_produk():
    """Info produk + harga untuk frontend (satu sumber harga) dan konfigurasi Snap."""
    if HARGA_PER_BOTOL is None:
        return respons_produk_tidak_siap()
    return {
        "success": True,
        "nama": NAMA_PRODUK,
        "harga_per_botol": HARGA_PER_BOTOL,
        "maks_per_pesanan": MAKS_BOTOL_PER_PESANAN,
        "pengiriman": PENGIRIMAN,
        "pembayaran": {
            "mode": "produksi" if MIDTRANS_IS_PRODUCTION else "uji_coba",
            "snap_url": SNAP_JS_URL,
            "client_key": os.environ.get("MIDTRANS_CLIENT_KEY", ""),
        },
    }

@app.post("/api/payment/token")
async def create_payment_token(req: PaymentRequest):
    # Nominal dihitung di server — nilai dari browser tidak pernah dipakai untuk menagih.
    if HARGA_PER_BOTOL is None:
        return respons_produk_tidak_siap()
    kirim = PENGIRIMAN.get(req.delivery)
    if kirim is None:
        return JSONResponse(status_code=422, content={"success": False, "message": "Pilihan pengiriman ini sedang tidak tersedia."})
    ongkir = kirim["ongkir"]
    total = req.quantity * HARGA_PER_BOTOL + ongkir
    if req.expectedTotal is not None and req.expectedTotal != total:
        return JSONResponse(status_code=409, content={
            "success": False,
            "message": "Harga sudah diperbarui. Muat ulang halaman, lalu coba lagi.",
        })

    order_id = f"MOSQ-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"

    # 1) Catat pesanan dulu. Kalau gagal dicatat, transaksi pembayaran tidak dibuat.
    try:
        supabase.table("orders").insert({
            "channel": "online",
            "status": "menunggu_pembayaran",
            "quantity": req.quantity,
            "unit_price": HARGA_PER_BOTOL,
            "total": total,
            "customer_name": req.name.strip(),
            "phone": req.phone.strip(),
            # Ambil sendiri: kolom alamat diisi keterangan titik ambil supaya admin langsung tahu.
            # Ongkir tidak butuh kolom baru: total − (quantity × unit_price).
            "address": (req.address or "").strip() if req.delivery == "antar" else f"AMBIL SENDIRI — {kirim['keterangan']}".strip(" —"),
            "midtrans_order_id": order_id,
            "is_test": not MIDTRANS_IS_PRODUCTION,
        }).execute()
    except Exception as e:
        print(f"Gagal mencatat pesanan {order_id}: {e}")
        pesan = "Pencatatan pesanan sedang tidak tersedia. Coba lagi nanti."
        teks_galat = str(e)
        if not MIDTRANS_IS_PRODUCTION and ("PGRST205" in teks_galat or ("orders" in teks_galat and "schema cache" in teks_galat)):
            # Mode uji coba: beri tahu penguji penyebabnya (tabel belum dibuat), bukan pesan umum.
            pesan = ("Mode uji coba: tabel pesanan (orders) belum ada di database. Jalankan migration "
                     "supabase/migrations/20261106120000_fase1_rls_orders.sql di Supabase SQL Editor, lalu coba lagi.")
        return JSONResponse(status_code=503, content={
            "success": False,
            "message": pesan,
        })

    # 2) Buat transaksi Snap.
    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": total
        },
        "customer_details": {
            "first_name": req.name.strip(),
            "phone": req.phone.strip()
        },
        "item_details": [
            {
                "id": "PATCHMOS-SPRAY",
                "price": HARGA_PER_BOTOL,
                "quantity": req.quantity,
                "name": NAMA_PRODUK
            }
        ] + ([{
            # Midtrans: jumlah item_details harus sama dengan gross_amount, nama maks. 50 karakter.
            "id": "ONGKIR",
            "price": ongkir,
            "quantity": 1,
            "name": f"Ongkos kirim - {kirim['label']}"[:50],
        }] if ongkir > 0 else []),
        # Setelah membayar di aplikasi lain (mis. e-wallet di HP), pembeli diarahkan kembali ke
        # /checkout?order_id=...; halaman itu lalu mengecek status ke server (bukan percaya URL).
        # Menimpa "Finish Redirect URL" di dashboard Midtrans, hanya untuk transaksi ini.
        "callbacks": {"finish": f"{SITE_URL}/checkout"}
    }
    try:
        transaction = snap.create_transaction(param)
        return {"success": True, "token": transaction['token'], "order_id": order_id, "total": total}
    except Exception as e:
        print(f"Gagal membuat transaksi Midtrans {order_id}: {e}")
        try:
            supabase.table("orders").update({
                "status": "gagal",
                "notes": "Gagal membuat transaksi Midtrans",
                "updated_at": _now_iso(),
            }).eq("midtrans_order_id", order_id).execute()
        except Exception as db_err:
            print(f"Gagal menandai pesanan {order_id} sebagai gagal: {db_err}")
        return JSONResponse(status_code=502, content={
            "success": False,
            "message": "Gagal membuat transaksi pembayaran. Coba lagi nanti.",
        })

@app.post("/api/payment/status")
async def check_payment_status(req: PaymentStatusRequest):
    """Dipanggil halaman checkout setelah popup Snap selesai. Status dicek ke Midtrans."""
    try:
        status_baru = sinkron_pesanan_midtrans(req.orderId)
    except Exception as e:
        print(f"Gagal mengecek status {req.orderId}: {e}")
        return JSONResponse(status_code=503, content={"success": False, "message": "Status pembayaran belum bisa dicek."})
    if status_baru is None:
        return JSONResponse(status_code=404, content={"success": False, "message": "Pesanan tidak ditemukan."})
    return {"success": True, "status": status_baru}

@app.post("/api/payment/notification")
async def midtrans_notification(request: Request):
    """Notifikasi HTTP dari Midtrans.

    Atur di Dashboard Midtrans → Settings → Payment → Notification URL:
    https://<domain>/api/payment/notification
    Tanda tangan diverifikasi, lalu status tetap dicek ulang langsung ke API Midtrans.
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"success": False})

    order_id = str(body.get("order_id", ""))
    signature_input = (
        order_id + str(body.get("status_code", "")) + str(body.get("gross_amount", ""))
        + os.environ.get("MIDTRANS_SERVER_KEY", "")
    )
    expected = hashlib.sha512(signature_input.encode()).hexdigest()
    if not os.environ.get("MIDTRANS_SERVER_KEY") or not hmac.compare_digest(str(body.get("signature_key", "")), expected):
        return JSONResponse(status_code=403, content={"success": False})

    if not ORDER_ID_RE.match(order_id):
        return {"success": True}  # bukan pesanan dari web ini — abaikan

    try:
        sinkron_pesanan_midtrans(order_id)
    except Exception as e:
        print(f"Gagal memproses notifikasi {order_id}: {e}")
        return JSONResponse(status_code=500, content={"success": False})  # Midtrans akan mengirim ulang
    return {"success": True}

# --- ADMIN: PENJUALAN (online + offline) ---
PESAN_TABEL_ORDERS = (
    "Data penjualan belum bisa diakses: tabel orders belum dibuat (jalankan migration Fase 1 "
    "di supabase/migrations) atau database Supabase tidak terjangkau."
)

@app.get("/api/admin/orders")
async def admin_list_orders(token: str = Depends(verify_admin)):
    try:
        res = supabase.table("orders").select("*").order("created_at", desc=True).limit(1000).execute()
        return {"success": True, "data": res.data, "harga_per_botol": HARGA_PER_BOTOL}
    except Exception as e:
        print(f"Gagal memuat pesanan: {e}")
        return JSONResponse(status_code=503, content={"success": False, "message": PESAN_TABEL_ORDERS})

@app.post("/api/admin/orders")
async def admin_create_offline_sale(req: OfflineSaleRequest, token: str = Depends(verify_admin)):
    """Catat penjualan offline (langsung/bazar/expo). Harga satuan = HARGA_PER_BOTOL."""
    if HARGA_PER_BOTOL is None:
        return respons_produk_tidak_siap()
    row = {
        "channel": "offline",
        "status": "selesai",
        "quantity": req.quantity,
        "unit_price": HARGA_PER_BOTOL,
        "total": req.quantity * HARGA_PER_BOTOL,
        "payment_method": req.paymentMethod,
        "customer_name": (req.customerName or "").strip() or None,
        "notes": (req.notes or "").strip() or None,
        "sold_at": (req.soldAt or date.today()).isoformat(),
        "is_test": False,
    }
    try:
        res = supabase.table("orders").insert(row).execute()
        return {"success": True, "data": res.data[0] if res.data else row}
    except Exception as e:
        print(f"Gagal mencatat penjualan offline: {e}")
        return JSONResponse(status_code=503, content={"success": False, "message": PESAN_TABEL_ORDERS})

@app.patch("/api/admin/orders/{order_id}")
async def admin_update_order_status(order_id: int, req: OrderStatusUpdate, token: str = Depends(verify_admin)):
    try:
        res = supabase.table("orders").update({"status": req.status, "updated_at": _now_iso()}).eq("id", order_id).execute()
        if not res.data:
            return JSONResponse(status_code=404, content={"success": False, "message": "Pesanan tidak ditemukan."})
        return {"success": True, "data": res.data[0]}
    except Exception as e:
        print(f"Gagal mengubah status pesanan {order_id}: {e}")
        return JSONResponse(status_code=503, content={"success": False, "message": "Status gagal diubah."})

@app.post("/api/admin/orders/{order_id}/sync")
async def admin_sync_order(order_id: int, token: str = Depends(verify_admin)):
    """Cek ulang status pembayaran pesanan online ke Midtrans."""
    try:
        res = supabase.table("orders").select("midtrans_order_id").eq("id", order_id).limit(1).execute()
        if not res.data or not res.data[0].get("midtrans_order_id"):
            return JSONResponse(status_code=404, content={"success": False, "message": "Bukan pesanan online."})
        status_baru = sinkron_pesanan_midtrans(res.data[0]["midtrans_order_id"])
        return {"success": True, "status": status_baru}
    except Exception as e:
        print(f"Gagal sinkron pesanan {order_id}: {e}")
        return JSONResponse(status_code=503, content={"success": False, "message": "Gagal mengecek ke Midtrans."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
