# Ingat untuk menginstal dependensi sebelum menjalankan file ini:
# pip install fastapi uvicorn requests

from fastapi import FastAPI, Query, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime, timedelta
import os
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
snap = midtransclient.Snap(
    is_production=os.environ.get('MIDTRANS_IS_PRODUCTION', 'false').lower() == 'true',
    server_key=os.environ.get('MIDTRANS_SERVER_KEY'),
    client_key=os.environ.get('MIDTRANS_CLIENT_KEY')
)

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
    locationName: str
    reportType: str
    description: str

class Subscriber(BaseModel):
    locationName: str
    email: str

class ClaimRequest(BaseModel):
    code: str

class CheckoutRequest(BaseModel):
    name: str
    phone: str
    package: str
    paymentMethod: str

class PaymentRequest(BaseModel):
    name: str
    phone: str
    package: str
    amount: int

security = HTTPBearer()

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    admin_key = os.getenv("ADMIN_KEY", "kemenkes123")
    if credentials.credentials != admin_key:
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

# --- LOCAL BROADCAST LOGIC ---
def send_local_broadcast(report: Report):
    try:
        response = supabase.table("subscribers").select("email, location_name").execute()
        subscribers = [(row['email'], row['location_name']) for row in response.data]
        
        prefixes = ['kabupaten ', 'kota ', 'provinsi ', 'kecamatan ', 'kelurahan ', 'desa ']
        def clean_loc(loc_str):
            loc_str = loc_str.lower()
            for p in prefixes:
                loc_str = loc_str.replace(p, '')
            return loc_str.strip()

        target_emails = []
        for sub_email, sub_loc in subscribers:
            c_rep = clean_loc(report.locationName)
            c_sub = clean_loc(sub_loc)
            if c_sub == 'umum' or c_sub in c_rep or c_rep in c_sub:
                target_emails.append((sub_email, sub_loc))
                
        if target_emails:
            gmail_user = os.getenv("GMAIL_USER", "mosqrisk.official@gmail.com")
            gmail_password = os.getenv("GMAIL_PASSWORD")
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(gmail_user, gmail_password)
            
            for email_addr, loc in target_emails:
                msg = MIMEMultipart()
                msg['From'] = gmail_user
                msg['To'] = email_addr
                msg['Subject'] = f"🚨 INFO WARGA: Laporan {report.reportType} di area Anda!"
                
                body = f"Halo warga {loc},\n\nSistem MosqRisk baru saja menerima laporan terkait '{report.reportType}' di sekitar area Anda.\nTitik Temuan: {report.locationName}\n\nDetail laporan:\n\"{report.description}\"\n\nHarap tingkatkan kewaspadaan, pastikan tidak ada genangan air di sekitar rumah, dan selalu gunakan Patchmos Spray untuk perlindungan maksimal keluarga Anda."
                msg.attach(MIMEText(body, 'plain'))
                server.sendmail(gmail_user, email_addr, msg.as_string())
                
            server.quit()
    except Exception as email_err:
        print(f"Error sending local broadcast: {email_err}")

@app.post("/api/reports")
async def submit_report(report: Report, background_tasks: BackgroundTasks):
    try:
        # Insert to Supabase
        supabase.table("reports").insert({
            "location_name": report.locationName,
            "report_type": report.reportType,
            "description": report.description
        }).execute()
        
        background_tasks.add_task(send_local_broadcast, report)

        return {"success": True, "message": "Laporan berhasil disimpan"}
    except Exception as e:
        return {"success": False, "message": str(e)}

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
    try:
        reports_res = supabase.table("reports").select("*", count="exact").execute()
        total_reports = reports_res.count if reports_res.count is not None else 0
        
        subs_res = supabase.table("subscribers").select("*", count="exact").execute()
        total_subs = subs_res.count if subs_res.count is not None else 0
        
        # Calculate impact dynamically: base 2.5kg + 0.5kg per report + 1.2kg per subscriber
        impact_kg = 2.5 + (total_reports * 0.5) + (total_subs * 1.2)
        
        return {"success": True, "impact_kg": round(impact_kg, 1)}
    except Exception as e:
        return {"success": False, "impact_kg": 2.5}

def send_welcome_email(sub: Subscriber):
    try:
        gmail_user = os.getenv("GMAIL_USER", "mosqrisk.official@gmail.com")
        gmail_password = os.getenv("GMAIL_PASSWORD")
        if gmail_user == "MASUKKAN_EMAIL_DISINI": return
        
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = sub.email
        msg['Subject'] = "Pendaftaran Berhasil - MosqRisk"
        
        body = f"Selamat datang di MosqRisk! Email Anda terdaftar untuk memantau risiko nyamuk di {sub.locationName}.\n\nJika tingkat risiko berubah menjadi tinggi, kami akan segera mengabari Anda."
        msg.attach(MIMEText(body, 'plain'))
        
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
        
        return {"success": True, "message": "Email berhasil didaftarkan. Anda akan menerima peringatan jika risiko tinggi."}
    except Exception as e:
        return {"success": False, "message": f"Gagal mendaftarkan Email: {str(e)}"}

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
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)
        
        for target_email, loc_name in rows:
            try:
                msg = MIMEMultipart()
                msg['From'] = gmail_user
                msg['To'] = target_email
                msg['Subject'] = "🚨 PERINGATAN DINI KEMENKES 🚨"
                
                body = f"Halo warga {loc_name},\n\nSistem MosqRisk mendeteksi bahwa Tingkat Risiko Nyamuk/DBD di daerah Anda saat ini sedang TINGGI.\n\nHarap segera lakukan tindakan pencegahan 3M Plus:\n1. Menguras tempat penampungan air\n2. Menutup tempat penampungan air\n3. Mendaur ulang barang bekas\n\nTetap waspada dan jaga kesehatan keluarga Anda!"
                msg.attach(MIMEText(body, 'plain'))
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
        
        # Mark as used
        supabase.table("premium_codes").update({"is_used": True}).eq("code", code_upper).execute()
        
        return {"success": True, "message": "Berhasil! Akun Anda kini berstatus Premium."}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/checkout/verify")
def verify_checkout(req: CheckoutRequest):
    # Mock server-side payment verification
    return {"success": True, "message": "Pembayaran berhasil diverifikasi", "isPremium": True}

@app.post("/api/payment/token")
async def create_payment_token(req: PaymentRequest):
    try:
        import uuid
        order_id = f"MOSQ-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"
        
        param = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": req.amount
            },
            "customer_details": {
                "first_name": req.name,
                "phone": req.phone
            },
            "item_details": [
                {
                    "id": f"PKG-{req.package}",
                    "price": req.amount,
                    "quantity": 1,
                    "name": f"MosqRisk Premium - {req.package} Botol" if req.package != "QRIS" else "Akses Premium (Tanpa Kemasan)"
                }
            ]
        }
        
        transaction = snap.create_transaction(param)
        transaction_token = transaction['token']
        
        return {"success": True, "token": transaction_token, "order_id": order_id}
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
