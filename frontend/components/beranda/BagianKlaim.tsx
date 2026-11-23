"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDotsIcon, CheckCircleIcon, DeviceMobileIcon, EnvelopeSimpleIcon, QrCodeIcon } from "@phosphor-icons/react/ssr";
import ClaimModal from "@/components/ClaimModal";
import { kelasTombol } from "@/components/ui/tombol";
import { usePremium } from "@/lib/premium";

// Section aksi di Beranda: klaim kode kemasan (atau status Premium kalau sudah aktif).
const ISI_PREMIUM = [
  { Ikon: CalendarDotsIcon, judul: "Prakiraan risiko 3 hari", isi: "Untuk wilayah yang kamu pilih di halaman pantauan." },
  { Ikon: EnvelopeSimpleIcon, judul: "Email peringatan", isi: "Saat ada laporan warga di wilayah langgananmu atau peringatan dari tim." },
  { Ikon: DeviceMobileIcon, judul: "Tanpa akun", isi: "Tersimpan di browser perangkat ini, tanpa masa berlaku." },
];

export default function BagianKlaim() {
  const premium = usePremium();
  const [buka, setBuka] = useState(false);

  return (
    <section aria-labelledby="judul-klaim" className="permukaan-gelap relative overflow-hidden bg-kemasan text-white">
      <QrCodeIcon
        aria-hidden="true"
        weight="thin"
        className="pointer-events-none absolute -right-16 -top-10 h-[22rem] w-[22rem] text-white/[0.05] md:h-[30rem] md:w-[30rem]"
      />
      <div className="wadah relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {premium ? (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-pucuk">
                <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
                Premium aktif
              </p>
              <h2 id="judul-klaim" className="judul-2 mt-4">
                Premium MosqRisk aktif di perangkat ini
              </h2>
              <p className="pengantar mt-4">Prakiraan risiko 3 hari dan notifikasi email sudah terbuka di halaman pantauan.</p>
              <div className="mt-8">
                <Link href="/pantau" className={kelasTombol("foil", "lg")}>
                  Buka pantauan risiko
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 id="judul-klaim" className="judul-2">
                Sudah punya kemasan Patchmos?
              </h2>
              <p className="pengantar mt-4 max-w-[44ch]">
                Pindai kode QR di kemasan, atau ketik kodenya, untuk membuka fitur Premium MosqRisk di perangkat ini.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button type="button" onClick={() => setBuka(true)} className={kelasTombol("foil", "lg")}>
                  <QrCodeIcon size={22} weight="duotone" aria-hidden="true" />
                  Masukkan kode kemasan
                </button>
                <Link href="/checkout" className="tautan inline-flex min-h-11 items-center font-semibold">
                  Belum punya? Beli Patchmos
                </Link>
              </div>
            </>
          )}
        </div>

        <ul className="grid gap-3 lg:col-span-5 lg:col-start-8">
          {ISI_PREMIUM.map(({ Ikon, judul, isi }) => (
            <li key={judul} className="flex gap-4 rounded-kartu bg-white/[0.07] p-4 md:p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foil/15 text-foil">
                <Ikon size={22} weight="duotone" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[16px] font-bold">{judul}</span>
                <span className="mt-0.5 block text-[14.5px] leading-relaxed text-pucat">{isi}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <ClaimModal isOpen={buka} onClose={() => setBuka(false)} />
    </section>
  );
}
