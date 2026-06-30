import urllib.request
import json
import base64

# A good spray bottle SVG path from an open source icon set (like Material Design Icons - not Material Symbols)
# Material Design Icons has a 'spray-bottle' icon!
url = "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/spray-bottle.svg"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        svg_content = response.read().decode('utf-8')
        print(svg_content)
        
        with open("public/spray-bottle.svg", "w") as f:
            f.write(svg_content)
except Exception as e:
    print("Error:", e)
