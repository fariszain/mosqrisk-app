# Design Lab — Fase 2 (eksplorasi arah desain)

> Dibuat 2026-11-06 oleh Claude Code. Prototipe hidup di route sementara
> `/design-lab/a`, `/design-lab/b`, `/design-lab/c` (noindex, dihapus setelah Beranda Fase 3 selesai).
> Screenshot: `.screenshots/fase-2/`. Keputusan arah = checkpoint **C5** (user).

## 1. Audit tampilan sekarang (setelah Fase 1) — 10 masalah terbesar

Screenshot: `.screenshots/fase-2/before/` (1440×900 dan 390×844).

| # | Masalah | Contoh |
|---|---|---|
| 1 | Layar pertama Beranda tidak menunjukkan produk asli maupun data asli — hanya siluet botol generik (`spray-square.png`) yang dimiringkan, di-blur, dan melayang | Hero `/` |
| 2 | Hero template: teks tengah, satu frasa diwarnai emas, dua tombol pil | Hero `/` |
| 3 | Dekorasi tanpa makna: blob gradien `blur-[120px]`, ikon Material raksasa transparan, animasi `float` tanpa henti | `/`, `/checkout` (versi lama), Footer |
| 4 | "SaaS card kit": semua isi dipotong jadi kartu `rounded-3xl`/`rounded-[2rem]` dengan bayangan sama | Semua halaman |
| 5 | Label ALL CAPS ber-tracking lebar di atas hampir setiap judul; angka tanpa *tabular numerals* | `/pantau`, `/checkout`, `/admin` |
| 6 | Dua sistem ikon (Material Symbols CDN + paket `phosphor-icons` yang tidak dipakai) + emoji di UI (🟢🟡🔴 📅 ⚠️ 🥚🪱🫘🦟 💧🌡️📝); font Geist dimuat tapi tidak dipakai | `/edukasi`, `/lapor`, `layout.tsx` |
| 7 | Palet liar di luar merek: ungu (`purple-200`), merah-oranye gradien, biru Tailwind | Kartu pilar `/`, `/edukasi`, `/admin` |
| 8 | `/pantau` punya data BMKG asli tapi tidak memperlihatkan sumber & waktu pembaruan di kartu skor; *gauge* setengah lingkaran generik; grafik dekoratif palsu saat belum ada lokasi | `/pantau` |
| 9 | Mockup UI palsu: kartu "MOSQ-XXXX" dengan garis scan beranimasi di Beranda | Section klaim `/` |
| 10 | Modal klaim: tidak bisa ditutup dengan Escape; saat kamera tidak tersedia hanya kotak hitam tanpa penjelasan | `ClaimModal` |

## 2. Sampling warna (piksel asli, script Python/PIL, kuantisasi median-cut)

| Sumber | Hex | Catatan |
|---|---|---|
| Logo — daun hijau | `#033111`, `#02360F`, `#01450D` | Hijau sangat pekat (h≈135°, s≈90%, l≈10–14%) |
| Logo — daun emas | `#EEB847`, `#E4AE3C`, `#F5C050` | Emas hangat (h≈41°) |
| Kemasan — permukaan kotak | `#154127`, `#0B321E`, `#052E19` | Hijau kebiruan (h≈145–149°) — dekat token lama `#1A3626` |
| Kemasan — daun nilam | `#516B32`, `#3D4F25`, `#858E53` | Olive |
| Kemasan — garis foil | `#CAC17E` | Emas pucat/khaki (foil tipis di kotak & podium) |

Token lama `#EAC775` lebih pucat dari emas logo; usul: emas utama `#E4AE3C` (sampel).
Semua pasangan teks di bawah ≥ 4,5:1 (WCAG AA) — dihitung, bukan ditebak.

## 3. Kartu arah

### A. Label Apotek Botani
*Sistem visual diturunkan dari kemasan: bidang hijau kotak, garis emas setipis foil, blok "label" berisi fakta.*

