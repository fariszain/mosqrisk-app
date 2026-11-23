import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NyamukIlustrasi from "@/components/NyamukIlustrasi";
import { kelasTombol } from "@/components/ui/tombol";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: { index: false },
};

export default function TidakDitemukan() {
  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        <div className="wadah grid items-center gap-8 py-14 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="angka text-[15px] font-bold text-kemasan">Galat 404</p>
            <h1 className="judul-1 mt-3 max-w-[16ch]">Halaman ini tidak ditemukan</h1>
            <p className="pengantar mt-4 max-w-[52ch]">
              Alamatnya mungkin salah ketik atau halamannya sudah dipindahkan. Kalau kamu memindai kode QR kemasan, buka halaman klaim.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className={kelasTombol("utama", "lg")}>
                Ke Beranda
              </Link>
              <Link href="/pantau" className={kelasTombol("garis", "lg")}>
                Cek risiko di wilayahmu
              </Link>
              <Link href="/claim" className={kelasTombol("hantu", "lg")}>
                Klaim kode kemasan
              </Link>
            </div>
          </div>
          <NyamukIlustrasi className="mx-auto w-full max-w-[420px] lg:col-span-5" />
        </div>
      </main>
      <Footer />
    </>
  );
}
