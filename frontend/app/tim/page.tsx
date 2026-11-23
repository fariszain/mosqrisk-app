import type { Metadata } from "next";
import Image from "next/image";
import { readdirSync } from "node:fs";
import path from "node:path";
import { AtomIcon, UsersThreeIcon, EnvelopeSimpleIcon, FireIcon, FlaskIcon, LeafIcon, PackageIcon, SprayBottleIcon } from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuktiUji from "@/components/BuktiUji";
import { kelasTombol } from "@/components/ui/tombol";
import { ANGGOTA, PENDAMPING, type Anggota } from "@/lib/tim";
import { cariFotoTim, cariWajahTim } from "@/lib/fotoTim";
import HeroHalaman from "@/components/ui/HeroHalaman";

export const metadata: Metadata = {
  title: "Tim Patchmos",
  description:
    "Mahasiswa Universitas Syiah Kuala di balik Patchmos dan MosqRisk, cara Patchmos dibuat dari ampas nilam, dan status pengujiannya.",
};

// Foto asli tim saja (tanpa foto stok / gambar orang buatan AI). Dibaca saat build dari
// public/tim/<foto>.(jpg|jpeg|png|webp); dokumentasi produksi dari public/tim/produksi/.
const DIR_TIM = path.join(process.cwd(), "public", "tim");

const cariFoto = cariFotoTim;

function fotoProduksi() {
  try {
    return readdirSync(path.join(DIR_TIM, "produksi"))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => ({
        src: `/tim/produksi/${f}`,
        // "02-maserasi-ampas.jpg" → "Maserasi ampas"
        keterangan: f
          .replace(/\.[^.]+$/, "")
          .replace(/^\d+[-_ ]*/, "")
          .replace(/[-_]+/g, " ")
          .replace(/^./, (c) => c.toUpperCase()),
      }));
  } catch {
    return [];
  }
}

const inisial = (nama: string) =>
  nama
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0])
    .join("");

// Urutan tahap nyata (05_FAKTA §3) — penomoran sah.
const TAHAP = [
  { judul: "Ampas nilam", isi: "Bahan baku: limbah padat sisa penyulingan minyak nilam.", Ikon: LeafIcon },
  { judul: "Maserasi", isi: "Ampas direndam dalam etanol 96% dengan rasio bahan dan pelarut 1:10.", Ikon: FlaskIcon },
  { judul: "Penguapan pelarut", isi: "Etanol diuapkan sehingga tersisa ekstrak ampas nilam.", Ikon: FireIcon },
  { judul: "Mikroenkapsulasi", isi: "Ekstrak dibungkus bahan dinding gelatin dan gum arab.", Ikon: AtomIcon },
  { judul: "Formulasi spray", isi: "Diformulasikan menjadi spray dengan Tween 80 sebagai emulsifier.", Ikon: SprayBottleIcon },
  { judul: "Pengemasan", isi: "Botol spray gelap 50 mL, label, dan kode QR MosqRisk. Simpan pada suhu di bawah 30°C.", Ikon: PackageIcon },
];

// Latar monogram per anggota — warna token merek, bergiliran.
const LATAR = ["bg-kemasan", "bg-daun", "bg-emas-teks", "bg-ampas", "bg-hutan", "bg-kemasan-gelap"];

