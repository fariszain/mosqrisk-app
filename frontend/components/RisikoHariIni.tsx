"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react/ssr";
import SkalaRisiko from "@/components/SkalaRisiko";
import { DataRisiko, LokasiTersimpan, ambilRisiko, rapikanNama } from "@/lib/risiko";
import { useLokasiTersimpan } from "@/lib/lokasi";

// Indikator risiko live untuk Beranda: lokasi terakhir dari /pantau, atau Kota Banda Aceh (bawaan).
export default function RisikoHariIni() {
  const { lokasi, bawaan } = useLokasiTersimpan();
  const [data, setData] = useState<DataRisiko | null>(null);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [pesan, setPesan] = useState("");

  const permintaan = useRef(0);

  const muat = useCallback(async (l: LokasiTersimpan) => {
    const id = ++permintaan.current;
    setStatus("memuat");
    try {
      const hasil = await ambilRisiko(l.regId);
      if (id !== permintaan.current) return;
      setData(hasil);
      setStatus("siap");
    } catch (e) {
      if (id !== permintaan.current) return;
      setPesan(e instanceof Error ? e.message : "");
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat(lokasi);
  }, [muat, lokasi]);

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-garis pb-5">
        <p className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
          <MapPinIcon size={20} weight="duotone" aria-hidden="true" className="text-kemasan" />
          {rapikanNama(lokasi.nama)}
          {bawaan && <span className="font-normal text-sekunder">(lokasi bawaan)</span>}
        </p>
        <Link href="/pantau" className="tautan inline-flex min-h-11 items-center text-[15px] font-semibold text-kemasan">
          Ganti lokasi & lihat prakiraan 3 hari
        </Link>
      </div>
      <SkalaRisiko data={data} status={status} pesanGagal={pesan} onCobaLagi={() => void muat(lokasi)} />
    </div>
  );
}
