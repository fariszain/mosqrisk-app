# Catatan Kesesuaian: Proposal PIKU Batch II vs Kode `mosqrisk-app`

> **Update 2026-11-06:** rencana kerja terbaru ada di `docs/expo/01_ROADMAP.md`, fakta di
> `docs/expo/05_FAKTA_TERVERIFIKASI.md`. File ini tetap dipakai sebagai detail audit (file &
> baris); **kalau ada yang bertentangan, roadmap yang berlaku**.

> Dibuat: 2026-11-05, hasil cross-check manual antara `Proposal_PIKU_2026_Patchmos.pdf`
> dan isi repo `mosqrisk-app` pada tanggal tersebut. **Status proposal: sudah final/disubmit,
> tidak bisa diubah lagi.** Artinya semua penyesuaian pada daftar ini harus dilakukan di
> sisi kode/web, bukan di sisi proposal.

---

## 0. Instruksi untuk Claude Code

1. **Verifikasi ulang semua klaim di file ini terhadap kode yang sebenarnya ada sekarang**
   sebelum mengerjakan apa pun — jangan percaya mentah-mentah ke ringkasan di bawah,
   terutama bagian "Klaim AI/ML" (lihat item 2). Kode bisa saja sudah berubah sejak catatan
   ini ditulis.
2. **Jangan ubah harga di `checkout/page.tsx` sampai ada instruksi eksplisit** — ini masih
   jadi bahan diskusi tim (lihat item 1). Boleh disiapkan opsi/diff-nya, tapi jangan di-apply.
3. Untuk tiap item, **tunjukkan rencana/diff dulu sebelum menulis ke file**, terutama untuk
   item yang menyentuh logika bisnis (harga, skor risiko, broadcast).
4. Item yang ditandai **[AMAN]** boleh langsung dikerjakan tanpa approval tambahan karena
   murni perbaikan editorial/dokumentasi dan tidak mengubah perilaku sistem.
5. Item yang ditandai **[TUNGGU KEPUTUSAN]** jangan dieksekusi — cukup siapkan analisis/opsi,
   lalu laporkan ke user untuk diputuskan bersama tim.

---

## 1. Harga jual per botol — [TUNGGU KEPUTUSAN]

**Klaim di proposal** (hal. 12, Tabel 8 — HPP; dan analisis BEP hal. ~15):
> "Harga jual per botol (strategi harga terjangkau): **Rp12.000**" — HPP Rp4.000/botol,
> margin kotor Rp8.000 (66,7%). Seluruh perhitungan BEP, NPV (+Rp5.641.769), IRR (82,24%),
> ROI (248,8%) di proposal dihitung berbasis angka Rp12.000 ini.

**Realita di kode** — `frontend/app/checkout/page.tsx`:
- Baris 46: `const pricePerBottle = 35000;`
- Baris 49: `if (quantity === 2) totalPrice = 65000;`
- Baris 50: `if (quantity === 3) totalPrice = 90000;`
- Baris 283, 306, 329: harga ditampilkan ke user sebagai Rp35.000 / Rp65.000 / Rp90.000.
- String "12.000" / "12000" **tidak ditemukan sama sekali** di folder `frontend/app/`.

**Kenapa ini penting**: selisihnya hampir 3x lipat dari angka yang disubmit ke PIKU.
Kalau reviewer membuka web dan mencocokkan dengan RAB/BEP di proposal, ini akan langsung
kelihatan tidak konsisten.

**KEPUTUSAN SEMENTARA (2026-11-06):** harga final belum diputuskan tim (rencana diputuskan
minggu depan), tapi untuk sekarang disepakati pakai **Rp20.000/botol** sebagai angka
sementara — bukan final, jangan dianggap sudah selesai.

