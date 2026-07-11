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
│   │   ├── admin/page.tsx       # Dashboard admin (PIN-protected)
│   │   ├── layout.tsx           # Root layout (font, PWA, Midtrans script)
│   │   ├── template.tsx         # Page transition (Framer Motion)
│   │   └── globals.css          # Global CSS + Tailwind v4 theme
│   │
│   ├── components/
│   │   ├── Navbar.tsx           # Top nav (desktop only, hidden < lg)
│   │   ├── BottomNav.tsx        # Bottom nav (mobile, md:hidden)
│   │   ├── Footer.tsx           # Footer global
│   │   ├── ClaimModal.tsx       # Modal scan QR / input kode / beli akses (12KB)
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
├── supabase_setup.sql           # Skema tabel SQL
├── vercel.json                  # Deployment config
└── .gitignore                   # PENTING: `!frontend/lib/` exception added
```

## 🔌 API Endpoints (FastAPI — backend/main.py)

### Publik (Tanpa Autentikasi)
| Method | Route | Pydantic Model | Deskripsi |
|--------|-------|----------------|-----------|
| `GET` | `/api/mosqrisk?adm4=XX` | — | Ambil prakiraan cuaca BMKG → hitung skor risiko |
| `GET` | `/api/stats` | — | Total laporan, subscriber, dampak lingkungan |
| `POST` | `/api/reports` | `Report(locationName, reportType, description)` | Kirim laporan baru + trigger email |
| `POST` | `/api/subscribe` | `Subscriber(locationName, email)` | Daftar email alert + welcome email |
| `POST` | `/api/claim` | `ClaimRequest(code)` | Validasi kode premium kemasan |
| `POST` | `/api/payment/token` | `PaymentRequest(name, phone, package, amount)` | Generate Midtrans Snap token |
| `POST` | `/api/checkout/verify` | `CheckoutRequest(name, phone, package, paymentMethod)` | Verifikasi pembayaran |

### Protected (Bearer Token = ADMIN_KEY)
| Method | Route | Deskripsi |
|--------|-------|-----------|
| `POST` | `/api/admin/verify` | Verifikasi PIN admin |
| `GET` | `/api/reports` | Ambil semua laporan |
| `DELETE` | `/api/reports/{id}` | Hapus laporan |
| `GET` | `/api/subscribe` | Ambil semua subscriber |
| `DELETE` | `/api/subscribe/{id}` | Hapus subscriber |
| `POST` | `/api/broadcast` | Kirim email peringatan massal |

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
SUPABASE_KEY=              # Service Role Key (bypass RLS)
ADMIN_KEY=                 # PIN admin (default: kemenkes123)
GMAIL_USER=                # Email pengirim notifikasi
GMAIL_PASSWORD=            # Gmail App Password 16 digit
MIDTRANS_SERVER_KEY=       # Midtrans server key
MIDTRANS_CLIENT_KEY=       # Midtrans client key
MIDTRANS_IS_PRODUCTION=    # true/false
```

## 🎨 Design System & Visual Rules
1. **Warna Primer**: `#1A3626` (Deep Forest Green) — background utama, navbar, card.
2. **Warna Aksen**: `#EAC775` (Gold) — tombol CTA, badge premium, highlight.
3. **Background Gelap**: `#0c1f13` — area konten utama (pantau, checkout).
4. **Font**: `Plus Jakarta Sans` (Google Fonts) — satu-satunya font yang dipakai.
5. **Border Radius**: Gunakan `rounded-2xl` atau `rounded-[2.5rem]` untuk tampilan premium.
6. **Efek Visual**: Glassmorphism (`backdrop-blur`, `bg-opacity`), gradient overlays, `mix-blend-screen`.
7. **Animasi**: Framer Motion untuk page transitions, `RevealOnScroll` untuk scroll-based reveals.
8. **Ikon**: Google Material Symbols (via `<span className="material-symbols-outlined">`).

## ⚙️ Technical Notes & Known Constraints

### Supabase & RLS
- RLS (Row Level Security) aktif di semua tabel Supabase.
- Frontend menggunakan **Anon Key** (read publik terbatas).
- Backend menggunakan **Service Role Key** (bypass RLS untuk admin CRUD).
- Semua operasi tulis/hapus admin **HARUS** melalui backend FastAPI.

### Midtrans Integration
- Layout.tsx memuat Midtrans Snap JS via `<script>` tag.
- Backend `/api/payment/token` generate Snap token → frontend buka popup `window.snap.pay()`.
- Saat ini menggunakan **Sandbox** URL. Ganti ke production saat deploy final.

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
4. **Selalu** gunakan warna tema (`#1A3626`, `#EAC775`) — jangan warna generik.
5. **Validasi lokasi**: Nama kota sering berbeda antara sumber data. Backend `clean_loc()` sudah menangani standardisasi.
6. **Aksi sensitif**: Semua aksi yang mengubah state global (hapus data, broadcast) harus divalidasi di backend, bukan hanya di frontend.
7. **Hardcoded colors**: Banyak warna masih inline di komponen. Idealnya dipindah ke CSS variables, tapi untuk saat ini ikuti pola yang sudah ada.
8. **Premium check**: Saat ini status premium disimpan di `localStorage`. Ini adalah known limitation — belum ada validasi server-side.
