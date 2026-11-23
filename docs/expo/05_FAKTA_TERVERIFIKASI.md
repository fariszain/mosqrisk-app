# Fakta Terverifikasi — Sumber Kebenaran Satu-satunya

> Semua angka, klaim, dan teks faktual di website, chatbot, dan materi expo **hanya boleh**
> diambil dari file ini. Kalau sebuah klaim tidak ada di sini, anggap **belum terbukti** dan
> jangan ditulis. Perbarui file ini dulu (dengan sumbernya) sebelum menambah klaim baru.
>
> Dokumen sumber: **Proposal PIKU Batch II USK 2026** (final, sudah disubmit — tidak bisa
> diubah) dan **Proposal UTU Awards 2026** (untuk data uji persepsi). Diperiksa 2026-11-06.

---

## 1. Identitas

| Item | Fakta |
|---|---|
| Produk | Patchmos — spray bio-repellent berbahan aktif dari ampas nilam (limbah penyulingan) |
| Platform digital | MosqRisk Analytics (web, terhubung lewat kode QR di kemasan) |
| Program | Program Pendanaan Internal Kewirausahaan (PIKU) Batch II, Universitas Syiah Kuala |
| Institusi | Universitas Syiah Kuala (USK), Banda Aceh — **bukan** Universitas Teuku Umar |
| Kontak | mosqrisk.official@gmail.com |

### Tim (Proposal PIKU, Tabel 6)

| Nama | Peran | Tanggung jawab utama |
|---|---|---|
| Rafi Athallah | Ketua Tim | Koordinasi tim; perizinan (NIB, konsultasi BPOM, pendaftaran merek) |
| Sofia | Anggota – Produksi | Ekstraksi, mikroenkapsulasi, formulasi, uji produk (Teknik Kimia) |
| Talha Della Chintya | Anggota – Keuangan & Pemasaran | Keuangan, RAB & laporan, strategi pemasaran & kemitraan |
| Faris Zain As-Shadiq | Anggota – Digital & Branding | Sistem MosqRisk Analytics, desain kemasan, branding |
| Naila Rizqa | Anggota – Media Sosial | Konten & edukasi media sosial Patchmos |
| Cut Aprilia, S.E., M.Interbuss. | Dosen Pendamping | Pembimbingan strategis usaha, arahan log book |

---

## 2. Masalah (Proposal PIKU, Latar Belakang)

- Sepanjang **2025** tercatat **161.752 kasus DBD** dengan **673 kematian** (CFR **0,42%**)
  serta 443.530 kasus malaria — sumber: Kementerian Kesehatan (2026).
  Tulis "data kasus 2025", **bukan** "proyeksi".
- Indonesia menguasai **sekitar 95%** pasar minyak nilam dunia; Aceh salah satu sentra
  produksi utama — sumber: Pusat Data dan Sistem Informasi Pertanian (2024).
- Penyulingan hanya menghasilkan sekitar **1,5–3%** minyak atsiri; **lebih dari 95%** sisanya
  limbah padat yang umumnya belum dimanfaatkan — sumber: Indriani dkk. (2025).
- Ampas nilam masih mengandung senyawa bioaktif seperti seskuiterpen dan *patchouli alcohol*
  yang **berpotensi** dimanfaatkan sebagai repellent alami — sumber: Hikal dkk. (2023).
  (Ini temuan literatur tentang senyawanya, bukan hasil uji produk Patchmos.)

---

## 3. Produk (Proposal PIKU, Tabel 8 & tabel tahapan produksi)

- Kemasan: botol spray gelap **50 mL** + label + kode QR; simpan pada suhu < 30°C.
- ⚠️ Render produk resmi (`frontend/public/brand/patchmos-produk.png`) masih bertuliskan
  **100 mL** di botol dan kotak (desain era proposal UTU). Proposal PIKU final = **50 mL**.
  Jangan menulis "100 mL" di teks web. Render perlu diperbarui oleh tim (penanggung jawab
  desain kemasan) — gambar produk **tidak boleh** diedit oleh AI.
- Proses: ekstraksi **maserasi** dengan etanol 96% (rasio bahan:pelarut 1:10), pelarut
  diuapkan → **mikroenkapsulasi** dengan bahan dinding **gelatin + gum arab** →
  formulasi spray dengan **Tween 80** sebagai emulsifier.