**UPDATE KEPUTUSAN (2026-11-06, revisi kedua): sistem paket/bundle DIHAPUS.**
Tim memutuskan ke depannya tidak jualan paket tetap (1/2/3 botol dengan harga beda-beda
per paket), tapi jual per botol dengan **quantity selector biasa** — mau beli berapa pun
tinggal tambah jumlah, total = jumlah × harga satuan. Jadi perubahan di bawah ini
menggantikan rencana sebelumnya (bukan menambah bundle 35rb/45rb seperti draf pertama).

**Tugas untuk Claude Code — boleh langsung dikerjakan:**
1. Di `frontend/app/checkout/page.tsx`, ganti logika harga:
   - Hapus percabangan manual `if (quantity === 2) totalPrice = ...` / `if (quantity ===
     3) totalPrice = ...` (baris ~46-50).
   - Ganti jadi: `const pricePerBottle = 20000;` lalu `const totalPrice = quantity *
     pricePerBottle;` — linear, tanpa diskon bertingkat.
2. Ganti UI 3 kartu paket tetap ("1 Botol Rp35.000" / "2 Botol" / "Paket Keluarga 3 Botol")
   jadi **quantity stepper** (tombol − / angka / tombol +, atau input angka), dengan total
   harga yang update otomatis sesuai jumlah. Pasang batas wajar (misal minimal 1, maksimal
   mungkin 10–20 biar nggak ada yang iseng input angka aneh).
3. Tambahkan komentar `// TODO: harga sementara Rp20.000/botol, final minggu depan —
   konfirmasi ke tim sebelum expo` di atas `pricePerBottle`.
4. Cek juga apakah teks statis "1 Botol" / "2 Botol" / "Paket Keluarga 3 Botol" muncul di
   tempat lain (misal di `backend/main.py` baris ~638, item_details Midtrans pakai
   `req.package` sebagai label) — sesuaikan juga biar konsisten jadi "X Botol Patchmos"
   dinamis, bukan nama paket tetap.
5. Ini belum menyelesaikan gap ke proposal (Rp12.000) — tetap tunggu keputusan final
   minggu depan, tinggal ganti angka `20000` jadi angka final nanti karena sekarang sudah
   satu sumber angka (bukan 3 angka bundle yang harus disinkronkan manual).

---

## 2. Klaim "model machine learning" — SUDAH DIVERIFIKASI 2x, hasilnya: TIDAK ADA ML di kode

**Klaim di proposal** (hal. 12):
> "...integrasi **model machine learning sederhana** berbasis data publik **BMKG dan
> Kementerian Kesehatan** untuk memprediksi tingkat risiko nyamuk per wilayah..."
> Tabel 13, baris "Peta Pantauan": *"Model machine learning, data publik BMKG & Kemenkes RI"*

**Status: sudah dicek dua kali secara independen (bukan cuma sekali), hasilnya konsisten.**

Cek #1 — kode produksi (`backend/main.py` + `backend/requirements.txt`):
- `requirements.txt` isinya hanya: `fastapi, uvicorn, requests, supabase, python-dotenv,
  pydantic, midtransclient` — **tidak ada** `scikit-learn`, `numpy`, `pandas`, `tensorflow`,
  atau library ML apa pun.
- `calculate_mosquito_risk()` (sekitar baris 89–131) dan skor di `get_climate_trend()`
  (sekitar baris 312–385) adalah **formula matematis yang ditulis tangan**: kurva Gaussian
  untuk suhu (titik optimal 28°C), sigmoid untuk curah hujan, linear untuk kelembapan,
  modifier angin. Parameternya mengutip literatur (Mordecai et al. 2017, Liu-Helmersson et
  al. 2014) — jadi ada dasar ilmiah — tapi **tidak ada proses training/fitting ke dataset**.
  Ini rule-based scoring, bukan machine learning secara teknis.

Cek #2 — riwayat eksplorasi (`scripts/bmkg_mosqrisk_engine.ipynb`, notebook prototipe awal
sebelum jadi `main.py`):
- Isinya versi paling sederhana dari fungsi yang sama: `calculate_mosquito_risk(temp,
  humidity)` cuma if/elif berjenjang (skor dasar 20, +40 kalau suhu 26–30°C, dst.) — bahkan
  lebih sederhana dari versi produksi, tetap **bukan ML**.
