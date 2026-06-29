import requests
import xml.etree.ElementTree as ET

url = "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Aceh.xml"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
response = requests.get(url, headers=headers)
print("Status:", response.status_code)
print("Content length:", len(response.content))
print("First 100 bytes:", response.content[:100])
try:
    ET.fromstring(response.content)
    print("Parsed successfully!")
except Exception as e:
    print("Parse error:", e)
