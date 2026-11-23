"use client";

import Image from "next/image";
import { ChartLineUpIcon, QrCodeIcon } from "@phosphor-icons/react/ssr";
import { useTerlihat } from "@/components/ui/useTerlihat";
import { FOTO } from "@/lib/foto";

// Rantai pasok Patchmos yang sebenarnya — penomoran sah karena urutannya nyata.
// Garis emas "tumbuh" dari kiri ke kanan sekali saat bagian ini terlihat, simpul muncul berurutan.
// Angka hanya dari docs/expo/05_FAKTA_TERVERIFIKASI.md (sumber tercantum di tiap simpul).
type Visual =
  | { jenis: "foto"; src: string; alt: string; w: number; h: number; posisi?: string }
  | { jenis: "angka"; teks: string; ket: string; nada: "minyak" | "ampas" }
  | { jenis: "ikon"; ikon: "qr" | "grafik" };

type Simpul = { judul: string; isi: string; sumber?: string; visual: Visual; produk?: boolean };

const RANTAI: Simpul[] = [
  {
    judul: "Petani nilam",
    isi: "Indonesia menguasai sekitar 95% pasar minyak nilam dunia; Aceh salah satu sentra produksinya.",
    sumber: "Pusdatin Pertanian, 2024",
    visual: { jenis: "foto", ...FOTO.nilamBibit, posisi: "50% 40%" },
  },
  {
    judul: "Penyulingan",
    isi: "Daun nilam disuling; hasilnya hanya sekitar 1,5–3% minyak atsiri.",
    sumber: "Indriani dkk., 2025",
    visual: { jenis: "angka", teks: "1,5–3%", ket: "jadi minyak", nada: "minyak" },
  },
  {
    judul: "Ampas",
    isi: "Lebih dari 95% sisanya limbah padat yang umumnya belum dimanfaatkan.",
    sumber: "Indriani dkk., 2025",
    visual: { jenis: "foto", ...FOTO.nilamRacik, posisi: "80% 55%" },
  },
  {
    judul: "Patchmos",
    isi: "Bahan aktif diekstrak dari ampas, dimikroenkapsulasi, lalu diformulasikan menjadi spray tanpa DEET.",
    visual: { jenis: "foto", src: "/brand/patchmos-produk.png", alt: "Botol dan kotak Patchmos Spray", w: 1471, h: 1236 },
    produk: true,
  },
  { judul: "Pengguna", isi: "Kode QR di kemasan membuka fitur Premium MosqRisk.", visual: { jenis: "ikon", ikon: "qr" } },
  { judul: "Data MosqRisk", isi: "Skor risiko nyamuk harian dari prakiraan cuaca BMKG.", visual: { jenis: "ikon", ikon: "grafik" } },
];

function GambarSimpul({ v, produk }: { v: Visual; produk?: boolean }) {
  if (v.jenis === "foto") {
    return (
      <div className={`relative aspect-square overflow-hidden rounded-kartu ${produk ? "bg-kertas" : "bg-kemasan"}`}>
        <Image
          src={v.src}
          alt={v.alt}
          fill
          sizes="(min-width: 1024px) 180px, 96px"
          className={produk ? "object-contain p-2" : "object-cover"}
          style={v.posisi ? { objectPosition: v.posisi } : undefined}
        />
      </div>
    );
  }
  if (v.jenis === "angka") {
    return (
      <div
        className={`flex aspect-square flex-col items-start justify-end rounded-kartu p-3 lg:p-4 ${v.nada === "minyak" ? "bg-emas-teks" : "bg-ampas"}`}
      >
        <span className="angka text-[22px] font-extrabold leading-none tracking-[-0.04em] text-white lg:text-[30px]">{v.teks}</span>
        <span className="mt-1 text-[12px] font-medium text-pucat lg:text-[13px]">{v.ket}</span>
      </div>
    );
  }
  const Ikon = v.ikon === "qr" ? QrCodeIcon : ChartLineUpIcon;
  return (
    <div className="flex aspect-square items-center justify-center rounded-kartu border border-white/15 bg-white/5">
      <Ikon weight="duotone" aria-hidden="true" className="h-10 w-10 text-pucuk lg:h-16 lg:w-16" />
    </div>
  );
}

export default function RantaiNilam() {
  const [ref, terlihat] = useTerlihat<HTMLOListElement>(0.2);

  return (
    <ol ref={ref} className="relative grid gap-x-5 gap-y-7 lg:grid-cols-6">
      {/* Garis emas yang tumbuh (desktop) — melewati pusat lencana nomor */}
      <span aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-[18px] hidden h-[2px] bg-white/12 lg:block" />
      <span
        aria-hidden="true"
        className="absolute left-[8.33%] right-[8.33%] top-[18px] hidden h-[2px] origin-left bg-foil transition-transform duration-[1600ms] ease-out lg:block"
        style={{ transform: terlihat ? "scaleX(1)" : "scaleX(0)" }}
      />
      {RANTAI.map((s, i) => (
        <li
          key={s.judul}
          className="relative grid grid-cols-[96px_1fr] items-start gap-x-4 transition-[opacity,transform] duration-700 ease-out lg:block"
          style={{
            opacity: terlihat ? 1 : 0,
            transform: terlihat ? "none" : "translateY(16px)",
            transitionDelay: `${150 + i * 170}ms`,
          }}
        >
          {/* Garis vertikal (mobile) */}
          {i < RANTAI.length - 1 && <span aria-hidden="true" className="absolute -bottom-7 left-[47px] top-[104px] w-[2px] bg-foil/50 lg:hidden" />}
          <div className="lg:flex lg:flex-col lg:items-center">
            <span
              aria-hidden="true"
              className={`relative z-10 mb-3 hidden h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold lg:inline-flex ${
                s.produk ? "bg-foil text-tinta" : "bg-hutan text-foil ring-2 ring-foil"
              }`}
            >
              {i + 1}
            </span>
            <div className="w-24 lg:w-full">
              <GambarSimpul v={s.visual} produk={s.produk} />
            </div>
          </div>
          <div className="lg:mt-4">
            <p className={`text-[17px] font-bold tracking-tight ${s.produk ? "text-foil" : "text-white"}`}>
              <span className="mr-1 lg:hidden">{i + 1}.</span>
              {s.judul}
            </p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-pucat">{s.isi}</p>
            {s.sumber && <p className="mt-2 text-[12.5px] text-pucat/80">{s.sumber}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
