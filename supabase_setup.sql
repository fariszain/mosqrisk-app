-- Buat tabel premium_codes
CREATE TABLE IF NOT EXISTS public.premium_codes (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Buka akses Row Level Security (RLS) sementara agar API bisa baca/tulis
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON public.premium_codes FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON public.premium_codes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
ON public.premium_codes FOR UPDATE
TO anon, authenticated
USING (true);