- Konsekuensi untuk klaim: bahan **aktif** berasal dari alam (ampas nilam), tetapi formula
  memakai bahan penolong non-alami (Tween 80). Jadi **jangan** menulis "100% alami".
  Tulis: "bahan aktif alami dari ampas nilam".
- Tidak mengandung DEET (tidak ada DEET dalam formula) → boleh menulis "tanpa DEET".
- HPP (proposal): Rp4.000/botol. Harga jual di proposal: Rp12.000/botol.
- **Ongkir (keputusan Claude atas permintaan user "pikir saja gimana bagusnya", 2026-11-07, SEMENTARA)**:
  dua pilihan di checkout — *Diantar tim Patchmos* (khusus Banda Aceh & Aceh Besar) dan *Ambil sendiri*
  (sekitar kampus USK, Darussalam). Keduanya **gratis** (`ongkir: 0` di `backend/produk.json`); luar wilayah
  itu diarahkan ke email. Ganti angka `ongkir` bila tim memutuskan menagih ongkir.
- **Harga di website: Rp20.000/botol — SEMENTARA** (keputusan tim 2026-11-06; harga final
  diputuskan minggu berikutnya). Tidak ada paket bundling; beli berapa pun = jumlah × harga.
  Satu sumber di kode: `backend/produk.json` (dipakai backend untuk menagih dan frontend untuk menampilkan).

---

## 4. Validasi & pengujian

### Sudah dilakukan — uji persepsi (Proposal UTU Awards 2026)
- **10 responden**, usia **20–58 tahun**, memakai sampel produk selama **5 hari**.
- Kelayakan **92,8%**, kepraktisan **94,5%**, keefektifan **92,5%**.
- **Tidak ditemukan laporan iritasi kulit** pada seluruh responden selama masa uji coba.
- Wajib diberi label: **"uji persepsi pengguna, bukan uji klinis"**.

### Direncanakan, BELUM dilakukan (per 2026-11-06)
- Uji efikasi repellent — adaptasi *cage test* WHO, target: *Complete Protection Time* terukur.
- Uji keamanan kulit — *patch test* pada panelis, pengamatan 30 menit–96 jam.
- Sampai hasilnya ada: tulis "sedang direncanakan" — **jangan** tulis "teruji laboratorium",
  "terbukti aman", "terbukti efektif", atau "aman untuk bayi/ibu hamil".

---

## 5. MosqRisk Analytics (hasil pemeriksaan kode, 2026-11-05/06)

- Data cuaca: **BMKG — API publik prakiraan cuaca** per kode wilayah ADM4
  (`api.bmkg.go.id/publik/prakiraan-cuaca`). Ini pemakaian data publik, **bukan** kemitraan
  atau integrasi resmi dengan BMKG.
- Tren iklim 12 bulan: Open-Meteo Archive API (bukan data pemerintah). Tampil **publik** di `/edukasi`
  (bukan fitur Premium). Fitur Premium = prakiraan risiko 3 hari + notifikasi email.
- Skor risiko: **formula matematis** — turunan rumus angka penularan R0 (Mordecai dkk. 2017) dari prakiraan
  cuaca BMKG. **Bukan model machine learning yang dilatih dari data.** Tidak ada library ML di backend.
- **Tidak ada integrasi data Kementerian Kesehatan** di sistem. Kemenkes hanya dikutip
  sebagai sumber statistik kasus di narasi.
- Notifikasi: **email** (bukan WhatsApp).
- Fitur yang ada: Beranda, Peta Pantauan (`/pantau`), Lapor Warga (`/lapor`), Checkout,
  Klaim Premium (kode QR kemasan), Edukasi, Dashboard Admin (ekspor CSV, broadcast email).
- Broadcast admin saat ini terkirim ke **semua** subscriber (belum ditarget per tingkat risiko).
- Penamaan (keputusan C2, 2026-11-06): **"Model Risiko MosqRisk"** (formula berbasis data BMKG
  + parameter literatur). Kata "AI" tidak dipakai untuk skor risiko.
