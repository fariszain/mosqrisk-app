// Kelas form design system. Label selalu terlihat (tidak hanya placeholder), kalimat biasa (bukan huruf kapital semua).
// Ukuran teks input 16 px supaya iOS tidak memperbesar halaman saat input disentuh.
export const kelasLabel = "block text-[15px] font-semibold text-tinta mb-2";

export const kelasInput =
  "w-full min-h-12 rounded-kontrol border-[1.5px] border-garis bg-white px-4 py-3 text-[16px] text-tinta " +
  "placeholder:text-sekunder/70 transition-[border-color,box-shadow] duration-150 hover:border-garis-kuat " +
  "focus:border-kemasan focus:outline-none focus:ring-4 focus:ring-kemasan/15 disabled:bg-kertas disabled:text-sekunder " +
  "aria-[invalid=true]:border-galat aria-[invalid=true]:focus:ring-galat/15";

export const kelasPetunjuk = "mt-1.5 text-[13px] leading-relaxed text-sekunder";
