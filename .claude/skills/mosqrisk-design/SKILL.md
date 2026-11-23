---
name: mosqrisk-design
description: Design system MosqRisk/Patchmos v2 ("Kebun Nilam Aceh" — hijau hutan, emas foil, foto asli, gerak yang menjawab aksi). Wajib dibaca sebelum membuat atau mengubah UI apa pun di frontend/ — token warna, tipografi, radius, gerak, foto, komponen, aturan copy, dan checklist kritik.
---

# Design system MosqRisk / Patchmos — v2 "Kebun Nilam Aceh" (2026-11-07)

v1 ("Label Apotek Botani": latar krem, judul serif Caslon, sudut 2 px, tanpa foto & tanpa gerak) dinilai user
**kosong, monoton, kaku, "kayak orang baru belajar bikin web"**. v2 menjawabnya tanpa berlebihan ("jangan lebay"):
foto asli, komposisi berlapis, bidang hijau tua untuk momen penting, satu urutan masuk di hero, dan gerak yang
menjawab aksi pengguna. Referensi yang dipelajari: Seed (hijau tua + foto produk + kartu membulat + diagram
berlabel), Sandland (gauge setengah lingkaran, kartu produk berlatar warna), Sensatia (brand botani Indonesia:
tabel fakta produk + foto bertekstur alam), IQAir (angka indeks besar per kota), Javara (warisan lokal).

Fakta & angka: hanya dari `docs/expo/05_FAKTA_TERVERIFIKASI.md`. Teks UI Bahasa Indonesia.

## 1. Token warna (`frontend/app/globals.css`)

Semua warna lewat token; jangan menulis hex baru di komponen (pengecualian: grafik recharts, lihat §8).

| Token (Tailwind) | Hex | Pakai untuk |
|---|---|---|
| `kemasan` / `kemasan-gelap` | `#154127` / `#0F3320` | Tombol utama, ikon fitur, judul aksen, hover |
| `hutan` | `#0C2617` | Permukaan paling gelap: panel hero, bagian gelap, footer, kartu ringkasan |
| `tinta` | `#0B2A19` | Teks utama di latar terang |
| `sekunder` | `#4A5A4F` | Teks pendukung (7,1:1 di putih) |
| `foil` / `foil-terang` | `#E4AE3C` / `#F0C45E` | Tombol & aksen di permukaan gelap, garis rantai, ornamen. **Bukan teks di latar terang** |
| `emas-teks` | `#7A5A12` | Emas sebagai teks/bidang di latar terang |
| `pucat` | `#C9D6C4` | Teks sekunder di permukaan gelap |
| `pucuk` | `#B9D99A` | Aksen kecil (ikon, status) di permukaan gelap |
| `daun` / `ampas` | `#516B32` / `#7A5B3A` | Bar poin faktor, tahap rantai; avatar |
| `kertas` / `kertas-gelap` | `#EDF3EC` / `#DCE6DA` | Latar bagian selang-seling & kartu; trek bar, placeholder |
| `putih` | `#FFFFFF` | Latar dasar halaman (bukan krem) |
| `garis` / `garis-kuat` | `#D5DFD3` / `#76857A` | Garis & batas input |
| `risiko-{tinggi,sedang,rendah}` (+ `-latar`) | `#8E1B1B` `#8A5A00` `#2E6B3F` | Kategori risiko — **selalu dengan label teks** |
| `galat`, `peringatan-latar/-teks` | | Galat, mode uji coba |

Ritme halaman: putih → `kertas` → bidang `hutan` (teks putih, class `permukaan-gelap`) → putih …
Satu halaman boleh punya 1–2 bidang gelap; jangan dua bidang gelap berurutan.

## 2. Tipografi

- **Satu keluarga: Geist** (variabel 100–900; dipilih user 2026-11-09 dari 4 contoh, sebelumnya Plus Jakarta Sans). Kontras dari ukuran & berat. Tidak ada italic asli — miring sintetis untuk nama ilmiah.
- **Kepala halaman**: Beranda = hero satu layar; halaman lain = `<HeroHalaman>` (hutan penuh di belakang navbar, label kapsul, judul besar + frasa `.teks-foil`). Warna risiko: `--risiko-*` untuk teks, `--risiko-*-isi` untuk gauge & bar.
- Skala (cair 390→1440 px): `.judul-hero` (42→82, 800, tracking −0,045em), `.judul-1` (36→62), `.judul-2` (30→50),
  `.judul-3` (21→26, 700), `.pengantar` (17→21, sekunder), `.teks-isi` (16/17), `.keterangan` (13, sumber & catatan).