- Juga tidak ada `data/` berisi dataset training — isi folder `data/` cuma
  `wilayah.sql` (lookup kode wilayah Indonesia, bukan data historis kasus DBD) dan
  `data_kota.json` (daftar 3 kota contoh: Banda Aceh, Jakarta Selatan, Medan).

**Kesimpulan yang bisa dipegang (tidak perlu dicek ulang lagi oleh Claude Code untuk poin
ini — sudah final):**
- ❌ **Tidak ada machine learning** di mana pun dalam kode (produksi maupun eksplorasi).
  Yang ada: formula matematis manual yang terinspirasi literatur.
- ✅ **BMKG memang benar dipakai** dan itu genuinely data resmi pemerintah Indonesia (Badan
  Meteorologi, Klimatologi, dan Geofisika) — dipanggil langsung di `fetch_city_weather()`
  via `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=...`. Bagian ini proposal **benar**.
- ⚠️ **Open-Meteo** (`archive-api.open-meteo.com`) juga dipakai, tapi itu bukan data
  pemerintah Indonesia — itu API cuaca historis open-source/internasional (dipakai khusus
  untuk grafik tren iklim 12 bulan di fitur premium, bukan untuk skor risiko real-time utama).
- ❌ **Data Kementerian Kesehatan tidak ditemukan sama sekali** sebagai feed data yang
  dipakai algoritma. Kemungkinan besar yang kamu ingat adalah angka **161.752 kasus DBD /
  673 kematian (Kemenkes RI, 2025)** — itu memang data Kemenkes asli, tapi dipakai sebagai
  **kutipan statistik di narasi latar belakang masalah** (proposal & poster), bukan sebagai
  data yang ditarik live oleh backend untuk menghitung skor risiko.

**Tugas untuk Claude Code terkait poin ini:** tidak perlu re-investigasi dari nol (sudah
cukup final), tapi **boleh dicek sekali lagi kalau user memang minta** — misalnya kalau ada
file lain di luar yang disebut di atas yang belum sempat diperiksa. Yang benar-benar perlu
dikerjakan Claude Code adalah **membantu user memutuskan** jalan ke depan (opsi di bawah),
bukan mengubah apa pun secara sepihak:
- Opsi A: terima sebagai keterbatasan implementasi, jangan sentuh kode — cukup siapkan
  jawaban yang jujur dan percaya diri kalau ditanya juri/reviewer (fokus ke kekuatan nyata:
  formula berbasis literatur ilmiah + data cuaca resmi BMKG real-time).
  Jawaban kurang lebih: *"Sistem skor risiko menggunakan formula epidemiologi berbasis
  parameter dari studi [Mordecai 2017, Liu-Helmersson 2014], bukan model ML yang dilatih
  dari dataset — diintegrasikan dengan data cuaca real-time resmi BMKG."*
- Opsi B: upgrade `calculate_mosquito_risk()` jadi model ML sungguhan (misalnya regresi
  logistik/random forest sederhana dilatih dari data historis kasus DBD + cuaca), supaya
  klaim proposal jadi akurat secara retroaktif. Ini butuh dataset historis kasus DBD per
  wilayah (belum ada di repo) — effort besar, risiko waktu tinggi menjelang deadline.
- Opsi C: tambahkan integrasi data Kemenkes yang benar-benar live (kalau ada API publiknya)
  supaya bagian itu dari klaim proposal juga jadi akurat, terpisah dari soal ML.

---

## 3. Broadcast admin tidak ditarget ke "wilayah berisiko tinggi" — [TUNGGU KEPUTUSAN]

**Klaim di proposal** (Tabel 13, baris Dashboard Admin):
> "Portal pemantauan bagi tim: unduh data CSV, **kirim peringatan darurat ke wilayah
> berisiko tinggi**."

