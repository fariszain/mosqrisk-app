// Tipe, teks kategori, dan helper untuk data GET /api/mosqrisk (Model Risiko MosqRisk).
// Rumus skor TIDAK diduplikasi di sini — pengali tiap faktor datang dari backend (risk_factors).
// Parameter rumus (untuk simulator & grafik di /edukasi) ada di lib/rumus.ts, dibaca dari
// backend/rumus_risiko.json saat build — file yang sama dipakai server.

export type StatusRisiko = "TINGGI" | "SEDANG" | "RENDAH";
// Pengali 0–1 (v4): risk_score = bulatkan(100 × suhu × kelembapan × hujan).
export type Faktor = { nilai: number };

export type HariTren = {
  day: string;
  date?: string | null;
  risk_score: number;
  risk_status?: StatusRisiko;
  records?: number;
  // Ringkasan cuaca hari itu (rata-rata suhu & kelembapan, total hujan) — sama dengan dasar skor
  temperature_celsius?: number | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  humidity_percent?: number | null;
  precipitation_mm?: number | null;
  weather_desc?: string | null;
};

export type DataRisiko = {
  // Dasar skor (rumus v4): rata-rata suhu & kelembapan + total hujan dari prakiraan BMKG per 3 jam untuk HARI INI
  temperature_celsius: number;
  humidity_percent: number;
  precipitation_mm: number;
  basis?: { date?: string | null; records?: number; temperature_min?: number | null; temperature_max?: number | null } | null;
  // Cuaca "sekarang": record per 3 jam yang paling dekat dengan waktu sekarang
  current?: { time?: string | null; temperature?: number | null; humidity?: number | null; weather_desc?: string | null } | null;
  formula_version?: string | null;
  lat?: number;
  lon?: number;
  risk_score: number;
  risk_status: StatusRisiko;
  trend?: HariTren[];
  risk_factors?: { suhu: Faktor; kelembapan: Faktor; hujan: Faktor };
  forecast_time?: string | null;
  analysis_date?: string | null;
  timezone?: string | null;
  weather_desc?: string | null;
  location?: { provinsi?: string | null; kotkab?: string | null; kecamatan?: string | null; desa?: string | null } | null;
  last_updated?: string;
};

// Ambang sama dengan backend: TINGGI ≥ 75, SEDANG 50–74, RENDAH < 50.
export const KATEGORI: Record<StatusRisiko, { label: string; warna: string; isi: string; latar: string; penjelasan: string; tindakan: string }> = {
  TINGGI: {
    label: "Risiko tinggi",
    warna: "var(--risiko-tinggi)", // teks
    isi: "var(--risiko-tinggi-isi)", // gauge & bar
    latar: "var(--risiko-tinggi-latar)",
    penjelasan: "Prakiraan cuaca sangat mendukung perkembangbiakan nyamuk Aedes.",
    tindakan:
      "Kuras dan tutup penampungan air, singkirkan barang bekas yang bisa menampung air, dan lindungi diri dari gigitan nyamuk.",
  },
  SEDANG: {
    label: "Risiko sedang",
    warna: "var(--risiko-sedang)", // teks
    isi: "var(--risiko-sedang-isi)", // gauge & bar
    latar: "var(--risiko-sedang-latar)",
    penjelasan: "Prakiraan cuaca cukup mendukung aktivitas nyamuk Aedes.",
    tindakan: "Lakukan 3M Plus secara rutin dan periksa genangan air di sekitar rumah.",
  },
  RENDAH: {
    label: "Risiko rendah",
    warna: "var(--risiko-rendah)", // teks
    isi: "var(--risiko-rendah-isi)", // gauge & bar
    latar: "var(--risiko-rendah-latar)",
    penjelasan: "Prakiraan cuaca kurang mendukung perkembangbiakan nyamuk Aedes.",
    tindakan: "Tetap jaga kebersihan lingkungan dan lakukan 3M Plus secara rutin.",
  },
};

export const ZONA = [
  { status: "RENDAH" as StatusRisiko, nama: "Rendah", rentang: "0–49", lebar: 50 },
  { status: "SEDANG" as StatusRisiko, nama: "Sedang", rentang: "50–74", lebar: 25 },
  { status: "TINGGI" as StatusRisiko, nama: "Tinggi", rentang: "75–100", lebar: 25 },
];

