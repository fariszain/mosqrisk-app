# Mulai di Sini — Setup Claude Code untuk Proyek MosqRisk

Urutan baca untuk kamu: file ini → `01_ROADMAP.md` → `04_PROMPTS.md`.
Claude Code akan membaca semua file di folder ini sendiri lewat prompt.

| File | Isi |
|---|---|
| `00_MULAI_DI_SINI.md` | Setup manual (Fase 0) + cara memakai Claude Code sehari-hari |
| `01_ROADMAP.md` | Rencana kerja 6–30 Nov, fase, checkpoint, keputusan yang menunggu tim |
| `02_DESIGN_BRIEF.md` | Arahan desain anti-template + proses memilih arah desain |
| `03_CHATBOT_SPEC.md` | Keputusan provider LLM + arsitektur chatbot yang aman |
| `04_PROMPTS.md` | Prompt siap tempel untuk tiap sesi Claude Code |
| `05_FAKTA_TERVERIFIKASI.md` | Satu-satunya sumber angka & klaim |
| `PROGRESS.md` | Log kerja yang diisi Claude Code tiap akhir fase |

Aset merek asli sudah ditaruh di `frontend/public/brand/` (logo transparan, tanda daun,
render produk transparan & versi asli). `AGENTS.md` sudah diperbarui: aturan desain lama
(glassmorphism dkk.) dicabut dan ada bagian "Aturan Tetap Proyek".

---

## Fase 0 — langkah manual (±30 menit, kerjakan berurutan)

### 1. Perbarui Claude Code
```bash
claude update
claude --version
```

### 2. Matikan atribusi AI di commit & PR, dan kunci file .env
Buka (atau buat) file settings user:
```bash
mkdir -p ~/.claude && nano ~/.claude/settings.json
```
Isi seperti ini. **Kalau file sudah ada isinya, gabungkan key-nya — jangan timpa seluruh file.**
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "attribution": {
    "commit": "",
    "pr": "",
    "sessionUrl": false
  },
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./frontend/.env)",
      "Read(./backend/.env)"
    ]
  }
}
```
- `commit: ""` dan `pr: ""` = string kosong menyembunyikan atribusi (baris `Co-Authored-By`
  dan footer PR). `sessionUrl: false` = tanpa link sesi. Ini di level user, jadi berlaku di
  semua repo kamu dan tidak meninggalkan file apa pun di repo.
- Aturan `deny` mencegah Claude Code membaca isi file `.env` (API key, password Gmail, dll.).

### 3. Jaring pengaman git
```bash
cd ~/Documents/UTU/mosqrisk-app

# (opsional) catatan kerja ini tidak ikut ke GitHub — exclude lokal, tidak di-commit
printf '\n# catatan kerja lokal\ndocs/expo/\nISU_PROPOSAL_VS_WEB.md\n.screenshots/\n' >> .git/info/exclude

git status            # baca daftarnya dulu
git add -A            # kalau ada file yang tidak mau ikut, tambahkan satu per satu saja
git commit -m "chore: snapshot sebelum redesign expo"
git switch -c redesign-expo
```
File `.env` sudah di-ignore oleh `.gitignore` proyek, jadi tidak ikut ter-commit.
Semua kerja Claude Code terjadi di branch `redesign-expo`. Kalau hasilnya kacau, kamu
selalu bisa kembali ke `main`.

### 4. Pasang plugin (di dalam sesi Claude Code)
Jalankan `claude` di folder proyek, lalu ketik satu per satu (pilih scope **User** saat ditanya):
```
/plugin install frontend-design@claude-plugins-official
/plugin install context7@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
```
Lalu keluar (`/exit`) dan buka lagi supaya plugin termuat.
- `frontend-design` — skill resmi Anthropic yang otomatis aktif saat membangun/merombak UI;
  tujuannya persis melawan tampilan "AI slop".
- `context7` — dokumentasi library terbaru (Next.js 16, Tailwind v4, React 19).
- `security-guidance` — pengingat keamanan saat mengedit kode.
- Bawaan, tanpa instalasi: `/code-review` (review diff dengan subagent bersih).

### 5. Pasang MCP (di terminal, dari folder proyek)
```bash
# Browser untuk screenshot & cek tampilan (kunci utama agar desain diverifikasi visual)
claude mcp add playwright npx @playwright/mcp@latest

