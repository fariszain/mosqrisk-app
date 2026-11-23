import Image from "next/image";
import Link from "next/link";
import { EnvelopeSimpleIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import Ornamen from "@/components/ui/Ornamen";

// Footer global: permukaan hutan dengan motif pucok reubong emas di tepi atas.
// Sumber data ditulis sebagai atribusi — BUKAN kemitraan/afiliasi resmi dengan instansi mana pun.
const JELAJAHI = [
  { href: "/pantau", label: "Pantau risiko" },
  { href: "/lapor", label: "Lapor warga" },
  { href: "/edukasi", label: "Edukasi DBD" },
  { href: "/tim", label: "Tim Patchmos" },
];
const PRODUK = [
  { href: "/checkout", label: "Beli Patchmos" },
  { href: "/claim", label: "Klaim kode Premium" },
  { href: "/kredit", label: "Kredit foto & data" },
  { href: "/privasi", label: "Kebijakan privasi" },
];

function Kolom({ judul, tautan }: { judul: string; tautan: { href: string; label: string }[] }) {
  return (
    <nav aria-label={judul}>
      <p className="text-[14px] font-semibold text-white">{judul}</p>
      <ul className="mt-3 space-y-0.5">
        {tautan.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="inline-flex min-h-10 items-center text-[15px] text-pucat transition-colors hover:text-white">
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="permukaan-gelap mt-auto bg-hutan text-white">
      <Ornamen />
      <div className="wadah grid gap-12 pb-10 pt-14 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Image src="/brand/patchmos-logo-mark.png" alt="" width={894} height={886} sizes="48px" className="h-12 w-12" />
            <p className="text-[28px] font-extrabold leading-none tracking-[-0.035em]">Patchmos</p>
          </div>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-pucat">
            Spray bio-repellent dengan bahan aktif dari ampas nilam Aceh. Kode QR di kemasannya membuka MosqRisk, pemantau risiko nyamuk DBD dari
            prakiraan cuaca BMKG.
          </p>
          <ul className="mt-6 space-y-2 text-[15px]">
            <li>
              <a href="mailto:mosqrisk.official@gmail.com" className="inline-flex min-h-10 items-center gap-2.5 text-white transition-colors hover:text-foil">
                <EnvelopeSimpleIcon size={20} weight="duotone" aria-hidden="true" className="text-foil" />
                mosqrisk.official@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-pucat">
              <MapPinIcon size={20} weight="duotone" aria-hidden="true" className="text-foil" />
              Universitas Syiah Kuala, Banda Aceh
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-4">
          <Kolom judul="Jelajahi" tautan={JELAJAHI} />
          <Kolom judul="Patchmos" tautan={PRODUK} />
        </div>

        <div className="md:col-span-3">
          <p className="text-[14px] font-semibold text-white">Sumber data</p>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-pucat">
            <li>Prakiraan cuaca: BMKG (API publik)</li>
            <li>Tren iklim historis: Open-Meteo</li>
            <li>Statistik kasus DBD: Kementerian Kesehatan (2026)</li>
          </ul>
          <p className="mt-6 text-[13px] leading-relaxed text-pucat/90">
            Dikembangkan tim mahasiswa Universitas Syiah Kuala dalam Program Pendanaan Internal Kewirausahaan (PIKU) Batch II.
          </p>
        </div>
      </div>

      <div className="wadah">
        <div className="flex flex-col gap-2 border-t border-white/12 py-6 text-[13px] text-pucat sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tim Patchmos, Universitas Syiah Kuala.</p>
          <p>Bukan pengganti saran tenaga kesehatan.</p>
        </div>
      </div>
    </footer>
  );
}
