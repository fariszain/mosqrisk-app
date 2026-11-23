"use client";

import { useSyncExternalStore } from "react";

// Status Premium disimpan di browser (localStorage "isPremium") — tidak terikat akun dan tanpa
// masa berlaku (05_FAKTA §5). Kunci lama dipertahankan agar pengguna yang sudah klaim tetap Premium.
const KUNCI = "isPremium";
const PERISTIWA = "mosqrisk:premium";
// Cadangan kalau localStorage gagal ditulis tepat setelah klaim: Premium tetap aktif sampai halaman ditutup.
let premiumSesi = false;

function baca() {
  if (premiumSesi) return true;
  try {
    return localStorage.getItem(KUNCI) === "true";
  } catch {
    return false;
  }
}

function langganan(cb: () => void) {
  window.addEventListener(PERISTIWA, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PERISTIWA, cb);
    window.removeEventListener("storage", cb);
  };
}

// Dicek SEBELUM kode sekali pakai dikirim ke server, supaya kode tidak hangus di browser yang
// memblokir penyimpanan data situs (status Premium tidak akan bisa disimpan di sana).
export function bisaMenyimpan() {
  try {
    const k = "__mosqrisk_uji";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function aktifkanPremium() {
  premiumSesi = true;
  try {
    localStorage.setItem(KUNCI, "true");
  } catch {
    // penyimpanan penuh/diblokir setelah dicek — status tetap berlaku sampai halaman ditutup (premiumSesi)
  }
  window.dispatchEvent(new Event(PERISTIWA));
}

// false saat render server; nilai asli setelah hidrasi.
export function usePremium() {
  return useSyncExternalStore(langganan, baca, () => false);
}
