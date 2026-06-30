"""
Generate 10 premium codes (MOSQ-XXXX) with QR code images.
Each QR encodes: https://mosqrisk.vercel.app/claim?code=MOSQ-XXXX
"""

import os
import random
import string
import qrcode

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr_codes")
BASE_URL = "https://mosqrisk.vercel.app/claim?code="
NUM_CODES = 10


def generate_code() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=4))
    return f"MOSQ-{suffix}"


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    codes: list[str] = []
    while len(codes) < NUM_CODES:
        code = generate_code()
        if code not in codes:
            codes.append(code)

    print("=" * 50)
    print("  MOSQRISK PREMIUM CODES + QR GENERATOR")
    print("=" * 50)

    for code in codes:
        url = f"{BASE_URL}{code}"
        img = qrcode.make(url)
        filepath = os.path.join(OUTPUT_DIR, f"{code}.png")
        img.save(filepath)
        print(f"  ✅  {code}  →  {filepath}")

    # Generate SQL INSERT
    print("\n" + "=" * 50)
    print("  SQL INSERT STATEMENT")
    print("=" * 50)
    values = ", ".join(f"('{c}', false)" for c in codes)
    sql = f"INSERT INTO premium_codes (code, is_used) VALUES {values};"
    print(sql)
    print()


if __name__ == "__main__":
    main()
