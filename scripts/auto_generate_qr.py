import os
import sys
import uuid
import qrcode
from supabase import create_client, Client
from dotenv import load_dotenv

# Path handling (load from backend directory)
BACKEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend')
QR_DIR = os.path.join(BACKEND_DIR, 'qr_codes')
ENV_PATH = os.path.join(BACKEND_DIR, '.env')

load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Kredensial Supabase tidak ditemukan di backend/.env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_random_code():
    """Menghasilkan kode unik berformat MOSQ-XXXX"""
    random_str = uuid.uuid4().hex[:4].upper()
    return f"MOSQ-{random_str}"

def generate_qr_image(code):
    """Membuat QR image untuk kode tertentu"""
    url = f"https://mosqrisk.vercel.app/claim?code={code}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    if not os.path.exists(QR_DIR):
        os.makedirs(QR_DIR)
        
    filepath = os.path.join(QR_DIR, f"{code}.png")
    img.save(filepath)
    return filepath

def main():
    if len(sys.argv) < 2:
        print("💡 Cara Pakai: python auto_generate_qr.py <JUMLAH_KODE>")
        print("   Contoh: python auto_generate_qr.py 50")
        sys.exit(1)
        
    try:
        count = int(sys.argv[1])
    except ValueError:
        print("❌ ERROR: Jumlah kode harus berupa angka.")
        sys.exit(1)
        
    print(f"🔄 Sedang membuat {count} kode baru dan QR Code...")
    
    generated_data = []
    
    for i in range(count):
        code = generate_random_code()
        generate_qr_image(code)
        generated_data.append({
            "code": code,
            "is_used": False
        })
        print(f"  ✅ Dibuat: {code}")
        
    print("\n⏳ Mengirim data ke Supabase Database...")
    
    try:
        # Bulk insert to Supabase
        res = supabase.table("premium_codes").insert(generated_data).execute()
        if res.data:
            print(f"🎉 SUKSES! {len(res.data)} kode berhasil dimasukkan ke Database (Tabel: premium_codes).")
            print(f"📂 Gambar QR Code telah disimpan di: {QR_DIR}")
        else:
            print("⚠️ Peringatan: Respon insert kosong dari Supabase.")
    except Exception as e:
        print(f"❌ ERROR saat mengirim ke Supabase: {str(e)}")

if __name__ == "__main__":
    main()
