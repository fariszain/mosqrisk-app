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
│   ├── main.py                  # Seluruh endpoint API
│   ├── produk.json              # SATU-SATUNYA sumber nama, harga, batas pesanan, ongkir (dibaca backend + next.config.ts)
│   ├── rumus_risiko.json        # SATU-SATUNYA sumber parameter rumus risiko v4 (dibaca backend + simulator /edukasi)
│   ├── requirements.txt         # fastapi, uvicorn, requests, supabase, python-dotenv, pydantic
│   └── qr_codes/                # QR code kemasan (gitignored)
│
├── frontend/                    # Next.js 16 (App Router, Turbopack)
│   ├── app/
│   │   ├── page.tsx             # Beranda (Server Component + pulau client: risiko live, klaim)
│   │   ├── tim/page.tsx         # Tim, cara Patchmos dibuat, hasil uji (foto otomatis dari public/tim/)
│   │   ├── pantau/page.tsx      # Skor risiko + pilih wilayah + prakiraan 3 hari & notifikasi email (Premium)
│   │   ├── lapor/page.tsx       # Form laporan warga
│   │   ├── checkout/page.tsx    # Pembelian + Midtrans Snap (harga tampil walau backend mati)
│   │   ├── claim/page.tsx       # Klaim kode premium (?code= dari QR kemasan)
│   │   ├── edukasi/page.tsx     # DBD, siklus Aedes, 3M Plus, model risiko, nilam (sumber resmi)
│   │   ├── admin/page.tsx       # Dashboard admin (PIN-protected) + panel Penjualan
│   │   ├── privasi/page.tsx     # Kebijakan Privasi (perbarui bila fitur pengumpul data berubah)
│   │   ├── kredit/page.tsx      # Kredit foto (Wikimedia Commons, wajib untuk CC BY-SA) & sumber data
│   │   ├── not-found.tsx, error.tsx  # 404 & galat render yang dirancang
│   │   ├── layout.tsx           # Root layout (font Geist, metadata/PWA, BottomNav, Toaster)
│   │   └── globals.css          # Token design system + Tailwind v4 theme
│   │
│   ├── components/
│   │   ├── Navbar.tsx           # Header global (logo, menu ≥ 768 px, tombol Beli)
│   │   ├── BottomNav.tsx        # Navigasi bawah < 768 px (disembunyikan di /checkout & /admin)
│   │   ├── Footer.tsx           # Footer global
│   │   ├── ui/                  # Design system: HeroHalaman, tombol, bidang (form), Catatan, Dialog, KartuLabel, Akordion, AngkaNaik,
│   │   │                        #   useTerlihat, CentangBerhasil, Ornamen (motif pucok reubong)
│   │   ├── SkalaRisiko.tsx      # Gauge risiko setengah lingkaran, pengali faktor, cuaca terdekat, sumber BMKG
│   │   ├── RisikoHariIni.tsx    # SkalaRisiko + fetch untuk Beranda; beranda/ChipRisiko.tsx = kartu kecil di hero
│   │   ├── IkonCuaca.tsx, NyamukIlustrasi.tsx  # Ikon cuaca BMKG; ilustrasi 404/galat
│   │   ├── RantaiNilam.tsx      # Rantai ampas nilam → Patchmos (6 simpul bergambar, garis emas)
│   │   ├── BuktiUji.tsx         # Uji persepsi (sudah) vs uji lab (direncanakan)
│   │   ├── PanelKlaim.tsx, ClaimModal.tsx  # Klaim kode: ketik / pindai QR / unggah foto
│   │   ├── beranda/, edukasi/, pantau/  # Pulau client khusus halaman (BagianKlaim, ChipRisiko, SiklusAedes,
│   │   │                        #   SimulatorRisiko, TrenIklim, ChecklistPencegahan)
│   │   └── admin/SalesPanel.tsx # Panel penjualan online + offline
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client init (CRITICAL — was gitignored, now fixed)
│   │   ├── risiko.ts            # Tipe & helper /api/mosqrisk, kategori, simpan lokasi; lokasi.ts = hook lokasi tersimpan
│   │   ├── rumus.ts             # Parameter rumus dari backend/rumus_risiko.json (simulator & grafik /edukasi)
│   │   ├── produk.ts            # Harga & ongkir dari backend/produk.json (di-inline saat build)
│   │   ├── edukasi.ts, foto.ts  # Isi kesehatan bersumber (dipakai /edukasi & /pantau); foto + kredit
│   │   ├── premium.ts, klaim.ts # Status Premium (localStorage) & klaim kode
│   │   ├── tim.ts               # Data tim (05_FAKTA §1) + nama berkas foto
│   │   └── fotoTim.ts           # (server) cari foto tim & potongan wajah public/tim/wajah/
│   │
│   ├── public/                  # Aset statis
│   │   ├── brand/               # Logo, tanda daun, render produk ASLI (jangan diedit)
│   │   ├── foto/                # Foto WebP (nyamuk, siklus Aedes, nilam, genangan) — kredit di lib/foto.ts
│   │   ├── ikon/                # Favicon/ikon PWA (tanda daun asli di latar kertas)
│   │   ├── tim/                 # (dibuat tim) foto anggota & tim/produksi/ dokumentasi
│   │   ├── regency_to_adm4.json # Mapping kota → kode ADM4 BMKG
│   │   └── manifest.json        # PWA manifest
│   │
│   └── next.config.ts           # PWA + API rewrites + env dari backend/produk.json & backend/rumus_risiko.json
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
| `GET` | `/api/mosqrisk?adm4=XX` | — | Prakiraan BMKG → indeks rumus v4 (100 × S_suhu R0 Mordecai × S_kelembapan × S_hujan) dari **rata-rata harian** hari ini, `risk_factors` (pengali 0–1), `basis`, `current` (record per 3 jam terdekat), `location`, `trend` 3 hari (skor + ringkasan cuaca + `weather_desc`) |
| `GET` | `/api/climate-trend?lat=&lon=` | — | Tren skor risiko 12 bulan (Open-Meteo) |
| `GET` | `/api/stats` | — | Jumlah laporan & subscriber (angka asli; `impact_kg` karangan sudah dihapus) |
| `POST` | `/api/reports` | `Report(locationName, reportType ∈ JENTIK/DBD/LAINNYA, description)` | Kirim laporan baru + email ke pelanggan di wilayah yang sama (`lokasi_cocok()`) |
| `POST` | `/api/subscribe` | `Subscriber(locationName, email)` | Daftar notifikasi email + welcome email |
| `POST` | `/api/claim` | `ClaimRequest(code)` | Validasi kode premium kemasan (update atomik) |
| `GET` | `/api/produk` | — | Harga (`HARGA_PER_BOTOL`), maks per pesanan, `pengiriman` (antar/ambil + ongkir), mode Midtrans, URL Snap, client key |
| `POST` | `/api/payment/token` | `PaymentRequest(name, phone, address?, delivery ∈ antar/ambil, quantity, expectedTotal?)` | Catat pesanan ke `orders` → token Snap. Total = jumlah × harga + ongkir, dihitung server; alamat wajib hanya untuk `antar` |
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