- **Judul besar tanpa titik akhir** (titik tampak renggang pada huruf tebal yang dirapatkan).
- Angka data `angka` (tabular). Angka besar (skor, total, statistik): `font-extrabold tracking-[-0.04em]`.
- Nama ilmiah miring (*Aedes aegypti*) — satu-satunya kata miring di judul.
- Hindari: eyebrow HURUF KAPITAL di atas judul, mewarnai satu kata di judul, "→" di teks tautan, string meta dengan "·".

## 3. Tata letak, radius, kedalaman, ornamen

- Wadah: `wadah` (maks 78rem; gutter 20/32/40 px). Grid 12 kolom di `lg`. Rata kiri.
- Kepala bagian: judul kiri (`lg:col-span-6/7`) + pengantar kanan (`lg:col-span-5`), lalu isi.
- Padding bagian: `py-20 md:py-28` (konten), kepala halaman `pt-8 md:pt-12`.
- **Radius berjenjang**: `rounded-media` 28 px (foto, panel besar), `rounded-kartu` 20 px (kartu), `rounded-kontrol`
  12 px (tombol, input), `rounded-full` (chip, avatar, ikon bulat). Jangan satu radius untuk semua.
- **Bayangan hanya untuk yang melayang**: `shadow-angkat` (chip risiko di hero, ringkasan checkout, dialog, kartu
  overlay), `shadow-tipis` (kartu putih di atas `kertas`, navbar kapsul melayang; `shadow-angkat` saat digulir). Kartu lain datar.
- **Signature**: ornamen *pucok reubong* (rebung — segitiga songket/ukiran Aceh) dalam emas foil: `<Ornamen />`.
- **Hero Beranda "gabungan" (keputusan user 2026-11-09)**: hijau hutan penuh + judul raksasa di tengah dengan satu frasa emas `.teks-foil`, produk melayang bercahaya, kartu kecil miring. Pengecualian yang disengaja dari aturan "jangan menyorot satu frasa" — HANYA di hero Beranda. Kartu langkah boleh angka besar bergradasi `.angka-langkah` karena isinya memang urutan.
  Dipakai hemat: tepi atas footer, tepi panel produk.
- Komposisi berlapis boleh: produk di atas panel `hutan` bertekstur foto daun + chip yang menumpang tepi panel.

## 4. Foto & gambar

- Foto ada di `frontend/public/foto/`, terdaftar di `lib/foto.ts` (src, ukuran, alt, kredit, lisensi, tautan).
  Wikimedia Commons (CC BY-SA / domain publik) → kredit WAJIB tampil (keterangan foto dan/atau `/kredit`).
- Foto nyamuk, jentik, nilam, genangan: boleh & dianjurkan. **Bukan foto orang** untuk mewakili tim/pembeli/testimoni
  (tim: foto asli di `public/tim/`, sampai ada pakai monogram berwarna).
- Aset merek di `public/brand/` dipakai apa adanya (logo, tanda daun, render produk) — tidak diwarnai ulang/dipotong.
- Render kemasan masih sementara (tulisan 100 mL, produk 50 mL) → beri keterangan "Render kemasan sementara".
- Foto di atas teks: lapisan gradasi `lapis-foto` atau `from-hutan` supaya kontras teks tetap ≥ 4,5:1.

## 5. Ikon

- Satu keluarga: **Phosphor** (`@phosphor-icons/react/ssr`, nama `*Icon`). `regular` untuk kontrol UI,
  `duotone` untuk ikon fitur di lingkaran (`grid h-11 w-11 place-items-center rounded-full bg-kertas text-kemasan`).
- `aria-hidden="true"` bila ada teks di sampingnya; tombol ikon saja wajib `aria-label`. Tanpa emoji.
- Jangan menyimpan komponen ikon di variabel hasil fungsi saat render (lint "create components during render");
  peta statis (`const IKON = { … }`) atau `switch` yang mengembalikan JSX boleh.

## 6. Gerak (hemat, bermakna, menghormati `prefers-reduced-motion`)

1. **Satu urutan masuk di hero** tiap halaman: class `masuk` + `style={{ "--tunda": "120ms" }}` (judul → pengantar →
   aksi → media → chip). Bukan untuk setiap bagian.
2. **Terisi sekali saat terlihat** (`useTerlihat`): gauge risiko & angka skor (`SkalaRisiko`), bar poin faktor,
   statistik (`AngkaNaik`), garis emas rantai nilam.
