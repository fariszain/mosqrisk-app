"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  rightAction?: React.ReactNode;
}

export default function Navbar({ rightAction }: NavbarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className={`fixed top-4 md:top-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[1200px] px-6 md:px-8 py-3 flex justify-between items-center">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            <img 
              className="h-8 object-contain transition-transform group-hover:scale-105" 
              alt="MosqRisk Logo" 
              src="/logonavbar.png"
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
            {rightAction ? (
              rightAction
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/checkout" className="flex bg-[#1A3626] text-white hover:bg-green-900 font-bold px-4 md:px-6 py-2.5 rounded-full transition-colors shadow-sm text-[13px] md:text-[15px] items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] md:text-[18px] text-[#EAC775]">shopping_cart</span>
                  <span className="hidden sm:block">Beli Patchmos</span>
                  <span className="block sm:hidden">Beli</span>
                </Link>
              </div>
            )}
          </div>

        </nav>
      </div>
      
      
    </>
  );
}
