"use client";

import { useEffect, useId, useRef } from "react";
import { XIcon } from "@phosphor-icons/react/ssr";

// Dialog berbasis <dialog> bawaan browser: fokus terkunci di dalam, Escape menutup,
// latar di belakang otomatis tidak bisa diakses. Isi hanya dirender saat terbuka
// (mis. kamera pemindai QR ikut berhenti saat dialog ditutup).
// Di HP tampil sebagai lembar dari bawah; di layar lebar sebagai kartu di tengah.
type Props = {
  terbuka: boolean;
  onTutup: () => void;
  judul: React.ReactNode;
  children: React.ReactNode;
  lebar?: string;
};

export default function Dialog({ terbuka, onTutup, judul, children, lebar = "md:max-w-md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idJudul = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (terbuka && !d.open) d.showModal();
    if (!terbuka && d.open) d.close();
  }, [terbuka]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idJudul}
      onClose={onTutup}
      onClick={(e) => {
        if (e.target === ref.current) onTutup();
      }}
      className={`m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-kartu bg-white p-0 text-tinta shadow-angkat backdrop:bg-hutan/60 backdrop:backdrop-blur-[2px] open:animate-[masuk_0.32s_cubic-bezier(0.16,0.84,0.3,1)] md:m-auto md:rounded-kartu ${lebar}`}
    >
      {terbuka && (
        <div className="px-5 pb-6 pt-3 md:px-7 md:pb-7 md:pt-6">
          <span aria-hidden="true" className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-garis md:hidden" />
          <div className="flex items-start justify-between gap-4">
            <h2 id={idJudul} className="judul-3">
              {judul}
            </h2>
            <button
              type="button"
              onClick={onTutup}
              aria-label="Tutup"
              className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sekunder transition-colors hover:bg-kertas hover:text-tinta"
            >
              <XIcon size={22} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
