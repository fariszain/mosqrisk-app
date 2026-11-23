"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenIcon, HouseIcon, MapPinIcon, MegaphoneIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";

// Navigasi bawah untuk layar < 768 px. Disembunyikan di alur yang butuh fokus (checkout, admin).
// Item aktif: ikon terisi (duotone) di atas kapsul hijau pucat.
const MENU = [
  { href: "/", label: "Beranda", Ikon: HouseIcon },
  { href: "/pantau", label: "Pantau", Ikon: MapPinIcon },
  { href: "/lapor", label: "Lapor", Ikon: MegaphoneIcon },
  { href: "/edukasi", label: "Edukasi", Ikon: BookOpenIcon },
  { href: "/tim", label: "Tim", Ikon: UsersThreeIcon },
];

const DISEMBUNYIKAN = ["/checkout", "/admin"];

export default function BottomNav() {
  const pathname = usePathname();
  if (DISEMBUNYIKAN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-garis/80 bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {MENU.map(({ href, label, Ikon }) => {
          const aktif = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11.5px] transition-colors ${
                  aktif ? "font-bold text-kemasan" : "font-medium text-sekunder"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-300 ${aktif ? "bg-kertas-gelap" : ""}`}
                >
                  <Ikon size={22} weight={aktif ? "duotone" : "regular"} aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
