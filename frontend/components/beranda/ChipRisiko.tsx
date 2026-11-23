"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react/ssr";
import { DataRisiko, KATEGORI, ambilRisiko, rapikanNama } from "@/lib/risiko";
import { useLokasiTersimpan } from "@/lib/lokasi";

// Kartu kecil yang "melayang" di panel hero: skor risiko hari ini untuk lokasi terakhir (atau Banda Aceh).
// Angka asli dari /api/mosqrisk; kalau gagal dimuat, kartu tetap jadi tautan ke /pantau.
export default function ChipRisiko() {
  const { lokasi } = useLokasiTersimpan();
  const [hasil, setHasil] = useState<{ regId: string; data: DataRisiko | null } | null>(null);

  useEffect(() => {
    let batal = false;
    ambilRisiko(lokasi.regId)
      .then((d) => !batal && setHasil({ regId: lokasi.regId, data: d }))
      .catch(() => !batal && setHasil({ regId: lokasi.regId, data: null }));
    return () => {
      batal = true;
    };
  }, [lokasi.regId]);

  const terbaru = hasil?.regId === lokasi.regId ? hasil : null;
  const data = terbaru?.data ?? null;
  const gagal = !!terbaru && !terbaru.data;
  const kat = data ? KATEGORI[data.risk_status] : null;

  return (
    <Link
      href="/pantau"
      className="group block w-[min(19rem,calc(100vw-4rem))] rounded-kartu bg-white p-4 text-tinta shadow-angkat transition-transform duration-300 hover:-translate-y-0.5 md:p-5"
    >
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-sekunder">
        <MapPinIcon size={16} weight="duotone" aria-hidden="true" className="text-kemasan" />
        Risiko nyamuk hari ini, {rapikanNama(lokasi.nama)}
      </span>
      <span className="mt-2 flex items-center gap-3">
        <span className="angka text-[42px] font-extrabold leading-none tracking-[-0.05em]">{data ? data.risk_score : "–"}</span>
        {kat ? (
          <span className="rounded-full px-3 py-1 text-[13px] font-bold" style={{ color: kat.warna, background: kat.latar }}>
            {kat.label}
          </span>
        ) : (
          <span className="text-[13px] text-sekunder">{gagal ? "Prakiraan belum termuat" : "Memuat prakiraan BMKG…"}</span>
        )}
      </span>
      <span aria-hidden="true" className="mt-3 block h-1.5 overflow-hidden rounded-full bg-kertas-gelap">
        <span
          className="block h-full rounded-full transition-[width] delay-300 duration-1000 ease-out"
          style={{ width: data ? `${data.risk_score}%` : "0%", background: kat?.isi }}
        />
      </span>
      <span className="mt-2.5 block text-[13.5px] font-semibold text-kemasan underline-offset-4 group-hover:underline">
        Lihat rincian & ganti lokasi
      </span>
    </Link>
  );
}
