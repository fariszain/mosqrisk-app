# Log Progres — diisi Claude Code di akhir setiap fase/sesi

Format setiap entri (terbaru di atas):

```
## YYYY-MM-DD — Fase <n> — <judul singkat>
- Dikerjakan: <ID roadmap + ringkasan>
- File berubah: <daftar>
- Bukti verifikasi: <perintah + hasil ringkas, path screenshot>
- Commit: <hash pendek — pesan>
- Keputusan menunggu user: <C1..C5 / lainnya>
- Langkah berikutnya: <apa yang dikerjakan sesi berikut>
```

---

## ⚠️ MENDESAK (temuan 2026-11-06): database Supabase tidak bisa dijangkau

`<project_ref>.supabase.co` (ref yang sama dengan `NEXT_PUBLIC_SUPABASE_URL`) mengembalikan
**NXDOMAIN** — dicek lewat resolver lokal dan DNS publik Google. Penyebab paling mungkin:
project free-tier **di-pause otomatis** karena tidak aktif. Akibatnya, di web live sekarang
laporan warga, langganan email, klaim kode premium, login data admin, dan checkout (pencatatan
pesanan) **semuanya gagal**.

Yang perlu dilakukan:
1. Buka Supabase Dashboard dan pilih project-nya. Kalau statusnya *Paused*, klik **Restore**.
   Project yang di-pause biasanya masih bisa dipulihkan dalam jangka waktu tertentu, jadi
   jangan ditunda.
2. Jangan biarkan project idle menjelang expo. Buka web atau dashboard secara berkala, atau
   pertimbangkan paket berbayar untuk minggu expo.

---

## 2026-11-06 — Fase 2 — Eksplorasi arah desain (berhenti di C5)
- Dikerjakan:
  - Audit 10 masalah tampilan (screenshot `.screenshots/fase-2/before/`).
  - Sampling warna piksel logo & render produk (Python/PIL), kontras WCAG dihitung.
  - Kartu arah A/B/C + kritik diri tertulis di `docs/expo/design-lab.md`.
  - Prototipe hero + section "Bukti" (isi sama di ketiga arah) di `/design-lab/a|b|c`.
  - Dua putaran screenshot-kritik-revisi, lalu lembar perbandingan.
- File baru: `frontend/app/design-lab/{layout.tsx, lab.css, page.tsx, [arah]/page.tsx, _components/ArahA|B|C.tsx}`,
  `docs/expo/design-lab.md`. Route noindex; dihapus setelah Beranda Fase 3.
- Bukti verifikasi:
  - Screenshot 1440 & 390 di `.screenshots/fase-2/prototipe/`, 0 error konsol, tanpa scroll
    horizontal.
  - Lembar: `.screenshots/fase-2/prototipe/lembar-perbandingan.png`.
  - `npm run build` sukses: `/design-lab/a|b|c` ter-prerender.
- Rekomendasi: **A (Label Apotek Botani) sebagai sistem visual**, ditambah modul indikator
  risiko live dari B (Beranda & `/pantau`) dan modul rantai nilam dari C (section ekonomi
  sirkular & `/tim`). Alasan lengkap di `design-lab.md` §6.
- Keputusan menunggu user: **C5, pilih arah desain**.
- Langkah berikutnya (setelah C5): PROMPT 1b di `04_PROMPTS.md` (SKILL.md design system + token
  di `globals.css` + AGENTS.md), lalu Fase 3.

## 2026-11-06 — Fase 1 — Kejujuran klaim, keamanan, harga, penjualan online + offline
- Keputusan user di sesi ini:
  - C1: testimoni diganti uji persepsi.
  - C2: "Model Risiko MosqRisk".
  - C3: jual **online + offline** dalam satu tabel `orders`.
  - Form lapor: kolom nama & kontak dihapus.
  - Commit: **dikerjakan user sendiri** (Claude Code tidak membuat commit).
