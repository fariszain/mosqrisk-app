// Pola tombol design system — lihat .claude/skills/mosqrisk-design/SKILL.md (Komponen → Tombol).
// Dipakai untuk <button>, <Link>, dan <a> agar semua aksi tampil seragam.
//   utama  : aksi terpenting di latar terang (hijau kemasan)
//   garis  : aksi kedua di latar terang
//   hantu  : aksi ringan di latar terang (tanpa bingkai)
//   foil   : aksi terpenting di permukaan gelap (emas foil, seperti tulisan di kotak)
//   terang : aksi kedua di permukaan gelap
export type VarianTombol = "utama" | "garis" | "hantu" | "foil" | "terang";
export type UkuranTombol = "lg" | "md" | "sm";

const DASAR =
  "inline-flex items-center justify-center gap-2 rounded-kontrol font-semibold leading-tight text-center select-none " +
  "transition-[background-color,color,border-color,transform] duration-200 ease-out active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100";

const VARIAN: Record<VarianTombol, string> = {
  utama: "bg-kemasan text-white hover:bg-kemasan-gelap",
  garis: "border-[1.5px] border-kemasan bg-transparent text-kemasan hover:bg-kemasan hover:text-white",
  hantu: "bg-transparent text-kemasan hover:bg-kertas",
  foil: "bg-foil text-tinta hover:bg-foil-terang",
  terang: "border-[1.5px] border-white/60 bg-transparent text-white hover:border-white hover:bg-white/10",
};

const UKURAN: Record<UkuranTombol, string> = {
  lg: "min-h-14 px-7 text-[17px]",
  md: "min-h-12 px-5 text-[16px]",
  sm: "min-h-11 px-4 text-[15px]",
};

export function kelasTombol(varian: VarianTombol = "utama", ukuran: UkuranTombol = "md", tambahan = "") {
  return [DASAR, VARIAN[varian], UKURAN[ukuran], tambahan].filter(Boolean).join(" ");
}
