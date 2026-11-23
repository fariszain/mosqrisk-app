"use client";

import { useId, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react/ssr";

// Tanya-jawab yang bisa dibuka-tutup. Tinggi isi bertransisi lewat grid-template-rows (0fr → 1fr),
// isi yang tertutup diberi `inert` supaya tautan di dalamnya tidak bisa difokus.
export type ItemAkordion = { tanya: string; jawab: React.ReactNode };

export default function Akordion({ item, bukaAwal = 0 }: { item: ItemAkordion[]; bukaAwal?: number | null }) {
  const [buka, setBuka] = useState<number | null>(bukaAwal);
  const awalan = useId();

  return (
    <div className="border-t border-garis">
      {item.map((it, i) => {
        const terbuka = buka === i;
        const idIsi = `${awalan}-isi-${i}`;
        const idTombol = `${awalan}-tombol-${i}`;
        return (
          <div key={it.tanya} className="border-b border-garis">
            <h3>
              <button
                id={idTombol}
                type="button"
                aria-expanded={terbuka}
                aria-controls={idIsi}
                onClick={() => setBuka(terbuka ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold leading-snug tracking-tight md:py-6 md:text-[19px]"
              >
                <span className="transition-colors group-hover:text-kemasan">{it.tanya}</span>
                <span
                  aria-hidden="true"
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] transition-[transform,background-color,border-color,color] duration-300 ${
                    terbuka ? "rotate-45 border-kemasan bg-kemasan text-white" : "border-garis text-kemasan group-hover:border-kemasan"
                  }`}
                >
                  <PlusIcon size={18} weight="bold" />
                </span>
              </button>
            </h3>
            <div
              id={idIsi}
              role="region"
              aria-labelledby={idTombol}
              inert={!terbuka}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${terbuka ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="teks-isi max-w-[68ch] pb-6 pr-4 text-sekunder md:pr-16">{it.jawab}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