- Dikerjakan:
  - **1.1** Footer: badge "Terintegrasi Resmi Kemenkes RI & BMKG" diganti atribusi "Sumber
    data" (BMKG API publik, Open-Meteo, Kemenkes 2026 untuk statistik). "Pertama di Indonesia"
    dan "AI" dihapus. Link `#` mati diperbaiki/dihapus.
  - **1.2** Semua email tanpa "KEMENKES" dan tanpa emoji. Pengirim tampil sebagai "MosqRisk".
    Broadcast tidak lagi mengklaim "risiko di daerah Anda TINGGI" (karena terkirim ke semua
    pelanggan). Semua email punya cara berhenti (balas BERHENTI).
  - **1.3** Testimoni rekaan → ringkasan uji persepsi (10 responden, 92,8/94,5/92,5%, label
    "uji persepsi pengguna, bukan uji klinis", uji lab "sedang direncanakan").
  - **1.4** Seluruh daftar roadmap, plus temuan baru:
    - Rating "4.99 dari 2.4k+ pembeli", "Layanan 24/7", "Jaminan Kualitas", "Eksklusif
      Regional Aceh", dan biaya admin karangan di checkout.
    - "Diskon Premium 15%" yang tidak ada logikanya; "Premium selama 30 Hari" yang tidak punya
      masa berlaku.
    - "Estimasi Proteksi 4 Jam" dan "Proteksi 6 jam".
    - "Tidak ada kasus DBD dalam radius 1 km", "potensi lonjakan kasus", "peringatan otomatis".
    - Angka "dampak lingkungan" dari rumus karangan, dihapus juga dari `/api/stats`.
    - Malaria 706.297 → 443.530 (05_FAKTA); "90% pasar" → "sekitar 95%"; "Proyeksi kasus" →
      "data kasus 2025".
    - Patchouli alcohol "terbukti" → "berpotensi (Hikal dkk., 2023)"; "laporan menaikkan skor
      risiko" (tidak benar).
    - Kartu parameter Edukasi disamakan dengan rumus backend (bobot 40/35/25, bukan 40/30/30).
    - "Peringatan Dini Cuaca BMKG H+3" → "prakiraan risiko 3 hari"; "Keluarga Bebas Nyamuk" →
      "Penolak Nyamuk dari Ampas Nilam".
  - **1.5** Semua "AI/Kecerdasan Buatan" untuk skor → "Model Risiko MosqRisk" (UI, metadata,
    `manifest.json`, README).
  - **1.6** Penjualan:
    - Harga **satu konstanta** `HARGA_PER_BOTOL = 20000` di `backend/main.py` (TODO: sementara),
      dibaca frontend lewat `GET /api/produk`.
    - Stepper 1–20 botol; total dihitung **server**. Dulu backend memakai `amount` dari browser,
      jadi bisa bayar Rp1.
    - Pesanan online (nama, HP, alamat) dicatat ke `orders` sebelum token Snap. Status dicek
      server ke API Midtrans (`/api/payment/status`) + webhook `/api/payment/notification`
      (signature diverifikasi).
    - Label "mode uji coba" selama sandbox. Snap hanya dimuat di `/checkout`, URL dari backend.
    - Panel **Penjualan** di `/admin`: ringkasan, form catat penjualan offline, ubah status,
      cek ke Midtrans, export CSV.
    - Tab "Beli Akses" (QR dummy + jeda 1,5 detik → Premium gratis) dihapus.
  - **1.7a** `ADMIN_KEY` fail-closed: kosong → 503, tanpa default `kemenkes123`; PIN dicek
    `compare_digest`.
  - **1.7b** Migration RLS + tabel `orders`: menunggu C4 (langkah di bawah).
  - **1.7c (baru)** Pengerasan endpoint publik:
    - Validasi panjang/format input (laporan, langganan, klaim, pembayaran).
    - Pencocokan lokasi laporan per frasa utuh. Lokasi "a" atau deretan nama kota tidak lagi
      memicu email ke semua orang; tautan dihapus dari email.
    - Klaim kode atomik (satu kode tidak bisa diklaim dua kali bersamaan).
    - Pesan error tidak membocorkan detail server.
  - **1.8** README:
    - Universitas Teuku Umar → USK + PIKU; statistik Beranda; "100% alami"; "Nasional".
    - Fitur yang tidak ada ("tren 7 hari", "radius alert") diperbaiki; skema tabel diperbaiki.
    - AGENTS.md diperbarui (endpoint, env wajib, alur Midtrans & penjualan, tanpa `kemenkes123`).
  - **1.9** Halaman `/privasi` baru:
    - Isinya: data yang dikumpulkan, pihak ketiga (termasuk Google Fonts & svgrepo), cara
      berhenti/hapus.
    - Ditautkan dari footer, checkout, dan lapor. Link "Syarat & Ketentuan" mati dihapus (isinya
      keputusan tim).
  - **Tambahan fungsi:**
    - Grafik Edukasi memanggil `http://127.0.0.1:8000` → relatif, plus `python-dateutil`
      ditambahkan ke requirements. Sebelumnya grafik pasti gagal di produksi.
    - Upload QR dari galeri di modal klaim dulu rusak (`new Image()` tertimpa `next/image`),
      sekarang jalan.
    - Login Google tidak lagi otomatis dianggap berlangganan (perlu klik "Daftar Sekarang").
    - Lokasi bawaan Jakarta di Edukasi diberi label dan tidak disimpan permanen.
