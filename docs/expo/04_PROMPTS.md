# Prompt Siap Tempel untuk Claude Code

Pakai satu prompt per sesi. Di antara sesi: pastikan `PROGRESS.md` terisi → `/clear` →
prompt berikutnya. Mulai sesi dengan `claude --model claude-opus-5-5 --effort max`.

---

## PROMPT 1 — Fase 1 (kejujuran & keamanan) + Fase 2 (arah desain)

```text
Kamu adalah lead engineer sekaligus design lead untuk MosqRisk/Patchmos (Next.js 16 App Router + FastAPI + Supabase, deploy di Vercel). Targetnya: website siap dipamerkan di expo akhir November 2026 — jujur dalam setiap klaim, aman, dan desainnya terasa dirancang khusus untuk produk ini, bukan template AI.

## Baca dulu, berurutan
1. AGENTS.md (sudah termuat) — terutama "Aturan Tetap Proyek".
2. docs/expo/01_ROADMAP.md — fase, ID tugas, checkpoint, kriteria selesai.
3. docs/expo/05_FAKTA_TERVERIFIKASI.md — satu-satunya sumber angka & klaim.
4. docs/expo/02_DESIGN_BRIEF.md — arahan desain dan proses Fase 2.
5. ISU_PROPOSAL_VS_WEB.md — audit sebelumnya (detail file & baris; roadmap menang kalau bertentangan).
6. docs/expo/PROGRESS.md — lanjutkan dari catatan terakhir kalau ada.
Setelah membaca, tulis ringkasan maksimal 8 baris: apa yang kamu pahami, 3 risiko terbesar yang kamu lihat, dan urutan kerjamu. Lalu langsung bekerja.

## Misi sesi ini
Selesaikan Fase 1 seluruhnya, lalu Fase 2 sampai CHECKPOINT C5. Jangan memulai Fase 3.

## Aturan yang tidak bisa ditawar
- Tidak ada atribusi AI di commit/PR (tanpa Co-Authored-By, tanpa "Generated with"). Setelah commit pertama jalankan `git log -1 --format=%B` dan tunjukkan hasilnya ke saya.
- Jangan `git push`, deploy, mengubah env Vercel, atau menjalankan migrasi database.
- Supabase MCP hanya untuk membaca. Jangan mengubah/menghapus baris data apa pun (termasuk kode premium demo, laporan, subscriber). Perubahan RLS/skema: tulis file migration SQL + penjelasan, lalu berhenti di C4.
- Jangan membaca file .env. Nama variabel cukup dari .env.example, README, atau AGENTS.md.
- Jangan mengarang angka, testimoni, hasil uji, atau afiliasi resmi. Klaim yang tidak ada di 05_FAKTA dianggap tidak terbukti.
- Keputusan final yang tidak boleh diubah: tanpa paket bundling; harga sementara Rp20.000/botol sebagai satu konstanta; kode demo & data dummy tidak disentuh; tidak melatih model ML; proposal tidak diubah; gambar logo & produk asli tidak diedit.
- Teks UI dalam Bahasa Indonesia.

## Cara kerja
1. Buat task list memakai ID roadmap (1.1 … 1.9). Kerjakan berurutan. Tandai selesai hanya setelah diverifikasi.
2. Di awal, kumpulkan C1, C2, dan C3 dalam SATU pertanyaan (AskUserQuestion, opsi jelas + rekomendasimu di urutan pertama). Sambil menunggu jawaban, kerjakan item lain.
3. Verifikasi setiap perubahan:
   - Frontend: `cd frontend && npx tsc --noEmit`. Catat error yang SUDAH ada sebelum kamu mulai, pisahkan dari error baru. Di akhir fase: `npm run build` harus sukses.
   - Backend: jalankan uvicorn lokal, uji endpoint yang diubah dengan curl, tunjukkan output.
   - Visual: Playwright MCP, screenshot 1440×900 dan 390×844 untuk setiap halaman yang berubah, simpan di `.screenshots/fase-<n>/<halaman>-<lebar>.png`. BACA screenshot itu dan kritik sendiri sebelum menyatakan selesai.
   - Klaim: setelah 1.4 selesai, grep ulang seluruh frontend/ dan backend/ untuk kata di roadmap (resmi, kemenkes, bmkg, 100%, terbukti, teruji, aman, satu-satunya, pertama, whatsapp, AI, kecerdasan) dan tunjukkan bahwa sisa kemunculannya sesuai 05_FAKTA.
4. Commit kecil per ID tugas dengan pesan jelas. Tanpa atribusi.
5. Akhir Fase 1: minta subagent reviewer dengan konteks bersih memeriksa diff terhadap "Kriteria selesai Fase 1" di roadmap. Laporkan hanya temuan yang memengaruhi kebenaran klaim, keamanan, atau fungsi. Perbaiki, lalu perbarui docs/expo/PROGRESS.md (apa yang berubah, bukti verifikasi, keputusan yang masih terbuka).

## Checkpoint (berhenti dan tanya saya)
- C1 Testimoni simulasi: hapus atau ganti dengan kutipan asli dari saya?
- C2 Kata "AI" untuk skor risiko: ganti jadi "Model Risiko MosqRisk" atau biarkan?
- C3 Penjualan sebelum expo lewat web atau offline? Jelaskan konsekuensi tiap opsi (penyimpanan pesanan & alamat, Midtrans sandbox vs produksi, QRIS + konfirmasi manual).
- C4 File migration RLS siap — tunjukkan isinya, risiko, dan cara saya menjalankannya; jangan dijalankan.
- C5 Pilihan arah desain.

## Fase 2 — eksplorasi arah desain
Ikuti bagian 5 "Proses Fase 2" di 02_DESIGN_BRIEF.md secara lengkap: audit screenshot halaman sekarang, sampling warna dari frontend/public/brand/patchmos-logo.png dan patchmos-produk.png, kartu arah A/B/C di docs/expo/design-lab.md, kritik diri terhadap pola template AI (dan revisi), prototipe hero Beranda + satu section per arah di frontend/app/design-lab/[arah]/page.tsx memakai aset asli dan teks dari 05_FAKTA, lalu lembar perbandingan screenshot desktop & mobile. Pakai skill frontend-design. Tunjukkan lembar perbandingan, rekomendasimu beserta alasannya, lalu berhenti di C5.

## Sesi ini selesai kalau
- Semua item Fase 1 selesai atau tercatat menunggu checkpoint, dengan bukti verifikasi.
- `npm run build` sukses, tidak ada klaim terlarang tersisa.
- PROGRESS.md diperbarui.
- Prototipe arah desain siap saya pilih.
Kalau konteks mulai penuh sebelum selesai: perbarui PROGRESS.md dengan posisi terakhir dan langkah berikutnya, lalu beri tahu saya untuk /clear dan melanjutkan.
```

