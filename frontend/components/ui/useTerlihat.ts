"use client";

import { useEffect, useRef, useState } from "react";

// true sekali saat elemen masuk layar (lalu berhenti mengamati). Dipakai untuk gerak "terisi sekali":
// skor risiko, statistik, garis rantai nilam. Browser tanpa IntersectionObserver langsung dianggap terlihat.
export function useTerlihat<T extends Element>(ambang = 0.3) {
  const ref = useRef<T>(null);
  const [terlihat, setTerlihat] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || terlihat) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setTerlihat(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTerlihat(true);
          io.disconnect();
        }
      },
      { threshold: ambang, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [terlihat, ambang]);

  return [ref, terlihat] as const;
}

export function gerakDikurangi() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