- File berubah:
  - `backend/main.py`, `backend/requirements.txt`.
  - `frontend/app/{page, checkout/page, edukasi/page, pantau/page, lapor/page, claim/page,
    admin/page, layout}.tsx`, `frontend/components/{Footer, ClaimModal}.tsx`,
    `frontend/public/manifest.json`.
  - `README.md`, `AGENTS.md`, `docs/expo/{01_ROADMAP, 03_CHATBOT_SPEC, 04_PROMPTS,
    05_FAKTA_TERVERIFIKASI}.md`.
  - File baru: `frontend/app/privasi/page.tsx`, `frontend/components/admin/SalesPanel.tsx`,
    `supabase/audit_rls.sql`, `supabase/migrations/20261106120000_fase1_rls_orders.sql`.
- Bukti verifikasi:
  - **Backend**: 45/45 uji `TestClient` dengan Supabase & Midtrans palsu (tidak menyentuh data
    live). Mencakup:
    - Admin fail-closed, harga server, 409/422.
    - Pencatatan pesanan, status Midtrans (settlement, 404, nominal beda, batal lalu dibayar,
      refund, lewat 24 jam), webhook signature valid/palsu.
    - Penjualan offline, klaim atomik, pencocokan lokasi, tautan dihapus.
  - **Backend live (uvicorn + curl, hanya endpoint tanpa tulis data)**:
    - `ADMIN_KEY` kosong → 503 untuk `kemenkes123`; PIN salah → 401, benar → 200.
    - `/api/produk` → 20000; total Rp1 → 409; jumlah 0/21 → 422.
    - Webhook palsu → 403; grafik iklim jalan (12 bulan).
  - **Migration**: dijalankan 2× di Postgres lokal sementara dengan role tiruan Supabase.
    - Idempoten; data lama utuh.
    - anon/authenticated **ditolak** di keempat tabel; service_role jalan.
    - Constraint `orders` menolak total salah, pesanan online tanpa alamat, status asing,
      order ID ganda.
  - **Frontend**:
    - `npx tsc --noEmit`: 33 error vs **35 baseline**, 0 error baru (sisanya error lama di
      pantau/admin/ClaimModal/next.config).
    - `npm run build` sukses. Sekali gagal sesaat saat mengambil Google Fonts, diulang → sukses.
    - 19/19 uji interaksi Playwright: stepper & total, batas 20, banner uji coba, form kosong
      tidak membuat transaksi, modal tanpa QRIS palsu, klaim rekaan hilang dari Beranda/Footer,
      lapor tanpa nama/kontak, panel Penjualan setelah login, `/privasi`.
  - Screenshot sebelum/sesudah: `.screenshots/fase-1/before|after/` (1440 & 390).
  - Grep kata terlarang (resmi, kemenkes, bmkg, 100%, terbukti, teruji, aman, satu-satunya,
    pertama, whatsapp, AI, kecerdasan): sisa kemunculan hanya atribusi sumber data BMKG/Kemenkes
    (statistik), CSS `100%`, komentar kode, dan label "Nomor HP / WhatsApp".
  - **Review independen** (subagent konteks bersih): tidak ada temuan TINGGI. Temuan
    sedang/rendah sudah diperbaiki (lihat 1.7c, sinkron Midtrans, CSV formula injection, pesan
    422 klaim, `onClose` checkout, sisa klaim edukasi, persetujuan langganan, kebijakan privasi).