---

## PROMPT 1b — setelah kamu memilih arah desain (C5), di sesi yang sama atau baru

```text
Arah desain yang saya pilih: <A/B/C/gabungan + catatan saya>.
Kerjakan langkah 8 "Proses Fase 2" di docs/expo/02_DESIGN_BRIEF.md: tulis .claude/skills/mosqrisk-design/SKILL.md (token warna hex, skala tipografi, spasi, radius, elevasi, aturan ikon, pola komponen, gerak, do/don't dengan contoh kode yang sesuai stack ini), pasang token di frontend/app/globals.css, dan perbarui bagian "Design System & Visual Rules" di AGENTS.md agar merujuk ke skill itu. Jangan merombak halaman dulu. Commit tanpa atribusi, perbarui PROGRESS.md, lalu berhenti.
```

---

## PROMPT 2 — Fase 3 (redesign seluruh halaman)

```text
Lanjutkan proyek MosqRisk. Baca AGENTS.md, docs/expo/01_ROADMAP.md (Fase 3), .claude/skills/mosqrisk-design/SKILL.md, docs/expo/02_DESIGN_BRIEF.md (bagian 6 dan 7), docs/expo/05_FAKTA_TERVERIFIKASI.md, dan docs/expo/PROGRESS.md.

Misi: terapkan design system ke seluruh situs, satu halaman per siklus, urutan: Beranda → /tim (halaman baru) → /pantau → /checkout → /lapor → /edukasi → /claim → /admin → komponen global (Navbar, BottomNav, Footer, ClaimModal) → halaman Kebijakan Privasi (roadmap 1.9 kalau belum).

Siklus tiap halaman:
1. Pahami logika lama dulu: fetch API, auth Google Supabase, Midtrans Snap, scanner QR, status premium, state loading/error. Fungsi tidak boleh rusak.
2. Rancang ulang mengikuti SKILL.md dan hierarki konten di design brief bagian 6.
3. Screenshot 1440×900 dan 390×844 via Playwright, kritik dengan checklist design brief bagian 7, perbaiki minimal satu putaran, screenshot ulang.
4. `npx tsc --noEmit`, lalu commit tanpa atribusi.

Ketentuan khusus:
- /tim: foto dari frontend/public/tim/. Kalau belum ada, pakai placeholder netral bertuliskan "Foto menyusul" — tanpa foto stok atau gambar orang buatan AI. Peran dari 05_FAKTA bagian 1. Bagian "Hasil Uji": uji persepsi dengan label jujur; uji lab berstatus "sedang direncanakan".
- Rantai ekonomi sirkular (petani nilam → penyulingan → ampas nilam → Patchmos → pengguna → data MosqRisk) sebagai satu diagram jujur, tanpa angka baru.
- Ikon: satu keluarga sesuai SKILL.md. Hapus CDN Material Symbols, paket phosphor-icons lama, dan font Geist setelah tidak dipakai. Hapus route /design-lab setelah Beranda selesai. Cek lalu hapus aset tak terpakai di public/ (termasuk test.html).
- Foto lain di public/ yang asal-usulnya tidak jelas: tanya saya sebelum dipakai besar.
- Jangan menyentuh logika harga (sudah satu konstanta), kode demo, atau data. Jangan push/deploy.

Akhir fase: subagent reviewer untuk konsistensi visual lintas halaman dan regresi fungsi (uji manual alur: pantau → pilih lokasi → skor; lapor; klaim kode; checkout sampai popup pembayaran; login admin). Lalu tampilkan galeri screenshot semua halaman (desktop + mobile) dan perbarui PROGRESS.md.
```

