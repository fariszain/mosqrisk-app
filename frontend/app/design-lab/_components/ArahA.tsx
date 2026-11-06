import Image from "next/image";
import Link from "next/link";

// Arah A — Label Apotek Botani (prototipe Fase 2).
// Token hasil sampling logo & kemasan — lihat docs/expo/design-lab.md §2.
const T = {
  kemasan: "#154127",
  tinta: "#0B321E",
  foil: "#E4AE3C",
  kertas: "#F1F4EC",
  sekunder: "#4A5A4F",
  pucat: "#C9D6C4",
};

function GarisFoil({ warna = T.foil }: { warna?: string }) {
  return (
    <div aria-hidden="true">
      <div className="h-px lab-foil" style={{ background: warna }} />
      <div className="h-px mt-[3px] lab-foil" style={{ background: warna }} />
    </div>
  );
}

type Baris = [string, React.ReactNode];

// Signature arah A: kartu label dengan foil ganda seperti kotak kemasan.
// "isi" = bidang hijau (sudah/fakta), "garis" = hanya bingkai (belum/direncanakan).
function KartuLabel({ judul, baris, varian = "isi", lebar = false, className = "" }: { judul: string; baris: Baris[]; varian?: "isi" | "garis"; lebar?: boolean; className?: string }) {
  const isi = varian === "isi";
  // "lebar" = label rak di bawah display produk: fakta disusun 4 kolom di desktop.
  if (lebar) {
    return (
      <div className={`rounded-[2px] p-6 md:px-8 md:py-6 text-white ${className}`} style={{ background: T.kemasan }}>
        <GarisFoil />
        <div className="md:flex md:items-baseline md:gap-10 mt-4">
          <p className="lab-caslon text-[24px] leading-tight shrink-0">{judul}</p>
          <dl className="mt-3 md:mt-0 grid grid-cols-1 md:grid-cols-4 md:gap-8 text-[15px] leading-relaxed flex-1">
            {baris.map(([k, v]) => (
              <div key={k} className="py-2.5 md:py-0 border-t border-white/15 first:border-t-0 md:border-t-0 grid grid-cols-[7rem_1fr] md:block gap-4">
                <dt style={{ color: T.pucat }}>{k}</dt>
                <dd className="md:mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-4"><GarisFoil /></div>
      </div>
    );
  }
  return (
    <div
      className={`rounded-[2px] p-6 md:p-7 ${className}`}
      style={isi ? { background: T.kemasan, color: "#FFFFFF" } : { background: "#FFFFFF", color: T.tinta, outline: `1px solid ${T.kemasan}` }}
    >
      <GarisFoil />
      <p className="lab-caslon text-[24px] md:text-[26px] leading-tight mt-5">{judul}</p>
      <dl className="mt-4 text-[15px] leading-relaxed">
        {baris.map(([k, v]) => (
          <div key={k} className={`grid grid-cols-[7rem_1fr] sm:grid-cols-[8rem_1fr] gap-4 py-2.5 border-t first:border-t-0 ${isi ? "border-white/15" : "border-[#0B321E]/15"}`}>
            <dt style={{ color: isi ? T.pucat : T.sekunder }}>{k}</dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4"><GarisFoil /></div>
    </div>
  );
}

export default function ArahA() {
  return (
    <div className="lab-jakarta" style={{ color: T.tinta }}>
      {/* Header */}
      <header style={{ background: T.kertas }} className="border-b border-[#0B321E]/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-20 flex items-center justify-between gap-6">
          <Link href="/" aria-label="Patchmos, ke Beranda" className="shrink-0">
            <Image src="/brand/patchmos-logo.png" alt="Patchmos" width={1837} height={1237} priority className="h-12 w-auto" />
          </Link>
          <nav aria-label="Navigasi utama" className="hidden md:flex gap-8 text-[15px] font-medium">
            <Link href="/pantau" className="hover:underline underline-offset-4">Pantau risiko</Link>
            <Link href="/lapor" className="hover:underline underline-offset-4">Lapor warga</Link>
            <Link href="/edukasi" className="hover:underline underline-offset-4">Edukasi</Link>
          </nav>
          <Link href="/checkout" className="inline-flex items-center min-h-[44px] px-5 rounded-[2px] font-semibold text-white" style={{ background: T.kemasan }}>
            Beli
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: T.kertas }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-16 md:pt-12 md:pb-16 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6">
            <h1 className="lab-caslon text-[40px] leading-[1.1] md:text-[58px] md:leading-[1.06]">
              Penolak nyamuk dari ampas penyulingan nilam Aceh.
            </h1>
            <p className="mt-6 text-lg leading-relaxed max-w-[38ch]" style={{ color: T.sekunder }}>
              Bahan aktif alami, tanpa DEET. Kode QR di kemasan membuka MosqRisk, pemantau risiko nyamuk dari prakiraan cuaca BMKG.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href="/checkout" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[2px] font-semibold text-white" style={{ background: T.kemasan }}>
                Beli Patchmos
              </Link>
              <Link href="/pantau" className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-[6px] decoration-2" style={{ textDecorationColor: T.foil }}>
                Cek risiko di wilayahmu
              </Link>
            </div>
          </div>

          <div className="md:col-span-6">
            <Image
              src="/brand/patchmos-produk.png"
              alt="Botol dan kotak Patchmos Spray di atas podium hijau"
              width={1471}
              height={1236}
              priority
              sizes="(min-width: 768px) 46vw, 100vw"
              className="w-full h-auto"
            />
          </div>

          {/* Label rak di bawah display produk — tidak menutupi label pada botol/kotak */}
          <KartuLabel
            judul="Patchmos Spray"
            lebar
            className="md:col-span-12 md:-mt-6"
            baris={[
              ["Bahan aktif", "Ekstrak ampas nilam, limbah penyulingan"],
              ["Proses", "Maserasi, lalu mikroenkapsulasi gelatin + gum arab"],
              ["Tanpa", "DEET"],
              ["Uji", "Persepsi 10 responden, bukan uji klinis. Uji lab direncanakan."],
            ]}
          />
        </div>
      </section>

      {/* Section: Bukti */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-24">
          <h2 className="lab-caslon text-[32px] md:text-[42px] leading-tight max-w-[20ch]">Bukti yang sudah ada, dan yang belum.</h2>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed" style={{ color: T.sekunder }}>
            Uji persepsi pengguna dan uji laboratorium kami pisahkan, supaya jelas mana yang sudah dilakukan dan mana yang masih direncanakan.
          </p>
          <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
            <KartuLabel
              judul="Sudah dilakukan: uji persepsi"
              baris={[
                ["Peserta", "10 responden, usia 20–58 tahun"],
                ["Durasi", "5 hari memakai sampel"],
                ["Kelayakan", "92,8%"],
                ["Kepraktisan", "94,5%"],
                ["Keefektifan", "92,5% menurut responden"],
                ["Iritasi kulit", "Tidak ada laporan selama uji coba"],
                ["Catatan", "Uji persepsi pengguna, bukan uji klinis"],
              ]}
            />
            <KartuLabel
              judul="Direncanakan: uji laboratorium"
              varian="garis"
              baris={[
                ["Efikasi", "Adaptasi cage test WHO; target Complete Protection Time terukur"],
                ["Kulit", "Patch test pada panelis, pengamatan 30 menit–96 jam"],
                ["Status", "Belum dilakukan per 6 November 2026"],
              ]}
            />
          </div>
          <p className="mt-6 text-sm" style={{ color: T.sekunder }}>
            Sumber: Proposal UTU Awards 2026 (uji persepsi) dan Proposal PIKU USK 2026 (rencana uji).
          </p>
        </div>
      </section>
    </div>
  );
}
