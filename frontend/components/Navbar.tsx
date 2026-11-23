"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBagIcon } from "@phosphor-icons/react/ssr";
import { kelasTombol } from "@/components/ui/tombol";

// Header global: tanda daun Patchmos (aset asli) + nama, navigasi, tombol Beli.
// Kapsul putih melayang (sticky, ada jarak dari tepi layar); bayangan menebal setelah digulir.
// Di < 768 px navigasi pindah ke BottomNav.
const MENU = [
  { href: "/pantau", label: "Pantau risiko" },
  { href: "/lapor", label: "Lapor warga" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/tim", label: "Tim" },
];

interface NavbarProps {
  rightAction?: React.ReactNode;
}

export default function Navbar({ rightAction }: NavbarProps) {
  const pathname = usePathname();
  const aktif = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [digulir, setDigulir] = useState(false);

  useEffect(() => {
    const cek = () => setDigulir(window.scrollY > 8);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, []);

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={`pointer-events-auto mx-auto flex h-14 max-w-[76rem] items-center justify-between gap-6 rounded-full border pl-4 pr-2 transition-[background-color,box-shadow,border-color] duration-300 md:h-16 md:pl-6 ${
          digulir ? "border-garis/80 bg-white/90 shadow-angkat backdrop-blur-md" : "border-garis bg-white shadow-tipis"
        }`}
      >
        <Link href="/" aria-label="Patchmos, ke Beranda" className="group -my-1 flex shrink-0 items-center gap-2 rounded-kontrol">
          <Image
            src="/brand/patchmos-logo-mark.png"
            alt=""
            width={894}
            height={886}
            priority
            sizes="40px"
            className="h-7 w-7 transition-transform duration-500 group-hover:-rotate-6 md:h-8 md:w-8"
          />
          {/* Tulisan PATCHMOS serif dari logo asli (bagian bawah patchmos-logo.png, baris 992–1237 px).
              Dipotong lewat CSS — file logo tidak diedit. */}
          <span aria-hidden="true" className="relative block aspect-[1837/245] h-[13px] overflow-hidden md:h-[15px]">
            <Image
              src="/brand/patchmos-logo.png"
              alt=""
              width={1837}
              height={1237}
              sizes="320px"
              className="absolute bottom-0 left-0 h-auto w-full max-w-none"
            />
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={aktif(m.href) ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-[15px] font-semibold tracking-[-0.01em] transition-colors ${
                aktif(m.href) ? "bg-kemasan text-white" : "text-tinta/75 hover:bg-kertas hover:text-tinta"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {rightAction}
          {/* Di halaman checkout tombol ini tidak perlu — pengguna sudah di sana */}
          {pathname !== "/checkout" && (
            <Link href="/checkout" className={kelasTombol("utama", "sm", "rounded-full! px-5")}>
              <ShoppingBagIcon size={19} weight="duotone" aria-hidden="true" />
              <span>
                Beli<span className="hidden sm:inline"> Patchmos</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
