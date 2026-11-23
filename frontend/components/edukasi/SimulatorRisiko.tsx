"use client";

import { useState } from "react";
import { CloudRainIcon, DropIcon, ThermometerSimpleIcon } from "@phosphor-icons/react/ssr";
import { KATEGORI } from "@/lib/risiko";
import { RUMUS, hitungSkor, nilaiFaktor, type NamaFaktor, type Rumus } from "@/lib/rumus";

// Simulator Model Risiko MosqRisk (v4): geser suhu, kelembapan, dan hujan → indeks & kategori berubah langsung.
// Indeks = 100 × pengali suhu × pengali kelembapan × pengali hujan (tiap pengali 0–1).
// Parameter dari backend/rumus_risiko.json (di-inline saat build) — sama persis dengan yang dipakai server.
// Contoh cepat di bawah adalah nilai rekaan untuk belajar, bukan data wilayah mana pun.
const RENTANG: Record<NamaFaktor, { min: number; max: number; langkah: number }> = {
  suhu: { min: 14, max: 38, langkah: 0.5 },
  kelembapan: { min: 20, max: 100, langkah: 1 },
  hujan: { min: 0, max: 120, langkah: 0.5 },
};
const IKON = { suhu: ThermometerSimpleIcon, kelembapan: DropIcon, hujan: CloudRainIcon };
const CONTOH = [
  { nama: "Hari hangat & lembap, hujan ringan", nilai: { suhu: 27.5, kelembapan: 85, hujan: 8 } },
  { nama: "Hari panas & kering", nilai: { suhu: 33, kelembapan: 55, hujan: 0 } },
  { nama: "Dataran tinggi yang sejuk", nilai: { suhu: 19, kelembapan: 88, hujan: 3 } },
  { nama: "Hujan sangat lebat", nilai: { suhu: 26, kelembapan: 95, hujan: 110 } },
];

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
const fmtP = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Grafik kecil kurva pengali (0–1) satu faktor + penanda nilai yang sedang dipilih.
function Kurva({ r, nama, nilai }: { r: Rumus; nama: NamaFaktor; nilai: number }) {
  const { min, max } = RENTANG[nama];
  const W = 300;
  const H = 84;
  const sx = (x: number) => ((x - min) / (max - min)) * W;
  const sy = (y: number) => H - 6 - y * (H - 14);
  const LANGKAH = 240;
  const d = Array.from({ length: LANGKAH + 1 }, (_, i) => {
    const x = min + ((max - min) * i) / LANGKAH;
    return `${i ? "L" : "M"} ${sx(x).toFixed(1)} ${sy(nilaiFaktor(r, nama, x)).toFixed(1)}`;
  }).join(" ");
  const poin = nilaiFaktor(r, nama, nilai);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden="true">
      <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} className="stroke-garis" strokeWidth={1} />
      <line x1={0} x2={W} y1={sy(1)} y2={sy(1)} className="stroke-garis" strokeWidth={1} strokeDasharray="3 4" />
      <path d={`${d} L ${W} ${sy(0)} L 0 ${sy(0)} Z`} className="fill-kemasan/8" />
      <path d={d} fill="none" className="stroke-kemasan" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={sx(nilai)} x2={sx(nilai)} y1={sy(0)} y2={sy(poin)} className="stroke-foil" strokeWidth={1.5} strokeDasharray="2 3" />
      <circle cx={sx(nilai)} cy={sy(poin)} r={6.5} className="fill-white stroke-kemasan transition-all duration-150" strokeWidth={3} />
    </svg>
  );
}

export default function SimulatorRisiko() {
  const [nilai, setNilai] = useState<Record<NamaFaktor, number>>(CONTOH[0].nilai);
  if (!RUMUS) return null;
  const r = RUMUS;
  const hasil = hitungSkor(r, nilai.suhu, nilai.kelembapan, nilai.hujan);
  const kat = KATEGORI[hasil.status];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {(["suhu", "kelembapan", "hujan"] as NamaFaktor[]).map((nama) => {
          const f = r.faktor[nama];
          const Ikon = IKON[nama];
          const { min, max, langkah } = RENTANG[nama];
          const id = `sim-${nama}`;
          return (
            <div key={nama} className="grid gap-4 rounded-kartu bg-white p-5 sm:grid-cols-[1fr_300px] sm:items-center md:p-6">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={id} className="flex items-center gap-2 text-[16px] font-bold">
                    <Ikon size={20} weight="duotone" aria-hidden="true" className="text-kemasan" />
                    {f.label}
                    <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${f.status === "jurnal" ? "bg-kertas text-kemasan" : "bg-foil/20 text-emas-teks"}`}>
                      {f.status === "jurnal" ? "dari jurnal" : "asumsi tim"}
                    </span>
                  </label>
                  <output htmlFor={id} className="angka text-[22px] font-extrabold tracking-tight">
                    {fmt(nilai[nama])}
                    <span className="text-[15px] font-semibold text-sekunder">{f.satuan === "°C" ? "°C" : ` ${f.satuan}`}</span>
                  </output>
                </div>
                <input
                  id={id}
                  type="range"
                  min={min}
                  max={max}
                  step={langkah}
                  value={nilai[nama]}
                  onChange={(e) => setNilai((n) => ({ ...n, [nama]: Number(e.target.value) }))}
                  aria-valuetext={`${fmt(nilai[nama])} ${f.satuan}, pengali ${fmtP(hasil.nilai[nama])}`}
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-kertas-gelap accent-kemasan [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-kemasan [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-kemasan [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgb(12_38_23/0.35)]"
                />
                <p className="mt-2 flex justify-between text-[12.5px] text-sekunder">
                  <span className="angka">
                    {min}
                    {f.satuan === "°C" ? "°C" : ` ${f.satuan}`}
                  </span>
                  <span className="angka font-semibold text-kemasan">pengali {fmtP(hasil.nilai[nama])}</span>
                  <span className="angka">
                    {max}
                    {f.satuan === "°C" ? "°C" : ` ${f.satuan}`}
                  </span>
                </p>
              </div>
              <Kurva r={r} nama={nama} nilai={nilai[nama]} />
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-4">
        <div className="permukaan-gelap rounded-kartu bg-hutan p-6 text-white md:p-7 lg:sticky lg:top-28">
          <p className="text-[15px] font-medium text-pucat">Indeks simulasi</p>
          <p className="angka mt-2 text-[72px] font-extrabold leading-[0.85] tracking-[-0.05em]" aria-live="polite">
            {hasil.skor}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[14px] font-bold" style={{ color: kat.warna, background: kat.latar }}>
            {kat.label}
          </p>
          <div aria-hidden="true" className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-foil transition-[width] duration-300 ease-out" style={{ width: `${hasil.skor}%` }} />
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-pucat">
            100 × {fmtP(hasil.nilai.suhu)} × {fmtP(hasil.nilai.kelembapan)} × {fmtP(hasil.nilai.hujan)}, dibulatkan.
          </p>
          <p className="mt-6 text-[14px] font-semibold">Coba contoh</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {CONTOH.map((c) => (
              <li key={c.nama}>
                <button
                  type="button"
                  onClick={() => setNilai(c.nilai)}
                  className="rounded-full border border-white/25 px-3 py-1.5 text-left text-[13px] font-medium text-white transition-colors hover:border-foil hover:bg-white/10"
                >
                  {c.nama}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] leading-relaxed text-pucat">Contoh berisi nilai rekaan untuk belajar, bukan data wilayah tertentu.</p>
        </div>
      </div>
    </div>
  );
}