---

## PROMPT 3 — Fase 4 (chatbot)

```text
Bangun chatbot MosqRisk persis sesuai docs/expo/03_CHATBOT_SPEC.md. Baca juga AGENTS.md, docs/expo/05_FAKTA_TERVERIFIKASI.md, .claude/skills/mosqrisk-design/SKILL.md, dan docs/expo/PROGRESS.md.

Prasyarat dari saya: GROQ_API_KEY, CHAT_MODEL (openai/gpt-oss-20b), CHAT_MODEL_FALLBACK (opsional), CHAT_IP_SALT, CHAT_DAILY_GLOBAL_CAP sudah saya isi di backend/.env dan env Vercel (provider: Groq — lihat 03_CHATBOT_SPEC §1 "Update 2026-11-06"). Jangan membaca .env; kode harus jatuh ke mode FAQ statis dengan aman kalau variabel kosong.

Urutan kerja dan checkpoint:
1. backend/chatbot_kb.md dari 05_FAKTA. Bagian kesehatan wajib bersumber resmi (tautan) dan ditandai PERLU DICEK TIM. CHECKPOINT: tunjukkan isi KB ke saya.
2. Endpoint POST /api/chat di FastAPI: system prompt sesuai spec bagian 3, prompt caching, timeout, rantai cadangan sampai FAQ statis.
3. Rate limit berbasis Supabase: tulis file migration SQL (tabel + fungsi atomik). CHECKPOINT: saya yang menjalankan.
4. Widget UI sesuai design system dan spec bagian 4 (di atas BottomNav di mobile, disclaimer permanen, aksesibel).
5. Skrip uji minimal 25 kasus dari spec bagian 5 (termasuk pertanyaan jebakan), jalankan, laporkan dalam tabel: pertanyaan, jawaban singkat, lulus/gagal, alasan. Perbaiki yang gagal sampai lulus.
6. Hitung biaya per 1.000 pertanyaan dari `usage` nyata hasil uji.
7. Perbarui Kebijakan Privasi untuk menyebut chatbot dan apa yang dicatat.
Commit tanpa atribusi per langkah, jangan push/deploy, perbarui PROGRESS.md di akhir.
```

