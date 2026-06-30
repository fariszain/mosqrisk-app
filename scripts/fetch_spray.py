import urllib.request
import json
import base64

urls = [
    "https://www.svgrepo.com/show/105151/spray-bottle.svg",
    "https://www.svgrepo.com/show/244304/spray-bottle-cleaning.svg",
    "https://www.svgrepo.com/show/400495/spray-bottle.svg"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            svg = res.read().decode('utf-8')
            if "<svg" in svg:
                with open("public/spray-silhouette.svg", "w") as f:
                    f.write(svg)
                print("Successfully fetched SVG from", url)
                break
    except Exception as e:
        print("Failed to fetch", url, e)