3. **Menjawab aksi**: tab/stepper (`ganti-isi`), akordeon (grid-rows 0fr→1fr + `inert`), pilihan kartu radio,
   panel wilayah, dialog (lembar bawah di HP), centang berhasil (`CentangBerhasil`), garis pindai QR.
4. Gerak terus-menerus hanya `melayang-pelan` pada render produk di hero.
- Dilarang: fade-up di setiap bagian, hover lompat di setiap kartu, parallax berat, autoplay carousel, marquee.

## 7. Komponen

| Komponen | File | Catatan |
|---|---|---|
| Tombol | `components/ui/tombol.ts` → `kelasTombol(varian, ukuran, tambahan)` | `utama`, `garis`, `hantu` (latar terang); `foil`, `terang` (permukaan gelap); `lg`/`md`/`sm` |
| Form | `components/ui/bidang.ts` | Input radius 12, fokus cincin hijau; galat di bawah field + `aria-invalid` |
| Catatan / Dialog | `ui/Catatan.tsx`, `ui/Dialog.tsx` | Dialog `<dialog>` bawaan: lembar bawah di HP, kartu di tengah di desktop |
| Kartu fakta | `ui/KartuLabel.tsx` | `varian="isi"` = sudah ada (hijau); `"garis"` = direncanakan (putus-putus); `status` = lencana |
| Akordeon | `ui/Akordion.tsx` | Tanya-jawab Beranda |
| Angka & gerak | `ui/AngkaNaik.tsx`, `ui/useTerlihat.ts`, `ui/CentangBerhasil.tsx` | |
| Ornamen | `ui/Ornamen.tsx` | Pucok reubong emas |
| Indikator risiko | `SkalaRisiko.tsx`, `RisikoHariIni.tsx`, `beranda/ChipRisiko.tsx`, `IkonCuaca.tsx` | Gauge setengah lingkaran (ambang 50/75), poin faktor dari API, cuaca terdekat, sumber BMKG |
| Rantai nilam | `RantaiNilam.tsx` | 6 simpul bergambar + garis emas yang tumbuh |
| Edukasi | `edukasi/SiklusAedes.tsx`, `edukasi/SimulatorRisiko.tsx`, `edukasi/TrenIklim.tsx` | Tab ARIA siklus; simulator memakai `lib/rumus.ts` |
| Pantau | `pantau/ChecklistPencegahan.tsx` | Centang 3M Plus per hari (localStorage via `useSyncExternalStore`) |
| Klaim | `PanelKlaim.tsx`, `ClaimModal.tsx`, `beranda/BagianKlaim.tsx` | Kontrol tersegmen Ketik/Pindai |

Data bersama: `lib/risiko.ts` (tipe API, kategori, format waktu), `lib/lokasi.ts` (lokasi tersimpan, hook),
`lib/rumus.ts` (parameter rumus dari `backend/rumus_risiko.json`), `lib/produk.ts` (harga & ongkir dari
`backend/produk.json`), `lib/edukasi.ts` (isi kesehatan bersumber), `lib/foto.ts` (foto & kredit), `lib/tim.ts`.

## 8. Data & grafik

- Setiap angka ada di `05_FAKTA` dan diberi sumber. Klaim kesehatan hanya dari sumber resmi yang ditautkan.
- Kategori risiko tidak pernah dibedakan warna saja — selalu teks kategori & rentang.
- Rumus tidak disalin manual ke browser: skor tampil dari API; simulator memakai JSON yang sama dengan server.
- Grafik recharts: nilai hex token (atribut SVG recharts tidak membaca `var()` dengan andal), zona risiko sebagai
  `ReferenceArea`, tanpa animasi, tabel data di `<details>`. SVG buatan sendiri: warna lewat `style={{ stroke: … }}` atau class `stroke-*`.

## 9. Checklist sebelum menyatakan halaman selesai

1. Screenshot 1440×900 dan 390×844 (gulir pelan dulu), dibaca; tanpa scroll horizontal.
2. Mata pertama jatuh ke hal terpenting? Ada foto/visual nyata di layar pertama? Ritme bagian bervariasi?
3. Hitung aksesoris dan gerak; hapus satu. Tidak ada animasi yang tidak menjawab apa pun.
4. Setiap angka ada di 05_FAKTA + sumbernya tampil; foto Commons punya kredit.
5. Kontras AA, fokus terlihat, tap target ≥ 44 px, label form ada, `prefers-reduced-motion` aman.
6. Status kosong / memuat (skeleton) / galat dirancang dan menjelaskan langkah berikutnya.
7. `npx tsc --noEmit` = 0 error; `npm run build` sukses; uji browser memalsukan endpoint tulis (Supabase hidup).