---

## PROMPT 4 — Fase 5 (QA & kesiapan expo)

```text
Fase 5: kesiapan expo MosqRisk. Baca AGENTS.md, docs/expo/01_ROADMAP.md (Fase 5), dan docs/expo/PROGRESS.md.

Kerjakan dan laporkan dengan bukti:
1. Pass mobile semua halaman di 360, 390, dan 430 px (screenshot), tanpa scroll horizontal, tap target ≥ 44 px.
2. Aksesibilitas: kontras AA, fokus keyboard terlihat, label form, alt text, prefers-reduced-motion.
3. Semua link hidup; state error dirancang untuk BMKG lambat/gagal, backend mati, kuota chatbot habis.
4. Coba matikan typescript.ignoreBuildErrors di next.config.ts dan bereskan errornya. Kalau terlalu besar untuk sisa waktu, laporkan daftar error + estimasi, jangan dipaksakan.
5. Audit klaim terakhir: grep seluruh repo terhadap daftar terlarang 05_FAKTA bagian 6.
6. Subagent reviewer independen untuk keamanan (endpoint admin, rate limit, RLS, rahasia di kode) dan kebenaran klaim.
7. Siapkan docs/expo/DEMO_EXPO.md: alur demo 3 menit, jawaban jujur untuk pertanyaan juri yang sulit (ML, afiliasi BMKG/Kemenkes, uji lab, harga vs proposal), dan rencana cadangan offline (video/screenshot, hotspot).
Jangan push/deploy. Perbarui PROGRESS.md dan tunjukkan ringkasan siap-expo.
```

---

## Prompt kecil (kapan pun dibutuhkan)

**Harga final sudah diputuskan**
```text
Harga final Patchmos: Rp<ANGKA>/botol. Ganti konstanta harga di checkout, lalu perbarui semua tempat yang menyebut harga (teks UI, docs/expo/05_FAKTA_TERVERIFIKASI.md, backend/chatbot_kb.md kalau ada). Tunjukkan diff dan screenshot checkout, commit tanpa atribusi.
```

**Hasil uji lab keluar**
```text
Hasil uji lab Patchmos: <tempel hasil persis, termasuk metode & tanggal>. Tambahkan dulu ke docs/expo/05_FAKTA_TERVERIFIKASI.md bagian 4 (pindahkan dari "direncanakan" ke "sudah dilakukan" sesuai isi hasil), lalu tampilkan di /tim bagian Hasil Uji dan KB chatbot. Jangan menyimpulkan lebih dari yang tertulis di hasil. Tunjukkan diff.
```

**Foto tim sudah siap**
```text
Foto tim dan dokumentasi produksi sudah saya taruh di frontend/public/tim/. Ganti placeholder di /tim dengan foto asli (next/image, alt text deskriptif, crop konsisten), screenshot desktop & mobile, commit tanpa atribusi.
```

**Render kemasan 50 mL sudah diperbarui**
```text
File frontend/public/brand/patchmos-produk.png dan patchmos-produk-asli.png sudah saya ganti dengan render kemasan 50 mL. Cek semua halaman yang memakainya (screenshot), sesuaikan ukuran/posisi bila perlu tanpa mengedit gambarnya, hapus catatan 100 mL di 05_FAKTA bagian 3.
```
