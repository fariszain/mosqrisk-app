"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", path: "/", icon: "home" },
    { name: "Pantau", path: "/pantau", icon: "radar" },
    { name: "Lapor", path: "/lapor", icon: "add_location" },
    { name: "Edukasi", path: "/edukasi", icon: "menu_book" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? "text-[#1A3626]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? "font-bold" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