- **Rumus v4 (2026-11-07 malam, diminta user: "rumus sebenar-benarnya yang fix dan pasti")** — satu sumber
  parameter `backend/rumus_risiko.json` (dibaca backend + simulator `/edukasi`):
  **Indeks = 100 × S_suhu × S_kelembapan × S_hujan** (tiap S 0–1), dibulatkan biasa. Bentuk PERKALIAN mengikuti
  R0 (Ross–Macdonald): satu syarat nol → penularan nol. Rumus poin yang dijumlah (v1–v3, juga tabel di slide PIKU)
  keliru secara konsep: 10 °C + lembap + hujan tetap dapat "Sedang".
  - **S_suhu — dari jurnal, tanpa tebakan:** R0(T) persamaan (1) Mordecai dkk. (2017), PLOS NTD 11(4): e0005568,
    untuk *Ae. aegypti* × DENV, dinormalkan ke puncaknya. 8 kurva sifat (a, EFD, pEA, MDR, lf, b, c, PDR) disalin
    dari **S2 Text Tabel B** (rata-rata posterior T0, Tm, c; dicek 2026-11-07 dari PDF lampiran PLOS). Hasil hitung:
    puncak 29,0 °C (jurnal 29,1; CI 28,4–29,8), nol di atas 34,6 °C (jurnal 34,6), nol di bawah 17,1 °C (jurnal 17,8;
    CI 14,6–21,2 — jurnal merata-rata seluruh sampel posterior, kita memakai parameter rata-rata). Contoh nilai:
    24 °C 0,43; 26 °C 0,73; 28 °C 0,96; 29 °C 1,00; 31 °C 0,85; 33 °C 0,45. N & r (kepadatan penduduk, lama sembuh)
    konstan sehingga hilang saat dinormalkan.
  - **S_kelembapan — ASUMSI TIM:** 0,7 pada ≤ 40% → 1 pada ≥ 80% (linear). Arah pengaruh: Schmidt dkk. (2018),
    Parasites & Vectors 11: 267 (udara kering memperpendek umur nyamuk). Angka 0,7/40/80 pilihan tim.
  - **S_hujan — ASUMSI TIM:** 0,8 pada 0 mm → 1 pada 5–50 mm → 0,8 pada ≥ 100 mm/hari. Tidak nol saat kering karena
    *Aedes* bertelur di wadah air rumah. Arah pengaruh: kategori hujan harian BMKG (ringan 5–20, sedang 20–50, lebat
    50–100 mm/hari) dan Benedum dkk. (2018), PLOS NTD 12(12): e0006935 (flushing).
  - Kategori (keputusan tim): TINGGI ≥ 75, SEDANG 50–74, RENDAH < 50 — "cuaca mendukung ≥ 75% penularan maksimum".
  - Dasar data: **rata-rata harian** suhu & kelembapan + total hujan dari record BMKG per 3 jam untuk tanggal lokal.
  - Skor = **indeks kesesuaian cuaca**, BUKAN prediksi jumlah kasus DBD.
- Riwayat: v3 (07-11 siang) poin dijumlah 40/25/35 dengan garis lurus (suhu 18→26–29→34 °C); v2 Gaussian optimum
  28 °C, lompatan kelembapan di 60%, dari satu record per 3 jam. Klaim "bobot sama dengan proposal" di v3 **keliru**:
  40/25/35 berasal dari kode lama; slide PIKU memuat tabel lain (40/30/30 bertingkat) yang sumbernya tidak diketahui
  dan tidak pernah dipakai di kode.
- Versi bulanan (`/api/climate-trend`, grafik 12 bulan di `/edukasi`): rumus v4 yang sama pada rata-rata bulanan;
  S_hujan memakai total hujan sebulan (0,8 pada 0 mm → 1 pada 100–300 mm → 0,8 pada ≥ 600 mm, asumsi tim).
  Pengali angin v2/v3 dihapus (sumber kuantitatifnya tidak pernah tercatat).
- Contoh hasil nyata 2026-11-07 malam (BMKG): Kota Banda Aceh 59 SEDANG (26,0 °C, 89%, 0,2 mm); Minggu 71, Senin 70.
- API `/api/mosqrisk` mengirim pengali 0–1 per faktor (`risk_factors.{suhu,kelembapan,hujan}.nilai`), `basis` (tanggal & jumlah record),
  dan `current` (record per 3 jam terdekat untuk ikon/keterangan cuaca). Satu kabupaten/kota diwakili satu
  titik desa/kelurahan BMKG (`regency_to_adm4.json`); nama titiknya ditampilkan di bawah skor.
