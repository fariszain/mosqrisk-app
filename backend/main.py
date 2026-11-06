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
import os
import re
import uuid
from typing import Literal, Optional
from pydantic import BaseModel, Field
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
# Ini SATU-SATUNYA sumber harga: frontend membacanya lewat GET /api/produk, dan total
# pembayaran selalu dihitung di server (jumlah × harga), tidak pernah diambil dari browser.
HARGA_PER_BOTOL = 20000
MAKS_BOTOL_PER_PESANAN = 20
NAMA_PRODUK = "Patchmos Spray 50 mL"
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
    address: str = Field(min_length=10, max_length=400)
    quantity: int = Field(ge=1, le=MAKS_BOTOL_PER_PESANAN)
    # Total yang dilihat pembeli di layar. Kalau berbeda dengan hitungan server
    # (mis. harga baru saja diganti), transaksi ditolak supaya pembeli tidak kaget.
    expectedTotal: Optional[int] = None

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

def calculate_mosquito_risk(temp, humidity, precipitation=0.0):
    import math
    
    # ─── FAKTOR 1: SUHU (Bobot 40%) — Gaussian Asimetris ───
    # Konsisten dengan formula bulanan (titik optimal 28.0°C)
    temp_score = 0
    if temp is not None:
        optimal_temp = 28.0
        sigma = 5.0 if temp <= optimal_temp else 2.5
        temp_score = math.exp(-0.5 * ((temp - optimal_temp) / sigma) ** 2) * 40

    # ─── FAKTOR 2: KELEMBAPAN (Bobot 25%) — Linear bertahap ───
    # Konsisten dengan formula bulanan
    hum_score = 0
    if humidity is not None:
        if humidity >= 80:
            hum_score = 25
        elif humidity >= 60:
            hum_score = ((humidity - 60) / 20) * 25
        else:
            hum_score = max(0, (humidity / 60)) * 10
            
    # ─── FAKTOR 3: CURAH HUJAN HARIAN (Bobot 35%) ───
    # Berbeda dengan tren bulanan (yang butuh 150-300mm/bulan),
    # data BMKG ini adalah hujan HARIAN. 
    # Hujan rintik/sedang (1 - 15 mm/hari) sangat ideal membuat genangan.
    # Hujan lebat (>30 mm/hari) justru menghanyutkan jentik (flushing effect).
    precip_score = 0
    if precipitation is not None:
        if precipitation == 0:
            precip_score = 10  # Kering, genangan lama mungkin masih ada tapi tidak bertambah
        elif 0.5 <= precipitation <= 20:
            precip_score = 35  # Ideal
        elif 20 < precipitation <= 35:
            precip_score = 20  # Mulai terlalu lebat
        else:
            precip_score = 5   # Flushing effect kuat
            
    score = int(round(temp_score + hum_score + precip_score))
    score = min(max(score, 5), 100)
    
    category = "TINGGI" if score >= 75 else "SEDANG" if score >= 50 else "RENDAH"
    return score, category

# Simple In-Memory Cache
weather_cache = {}
CACHE_EXPIRY = 3600  # 1 hour

def fetch_city_weather(adm4_code):
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
                    return None, None, None, None, None, None, "Data cuaca kosong dari BMKG"
                
                # Ekstrak data saat ini (hari ini, record pertama)
                current_weather = cuaca_lists[0][0]
                temp = float(current_weather.get('t', 0))
                humidity = float(current_weather.get('hu', 0))
                
                # Lokasi koordinat
                lat = data.get('lokasi', {}).get('lat', 0)
                lon = data.get('lokasi', {}).get('lon', 0)
                
                # Total curah hujan untuk hari ini (menjumlahkan semua nilai 'tp' di array cuaca_lists[0])
                precipitation = round(sum(float(item.get('tp', 0)) for item in cuaca_lists[0] if item.get('tp') is not None), 1)
                
                # Kalkulasi trend 3 hari
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
                        
                    temps = [float(item.get('t', 0)) for item in daily_data if item.get('t') is not None]
                    humidities = [float(item.get('hu', 0)) for item in daily_data if item.get('hu') is not None]
                    precips = [float(item.get('tp', 0)) for item in daily_data if item.get('tp') is not None]
                    
                    avg_temp = sum(temps) / len(temps) if temps else 0
                    avg_hu = sum(humidities) / len(humidities) if humidities else 0
                    sum_precip = sum(precips) if precips else 0
                    
                    score, _ = calculate_mosquito_risk(avg_temp, avg_hu, sum_precip)
                    trend.append({
                        "day": day_name,
                        "risk_score": score
                    })
                    
                result = (temp, humidity, precipitation, lat, lon, trend, None)
                weather_cache[adm4_code] = (result, now)
                return result
            except Exception as e:
                print(f"Struktur JSON tidak terduga untuk kode {adm4_code}: {e}")
                return None, None, None, None, None, None, f"JSON parse error: {str(e)}"
        else:
            print(f"Gagal akses API untuk kode {adm4_code}. Status: {response.status_code}")
            return None, None, None, None, None, None, f"API Error: HTTP {response.status_code}"
    except Exception as e:
        print(f"Error koneksi ke BMKG: {e}")
        return None, None, None, None, None, None, f"Network Error: {str(e)}"

