# Roadmap MosqRisk / Patchmos — Persiapan Expo (6–30 November 2026)

> Dokumen kerja utama. Kalau bertentangan dengan `ISU_PROPOSAL_VS_WEB.md`, **roadmap ini yang
> berlaku**. Fakta & klaim: `05_FAKTA_TERVERIFIKASI.md`. Desain: `02_DESIGN_BRIEF.md`.
> Chatbot: `03_CHATBOT_SPEC.md`. Prompt Claude Code: `04_PROMPTS.md`. Log: `PROGRESS.md`.

## Urutan prioritas (dan alasannya)

1. **Kejujuran klaim & keamanan** — paling murah dikerjakan, paling mahal kalau ketahuan juri.
   Beberapa klaim di web sekarang bisa dibaca sebagai afiliasi resmi palsu atau klaim
   kesehatan tanpa bukti (lihat Fase 1). Ini harus beres sebelum desain disentuh.
2. **Desain ulang** — supaya web tidak terasa template AI dan konsisten dengan poster/kemasan.
3. **Fitur baru (chatbot)** — nilai tambah, dikerjakan setelah fondasi aman.
4. **QA & kesiapan expo** — uji di HP sungguhan, rencana cadangan kalau internet venue jelek.

## Jadwal (sesuaikan kalau tanggal expo sudah pasti)

| Waktu | Fokus | Siapa |
|---|---|---|
| 6–7 Nov (sesi Opus max) | Fase 0 setup → Fase 1 → Fase 2 sampai checkpoint desain | Kamu (Fase 0), Claude Code |
| 8–14 Nov | Fase 3 redesign per halaman; keputusan harga final → ganti 1 konstanta | Claude Code + tim |
| 15–21 Nov | Fase 4 chatbot (setelah API key siap); isi foto tim; hasil uji lab kalau ada | Claude Code + tim |
| 22–28 Nov | Fase 5 QA & freeze; deploy final setelah kamu setujui | Claude Code + kamu |
| 29–30 Nov | Cadangan waktu / expo | — |

---

## Fase 0 — Setup (manual, oleh kamu, ±30 menit)

Langkah lengkap di `00_MULAI_DI_SINI.md`: matikan atribusi AI, kunci `.env`, pasang plugin
(`frontend-design`, `context7`, `security-guidance`), pasang MCP (Playwright, Supabase
read-only), buat branch kerja, mulai sesi Opus 5.5 effort max.

---

## Fase 1 — Kejujuran klaim, keamanan, harga (P0)

| ID | Lokasi | Masalah sekarang | Perubahan | Checkpoint |
|---|---|---|---|---|
| 1.1 | `components/Footer.tsx` ±baris 68–69 | Badge "**Terintegrasi Resmi — Kemenkes RI & BMKG**" di semua halaman. Tidak ada integrasi Kemenkes; BMKG hanya API publik. | Ganti jadi atribusi sumber data yang jujur, mis. "Data cuaca: BMKG (API publik)" + "Statistik kasus: Kemenkes RI". Hapus kata "resmi". | — |
| 1.2 | `backend/main.py` `send_broadcast_emails()` | Subjek email "🚨 PERINGATAN DINI **KEMENKES** 🚨" — mengatasnamakan kementerian. | Subjek & isi atas nama MosqRisk; tanpa emoji. Cek juga email lain (welcome, info warga). | — |
| 1.3 | `app/page.tsx` ±baris 170–215 | Komentar kode sendiri bilang "**Simulasi Testimoni**": 3 orang rekaan (Siti Rahma, Budi Santoso, Anita Dewi), bintang 5, dan klaim "anak saya yang alergi… sekarang aman". | Hapus section, atau ganti dengan kutipan asli responden (dengan izin). | **C1** |
| 1.4 | Lihat daftar di bawah | Klaim produk tanpa bukti. | Ganti sesuai `05_FAKTA §6`. | — |
| 1.5 | `app/page.tsx`, `Footer.tsx`, `layout.tsx` metadata, `/pantau`, `/lapor`, `/edukasi` | Skor risiko disebut "AI/Kecerdasan Buatan" padahal formula (lihat `05_FAKTA §5`). | Rekomendasi: sebut "Model Risiko MosqRisk (data BMKG + parameter literatur)"; kata "AI" disimpan untuk chatbot. | **C2** |
| 1.6 | `app/checkout/page.tsx`, `backend/main.py` (label `item_details`) | Harga Rp35.000 + paket 2/3 botol. Form minta alamat tapi **alamat tidak disimpan ke mana pun**; tidak ada tabel pesanan; verifikasi QRIS hanya `setTimeout` 1,5 detik lalu memberi premium; Midtrans masih **sandbox** (`layout.tsx`). | Harga = 1 konstanta `20000` + quantity stepper (detail di `ISU_PROPOSAL_VS_WEB.md §1`). Sisanya tergantung C3. | **C3** |
| 1.7a | `backend/main.py` `verify_admin()` | `ADMIN_KEY` punya default `"kemenkes123"` (juga tertulis di AGENTS.md). Kalau env di Vercel kosong, dashboard admin terbuka dengan password publik. | Hapus default; kalau env kosong → tolak semua akses admin (fail closed). Perbarui dokumentasi. | — |
| 1.7b | Supabase (lihat `supabase_setup.sql`) | Policy `premium_codes` mengizinkan **anon SELECT/INSERT/UPDATE `USING (true)`** — kalau masih aktif, siapa pun dengan anon key publik bisa membaca semua kode premium. Frontend tidak memakai tabel ini langsung (klaim lewat backend), jadi aman diperketat. | Audit policy semua tabel lewat Supabase MCP (read-only) + security advisor. Tulis file migration SQL. **Jangan ubah/hapus baris data apa pun** (termasuk kode demo). | **C4** |
| 1.8 | `README.md` baris ±225, bagian Beranda; `AGENTS.md` | README menyebut "Universitas Teuku Umar"; klaim statistik Beranda tidak sesuai kode. | Perbaiki sesuai `ISU_PROPOSAL_VS_WEB.md §5–6`. | — |
| 1.9 | `Footer.tsx` | Link "Kebijakan Privasi" & "Syarat & Ketentuan" mengarah ke `#`, padahal web mengumpulkan email, lokasi, laporan, nama/telepon/alamat. | Buat halaman Kebijakan Privasi sederhana & jujur (apa yang dikumpulkan, untuk apa, kontak). Bisa dikerjakan bersama Fase 3. | — |

