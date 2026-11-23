"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FOTO, teksKredit } from "@/lib/foto";
import { SIKLUS } from "@/lib/edukasi";

// Siklus hidup Aedes interaktif: pilih tahap (klik / tombol panah), foto & penjelasan berganti.
// Pola tab ARIA: tablist + tab + tabpanel, panah kiri/kanan berpindah tahap.
const FOTO_TAHAP = [FOTO.siklusTelur, FOTO.siklusJentik, FOTO.siklusPupa, FOTO.siklusDewasa];
const AIR = [true, true, true, false];

export default function SiklusAedes() {
  const [aktif, setAktif] = useState(0);
  const tombol = useRef<(HTMLButtonElement | null)[]>([]);
  const foto = FOTO_TAHAP[aktif];
  const kredit = teksKredit(foto);

  const pindah = (i: number) => {
    const n = (i + SIKLUS.length) % SIKLUS.length;
    setAktif(n);
    tombol.current[n]?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div role="tablist" aria-label="Tahap siklus hidup nyamuk Aedes" className="flex gap-2 overflow-x-auto pb-1 lg:col-span-5 lg:flex-col lg:gap-3 lg:overflow-visible">
        {SIKLUS.map((s, i) => {
          const pilih = aktif === i;
          return (
            <button
              key={s.judul}
              ref={(el) => {
                tombol.current[i] = el;
              }}
              id={`tab-siklus-${i}`}
              role="tab"
              type="button"
              aria-selected={pilih}
              aria-controls="panel-siklus"
              tabIndex={pilih ? 0 : -1}
              onClick={() => setAktif(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  pindah(i + 1);
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  pindah(i - 1);
                }
              }}
              className={`group flex min-w-[9.5rem] shrink-0 items-start gap-3 rounded-kartu border-[1.5px] p-3.5 text-left transition-colors duration-200 lg:min-w-0 lg:p-5 ${
                pilih ? "border-kemasan bg-white shadow-tipis" : "border-transparent bg-white/60 hover:bg-white"
              }`}
            >
              <span
                className={`angka grid h-9 w-9 shrink-0 place-items-center rounded-full text-[15px] font-bold transition-colors ${
                  pilih ? "bg-kemasan text-white" : "bg-kertas-gelap text-kemasan"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold tracking-tight lg:text-[18px]">{s.judul}</span>
                <span className="mt-0.5 block text-[13px] text-sekunder">{AIR[i] ? "Hidup di air" : "Terbang di darat"}</span>
                <span className={`mt-2 hidden text-[15px] leading-relaxed text-sekunder ${pilih ? "lg:block" : "lg:hidden"}`}>{s.isi}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="panel-siklus" role="tabpanel" aria-labelledby={`tab-siklus-${aktif}`} className="lg:col-span-7">
        <figure key={aktif} className="ganti-isi">
          <div className="relative aspect-[4/3] overflow-hidden rounded-media bg-hutan">
            <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-hutan/85 to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 text-[22px] font-extrabold tracking-tight text-white md:bottom-6 md:left-7 md:text-[28px]">
              {aktif + 1}. {SIKLUS[aktif].judul}
            </p>
          </div>
          <figcaption className="mt-4">
            <p className="text-[16px] leading-relaxed lg:hidden">{SIKLUS[aktif].isi}</p>
            {kredit && (
              <p className="keterangan mt-2">
                {kredit},{" "}
                <a href={foto.tautan} target="_blank" rel="noopener noreferrer" className="tautan">
                  Wikimedia Commons
                </a>
              </p>
            )}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