- Commit: tidak ada (user yang commit). Usulan pembagian ada di bawah.
- Keputusan menunggu user / tim:
  - **C4**: jalankan migration (langkah di bawah). **Jalankan SEBELUM deploy** kode ini, karena
    checkout butuh tabel `orders`.
  - **Rumus skor punya 2 keanehan**, tidak diubah karena butuh persetujuan:
    - Hujan 0,1–0,4 mm mendapat 5 poin, lebih rendah dari 0 mm (10 poin). Usul: tambah cabang
      `elif precipitation < 0.5: 10`.
    - Kelembapan 59% mendapat 9,8 poin, tapi 60% mendapat 0. Usul: kurva yang menyambung.
  - **Broadcast admin** masih ke semua pelanggan (ISU §3): tetap begini atau ditarget per skor
    wilayah?
  - **Ongkos kirim** pesanan online belum diatur (gratis area tertentu / ditanggung pembeli /
    COD). Teks "Tim akan menghubungi nomor HP-mu untuk pengiriman" perlu kalian sanggupi.
  - **Midtrans produksi**: perlu aktivasi merchant, lalu set `MIDTRANS_IS_PRODUCTION=true` +
    kunci produksi di Vercel. Atur **Notification URL** (sandbox & produksi terpisah) ke
    `https://<domain>/api/payment/notification`.
  - **ADMIN_KEY**: pakai frasa acak panjang (≥ 20 karakter), bukan PIN 6 digit. Tidak ada rate
    limit login admin, padahal kini melindungi HP & alamat pembeli.
  - **Rate limit** endpoint publik (`/api/reports`, `/api/payment/token`) belum ada. Rencananya
    memakai tabel penghitung Supabase yang sama dengan chatbot (Fase 4).
  - **Angka edukasi umum** di `/edukasi` yang belum ada sumbernya di 05_FAKTA: siklus nyamuk
    (~100 telur, 5–10 hari, 2–4 minggu, jam 08–10/16–18) dan gejala (38–40°C, 2–7 hari, fase
    kritis hari ke-3–7). Di Fase 3: beri sumber resmi (WHO/Kemenkes) dan tandai PERLU DICEK TIM,
    atau hapus.
  - **Kemasan**: render masih 100 mL (proposal 50 mL) dan memuat klaim "Safer Skin" & "Natural
    Ingredients". Selaraskan dengan 05_FAKTA & hasil konsultasi BPOM saat artwork diperbarui.
  - **Status Premium** masih di localStorage (known limitation).
- Temuan lain untuk Fase 3/5:
  - Modal klaim tidak bisa ditutup dengan Escape, dan tanpa pesan saat kamera tidak tersedia.
  - Plugin PWA tidak menghasilkan service worker saat build Turbopack (PWA "offline-ready"
    tidak aktif).
  - `last_updated` di `/api/mosqrisk` = waktu request, bukan waktu terbit prakiraan BMKG.
  - Playwright MCP tidak bisa jalan: Google Chrome tidak terpasang. Screenshot dibuat dengan
    Playwright + Chromium bawaan. Agar MCP jalan: `npx playwright install chrome` (butuh sudo),
    atau daftarkan ulang MCP dengan `--browser chromium`.
