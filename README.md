# MosqRisk + Patchmos — Pemantauan Risiko Nyamuk DBD

**MosqRisk Analytics** adalah web untuk memantau risiko nyamuk penular **Demam Berdarah Dengue (DBD)** per kabupaten/kota. Skor risiko dihitung dengan formula berbobot (parameter dari literatur ilmiah) dari **prakiraan cuaca publik BMKG** — bukan model *machine learning* yang dilatih dari data kasus. MosqRisk terhubung dengan **Patchmos Spray**, spray bio-repellent dengan bahan aktif dari ampas nilam (limbah penyulingan) Aceh, lewat kode QR di kemasan.

> Fakta, angka, dan klaim produk: lihat `docs/expo/05_FAKTA_TERVERIFIKASI.md`.

🌐 **Live Demo**: [https://mosqrisk-app.vercel.app](https://mosqrisk-app.vercel.app)

---

## 🌟 Fitur Utama

### 1. Beranda (`/`)
- Landing page produk Patchmos Spray dan MosqRisk.
- Akses cepat ke fitur klaim kode premium via modal Scan QR / Input Kode.
- Ringkasan hasil uji persepsi pengguna (10 responden, diberi label "uji persepsi, bukan uji klinis") dan CTA menuju halaman pembelian.
- Beranda tidak menampilkan statistik database. Endpoint `/api/stats` mengembalikan jumlah laporan & pelanggan (angka asli) bila nanti ingin ditampilkan.

### 2. Peta Pantauan (`/pantau`)
- **Auto-Detect GPS**: Secara otomatis mendeteksi lokasi pengguna via Geolocation API + Reverse Geocoding (Nominatim OSM).
- **Pemilihan Manual**: Fallback dropdown Provinsi → Kabupaten/Kota menggunakan API Wilayah Indonesia (Emsifa).
- **Skor Risiko (Model Risiko MosqRisk)**: formula berbobot dari prakiraan cuaca BMKG — suhu (40%), curah hujan harian (35%), kelembapan (25%). Laporan warga **tidak** memengaruhi skor.
- **Fitur Premium** (blur-lock untuk non-premium):
  - Prakiraan risiko 3 hari (hari ini + 2 hari) dari data BMKG (Recharts).
  - Notifikasi email untuk wilayah yang dipilih.
- **Autentikasi Google OAuth** (via Supabase Auth) untuk berlangganan notifikasi email (dikirim saat ada laporan warga di wilayah itu atau saat admin mengirim peringatan).
- Rekomendasi tindakan kesehatan masyarakat berdasarkan tingkat risiko.

### 3. Lapor Warga (`/lapor`)
- Sistem urun daya (*crowdsourcing*) untuk melaporkan temuan sarang jentik atau kasus DBD.
- Auto-detect lokasi pelapor via GPS dan reverse geocoding.
- Pilihan jenis laporan: Sarang Jentik, Kasus DBD, atau Lainnya.
- Laporan disimpan ke Supabase dan diteruskan lewat email ke pelanggan notifikasi di wilayah yang sama. Nama/kontak pelapor tidak diminta.

### 4. Checkout & Pembayaran (`/checkout`)
- Harga **Rp20.000/botol (SEMENTARA)**, satu konstanta `HARGA_PER_BOTOL` di `backend/main.py`; frontend membacanya lewat `GET /api/produk`. Tanpa paket bundling: total = jumlah × harga (stepper 1–20 botol).
- Total dihitung di server; pesanan (nama, HP, alamat, jumlah) dicatat ke tabel `orders` sebelum transaksi **Midtrans Snap** dibuat.
- Status pembayaran dicek server ke API Midtrans (`/api/payment/status`) dan lewat notifikasi Midtrans (`/api/payment/notification`).
- Selama `MIDTRANS_IS_PRODUCTION=false`, halaman menampilkan label **mode uji coba** (sandbox, tidak ada uang ditarik).

### 5. Klaim Premium (`/claim`)
- Halaman verifikasi kode unik premium dari kemasan fisik Patchmos Spray.
- Validasi kode dilakukan di backend melalui tabel `premium_codes` di Supabase.
- Status kode berubah menjadi `used` setelah berhasil diklaim.

### 6. Modal Klaim (Beranda)
- **Scan QR Code** dari kemasan produk menggunakan kamera perangkat (library jsQR).
- **Input Manual** kode premium (format: `MOSQ-XXXX`).
- Status Premium disimpan di `localStorage` browser (keterbatasan yang diketahui — belum divalidasi server).

### 7. Dashboard Admin (`/admin`)
- Login admin dengan PIN/Bearer Token (`ADMIN_KEY` wajib diisi; kalau kosong semua akses admin ditolak).
- **Penjualan**: ringkasan botol terjual & pendapatan, daftar pesanan online + offline, ubah status (dibayar/dikirim/selesai/batal), cek status ke Midtrans, dan **form catat penjualan offline**.
- Tabel data laporan masuk dan daftar subscriber email.
- Fitur hapus data palsu/spam dari laporan.
- **Export CSV** (laporan, pelanggan, penjualan).
- **Broadcast email** peringatan kewaspadaan ke seluruh subscriber (belum ditarget per tingkat risiko wilayah).

### 8. Kebijakan Privasi (`/privasi`)
- Data apa yang dikumpulkan, untuk apa, layanan pihak ketiga, cara berhenti berlangganan & meminta penghapusan data.

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Next.js** | 16.2.9 | App Router, Turbopack |
| **React** | 19.2.4 | Client Components |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Framer Motion** | ^12.42 | Animasi & transisi halaman |
| **Recharts** | ^3.9 | Grafik tren cuaca premium |
| **Supabase JS** | ^2.110 | Auth (Google OAuth) & realtime |
| **jsQR** | ^1.4 | Decode QR code dari kamera |
| **next-pwa** | ^10.2 | Progressive Web App (offline-ready) |

### Backend
| Teknologi | Keterangan |
|-----------|------------|
| **Python FastAPI** | REST API server (port 8000) |
| **Supabase (PostgreSQL)** | Database cloud terpusat |
| **Midtrans Snap** | Payment gateway (QRIS, e-Wallet, VA) |
| **SMTP (Gmail)** | Email notifikasi & broadcast alert |
| **BMKG Public API** | Data prakiraan cuaca harian |

### Design System (sedang dirombak)
- **Jangkar merek**: `#1A3626` (hijau hutan) dan `#EAC775` (emas), dari logo & kemasan.
- Arahan desain: `docs/expo/02_DESIGN_BRIEF.md` (gaya lama — glassmorphism, gradient overlay, blob buram — dicabut).

---

## 📁 Struktur Repositori

```text
mosqrisk-app/
│
├── backend/                     # Python FastAPI Backend
│   ├── main.py                  # Seluruh endpoint API, logika risiko, email, Midtrans
│   ├── requirements.txt         # Dependensi Python
│   └── qr_codes/                # QR code kemasan (auto-generated, gitignored)
│
├── frontend/                    # Next.js 16 Frontend
│   ├── app/                     # Halaman (App Router)
│   │   ├── page.tsx             # Landing page utama
│   │   ├── pantau/page.tsx      # Dashboard peta risiko & cuaca
│   │   ├── lapor/page.tsx       # Form laporan warga
│   │   ├── checkout/page.tsx    # Halaman pembelian + Midtrans Snap
│   │   ├── claim/page.tsx       # Verifikasi kode premium
│   │   ├── admin/page.tsx       # Dashboard admin
│   │   ├── privasi/page.tsx     # Kebijakan Privasi
│   │   ├── layout.tsx           # Root layout (font, metadata)
│   │   ├── template.tsx         # Page transition wrapper (Framer Motion)
│   │   └── globals.css          # Global styles & Tailwind config
│   │
│   ├── components/              # Komponen React
│   │   ├── Navbar.tsx           # Navigasi atas (desktop)
│   │   ├── BottomNav.tsx        # Navigasi bawah (mobile)
│   │   ├── Footer.tsx           # Footer global
│   │   ├── ClaimModal.tsx       # Modal scan QR / input kode
│   │   ├── admin/SalesPanel.tsx # Panel penjualan online + offline di /admin
│   │   ├── RevealOnScroll.tsx   # Intersection Observer scroll animation
│   │   └── SlidingAuthCard.tsx  # Komponen auth card (login/signup)
│   │
│   ├── lib/
│   │   └── supabase.ts          # Inisialisasi Supabase client
│   │
│   ├── public/                  # Aset statis
│   │   ├── regency_to_adm4.json # Mapping kota/kabupaten → kode ADM4 BMKG
│   │   ├── manifest.json        # PWA manifest
│   │   └── *.png                # Gambar produk, logo, QRIS
│   │
│   └── next.config.ts           # Konfigurasi Next.js + PWA + API rewrites
│
├── supabase_setup.sql           # Skema awal premium_codes (policy anon-nya dicabut oleh migration Fase 1)
├── supabase/
│   ├── migrations/              # Migration SQL (dijalankan manual di SQL Editor Supabase)
│   └── audit_rls.sql            # Kueri baca-saja untuk mengecek RLS & hak akses
├── vercel.json                  # Konfigurasi deployment Vercel
├── AGENTS.md                    # Panduan untuk AI Agent
├── CLAUDE.md                    # Pointer ke AGENTS.md
└── .gitignore                   # File yang diabaikan Git
```

---

## 🔌 API Endpoints (FastAPI)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/mosqrisk?adm4=XX` | — | Ambil data cuaca BMKG & hitung skor risiko DBD |
| `GET` | `/api/climate-trend?lat=&lon=` | — | Tren skor risiko 12 bulan dari data cuaca historis Open-Meteo |
| `GET` | `/api/stats` | — | Jumlah laporan & subscriber (angka asli dari database) |
| `POST` | `/api/reports` | — | Kirim laporan jentik/DBD baru + trigger email notifikasi |
| `GET` | `/api/reports` | 🔒 Admin | Ambil semua laporan (butuh Bearer token) |
| `DELETE` | `/api/reports/{id}` | 🔒 Admin | Hapus laporan berdasarkan ID |
| `POST` | `/api/subscribe` | — | Daftarkan email untuk peringatan + kirim welcome email |
| `GET` | `/api/subscribe` | 🔒 Admin | Ambil daftar subscriber |
| `DELETE` | `/api/subscribe/{id}` | 🔒 Admin | Hapus subscriber berdasarkan ID |
| `POST` | `/api/admin/verify` | 🔒 Admin | Verifikasi PIN admin |
| `POST` | `/api/broadcast` | 🔒 Admin | Kirim email peringatan massal ke semua subscriber |
| `POST` | `/api/claim` | — | Validasi & gunakan kode premium kemasan (atomik: satu kode hanya sekali) |
| `GET` | `/api/produk` | — | Harga per botol, batas jumlah, mode pembayaran (sandbox/produksi) & URL Snap |
| `POST` | `/api/payment/token` | — | Catat pesanan online + buat token Snap; total dihitung server (jumlah × harga) |
| `POST` | `/api/payment/status` | — | Cek status pembayaran pesanan ke API Midtrans |
| `POST` | `/api/payment/notification` | Tanda tangan Midtrans | Webhook notifikasi pembayaran Midtrans |
| `GET` | `/api/admin/orders` | 🔒 Admin | Daftar pesanan online + offline |
| `POST` | `/api/admin/orders` | 🔒 Admin | Catat penjualan offline |
| `PATCH` | `/api/admin/orders/{id}` | 🔒 Admin | Ubah status pesanan |
| `POST` | `/api/admin/orders/{id}/sync` | 🔒 Admin | Cek ulang status pembayaran ke Midtrans |

---

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...  # WAJIB Service Role Key (bypass RLS) — anon key tidak akan bisa mengakses tabel
ADMIN_KEY=your_secure_admin_pin  # WAJIB; kalau kosong, semua akses admin ditolak
SITE_URL=https://mosqrisk-app.vercel.app  # opsional, untuk tautan di email
GMAIL_USER=mosqrisk.official@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password (16 digit)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Menjalankan Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
pip install midtransclient python-dotenv
uvicorn main:app --reload --port 8000
```
Server backend berjalan di `http://127.0.0.1:8000`.

### 2. Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Buka `http://localhost:3000` di browser.

> **Catatan**: Pastikan backend sudah berjalan terlebih dahulu agar API calls dari frontend tidak gagal. API rewrites di `next.config.ts` secara otomatis memproxy `/api/*` ke `127.0.0.1:8000` saat mode development.

---

## 📱 Progressive Web App (PWA)

MosqRisk mendukung instalasi sebagai PWA di perangkat mobile dan desktop:
- Offline-ready dengan service worker caching
- Installable (Add to Home Screen)
- Manifest dengan ikon dan tema warna hijau gelap

---

## 🗄️ Database Schema (Supabase)

| Tabel | Kolom Utama | Deskripsi |
|-------|-------------|-----------|
| `reports` | id, location_name, report_type, description, created_at | Laporan jentik/DBD dari warga |
| `subscribers` | id, location_name, email, created_at | Email pelanggan notifikasi |
| `premium_codes` | id, code, is_used, created_at | Kode premium kemasan Patchmos |
| `orders` | id, channel (online/offline), status, quantity, unit_price, total, customer_name, phone, address, payment_method, midtrans_order_id, midtrans_status, sold_at, is_test, notes | Penjualan online & offline (dibuat oleh migration Fase 1) |

Semua tabel memakai RLS tanpa akses untuk `anon`/`authenticated`; hanya backend (service role) yang membaca/menulis.

---

## 👥 Tim Pengembang

Dikembangkan oleh mahasiswa Universitas Syiah Kuala (USK) sebagai bagian dari proyek kewirausahaan Patchmos, didanai Program Pendanaan Internal Kewirausahaan (PIKU) USK.

## 📄 Lisensi

Hak cipta © 2026 MosqRisk Team. Seluruh hak dilindungi.
