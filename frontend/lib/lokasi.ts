"use client";

import { useMemo, useSyncExternalStore } from "react";
import { LOKASI_BAWAAN, PERISTIWA_LOKASI, type LokasiTersimpan } from "@/lib/risiko";

// Lokasi terakhir yang dipilih di /pantau (localStorage), dibaca lewat useSyncExternalStore:
// server & hidrasi memakai lokasi bawaan, lalu React langsung menyelaraskan dengan isi browser.
// Ikut berubah saat lokasi disimpan di tab ini (peristiwa PERISTIWA_LOKASI) atau tab lain (storage).
const KUNCI = "mosqrisk:lokasi";

function langganan(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(PERISTIWA_LOKASI, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(PERISTIWA_LOKASI, cb);
  };
}

function baca() {
  try {
    return localStorage.getItem(KUNCI);
  } catch {
    return null;
  }
}

export function useLokasiTersimpan(): { lokasi: LokasiTersimpan; bawaan: boolean } {
  const mentah = useSyncExternalStore(langganan, baca, () => null);
  return useMemo(() => {
    try {
      const l = JSON.parse(mentah || "null");
      if (l && typeof l.regId === "string" && typeof l.nama === "string") return { lokasi: l as LokasiTersimpan, bawaan: false };
    } catch {
      // isi rusak → lokasi bawaan
    }
    return { lokasi: LOKASI_BAWAAN, bawaan: true };
  }, [mentah]);
}