**Realita di kode:**
- `frontend/app/admin/page.tsx` baris ~327–334: tombol "Kirim Peringatan" memanggil
  `handleBroadcast()` tanpa filter wilayah/risiko apa pun.
- `backend/main.py`, endpoint `/api/broadcast` (baris ~577–590) dan
  `send_broadcast_emails()` (baris ~547–571): mengambil **semua baris** dari tabel
  `subscribers` dan mengirim email ke semuanya — tidak ada logika yang memeriksa skor
  risiko wilayah masing-masing subscriber sebelum mengirim.

**Catatan:** ini beda dengan endpoint `/api/reports` → `send_local_broadcast()` (baris
~396–435), yang memang sudah menyaring berdasarkan **kecocokan nama lokasi** laporan vs
lokasi subscriber (bukan berdasarkan skor risiko tinggi/rendah). Jadi ada *sebagian*
logika penargetan lokasi, tapi bukan yang dipakai oleh tombol broadcast admin.

**Opsi perbaikan (siapkan sebagai rencana, tunggu konfirmasi sebelum eksekusi):**
- Tambahkan filter di `/api/broadcast`: hanya kirim ke subscriber yang lokasinya saat ini
  berstatus risiko "TINGGI" (panggil `calculate_mosquito_risk` per lokasi subscriber sebelum
  broadcast), supaya sesuai klaim proposal.
- Atau: biarkan sebagai "broadcast darurat manual ke semua" dan cukup catat ini sebagai
  keterbatasan implementasi (lebih cepat, tidak ada risiko bug baru menjelang deadline).

---

## 4. Status Premium hanya divalidasi di client (localStorage) — opsional, tingkat risiko keamanan

**Temuan:**
- `isPremium` disimpan di `localStorage` browser:
  - `frontend/app/claim/page.tsx` baris 42: `localStorage.setItem('isPremium', 'true');`
  - `frontend/app/checkout/page.tsx` baris 57 & 83: sama.
  - `frontend/app/pantau/page.tsx` baris 28, 70–71: dibaca dari `localStorage`, bukan dari
    sesi akun yang divalidasi backend per request.
- Artinya siapa pun bisa membuka DevTools dan menjalankan
  `localStorage.setItem('isPremium','true')` untuk membuka fitur premium (grafik tren,
  radius alert) tanpa klaim kode asli atau pembayaran.

**Kenapa relevan:** proposal menyebut fitur Klaim Premium sebagai *"nilai tambah utama yang
membedakan Patchmos dari kompetitor"* — kalau ini gampang dibypass, nilai jual fitur ini
jadi lemah kalau ditanya detail oleh reviewer/juri.

**Opsi perbaikan (butuh effort lebih besar, sifatnya *nice to have* bukan wajib untuk
kompetisi):**
- Simpan status premium di tabel Supabase terikat ke sesi/akun (pakai Supabase Auth yang
  sudah ada untuk Google OAuth), bukan di `localStorage`.
- Minimal: validasi ulang status premium ke backend setiap kali halaman `/pantau` dibuka,
  bukan cuma percaya nilai di `localStorage`.
- Claude Code: **jangan kerjakan ini dulu kecuali diminta eksplisit** — prioritas rendah
  dibanding item 1–3.

---

## 5. README menyebut institusi yang salah — [AMAN, boleh langsung diperbaiki]

**Masalah:** `README.md` baris 225:
> "Dikembangkan oleh mahasiswa **Universitas Teuku Umar** sebagai proyek inovasi kesehatan
> masyarakat."

Padahal proposal PIKU jelas menyebutkan **Universitas Syiah Kuala (USK)** sebagai institusi
tim (proposal hal. 1, dan seluruh strategi distribusi menyasar "komunitas kampus USK").
Kemungkinan ini tercampur dengan nama kompetisi "UTU Awards" (yang memang diselenggarakan
Universitas Teuku Umar) saat README ditulis.