### Daftar klaim untuk 1.4 (temuan grep 2026-11-06)

| Lokasi | Teks sekarang | Ganti dengan |
|---|---|---|
| `checkout/page.tsx` ±171, ±217 | "100% ALAMI", "100% Bahan Alami" | "Bahan aktif alami dari ampas nilam" |
| `edukasi/page.tsx` ±681 | "Aman untuk bayi, ibu hamil, dan kulit sangat sensitif" | Hapus |
| `edukasi/page.tsx` ±684 | "Teruji Laboratorium" (deskripsinya sendiri bilang "estimasi berdasarkan literatur") | "Uji laboratorium sedang direncanakan" atau hapus |
| `edukasi/page.tsx` ±683 | "Zero Waste Product … 100% dari ampas daur ulang" | "Memanfaatkan ampas nilam pascasuling" |
| `edukasi/page.tsx` ±632, `page.tsx` ±152 | "100% bebas DEET kimia", "100% Bebas DEET & Aman" | "Tanpa DEET" |
| `edukasi/page.tsx` ±234 | "Sumber: Kemenkes RI, **Proyeksi** Kasus 2025" | "Sumber: Kementerian Kesehatan (2026), data kasus 2025" |
| `page.tsx` ±163 | "**Satu-satunya** penolak nyamuk yang dilengkapi Early Warning System… via Email/**WhatsApp**" | Tanpa superlatif; "via email" |
| `Footer.tsx` ±25 | "Platform … **pertama di Indonesia**" | Tanpa superlatif |
| `page.tsx` ±56 | "pelindung kulit alami yang **ampuh, aman**" | Klaim yang bisa dibuktikan, mis. "bahan aktif alami dari ampas nilam, tanpa DEET" |
| `edukasi/page.tsx` ±646 | "*patchouli alcohol* yang terbukti secara laboratorium efektif" | Boleh, asal jelas ini temuan literatur tentang senyawanya + kutip sumbernya, bukan uji produk |

Setelah daftar ini, Claude Code wajib grep ulang seluruh `frontend/` dan `backend/` untuk
kata: `resmi`, `kemenkes`, `bmkg`, `100%`, `terbukti`, `teruji`, `aman`, `satu-satunya`,
`pertama`, `whatsapp`, `AI`, `kecerdasan` — lalu cocokkan dengan `05_FAKTA`.

### Kriteria selesai Fase 1
- Tidak ada lagi klaim di daftar terlarang `05_FAKTA §6` (bukti: output grep).
- Harga tampil Rp20.000/botol, total = jumlah × harga, label pembayaran ikut dinamis.
- Admin menolak akses kalau `ADMIN_KEY` kosong (bukti: uji lokal).
- File migration RLS tersedia + penjelasan; belum dijalankan (menunggu C4).
- `npx tsc --noEmit` tidak menambah error baru; `npm run build` sukses.
- Screenshot sebelum/sesudah untuk halaman yang berubah; `PROGRESS.md` diperbarui.

---

## Fase 2 — Arah desain (eksplorasi → kamu memilih)

Ikuti `02_DESIGN_BRIEF.md` bagian "Proses Fase 2". Hasilnya: 2–3 prototipe hero Beranda di
route sementara `/design-lab/...`, screenshot desktop & mobile berdampingan, rekomendasi
Claude Code + alasannya → **C5: kamu memilih**. Setelah dipilih, Claude Code menulis design
system final ke `.claude/skills/mosqrisk-design/SKILL.md`, token di `globals.css`, dan
memperbarui bagian desain di `AGENTS.md`.

---

## Fase 3 — Redesign seluruh halaman

