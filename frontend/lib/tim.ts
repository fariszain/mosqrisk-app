// Tim Patchmos — sumber: docs/expo/05_FAKTA_TERVERIFIKASI.md §1 (Proposal PIKU, Tabel 6).
// Foto: taruh file di frontend/public/tim/<foto>.jpg (atau .jpeg/.png/.webp) dengan nama di bawah.
// Halaman /tim otomatis memakai foto yang ada; yang belum ada tampil "Foto menyusul".
export type Anggota = { nama: string; peran: string; tugas: string; foto: string };

export const ANGGOTA: Anggota[] = [
  { nama: "Rafi Athallah", peran: "Ketua tim", tugas: "Koordinasi tim; perizinan (NIB, konsultasi BPOM, pendaftaran merek)", foto: "rafi-athallah" },
  { nama: "Sofia", peran: "Produksi", tugas: "Ekstraksi, mikroenkapsulasi, formulasi, dan uji produk (Teknik Kimia)", foto: "sofia" },
  { nama: "Talha Della Chintya", peran: "Keuangan & pemasaran", tugas: "Keuangan, RAB dan laporan, strategi pemasaran dan kemitraan", foto: "talha-della-chintya" },
  { nama: "Faris Zain As-Shadiq", peran: "Digital & branding", tugas: "Sistem MosqRisk Analytics, desain kemasan, branding", foto: "faris-zain-as-shadiq" },
  { nama: "Naila Rizqa", peran: "Media sosial", tugas: "Konten dan edukasi media sosial Patchmos", foto: "naila-rizqa" },
];

export const PENDAMPING: Anggota = {
  nama: "Cut Aprilia, S.E., M.Interbuss.",
  peran: "Dosen pendamping",
  tugas: "Pembimbingan strategis usaha dan arahan log book",
  foto: "cut-aprilia",
};
