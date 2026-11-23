// Parameter Model Risiko MosqRisk (v4) dari backend/rumus_risiko.json, di-inline saat build oleh
// next.config.ts. Dipakai HANYA untuk penjelasan di /edukasi (grafik kurva & simulator) — skor yang
// tampil di /pantau dan Beranda selalu dihitung server. Algoritmanya sama dengan backend/main.py:
//   indeks = 100 × S_suhu × S_kelembapan × S_hujan, dibulatkan biasa (0,5 ke atas).
//   S_suhu = R0(T) Mordecai dkk. 2017 (Aedes aegypti × DENV), dinormalkan ke puncaknya.
//   S_kelembapan, S_hujan = garis lurus antartitik; di luar rentang = titik terdekat.
export type NamaFaktor = "suhu" | "kelembapan" | "hujan";
type Sifat = { arti: string; fungsi: "briere" | "kuadrat"; T0: number; Tm: number; c: number };
type FaktorDasar = { label: string; satuan: string; status: "jurnal" | "asumsi"; alasan: string; sumber: string };
export type FaktorSuhu = FaktorDasar & { kurva: string; sifat: Record<string, Sifat> };
export type FaktorTitik = FaktorDasar & { titik: [number, number][] };
export type Rumus = {
  versi: string;
  berlaku_sejak?: string;
  dasar_perhitungan?: string;
  kategori: { tinggi: number; sedang: number; alasan?: string };
  faktor: { suhu: FaktorSuhu; kelembapan: FaktorTitik; hujan: FaktorTitik };
};

const SIFAT_WAJIB = ["a", "EFD", "pEA", "MDR", "lf", "b", "c", "PDR"];

function baca(): Rumus | null {
  try {
    const r = JSON.parse(process.env.RUMUS_RISIKO || "null") as Rumus | null;
    const sifat = r?.faktor?.suhu?.sifat;
    if (!sifat || !SIFAT_WAJIB.every((k) => sifat[k]) || !r.faktor.kelembapan?.titik || !r.faktor.hujan?.titik || !r.kategori) return null;
    return r;
  } catch {
    return null;
  }
}

export const RUMUS = baca();

export function interpolasi(titik: [number, number][], x: number) {
  if (x <= titik[0][0]) return titik[0][1];
  for (let i = 1; i < titik.length; i++) {
    const [x0, y0] = titik[i - 1];
    const [x1, y1] = titik[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return titik[titik.length - 1][1];
}

// Kurva termal satu sifat: Brière c·T·(T−T0)·√(Tm−T) atau kuadrat c·(T−T0)·(Tm−T); 0 di luar (T0, Tm).
function nilaiSifat(s: Sifat, T: number) {
  if (T <= s.T0 || T >= s.Tm) return 0;
  return s.fungsi === "briere" ? s.c * T * (T - s.T0) * Math.sqrt(s.Tm - T) : s.c * (T - s.T0) * (s.Tm - T);
}

// Persamaan (1) Mordecai dkk. 2017 tanpa N dan r (konstan, hilang saat dinormalkan).
function r0Mentah(sifat: Record<string, Sifat>, T: number) {
  const v: Record<string, number> = {};
  for (const k of SIFAT_WAJIB) {
    v[k] = nilaiSifat(sifat[k], T);
    if (v[k] <= 0) return 0;
  }
  const mu = 1 / v.lf;
  return Math.sqrt((v.a ** 2 * v.b * v.c * Math.exp(-mu / v.PDR) * v.EFD * v.pEA * v.MDR) / mu ** 3);
}

// Puncak dicari sekali per objek rumus (langkah 0,01 °C), sama dengan backend.
const puncak = new WeakMap<Rumus, number>();
function r0Puncak(r: Rumus) {
  let p = puncak.get(r);
  if (p === undefined) {
    p = 0;
    for (let i = 500; i < 4500; i++) p = Math.max(p, r0Mentah(r.faktor.suhu.sifat, i / 100));
    puncak.set(r, p);
  }
  return p;
}

export function nilaiFaktor(r: Rumus, nama: NamaFaktor, x: number) {
  if (nama === "suhu") return r0Mentah(r.faktor.suhu.sifat, x) / r0Puncak(r);
  return interpolasi(r.faktor[nama].titik, x);
}

export function hitungSkor(r: Rumus, suhu: number, kelembapan: number, hujan: number) {
  const nilai = {
    suhu: nilaiFaktor(r, "suhu", suhu),
    kelembapan: nilaiFaktor(r, "kelembapan", kelembapan),
    hujan: nilaiFaktor(r, "hujan", hujan),
  };
  const skor = Math.min(100, Math.max(0, Math.floor(100 * nilai.suhu * nilai.kelembapan * nilai.hujan + 0.5)));
  const status = skor >= r.kategori.tinggi ? "TINGGI" : skor >= r.kategori.sedang ? "SEDANG" : "RENDAH";
  return { nilai, skor, status } as const;
}
