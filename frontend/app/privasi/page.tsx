import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroHalaman from "@/components/ui/HeroHalaman";
import { ShieldCheckIcon } from "@phosphor-icons/react/ssr";

export const metadata: Metadata = {
  title: "Kebijakan privasi",
  description: "Data apa yang dikumpulkan website MosqRisk/Patchmos, untuk apa, dan siapa yang bisa melihatnya.",
};

// Isi halaman ini harus mengikuti perilaku sistem yang sebenarnya. Kalau ada fitur baru
// yang mengumpulkan data (mis. chatbot), perbarui halaman ini dan tanggal di bawah.
const DIPERBARUI = "7 November 2026";

const bagianData = [
  {
    judul: "Notifikasi email (Peta Pantauan)",
    isi: "Alamat email dari akun Google yang kamu pakai login, dan wilayah pantauan yang kamu pilih. Dipakai untuk mengirim email saat ada laporan warga di wilayah itu dan saat tim mengirim peringatan. Wilayah langganan hanya berubah saat kamu menekan tombol untuk memindahkannya.",
  },
  {
    judul: "Laporan warga (Lapor Warga)",
    isi: "Jenis laporan, lokasi yang kamu tulis atau ambil dari GPS, dan deskripsi. Kami tidak meminta nama atau kontak pelapor. Laporan disimpan, bisa dilihat tim admin, dan diteruskan lewat email ke pelanggan notifikasi di wilayah yang sama. Karena itu, jangan menulis nama atau data pribadi orang lain di laporan.",
  },
  {
    judul: "Pembelian online (Checkout)",
    isi: "Nama, nomor HP/WhatsApp, pilihan pengiriman (diantar atau ambil sendiri), alamat pengiriman bila diantar, jumlah botol, dan total. Dipakai untuk memproses dan mengirim pesanan. Nama dan nomor HP juga dikirim ke Midtrans untuk membuat transaksi pembayaran. Kami tidak menerima atau menyimpan data kartu maupun rekeningmu.",
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
    isi: "Hanya saat kamu menekan tombol \"Pakai lokasiku\" atau \"Isi dari lokasi saya\" dan mengizinkannya (di Peta Pantauan, lokasi juga dibaca otomatis bila izinnya sudah pernah kamu berikan). Koordinat dipakai di browser untuk mencari nama wilayah lewat OpenStreetMap Nominatim. Di halaman Edukasi, koordinat yang dibulatkan dikirim ke server kami lalu diteruskan ke Open-Meteo untuk mengambil data cuaca historis. Koordinat tidak disimpan di database kecuali kamu mengirimkannya sebagai lokasi laporan atau alamat pengiriman.",
  },
  {
    judul: "Data di browser-mu",
    isi: "Status Premium, wilayah terakhir yang kamu pilih di Peta Pantauan (dipakai juga di Beranda), centang checklist pencegahan per hari, email dan wilayah langganan, koordinat terakhir halaman Edukasi, serta sesi login Google (dari Supabase Auth, berisi email dan nama akunmu) disimpan di localStorage browser-mu. Semuanya bisa dihapus dengan logout dan membersihkan data situs di pengaturan browser.",
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
];

export default function PrivasiPage() {
  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1">
        <HeroHalaman
          id="judul-privasi"
          label={`Diperbarui ${DIPERBARUI}`}
          Ikon={ShieldCheckIcon}
          judul={
            <>
              Kebijakan <span className="teks-foil">privasi</span>
            </>
          }
          pengantar="MosqRisk dan Patchmos dikembangkan tim mahasiswa Universitas Syiah Kuala dalam Program Pendanaan Internal Kewirausahaan (PIKU). Halaman ini menjelaskan data apa yang dikumpulkan lewat website ini, untuk apa, dan siapa yang bisa melihatnya."
        />

        <div className="bg-kertas">
        <div className="wadah grid gap-10 py-12 md:py-16 lg:grid-cols-12">
          <section aria-labelledby="data-dikumpulkan" className="lg:col-span-8">
            <h2 id="data-dikumpulkan" className="judul-3">
              Data yang kami kumpulkan
            </h2>
            <dl className="mt-5 grid gap-3">
              {bagianData.map((b) => (
                <div key={b.judul} className="rounded-kartu bg-white p-5 md:p-6">
                  <dt className="text-[17px] font-bold tracking-tight">{b.judul}</dt>
                  <dd className="mt-1.5 text-[15.5px] leading-relaxed text-sekunder">{b.isi}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside aria-labelledby="pihak-ketiga" className="self-start rounded-kartu bg-white p-5 md:p-6 lg:sticky lg:top-24 lg:col-span-4">
            <h2 id="pihak-ketiga" className="judul-3">
              Layanan pihak ketiga
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-sekunder">Website ini memakai layanan berikut. Masing-masing punya kebijakan privasinya sendiri.</p>
            <ul className="mt-4 border-t border-garis text-[15px]">
              {pihakKetiga.map(([nama, guna]) => (
                <li key={nama} className="border-b border-garis py-2.5">
                  <span className="font-semibold">{nama}</span>
                  <span className="block text-sekunder">{guna}</span>
                </li>
              ))}
            </ul>
          </aside>

          <section aria-labelledby="akses-data" className="rounded-kartu bg-white p-5 md:p-8 lg:col-span-8">
            <h2 id="akses-data" className="judul-3">
              Siapa yang bisa melihat data
            </h2>
            <p className="teks-isi mt-3 text-sekunder">
              Data di database dikelola tim MosqRisk dan dibuka lewat dasbor admin yang dilindungi PIN. Kami tidak menjual data pribadi.
            </p>

            <h2 id="hapus-data" className="judul-3 mt-10">
              Penyimpanan, penghapusan, dan berhenti berlangganan
            </h2>
            <p className="teks-isi mt-3 text-sekunder">
              Data disimpan selama dibutuhkan untuk tujuan di atas. Kamu bisa meminta salinan, perbaikan, atau penghapusan data dengan
              mengirim email ke{" "}
              <a href="mailto:mosqrisk.official@gmail.com" className="tautan font-semibold text-tinta">
                mosqrisk.official@gmail.com
              </a>
              .
            </p>
            <p className="teks-isi mt-3 text-sekunder">
              Untuk berhenti menerima notifikasi, balas email dari MosqRisk dengan kata <strong className="text-tinta">BERHENTI</strong>{" "}
              atau kirim email ke alamat di atas. Tim akan menghapus alamatmu dari daftar pelanggan.
            </p>

            <h2 id="perubahan" className="judul-3 mt-10">
              Perubahan kebijakan
            </h2>
            <p className="teks-isi mt-3 text-sekunder">
              Kebijakan ini dapat berubah bila fitur website berubah. Tanggal pembaruan terakhir tercantum di bagian atas halaman.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
