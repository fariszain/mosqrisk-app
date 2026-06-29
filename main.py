# Ingat untuk menginstal dependensi sebelum menjalankan file ini:
# pip install fastapi uvicorn requests

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import sqlite3
import os
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = FastAPI(title="MosqRisk Backend API")

# Konfigurasi CORS agar frontend Next.js (localhost:3000) bisa melakukan fetch tanpa diblokir browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
DB_FILE = "reports.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_name TEXT NOT NULL,
            report_type TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_name TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class Report(BaseModel):
    locationName: str
    reportType: str
    description: str

class Subscriber(BaseModel):
    locationName: str
    email: str

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

def fetch_city_weather(adm4_code):
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
                    
                return temp, humidity, precipitation, lat, lon, trend, None
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

@app.post("/api/reports")
def submit_report(report: Report):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO reports (location_name, report_type, description)
            VALUES (?, ?, ?)
        ''', (report.locationName, report.reportType, report.description))
        conn.commit()
        conn.close()
        return {"success": True, "message": "Laporan berhasil disimpan"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get("/api/reports")
def get_reports():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, location_name, report_type, description, created_at 
            FROM reports 
            ORDER BY created_at DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        reports = []
        for row in rows:
            reports.append({
                "id": row[0],
                "location_name": row[1],
                "report_type": row[2],
                "description": row[3],
                "created_at": row[4]
            })
        return {"success": True, "data": reports}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/stats")
def get_stats():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM reports")
        total_reports = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM subscribers")
        total_subs = cursor.fetchone()[0]
        conn.close()
        
        # Calculate impact dynamically: base 2.5kg + 0.5kg per report + 1.2kg per subscriber
        impact_kg = 2.5 + (total_reports * 0.5) + (total_subs * 1.2)
        
        return {"success": True, "impact_kg": round(impact_kg, 1)}
    except Exception as e:
        return {"success": False, "impact_kg": 2.5}

@app.post("/api/subscribe")
def subscribe_wa(sub: Subscriber):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Check if already subscribed
        cursor.execute("SELECT COUNT(*) FROM subscribers WHERE email = ?", (sub.email,))
        if cursor.fetchone()[0] > 0:
            conn.close()
            return {"success": False, "message": "Email Anda sudah terdaftar sebelumnya."}
        
        # Insert into DB
        cursor.execute('''
            INSERT INTO subscribers (location_name, email)
            VALUES (?, ?)
        ''', (sub.locationName, sub.email))
        conn.commit()
        conn.close()
        
        # Send Email via smtplib
        gmail_user = "mosqrisk.official@gmail.com"
        gmail_password = "afppoyvrgcucyapp"
        
        if gmail_user == "MASUKKAN_EMAIL_DISINI":
            return {"success": True, "message": "Email berhasil didaftarkan di Database (Simulasi Pengiriman Email dimatikan)."}

        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = sub.email
        msg['Subject'] = "Pendaftaran Berhasil - MosqRisk"
        
        body = f"Selamat datang di MosqRisk! Email Anda terdaftar untuk memantau risiko nyamuk di {sub.locationName}.\n\nJika tingkat risiko berubah menjadi tinggi, kami akan segera mengabari Anda."
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)
        text = msg.as_string()
        server.sendmail(gmail_user, sub.email, text)
        server.quit()
        
        return {"success": True, "message": "Email berhasil didaftarkan. Anda akan menerima peringatan jika risiko tinggi."}
    except Exception as e:
        return {"success": False, "message": f"Gagal mengirim Email: {str(e)}"}

@app.get("/api/subscribe")
def get_subscribers():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, location_name, email, created_at 
            FROM subscribers 
            ORDER BY created_at DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        subs = []
        for row in rows:
            subs.append({
                "id": row[0],
                "location_name": row[1],
                "email": row[2],
                "created_at": row[3]
            })
        return {"success": True, "data": subs}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/broadcast")
def broadcast_alert():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT email, location_name FROM subscribers")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return {"success": False, "message": "Tidak ada pelanggan terdaftar."}
            
        gmail_user = "mosqrisk.official@gmail.com"
        gmail_password = "afppoyvrgcucyapp"
        
        if gmail_user == "MASUKKAN_EMAIL_DISINI":
            return {"success": False, "message": "Silakan atur kredensial Gmail di main.py (gmail_user & gmail_password) terlebih dahulu."}
            
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)
        
        sent_count = 0
        for row in rows:
            target_email = row[0]
            loc_name = row[1]
                
            try:
                msg = MIMEMultipart()
                msg['From'] = gmail_user
                msg['To'] = target_email
                msg['Subject'] = "🚨 PERINGATAN DINI KEMENKES 🚨"
                
                body = f"Halo warga {loc_name},\n\nSistem MosqRisk mendeteksi bahwa Tingkat Risiko Nyamuk/DBD di daerah Anda saat ini sedang TINGGI.\n\nHarap segera lakukan tindakan pencegahan 3M Plus:\n1. Menguras tempat penampungan air\n2. Menutup tempat penampungan air\n3. Mendaur ulang barang bekas\n\nTetap waspada dan jaga kesehatan keluarga Anda!"
                msg.attach(MIMEText(body, 'plain'))
                
                text = msg.as_string()
                server.sendmail(gmail_user, target_email, text)
                sent_count += 1
            except Exception as e:
                print(f"Failed to send to {target_email}: {e}")
                
        server.quit()
        return {"success": True, "sent_count": sent_count}
    except Exception as e:
        return {"success": False, "message": str(e)}
