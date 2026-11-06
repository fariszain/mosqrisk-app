"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Arah B — Instrumen Kesehatan Publik (prototipe Fase 2).
// Token hasil sampling logo & kemasan — lihat docs/expo/design-lab.md §2.
const T = {
  tinta: "#033111",
  panel: "#EEF2EE",
  garis: "#D5DDD6",
  sekunder: "#4A5A4F",
  emas: "#E4AE3C",
  tinggi: "#8E1B1B",
  sedang: "#8A5A00",
  rendah: "#2E6B3F",
};

const ADM4_BANDA_ACEH = "11.71.03.2001";

type DataRisiko = {
  temperature_celsius: number;
  humidity_percent: number;
  precipitation_mm: number;
  risk_score: number;
  risk_status: "TINGGI" | "SEDANG" | "RENDAH";
};

// SALINAN rumus calculate_mosquito_risk() di backend/main.py — hanya untuk prototipe.
// Kalau arah B dipilih, rincian poin dipindah ke response /api/mosqrisk (satu sumber).
function poinFaktor(t: number, h: number, p: number) {
  const sigma = t <= 28 ? 5 : 2.5;
  const suhu = Math.exp(-0.5 * ((t - 28) / sigma) ** 2) * 40;
  const lembap = h >= 80 ? 25 : h >= 60 ? ((h - 60) / 20) * 25 : Math.max(0, h / 60) * 10;
  const hujan = p === 0 ? 10 : p >= 0.5 && p <= 20 ? 35 : p > 20 && p <= 35 ? 20 : 5;
  return { suhu, lembap, hujan };
}

const KATEGORI = {
  TINGGI: { label: "Risiko tinggi", warna: T.tinggi },
  SEDANG: { label: "Risiko sedang", warna: T.sedang },
  RENDAH: { label: "Risiko rendah", warna: T.rendah },
};

const fmt = (n: number, d = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: d });

