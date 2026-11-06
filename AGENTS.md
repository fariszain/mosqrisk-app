<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MosqRisk — Agent Guidelines & Project Architecture

## 📁 Struktur Folder Utama
```text
/home/zeyn/Documents/UTU/mosqrisk-app/
│
├── backend/                     # Python FastAPI Backend
│   ├── main.py                  # Seluruh endpoint API (479 baris)
│   ├── requirements.txt         # fastapi, uvicorn, requests, supabase, python-dotenv, pydantic
│   └── qr_codes/                # QR code kemasan (gitignored)
│
├── frontend/                    # Next.js 16 (App Router, Turbopack)
│   ├── app/
│   │   ├── page.tsx             # Landing page (18.7KB)
│   │   ├── pantau/page.tsx      # Dashboard risiko & cuaca (terbesar, ~786 baris)
│   │   ├── lapor/page.tsx       # Form laporan warga
│   │   ├── checkout/page.tsx    # Pembelian + Midtrans Snap
│   │   ├── claim/page.tsx       # Verifikasi kode premium
│   │   ├── admin/page.tsx       # Dashboard admin (PIN-protected) + panel Penjualan
│   │   ├── privasi/page.tsx     # Kebijakan Privasi (perbarui bila fitur pengumpul data berubah)
│   │   ├── layout.tsx           # Root layout (font, PWA, Midtrans script)
│   │   ├── template.tsx         # Page transition (Framer Motion)
│   │   └── globals.css          # Global CSS + Tailwind v4 theme
│   │
│   ├── components/
│   │   ├── Navbar.tsx           # Top nav (desktop only, hidden < lg)
│   │   ├── BottomNav.tsx        # Bottom nav (mobile, md:hidden)
│   │   ├── Footer.tsx           # Footer global
│   │   ├── ClaimModal.tsx       # Modal scan QR / input kode (tab "Beli Akses" palsu sudah dihapus)
│   │   ├── admin/SalesPanel.tsx # Panel penjualan online + offline
│   │   ├── RevealOnScroll.tsx   # Intersection Observer scroll animation
│   │   └── SlidingAuthCard.tsx  # Auth card (currently unused)
│   │
│   ├── lib/
│   │   └── supabase.ts          # Supabase client init (CRITICAL — was gitignored, now fixed)
│   │
│   ├── public/                  # Aset statis
│   │   ├── regency_to_adm4.json # Mapping kota → kode ADM4 BMKG
│   │   ├── manifest.json        # PWA manifest
│   │   └── *.png                # Gambar produk, logo, QRIS
│   │
│   └── next.config.ts           # PWA + API rewrites + eslint/ts ignore during builds
│
├── supabase_setup.sql           # Skema awal premium_codes (policy anon dicabut oleh migration Fase 1)
├── supabase/                    # migrations/ (dijalankan manual oleh tim) + audit_rls.sql (baca saja)
├── vercel.json                  # Deployment config
└── .gitignore                   # PENTING: `!frontend/lib/` exception added
```

## 🔌 API Endpoints (FastAPI — backend/main.py)

### Publik (Tanpa Autentikasi)
| Method | Route | Pydantic Model | Deskripsi |
|--------|-------|----------------|-----------|
| `GET` | `/api/mosqrisk?adm4=XX` | — | Ambil prakiraan cuaca BMKG → hitung skor risiko |
| `GET` | `/api/climate-trend?lat=&lon=` | — | Tren skor risiko 12 bulan (Open-Meteo) |
| `GET` | `/api/stats` | — | Jumlah laporan & subscriber (angka asli; `impact_kg` karangan sudah dihapus) |
| `POST` | `/api/reports` | `Report(locationName, reportType ∈ JENTIK/DBD/LAINNYA, description)` | Kirim laporan baru + email ke pelanggan di wilayah yang sama (`lokasi_cocok()`) |
| `POST` | `/api/subscribe` | `Subscriber(locationName, email)` | Daftar notifikasi email + welcome email |
| `POST` | `/api/claim` | `ClaimRequest(code)` | Validasi kode premium kemasan (update atomik) |
| `GET` | `/api/produk` | — | Harga (`HARGA_PER_BOTOL`), maks per pesanan, mode Midtrans, URL Snap, client key |
| `POST` | `/api/payment/token` | `PaymentRequest(name, phone, address, quantity, expectedTotal?)` | Catat pesanan ke `orders` → token Snap. Total dihitung server |
| `POST` | `/api/payment/status` | `PaymentStatusRequest(orderId)` | Cek status pembayaran ke API Midtrans |
| `POST` | `/api/payment/notification` | (body Midtrans, tanda tangan SHA512) | Webhook Midtrans |