- Email notifikasi dikirim saat: (a) ada laporan warga di wilayah langganan, (b) admin mengirim
  peringatan ke semua pelanggan. **Tidak ada** peringatan otomatis berbasis perubahan skor.
- Status Premium disimpan di browser (localStorage), tidak ada masa berlaku dan tidak terikat
  akun. Tidak ada diskon untuk pengguna Premium.

---

## 6. Klaim yang DILARANG (sampai ada bukti baru yang dicatat di file ini)

- "Terintegrasi resmi Kemenkes RI / BMKG", "mitra resmi", "PERINGATAN DINI KEMENKES",
  logo instansi pemerintah apa pun.
- "100% alami", "100% dari ampas daur ulang", "zero waste".
- "Aman untuk bayi / ibu hamil / kulit sangat sensitif", "terbukti aman", "terbukti efektif",
  "teruji laboratorium", "teruji klinis", "dermatologically tested".
- "Satu-satunya…", "pertama di Indonesia…", superlatif lain yang tidak bisa dibuktikan.
- "Machine learning" / "AI" untuk mesin skor risiko (lihat §5) — kecuali tim memutuskan lain
  di checkpoint C2 roadmap. Chatbot (setelah dibangun dengan LLM) boleh disebut asisten AI.
- Notifikasi WhatsApp (belum ada).
- Testimoni dari orang yang tidak benar-benar memberi testimoni. Testimoni hanya boleh dari
  responden/pembeli nyata, dengan izin, dan ditulis apa adanya.
- Angka apa pun yang tidak tercantum di file ini.

---

## 7. Informasi kesehatan umum (untuk `/edukasi` & KB chatbot) — ⚠️ PERLU DICEK TIM

Ditambahkan 2026-11-07 dari sumber resmi berikut. Bukan klaim produk. Sebelum expo, minta anggota
tim/dosen yang paham kesehatan memeriksa kesesuaian kalimatnya dengan sumber.

| Topik | Isi yang dipakai di web | Sumber |
|---|---|---|
| Gejala DBD | Banyak orang bergejala ringan/tanpa gejala; bila muncul, mulai 4–10 hari setelah tertular dan berlangsung 2–7 hari: demam tinggi, sakit kepala berat, nyeri di belakang mata, nyeri otot & sendi, mual & muntah, pembengkakan kelenjar, ruam | WHO, *Dengue and severe dengue* (https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue) |
| Tanda bahaya | Sakit perut hebat, muntah terus-menerus, napas cepat, gusi/hidung berdarah, muntah/tinja berdarah, sangat lemas/gelisah/sangat haus → segera ke fasilitas kesehatan (tanpa klaim waktu) | WHO (lembar fakta di atas) |
| Siklus *Aedes* | Telur di dinding wadah berair, bisa bertahan kering berbulan-bulan; jentik & pupa hidup di air, pupa tidak makan; telur → dewasa ±7–10 hari; hanya betina yang menggigit | CDC, *Life Cycle of Aedes Mosquitoes* (https://www.cdc.gov/mosquitoes/about/life-cycles/aedes.html) |
| Pencegahan 3M | Menguras (bak mandi, ember) secara rutin, menutup (drum, tangki), mendaur ulang barang bekas penampung air | Kemenkes, *Upaya Pencegahan DBD dengan 3M Plus* (https://ayosehat.kemkes.go.id/upaya-pencegahan-dbd-dengan-3m-plus) |
| Contoh "Plus" | Ikan pemakan jentik, obat anti nyamuk, kelambu, bubuk larvasida di wadah yang sulit dikuras | Kemenkes (https://www.kemkes.go.id/id/rumah-dan-sekolahku-adalah-tembok-perlindungan-pertama-dbd) |

Tidak dipakai (tidak ada di halaman sumber yang ditautkan — dicek reviewer independen 2026-11-07):
jumlah telur per siklus, umur nyamuk dewasa, jam aktif menggigit, durasi per tahap (jentik ±5 hari, pupa
2–3 hari), "tanda bahaya hari ke-3 s/d ke-7", "menguras minimal seminggu sekali", kawat kasa, gotong royong.

