"use client";

import { useEffect, useRef, useState } from "react";
import { gerakDikurangi } from "./useTerlihat";

// Angka yang menghitung naik sekali saat masuk layar. HTML awal (server) sudah berisi nilai akhir,
// jadi tanpa JavaScript / pembaca layar tetap mendapat angka yang benar. Angka yang sudah terlihat
// saat halaman dibuka tidak dianimasikan (tidak ada kedipan dari nilai akhir ke 0).
type Props = { nilai: number; desimal?: number; durasi?: number; className?: string };

const fmt = (n: number, d: number) => n.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function AngkaNaik({ nilai, desimal = 0, durasi = 1500, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tampil, setTampil] = useState(nilai);

  useEffect(() => {
    const el = ref.current;
    if (!el || gerakDikurangi() || typeof IntersectionObserver === "undefined") return;
    const kotak = el.getBoundingClientRect();
    if (kotak.top < window.innerHeight && kotak.bottom > 0) return; // sudah terlihat → biarkan nilai akhir
    setTampil(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const mulai = performance.now();
        const langkah = (t: number) => {
          const p = Math.min(1, (t - mulai) / durasi);
          const halus = 1 - Math.pow(1 - p, 4);
          setTampil(nilai * halus);
          if (p < 1) raf = requestAnimationFrame(langkah);
        };
        raf = requestAnimationFrame(langkah);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [nilai, durasi]);

  return (
    <span ref={ref} className={`angka ${className}`}>
      <span aria-hidden="true">{fmt(tampil, desimal)}</span>
      <span className="sr-only">{fmt(nilai, desimal)}</span>
    </span>
  );
}
