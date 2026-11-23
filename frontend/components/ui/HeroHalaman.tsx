import Image from "next/image";
import { LeafIcon } from "@phosphor-icons/react/ssr";
import type { ComponentType } from "react";

// Kepala halaman bergaya hero Beranda "gabungan" (2026-11-09): bidang hutan penuh sampai ke belakang navbar
// kapsul, tekstur foto daun nilam, cahaya foil, label kapsul, judul besar dengan frasa emas opsional
// (bungkus frasanya dengan <span className="teks-foil">). Dipakai semua halaman selain Beranda supaya satu gaya.
// -mt sama dengan tinggi header (68 px HP, 80 px ≥ 768 px) — lihat Navbar.tsx.
type IkonProps = { size?: number; weight?: "duotone"; className?: string; "aria-hidden"?: boolean | "true" };

const tunda = (ms: number) => ({ "--tunda": `${ms}ms` }) as React.CSSProperties;

export default function HeroHalaman({
  id,
  label,
  Ikon = LeafIcon,
  judul,
  pengantar,
  aksi,
  kanan,
  bawah,
  foto = "/foto/nilam-daun.webp",
  rata = "kiri",
}: {
  id?: string;
  label?: React.ReactNode;
  Ikon?: ComponentType<IkonProps>;
  judul: React.ReactNode;
  pengantar?: React.ReactNode;
  aksi?: React.ReactNode;
  /** Kolom kanan (foto, kartu) — hanya untuk rata kiri */
  kanan?: React.ReactNode;
  /** Isi tambahan di bawah, masih di atas latar hutan (mis. panel pilih wilayah) */
  bawah?: React.ReactNode;
  foto?: string;
  rata?: "kiri" | "tengah";
}) {
  const tengah = rata === "tengah" || !kanan;
  return (
    <section
      aria-labelledby={id}
      className="permukaan-gelap relative isolate -mt-[68px] bg-hutan pt-[68px] text-white md:-mt-20 md:pt-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image src={foto} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-hutan/75 via-hutan/50 to-hutan" />
        <div className="absolute -bottom-40 left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-foil/15 blur-[120px]" />
      </div>

      <div
        className={`wadah grid items-center gap-10 pb-14 pt-10 md:pb-20 md:pt-16 ${
          tengah ? "text-center" : "lg:grid-cols-12"
        }`}
      >
        <div className={tengah ? "mx-auto max-w-[56rem]" : "lg:col-span-6"}>
          {label && (
            <p
              className="masuk inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[14px] font-medium text-pucat backdrop-blur-sm"
              style={tunda(0)}
            >
              <Ikon size={18} weight="duotone" aria-hidden="true" className="text-foil" />
              {label}
            </p>
          )}
          <h1
            id={id}
            className={`masuk mt-5 font-extrabold leading-[1.0] tracking-[-0.04em] [text-wrap:balance] ${
              tengah ? "mx-auto max-w-[18ch] text-[clamp(2.4rem,1.15rem+3.7vw,4.5rem)]" : "max-w-[20ch] text-[clamp(2.3rem,1.2rem+3vw,3.9rem)]"
            }`}
            style={tunda(100)}
          >
            {judul}
          </h1>
          {pengantar && (
            <div className={`pengantar masuk mt-5 max-w-[52ch] ${tengah ? "mx-auto" : ""}`} style={tunda(200)}>
              {pengantar}
            </div>
          )}
          {aksi && (
            <div className={`masuk mt-8 flex flex-wrap items-center gap-3 ${tengah ? "justify-center" : ""}`} style={tunda(300)}>
              {aksi}
            </div>
          )}
        </div>
        {kanan && !tengah && (
          <div className="masuk lg:col-span-6" style={tunda(200)}>
            {kanan}
          </div>
        )}
      </div>
      {bawah}
    </section>
  );
}
