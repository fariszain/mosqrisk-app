# Ingat untuk menginstal dependensi sebelum menjalankan file ini:
# pip install fastapi uvicorn requests

from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import os
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Setup Supabase Client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("WARNING: SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env!")
    
supabase: Client = create_client(supabase_url or "", supabase_key or "")

app = FastAPI(title="MosqRisk Backend API")

# Konfigurasi CORS agar frontend Next.js (localhost:3000) bisa melakukan fetch tanpa diblokir browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# API Endpoint JSON Publik BMKG
BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4="

def calculate_mosquito_risk(temp, humidity, precipitation=0.0):
    # Base logic (Kemenkes / WHO style)
    # Suhu ideal: 26-30C (Bobot 40)
    temp_score = 0
    if temp is not None:
        if 26 <= temp <= 30: temp_score = 40
        elif 24 <= temp < 26 or 30 < temp <= 32: temp_score = 25
        else: temp_score = 10

    # Kelembapan ideal: > 75% (Bobot 30)
    hum_score = 0
    if humidity is not None:
        if humidity >= 80: hum_score = 30
        elif 70 <= humidity < 80: hum_score = 20
        else: hum_score = 10
        
    # Curah Hujan ideal: 1 - 20 mm (membentuk genangan, Bobot 30). Jika hujan lebat >20mm jentik tersapu.
    precip_score = 0
    if precipitation is not None:
        if 0.5 <= precipitation <= 20: precip_score = 30
        elif precipitation > 20: precip_score = 15
        else: precip_score = 10
        
    score = temp_score + hum_score + precip_score
    
    score = min(score, 100)
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
                    return None, None, None, "Data cuaca kosong dari BMKG"
                
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
def get_mosqrisk_data(adm4: str = Query(..., description="Kode ADM4 BPS (contoh: 11.71.03.2001)")):
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
def submit_report(report: Report, background_tasks: BackgroundTasks):
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
def get_reports():
    try:
        response = supabase.table("reports").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/stats")
def get_stats():
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
def subscribe_wa(sub: Subscriber, background_tasks: BackgroundTasks):
    try:
        # Check if already subscribed
        check = supabase.table("subscribers").select("*", count="exact").eq("email", sub.email).execute()
        if check.count and check.count > 0:
            return {"success": False, "message": "Email Anda sudah terdaftar sebelumnya."}
        
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
def get_subscribers():
    try:
        response = supabase.table("subscribers").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
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

@app.post("/api/broadcast")
def broadcast_alert(background_tasks: BackgroundTasks, key: str = Query("")):
    admin_key = os.getenv("ADMIN_KEY", "kemenkes123")
    if key != admin_key:
        return {"success": False, "message": "Unauthorized"}
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
def claim_premium(req: ClaimRequest):
    try:
        code_upper = req.code.strip().upper()
        
        # Master Admin Testing Code (Bypass and reusable)
        if code_upper == "MOSQ-ADMIN-TEST":
            return {"success": True, "message": "Berhasil! Akun Anda kini berstatus Premium (Mode Testing)."}
            
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
