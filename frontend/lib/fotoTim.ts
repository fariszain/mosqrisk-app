// Hanya untuk Server Component (memakai node:fs).
import { existsSync } from "node:fs";
import path from "node:path";

// Foto asli tim (tanpa foto stok / gambar orang buatan AI), dibaca saat build/render server dari
// public/tim/<nama>.(jpg|jpeg|png|webp). Potongan wajah persegi untuk avatar ada di public/tim/wajah/.
const DIR_TIM = path.join(process.cwd(), "public", "tim");
const EKSTENSI = ["jpg", "jpeg", "png", "webp"];

function cari(dir: string, nama: string, awalan: string) {
  const ext = EKSTENSI.find((e) => existsSync(path.join(dir, `${nama}.${e}`)));
  return ext ? `${awalan}/${nama}.${ext}` : null;
}

/** Foto potret penuh untuk kartu tim (rasio 4:5). */
export function cariFotoTim(nama: string) {
  return cari(DIR_TIM, nama, "/tim");
}

/** Potongan wajah persegi untuk avatar bulat; jatuh ke foto penuh bila belum ada. */
export function cariWajahTim(nama: string) {
  return cari(path.join(DIR_TIM, "wajah"), nama, "/tim/wajah") ?? cariFotoTim(nama);
}
