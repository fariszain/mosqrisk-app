// Isi kesehatan yang dipakai di /edukasi dan /pantau (checklist pencegahan).
// Klaim kesehatan hanya dari sumber resmi yang dicantumkan (WHO, CDC, Kemenkes) —
// lihat docs/expo/05_FAKTA_TERVERIFIKASI.md §7. Ubah di sini supaya dua halaman tetap sama.
export const SUMBER = {
  kemenkes2026: "Kementerian Kesehatan (2026), data kasus 2025",
  who: { teks: "WHO, Dengue and severe dengue (lembar fakta)", url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue" },
  cdc: { teks: "CDC, Life Cycle of Aedes Mosquitoes", url: "https://www.cdc.gov/mosquitoes/about/life-cycles/aedes.html" },
  kemenkes3m: { teks: "Kementerian Kesehatan, Upaya Pencegahan DBD dengan 3M Plus", url: "https://ayosehat.kemkes.go.id/upaya-pencegahan-dbd-dengan-3m-plus" },
  kemenkesPlus: {
    teks: "Kementerian Kesehatan, Rumah dan Sekolahku adalah Tembok Perlindungan Pertama DBD",
    url: "https://www.kemkes.go.id/id/rumah-dan-sekolahku-adalah-tembok-perlindungan-pertama-dbd",
  },
};

export const GEJALA = ["Demam tinggi", "Sakit kepala berat", "Nyeri di belakang mata", "Nyeri otot dan sendi", "Mual dan muntah", "Pembengkakan kelenjar", "Ruam di kulit"];

export const TANDA_BAHAYA = [
  "Sakit perut hebat",
  "Muntah terus-menerus",
  "Napas cepat",
  "Gusi atau hidung berdarah",
  "Muntah atau tinja berdarah",
  "Sangat lemas, gelisah, atau sangat haus",
];

export const SIKLUS = [
  { judul: "Telur", isi: "Diletakkan di dinding wadah berisi air, sedikit di atas permukaan. Bisa bertahan kering berbulan-bulan dan menetas saat terendam air." },
  { judul: "Jentik", isi: "Menetas dari telur dan hidup di air, lalu berkembang menjadi pupa." },
  { judul: "Pupa", isi: "Hidup di air dan tidak makan, lalu berkembang menjadi nyamuk dewasa." },
  { judul: "Nyamuk dewasa", isi: "Hanya nyamuk betina yang menggigit, karena membutuhkan darah untuk menghasilkan telur." },
];

export const TIGA_M = [
  { judul: "Menguras", isi: "Bersihkan tempat penampungan air seperti bak mandi dan ember secara rutin." },
  { judul: "Menutup", isi: "Tutup rapat tempat penyimpanan air seperti drum dan tangki agar nyamuk tidak bertelur di sana." },
  { judul: "Mendaur ulang", isi: "Manfaatkan kembali barang bekas yang bisa menampung air hujan, supaya tidak menjadi sarang nyamuk." },
];

export const PLUS = [
  "Memelihara ikan pemakan jentik",
  "Memakai obat anti nyamuk",
  "Tidur memakai kelambu",
  "Menaburkan bubuk larvasida di wadah yang sulit dikuras",
];

// Checklist harian di /pantau — diambil dari TIGA_M & PLUS di atas (bukan langkah baru).
export const CEKLIS = [
  { id: "kuras", teks: "Kuras bak mandi dan ember" },
  { id: "tutup", teks: "Tutup rapat drum dan tangki air" },
  { id: "daur", teks: "Singkirkan atau daur ulang barang bekas yang bisa menampung air" },
  { id: "anti", teks: "Pakai obat anti nyamuk" },
  { id: "kelambu", teks: "Tidur memakai kelambu" },
];