- **Token**: kemasan `#154127` · tinta `#0B321E` · foil `#E4AE3C` · kertas `#F1F4EC` (putih bertint daun, bukan krem) · daun `#516B32` · emas-teks `#7A5A12` (5,7:1 di kertas)
- **Tipografi**: *Libre Caslon Text* untuk judul (serif klasik label apotek, sejalan dengan wordmark PATCHMOS yang serif); *Plus Jakarta Sans* untuk teks & UI; angka `tabular-nums`. Skala 1,25 (17 · 21 · 27 · 33 · 42 · 52).
- **Radius & bayangan**: 2px (sudut label cetak), tanpa bayangan; kedalaman dari bidang warna.
- **Signature**: *kartu label* dengan garis foil ganda atas-bawah (meniru kotak) yang memuat fakta produk & status uji — dipakai konsisten untuk komposisi, bukti, dan hasil uji.
- **Gerak (satu momen)**: garis foil "tergambar" melintang saat halaman dibuka (700 ms, sekali).
- **Tidak bisa ditukar karena**: isi label adalah proses Patchmos yang sebenarnya (maserasi etanol 96% → mikroenkapsulasi gelatin + gum arab → spray, tanpa DEET) + status uji yang jujur; bingkainya menyalin kotak fisik yang dilihat juri di meja expo.

```
DESKTOP                                         MOBILE
[logo PATCHMOS]  Pantau  Lapor  Edukasi  [Beli] [logo]            [Beli]
┌──────────────────────── hijau kemasan ─────┐ ┌─ hijau kemasan ──────┐
│ Spray penolak nyamuk dari     [render      │ │ Spray penolak nyamuk │
│ ampas penyulingan nilam Aceh.  produk]     │ │ dari ampas ...       │
│ Bahan aktif alami, tanpa DEET.             │ │ [Beli] Cek risiko    │
│ [Beli Patchmos]  Cek risiko →   ╔═label═╗  │ │   [render produk]    │
│                                 ║fakta  ║  │ │ ╔══════ label ═════╗ │
│                                 ╚═══════╝  │ │ ╚══════════════════╝ │
└────────────────────────────────────────────┘ └──────────────────────┘
```

### B. Instrumen Kesehatan Publik
*Web sebagai alat ukur: layar pertama memperlihatkan skor risiko hari ini, ditarik live dari `/api/mosqrisk` (default Banda Aceh).*

- **Token**: tinta `#033111` (hijau logo) · putih `#FFFFFF` · panel `#EEF2EE` · daun `#516B32` · emas `#E4AE3C` (hanya merek) · risiko: tinggi `#8E1B1B`, sedang `#8A5A00`, rendah `#2E6B3F` (selalu disertai teks)
- **Tipografi**: satu keluarga *Archivo* (variabel lebar): lebar 125% untuk angka skor, 112% untuk judul, 100% untuk teks, 85% untuk label kecil (sentence case). Skala 1,333 + angka hero ±160 px. Semua angka `tabular-nums`.
- **Radius & bayangan**: panel 10px, penanda skor bulat; tanpa bayangan, garis 1px `#D5DDD6`.
- **Signature**: *skala kesesuaian Aedes* 0–100 dengan zona sesuai ambang asli backend (RENDAH < 50, SEDANG 50–74, TINGGI ≥ 75) + rincian poin tiap faktor (suhu 40, hujan 35, kelembapan 25) — model terlihat transparan, bukan kotak hitam.
- **Gerak (satu momen)**: penanda meluncur ke skor live + angka menghitung naik (900 ms, sekali); `prefers-reduced-motion` → langsung tampil.
- **Tidak bisa ditukar karena**: angka di layar adalah data BMKG hari itu untuk Aceh, dihitung dengan formula khusus biologi *Aedes aegypti* yang sama dengan backend; tidak ada merek repellent lain yang punya ini.

```
DESKTOP                                          MOBILE
[logo]  Pantau  Lapor  Edukasi              [Beli] [logo]          [Beli]
Risiko nyamuk DBD hari ini · Kota Banda Aceh     Risiko nyamuk DBD
 93 /100   TINGGI                  [render       hari ini, Banda Aceh
 ├──RENDAH──┼──SEDANG──┼──TINGGI──▲┤  produk]     93 /100  TINGGI
 Suhu 25°C   Kelembapan 91%   Hujan 1,6 mm        ├─────┼────┼──▲┤
 33/40 poin  25/25 poin       35/35 poin          Suhu · Lembap · Hujan
 Sumber: BMKG, diperbarui 10.37 WIB  Patchmos…   Sumber: BMKG 10.37
                                     [Beli]       [render] Patchmos [Beli]
```