**Perbaikan:** ganti baris itu menjadi sesuatu seperti:
> "Dikembangkan oleh mahasiswa Universitas Syiah Kuala (USK) sebagai bagian dari proyek
> kewirausahaan Patchmos, didanai Program Pendanaan Internal Kewirausahaan (PIKU) USK."

---

## 6. README mengklaim fitur yang lokasinya tidak sesuai kode — [AMAN, perbaikan dokumentasi]

**Masalah:** `README.md` bagian "1. Beranda (`/`)" mengklaim:
> "Menampilkan statistik real-time (jumlah laporan, subscriber, dan dampak lingkungan) yang
> diambil langsung dari database."

**Realita:**
- `frontend/app/page.tsx` (halaman Beranda) **tidak memanggil** `/api/stats` sama sekali.
- Yang memanggil `/api/stats` justru `frontend/app/pantau/page.tsx` baris ~82.
- `backend/main.py`, endpoint `/api/stats` (baris ~469–483): secara internal menghitung
  `total_reports` dan `total_subs`, tapi **response JSON hanya mengembalikan `impact_kg`**
  — dua angka itu dihitung tapi tidak pernah dikirim ke frontend.

**Perbaikan (pilih salah satu, lebih cepat opsi README-only):**
- Opsi cepat: perbaiki teks README supaya sesuai kenyataan — statistik dampak lingkungan
  ditampilkan di halaman `/pantau`, bukan Beranda, dan hanya `impact_kg` yang tersedia.
- Opsi lengkap (kalau mau benar-benar menampilkan jumlah laporan & subscriber di Beranda
  seperti klaim README): tambahkan `total_reports` dan `total_subs` ke response
  `/api/stats` di backend, lalu fetch dan tampilkan di `page.tsx`.

---

## 7. Catatan minor: "Estimasi Proteksi: 4 Jam" di-hardcode — opsional

`frontend/app/pantau/page.tsx` baris ~453:
```
Estimasi Proteksi: {mosqRiskData ? "4" : "-"} Jam
```
Angka "4" selalu tetap, tidak dihitung dinamis dari apa pun (padahal terlihat seperti bagian
dari data real-time di sekitarnya). Proposal hanya menyebut "estimasi durasi proteksi" tanpa
mensyaratkan ini harus dinamis, jadi ini **bukan pelanggaran klaim**, cuma catatan kualitas
kode kalau ada waktu luang untuk dirapikan.

---

## 8. Checklist persiapan expo (update 2026-11-06)

Status terbaru hasil diskusi dengan user — bukan lagi soal kesesuaian proposal, tapi
persiapan teknis sebelum hari expo.

**8a. Harga — lihat item 1 di atas.** Sudah diputuskan sementara Rp20.000/botol, final
minggu depan. Jangan dianggap selesai.

**8b. Halaman "Tim & Proses Produksi" — BELUM ADA, perlu dibuat baru.**
Permintaan tim: foto wajah anggota + dokumentasi proses pembuatan produk, dan nanti hasil
uji lab begitu tersedia.
- Rekomendasi: buat route baru `frontend/app/tim/page.tsx` (atau `/tentang`), bukan
  ditumpuk ke `page.tsx` (Beranda) yang sudah padat (16KB). Ini juga konsisten dengan pola
  arsitektur yang sudah ada — tiap konten besar punya route sendiri (`/edukasi`, `/lapor`,
  dst).
- Isi halaman:
  1. Foto + nama + peran 5 anggota tim (Produksi, Keuangan & Pemasaran, Digital & Branding,
     Media Sosial, Ketua) + nama dosen pembimbing.
  2. Galeri foto dokumentasi proses produksi nyata (ampas nilam → ekstraksi →
     mikroenkapsulasi → formulasi spray) — foto asli, bukan ikon/ilustrasi.
  3. Section "Hasil Uji" — SAAT hasil uji lab sudah ada, taruh di sini, dan **pisahkan
     jelas** dari data survei persepsi (92,8%/94,5%/92,5%, 10 responden) supaya tidak
     kelihatan overclaim kalau ditanya detail oleh juri.
