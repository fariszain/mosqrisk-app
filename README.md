# 🦟 MosqRisk — National Early Warning System for Dengue Fever

**MosqRisk** adalah platform **Sistem Kewaspadaan Dini Nasional** terintegrasi untuk mendeteksi, memantau, memetakan, dan memberikan peringatan dini terkait risiko penularan **Demam Berdarah Dengue (DBD)** di Indonesia. Platform ini bekerja secara sinergis dengan produk pencegah nyamuk **Patchmos Spray** — spray anti nyamuk 100% alami berbahan minyak nilam Aceh.

🌐 **Live Demo**: [https://mosqrisk-app.vercel.app](https://mosqrisk-app.vercel.app)

---

## 🌟 Fitur Utama

### 1. Beranda (`/`)
- Landing page premium dengan animasi scroll-reveal dan efek visual produk Patchmos Spray.
- Menampilkan statistik real-time (jumlah laporan, subscriber, dan dampak lingkungan) yang diambil langsung dari database.
- Akses cepat ke fitur klaim kode premium via modal Scan QR / Input Kode.
- Testimoni pengguna dan CTA (Call-to-Action) menuju halaman pembelian.

### 2. Peta Pantauan (`/pantau`)
- **Auto-Detect GPS**: Secara otomatis mendeteksi lokasi pengguna via Geolocation API + Reverse Geocoding (Nominatim OSM).
- **Pemilihan Manual**: Fallback dropdown Provinsi → Kabupaten/Kota menggunakan API Wilayah Indonesia (Emsifa).
- **Skor Risiko Dinamis**: Perhitungan indeks risiko DBD berbasis data cuaca BMKG (suhu, kelembapan, curah hujan) dikombinasikan dengan volume laporan warga.
- **Fitur Premium** (blur-lock untuk non-premium):
  - Grafik Tren 7 Hari (Recharts) — visualisasi suhu, kelembapan, curah hujan.
  - Geospatial Alert Radius — estimasi jangkauan risiko berdasarkan kepadatan laporan.
- **Autentikasi Google OAuth** (via Supabase Auth) untuk aktivasi fitur darurat berlangganan peringatan email.
- Rekomendasi tindakan kesehatan masyarakat berdasarkan tingkat risiko.

### 3. Lapor Warga (`/lapor`)
- Sistem urun daya (*crowdsourcing*) untuk melaporkan temuan sarang jentik atau kasus DBD.
- Auto-detect lokasi pelapor via GPS dan reverse geocoding.
- Pilihan jenis laporan: Sarang Jentik, Kasus DBD, atau Lainnya.
- Laporan otomatis dikirim ke Supabase dan memicu email notifikasi ke subscriber terdekat.

### 4. Checkout & Pembayaran (`/checkout`)
- Toko digital dengan pilihan paket: 1 Botol (Rp35.000), 2 Botol (Rp65.000), Paket Keluarga 3 Botol (Rp90.000).
- Integrasi pembayaran **Midtrans Snap** (QRIS, GoPay, OVO, Bank Transfer, dll).
- Ringkasan pesanan visual lengkap dengan rincian biaya admin.

### 5. Klaim Premium (`/claim`)
- Halaman verifikasi kode unik premium dari kemasan fisik Patchmos Spray.
- Validasi kode dilakukan di backend melalui tabel `premium_codes` di Supabase.
- Status kode berubah menjadi `used` setelah berhasil diklaim.

### 6. Modal Klaim (Beranda)
- **Scan QR Code** dari kemasan produk menggunakan kamera perangkat (library jsQR).
- **Input Manual** kode premium (format: `MOSQ-XXXX`).
- **Beli Akses Digital** langsung via QRIS.

### 7. Dashboard Admin (`/admin`)
- Login admin dengan sistem PIN/Bearer Token.
- Tabel data laporan masuk dan daftar subscriber email.
- Fitur hapus data palsu/spam dari laporan.
- **Export CSV** untuk analisis epidemiologi.
- **Broadcast Email Alert** darurat massal ke seluruh subscriber terdaftar.

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

### Design System
- **Warna Primer**: `#1A3626` (Hijau Gelap / Deep Forest Green)
- **Warna Aksen**: `#EAC775` (Emas / Gold Accent)
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Style**: Glassmorphism, rounded corners (`rounded-2xl`), gradient overlays

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
│   │   ├── layout.tsx           # Root layout (font, metadata, Midtrans script)
│   │   ├── template.tsx         # Page transition wrapper (Framer Motion)
│   │   └── globals.css          # Global styles & Tailwind config
│   │
│   ├── components/              # Komponen React
│   │   ├── Navbar.tsx           # Navigasi atas (desktop)
│   │   ├── BottomNav.tsx        # Navigasi bawah (mobile)
│   │   ├── Footer.tsx           # Footer global
│   │   ├── ClaimModal.tsx       # Modal scan QR / input kode / beli akses
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
├── supabase_setup.sql           # Skema tabel (reports, subscribers, premium_codes)
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
| `GET` | `/api/stats` | — | Statistik total laporan, subscriber, dampak lingkungan |
| `POST` | `/api/reports` | — | Kirim laporan jentik/DBD baru + trigger email notifikasi |
| `GET` | `/api/reports` | 🔒 Admin | Ambil semua laporan (butuh Bearer token) |
| `DELETE` | `/api/reports/{id}` | 🔒 Admin | Hapus laporan berdasarkan ID |
| `POST` | `/api/subscribe` | — | Daftarkan email untuk peringatan + kirim welcome email |
| `GET` | `/api/subscribe` | 🔒 Admin | Ambil daftar subscriber |
| `DELETE` | `/api/subscribe/{id}` | 🔒 Admin | Hapus subscriber berdasarkan ID |
| `POST` | `/api/admin/verify` | 🔒 Admin | Verifikasi PIN admin |
| `POST` | `/api/broadcast` | 🔒 Admin | Kirim email peringatan massal ke semua subscriber |
| `POST` | `/api/claim` | — | Validasi & gunakan kode premium kemasan |
| `POST` | `/api/payment/token` | — | Generate Midtrans Snap token untuk pembayaran |
| `POST` | `/api/checkout/verify` | — | Verifikasi status pembayaran checkout |

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
SUPABASE_KEY=eyJhbGci...  # Service Role Key (bypass RLS)
ADMIN_KEY=your_secure_admin_pin
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
| `reports` | id, locationName, reportType, description, created_at | Laporan jentik/DBD dari warga |
| `subscribers` | id, locationName, email, created_at | Email subscriber peringatan darurat |
| `premium_codes` | id, code, status, created_at | Kode premium kemasan Patchmos |

---

## 👥 Tim Pengembang

Dikembangkan oleh mahasiswa Universitas Teuku Umar sebagai proyek inovasi kesehatan masyarakat.

## 📄 Lisensi

Hak cipta © 2026 MosqRisk Team. Seluruh hak dilindungi.