### C. Rantai Nilam Aceh
*Halaman sebagai perjalanan material: petani nilam → penyulingan → ampas → Patchmos → pengguna → data MosqRisk.*

- **Token**: tinta `#0B321E` · putih `#FFFFFF` · daun `#516B32` (garis rantai) · ampas `#7A5B3A` (cokelat ampas kering — satu-satunya warna yang tidak disampling dari aset, diambil dari materialnya, hanya dipakai di tahap ampas) · emas `#E4AE3C` · kemasan `#154127` (simpul produk)
- **Tipografi**: *Plus Jakarta Sans* saja (kontinuitas dengan web sekarang & poster berbasis sans; italic untuk penekanan istilah), judul 800 rapat, teks 400; angka `tabular-nums`. Skala 1,25.
- **Radius & bayangan**: 24px hanya pada simpul rantai (organik, seperti daun), garis 2px ujung bulat; tanpa bayangan.
- **Signature**: *garis batang* melengkung (diambil dari tangkai daun di logo) yang menjahit enam simpul rantai; penomoran sah karena urutannya nyata.
- **Gerak (satu momen)**: garis batang tergambar menyusuri rantai saat dibuka (sekali).
- **Tidak bisa ditukar karena**: rantainya adalah rantai pasok Patchmos sendiri, dengan angka limbah nilam dari 05_FAKTA (1,5–3% minyak; > 95% ampas).
- **Risiko**: paling kuat bila ada foto dokumentasi produksi asli (belum ada) — prototipe ini versi tanpa foto.

```
DESKTOP                                            MOBILE
[logo]  Pantau  Lapor  Edukasi                [Beli] [logo]        [Beli]
Dari limbah penyulingan nilam Aceh                  Dari limbah ...
menjadi Patchmos.                                   │1 Petani nilam
 1 Petani ─ 2 Penyulingan ─ 3 Ampas ─ 4 Patchmos ─  │2 Penyulingan 1,5–3%
   nilam      1,5–3% minyak  >95%      [render]     │3 Ampas >95%
 ─ 5 Pengguna ─ 6 Data MosqRisk                     │4 Patchmos [render]
   (garis batang melengkung menjahit semua)         │5 Pengguna │6 Data
```

## 4. Kritik diri — "kalau produknya lain, apakah desainnya sama?"

| Arah | Versi pertama (generik) | Kenapa generik | Revisi |
|---|---|---|---|
| A | Latar krem, serif kontras tinggi, kartu "botanical premium" bergaya kosmetik mewah | Persis klaster default #1 (krem + serif + aksen hangat) dan bisa dipakai merek skincare mana pun | Latar diganti **hijau kotak hasil sampling** (bukan krem); kertas bertint daun hanya untuk section; label berisi **proses & status uji asli** (termasuk "uji lab: direncanakan"), bukan klaim indah; foil datar tanpa gradien emas |
| B | Angka besar + label kecil + deretan statistik + aksen gradien | Itu perlakuan hero default yang disebut eksplisit di panduan; juga mirip dashboard SaaS | Angka besar dipertahankan **hanya karena datanya live**; gradien dihapus; ditambah skala zona dengan ambang asli + rincian poin per faktor agar orang paham *kenapa* skornya segitu; latar terang (menghindari klaster gelap + aksen neon); produk tetap di layar pertama supaya tidak dingin |
| C | Deret ikon "01 / 02 / 03 / Cara kerja" horizontal | Section "how it works" generik | Ikon dihapus; tiap simpul membawa **angka/fakta** dari 05_FAKTA; garis penghubung memakai bentuk tangkai daun logo (melengkung), bukan timeline lurus; produk menjadi titik balik "limbah → manfaat" di tengah rantai |

## 5. Kritik dari screenshot & revisi (putaran 1 → 2)