- Tambahkan link ke halaman baru ini di `components/Navbar.tsx` dan `components/
  BottomNav.tsx`.
- Konten foto (file gambar) harus disiapkan user/tim secara manual — Claude Code cuma
  bikin struktur halaman + placeholder yang jelas ditandai, bukan mengarang foto.

**8c. Kode demo premium — SUDAH DISIAPKAN user, tidak perlu dikerjakan lagi.**

**8d. Data dummy di dashboard — DISKIP.** User memilih mengandalkan data asli dari
pembelian/laporan nyata yang diharapkan masuk sebelum expo, bukan data buatan. Tidak perlu
dikerjakan Claude Code. (Catatan risiko kecil: kalau mendekati H-1 datanya ternyata masih
sepi, baru pertimbangkan isi data contoh sebagai cadangan — tapi ini keputusan user, jangan
dieksekusi otomatis oleh Claude Code.)

**8e. Visual circular economy di web — BELUM ADA, minta Claude Code cek & usulkan.**
Diagram "Petani Nilam → Penyulingan → Ampas Nilam → Patchmos → Pengguna → Data MosqRisk"
sudah ada di poster & proposal, tapi belum ada representasinya di web manapun (sudah dicek
`page.tsx`, `edukasi/page.tsx` — tidak ketemu). Tugas Claude Code:
1. Konfirmasi ulang (grep seluruh `frontend/app/` untuk "circular economy" / "petani
   nilam" / "penyulingan") bahwa ini memang belum ada.
2. Usulkan di halaman mana paling masuk akal ditaruh — kemungkinan besar di Beranda (dekat
   section misi sosial yang sudah ada di `page.tsx` baris ~133-145) atau di halaman Tim &
   Proses yang baru (8b).
3. Tunjukkan rencana/mockup dulu sebelum menulis kode.

**8f. Cek tampilan mobile — minta Claude Code lakukan sebelum expo.**
Pengunjung expo mayoritas akan scan QR pakai HP. Tugas Claude Code:
1. Cek tiap halaman (`/`, `/pantau`, `/lapor`, `/checkout`, `/claim`, `/edukasi`, dan
   halaman Tim & Proses yang baru) di breakpoint mobile (~375px, ~390px).
2. Kalau mau didemokan juga, cek `/admin` di mobile (meski biasanya dibuka di laptop).
3. Laporkan halaman mana saja yang ada masalah layout (teks kepotong, tombol ketutupan,
   overflow horizontal, dll), tunjukkan screenshot/temuan dulu sebelum memperbaiki.

**8g. Chatbot — DILANJUTKAN, timeline sampai akhir November 2026.**
Update keputusan (2026-11-06): user punya waktu sampai akhir bulan dan mau pakai Claude
Code untuk percepat pengerjaan, serta menginginkan chatbot yang benar-benar berfungsi
penuh (LLM beneran, bukan sekadar FAQ keyword matching). Ini **boleh dikerjakan**, tapi
WAJIB pakai arsitektur aman di bawah — jangan sekadar colok API LLM tanpa pembatasan.

**Arsitektur wajib (supaya aman dipakai di depan juri untuk topik kesehatan):**
1. **System prompt dibatasi ketat ke 3 topik saja**: (a) info produk Patchmos (bahan,
   cara pakai, harga saat ini, cara beli/checkout), (b) cara pakai fitur MosqRisk (baca
   skor risiko, cara lapor, cara klaim premium), (c) info pencegahan DBD yang SIFATNYA
   UMUM (3M Plus: menguras-menutup-mendaur ulang, kapan harus ke dokter) — **DILARANG**
   memberi diagnosis, dosis obat, atau rekomendasi pengobatan spesifik apa pun.
2. **Knowledge base berbasis konteks yang disuntik ke prompt (RAG sederhana), bukan
   dibiarkan menjawab dari pengetahuan umum model**: siapkan satu dokumen ringkas berisi
   fakta produk yang sudah terverifikasi (dari proposal/README yang sudah dicek akurat)
   + panduan resmi pencegahan DBD (3M Plus, Kemenkes) + FAQ fitur MosqRisk. Instruksikan
   model untuk HANYA menjawab berdasarkan dokumen ini, dan kalau pertanyaan di luar
   cakupan dokumen → jawab "maaf, saya nggak punya info itu, coba tanya tim kami
   langsung" / untuk pertanyaan medis spesifik → arahkan ke "segera konsultasi ke
   dokter/Puskesmas terdekat", jangan coba jawab sendiri.
3. **Disclaimer permanen di UI chatbot**, misalnya: *"Chatbot ini memberi info umum
   seputar Patchmos & pencegahan DBD, bukan pengganti konsultasi medis profesional."*
   — tampil selalu, bukan cuma sekali muncul lalu hilang.
4. **Rate limit sederhana** (misal maksimal N pertanyaan per menit per sesi) supaya kalau
   banyak pengunjung expo nyoba bersamaan, biaya API tidak jebol.
5. **Fallback kalau API gagal/timeout/koneksi venue jelek**: tampilkan pesan statis yang
   sopan ("Maaf, sedang ada gangguan koneksi, coba lagi sebentar ya"), JANGAN sampai UI
   blank/crash saat didemokan di depan juri.
6. **API key LLM taruh di backend (`backend/.env`), backend yang proxy request** — jangan
   taruh API key di kode frontend, karena bisa dilihat siapa saja lewat DevTools browser.
7. **Testing wajib sebelum expo**: coba pertanyaan jebakan — minta dosis obat, minta
   diagnosis dari gejala yang disebutkan, pertanyaan di luar topik sama sekali (politik,
   dll) — pastikan selalu redirect dengan sopan sesuai poin 1-2, bukan menjawab langsung.

**Yang perlu user siapkan sendiri (bukan tugas Claude Code):** akun + API key dari
penyedia LLM (misal Anthropic Claude API lewat console.anthropic.com), ada biaya kecil
per pemakaian token yang jadi tanggungan akun user sendiri.

**Perkiraan effort dengan Claude Code**: realistis 1-3 hari kerja fokus (backend endpoint
proxy + widget chat di frontend + tuning system prompt + testing pertanyaan jebakan),
masih longgar untuk timeline sampai akhir November — tapi kerjakan ini SETELAH 8a-8c
selesai (harga, halaman Tim & Proses), bukan duluan, karena item itu lebih mendesak untuk
konsistensi dengan proposal/poster yang sudah dilihat reviewer.

---

## Ringkasan prioritas eksekusi

| # | Item | Status | Sifat perubahan |
|---|------|--------|------------------|
| 1 | Harga checkout Rp35rb vs proposal Rp12rb | **Tunggu keputusan tim** | Bisnis, sensitif |
| 2 | Klaim "machine learning" | **Sudah diverifikasi 2x (production code + notebook lama) — tidak ada ML. BMKG beneran dipakai, Kemenkes tidak.** Tunggu keputusan tim soal opsi A/B/C. | Investigasi selesai, tinggal keputusan |
| 3 | Broadcast tidak ditarget wilayah risiko tinggi | Tunggu keputusan | Bisnis/fitur |
| 4 | Premium cuma divalidasi di localStorage | Opsional, prioritas rendah | Keamanan |
| 5 | README salah sebut universitas | **Aman, langsung perbaiki** | Editorial |
| 6 | README salah soal lokasi fitur statistik | **Aman, langsung perbaiki (pilih salah satu opsi)** | Editorial/kode kecil |
| 7 | "4 Jam" hardcoded | Opsional | Kualitas kode |

**Urutan kerja yang disarankan:** kerjakan #5 dan #6 dulu (aman, cepat, tidak butuh approval
lebih lanjut) → lakukan verifikasi ulang untuk #2 dan laporkan hasilnya → baru bahas #1 dan
#3 bersama user sebelum menyentuh kode apa pun di situ.
