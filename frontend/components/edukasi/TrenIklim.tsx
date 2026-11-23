"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowsClockwiseIcon, CrosshairIcon } from "@phosphor-icons/react/ssr";
import { kelasTombol } from "@/components/ui/tombol";
import { fmtAngka } from "@/lib/risiko";

// Tren skor risiko 12 bulan dari data cuaca historis Open-Meteo (formula MosqRisk versi bulanan).
// Tidak meminta GPS saat halaman dibuka: bawaan Banda Aceh, atau koordinat yang pernah dipilih.
type Bulan = { name: string; hujan: number; suhu: number; kelembapan?: number; angin?: number; risiko: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const BAWAAN = { lat: 5.55, lon: 95.32, nama: "Kota Banda Aceh (lokasi bawaan)" };
// Nilai token warna (globals.css) — atribut SVG recharts tidak membaca var() dengan andal.
const WARNA = { kemasan: "#154127", sekunder: "#4A5A4F", garis: "#D3DDD2", rendah: "#DCE8DE", sedang: "#FFF3E0", tinggi: "#F1D5D2" };

function bacaKoordinat() {
  try {
    const lat = parseFloat(localStorage.getItem("edukasi_lat") || "");
    const lon = parseFloat(localStorage.getItem("edukasi_lon") || "");
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, nama: "sekitar lokasimu" } : null;
  } catch {
    return null;
  }
}

