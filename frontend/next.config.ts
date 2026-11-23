import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Satu sumber harga & ongkir: backend/produk.json — file yang sama dipakai backend untuk menghitung
// tagihan. Dibaca saat build supaya harga tetap tampil walau backend sedang tidak bisa
// dihubungi. Kalau file tidak terbaca, halaman jatuh ke GET /api/produk (tanpa angka cadangan).
function bacaProduk() {
  try {
    const p = JSON.parse(readFileSync(path.join(process.cwd(), "..", "backend", "produk.json"), "utf8"));
    return {
      PRODUK_NAMA: String(p.nama ?? ""),
      PRODUK_HARGA_PER_BOTOL: String(p.harga_per_botol ?? ""),
      PRODUK_MAKS_BOTOL: String(p.maks_botol_per_pesanan ?? ""),
      PRODUK_PENGIRIMAN: JSON.stringify(p.pengiriman ?? null),
    };
  } catch (err) {
    console.warn("[next.config] backend/produk.json tidak terbaca; harga hanya dari /api/produk.", err);
    return { PRODUK_NAMA: "", PRODUK_HARGA_PER_BOTOL: "", PRODUK_MAKS_BOTOL: "", PRODUK_PENGIRIMAN: "" };
  }
}

// Satu sumber parameter rumus risiko: backend/rumus_risiko.json (dipakai backend untuk menghitung skor).
// Frontend memakainya untuk simulator & grafik kurva di /edukasi, jadi angkanya selalu sama dengan server.
function bacaRumus() {
  try {
    const r = JSON.parse(readFileSync(path.join(process.cwd(), "..", "backend", "rumus_risiko.json"), "utf8"));
    delete r._catatan;
    return { RUMUS_RISIKO: JSON.stringify(r) };
  } catch (err) {
    console.warn("[next.config] backend/rumus_risiko.json tidak terbaca; simulator rumus di /edukasi disembunyikan.", err);
    return { RUMUS_RISIKO: "" };
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Catatan: opsi `eslint` sudah dihapus di Next.js 16 (lint tidak lagi berjalan saat build).
  // `typescript.ignoreBuildErrors` dimatikan (2026-11-07): `npx tsc --noEmit` = 0 error,
  // jadi build sekarang gagal kalau ada error tipe baru — lebih aman daripada lolos diam-diam.
  env: { ...bacaProduk(), ...bacaRumus() },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  turbopack: {},
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ]
    }
    return []
  },
};

export default withPWA(nextConfig);
