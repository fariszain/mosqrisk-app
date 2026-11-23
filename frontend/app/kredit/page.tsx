import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroHalaman from "@/components/ui/HeroHalaman";
import { ImagesIcon } from "@phosphor-icons/react/ssr";
import { FOTO, type Foto } from "@/lib/foto";
import { SUMBER } from "@/lib/edukasi";

export const metadata: Metadata = {
  title: "Kredit foto & data",
  description: "Sumber foto, data, huruf, dan ikon yang dipakai di website MosqRisk & Patchmos.",
};

// Atribusi yang diwajibkan lisensi (CC BY-SA) dan sumber data. Tambahkan baris di lib/foto.ts saat memasang foto baru.
const DATA = [
  { nama: "BMKG", guna: "Prakiraan cuaca per 3 jam (API publik)", url: "https://api.bmkg.go.id/" },
  { nama: "Open-Meteo", guna: "Data cuaca historis untuk tren 12 bulan", url: "https://open-meteo.com/" },
  { nama: "Kementerian Kesehatan", guna: "Statistik kasus DBD 2025 dan panduan 3M Plus", url: SUMBER.kemenkes3m.url },
  { nama: "WHO", guna: "Gejala dan tanda bahaya dengue", url: SUMBER.who.url },
  { nama: "CDC", guna: "Siklus hidup nyamuk Aedes", url: SUMBER.cdc.url },
  { nama: "OpenStreetMap Nominatim", guna: "Nama lokasi dari koordinat", url: "https://nominatim.org/" },
  { nama: "API Wilayah Indonesia (emsifa)", guna: "Daftar provinsi dan kabupaten/kota", url: "https://www.emsifa.com/api-wilayah-indonesia/" },
];
const ASET = [
  { nama: "Geist", guna: "Huruf, karya Vercel & Basement Studio (SIL Open Font License)", url: "https://fonts.google.com/specimen/Geist" },
  { nama: "Phosphor Icons", guna: "Ikon (lisensi MIT)", url: "https://phosphoricons.com/" },
  { nama: "Logo & render kemasan Patchmos", guna: "Milik tim Patchmos", url: null },
];

export default function KreditPage() {
  const foto = Object.values(FOTO) as Foto[];
  const berkredit = foto.filter((f) => f.kredit);
  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        <HeroHalaman
          id="judul-kredit"
          label="Kredit"
          Ikon={ImagesIcon}
          judul={
            <>
              Kredit <span className="teks-foil">foto & data</span>
            </>
          }
          pengantar="Foto berlisensi bebas dari Wikimedia Commons, sumber data, serta huruf dan ikon yang dipakai di website ini."
        />
        <div className="wadah space-y-12 py-12 md:py-16">
          <section aria-labelledby="judul-foto">
            <h2 id="judul-foto" className="judul-3">
              Foto
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {berkredit.map((f) => (
                <li key={f.src} className="overflow-hidden rounded-kartu bg-white">
                  <div className="relative aspect-[4/3] bg-kertas-gelap">
                    <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
                  </div>
                  <div className="p-4 text-[14px] leading-relaxed">
                    <p className="font-semibold">{f.kredit}</p>
                    <p className="text-sekunder">{f.lisensi}</p>
                    {f.tautan && (
                      <a href={f.tautan} target="_blank" rel="noopener noreferrer" className="tautan mt-1 inline-flex min-h-10 items-center font-semibold text-kemasan">
                        Halaman di Wikimedia Commons
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="keterangan mt-4">
              Foto lain (nyamuk menggigit di Beranda, genangan di halaman Lapor, daun nilam di atas marmer) adalah foto lama proyek yang asal-usulnya
              belum tercatat.
            </p>
          </section>

          {[
            { id: "judul-data", judul: "Sumber data", isi: DATA },
            { id: "judul-aset", judul: "Huruf, ikon, dan merek", isi: ASET },
          ].map((b) => (
            <section key={b.id} aria-labelledby={b.id}>
              <h2 id={b.id} className="judul-3">
                {b.judul}
              </h2>
              <ul className="mt-5 divide-y divide-garis rounded-kartu bg-white px-5">
                {b.isi.map((d) => (
                  <li key={d.nama} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <span>
                      <span className="block font-semibold">{d.nama}</span>
                      <span className="block text-[14.5px] text-sekunder">{d.guna}</span>
                    </span>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="tautan shrink-0 text-[14.5px] font-semibold text-kemasan">
                        Kunjungi sumber
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="keterangan">
            BMKG, Kementerian Kesehatan, WHO, dan CDC dikutip sebagai sumber; tidak ada kemitraan atau afiliasi resmi dengan lembaga-lembaga tersebut.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
