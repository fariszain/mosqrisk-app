import urllib.request
import time

urls = [
    "http://localhost:3000/",
    "http://localhost:3000/pantau",
    "http://localhost:3000/lapor",
    "http://localhost:3000/edukasi",
    "http://localhost:3000/checkout"
]

print(f"{'Page':<30} | {'Time (ms)':<10} | {'Size (KB)':<10}")
print("-" * 55)

for url in urls:
    try:
        start_time = time.time()
        with urllib.request.urlopen(url) as response:
            html = response.read()
            end_time = time.time()
            
            elapsed_ms = (end_time - start_time) * 1000
            size_kb = len(html) / 1024
            
            print(f"{url.replace('http://localhost:3000', ''):<30} | {elapsed_ms:<10.2f} | {size_kb:<10.2f}")
    except Exception as e:
        print(f"{url.replace('http://localhost:3000', ''):<30} | ERROR: {e}")