| Arah | Yang terlihat jelek di screenshot putaran 1 | Revisi |
|---|---|---|
| A | Kartu label di kolom kanan membuat kolom terlalu tinggi → judul turun, kiri atas kosong, kartu terpotong lipatan layar. Percobaan kartu "melayang" justru menutupi kotak & botol (melanggar aturan "jangan tutupi label produk") | Kartu dipindah jadi **label rak** melebar di bawah display produk (4 kolom fakta). Produk utuh, seluruh hero muat di layar pertama |
| B | Nama zona "Sedang" turun satu baris, terlihat salah tempat | Nama zona rata kiri di dalam zonanya + rentang ambang (0–49, 50–74, 75–100) |
| C | Separuh kanan hero kosong; produk baru terlihat kecil di simpul 4 (di bawah lipatan) | Render produk masuk hero di kanan judul; simpul 4 cukup teks dengan bingkai emas |

Pemeriksaan otomatis putaran 2: 0 error konsol, tanpa scroll horizontal di 1440 & 390 px
(`.screenshots/fase-2/prototipe/`).

## 6. Lembar perbandingan & rekomendasi (C5)

Lembar: `.screenshots/fase-2/prototipe/lembar-perbandingan.png` (kiri desktop, tengah mobile,
kanan section "Bukti" — isi section sama di ketiga arah supaya yang dibandingkan hanya gayanya).
Prototipe hidup: `/design-lab/a`, `/design-lab/b`, `/design-lab/c`.

| Kriteria (brief §0) | A. Label Apotek | B. Instrumen | C. Rantai Nilam |
|---|---|---|---|
| Nyambung dengan produk fisik & poster di meja expo | **Paling kuat** (bidang hijau + foil + serif = kotaknya) | Sedang | Sedang |
| Membuktikan "sistem benar-benar hidup" | Hanya tautan | **Paling kuat** (skor BMKG live) | Hanya disebut |
| Cerita limbah nilam / ekonomi sirkular | Disebut | Tidak | **Paling kuat** |
| Kejujuran bukti (persepsi vs lab) | Kuat (label terisi vs garis) | Kuat (tabel) | Kuat (garis utuh vs putus-putus) |
| Ketahanan saat internet venue jelek | Aman (statis) | **Rentan**: hero kosong kalau BMKG/backend gagal | Aman (statis) |
| Ketergantungan aset yang belum ada | Render 50 mL | Render 50 mL | Render 50 mL + **foto produksi** |
| Konsistensi dengan poster (Poppins) | Beda (serif dari wordmark) | Beda | Paling dekat (sans) |

**Rekomendasi: A sebagai sistem visual, ditambah dua modul dari B dan C.**
- **Kenapa A**: juri melihat web berdampingan dengan kotak Patchmos. A meminjam bahasa visual
  kotak itu sendiri (hijau sampel `#154127`, foil emas, wordmark serif), jadi web langsung terasa
  "milik produk ini" dan tidak bisa ditukar ke merek lain. Kartu label juga memaksa setiap klaim
  ditulis sebagai fakta beserta statusnya, sejalan dengan semangat 05_FAKTA.
- **Modul B (indikator risiko live)** dipakai sebagai komponen di Beranda (section "cara kerja",
  hierarki brief §6 poin 3) dan sebagai inti `/pantau`, dengan cadangan statis bila BMKG gagal.
  Rincian poin per faktor dipindah ke response API, supaya rumus tidak diduplikasi di frontend.
- **Modul C (rantai nilam)** dipakai sebagai section ekonomi sirkular (hierarki brief §6 poin 5)
  dan di `/tim`. Foto produksi asli bisa masuk ke simpulnya saat tersedia.
- **Tipografi**: Libre Caslon Text untuk judul (menggemakan wordmark serif di logo & kemasan),
  Plus Jakarta Sans untuk teks & UI (sudah dipakai sekarang). Poster memakai Poppins: bedanya
  disengaja, karena identitas terkuat Patchmos adalah wordmark serif di kemasannya. Kalau tim
  lebih memilih konsistensi dengan poster, pakai C sebagai dasar.

Setelah dipilih (Fase 2 langkah 8): tulis `.claude/skills/mosqrisk-design/SKILL.md`, token di
`globals.css`, perbarui bagian desain di `AGENTS.md`. Route `/design-lab` dihapus setelah Beranda
Fase 3 selesai.
