<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MosqRisk Project Documentation

MosqRisk adalah sebuah platform **Sistem Kewaspadaan Dini Nasional (National Early Warning System)** yang terintegrasi, yang dirancang untuk memantau, memetakan, dan memberikan peringatan dini terkait risiko nyamuk dan penyakit Demam Berdarah Dengue (DBD). Proyek ini memanfaatkan data cuaca BMKG dan laporan warga (crowdsourcing).

## 🛠️ Tech Stack & Architecture
- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend API**: Python (FastAPI) berjalan di port 8000
- **Database**: Supabase (PostgreSQL) menggantikan sistem SQLite lama
- **Pengiriman Email**: smtplib (Gmail SMTP dengan App Password)
- **Tema UI**: Hijau gelap (`#1A3626`) dan emas (`#EAC775`), minimalis modern, glassmorphism

## 📁 Struktur Folder Utama
```text
/home/zeyn/Documents/UTU/mosqrisk-app/
│
├── app/                     # (Next.js App Router) Halaman Frontend
│   ├── admin/page.tsx       # Dashboard Admin (Peta, Tabel Laporan, Export CSV, Broadcast)
│   ├── checkout/page.tsx    # Halaman checkout & pembayaran produk fisik (Patchmos)
│   ├── claim/page.tsx       # Halaman klaim kode Premium menggunakan QR code
│   ├── lapor/page.tsx       # Form laporan warga (Jentik & DBD)
│   ├── tentang/page.tsx     # Profil produk dan informasi MosqRisk
│   ├── page.tsx             # Landing Page utama (Peta interaktif, Call-to-action)
│   └── layout.tsx           # Layout root & font (Plus Jakarta Sans)
│
├── components/              # Komponen React Reusable
│   ├── Navbar.tsx           # Navigasi utama dengan hamburger menu mobile
│   └── Footer.tsx           # Footer standar Kemenkes & MosqRisk
│
├── public/                  # Aset statis & gambar (SVG, JSON data pemetaan)
│   └── regency_to_adm4.json # Pemetaan nama kabupaten ke kode ADM4 BMKG
│
├── qr_codes/                # Folder hasil generate QR Code untuk produk Patchmos
│   └── MOSQ-XXXX.png        # QR code unik untuk discan user
│
├── main.py                  # API Backend Utama (FastAPI)
│                            # Endpoint: /api/mosqrisk, /api/report, /api/subscribe, /api/claim
├── generate_codes.py        # Script Python untuk generate QR code & SQL insert
├── .env                     # File konfigurasi (Kredensial Supabase, API Key, Email)
└── package.json             # Dependensi Node.js & Next.js script
```

## 🔌 Endpoint API Utama (FastAPI)
- `GET /api/mosqrisk?adm4=XX`: Mengambil data BMKG, menghitung risiko berbasis cuaca harian, dan mereturn skor risiko nyamuk.
- `GET /api/reports`: Mengambil semua data pelaporan warga dari Supabase.
- `POST /api/report`: Menyimpan laporan baru (tipe: DBD/Jentik) ke database Supabase.
- `POST /api/subscribe`: Mendaftarkan email warga untuk menerima peringatan (Alert Darurat).
- `POST /api/broadcast?key=...`: Mengirim peringatan dini massal ke semua email yang terdaftar jika lokasinya memiliki laporan.
- `POST /api/claim`: Endpoint untuk memvalidasi dan mengubah status penggunaan Kode Premium yang di-scan dari kemasan Patchmos.

## 🔐 Panduan Konfigurasi (Environment Variables)
- **Database**: Harus selalu menggunakan Supabase (`SUPABASE_URL` dan `SUPABASE_KEY`). Jangan menulis lagi ke `reports.db` (SQLite usang).
- **Email System**: Peringatan darurat menggunakan `GMAIL_USER` dan `GMAIL_PASSWORD` (berupa 16 digit *App Password*).
- **Admin**: Akses broadcast dan menu sensitif admin dilindungi oleh `ADMIN_KEY` (biasanya `kemenkes123`).

## ✍️ Guidelines (Aturan Pengembangan)
1. **Desain**: Selalu gunakan warna primer `#1A3626` dan sekunder `#EAC775`. Terapkan border-radius besar (seperti `rounded-2xl` atau `rounded-full`) untuk memberikan nuansa ramah pengguna, elegan, dan modern.
2. **Validasi Lokasi**: Nama kota/kabupaten sering berbeda (misal "Kabupaten Aceh Besar" dengan "Aceh Besar"). Backend sudah memiliki fungsi `clean_loc()` untuk menangani standarisasi nama ini.
3. **Database Client**: Jangan menggunakan SQLite. Selalu gunakan `supabase.table("nama_tabel")...` untuk operasi baca/tulis data.
4. **Keamanan**: Seluruh aksi yang mengubah state global atau mengirim pesan massal harus divalidasi keamanannya di backend (`main.py`), **bukan** hanya di frontend (contohnya perbaikan endpoint `/api/claim` dan `/api/broadcast`).