export default function ArahB() {
  const [data, setData] = useState<DataRisiko | null>(null);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [angka, setAngka] = useState(0);
  const [penanda, setPenanda] = useState(0);
  const [dimuat, setDimuat] = useState("");

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/mosqrisk?adm4=${ADM4_BANDA_ACEH}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
      setDimuat(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }));
      setStatus("siap");
    } catch {
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Satu momen gerak: angka menghitung naik & penanda meluncur ke skor (sekali).
  useEffect(() => {
    if (!data) return;
    const target = data.risk_score;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAngka(target);
      setPenanda(target);
      return;
    }
    let raf = 0;
    const mulai = performance.now();
    const langkah = (now: number) => {
      const k = Math.min(1, (now - mulai) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setAngka(Math.round(target * e));
      setPenanda(target * e);
      if (k < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  const poin = data ? poinFaktor(data.temperature_celsius, data.humidity_percent, data.precipitation_mm) : null;
  const kat = data ? KATEGORI[data.risk_status] : null;

  return (
    <div className="lab-archivo bg-white" style={{ color: T.tinta }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: T.garis }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="MosqRisk, ke Beranda">
            <Image src="/brand/patchmos-logo-mark.png" alt="" width={894} height={886} className="h-8 w-auto" priority />
            <span className="lab-w112 font-bold text-[19px] tracking-tight">MosqRisk</span>
          </Link>
          <nav aria-label="Navigasi utama" className="hidden md:flex gap-7 text-[15px]">
            <Link href="/pantau" className="hover:underline underline-offset-4">Pantau risiko</Link>
            <Link href="/lapor" className="hover:underline underline-offset-4">Lapor warga</Link>
            <Link href="/edukasi" className="hover:underline underline-offset-4">Edukasi</Link>
          </nav>
          <Link href="/checkout" className="inline-flex items-center min-h-[44px] px-5 rounded-[10px] font-semibold text-white" style={{ background: T.tinta }}>
            Beli Patchmos
          </Link>
        </div>
      </header>

      {/* Hero: instrumen */}
      <section>
        <div className="mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-14 md:pt-14 md:pb-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="lab-w85 text-[15px]" style={{ color: T.sekunder }}>Risiko nyamuk DBD hari ini</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="lab-w112 text-[26px] md:text-[32px] font-bold tracking-tight">Kota Banda Aceh</h1>
              <Link href="/pantau" className="text-[15px] underline underline-offset-4 min-h-[44px] inline-flex items-center">Ganti lokasi</Link>
            </div>

            {/* Angka skor */}
            <div className="mt-4 flex items-end gap-4" aria-live="polite">
              <p className="lab-w125 font-bold tabular-nums leading-[0.85] text-[104px] md:text-[156px]">
                {status === "siap" ? angka : "–"}
              </p>
              <div className="pb-2 md:pb-4">
                <p className="text-[17px] tabular-nums" style={{ color: T.sekunder }}>dari 100</p>
                {kat && (
                  <p className="font-bold text-[19px] md:text-[22px]" style={{ color: kat.warna }}>{kat.label}</p>
                )}
              </div>
            </div>

            {/* Signature: skala kesesuaian Aedes dengan ambang asli (50 & 75) */}
            <div className="mt-6" role="img" aria-label={data ? `Skor ${data.risk_score} dari 100, zona ${kat?.label.toLowerCase()}` : "Skala risiko 0 sampai 100"}>
              <div className="relative h-3 rounded-full overflow-hidden flex">
                <div className="h-full" style={{ width: "50%", background: "#DCE8DE" }} />
                <div className="h-full" style={{ width: "25%", background: "#F2E5C6" }} />
                <div className="h-full" style={{ width: "25%", background: "#F1D5D2" }} />
              </div>
              <div className="relative h-0">
                {status === "siap" && (
                  <div className="absolute -top-[22px] -translate-x-1/2" style={{ left: `${penanda}%` }} aria-hidden="true">
                    <div className="w-[3px] h-[26px] mx-auto rounded-full" style={{ background: T.tinta }} />
                  </div>
                )}
              </div>
              {/* Nama zona rata kiri di dalam zonanya, dengan rentang ambang asli backend */}
              <div className="mt-2 flex text-[13px] lab-w85 leading-tight">
                <div style={{ width: "50%", color: T.rendah }}>Rendah<span className="block tabular-nums" style={{ color: T.sekunder }}>0–49</span></div>
                <div style={{ width: "25%", color: T.sedang }}>Sedang<span className="block tabular-nums" style={{ color: T.sekunder }}>50–74</span></div>
                <div style={{ width: "25%", color: T.tinggi }}>Tinggi<span className="block tabular-nums" style={{ color: T.sekunder }}>75–100</span></div>
              </div>
            </div>

            {/* Rincian faktor */}
            {status === "siap" && data && poin && (
              <dl className="mt-4 grid grid-cols-3 border-t" style={{ borderColor: T.garis }}>
                {[
                  { nama: "Suhu", nilai: `${fmt(data.temperature_celsius)}°C`, poin: poin.suhu, maks: 40 },
                  { nama: "Kelembapan", nilai: `${fmt(data.humidity_percent, 0)}%`, poin: poin.lembap, maks: 25 },
                  { nama: "Hujan hari ini", nilai: `${fmt(data.precipitation_mm)} mm`, poin: poin.hujan, maks: 35 },
                ].map((f) => (
                  <div key={f.nama} className="pt-4 pr-3">
                    <dt className="lab-w85 text-[14px]" style={{ color: T.sekunder }}>{f.nama}</dt>
                    <dd className="lab-w112 font-semibold text-[22px] md:text-[28px] tabular-nums mt-0.5">{f.nilai}</dd>
                    <dd className="text-[13px] tabular-nums mt-1" style={{ color: T.sekunder }}>{fmt(f.poin, 0)} dari {f.maks} poin</dd>
                  </div>
                ))}
              </dl>
            )}
            {status === "memuat" && <p className="mt-6 text-[15px]" style={{ color: T.sekunder }}>Memuat prakiraan cuaca BMKG…</p>}
            {status === "gagal" && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <p className="text-[15px]" style={{ color: T.tinggi }}>Data BMKG belum bisa dimuat.</p>
                <button onClick={() => void muat()} className="min-h-[44px] px-4 rounded-[10px] border font-semibold" style={{ borderColor: T.tinta }}>Coba lagi</button>
              </div>
            )}

            <p className="mt-6 text-[14px] leading-relaxed max-w-[62ch]" style={{ color: T.sekunder }}>
              Sumber: prakiraan cuaca BMKG (API publik){dimuat ? `, dimuat pukul ${dimuat} WIB` : ""}. Skor menilai seberapa mendukung cuaca
              bagi nyamuk <i>Aedes</i>, bukan jumlah kasus. Bobot: suhu 40, hujan 35, kelembapan 25 poin.
            </p>
          </div>

          {/* Produk */}
          <div className="lg:col-span-5">
            <div className="rounded-[10px] p-6 md:p-8 h-full flex flex-col" style={{ background: T.panel }}>
              <Image src="/brand/patchmos-produk.png" alt="Botol dan kotak Patchmos Spray" width={1471} height={1236} priority sizes="(min-width: 1024px) 34vw, 100vw" className="w-full h-auto" />
              <p className="lab-w112 font-bold text-[22px] mt-4">Patchmos Spray</p>
              <p className="text-[16px] leading-relaxed mt-1" style={{ color: T.sekunder }}>
                Spray bio-repellent dengan bahan aktif dari ampas nilam Aceh, tanpa DEET. Kode QR di kemasan membuka prakiraan risiko 3 hari dan notifikasi email.
              </p>
              <Link href="/checkout" className="mt-5 inline-flex items-center justify-center min-h-[48px] px-6 rounded-[10px] font-semibold text-white self-start" style={{ background: T.tinta }}>
                Beli Patchmos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Bukti */}
      <section className="border-t" style={{ borderColor: T.garis }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-20">
          <h2 className="lab-w112 text-[30px] md:text-[40px] font-bold tracking-tight">Bukti yang sudah ada, dan yang belum</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-10">
            <div>
              <p className="font-semibold text-[18px]">Sudah dilakukan: uji persepsi pengguna</p>
              <p className="text-[15px] mt-1" style={{ color: T.sekunder }}>10 responden, usia 20–58 tahun, memakai sampel selama 5 hari. Bukan uji klinis.</p>
              <dl className="mt-5 divide-y border-y" style={{ borderColor: T.garis }}>
                {[
                  ["Kelayakan", "92,8%"],
                  ["Kepraktisan", "94,5%"],
                  ["Keefektifan menurut responden", "92,5%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between py-3 gap-4" style={{ borderColor: T.garis }}>
                    <dt className="text-[16px]">{k}</dt>
                    <dd className="lab-w125 font-bold text-[30px] tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[15px] mt-3" style={{ color: T.sekunder }}>Tidak ada laporan iritasi kulit selama uji coba.</p>
            </div>
            <div>
              <p className="font-semibold text-[18px]">Direncanakan: uji laboratorium</p>
              <p className="text-[15px] mt-1" style={{ color: T.sekunder }}>Belum dilakukan per 6 November 2026.</p>
              <dl className="mt-5 divide-y border-y" style={{ borderColor: T.garis }}>
                {[
                  ["Efikasi", "Adaptasi cage test WHO, target Complete Protection Time terukur"],
                  ["Keamanan kulit", "Patch test pada panelis, pengamatan 30 menit–96 jam"],
                ].map(([k, v]) => (
                  <div key={k} className="py-3" style={{ borderColor: T.garis }}>
                    <dt className="text-[16px] font-medium">{k}</dt>
                    <dd className="text-[15px] mt-0.5" style={{ color: T.sekunder }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="mt-8 text-sm" style={{ color: T.sekunder }}>Sumber: Proposal UTU Awards 2026 (uji persepsi) dan Proposal PIKU USK 2026 (rencana uji).</p>
        </div>
      </section>
    </div>
  );
}
