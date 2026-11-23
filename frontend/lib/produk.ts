// Nama, harga, batas pesanan, dan pilihan pengiriman Patchmos. Nilainya di-inline saat build oleh
// next.config.ts dari backend/produk.json — file yang sama dipakai backend untuk menghitung tagihan.
// Jadi harga tetap tampil walau backend sedang tidak bisa dihubungi, tanpa angka kedua di kode.
// Kalau file itu tidak terbaca saat build, nilainya null dan halaman memakai GET /api/produk.
const harga = Number(process.env.PRODUK_HARGA_PER_BOTOL);
const maks = Number(process.env.PRODUK_MAKS_BOTOL);

export type KodeKirim = "antar" | "ambil";
export type OpsiKirim = { label: string; keterangan: string; ongkir: number };
export type DaftarKirim = Partial<Record<KodeKirim, OpsiKirim>>;

export function bacaPengiriman(mentah: unknown): DaftarKirim | null {
  if (!mentah || typeof mentah !== "object") return null;
  const hasil: DaftarKirim = {};
  for (const kode of ["antar", "ambil"] as const) {
    const o = (mentah as Record<string, { label?: unknown; keterangan?: unknown; ongkir?: unknown }>)[kode];
    const ongkir = Number(o?.ongkir ?? 0);
    if (o && typeof o.label === "string" && Number.isFinite(ongkir) && ongkir >= 0) {
      hasil[kode] = { label: o.label, keterangan: typeof o.keterangan === "string" ? o.keterangan : "", ongkir };
    }
  }
  return Object.keys(hasil).length ? hasil : null;
}

function pengirimanBuild(): DaftarKirim | null {
  try {
    return bacaPengiriman(JSON.parse(process.env.PRODUK_PENGIRIMAN || "null"));
  } catch {
    return null;
  }
}

export const PRODUK = {
  nama: process.env.PRODUK_NAMA || null,
  harga: Number.isFinite(harga) && harga > 0 ? harga : null,
  maks: Number.isFinite(maks) && maks > 0 ? maks : null,
  pengiriman: pengirimanBuild(),
};

export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
export const teksOngkir = (n: number) => (n > 0 ? rupiah(n) : "Gratis");