# Supabase — HANYA BACA, dikunci ke satu project
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=ISI_PROJECT_REF&read_only=true"
```
- `ISI_PROJECT_REF`: ambil dari URL dashboard Supabase kamu
  (`supabase.com/dashboard/project/<project_ref>`).
- Setelah itu buka `claude`, ketik `/mcp`, pilih **supabase** → login di browser.
- Kenapa `read_only=true`: database ini dipakai web yang sedang live. Claude Code cukup
  membaca (cek skema, policy RLS, security advisor). Semua perubahan skema dia tulis sebagai
  file SQL, **kamu** yang review dan jalankan di SQL Editor.
- Kalau Playwright bilang browser belum terpasang, biarkan Claude Code yang membereskannya
  (dia bisa membaca pesan error-nya).

### 6. (Opsional) CLI pendukung
- `gh` (GitHub CLI) kalau repo di GitHub: `gh auth login`.
- Vercel CLI kalau mau Claude Code mengecek preview deployment/log: `npm i -g vercel`,
  `vercel login`, `vercel link`. Deploy production tetap kamu yang putuskan.

### 7. Mulai sesi Opus 5.5 effort max
```bash
cd ~/Documents/UTU/mosqrisk-app
claude --model claude-opus-5-5 --effort max
```
Di dalam sesi, cek dulu:
- `/status` → baris "Setting sources" memuat *User settings*.
- `/mcp` → `playwright` dan `supabase` terhubung.
- `/context` → `AGENTS.md` termuat (lewat `CLAUDE.md`).

Lalu tempel **PROMPT 1** dari `04_PROMPTS.md`.

Catatan effort: `max` hanya berlaku untuk sesi itu (tidak tersimpan sebagai default kecuali
lewat env `CLAUDE_CODE_EFFORT_LEVEL`). Dokumentasi resmi menyebut `max` bisa "overthinking"
dan boros token — cocok untuk desain & arsitektur; untuk kerja mekanis kecil, `/effort high`
sudah cukup.

---

## Cara memakai Claude Code supaya hasilnya maksimal

- **Satu fase = satu sesi.** Selesai fase → pastikan `PROGRESS.md` terisi → `/clear` →
  tempel prompt fase berikutnya. Konteks yang penuh menurunkan kualitas.
- **Beri nama sesi**: `/rename fase-1-kejujuran`, dst. Lanjutkan nanti dengan `claude --resume`.
- **Jawab checkpoint dengan jelas.** Claude Code akan bertanya lewat pilihan (C1–C5).
- **Nilai dari screenshot, bukan dari penjelasan.** Minta dia menampilkan screenshot desktop
  & mobile; kritik secara spesifik ("hero terlalu ramai, buang garis emas kedua").
- **Kalau melenceng**: `Esc` untuk menghentikan, `Esc Esc` atau `/rewind` untuk mundur ke
  titik sebelumnya. Sudah 2× dikoreksi tapi masih salah → `/clear` dan ulang dengan prompt yang
  lebih spesifik (catatan di `PROGRESS.md` tetap ada).
- **Review independen**: di akhir fase besar jalankan `/code-review`.
- **Kamu yang push & deploy.** Claude Code dilarang `git push`/deploy di prompt. Sebelum push,
  cek atribusi:
  ```bash
  git log -5 --format='%h %an%n%b'
  ```
  Tidak boleh ada baris `Co-Authored-By` atau "Generated with".

---

## Yang hanya bisa kamu/tim kerjakan (bukan Claude Code)

| Tugas | Kapan |
|---|---|
| Jawab checkpoint C1–C5 (lihat roadmap) | Saat ditanya |
| Review & jalankan file migration SQL di Supabase | Fase 1 (C4) |
| Putuskan harga final → minta Claude Code ganti 1 konstanta | Minggu depan |
| Perbarui artwork kemasan 100 mL → 50 mL, ganti file di `frontend/public/brand/` | Sebelum Beranda final |
| Foto 5 anggota + dosen + dokumentasi produksi ke `frontend/public/tim/` | Sebelum `/tim` final |
| Kutipan testimoni asli + izin responden (kalau dipakai) | Fase 1 (C1) |
| API key LLM + spend limit; isi `backend/.env` & env Vercel | Sebelum Fase 4 |
| Hasil uji lab → tambahkan ke `05_FAKTA` dulu | Kapan pun tersedia |
| Selaraskan klaim kesehatan dengan hasil konsultasi BPOM (Rafi) | Sebelum expo |
| Tentukan tanggal expo & sesuaikan jadwal roadmap | Secepatnya |