export const fmtAngka = (n: number, desimal = 1) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: desimal, minimumFractionDigits: 0 });

const ZONA_WAKTU: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Pontianak": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function pecahTanggal(teks?: string | null) {
  const m = teks?.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const hari = HARI[new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay()];
  return { hari, tanggal: +d, bulan: BULAN[+mo - 1], jam: h, menit: mi };
}

// "2026-11-07 02:00:00" + "Asia/Jakarta" → "Sabtu, 7 November, pukul 02.00 WIB" (waktu lokal wilayah dari BMKG)
export function fmtWaktuPrakiraan(lokal?: string | null, zona?: string | null) {
  const t = pecahTanggal(lokal);
  if (!t || !t.jam) return null;
  return `${t.hari}, ${t.tanggal} ${t.bulan}, pukul ${t.jam}.${t.menit} ${ZONA_WAKTU[zona ?? ""] ?? ""}`.trim();
}

// "2026-11-08" → { hari: "Minggu", tanggal: "8 Nov" }
export function fmtHari(tanggal?: string | null) {
  const t = pecahTanggal(tanggal);
  if (!t) return null;
  return { hari: t.hari, tanggal: `${t.tanggal} ${t.bulan.slice(0, 3)}` };
}

// Tanggal hari ini (YYYY-MM-DD) di zona waktu wilayah BMKG — untuk mencocokkan kartu "Hari ini".
export function tanggalLokalHariIni(zona?: string | null) {
  const opsi = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  try {
    return new Intl.DateTimeFormat("en-CA", { ...opsi, timeZone: zona || "Asia/Jakarta" }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", { ...opsi, timeZone: "Asia/Jakarta" }).format(new Date());
  }
}

// "KOTA BANDA ACEH" → "Kota Banda Aceh"
export function rapikanNama(nama?: string | null) {
  if (!nama) return "";
  return nama.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

// ── Lokasi terakhir yang dipilih di /pantau (dipakai juga oleh Beranda) ──
export type LokasiTersimpan = { provId: string; regId: string; nama: string; provNama?: string };
const KUNCI_LOKASI = "mosqrisk:lokasi";
export const LOKASI_BAWAAN: LokasiTersimpan = { provId: "11", regId: "1171", nama: "KOTA BANDA ACEH", provNama: "ACEH" };

export function bacaLokasi(): LokasiTersimpan | null {
  try {
    const l = JSON.parse(localStorage.getItem(KUNCI_LOKASI) || "null");
    return l && typeof l.regId === "string" && typeof l.nama === "string" ? l : null;
  } catch {
    return null;
  }
}

export const PERISTIWA_LOKASI = "mosqrisk:lokasi";

export function simpanLokasi(l: LokasiTersimpan) {
  try {
    localStorage.setItem(KUNCI_LOKASI, JSON.stringify(l));
    window.dispatchEvent(new Event(PERISTIWA_LOKASI));
  } catch {
    // penyimpanan browser tidak tersedia (mode privat) — lokasi cukup berlaku di sesi ini
  }
}

let petaAdm4: Promise<Record<string, string>> | null = null;
export async function cariAdm4(regId: string) {
  petaAdm4 ??= fetch("/regency_to_adm4.json").then((r) => {
    if (!r.ok) throw new Error("Peta wilayah tidak termuat.");
    return r.json();
  });
  try {
    return (await petaAdm4)[regId] ?? null;
  } catch (e) {
    petaAdm4 = null;
    throw e;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Melempar Error dengan pesan yang bisa langsung ditampilkan ke pengguna.
export async function ambilRisiko(regId: string): Promise<DataRisiko> {
  const adm4 = await cariAdm4(regId);
  if (!adm4) throw new Error("Wilayah ini belum punya titik prakiraan BMKG di MosqRisk.");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/mosqrisk?adm4=${encodeURIComponent(adm4)}`);
  } catch {
    throw new Error("Server MosqRisk tidak bisa dihubungi. Periksa koneksi internet.");
  }
  let json: { success?: boolean; data?: DataRisiko };
  try {
    json = await res.json();
  } catch {
    throw new Error("Server MosqRisk sedang tidak bisa dihubungi.");
  }
  if (!res.ok || !json.success || !json.data) {
    throw new Error("Prakiraan cuaca BMKG untuk wilayah ini belum bisa dimuat.");
  }
  return json.data;
}
