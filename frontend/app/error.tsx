"use client"; // Error boundary wajib Client Component

import { useEffect } from "react";
import Link from "next/link";
import NyamukIlustrasi from "@/components/NyamukIlustrasi";
import { kelasTombol } from "@/components/ui/tombol";

// Tampil kalau terjadi galat tak terduga saat merender halaman (bukan galat API yang sudah ditangani di halaman).
export default function GalatHalaman({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="konten" className="flex flex-1 items-center bg-kertas">
      <div className="wadah grid items-center gap-8 py-14 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="judul-1 max-w-[18ch]">Halaman ini gagal dimuat</h1>
          <p className="pengantar mt-4 max-w-[52ch]">
            Ada masalah saat menampilkan halaman. Coba muat ulang; kalau masih gagal, kembali ke Beranda dan coba beberapa saat lagi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => unstable_retry()} className={kelasTombol("utama", "lg")}>
              Muat ulang
            </button>
            <Link href="/" className={kelasTombol("garis", "lg")}>
              Ke Beranda
            </Link>
          </div>
          {error.digest && <p className="keterangan mt-6">Kode galat: {error.digest}</p>}
        </div>
        <NyamukIlustrasi className="mx-auto w-full max-w-[380px] lg:col-span-5" />
      </div>
    </main>
  );
}