## 🎨 Design System & Visual Rules (v2 "Kebun Nilam Aceh" — 2026-11-07)
**Wajib baca `.claude/skills/mosqrisk-design/SKILL.md` sebelum menyentuh UI.** Ringkasnya:
- v1 (krem + serif + sudut 2 px, tanpa foto/gerak) dinilai user kosong & kaku. v2: dasar putih, bidang `hutan`
  #0C2617 untuk momen penting, `kemasan` #154127, `foil` #E4AE3C, `kertas` #EDF3EC — tidak ada hex baru di komponen.
- Font: satu keluarga **Geist** (sejak 2026-11-09, pilihan user; sebelumnya Plus Jakarta Sans). Judul 800, tracking rapat,
  tanpa titik akhir. Angka `angka`.
- Kepala halaman: Beranda punya hero sendiri (satu layar penuh); halaman lain memakai `components/ui/HeroHalaman.tsx`
  (hutan penuh sampai belakang navbar kapsul, foto daun nilam, label kapsul, judul besar dengan frasa `.teks-foil`).
- Warna risiko: `--risiko-*` untuk teks, `--risiko-*-isi` (lebih cerah) untuk gauge & bar (`KATEGORI[...].isi`).
- Radius berjenjang: `rounded-media` 28 / `rounded-kartu` 20 / `rounded-kontrol` 12 / `rounded-full`.
  Bayangan hanya untuk benda melayang (`shadow-angkat`, `shadow-tipis`).
- Foto: `public/foto/` + `lib/foto.ts` (Wikimedia Commons, kredit wajib di keterangan & `/kredit`). Bukan foto orang
  untuk tim/testimoni. Aset `public/brand/` apa adanya.
- Gerak: satu urutan masuk di hero, "terisi sekali saat terlihat" (gauge, angka, rantai), dan gerak yang menjawab aksi
  (tab, akordeon, pilihan, dialog). Hormati `prefers-reduced-motion`. Ikon Phosphor (`*Icon`), duotone untuk ikon fitur.

## ⚙️ Technical Notes & Known Constraints

### Supabase & RLS
- RLS (Row Level Security) aktif di semua tabel Supabase.
- Frontend menggunakan **Anon Key** (read publik terbatas).
- Backend menggunakan **Service Role Key** (bypass RLS untuk admin CRUD).
- Semua operasi tulis/hapus admin **HARUS** melalui backend FastAPI.

