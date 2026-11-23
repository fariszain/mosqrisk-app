import type { Metadata } from "next";
import { CalendarDotsIcon, EnvelopeSimpleIcon, QrCodeIcon } from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PanelKlaim from "@/components/PanelKlaim";
import HeroHalaman from "@/components/ui/HeroHalaman";
import { bersihkanKode } from "@/lib/klaim";

export const metadata: Metadata = {
  title: "Aktifkan Premium",
  description: "Masukkan kode dari kemasan Patchmos untuk membuka prakiraan risiko 3 hari dan notifikasi email MosqRisk.",
  robots: { index: false },
};

// QR di kemasan mengarah ke /claim?code=MOSQ-XXXX — kode diisi otomatis, pengguna tetap menekan
// tombol (kode sekali pakai; tidak diklaim diam-diam saat halaman dibuka).
export default async function ClaimPage({ searchParams }: { searchParams: Promise<{ code?: string | string[] }> }) {
  const { code } = await searchParams;
  const kodeAwal = bersihkanKode(Array.isArray(code) ? code[0] : code);

  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        <HeroHalaman
          id="judul-klaim"
          label="Premium MosqRisk"
          Ikon={QrCodeIcon}
          judul={
            <>
              Aktifkan <span className="teks-foil">Premium</span> MosqRisk
            </>
          }
          pengantar={
            <>
              <p>Kode di kemasan Patchmos membuka prakiraan risiko 3 hari dan notifikasi email untuk wilayahmu.</p>
              {kodeAwal && (
                <p className="mt-5 rounded-kontrol bg-white/10 px-4 py-3 text-[15px] leading-relaxed text-white">
                  Kode dari QR sudah terisi. Periksa, lalu tekan <strong>Aktifkan Premium</strong>.
                </p>
              )}
            </>
          }
          aksi={
            <ul className="space-y-3 text-left">
              {[
                { Ikon: CalendarDotsIcon, teks: "Prakiraan risiko untuk hari ini dan dua hari ke depan" },
                { Ikon: EnvelopeSimpleIcon, teks: "Email saat ada laporan warga di wilayah langgananmu" },
              ].map(({ Ikon, teks }) => (
                <li key={teks} className="flex items-center gap-3 text-[15.5px] text-white">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foil/20 text-foil">
                    <Ikon size={20} weight="duotone" aria-hidden="true" />
                  </span>
                  {teks}
                </li>
              ))}
            </ul>
          }
          kanan={
            <div className="rounded-media bg-white p-5 text-tinta shadow-angkat md:p-9">
              <PanelKlaim kodeAwal={kodeAwal} />
            </div>
          }
        />
        <div className="h-10 md:h-16" />
      </main>
      <Footer />
    </>
  );
}
