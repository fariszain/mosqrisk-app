"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { CEKLIS } from "@/lib/edukasi";

// Checklist pencegahan hari ini (3M Plus). Tersimpan di browser per tanggal — besok mulai kosong lagi.
// Tidak dikirim ke server. Dibaca lewat useSyncExternalStore (server/hidrasi: kosong).
const kunci = (tgl: string) => `mosqrisk:ceklis:${tgl}`;
const PERISTIWA = "mosqrisk:ceklis";

function langganan(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(PERISTIWA, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(PERISTIWA, cb);
  };
}

function urai(mentah: string | null): string[] {
  try {
    const v = JSON.parse(mentah || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function ChecklistPencegahan({ tanggal }: { tanggal: string }) {
  const mentah = useSyncExternalStore(
    langganan,
    () => {
      try {
        return localStorage.getItem(kunci(tanggal));
      } catch {
        return null;
      }
    },
    () => null,
  );
  // Cadangan kalau penyimpanan browser tidak tersedia: centang berlaku selama halaman terbuka.
  const [cadangan, setCadangan] = useState<{ tanggal: string; isi: string[] } | null>(null);
  const tersimpan = useMemo(() => urai(mentah), [mentah]);
  const selesai = cadangan?.tanggal === tanggal ? cadangan.isi : tersimpan;

  const ubah = (id: string) => {
    const baru = selesai.includes(id) ? selesai.filter((x) => x !== id) : [...selesai, id];
    try {
      localStorage.setItem(kunci(tanggal), JSON.stringify(baru));
      window.dispatchEvent(new Event(PERISTIWA));
    } catch {
      setCadangan({ tanggal, isi: baru });
    }
  };

  const jumlah = CEKLIS.filter((c) => selesai.includes(c.id)).length;
  const persen = (jumlah / CEKLIS.length) * 100;
  const keliling = 2 * Math.PI * 22;

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" strokeWidth="6" className="stroke-kertas-gelap" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-kemasan transition-[stroke-dashoffset] duration-500 ease-out"
              strokeDasharray={keliling}
              strokeDashoffset={keliling * (1 - persen / 100)}
            />
          </svg>
          <span className="angka absolute inset-0 grid place-items-center text-[14px] font-bold">
            {jumlah}/{CEKLIS.length}
          </span>
        </div>
        <div>
          <h2 className="text-[18px] font-bold tracking-tight">Checklist pencegahan hari ini</h2>
          <p className="text-[14px] text-sekunder" aria-live="polite">
            {jumlah === CEKLIS.length ? "Semua langkah selesai. Ulangi rutin, terutama saat risiko tinggi." : `${jumlah} dari ${CEKLIS.length} langkah selesai`}
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {CEKLIS.map((c) => {
          const cek = selesai.includes(c.id);
          return (
            <li key={c.id}>
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-kontrol border-[1.5px] px-3.5 py-2.5 text-[15px] leading-snug transition-colors ${
                  cek ? "border-kemasan/30 bg-risiko-rendah-latar/60 text-sekunder" : "border-garis bg-white hover:border-garis-kuat"
                }`}
              >
                <input type="checkbox" checked={cek} onChange={() => ubah(c.id)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tinta ${
                    cek ? "border-kemasan bg-kemasan text-white" : "border-garis-kuat bg-white text-transparent"
                  }`}
                >
                  <CheckIcon size={15} weight="bold" />
                </span>
                <span className={cek ? "line-through decoration-1" : ""}>{c.teks}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="keterangan mt-3">
        Langkah dari 3M Plus Kementerian Kesehatan.{" "}
        <Link href="/edukasi#pencegahan" className="tautan font-semibold text-kemasan">
          Penjelasan lengkap
        </Link>
      </p>
    </div>
  );
}