function KartuAnggota({ a, urutan }: { a: Anggota; urutan: number }) {
  const foto = cariFoto(a.foto);
  return (
    <li className="group">
      {/* Foto tim potret (±620 × 860 px dari slide PIKU) → kartu potret 4:5 agar tidak terpotong & tidak diperbesar. */}
      <div className={`relative aspect-[4/5] overflow-hidden rounded-media ${foto ? "bg-kertas-gelap" : LATAR[urutan % LATAR.length]}`}>
        {foto ? (
          <Image
            src={foto}
            alt={`Foto ${a.nama}`}
            fill
            sizes="(min-width: 1024px) 30vw, 46vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Image src="/brand/patchmos-logo-mark.png" alt="" width={894} height={886} sizes="160px" className="absolute -bottom-6 -right-6 w-32 opacity-[0.12] sm:w-40" />
            <span aria-hidden="true" className="text-[44px] font-extrabold leading-none tracking-[-0.04em] text-white sm:text-[68px]">
              {inisial(a.nama)}
            </span>
            <span className="mt-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium text-white sm:mt-3 sm:text-[13px]">Foto menyusul</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-[18px] font-bold leading-tight tracking-tight sm:text-[21px]">{a.nama}</p>
      <p className="mt-1.5 inline-flex rounded-full bg-kertas px-3 py-1 text-[13px] font-semibold text-kemasan sm:text-[14px]">{a.peran}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-sekunder sm:text-[15px]">{a.tugas}</p>
    </li>
  );
}

export default function TimPage() {
  const galeri = fotoProduksi();

  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1">
        <HeroHalaman
          id="judul-tim"
          label="Universitas Syiah Kuala"
          Ikon={UsersThreeIcon}
          judul={
            <>
              Tim di balik <span className="teks-foil">Patchmos</span>
            </>
          }
          pengantar={
            <>
              <p>
                Lima mahasiswa Universitas Syiah Kuala dan satu dosen pendamping. Kami mengolah ampas penyulingan nilam Aceh menjadi spray penolak
                nyamuk, dan membangun MosqRisk untuk membaca risiko nyamuk dari prakiraan cuaca.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-pucat">
                Program Pendanaan Internal Kewirausahaan (PIKU) Batch II, Universitas Syiah Kuala, Banda Aceh.
              </p>
            </>
          }
          aksi={
            <a href="#anggota" className={kelasTombol("foil", "lg", "rounded-full! px-8")}>
              Kenali anggota tim
            </a>
          }
          kanan={
            // Kolase wajah asli tim — kartu putih melayang sedikit miring (gaya web lama)
            <div className="mx-auto max-w-[30rem] rotate-[2deg] rounded-media bg-white p-6 text-tinta shadow-angkat md:p-8">
              <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
                {ANGGOTA.map((a) => {
                  const wajah = cariWajahTim(a.foto);
                  return (
                    <li key={a.nama} className="text-center">
                      <span className="relative mx-auto block aspect-square w-full max-w-20 overflow-hidden rounded-full bg-kertas ring-4 ring-kertas">
                        {wajah ? (
                          <Image src={wajah} alt="" fill sizes="80px" className="object-cover" />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[18px] font-bold text-kemasan">{inisial(a.nama)}</span>
                        )}
                      </span>
                      <span className="mt-2 block text-[13px] font-semibold leading-tight">{a.nama.split(" ")[0]}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 border-t border-garis pt-4 text-[14px] text-sekunder">Tim Patchmos, PIKU Batch II 2026</p>
            </div>
          }
        />

        <section id="anggota" aria-labelledby="judul-anggota" className="scroll-mt-20 bg-white">
          <div className="wadah py-16 md:py-24">
            <h2 id="judul-anggota" className="sr-only">
              Anggota tim dan dosen pendamping
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3">
              {[...ANGGOTA, PENDAMPING].map((a, i) => (
                <KartuAnggota key={a.nama} a={a} urutan={i} />
              ))}
            </ul>
          </div>
        </section>

        <section id="produksi" aria-labelledby="judul-proses" className="scroll-mt-20 bg-kertas">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-proses" className="judul-2 lg:col-span-6">
                Cara Patchmos dibuat
              </h2>
              <p className="pengantar lg:col-span-6">
                Bahan aktifnya berasal dari alam, yaitu ampas nilam. Formulanya memakai bahan penolong seperti Tween 80, jadi kami tidak menyebut
                Patchmos &ldquo;100% alami&rdquo;.
              </p>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TAHAP.map(({ judul, isi, Ikon }, i) => (
                <li key={judul} className="relative overflow-hidden rounded-media bg-white p-6 md:p-7">
                  <span aria-hidden="true" className="angka absolute -right-2 -top-6 text-[110px] font-extrabold leading-none tracking-[-0.06em] text-kertas">
                    {i + 1}
                  </span>
                  <span className="relative grid h-12 w-12 place-items-center rounded-full bg-kemasan text-white">
                    <Ikon size={24} weight="duotone" aria-hidden="true" />
                  </span>
                  <p className="relative mt-5 text-[19px] font-bold tracking-tight">
                    <span className="sr-only">Tahap {i + 1}: </span>
                    {judul}
                  </p>
                  <p className="relative mt-1.5 text-[15.5px] leading-relaxed text-sekunder">{isi}</p>
                </li>
              ))}
            </ol>
            <p className="keterangan mt-5">Sumber: Proposal PIKU Universitas Syiah Kuala 2026.</p>

            <div className="mt-14">
              <h3 className="text-[19px] font-bold tracking-tight">Dokumentasi produksi</h3>
              {galeri.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {galeri.map((g) => (
                    <li key={g.src}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-kartu bg-kertas-gelap">
                        <Image src={g.src} alt={g.keterangan} fill sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw" className="object-cover" />
                      </div>
                      <p className="mt-2 text-[14px] text-sekunder">{g.keterangan}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-sekunder">
                  Foto dokumentasi produksi menyusul. Kami hanya akan memasang foto asli dari proses pembuatan Patchmos.
                </p>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="judul-uji" className="bg-white">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-uji" className="judul-2 lg:col-span-6">
                Hasil uji sejauh ini
              </h2>
              <p className="pengantar lg:col-span-6">
                Uji persepsi sudah dilakukan. Uji efikasi dan keamanan kulit di laboratorium masih direncanakan; hasilnya akan kami tambahkan di sini
                setelah tersedia.
              </p>
            </div>
            <div className="mt-12">
              <BuktiUji />
            </div>
          </div>
        </section>

        <section aria-labelledby="judul-kontak" className="permukaan-gelap bg-kemasan text-white">
          <div className="wadah flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 id="judul-kontak" className="judul-3">
                Pertanyaan, kerja sama, atau pesanan dalam jumlah besar?
              </h2>
              <p className="mt-2 text-[15px] text-pucat">Kami membalas lewat email.</p>
            </div>
            <a href="mailto:mosqrisk.official@gmail.com" className={kelasTombol("foil", "lg", "shrink-0")}>
              <EnvelopeSimpleIcon size={20} weight="duotone" aria-hidden="true" />
              mosqrisk.official@gmail.com
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
