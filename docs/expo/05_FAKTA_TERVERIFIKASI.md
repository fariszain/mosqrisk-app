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
- **Harga di website: Rp20.000/botol — SEMENTARA** (keputusan tim 2026-11-06; harga final
  diputuskan minggu berikutnya). Tidak ada paket bundling; beli berapa pun = jumlah × harga.

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
- Tren iklim 12 bulan (fitur premium): Open-Meteo Archive API (bukan data pemerintah).
- Skor risiko: **formula matematis** (kurva suhu, curah hujan, kelembapan, modifier angin)
  yang parameternya mengacu literatur (Mordecai dkk. 2017; Liu-Helmersson dkk. 2014).
  **Bukan model machine learning yang dilatih dari data.** Tidak ada library ML di backend.
- **Tidak ada integrasi data Kementerian Kesehatan** di sistem. Kemenkes hanya dikutip
  sebagai sumber statistik kasus di narasi.
- Notifikasi: **email** (bukan WhatsApp).
- Fitur yang ada: Beranda, Peta Pantauan (`/pantau`), Lapor Warga (`/lapor`), Checkout,
  Klaim Premium (kode QR kemasan), Edukasi, Dashboard Admin (ekspor CSV, broadcast email).
- Broadcast admin saat ini terkirim ke **semua** subscriber (belum ditarget per tingkat risiko).
- Penamaan (keputusan C2, 2026-11-06): **"Model Risiko MosqRisk"** (formula berbasis data BMKG
  + parameter literatur). Kata "AI" tidak dipakai untuk skor risiko.
- Bobot formula harian (`calculate_mosquito_risk()`): suhu 40 poin (puncak 28°C), curah hujan
  harian 35 poin (0,5–20 mm ideal), kelembapan 25 poin (penuh mulai 80%); kategori: TINGGI ≥ 75,
  SEDANG 50–74, RENDAH < 50. Prakiraan BMKG yang dipakai: hari ini + 2 hari (tampil sebagai
  "prakiraan risiko 3 hari").
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
