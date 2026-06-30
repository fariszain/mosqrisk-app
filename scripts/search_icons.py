import urllib.request
import json

url = "https://api.iconify.design/search?query=spray%20bottle&limit=20"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        print("Found icons:", data.get('icons', []))
except Exception as e:
    print("Error:", e)
