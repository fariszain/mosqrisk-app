-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT RLS & HAK AKSES — HANYA MEMBACA (tidak mengubah apa pun)
-- Jalankan di Supabase Dashboard → SQL Editor SEBELUM migration Fase 1.
-- Simpan/screenshot hasilnya; jalankan lagi SETELAH migration untuk membandingkan.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Status RLS semua tabel di schema public
select c.relname                as tabel,
       c.relrowsecurity          as rls_aktif,
       c.relforcerowsecurity     as rls_dipaksa
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- 2) Semua policy RLS di schema public
--    Perhatikan baris dengan roles {anon} / {authenticated} / {public} dan qual = true:
--    itu berarti siapa pun yang memegang anon key (yang memang publik) bisa mengakses.
select tablename  as tabel,
       policyname as nama_policy,
       roles,
       cmd        as perintah,
       qual       as syarat_using,
       with_check as syarat_with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Hak akses tabel untuk role publik (anon & authenticated)
select table_name as tabel,
       grantee    as role,
       string_agg(privilege_type, ', ' order by privilege_type) as hak
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;
