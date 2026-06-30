"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";


interface NavbarProps {
  rightAction?: React.ReactNode;
}

export default function Navbar({ rightAction }: NavbarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && localStorage.getItem('isPremium') === 'true') {
      setIsPremium(true);
    }
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
          <span className="font-extrabold text-[22px] tracking-tight text-[#1A3626] hidden sm:block">MosqRisk</span>
        </Link>

        {/* Center: Links (Phom Style) */}
        <div className="hidden lg:flex items-center justify-center gap-8 flex-1 px-8">
          <Link href="/" className={`${isActive('/') ? 'text-[#1A3626]' : 'text-gray-500'} hover:text-[#1A3626] font-bold text-[15px] transition-colors`}>
            Beranda
          </Link>
          <Link href="/pantau" className={`${isActive('/pantau') ? 'text-[#1A3626]' : 'text-gray-500'} hover:text-[#1A3626] font-bold text-[15px] transition-colors`}>
            Peta Pantauan
          </Link>
          <Link href="/lapor" className={`${isActive('/lapor') ? 'text-[#1A3626]' : 'text-gray-500'} hover:text-[#1A3626] font-bold text-[15px] transition-colors`}>
            Lapor Warga
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Hamburger button - mobile only */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#1A3626] text-[#EAC775] hover:bg-green-900 transition-colors shadow-sm text-xl font-bold"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
          {rightAction ? (
            rightAction
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/checkout" className="flex bg-[#1A3626] text-white hover:bg-green-900 font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm text-[15px] items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#EAC775]">shopping_cart</span>
                Beli Patchmos
              </Link>
            </div>
          )}
        </div>

      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="lg:hidden pointer-events-auto absolute top-full left-0 w-full px-4 mt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 py-4 px-6 flex flex-col gap-3 max-w-[1200px] mx-auto">
            <Link href="/" onClick={() => setMobileOpen(false)} className={`${isActive('/') ? 'text-[#1A3626] bg-[#EAC775]/20' : 'text-gray-500'} hover:text-[#1A3626] hover:bg-[#EAC775]/10 font-bold text-[15px] transition-colors py-2.5 px-4 rounded-xl`}>
              Beranda
            </Link>
            <Link href="/pantau" onClick={() => setMobileOpen(false)} className={`${isActive('/pantau') ? 'text-[#1A3626] bg-[#EAC775]/20' : 'text-gray-500'} hover:text-[#1A3626] hover:bg-[#EAC775]/10 font-bold text-[15px] transition-colors py-2.5 px-4 rounded-xl`}>
              Peta Pantauan
            </Link>
            <Link href="/lapor" onClick={() => setMobileOpen(false)} className={`${isActive('/lapor') ? 'text-[#1A3626] bg-[#EAC775]/20' : 'text-gray-500'} hover:text-[#1A3626] hover:bg-[#EAC775]/10 font-bold text-[15px] transition-colors py-2.5 px-4 rounded-xl`}>
              Lapor Warga
            </Link>
          </div>
        </div>
      )}
      
      {/* Pop-up Claim Modal */}    </div>
  );
}
