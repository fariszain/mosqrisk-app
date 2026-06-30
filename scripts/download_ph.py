import urllib.request
import json

url = "https://api.iconify.design/ph/spray-bottle-fill.svg?width=512&height=512"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as res:
        svg = res.read().decode('utf-8')
        with open("public/spray.svg", "w") as f:
            f.write(svg)
        print("Success")
except Exception as e:
    print("Error:", e)