Urutan (dari yang paling dilihat juri): **Beranda → `/tim` (baru) → `/pantau` → `/checkout`
→ `/lapor` → `/edukasi` → `/claim` → `/admin` → komponen global** (Navbar, BottomNav, Footer,
ClaimModal).

Per halaman: pahami logika lama dulu (fetch API, auth Google, Midtrans, scanner QR, premium)
→ rancang ulang sesuai skill desain → screenshot 1440 & 390 → kritik pakai checklist
`02_DESIGN_BRIEF §7` → perbaiki → typecheck → commit.

Isi khusus:
- **`/tim`**: foto + peran 5 anggota + dosen pendamping (`05_FAKTA §1`), galeri dokumentasi
  produksi asli, dan bagian "Hasil Uji" yang memisahkan uji persepsi (sudah) dari uji lab
  (direncanakan). Foto disiapkan tim di `frontend/public/tim/` — tanpa foto stok/AI.
- **Rantai ekonomi sirkular**: petani nilam → penyulingan → ampas nilam → Patchmos →
  pengguna → data MosqRisk, sebagai satu diagram yang jujur (tanpa angka baru).
- **Ikon**: satu keluarga; hapus CDN Material Symbols & paket `phosphor-icons` lama setelah
  tidak dipakai. Hapus font yang dimuat tapi tidak dipakai (Geist).
- Hapus route `/design-lab` setelah Beranda selesai.

### Kriteria selesai Fase 3
- Semua halaman memakai token & komponen dari design system; tidak ada pola di daftar
  "AI slop" `02_DESIGN_BRIEF §3`.
- Semua fungsi lama tetap jalan (uji manual alur: pantau → lokasi → skor; lapor; klaim kode;
  checkout sampai popup pembayaran; login admin).
- Galeri screenshot semua halaman (desktop + mobile) untuk kamu review.

---

## Fase 4 — Chatbot

Spesifikasi lengkap & keputusan provider: `03_CHATBOT_SPEC.md`. Prasyarat dari kamu: API key
sudah diisi di `backend/.env` dan env Vercel; isi knowledge base bagian kesehatan sudah
dicek tim.

---

## Fase 5 — QA & kesiapan expo

- Uji di HP sungguhan (Android & iPhone kalau ada), lebar 360–430 px, tanpa scroll horizontal.
- Aksesibilitas: kontras AA, fokus keyboard terlihat, tap target ≥ 44 px, `prefers-reduced-motion`.
- Semua link hidup; state error ditangani (BMKG lambat/gagal, backend mati, kuota chatbot habis).
- Coba matikan `typescript.ignoreBuildErrors` & bereskan error (kalau sempat; jangan memaksa
  menjelang deadline).
- Review independen: subagent reviewer + `/code-review` pada diff besar.
- Rencana cadangan expo: video/screenshot demo offline, hotspot HP, akun admin & kode demo
  siap, QR di kemasan sudah dites mengarah ke URL yang benar.
- Deploy ke preview → kamu cek → baru production (Claude Code **tidak** deploy sendiri).

---

## Keputusan yang menunggu kamu/tim

| Keputusan | Kapan dibutuhkan | Catatan |
|---|---|---|
| ~~C1 Testimoni: hapus atau kutipan asli?~~ | Fase 1 | **Diputuskan 2026-11-06**: diganti ringkasan uji persepsi (label jujur) |
| ~~C2 Penyebutan "AI" untuk skor risiko~~ | Fase 1 | **Diputuskan 2026-11-06**: "Model Risiko MosqRisk" |
| ~~C3 Jual sebelum expo lewat web atau offline?~~ | Fase 1 | **Diputuskan 2026-11-06**: dua-duanya — online lewat checkout + Midtrans (tabel `orders`, label "mode uji coba" selama sandbox) dan offline dicatat admin di `/admin` |
| C4 Jalankan migration RLS + tabel `orders` | Fase 1 | Kamu review lalu jalankan di SQL Editor Supabase (langkah di `PROGRESS.md`) |
| C5 Arah desain | Fase 2 | Pilih dari prototipe |
| Harga final | Minggu depan | Cukup ganti 1 konstanta + teks di `05_FAKTA` |
| Provider LLM + kartu pembayaran | Sebelum Fase 4 | Lihat `03_CHATBOT_SPEC §1` |
| Foto tim & dokumentasi produksi | Sebelum `/tim` final | Taruh di `frontend/public/tim/` |
| Hasil uji lab | Kapan pun tersedia | Tambahkan ke `05_FAKTA` dulu, baru ke web |
| Klaim kesehatan vs perizinan | Sebelum expo | Selaraskan dengan hasil konsultasi BPOM yang dipegang Rafi |
| Render produk masih "100 mL" (proposal: 50 mL) | Sebelum Fase 3 Beranda final | Perbarui artwork kemasan (bagian Digital & Branding), lalu ganti file di `frontend/public/brand/` dengan nama yang sama |

## Di luar cakupan (sengaja tidak dikerjakan)

- Melatih model machine learning (ditunda; jawab jujur kalau ditanya juri).
- Kode premium demo & data dummy (sudah diurus kamu — jangan disentuh).
- Mengubah proposal (sudah final).
