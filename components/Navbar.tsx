"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  rightAction?: React.ReactNode;
}

export default function Navbar({ rightAction }: NavbarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <div className={`fixed top-4 md:top-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[1200px] px-6 md:px-8 py-3 flex justify-between items-center">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
          <img 
            className="h-8 object-contain transition-transform group-hover:scale-105" 
            alt="MosqRisk Logo" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLsUymFGSRK4fo31nmuFgSDSVyEbgPNaS7doKwHIo-j_xlAJ0kBJ_YwSdpX8Q6ADlRkrGrZ9IV98uyVAZP_e_uzNl6lITDagXiLxnl3Z5iM7HvbfwxYOi1aCUymWvZ83R46ZSHiCpwrW9hnwJwAjSiDHDbb0b8N91p3C3q0AZUiD5ktO-U2KJKBZQcbmpGp1og-MxlgYPKniCLyPGdkSUT8kRjRc1-NLMFwB8JKSUgQIb4c6AQ4K27NkRa0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-8 h-8 bg-[#1A3626] rounded-xl items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-md">
            M
          </div>
          <span className="font-extrabold text-[22px] tracking-tight text-[#292271] hidden sm:block">MosqRisk</span>
        </Link>

        {/* Center: Links (Phom Style) */}
        <div className="hidden lg:flex items-center justify-center gap-8 flex-1 px-8">
          <Link href="/" className={`${isActive('/') ? 'text-[#4438CA]' : 'text-slate-600'} hover:text-[#4438CA] font-bold text-[15px] transition-colors`}>
            Beranda
          </Link>
          <Link href="/tentang" className={`${isActive('/tentang') ? 'text-[#4438CA]' : 'text-slate-600'} hover:text-[#4438CA] font-bold text-[15px] transition-colors`}>
            Tentang Produk
          </Link>
          <Link href="/lapor" className={`${isActive('/lapor') ? 'text-[#4438CA]' : 'text-slate-600'} hover:text-[#4438CA] font-bold text-[15px] transition-colors`}>
            Lapor Warga
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {rightAction ? (
            rightAction
          ) : (
            <Link href="/checkout" className="bg-[#3552EB] text-white hover:bg-[#2841C5] font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm text-[15px]">
              Coba Gratis
            </Link>
          )}
        </div>

      </nav>
    </div>
  );
}
