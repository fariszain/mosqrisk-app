import requests
from datetime import datetime

BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4="

def calculate_mosquito_risk(temp, humidity):
    score = 20 # Base score
    if temp is not None:
        if 26 <= temp <= 30: score += 40
        elif 24 <= temp < 26 or 30 < temp <= 32: score += 20
    if humidity is not None:
        if humidity > 80: score += 40
        elif 75 <= humidity <= 80: score += 25
    return min(score, 100)

def fetch_weather_trend(adm4_code):
    headers = {'User-Agent': 'MosqRisk-Engine/1.0'}
    response = requests.get(f"{BASE_URL}{adm4_code}", headers=headers, timeout=10)
    data = response.json()
    
    cuaca_lists = data.get('data', [{}])[0].get('cuaca', [])
    
    trend = []
    
    # Hari dalam bahasa Indonesia
    hari_indo = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    
    for daily_data in cuaca_lists:
        if not daily_data:
            continue
            
        # Parse tanggal dari record pertama di hari tersebut
        dt_str = daily_data[0].get('local_datetime') # e.g. "2026-06-29 07:00:00"
        dt_obj = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        day_name = hari_indo[dt_obj.weekday()]
        
        temps = [float(item.get('t', 0)) for item in daily_data if item.get('t') is not None]
        humidities = [float(item.get('hu', 0)) for item in daily_data if item.get('hu') is not None]
        
        avg_temp = sum(temps) / len(temps) if temps else 0
        avg_hu = sum(humidities) / len(humidities) if humidities else 0
        
        score = calculate_mosquito_risk(avg_temp, avg_hu)
        trend.append({
            "day": day_name,
            "date": dt_str.split(' ')[0],
            "risk_score": score
        })
        
    print(trend)

fetch_weather_trend("11.71.01.2001")