@app.get("/api/mosqrisk")
async def get_mosqrisk_data(adm4: str = Query(..., description="Kode ADM4 BPS (contoh: 11.71.03.2001)")):
    """Endpoint utama untuk menarik skor risiko nyamuk berdasarkan kode adm4 wilayah"""
    temp, humidity, precipitation, lat, lon, trend, err_msg = fetch_city_weather(adm4)

    if temp is not None and humidity is not None:
        risk_score, risk_status = calculate_mosquito_risk(temp, humidity, precipitation)
        return {
            "success": True,
            "data": {
                "temperature_celsius": temp,
                "humidity_percent": humidity,
                "precipitation_mm": precipitation,
                "lat": lat,
                "lon": lon,
                "risk_score": risk_score,
                "risk_status": risk_status,
                "trend": trend,
                "last_updated": datetime.now().isoformat()
            }
        }
    else:
        return {
            "success": False,
            "error": f"Data cuaca tidak tersedia. {err_msg}"
        }

@app.get("/api/climate-trend")
async def get_climate_trend(lat: float = Query(...), lon: float = Query(...)):
    """Endpoint untuk mendapatkan tren iklim 12 bulan terakhir dari Open-Meteo"""
    try:
        import math
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
            # RUMUS SKOR RISIKO DBD v2.0 (Revisi Peer-Review)
            # ══════════════════════════════════════════════════════════════
            #
            # Referensi:
            # - Mordecai et al. (2017): Thermal Biology of Mosquito-Borne Disease
            #   → Puncak transmisi DENV×Ae.aegypti di 29.1°C, batas 17.8-34.5°C
            # - Liu-Helmersson et al. (2014): Vectorial capacity model
            #   → Puncak epidemi dengue di ~29.3°C
            # - Studi proyeksi iklim-DBD DKI Jakarta
            #   → Curah hujan "sesuai DBD" di rentang 100-300mm/bulan
            # - Studi time-series Singapura/Bangkok
            #   → Angin kencang mengganggu kemampuan terbang Aedes
            #
            # Bobot: Suhu 40%, Hujan 35%, Kelembapan 25%
            # Suhu dinaikkan bobotnya karena memengaruhi hampir seluruh
            # tahap biologi nyamuk DAN virus (EIP, biting rate, survival).
            # Hujan diturunkan karena efeknya lebih tidak langsung &
            # dimoderasi perilaku penyimpanan air warga urban Indonesia.
            
            # ─── FAKTOR 1: SUHU (40%) — Gaussian Asimetris ───
            # Kurva performa termal Ae.aegypti asimetris:
            # Dari puncak ke batas bawah (17.8°C): landai (jarak 11.3°C)
            # Dari puncak ke batas atas (34.5°C): curam (jarak 5.4°C)
            # → σ_low=5.0, σ_high=2.5 (rasio ~2:1)
            optimal_temp = 28.0  # Konsensus 26-29°C, titik tengah pragmatis
            sigma = 5.0 if avg_temp <= optimal_temp else 2.5
            temp_score = math.exp(-0.5 * ((avg_temp - optimal_temp) / sigma) ** 2) * 40
            
            # ─── FAKTOR 2: CURAH HUJAN (35%) — Sigmoid + Flushing ───
            # Infleksi di 150mm, mulai menurun di 300mm (bukan 400mm)
            # Studi DKI Jakarta: rentang "sesuai DBD" = 100-300mm
            # Studi Singapura: flushing effect menurunkan insiden dengue
            if sum_precip <= 300:
                rain_score = (1 / (1 + math.exp(-0.02 * (sum_precip - 150)))) * 35
            else:
                peak_rain = (1 / (1 + math.exp(-0.02 * (300 - 150)))) * 35
                excess = (sum_precip - 300) / 300
                rain_score = peak_rain * max(0.7, 1 - excess * 0.3)
            
            # ─── FAKTOR 3: KELEMBAPAN (25%) — Linear bertahap ───
            # Ae.aegypti butuh RH >60%, optimal 70-85%
            # Tidak diubah — sudah sesuai literatur
            if avg_humid >= 80:
                humid_score = 25
            elif avg_humid >= 60:
                humid_score = ((avg_humid - 60) / 20) * 25
            else:
                humid_score = max(0, (avg_humid / 60)) * 10
            
            # ─── MODIFIER: KECEPATAN ANGIN (pengali 0.85–1.0) ───
            # Angin kencang mengganggu kemampuan terbang & mencari inang
            # Diterapkan sebagai modifier kecil, bukan pilar bobot baru
            # (bukti kuantitatif belum se-matang suhu & hujan)
            if avg_wind <= 10:
                wind_mod = 1.0
            elif avg_wind <= 25:
                wind_mod = 1.0 - ((avg_wind - 10) / 15) * 0.15
            else:
                wind_mod = 0.85
            
            raw_score = (temp_score + rain_score + humid_score) * wind_mod
            score = min(max(int(round(raw_score)), 5), 100)
            
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
    return {
        "success": True,
        "nama": NAMA_PRODUK,
        "harga_per_botol": HARGA_PER_BOTOL,
        "maks_per_pesanan": MAKS_BOTOL_PER_PESANAN,
        "pembayaran": {
            "mode": "produksi" if MIDTRANS_IS_PRODUCTION else "uji_coba",
            "snap_url": SNAP_JS_URL,
            "client_key": os.environ.get("MIDTRANS_CLIENT_KEY", ""),
        },
    }

@app.post("/api/payment/token")
async def create_payment_token(req: PaymentRequest):
    # Nominal dihitung di server — nilai dari browser tidak pernah dipakai untuk menagih.
    total = req.quantity * HARGA_PER_BOTOL
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
            "address": req.address.strip(),
            "midtrans_order_id": order_id,
            "is_test": not MIDTRANS_IS_PRODUCTION,
        }).execute()
    except Exception as e:
        print(f"Gagal mencatat pesanan {order_id}: {e}")
        return JSONResponse(status_code=503, content={
            "success": False,
            "message": "Pencatatan pesanan sedang tidak tersedia. Coba lagi nanti.",
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
        ]
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
