import type { Metadata } from "next";
import { Archivo, Libre_Caslon_Text } from "next/font/google";
import "./lab.css";

// Route SEMENTARA untuk Fase 2 (pilihan arah desain, checkpoint C5).
// Hapus seluruh folder app/design-lab setelah Beranda Fase 3 selesai.
export const metadata: Metadata = {
  title: "Design Lab — MosqRisk (prototipe)",
  robots: { index: false, follow: false },
};

const caslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-caslon",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export default function DesignLabLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${caslon.variable} ${archivo.variable} flex-grow flex flex-col`}>{children}</div>;
}
