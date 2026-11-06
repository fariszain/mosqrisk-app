-- ═══════════════════════════════════════════════════════════════════════════
-- Migration Fase 1 (roadmap 1.6 + 1.7b) — MosqRisk / Patchmos
-- Dibuat: 2026-11-06. BELUM DIJALANKAN. Direview & dijalankan oleh tim (checkpoint C4).
--
-- Isi:
--   A. premium_codes: tutup akses anon/authenticated (dulu SELECT/INSERT/UPDATE terbuka
--      untuk siapa pun yang memegang anon key → semua kode premium bisa dibaca/diubah).
--   B. reports & subscribers: pastikan RLS aktif dan tidak bisa diakses langsung lewat
--      anon/authenticated (frontend tidak pernah membaca tabel ini langsung; semua lewat backend).
--   C. orders (BARU): pencatatan penjualan online (checkout + Midtrans) dan offline (admin).
--
-- TIDAK ada baris data yang diubah atau dihapus. Kode premium demo, laporan, dan
-- pelanggan tetap utuh. Yang berubah hanya policy, hak akses, dan tabel baru.
--
-- PRASYARAT WAJIB: SUPABASE_KEY di backend/.env DAN di env Vercel harus kunci
-- service_role (atau sb_secret_...). Backend & skrip auto_generate_qr.py memakai kunci itu.
-- Kalau ternyata masih anon key, setelah migration ini klaim kode, laporan, langganan,
-- dan checkout akan gagal. Cara cek ada di docs/expo/PROGRESS.md (checkpoint C4).
--
-- Cara menjalankan: Supabase Dashboard → SQL Editor → tempel seluruh file → Run.
-- Semua pernyataan dikirim sebagai satu query, jadi kalau satu gagal, semuanya batal.
-- Aman dijalankan ulang (idempoten).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── A. premium_codes ──────────────────────────────────────────────────────
alter table public.premium_codes enable row level security;

drop policy if exists "Allow anonymous read access"   on public.premium_codes;
drop policy if exists "Allow anonymous insert access" on public.premium_codes;
drop policy if exists "Allow anonymous update access" on public.premium_codes;

-- Tanpa policy untuk anon/authenticated = akses langsung ditolak.
-- service_role (dipakai backend) melewati RLS, jadi /api/claim tetap jalan.
revoke all on table public.premium_codes from anon, authenticated;

-- ─── B. reports & subscribers ──────────────────────────────────────────────
alter table public.reports     enable row level security;
alter table public.subscribers enable row level security;

-- Policy lama (kalau ada) tidak dihapus di sini — cek hasil audit_rls.sql.
-- Mencabut hak akses tabel sudah cukup membuat anon/authenticated tidak bisa
-- membaca/menulis langsung, apa pun isi policy-nya.
revoke all on table public.reports     from anon, authenticated;
revoke all on table public.subscribers from anon, authenticated;

-- ─── C. orders (baru) ──────────────────────────────────────────────────────
create table if not exists public.orders (
  id                 bigint generated always as identity primary key,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  channel            text        not null,
  status             text        not null default 'menunggu_pembayaran',
  quantity           integer     not null,
  unit_price         integer     not null,
  total              integer     not null,
  customer_name      text,
  phone              text,
  address            text,
  payment_method     text,
  midtrans_order_id  text,
  midtrans_status    text,
  sold_at            date,
  notes              text,
  is_test            boolean     not null default false,

  constraint orders_channel_check  check (channel in ('online', 'offline')),
  constraint orders_status_check   check (status in ('menunggu_pembayaran', 'dibayar', 'dikirim', 'selesai', 'batal', 'gagal')),
  constraint orders_quantity_check check (quantity between 1 and 500),
  constraint orders_price_check    check (unit_price > 0),
  constraint orders_total_check    check (total = quantity * unit_price),
  constraint orders_midtrans_order_id_key unique (midtrans_order_id),
  -- pesanan online wajib punya data pengiriman & nomor pesanan Midtrans
  constraint orders_online_fields_check check (
    channel <> 'online'
    or (midtrans_order_id is not null and customer_name is not null and phone is not null and address is not null)
  )
);

comment on table public.orders is
  'Penjualan Patchmos: online (checkout web + Midtrans, status dicek ke API Midtrans) dan offline (dicatat admin). Akses hanya lewat backend (service_role).';

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
