import requests

BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4="

def fetch_city_weather(adm4_code):
    try:
        headers = {'User-Agent': 'MosqRisk-Engine/1.0'}
        response = requests.get(f"{BASE_URL}{adm4_code}", headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            try:
                current_weather = data['data'][0]['cuaca'][0][0]
                temp = float(current_weather.get('t', 0))
                humidity = float(current_weather.get('hu', 0))
                print("SUCCESS:", temp, humidity)
                return temp, humidity
            except (KeyError, IndexError, TypeError) as e:
                import traceback
                print(f"Struktur JSON tidak terduga untuk kode {adm4_code}.")
                traceback.print_exc()
                return None, None
        else:
            print(f"Gagal akses API untuk kode {adm4_code}. Status: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"Error koneksi ke BMKG: {e}")
        return None, None

fetch_city_weather("11.71.01.2001")
