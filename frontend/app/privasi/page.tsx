import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — MosqRisk",
  description: "Data apa yang dikumpulkan website MosqRisk/Patchmos, untuk apa, dan siapa yang bisa melihatnya.",
};

// Isi halaman ini harus mengikuti perilaku sistem yang sebenarnya. Kalau ada fitur baru
// yang mengumpulkan data (mis. chatbot), perbarui halaman ini dan tanggal di bawah.
const DIPERBARUI = "6 November 2026";

const bagianData = [
  {
    judul: "Notifikasi email (Peta Pantauan)",
    isi: "Alamat email dari akun Google yang kamu pakai login, dan wilayah pantauan yang kamu pilih. Dipakai untuk mengirim email saat ada laporan warga di wilayah itu dan saat tim mengirim peringatan. Jika kamu memilih wilayah lain di Peta Pantauan, wilayah langgananmu ikut diperbarui.",
  },
  {
    judul: "Laporan warga (Lapor Warga)",
    isi: "Jenis laporan, lokasi yang kamu tulis atau ambil dari GPS, dan deskripsi. Kami tidak meminta nama atau kontak pelapor. Laporan disimpan, bisa dilihat tim admin, dan diteruskan lewat email ke pelanggan notifikasi di wilayah yang sama. Karena itu, jangan menulis nama atau data pribadi orang lain di laporan.",
  },
  {
    judul: "Pembelian online (Checkout)",
    isi: "Nama, nomor HP/WhatsApp, alamat pengiriman, jumlah botol, dan total. Dipakai untuk memproses dan mengirim pesanan. Nama dan nomor HP juga dikirim ke Midtrans untuk membuat transaksi pembayaran. Kami tidak menerima atau menyimpan data kartu maupun rekeningmu.",
  },
  {
    judul: "Penjualan offline",
    isi: "Untuk penjualan langsung, tim mencatat jumlah, metode bayar, tanggal, dan nama pembeli bila pembeli bersedia.",
  },
  {
    judul: "Klaim kode Premium",
    isi: "Kode yang kamu masukkan ditandai sudah dipakai di database. Status Premium disimpan di browser-mu (localStorage), bukan di akun, sehingga hilang bila data situs di browser dihapus.",
  },
  {
    judul: "Lokasi perangkat",
    isi: "Hanya jika kamu mengizinkan. Koordinat dipakai di browser untuk mencari nama wilayah lewat OpenStreetMap Nominatim. Di halaman Edukasi, koordinat yang dibulatkan dikirim ke server kami lalu diteruskan ke Open-Meteo untuk mengambil data cuaca historis. Koordinat tidak disimpan di database kecuali kamu mengirimkannya sebagai lokasi laporan atau alamat pengiriman.",
  },
  {
    judul: "Data di browser-mu",
    isi: "Status Premium, email dan wilayah langganan, koordinat terakhir halaman Edukasi, serta sesi login Google (dari Supabase Auth, berisi email dan nama akunmu) disimpan di localStorage browser-mu. Semuanya bisa dihapus dengan logout dan membersihkan data situs di pengaturan browser.",
  },
];

const pihakKetiga = [
  ["Supabase", "database dan login Google"],
  ["Google", "login (OAuth) dan pengiriman email lewat Gmail"],
  ["Midtrans", "pemrosesan pembayaran online"],
  ["Vercel", "hosting website"],
  ["BMKG", "API publik prakiraan cuaca"],
  ["Open-Meteo", "data cuaca historis"],
  ["OpenStreetMap Nominatim", "nama lokasi dari koordinat"],
  ["API Wilayah Indonesia (emsifa)", "daftar provinsi dan kabupaten/kota"],
  ["Google Fonts", "ikon Material Symbols dimuat dari server Google"],
  ["svgrepo.com", "ikon logo Google pada tombol login"],
];

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 pt-32 md:pt-40 pb-20">
        <p className="text-sm text-on-surface-variant mb-3">Diperbarui {DIPERBARUI}</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A3626] tracking-tight mb-6">Kebijakan Privasi</h1>
        <p className="text-[17px] leading-relaxed text-on-surface-variant mb-12">
          MosqRisk dan Patchmos dikembangkan oleh tim mahasiswa Universitas Syiah Kuala dalam Program Pendanaan Internal
          Kewirausahaan (PIKU) USK. Halaman ini menjelaskan data apa yang dikumpulkan lewat website ini, untuk apa, dan
          siapa yang bisa melihatnya.
        </p>

        <section className="mb-12" aria-labelledby="data-dikumpulkan">
          <h2 id="data-dikumpulkan" className="text-2xl font-bold text-[#1A3626] mb-6">Data yang kami kumpulkan</h2>
          <dl className="flex flex-col gap-6">
            {bagianData.map((b) => (
              <div key={b.judul} className="border-l-2 border-[#EAC775] pl-5">
                <dt className="font-bold text-on-surface mb-1">{b.judul}</dt>
                <dd className="text-[15px] leading-relaxed text-on-surface-variant">{b.isi}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-12" aria-labelledby="pihak-ketiga">
          <h2 id="pihak-ketiga" className="text-2xl font-bold text-[#1A3626] mb-4">Layanan pihak ketiga</h2>
          <p className="text-[15px] leading-relaxed text-on-surface-variant mb-4">
            Website ini memakai layanan berikut. Masing-masing punya kebijakan privasinya sendiri.
          </p>
          <ul className="flex flex-col gap-2 text-[15px] text-on-surface-variant">
            {pihakKetiga.map(([nama, guna]) => (
              <li key={nama}><strong className="text-on-surface">{nama}</strong> — {guna}</li>
            ))}
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="akses-data">
          <h2 id="akses-data" className="text-2xl font-bold text-[#1A3626] mb-4">Siapa yang bisa melihat data</h2>
          <p className="text-[15px] leading-relaxed text-on-surface-variant">
            Data di database dikelola tim MosqRisk dan dibuka lewat dasbor admin yang dilindungi PIN. Kami tidak menjual
            data pribadi.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="hapus-data">
          <h2 id="hapus-data" className="text-2xl font-bold text-[#1A3626] mb-4">Penyimpanan, penghapusan, dan berhenti berlangganan</h2>
          <p className="text-[15px] leading-relaxed text-on-surface-variant mb-4">
            Data disimpan selama dibutuhkan untuk tujuan di atas. Kamu bisa meminta salinan, perbaikan, atau penghapusan
            data dengan mengirim email ke{" "}
            <a href="mailto:mosqrisk.official@gmail.com" className="font-semibold text-[#1A3626] underline underline-offset-2">mosqrisk.official@gmail.com</a>.
          </p>
          <p className="text-[15px] leading-relaxed text-on-surface-variant">
            Untuk berhenti menerima notifikasi, balas email dari MosqRisk dengan kata <strong>BERHENTI</strong> atau kirim
            email ke alamat di atas. Tim akan menghapus alamatmu dari daftar pelanggan.
          </p>
        </section>

        <section aria-labelledby="perubahan">
          <h2 id="perubahan" className="text-2xl font-bold text-[#1A3626] mb-4">Perubahan kebijakan</h2>
          <p className="text-[15px] leading-relaxed text-on-surface-variant">
            Kebijakan ini dapat berubah bila fitur website berubah. Tanggal pembaruan terakhir tercantum di bagian atas halaman.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