export default function TrenIklim() {
  const [lokasi, setLokasi] = useState(BAWAAN);
  const [data, setData] = useState<Bulan[]>([]);
  const [periode, setPeriode] = useState("");
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [pesanGps, setPesanGps] = useState("");

  const permintaan = useRef(0);

  const muat = useCallback(async (l: { lat: number; lon: number; nama: string }) => {
    const id = ++permintaan.current;
    setLokasi(l);
    setStatus("memuat");
    try {
      const lat = Math.round(l.lat * 100) / 100;
      const lon = Math.round(l.lon * 100) / 100;
      const res = await fetch(`${API_URL}/api/climate-trend?lat=${lat}&lon=${lon}`);
      const hasil = await res.json();
      if (id !== permintaan.current) return;
      if (!res.ok || !hasil.success || !Array.isArray(hasil.data)) throw new Error("tren");
      setData(hasil.data);
      setPeriode(hasil.period || "");
      setStatus("siap");
    } catch {
      if (id !== permintaan.current) return;
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat(bacaKoordinat() ?? BAWAAN);
  }, [muat]);

  const pakaiLokasiku = () => {
    setPesanGps("");
    if (!("geolocation" in navigator)) {
      setPesanGps("Browser ini tidak bisa membaca lokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const l = { lat: p.coords.latitude, lon: p.coords.longitude, nama: "sekitar lokasimu" };
        try {
          localStorage.setItem("edukasi_lat", String(Math.round(l.lat * 100) / 100));
          localStorage.setItem("edukasi_lon", String(Math.round(l.lon * 100) / 100));
        } catch {
          // abaikan
        }
        void muat(l);
      },
      () => setPesanGps("Izin lokasi ditolak. Grafik tetap memakai lokasi sebelumnya."),
      { timeout: 15000, maximumAge: 600000 }
    );
  };

  const puncak = data.length ? data.reduce((a, b) => (b.risiko > a.risiko ? b : a), data[0]) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-[14px] text-sekunder">Lokasi</p>
          <p className="text-[18px] font-bold tracking-tight">{lokasi.nama}</p>
        </div>
        <button type="button" onClick={pakaiLokasiku} className={kelasTombol("garis", "sm", "bg-white")}>
          <CrosshairIcon size={18} aria-hidden="true" />
          Pakai lokasiku
        </button>
      </div>
      {pesanGps && <p className="mt-2 text-[14px] text-galat">{pesanGps}</p>}

      <div className="mt-6 h-[300px] w-full md:h-[360px]">
        {status === "siap" && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <ReferenceArea y1={0} y2={50} fill={WARNA.rendah} fillOpacity={0.55} ifOverflow="hidden" />
              <ReferenceArea y1={50} y2={75} fill={WARNA.sedang} fillOpacity={0.55} ifOverflow="hidden" />
              <ReferenceArea y1={75} y2={100} fill={WARNA.tinggi} fillOpacity={0.55} ifOverflow="hidden" />
              <CartesianGrid stroke={WARNA.garis} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: WARNA.garis }} tick={{ fill: WARNA.sekunder, fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} ticks={[0, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fill: WARNA.sekunder, fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: WARNA.sekunder, strokeDasharray: "3 3" }}
                contentStyle={{ borderRadius: 12, border: `1px solid ${WARNA.garis}`, fontSize: 13, boxShadow: "0 12px 30px -16px rgb(12 38 23 / 0.35)" }}
                formatter={(v) => [`${v} dari 100`, "Skor risiko"]}
                labelFormatter={(label, isi) => {
                  const b = isi?.[0]?.payload as Bulan | undefined;
                  return b ? `${label}: hujan ${fmtAngka(b.hujan)} mm, suhu ${fmtAngka(b.suhu)}°C` : String(label);
                }}
              />
              <Line type="monotone" dataKey="risiko" stroke={WARNA.kemasan} strokeWidth={2.5} dot={{ r: 3, fill: WARNA.kemasan }} activeDot={{ r: 5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-kontrol bg-kertas p-6 text-center">
            {status === "gagal" ? (
              <div>
                <p className="text-[15px] text-galat">Data cuaca historis belum bisa dimuat.</p>
                <button type="button" onClick={() => void muat(lokasi)} className={kelasTombol("garis", "sm", "mt-3 bg-white")}>
                  <ArrowsClockwiseIcon size={18} aria-hidden="true" />
                  Coba lagi
                </button>
              </div>
            ) : (
              <p className="text-[15px] text-sekunder">Memuat data cuaca 12 bulan terakhir…</p>
            )}
          </div>
        )}
      </div>

      {status === "siap" && puncak && (
        <p className="mt-4 text-[16px] leading-relaxed">
          Skor tertinggi: <strong>{puncak.name}</strong>, {puncak.risiko} dari 100 (hujan {fmtAngka(puncak.hujan)} mm sebulan, suhu rata-rata{" "}
          {fmtAngka(puncak.suhu)}°C).
        </p>
      )}

      {status === "siap" && data.length > 0 && (
        <details className="mt-5 rounded-kontrol border border-garis bg-white">
          <summary className="cursor-pointer px-4 py-3 text-[15px] font-semibold">Lihat data per bulan</summary>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[440px] text-left text-[14px] angka">
              <thead>
                <tr className="border-b border-garis text-sekunder">
                  <th scope="col" className="py-2 pr-3 font-medium">Bulan</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Skor</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Hujan (mm)</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Suhu (°C)</th>
                  <th scope="col" className="py-2 font-medium">Kelembapan (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((b) => (
                  <tr key={b.name} className="border-b border-garis last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium">{b.name}</th>
                    <td className="py-2 pr-3">{b.risiko}</td>
                    <td className="py-2 pr-3">{fmtAngka(b.hujan)}</td>
                    <td className="py-2 pr-3">{fmtAngka(b.suhu)}</td>
                    <td className="py-2">{b.kelembapan !== undefined ? fmtAngka(b.kelembapan) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <p className="keterangan mt-4 max-w-[78ch]">
        Data cuaca historis: Open-Meteo{periode ? `, ${periode}` : ""}. Skor bulanan memakai rumus MosqRisk yang sama (suhu, kelembapan,
        dan total hujan sebulan). Ini perkiraan kesesuaian cuaca bagi nyamuk, bukan data kasus DBD.
      </p>
    </div>
  );
}
