import json
import re

regency_map = {}

# Pattern to match village codes: 'XX.YY.ZZ.WWWW'
# E.g. ('11.01.01.2001','Keude Bakongan')
pattern = re.compile(r"\('(\d{2}\.\d{2}\.\d{2}\.\d{4})','(.*?)'\)")

with open("wilayah.sql", "r", encoding="utf-8") as f:
    for line in f:
        match = pattern.search(line)
        if match:
            adm4 = match.group(1)
            # adm4 is like 11.01.01.2001
            # Emsifa regency ID is first 4 digits: "1101"
            parts = adm4.split('.')
            reg_id = parts[0] + parts[1]
            
            # Save only the first village we encounter for each regency
            if reg_id not in regency_map:
                regency_map[reg_id] = adm4

with open("public/regency_to_adm4.json", "w", encoding="utf-8") as out:
    json.dump(regency_map, out, separators=(',', ':'))

print(f"Generated {len(regency_map)} regency mappings!")