### Protected (Bearer Token = ADMIN_KEY)
| Method | Route | Deskripsi |
|--------|-------|-----------|
| `POST` | `/api/admin/verify` | Verifikasi PIN admin |
| `GET` | `/api/reports` | Ambil semua laporan |
| `DELETE` | `/api/reports/{id}` | Hapus laporan |
| `GET` | `/api/subscribe` | Ambil semua subscriber |
| `DELETE` | `/api/subscribe/{id}` | Hapus subscriber |
| `POST` | `/api/broadcast` | Kirim email peringatan kewaspadaan ke SEMUA subscriber (belum ditarget per risiko) |
| `GET` | `/api/admin/orders` | Daftar pesanan online + offline |
| `POST` | `/api/admin/orders` | Catat penjualan offline (`OfflineSaleRequest`) |
| `PATCH` | `/api/admin/orders/{id}` | Ubah status pesanan |
| `POST` | `/api/admin/orders/{id}/sync` | Cek ulang status pembayaran ke Midtrans |

`verify_admin()` **fail closed**: tanpa `ADMIN_KEY` di environment → 503 untuk semua endpoint admin.

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=              # Supabase project URL
SUPABASE_KEY=              # WAJIB Service Role Key (bypass RLS); anon key tidak bisa akses tabel setelah migration Fase 1
ADMIN_KEY=                 # PIN admin — WAJIB; kosong = semua akses admin ditolak (tidak ada default)
SITE_URL=                  # opsional, tautan di email (default https://mosqrisk-app.vercel.app)
GMAIL_USER=                # Email pengirim notifikasi
GMAIL_PASSWORD=            # Gmail App Password 16 digit
MIDTRANS_SERVER_KEY=       # Midtrans server key
MIDTRANS_CLIENT_KEY=       # Midtrans client key
MIDTRANS_IS_PRODUCTION=    # true/false
```

## 🎨 Design System & Visual Rules (sedang dirombak — update 2026-11-06)
Aturan visual lama (glassmorphism sebagai gaya utama, gradient overlay, blob buram dekoratif, `rounded-[2.5rem]` di semua elemen, ikon/gambar melayang, animasi float tanpa henti, emoji di UI) **dicabut** — itu sumber kesan "template AI".
- **Jangkar merek** (tetap): hijau hutan `#1A3626` dan emas `#EAC775`, berasal dari logo & kemasan. Aset asli di `frontend/public/brand/` — dipakai apa adanya, tidak digambar ulang/diwarnai ulang.
- **Sampai arah desain dipilih (Fase 2)**: ikuti `docs/expo/02_DESIGN_BRIEF.md`.
- **Setelah dipilih**: aturan final di `.claude/skills/mosqrisk-design/SKILL.md` (token, tipografi, ikon, komponen, gerak). Bagian ini akan diperbarui untuk merujuk ke sana.
- Satu keluarga ikon, warna lewat token CSS di `globals.css`, tanpa emoji di UI maupun email.

## ⚙️ Technical Notes & Known Constraints

### Supabase & RLS
- RLS (Row Level Security) aktif di semua tabel Supabase.
- Frontend menggunakan **Anon Key** (read publik terbatas).
- Backend menggunakan **Service Role Key** (bypass RLS untuk admin CRUD).
- Semua operasi tulis/hapus admin **HARUS** melalui backend FastAPI.

