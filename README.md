# MosqRisk & Patchmos Spray

**MosqRisk** adalah platform **Sistem Kewaspadaan Dini Nasional (National Early Warning System)** terintegrasi untuk mendeteksi, memantau, memetakan, dan memberikan peringatan dini terkait risiko penularan Demam Berdarah Dengue (DBD) di Indonesia. Platform ini bekerja secara sinergis dengan produk pencegah nyamuk **Patchmos Spray**.

Situs ini sudah di-deploy secara langsung (live) dan dapat diakses melalui Vercel di tautan berikut:
**[https://mosqrisk-app.vercel.app/](https://mosqrisk-app.vercel.app/)**

---

## 🌟 Fitur Utama & Penjelasan Halaman

1. **Beranda (`/` atau landing page)**:
   - Pengenalan platform MosqRisk dan produk Patchmos Spray.
   - Ilustrasi visual premium dengan efek siluet botol spray 100% alami yang dinamis.
   - Informasi singkat mengenai misi sosial pendampingan petani nilam lokal di Aceh.

2. **Peta Pantauan (`/pantau`)**:
   - Visualisasi tingkat risiko penularan DBD (Rendah, Sedang, Tinggi) di tingkat kota/kabupaten.
   - Perhitungan risiko dinamis yang ditenagai oleh data cuaca BPS/BMKG (suhu, kelembapan, curah hujan) dikombinasikan dengan laporan warga.
   - Bagian **Tindakan Disarankan** yang memberikan anjuran kesehatan masyarakat beserta penempatan produk Patchmos Spray.

3. **Lapor Warga (`/lapor`)**:
   - Sistem urun daya (*crowdsourcing*) bagi masyarakat untuk melaporkan temuan sarang jentik nyamuk atau kasus DBD aktif di daerah mereka secara instan.
   - Laporan dikirimkan langsung ke database Supabase dan secara otomatis menaikkan tingkat risiko daerah terkait.

4. **Klaim Premium (`/claim`)**:
   - Halaman khusus bagi pengguna produk fisik Patchmos Spray untuk memindai/memasukkan kode unik premium dari kemasan produk.
   - Berhasil memvalidasi kode akan meningkatkan status akun pengguna menjadi Premium guna menerima peringatan bencana berkala.

5. **Checkout & Pembayaran (`/checkout`)**:
   - Toko digital terintegrasi untuk membeli Patchmos Spray dengan pilihan paket (1 Botol, 2 Botol, dan Paket Keluarga 3 Botol).
   - Menyertakan **Ringkasan Pesanan** visual lengkap dengan rincian biaya admin dan tombol beli berbentuk kapsul modern.
   - Memiliki modal visual pembayaran QRIS fungsional untuk simulasi transaksi langsung.

6. **Dashboard Admin (`/admin`)**:
   - Portal khusus bagi pihak berwenang (Kemenkes/Dinas Kesehatan) untuk memantau data laporan masuk, mengunduh data dalam format CSV untuk analisis epidemiologi, serta mengirimkan pesan peringatan (*broadcast email alert*) darurat ke warga di wilayah berisiko tinggi.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 16 (App Router) & React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS dengan konfigurasi tema hijau gelap (`#1A3626`) dan aksen emas (`#EAC775`), dilengkapi gaya visual *glassmorphism* modern.
- **Font**: Plus Jakarta Sans (melalui Google Fonts/Next Font)

### Backend
- **Framework**: Python FastAPI (berjalan pada port `8000`)
- **Database**: Supabase (PostgreSQL) sebagai penyimpanan cloud terpusat (menggantikan SQLite lama).
- **Notifikasi**: Sistem email SMTP dengan `smtplib` untuk pengiriman alert otomatis dan welcome email.
- **Data Cuaca**: Integrasi dinamis dengan API prakiraan cuaca publik milik BMKG.

---

## 📁 Struktur Repositori

```text
mosqrisk-app/
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
│
├── supabase_setup.sql       # Struktur skema tabel reports, subscribers, & premium_codes
└── vercel.json              # Konfigurasi deployment frontend ke Vercel
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Menjalankan Backend (FastAPI)
Masuk ke direktori backend, pasang dependensi, lalu jalankan server:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Server backend akan berjalan di `http://127.0.0.1:8000`.

### 2. Menjalankan Frontend (Next.js)
Masuk ke direktori frontend, pasang dependensi Node.js, dan jalankan server pengembangan:
```bash
cd frontend
npm install
npm run dev
```
Buka `http://localhost:3000` pada peramban Anda.
