<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MosqRisk Agent Guidelines & Project Architecture

## 📁 Struktur Folder Utama
```text
/home/zeyn/Documents/UTU/mosqrisk-app/
│
├── backend/                 # Aplikasi Python (FastAPI Backend)
│   ├── main.py              # Endpoint API utama, logika perhitungan skor risiko, dan email SMTP
│   ├── requirements.txt     # Dependensi modul Python (fastapi, uvicorn, supabase, dll)
│   └── qr_codes/            # Direktori penyimpanan lokal kode QR kemasan Patchmos
│
├── frontend/                # Aplikasi Next.js (React Frontend)
│   ├── app/                 # Halaman utama (App Router)
│   │   ├── admin/           # Halaman kontrol admin & pengiriman broadcast
│   │   ├── checkout/        # Halaman pembelian produk Patchmos + simulasi QRIS
│   │   ├── claim/           # Halaman verifikasi kode unik kemasan
│   │   ├── lapor/           # Form laporan kasus & jentik warga
│   │   ├── pantau/          # Peta visual risiko DBD & rekomendasi tindakan
│   │   ├── globals.css      # Style global & konfigurasi CSS Tailwind
│   │   ├── layout.tsx       # Layout utama dengan inisialisasi font
│   │   └── page.tsx         # Landing page utama
│   │
│   ├── components/          # Komponen React reusable (Navbar.tsx, Footer.tsx)
│   └── public/              # File aset gambar & data statis (regency_to_adm4.json, Spray-fixed.png, dll)
```

## 🔌 Endpoint API Utama (FastAPI)
- `GET /api/mosqrisk?adm4=XX`: Mengambil prakiraan cuaca wilayah dari BMKG, menghitung skor risiko DBD berbasis suhu, kelembapan, curah hujan harian.
- `GET /api/reports`: Menarik daftar laporan masyarakat (kasus DBD & sarang jentik) langsung dari Supabase.
- `POST /api/reports`: Menyimpan data laporan jentik/DBD baru ke tabel `reports` Supabase dan mengirim notifikasi email lokal ke subscriber terdekat.
- `GET /api/stats`: Mengembalikan jumlah total laporan dan subscriber, serta menghitung total dampak pelestarian alam nilam secara dinamis.
- `POST /api/subscribe`: Mendaftarkan email warga untuk menerima peringatan darurat otomatis dan mengirimkan email sambutan selamat bergabung.
- `POST /api/broadcast?key=...`: Mengirim broadcast email peringatan siaga DBD massal ke seluruh email subscriber jika parameter admin key valid (`ADMIN_KEY`).
- `POST /api/claim`: Memvalidasi kode kupon premium kemasan botol Patchmos dari tabel `premium_codes` Supabase dan mengubah statusnya menjadi digunakan.

## 🔐 Panduan Konfigurasi (Environment Variables)
- **Database**: Harus selalu menggunakan Supabase (`SUPABASE_URL` dan `SUPABASE_KEY`). Jangan menulis lagi ke `reports.db` (SQLite usang).
- **Email System**: Peringatan darurat menggunakan `GMAIL_USER` dan `GMAIL_PASSWORD` (berupa 16 digit *App Password*).
- **Admin**: Akses broadcast dan menu sensitif admin dilindungi oleh `ADMIN_KEY` (biasanya `kemenkes123`).

## ✍️ Guidelines Khusus AI Agent
1. **Desain Visual**: Selalu gunakan warna primer `#1A3626` (hijau gelap) dan sekunder `#EAC775` (emas). Terapkan border-radius besar (seperti `rounded-2xl` atau `rounded-[2.5rem]`) untuk komponen kartu dan tombol agar terlihat elegan, modern, dan tidak kaku.
2. **Efek Gambar**: Untuk gambar produk/siluet di background, manfaatkan Tailwind filters (blur, drop-shadow) dan efek perpaduan layer seperti `mix-blend-screen` atau `mix-blend-overlay` dengan opacity rendah untuk tampilan premium (lihat contoh di `checkout/page.tsx` atau `pantau/page.tsx`).
3. **Validasi Lokasi**: Nama kota/kabupaten sering berbeda (misal "Kabupaten Aceh Besar" dengan "Aceh Besar"). Backend sudah memiliki fungsi `clean_loc()` untuk menangani standarisasi nama ini.
4. **Database Client**: Jangan menggunakan SQLite. Selalu gunakan `supabase.table("nama_tabel")...` untuk operasi baca/tulis data.
5. **Keamanan**: Seluruh aksi yang mengubah state global atau mengirim pesan massal harus divalidasi keamanannya di backend (`main.py`), **bukan** hanya di frontend.