### Midtrans Integration & Penjualan
- Snap JS dimuat **hanya di `/checkout`**; URL sandbox/produksi dan client key datang dari `GET /api/produk` (mengikuti `MIDTRANS_IS_PRODUCTION` di backend). Tidak ada lagi script Snap di `layout.tsx`.
- Harga: satu konstanta `HARGA_PER_BOTOL` di `backend/main.py` (Rp20.000, SEMENTARA). Frontend tidak menyimpan harga sendiri.
- Alur: `/api/payment/token` mencatat pesanan ke tabel `orders` → token Snap → `window.snap.pay()` → `/api/payment/status` (server bertanya ke Midtrans). Webhook: `/api/payment/notification` (atur Notification URL di dashboard Midtrans).
- Penjualan offline dicatat admin di `/admin` (panel Penjualan) ke tabel `orders` yang sama.
- Selama sandbox, checkout menampilkan label "mode uji coba" dan pesanan ditandai `is_test`.
- Tabel `orders` dibuat oleh `supabase/migrations/20261106120000_fase1_rls_orders.sql` (dijalankan manual oleh tim).

### PWA
- Dikonfigurasi via `@ducanh2912/next-pwa` di `next.config.ts`.
- Manifest di `public/manifest.json`.
- Disabled saat development (`NODE_ENV === "development"`).

### Build & Deploy
- `next.config.ts` sudah dikonfigurasi `eslint.ignoreDuringBuilds: true` dan `typescript.ignoreBuildErrors: true` agar build Vercel tidak gagal karena warnings.
- API rewrites: Development → `127.0.0.1:8000`, Production → rewrites ke diri sendiri (perlu backend terpisah).

## ✍️ Guidelines untuk AI Agent

1. **JANGAN** pernah menulis ke SQLite (`reports.db`). Selalu gunakan Supabase.
2. **JANGAN** menghapus komentar atau docstring yang sudah ada kecuali diminta user.
3. **JANGAN** memindahkan atau menghapus `frontend/lib/supabase.ts` — file ini sempat hilang dari git karena `.gitignore`, sudah diperbaiki.
4. **Selalu** gunakan token warna dari design system (jangkar merek `#1A3626`, `#EAC775`) — jangan warna generik.
5. **Validasi lokasi**: Nama kota sering berbeda antara sumber data. Backend `clean_loc()` sudah menangani standardisasi.
6. **Aksi sensitif**: Semua aksi yang mengubah state global (hapus data, broadcast) harus divalidasi di backend, bukan hanya di frontend.
7. **Hardcoded colors**: Banyak warna masih inline di komponen. Saat redesign (Fase 3), pindahkan ke token CSS di `globals.css`; jangan menambah warna hardcode baru.
8. **Premium check**: Saat ini status premium disimpan di `localStorage`. Ini adalah known limitation — belum ada validasi server-side.

## 📌 Aturan Tetap Proyek (update 2026-11-06)
1. **Tanpa atribusi AI** di commit/PR (tanpa `Co-Authored-By`, tanpa footer "Generated with"). Jangan `git push`, deploy, atau mengubah env Vercel tanpa izin eksplisit user.
2. **Fakta & klaim** hanya dari `docs/expo/05_FAKTA_TERVERIFIKASI.md`. Dilarang mengarang testimoni, angka, hasil uji, atau afiliasi resmi (Kemenkes/BMKG/BPOM).
3. **Data Supabase**: jangan mengubah/menghapus baris apa pun (termasuk kode premium demo, laporan, subscriber). Perubahan skema/RLS hanya lewat file migration yang di-review & dijalankan user.
4. **Rahasia**: jangan membaca file `.env`; rujuk nama variabel dari `.env.example` atau dokumentasi.
5. **Harga**: `Rp20.000/botol` bersifat SEMENTARA, satu konstanta, tanpa paket bundling.
6. **Bahasa & verifikasi**: teks UI berbahasa Indonesia; perubahan UI wajib diverifikasi dengan screenshot desktop (1440) & mobile (390) sebelum dinyatakan selesai.
7. **Rencana & log**: `docs/expo/01_ROADMAP.md` (rencana), `docs/expo/PROGRESS.md` (log, perbarui di akhir setiap fase).