- Langkah berikutnya: C4 (kamu), C5 (kamu), lalu Fase 2 langkah 8 (PROMPT 1b) dan Fase 3.

### Checkpoint C4 — cara menjalankan migration (dikerjakan user)
1. **Pastikan backend memakai kunci service role.** Jalankan di terminal kamu; perintah ini
   hanya mencetak *role*, bukan kuncinya:
   ```bash
   cd backend && python3 -c "import os,json,base64;from dotenv import load_dotenv;load_dotenv();k=os.environ.get('SUPABASE_KEY','');print('sb_secret_ (OK, kunci rahasia)' if k.startswith('sb_secret_') else 'sb_publishable_ (SALAH: ini kunci publik/anon)' if k.startswith('sb_publishable_') else json.loads(base64.urlsafe_b64decode(k.split('.')[1]+'=='))['role'])"
   ```
   Harus tercetak `service_role` atau `sb_secret_ (OK…)`. Cek juga env `SUPABASE_KEY` di
   Vercel: Supabase Dashboard → Project Settings → API Keys, bandingkan dengan kunci
   *service_role/secret*. Kalau masih anon, **jangan** jalankan migration: klaim, laporan,
   langganan, dan checkout akan gagal.
2. Supabase Dashboard → SQL Editor → jalankan `supabase/audit_rls.sql` (hanya membaca),
   simpan hasilnya.
3. SQL Editor → tempel seluruh `supabase/migrations/20261106120000_fase1_rls_orders.sql` →
   Run. Aman diulang. Tidak mengubah/menghapus baris data.
4. Jalankan lagi `audit_rls.sql`. Pastikan: RLS aktif di 4 tabel, tidak ada hak `anon`/
   `authenticated` di tabel itu, dan `orders` ada.
5. Baru deploy kode Fase 1. Coba: klaim kode demo, kirim laporan uji, dan buka `/admin` →
   Penjualan.
6. Risiko & pemulihan: migration hanya mencabut akses langsung anon (frontend memang tidak
   memakainya) dan menambah tabel baru. Kalau ada yang rusak karena kunci backend ternyata
   anon, perbaikannya adalah mengganti `SUPABASE_KEY` ke service role, bukan membuka lagi
   policy anon.

### Usulan pembagian commit (Fase 1–2, belum di-commit)
Beberapa file tersentuh banyak tugas (mis. `page.tsx`, `edukasi/page.tsx`). Kalau mau commit
per ID, pakai `git add -p`. Kalau tidak, cukup dua commit:
1. `fase-1: kejujuran klaim, keamanan admin, harga & penjualan online+offline, kebijakan
   privasi`: semua file Fase 1 di atas + `supabase/` + docs.
2. `fase-2: prototipe arah desain (design-lab) untuk C5`: `frontend/app/design-lab/`,
   `docs/expo/design-lab.md`.

`.screenshots/` sebaiknya tidak ikut ke git (lihat `00_MULAI_DI_SINI.md` langkah 3, exclude
lokal).

---

## 2026-11-06 — Fase 0 — Persiapan dokumen (dibuat dari sesi Claude di aplikasi, bukan Claude Code)
- Dibuat: `docs/expo/00`–`05`, `PROGRESS.md`; aset merek asli di `frontend/public/brand/`.
- `AGENTS.md`: aturan desain lama (glassmorphism, gradient overlay, dll.) dicabut; ditambah
  "Aturan Tetap Proyek".
- Belum ada perubahan kode aplikasi.
- Keputusan sudah final: harga sementara Rp20.000/botol tanpa bundling; chatbot LLM dengan
  pembatas (disetujui); kode demo & data dummy tidak disentuh; ML tidak dilatih; proposal final.
- Keputusan menunggu: C1–C5 (lihat roadmap), harga final (minggu depan), provider LLM + kartu,
  render kemasan 100 mL → 50 mL.
- Langkah berikutnya: user menjalankan Fase 0 di `00_MULAI_DI_SINI.md`, lalu PROMPT 1.
