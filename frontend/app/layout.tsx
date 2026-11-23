import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

// Satu keluarga huruf untuk seluruh situs: Geist (font variabel 100–900, Vercel/Basement Studio) —
// font judul & menu web lama yang dipilih user (2026-11-09, menggantikan Plus Jakarta Sans).
// Kontras judul–teks dibangun dari ukuran & berat, bukan dari huruf kedua. Geist tidak punya italic
// asli; nama ilmiah (Aedes) memakai miring sintetis browser.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MosqRisk & Patchmos — risiko nyamuk DBD dan spray dari ampas nilam",
    template: "%s — MosqRisk",
  },
  description:
    "Pantau risiko nyamuk DBD di wilayahmu dari prakiraan cuaca BMKG, dan kenali Patchmos, spray bio-repellent dengan bahan aktif dari ampas nilam Aceh.",
  applicationName: "MosqRisk",
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/patchmos-logo-mark.png",
    apple: "/ikon/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MosqRisk" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#154127",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-kontrol focus:bg-kemasan focus:px-4 focus:py-3 focus:text-white"
        >
          Langsung ke konten
        </a>
        {children}
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              borderRadius: "12px",
              background: "#0C2617",
              color: "#FFFFFF",
              fontSize: "15px",
              boxShadow: "0 18px 40px -20px rgb(12 38 23 / 0.6)",
            },
          }}
        />
      </body>
    </html>
  );
}
