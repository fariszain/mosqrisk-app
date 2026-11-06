# Design Brief — MosqRisk / Patchmos (anti-template)

> Dipakai di Fase 2 (eksplorasi) dan Fase 3 (implementasi). Setelah arah desain dipilih,
> aturan final ditulis ke `.claude/skills/mosqrisk-design/SKILL.md` dan file ini menjadi
> latar belakang.

## 0. Tugas tunggal website ini

Di expo, juri melihat web **berdampingan dengan poster dan produk fisik**. Dalam 5–10 detik
mereka harus menangkap: **masalah (DBD) → produk dari limbah nilam Aceh → sistem risiko
yang benar-benar hidup → bukti yang jujur → tim nyata**. Kalau didekati, mereka harus bisa
menemukan kedalaman (data BMKG asli, metode, sumber). Web harus terasa seperti produk
kesehatan yang lahir dari Aceh — bukan template "startup AI" yang bisa dipakai produk apa saja.

## 1. Sumber kebenaran visual (aset asli — dipakai apa adanya)

| Aset | File | Aturan |
|---|---|---|
| Logo lengkap (daun + wordmark) | `frontend/public/brand/patchmos-logo.png` | Latar transparan. Wordmark hijau gelap → **hanya di latar terang**. Jangan digambar ulang/diwarnai ulang. |
| Tanda daun saja | `frontend/public/brand/patchmos-logo-mark.png` | Untuk favicon/ikon kecil, navbar, latar gelap. |
| Render produk (botol + kotak + podium) | `frontend/public/brand/patchmos-produk.png` (transparan), `patchmos-produk-asli.png` (latar putih) | Hanya posisi & skala. Jangan crop bagian label, jangan tambah efek glow. Masih bertuliskan 100 mL → lihat `05_FAKTA §3`. |
| Warna merek | Logo & kemasan | Jangkar: hijau hutan `#1A3626`, emas `#EAC775`. **Turunkan palet final dengan sampling piksel langsung dari logo & render kemasan**, bukan menebak. |
| Foto tim & produksi | `frontend/public/tim/` (disiapkan tim) | Foto asli saja. Tanpa foto stok orang, tanpa gambar orang buatan AI. |