### Midtrans Integration & Penjualan
- Snap JS dimuat **hanya di `/checkout`**; URL sandbox/produksi dan client key datang dari `GET /api/produk` (mengikuti `MIDTRANS_IS_PRODUCTION` di backend). Tidak ada lagi script Snap di `layout.tsx`.
- Harga & ongkir: satu sumber `backend/produk.json` (Rp20.000, SEMENTARA; ongkir antar Banda Aceh/Aceh Besar & ambil sendiri = Rp0, SEMENTARA). Backend memuatnya ke `HARGA_PER_BOTOL`; `frontend/next.config.ts` membacanya saat build (env `PRODUK_*` → `lib/produk.ts`) sehingga harga tampil walau backend mati. Ganti harga = edit file itu lalu deploy ulang.
- Alur: `/api/payment/token` mencatat pesanan ke tabel `orders` → token Snap (dengan `callbacks.finish` = `SITE_URL/checkout`) → `window.snap.pay()` → `/api/payment/status` (server bertanya ke Midtrans). Pembeli yang kembali dari aplikasi e-wallet mendarat di `/checkout?order_id=…` dan statusnya dicek otomatis. Webhook: `/api/payment/notification` (atur Notification URL di dashboard Midtrans).
- Penjualan offline dicatat admin di `/admin` (panel Penjualan) ke tabel `orders` yang sama.
- Selama sandbox, checkout menampilkan label "mode uji coba" dan pesanan ditandai `is_test`. Kalau tabel `orders` belum ada,
  token pembayaran ditolak 503 dengan petunjuk menjalankan migration Fase 1 (hanya di mode uji coba).
- Ambil sendiri: kolom `address` diisi "AMBIL SENDIRI — …"; ongkir tidak butuh kolom baru (total − jumlah × harga satuan).
- Tabel `orders` dibuat oleh `supabase/migrations/20261106120000_fase1_rls_orders.sql` (dijalankan manual oleh tim).

### PWA
- Dikonfigurasi via `@ducanh2912/next-pwa` di `next.config.ts`.
- Manifest di `public/manifest.json`.
- Disabled saat development (`NODE_ENV === "development"`).

### Build & Deploy
- Next.js 16 tidak lagi menjalankan lint saat build (opsi `eslint` dihapus dari config).
- `typescript.ignoreBuildErrors` **dimatikan** sejak 2026-11-07 (`npx tsc --noEmit` = 0 error) — build gagal kalau ada error tipe baru.
- API rewrites: Development → `127.0.0.1:8000`, Production → rewrites ke diri sendiri (perlu backend terpisah).

## ✍️ Guidelines untuk AI Agent

1. **JANGAN** pernah menulis ke SQLite (`reports.db`). Selalu gunakan Supabase.
2. **JANGAN** menghapus komentar atau docstring yang sudah ada kecuali diminta user.
3. **JANGAN** memindahkan atau menghapus `frontend/lib/supabase.ts` — file ini sempat hilang dari git karena `.gitignore`, sudah diperbaiki.
4. **Selalu** gunakan token & komponen dari `.claude/skills/mosqrisk-design/SKILL.md` — jangan warna generik atau hex baru.
5. **Validasi lokasi**: Nama kota sering berbeda antara sumber data. Backend `clean_loc()` sudah menangani standardisasi.
6. **Aksi sensitif**: Semua aksi yang mengubah state global (hapus data, broadcast) harus divalidasi di backend, bukan hanya di frontend.
7. **Warna**: sudah dipindah ke token CSS di `globals.css` (Fase 3). Jangan menambah warna hardcode baru (pengecualian terdokumentasi: grafik recharts).
8. **Premium check**: status premium disimpan di `localStorage` (`lib/premium.ts`, kunci `isPremium`). Known limitation — belum ada validasi server-side.

## 📌 Aturan Tetap Proyek (update 2026-11-06)
1. **Tanpa atribusi AI** di commit/PR (tanpa `Co-Authored-By`, tanpa footer "Generated with"). Jangan `git push`, deploy, atau mengubah env Vercel tanpa izin eksplisit user.
2. **Fakta & klaim** hanya dari `docs/expo/05_FAKTA_TERVERIFIKASI.md`. Dilarang mengarang testimoni, angka, hasil uji, atau afiliasi resmi (Kemenkes/BMKG/BPOM).
3. **Data Supabase**: jangan mengubah/menghapus baris apa pun (termasuk kode premium demo, laporan, subscriber). Perubahan skema/RLS hanya lewat file migration yang di-review & dijalankan user.
4. **Rahasia**: jangan membaca file `.env`; rujuk nama variabel dari `.env.example` atau dokumentasi.
5. **Harga**: `Rp20.000/botol` bersifat SEMENTARA, satu konstanta, tanpa paket bundling.
6. **Bahasa & verifikasi**: teks UI berbahasa Indonesia; perubahan UI wajib diverifikasi dengan screenshot desktop (1440) & mobile (390) sebelum dinyatakan selesai.
7. **Rencana & log**: `docs/expo/01_ROADMAP.md` (rencana), `docs/expo/PROGRESS.md` (log, perbarui di akhir setiap fase).
