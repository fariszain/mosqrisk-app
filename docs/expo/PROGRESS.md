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

## ⚠️ MENDESAK (diperbarui 2026-11-07 sore): Supabase sudah hidup, tetapi migration Fase 1 BELUM dijalankan

Project **MosqRisk123** (`pvegqhvorlkfrnwovolo`) sudah *ACTIVE_HEALTHY* lagi (dicek lewat Supabase MCP, baca saja).
Tabel yang ada: `reports`, `subscribers`, `premium_codes` — **tabel `orders` belum ada**. Akibatnya checkout
Midtrans (sandbox) menolak membuat transaksi (503) dan panel Penjualan di admin kosong, padahal sebelum Fase 1
Midtrans "jalan". Solusi (1 langkah, oleh user): buka Supabase → SQL Editor → jalankan isi
`supabase/migrations/20261106120000_fase1_rls_orders.sql`. Migration itu juga menutup celah RLS dari Fase 1.
Selama tabel belum ada, checkout mode uji coba menampilkan pesan yang menyebut migration ini.

### (arsip) temuan 2026-11-06: database Supabase tidak bisa dijangkau

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

## 2026-11-09 (lanjutan) — Fase 3e — Geist, hero satu layar, gaya gabungan di semua halaman

- **Font Geist** (pilihan user dari 4 contoh: `.screenshots/fase-3c/pilihan-font.png`) lewat `next/font/google`; /kredit diperbarui.
- **Navbar**: logo & tulisan PATCHMOS ±25% lebih kecil; menu semibold lebih gelap, menu aktif kapsul hijau tua.
- **Warna "sedang"**: cokelat #8A5A00 (dinilai user terlalu tua) → teks #A94E0A di latar #FFF3E0 (kontras 5,1:1);
  gauge & bar memakai token baru `--risiko-*-isi` (sedang #EE9B2F, tinggi #D9483B, rendah #3F8F55).
- **Beranda**: hero = tinggi satu layar (diuji 1440×900, 1920×1080, 1366×768, 390×844 — bawah hero = tinggi layar);
  produk `object-contain` mengisi sisa tinggi; kartu kecil diposisikan dari tengah. Panel produk tanpa foto marmer
  tempelan (dinilai user "aneh"). Kartu "Dibuat lima mahasiswa" memakai foto wajah asli.
- **Foto tim**: Sofia diperkecil + ruang latar di atas kepala (diperpanjang dari baris teratas foto) agar posisi kepala
  ±28% & lebar bahu ±62% seperti Rafi/Talha. Potongan wajah 192 px di `public/tim/wajah/` untuk avatar.
- **Semua halaman lain** (/pantau, /lapor, /edukasi, /checkout, /claim, /tim, /kredit, /privasi) memakai kepala hutan
  bergaya hero Beranda (`components/ui/HeroHalaman.tsx`; /pantau versi sendiri karena panel wilayahnya).
- Verifikasi: tsc 0; eslint hanya 3 temuan lama (checkout 137/178, pantau 172); overflow 0 px di 1440 & 390 untuk 9
  halaman; galat konsol hanya log CSP Snap di /checkout (sudah ada sebelumnya). Galeri: `.screenshots/fase-3c/galeri-hal-*.png`.

## 2026-11-09 — Fase 3d — Beranda "gabungan" (energi web lama + aset & sistem v2)

User merasa web lama (Vercel) lebih "wah" di pandangan pertama. Beranda diubah (hero + bagian 2), halaman lain belum:
- Hero hijau hutan penuh sampai belakang navbar kapsul, foto daun nilam, judul raksasa di tengah dengan frasa
  "ampas nilam Aceh" emas bergradasi (`.teks-foil`), tombol kapsul foil + terang, render produk melayang bercahaya,
  kartu kecil miring (skor risiko live, harga, "Tanpa DEET"; di HP chip risiko di bawah produk).
- "Tiga langkah" jadi kartu berwarna lembut dengan angka besar bergradasi 01/02/03 (`.angka-langkah`), judul kiri.
- Cadangan Beranda sebelum perubahan disimpan di scratchpad sesi (bukan di repo); versi itu juga ada di
  screenshot `.screenshots/fase-3b/beranda-1440-layar.png`. Perbandingan: `.screenshots/fase-3c/perbandingan-hero.png`.
- Foto Sofia diganti foto setengah badan (dipotong 4:5 dari foto user).
- Verifikasi: tsc 0, eslint page.tsx bersih, overflow 0 px di 1440 & 390.

## 2026-11-07 (malam) — Fase 3c — Rumus risiko v4 (R0 Mordecai), navbar kapsul, foto tim, logo tulisan

**Dikerjakan**
- **Rumus v4** (user: "rumus sebenar-benarnya yang fix dan pasti"): indeks = 100 × S_suhu × S_kelembapan × S_hujan.
  S_suhu = R0(T) Mordecai 2017 *Ae. aegypti* (8 kurva sifat dari S2 Text Tabel B, dihitung di backend & `lib/rumus.ts`);
  kelembapan & hujan = pengali 0–1 berlabel "asumsi tim". Detail & angka: 05_FAKTA §5. `risk_factors` kini
  `{nilai}` (bukan `{poin, maks}`); kartu faktor /pantau, simulator & kartu rumus /edukasi, FAQ Beranda ikut diganti.
  Grafik 12 bulan memakai rumus yang sama (pengali angin dihapus).
- Koreksi: v3 menyebut bobot 40/25/35 "sama dengan proposal" — keliru (berasal dari kode lama). Slide PIKU
  (slide 13/17) memuat tabel 40/30/30 bertingkat yang tidak pernah dipakai di kode.
- Navbar jadi kapsul putih melayang; tulisan "PATCHMOS" serif dari `brand/patchmos-logo.png` (dipotong lewat CSS,
  file tidak diedit). Tombol Beli kapsul (`rounded-full!` — `rounded-kontrol` bawaan tombol menang urutan CSS).
- Foto 5 anggota tim dari slide PIKU → `public/tim/*.webp` (±620×860 px); kartu tim jadi potret 4:5.

**Verifikasi**: uji backend 40/40 (termasuk parameter = Tabel B, puncak 29,0 °C, nol di atas 34,6 °C, perkalian
10 °C → 0); `tsc` 0 error; screenshot navbar & /tim 1440/390.

**Perlu dari tim**
- Perbarui slide: tabel rumus 40/30/30 → rumus v4; "machine learning" & "data Kemenkes" (slide 5/15) → rumus dari
  prakiraan BMKG; "PERINGATAN DINI KEMENKES" di mockup notifikasi (klaim terlarang §6); paket 2/3/10 & 1/2/3 botol
  (slide 5/6) vs satu harga; Rp12.000 (slide 6) vs Rp20.000 di web; kemasan 100 mL vs botol 50 mL.
- Tinjau asumsi pengali kelembapan & hujan dan batas kategori 75/50 bersama dosen pendamping.

## 2026-11-07 (sore) — Fase 3b — Desain v2 "Kebun Nilam Aceh", rumus risiko v3, ongkir
- Pemicu (user): tampilan Fase 3 "terlalu kosong, monoton, kaku, tanpa animasi/interaksi/gambar, kayak orang baru
  belajar bikin web" → minta referensi desain profesional dari banyak sumber, menarik tapi "jangan lebay".
  Sekaligus: Supabase sudah dihidupkan; kemasan pakai yang ada; ongkir "pikir saja gimana bagusnya"; foto yang
  dihapus boleh dipakai ("yang penting menarik"); rumus skor dibantu "agar sesuai dan benar"; Midtrans cukup sandbox.
- Riset: tangkapan layar Seed, Aesop, Ritual, Sandland, IQAir, Sensatia, Javara (Kinfield sudah tutup) + skill
  frontend-design. Diagnosis: v1 jatuh ke pola "krem + serif + garis rambut + radius 0" yang khas halaman buatan AI.
- Dikerjakan:
  - **Design system v2** (`globals.css`, SKILL.md ditulis ulang): dasar putih + bidang `hutan`, satu keluarga Plus
    Jakarta Sans 800, radius berjenjang, bayangan hanya untuk benda melayang, ornamen *pucok reubong* (motif Aceh),
    gerak hemat (urutan masuk hero, gauge/angka/rantai "terisi sekali", gerak yang menjawab aksi).
  - **Foto**: 8 foto Wikimedia Commons (CDC/Gathany domain publik; Fedaro, Kenraiz, Raflinoer32 CC BY-SA) +
    3 foto lama dipulihkan sesuai izin user (nilam dipotong supaya botol merek lain tidak tampak) → `public/foto/*.webp`
    (total ±1 MB), kredit di `lib/foto.ts`, keterangan foto, dan halaman baru `/kredit`.
  - **Semua halaman dirombak**: Beranda (hero produk di panel daun + chip risiko live, foto nyamuk + statistik,
    3 langkah, gauge, rantai nilam bergambar, tabel fakta produk, bukti, klaim, tanya-jawab akordeon, tim),
    `/pantau` (kepala dasbor, gauge, checklist 3M Plus per hari, prakiraan 3 hari berikon cuaca, kunci Premium
    buram), `/edukasi` (siklus *Aedes* interaktif berfoto, 3M Plus berikon, **simulator rumus** + kurva, grafik
    12 bulan), `/checkout` (3 langkah, pilihan pengiriman, ringkasan sticky), `/lapor`, `/tim`, `/claim`,
    `/privasi`, 404/galat (ilustrasi nyamuk), admin & panel penjualan, navigasi, footer.
  - **Rumus risiko v3** (`backend/rumus_risiko.json`, satu sumber untuk backend + simulator): suhu trapesium
    18–26–29–34 °C (Mordecai 2017), kelembapan linear 40→80% (Schmidt 2018; batas = pilihan model), hujan
    10→35 poin (0→5 mm), 35 sampai 50 mm, turun ke 20 di 100 mm (BMKG + Benedum 2018). Dihitung dari rata-rata
    harian (bukan satu record 3 jam) → skor tidak naik-turun siang/malam; dataran tinggi terbaca lebih rendah.
    Bobot & kategori tetap seperti proposal. Detail & contoh: 05_FAKTA §5.
  - **Ongkir**: diantar (Banda Aceh & Aceh Besar) atau ambil sendiri (sekitar USK), keduanya gratis di
    `produk.json`; backend menagih `ongkir` sebagai item Midtrans bila > 0; alamat hanya wajib untuk diantar.
  - Admin: harga satuan memakai `produk.json` saat API gagal (dulu "–"). Checkout mode uji coba menyebut
    migration saat tabel `orders` belum ada.
  - Lint: temuan baru dari kode baru diperbaiki (`useSyncExternalStore` untuk localStorage, dll.); total 8 → 7.
  - "2 Issues" di Firefox user (/edukasi) tidak bisa direproduksi di Chromium maupun Firefox Playwright yang
    bersih; kode hanya `console.error` di error.tsx → kemungkinan terbawa dari halaman lain/ekstensi.
- Bukti verifikasi: backend `test_backend.py` **38/38** (rumus kontinu tanpa lompatan, contoh angka, rata-rata
  harian, ongkir & ambil sendiri, Σ item Midtrans = gross_amount, fail-closed rumus/produk); `npx tsc --noEmit` 0;
  `npm run build` sukses (13 route); ESLint 7 temuan lama; Playwright interaksi **49/49** (endpoint tulis
  dipalsukan karena Supabase hidup — tidak ada baris yang ditambah); screenshot 1440 & 390 semua halaman tanpa
  scroll horizontal → `.screenshots/fase-3b/`.
- Commit: belum (user yang commit). Usulan pembagian: (1) `backend/rumus_risiko.json` + `main.py` (rumus v3,
  ongkir) — file baru wajib ikut; (2) design system & komponen (`globals.css`, `components/ui/*`, layout); (3) halaman;
  (4) foto `public/foto/` + `lib/foto.ts` + `/kredit`; (5) dokumen (AGENTS, SKILL, FAKTA, PROGRESS).
- Menunggu user: jalankan migration Fase 1 (mendesak, lihat atas); konfirmasi ongkir gratis; tinjau rumus v3 bersama
  tim/dosen; foto tim asli ke `public/tim/`.

## 2026-11-07 — Fase 3 — Redesign seluruh halaman + /tim + perbaikan checkout & harga
- Keputusan: C5 **didelegasikan user** ("kalau menurutmu masih AI slop, sesuaikan") → dipakai rekomendasi
  A "Label Apotek Botani" + modul indikator risiko (B) + modul rantai nilam (C). Commit tetap dikerjakan user.
- Pemicu sesi: checkout menampilkan "Harga tidak dapat dimuat" karena backend lokal (uvicorn :8000) mati
  setelah sesi sebelumnya berakhir — bukan bug kode, tetapi halaman memang tidak tahan backend mati.
- Dikerjakan:
  - **Harga satu sumber yang tahan backend mati**: `backend/produk.json` dibaca `main.py` (menagih) dan
    `next.config.ts` saat build (env `PRODUK_*` → `lib/produk.ts`). Harga Rp20.000 tampil walau API mati;
    pembayaran tetap dinonaktifkan dengan pesan jelas + email pemesanan. Tervalidasi: bundle produksi berisi
    `Number("20000")`.
  - **Backend**: `skor_faktor()` (refaktor tanpa mengubah hasil — diuji 448 kombinasi), `/api/mosqrisk` kini
    mengirim `risk_factors`, `forecast_time`, `timezone`, `location`, `weather_desc`; memilih record BMKG
    **terdekat dengan waktu akses** (dulu record pertama hari itu, bisa berselisih jam); `trend` punya
    `date`/`risk_status`/`records`; token Snap memakai `callbacks.finish = SITE_URL/checkout`.
  - **Design system**: token di `globals.css`, Libre Caslon Text + Plus Jakarta Sans, Phosphor (satu
    keluarga), komponen `components/ui/*`, `SkalaRisiko`, `RisikoHariIni`, `RantaiNilam`, `BuktiUji`,
    `PanelKlaim`, `Dialog` (`<dialog>` bawaan). Aturan final: `.claude/skills/mosqrisk-design/SKILL.md`.
  - **Halaman**: Beranda (Server Component, risiko live, bukti, rantai nilam, klaim, tim), **/tim baru**
    (anggota + dosen, foto otomatis dari `public/tim/`, cara Patchmos dibuat, hasil uji, kontak), /pantau,
    /checkout, /lapor, /edukasi (Server Component + grafik), /claim, /admin + SalesPanel, /privasi,
    **404 & error.tsx baru**. Navbar/BottomNav/Footer/ClaimModal baru.
  - **Checkout**: foto & fakta produk, stepper + input jumlah yang tidak tereset saat diketik, galat per
    field + fokus, bar bayar di HP (BottomNav disembunyikan), kembali dari e-wallet `?order_id=` → status
    dicek otomatis, dialog hasil dengan nomor pesanan + salin + "Cek status lagi", referensi Baymard
    (total terlihat sejak awal, field sesedikit mungkin).
  - **Perbaikan lain**: GPS tidak lagi diminta otomatis saat halaman dibuka (/pantau, /edukasi); melihat
    wilayah lain tidak lagi diam-diam memindahkan notifikasi email (kini tombol eksplisit); pemindai QR
    menjelaskan galat kamera (dulu kotak hitam), satu pindaian = satu klaim, modal bisa ditutup Escape,
    tidak lagi melempar ke Beranda; favicon default Next.js/Vercel & ikon PWA siluet generik diganti tanda
    daun asli; opsi `eslint` (dihapus di Next 16) dibuang dari config; `typescript.ignoreBuildErrors`
    dimatikan (tsc 0 error, baseline Fase 1: 35).
  - **Edukasi bersumber**: gejala & tanda bahaya (WHO), siklus *Aedes* (CDC), 3M Plus (Kemenkes) — dicatat
    di `05_FAKTA §7` dengan tanda PERLU DICEK TIM. Tabel rumus menampilkan aturan apa adanya, termasuk dua
    keanehan rumus yang menunggu keputusan tim.
  - **Bersih-bersih**: hapus `/design-lab`, `template.tsx` (animasi transisi), `RevealOnScroll`,
    `SlidingAuthCard`, 22 aset tak terpakai di `public/` (termasuk `test.html` yang ikut ter-publish, foto
    nilam yang menampilkan **produk lain** "Patchouli Distillate", foto nyamuk stok tanpa lisensi jelas,
    `logonavbar.png` versi lama), paket `framer-motion`, `leaflet`, `react-leaflet`, `@types/leaflet`
    (tidak pernah dipakai), `phosphor-icons` lama; CDN Material Symbols & font Geist dihapus.
- File: lihat `git status` (≈ 15 file diubah besar, 20+ file baru, 30 file dihapus). Dokumen: AGENTS.md,
  README.md, 01_ROADMAP (C5), 05_FAKTA (§3, §5, §7), SKILL.md baru.
- Bukti verifikasi:
  - `npx tsc --noEmit` → **0 error**; `npm run build` sukses **dengan validasi tipe aktif** (semua rute statis
    kecuali `/claim`). Tampilan Premium /pantau dicek (kartu "Hari ini" dicocokkan dengan tanggal lokal).
  - Backend: 21/21 uji (`test_backend_fase3.py`, BMKG/Supabase/Midtrans dipalsukan): harga dari
    produk.json, rumus tak berubah, record terdekat, hujan = daftar tanggal lokal hari ini, field baru,
    `callbacks.finish`, 409/422, produk.json tidak valid → hanya penjualan 503 (skor risiko tetap 200).
  - Playwright 33/33 uji interaksi: harga tampil saat `/api/produk` diputus, stepper/validasi/fokus,
    `?order_id=` + Escape, modal klaim (huruf besar, galat, tab pindai tanpa kamera), `/claim?code=`,
    ganti wilayah → tersimpan → dipakai Beranda, lapor, PIN admin salah, 404, BottomNav, grafik & tautan
    sumber, tautan "Langsung ke konten".
  - Screenshot 1440 & 390 semua halaman di `.screenshots/fase-3/` (0 px scroll horizontal; error konsol
    hanya log CSP milik Snap Midtrans dan status 404 pada halaman 404). Dasbor admin difoto dengan respons
    API palsu di browser uji (tidak ada data yang ditulis).
  - Grep klaim: sisa kemunculan hanya negasi jujur ("bukan uji klinis", "bukan machine learning",
    "tidak disebut 100% alami"), Kemenkes sebagai sumber, label kontak "Nomor HP / WhatsApp".
  - ESLint (`npx eslint app components lib`): 8 temuan, semuanya `react-hooks/set-state-in-effect`
    (pola muat-data/baca-localStorage saat mount; peringatan performa, bukan bug). Sebelumnya 42 error
    (`eslint-results.txt` lama). Rapikan di Fase 5 dengan `useSyncExternalStore` bila sempat — lint tidak
    lagi menghambat build di Next 16.
- **Reviewer independen** (subagent, konteks bersih): 0 temuan tinggi, 4 sedang, 4 rendah — semua diperbaiki:
  1. Pindai QR bisa mengklaim berulang (kamera menyala lagi setelah jeda) → kode yang sama diabaikan, kode
     terisi ke tab Ketik untuk coba ulang.
  2. Beberapa detail kesehatan tidak ada di halaman sumber yang ditautkan (CDC "±5 hari"/"2–3 hari", WHO
     "3–7 hari", Kemenkes "seminggu sekali"/kawat kasa/gotong royong) → dihapus; 3M bersumber
     ayosehat.kemkes.go.id; ditambah onset 4–10 hari (ada di WHO). 05_FAKTA §7 diperbarui.
  3. `produk.json` hilang/rusak mematikan seluruh API → kini hanya `/api/produk`, token pembayaran, dan
     catat penjualan yang 503. **Pastikan `backend/produk.json` ikut di-commit** (file baru).
  4. Respons lambat bisa menimpa pilihan wilayah yang lebih baru → penghitung permintaan (pantau, Beranda, tren).
  5. Tombol "Buka pantauan risiko" di modal tidak menutup modal → `onSelesai`.
  6. Menjelang tengah malam "hujan hari ini" bisa berisi total hari besok → hujan dari daftar tanggal lokal;
     kartu "Hari ini" dicocokkan dengan tanggal; teks "hari itu".
  7. Pelanggan yang sesi Google-nya habis tidak punya tombol masuk → tombol ditambahkan.
  8. Kode bisa hangus bila browser memblokir penyimpanan → dicek sebelum klaim; cadangan status per sesi.
- Keputusan menunggu user/tim: lihat bagian "Keputusan terbuka" di bawah.
- Usulan pembagian commit (user yang commit):
  1. `backend/produk.json`, `backend/main.py`, `frontend/next.config.ts`, `frontend/lib/produk.ts` — harga satu sumber + API risiko.
  2. `frontend/app/globals.css`, `layout.tsx`, `favicon.ico`, `public/ikon/`, `public/manifest.json`, `components/ui/*`, `package*.json` — design system.
  3. `components/{Navbar,BottomNav,Footer}.tsx`, `not-found.tsx`, `error.tsx` — kerangka global.
  4. Beranda + `/tim` + komponen `SkalaRisiko`, `RisikoHariIni`, `RantaiNilam`, `BuktiUji`, `beranda/`, `lib/{risiko,tim}.ts`.
  5. `/checkout`; 6. `/pantau`; 7. `/lapor`; 8. `/edukasi` + `edukasi/TrenIklim.tsx`; 9. klaim (`PanelKlaim`, `ClaimModal`, `/claim`, `lib/{klaim,premium}.ts`);
  10. `/admin` + `SalesPanel`; 11. `/privasi`; 12. penghapusan (`design-lab`, `template.tsx`, aset `public/`); 13. dokumen.

### Keputusan terbuka (per 2026-11-07)
1. **Supabase masih NXDOMAIN** (dicek lagi 2026-11-07) → restore project, lalu jalankan migration C4.
2. **Ongkos kirim** pesanan online: sekarang tertulis "Pengiriman: diatur tim lewat nomor HP-mu".
3. **Render kemasan** masih "100 mL" (web: 50 mL) dan memuat ikon "Safer Skin" (klaim keamanan yang belum diuji).
4. **Foto**: anggota → `frontend/public/tim/<nama-berkas-di-lib/tim.ts>.jpg`; produksi → `public/tim/produksi/`.
5. **Rumus**: hujan 0,1–0,4 mm = 5 poin (lebih rendah dari 0 mm = 10) dan kelembapan 59% = 9,8 vs 60% = 0.
6. **05_FAKTA §7** (info kesehatan) perlu dicek anggota/dosen yang paham kesehatan.
7. **Midtrans produksi**: Notification URL, `SITE_URL`, dan cek apakah aktivasi butuh halaman syarat &
   ketentuan/pengembalian dana (isinya keputusan bisnis tim — belum dibuat).
8. Skrip lama di root (`fix_dots.py`, `remove_bg.py`, `render_*.js`, `test_svg.py`, `scripts/*spray*`)
   masih merujuk aset yang sudah dihapus — aman dihapus kalau tidak dipakai lagi.

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