Foto lain yang sudah ada di `public/` (`aedes-aegypti.jpg`, `edukasi-hero.jpg`,
`nilam-patchouli.jpg`, `Untitled.jpg`): tanyakan asal-usulnya ke user sebelum dipakai
besar-besaran; kalau bukan milik tim/berlisensi jelas, ganti atau beri atribusi.
Aset sisa yang kemungkinan tidak terpakai (`test.html` — ikut ter-publish!, ilustrasi botol
`spray*.svg/png`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`): cek
pemakaian dengan grep, lalu hapus yang tidak dipakai.

## 2. Diagnosis: pola "AI template" yang ada sekarang (semuanya harus hilang)

| Pola | Contoh di kode |
|---|---|
| Blob gradien buram dekoratif | `page.tsx` hero: div `w-[600px] … blur-[120px]`; `Footer.tsx` "Decorative Blur" |
| Gambar produk melayang & dimiringkan untuk "mengisi sisi kosong" | `page.tsx`: komentar "Decorative Assets to fill empty sides", `rotate-12`, `motion-float-*` |
| Ikon raksasa transparan melayang | `page.tsx`: Material Symbols `eco`, `verified_user`, `spa` 80–140px opacity 5–10% |
| Animasi naik-turun tanpa henti | `globals.css`: `float-up-down` infinite |
| Glassmorphism sebagai gaya utama | `AGENTS.md` lama mewajibkan `backdrop-blur`, `bg-white/5`, `border-white/10` |
| Radius besar di semua elemen | `rounded-2xl`, `rounded-3xl`, `rounded-[2.5rem]` di mana-mana |
| Glow & bayangan berlapis | `drop-shadow-2xl`, `drop-shadow-[0_0_10px_rgba(234,199,117,0.3)]` pada logo |
| Kartu "3 pilar" + "Apa Kata Mereka?" + baris bintang 5 | `page.tsx` (dan testimoninya rekaan — lihat roadmap 1.3) |
| Emoji di UI & email | 👑 💧 🌡️ 📝 🚨 |
| Dua sistem ikon + font yang dimuat tapi tak dipakai | Material Symbols (CDN) + paket `phosphor-icons`; Geist & Geist Mono di `layout.tsx` |
| Hero tengah dengan frasa emas + dua tombol pil | Pola landing page generik |
| Gimmick hover di semua link | `hover:translate-x-1` |

## 3. Prinsip

1. **Berakar pada subjeknya.** Dunia Patchmos: label kemasan dengan garis emas tipis, nilam
   & penyulingan Aceh, data cuaca BMKG, kesehatan masyarakat. Setiap pilihan visual harus
   bisa dijelaskan dari dunia itu.
2. **Tipografi yang membawa hierarki**, bukan kotak. Pasangan font dipilih sengaja (tampilan
   + teks + angka). Angka data memakai *tabular numerals*. Uji dengan teks Indonesia yang
   panjang. Poster expo memakai Poppins — kalau memilih font lain, jelaskan alasannya di C5
   supaya konsistensi lintas materi tetap disadari.
3. **Struktur = informasi.** Penomoran hanya untuk urutan nyata (tahap produksi, rantai
   nilam). Label/eyebrow harus menyatakan sesuatu yang benar tentang isinya.
4. **Warna sebagai token** di `:root` (`globals.css`). Emas = aksen, bukan latar dominan.
   Merah tua/burgundy hanya untuk risiko & peringatan. Tingkat risiko tidak boleh hanya
   dibedakan warna (tambahkan label teks).
5. **Satu keluarga ikon, satu ketebalan** (usul: Phosphor via `@phosphor-icons/react`, atau
   Lucide — putuskan di Fase 2). Ikon hanya jika membantu paham; banyak bagian tidak butuh ikon.
6. **Gerak seperlunya.** Maksimal satu momen gerak yang diorkestrasi (mis. masuknya angka
   risiko). Tanpa animasi tak berujung. Hormati `prefers-reduced-motion`.
7. **Aset & data nyata.** Tanpa grafik palsu, UI palsu, testimoni rekaan, atau angka di luar
   `05_FAKTA`. Mockup laptop/HP tidak diperlukan di web — webnya sendiri adalah produknya.
8. **Ruang kosong itu disengaja.** Beri ruang di sekitar produk dan angka utama. Sebelum
   selesai, hapus satu "aksesoris".
9. **Batas mutu**: kontras AA, fokus keyboard terlihat, tap target ≥ 44 px, mobile-first
   360–430 px tanpa scroll horizontal, `next/image` untuk semua gambar, tanpa layout shift.

## 4. Tiga hipotesis arah (titik awal eksplorasi — boleh diubah/digabung)

**A. Label Apotek Botani** — Sistem visual diturunkan dari kemasan: bidang hijau hutan,
garis emas setipis foil, blok informasi seperti label spesimen/komposisi (label kecil
kapital + nilai). *Signature*: "kartu label" yang dipakai konsisten untuk fakta produk,
komposisi, dan hasil uji. *Risiko*: jadi terlalu "mewah kosmetik" — imbangi dengan data.

**B. Instrumen Kesehatan Publik** — Web sebagai alat ukur. Hero menampilkan **skor risiko
DBD hari ini untuk lokasi pengunjung (default Banda Aceh), ditarik live dari `/api/mosqrisk`**,
berdampingan dengan produk; angka besar tabular, sumber "BMKG" dan waktu pembaruan selalu
terlihat. *Signature*: indikator risiko yang dirancang khusus (bukan donut chart generik).
*Risiko*: terasa dingin/dashboard — imbangi dengan cerita nilam.

**C. Rantai Nilam Aceh** — Halaman sebagai perjalanan material: petani nilam → penyulingan →
ampas → Patchmos → pengguna → data MosqRisk. Foto dokumentasi produksi asli jadi
"bab"-nya; penomoran sah karena urutannya nyata. *Signature*: garis rantai yang menjahit
seluruh halaman. *Risiko*: bergantung pada foto tim — siapkan versi sebelum foto ada.

Untuk setiap arah tuliskan: 4–6 token warna (hex, hasil sampling), peran tipografi (display,
teks, angka) + skala, kebijakan radius & bayangan, wireframe ASCII hero desktop & mobile,
satu elemen signature, satu momen gerak, dan **apa yang membuatnya tidak bisa ditukar ke
produk lain**.

## 5. Proses Fase 2 (wajib)

1. **Audit**: screenshot semua halaman sekarang (1440×900 & 390×844) ke `.screenshots/fase-2/
   before/`, lalu daftar 10 masalah terbesar (pakai tabel §2 sebagai awal).
2. **Sampling warna** dari `patchmos-logo.png` dan `patchmos-produk.png` (script kecil Python/
   Node) → palet dasar.
3. **Tulis kartu arah** A/B/C di `docs/expo/design-lab.md`.
4. **Kritik diri**: untuk tiap arah, tanyakan "kalau prompt-nya untuk produk lain, apakah saya
   akan menghasilkan desain yang sama?" Kalau ya, revisi bagian itu dan catat apa yang diubah.
   Hindari tiga klaster default desain AI: (1) krem + serif kontras tinggi + aksen terakota,
   (2) latar hampir hitam + satu aksen neon, (3) gaya koran dengan garis rambut & kolom padat
   — kecuali bisa dibenarkan dari subjeknya.
5. **Prototipe**: bangun hero Beranda + satu section (mis. "Masalah" atau "Cara kerja") per arah
   di route sementara `frontend/app/design-lab/[arah]/page.tsx`, memakai aset asli & teks dari
   `05_FAKTA`.
6. **Bandingkan**: screenshot desktop & mobile, gabungkan jadi satu lembar perbandingan, BACA
   hasilnya, perbaiki yang jelek sebelum ditunjukkan.
7. **Rekomendasi + C5**: tunjukkan ke user, beri rekomendasi dan alasannya, tunggu pilihan.
8. **Setelah dipilih**: tulis `.claude/skills/mosqrisk-design/SKILL.md` (token, skala tipe,
   spasi, radius, elevasi, ikon, pola komponen, gerak, do/don't + contoh kode), pasang token di
   `globals.css`, perbarui bagian desain di `AGENTS.md`.

## 6. Hierarki konten per halaman

- **Beranda**: (1) produk + proposisi nilai satu kalimat → (2) masalah: 161.752 kasus DBD 2025
  (sumber) → (3) cara kerja produk + MosqRisk (risiko live) → (4) bukti: uji persepsi (label
  jujur) + status uji lab → (5) rantai nilam & dampak → (6) aksi: Beli · Cek risiko wilayahmu ·
  Klaim kode → (7) cuplikan tim → `/tim`.
- **/pantau**: lokasi → skor + kategori + waktu update + sumber BMKG → faktor (suhu,
  kelembapan, hujan) → tindakan disarankan → tren (premium) → langganan email.
- **/checkout**: foto produk asli, harga satuan, stepper jumlah, total, form, metode bayar,
  kejelasan status pembayaran (sesuai keputusan C3).
- **/lapor**: form singkat, jenis laporan, lokasi otomatis, catatan privasi, konfirmasi jelas.
- **/edukasi**: pencegahan (3M Plus) dengan sumber resmi; nilam & ampas; semua sumber dicantumkan.
- **/claim**: pindai/masukkan kode, status berhasil/gagal yang jelas.
- **/admin**: fungsional, padat, mudah dibaca — bukan halaman pamer.
- **/tim** (baru): anggota & peran, dosen pendamping, dokumentasi produksi, hasil uji (persepsi
  vs lab), kontak.

## 7. Checklist kritik per halaman (Fase 3 — jalankan pada screenshot, bukan pada kode)

1. Dalam 3 detik, mata pertama ke mana? Apakah itu hal terpenting di halaman ini?
2. Kalau logonya ditukar dengan produk lain, apakah halaman masih "cocok"? Kalau ya → masih template.
3. Hitung aksesoris (efek, badge, ikon, gradien, bayangan). Hapus satu.
4. Setiap ikon membantu paham? Satu keluarga, satu ketebalan?
5. Setiap angka ada di `05_FAKTA` dan diberi sumber/label?
6. Kontras AA, fokus keyboard terlihat, tap target ≥ 44 px?
7. Di 390 px: hierarki tetap jelas, teks konten utama ≥ 14–16 px, tanpa overflow?
8. Status kosong/loading/error dirancang, bukan teks default?
9. Hanya token & komponen dari design system (tanpa warna/radius liar)?
10. Copy: Bahasa Indonesia jelas, kalimat aktif, tombol menyebut aksi spesifik ("Cek risiko
    di wilayahku", bukan "Submit").
