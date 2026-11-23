"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwiseIcon, CloudRainIcon, DropIcon, ThermometerSimpleIcon } from "@phosphor-icons/react/ssr";
import { DataRisiko, KATEGORI, ZONA, fmtAngka, fmtHari, fmtWaktuPrakiraan, rapikanNama } from "@/lib/risiko";
import { kelasTombol } from "@/components/ui/tombol";
import { gerakDikurangi, useTerlihat } from "@/components/ui/useTerlihat";
import IkonCuaca from "@/components/IkonCuaca";

// Indikator risiko: gauge setengah lingkaran (zona dengan ambang asli backend 50/75) + angka skor
// yang menghitung naik sekali saat terlihat, lalu pengali (0–1) per faktor dari response API
// (risk_factors — rumus tidak disalin ke browser) dan sumber + waktu prakiraan BMKG.
type Props = {
  data: DataRisiko | null;
  status: "memuat" | "siap" | "gagal";
  pesanGagal?: string;
  onCobaLagi?: () => void;
};

const DURASI_MS = 1100;
// Geometri gauge: pusat (120, 124), jari-jari 100, dari kiri (skor 0) melengkung ke kanan (skor 100).
const CX = 120;
const CY = 124;
const R = 100;
const titikBusur = (s: number) => {
  const a = Math.PI * (1 - Math.min(100, Math.max(0, s)) / 100);
  return [CX + R * Math.cos(a), CY - R * Math.sin(a)] as const;
};
const busur = (dari: number, ke: number) => {
  const [x0, y0] = titikBusur(dari);
  const [x1, y1] = titikBusur(ke);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

const FAKTOR = [
  { kunci: "suhu" as const, nama: "Suhu rata-rata", Ikon: ThermometerSimpleIcon },
  { kunci: "kelembapan" as const, nama: "Kelembapan", Ikon: DropIcon },
  { kunci: "hujan" as const, nama: "Hujan sehari", Ikon: CloudRainIcon },
];

export default function SkalaRisiko({ data, status, pesanGagal, onCobaLagi }: Props) {
  const [akar, terlihat] = useTerlihat<HTMLDivElement>(0.25);
  const [tampil, setTampil] = useState(0);
  const tampilRef = useRef(0);
  const skor = status === "siap" && data ? data.risk_score : null;

  useEffect(() => {
    if (skor === null || !terlihat) return;
    const awal = tampilRef.current;
    const instan = gerakDikurangi();
    let raf = 0;
    const mulai = performance.now();
    const langkah = (t: number) => {
      const k = instan ? 1 : Math.min(1, (t - mulai) / DURASI_MS);
      const v = awal + (skor - awal) * (1 - Math.pow(1 - k, 3));
      tampilRef.current = v;
      setTampil(v);
      if (k < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [skor, terlihat]);

  const kat = skor !== null && data ? KATEGORI[data.risk_status] : null;
  const hari = data?.basis?.date ? fmtHari(data.basis.date) : null;
  const waktuSekarang = data ? fmtWaktuPrakiraan(data.current?.time ?? data.forecast_time, data.timezone) : null;
  const titik =
    data?.location?.desa && data.location.kecamatan
      ? `${rapikanNama(data.location.desa)}, Kecamatan ${rapikanNama(data.location.kecamatan)}`
      : null;
  const f = data?.risk_factors;
  const [ujungX, ujungY] = titikBusur(tampil);
  const nilaiFaktor = data
    ? {
        suhu: `${fmtAngka(data.temperature_celsius)}°C`,
        kelembapan: `${fmtAngka(data.humidity_percent, 0)}%`,
        hujan: `${fmtAngka(data.precipitation_mm)} mm`,
      }
    : null;

  return (
    <div ref={akar}>
      <div className="grid items-center gap-x-10 gap-y-6 sm:grid-cols-[minmax(0,280px)_1fr]">
        {/* Gauge */}
        <div className="relative mx-auto w-full max-w-[300px]" aria-hidden="true">
          <svg viewBox="0 0 240 136" className="w-full overflow-visible">
            {ZONA.map((z, i) => {
              const dari = ZONA.slice(0, i).reduce((a, b) => a + b.lebar, 0);
              return (
                <path
                  key={z.status}
                  d={busur(dari + (i ? 0.8 : 0), dari + z.lebar - (i < ZONA.length - 1 ? 0.8 : 0))}
                  fill="none"
                  style={{ stroke: KATEGORI[z.status].latar }}
                  strokeWidth={18}
                  strokeLinecap="butt"
                />
              );
            })}
            {skor !== null && kat && (
              <>
                <path d={busur(0, Math.max(0.01, tampil))} fill="none" style={{ stroke: kat.isi }} strokeWidth={18} strokeLinecap="butt" />
                <circle cx={ujungX} cy={ujungY} r={12} fill="#fff" style={{ stroke: kat.isi }} strokeWidth={5} />
              </>
            )}
            <text x={CX - R} y={CY + 9} textAnchor="middle" className="fill-sekunder text-[10px] font-medium">0</text>
            <text x={CX + R} y={CY + 9} textAnchor="middle" className="fill-sekunder text-[10px] font-medium">100</text>
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="angka text-[64px] font-extrabold leading-[0.9] tracking-[-0.05em] md:text-[76px]">
              {skor !== null ? Math.round(tampil) : "–"}
            </p>
            <p className="mt-1 text-[13px] font-medium text-sekunder">dari 100</p>
          </div>
        </div>

        {/* Kategori & penjelasan */}
        <div>
          <p className="sr-only" aria-live="polite">
            {skor !== null && kat ? `Skor risiko ${skor} dari 100: ${kat.label.toLowerCase()}.` : status === "memuat" ? "Memuat prakiraan cuaca BMKG." : ""}
          </p>
          {kat ? (
            <>
              <p
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[15px] font-bold"
                style={{ color: kat.warna, background: kat.latar }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: kat.isi }} />
                {kat.label}
              </p>
              <p className="mt-3 max-w-[46ch] text-[17px] font-medium leading-snug md:text-[19px]">{kat.penjelasan}</p>
              <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-sekunder">{kat.tindakan}</p>
            </>
          ) : status === "memuat" ? (
            <div className="space-y-3" aria-hidden="true">
              <div className="h-8 w-36 animate-pulse rounded-full bg-kertas-gelap" />
              <div className="h-5 w-full max-w-[22rem] animate-pulse rounded-full bg-kertas-gelap" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-kertas-gelap" />
            </div>
          ) : null}
          {status === "memuat" && <p className="mt-4 text-[15px] text-sekunder">Memuat prakiraan cuaca BMKG…</p>}
          {status === "gagal" && (
            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3" role="alert">
              <p className="max-w-[48ch] text-[15px] text-galat">{pesanGagal || "Prakiraan cuaca BMKG belum bisa dimuat."}</p>
              {onCobaLagi && (
                <button type="button" onClick={onCobaLagi} className={kelasTombol("garis", "sm")}>
                  <ArrowsClockwiseIcon size={18} aria-hidden="true" />
                  Coba lagi
                </button>
              )}
            </div>
          )}
          {/* Legenda zona — teks, bukan warna saja */}
          <ul className="mt-5 flex flex-wrap gap-2 text-[13px]" aria-label="Kategori skor">
            {ZONA.map((z) => {
              const aktif = data?.risk_status === z.status && skor !== null;
              return (
                <li
                  key={z.status}
                  className={`rounded-full border px-3 py-1 transition-colors ${aktif ? "border-transparent font-bold" : "border-garis text-sekunder"}`}
                  style={aktif ? { color: KATEGORI[z.status].warna, background: KATEGORI[z.status].latar } : undefined}
                >
                  {z.nama} <span className="angka">{z.rentang}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Rincian faktor — pengali 0–1 dari backend (nilai_faktor); skor = 100 × hasil kalinya */}
      {skor !== null && data && f && nilaiFaktor && (
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          {FAKTOR.map(({ kunci, nama, Ikon }, i) => {
            const fk = f[kunci];
            const persen = Math.min(100, Math.max(0, fk.nilai * 100));
            return (
              <div key={kunci} className="rounded-kontrol bg-kertas px-4 py-3.5">
                <dt className="flex items-center gap-2 text-[14px] font-medium text-sekunder">
                  <Ikon size={18} weight="duotone" aria-hidden="true" className="text-kemasan" />
                  {nama}
                </dt>
                <dd className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="angka text-[22px] font-bold tracking-tight">{nilaiFaktor[kunci]}</span>
                  <span className="angka text-[13px] text-sekunder">
                    pengali {fk.nilai.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </dd>
                <dd className="mt-2" aria-hidden="true">
                  <div className="h-1.5 overflow-hidden rounded-full bg-kertas-gelap">
                    <div
                      className="h-full rounded-full bg-daun transition-[width] duration-1000 ease-out"
                      style={{ width: terlihat ? `${persen}%` : "0%", transitionDelay: `${200 + i * 120}ms` }}
                    />
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      {skor !== null && data?.current?.weather_desc && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-sekunder">
          <IkonCuaca desc={data.current.weather_desc} size={20} className="text-kemasan" />
          <span>
            Cuaca terdekat: <span className="font-semibold text-tinta">{data.current.weather_desc.toLowerCase()}</span>
            {data.current.temperature != null && <>, {fmtAngka(data.current.temperature)}°C</>}
            {waktuSekarang && <> (prakiraan {waktuSekarang})</>}
          </span>
        </p>
      )}

      <p className="keterangan mt-4 max-w-[78ch]">
        Skor dari rata-rata prakiraan cuaca BMKG
        {hari ? ` untuk ${hari.hari}, ${hari.tanggal}` : " hari ini"}
        {data?.basis?.records ? ` (${data.basis.records} data per 3 jam)` : ""}
        {titik ? `, titik prakiraan ${titik}` : ""}. Skor menilai seberapa mendukung cuaca bagi nyamuk <i>Aedes</i>, bukan jumlah kasus DBD.
      </p>
    </div>
  );
}
