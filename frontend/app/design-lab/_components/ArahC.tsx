import Image from "next/image";
import Link from "next/link";

// Arah C — Rantai Nilam Aceh (prototipe Fase 2).
// Token hasil sampling logo & kemasan — lihat docs/expo/design-lab.md §2.
// Pengecualian: "ampas" (#7A5B3A) diambil dari warna material ampas kering, hanya untuk tahap ampas.
const T = {
  tinta: "#0B321E",
  daun: "#516B32",
  ampas: "#7A5B3A",
  emas: "#E4AE3C",
  sekunder: "#4A5A4F",
  kertas: "#F4F6F1",
};

// Kurva tangkai (Catmull-Rom → Bézier) melewati pusat 6 simpul; viewBox 1200×120.
const JALUR_TANGKAI =
  "M 0 104 C 16.7 102.0, 50.0 97.7, 100 92 C 150.0 86.3, 233.3 72.3, 300 70 C 366.7 67.7, 433.3 81.3, 500 78 C 566.7 74.7, 633.3 54.0, 700 50 C 766.7 46.0, 833.3 58.0, 900 54 C 966.7 50.0, 1050.0 32.7, 1100 26 C 1150.0 19.3, 1183.3 16.0, 1200 14";
const SIMPUL_Y = [92, 70, 78, 50, 54, 26];

const rantai = [
  { no: 1, judul: "Petani nilam", isi: "Indonesia memasok sekitar 95% minyak nilam dunia; Aceh salah satu sentranya.", sumber: "Pusdatin Pertanian, 2024" },
  { no: 2, judul: "Penyulingan", isi: "Hanya sekitar 1,5–3% bahan yang menjadi minyak atsiri.", sumber: "Indriani dkk., 2025" },
  { no: 3, judul: "Ampas", isi: "Lebih dari 95% sisanya limbah padat yang umumnya belum dimanfaatkan.", sumber: "Indriani dkk., 2025", ampas: true },
  { no: 4, judul: "Patchmos", isi: "Ekstrak ampas dimikroenkapsulasi menjadi spray tanpa DEET.", produk: true },
  { no: 5, judul: "Pengguna", isi: "Kode QR di kemasan membuka fitur premium MosqRisk." },
  { no: 6, judul: "Data MosqRisk", isi: "Skor risiko nyamuk per kabupaten/kota dari prakiraan cuaca BMKG." },
];

function Nomor({ no, ampas }: { no: number; ampas?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[15px] font-bold tabular-nums text-white"
      style={{ background: ampas ? T.ampas : T.daun }}
    >
      {no}
    </span>
  );
}

export default function ArahC() {
  return (
    <div className="lab-jakarta bg-white" style={{ color: T.tinta }}>
      {/* Header */}
      <header className="bg-white border-b border-[#0B321E]/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-20 flex items-center justify-between gap-6">
          <Link href="/" aria-label="Patchmos, ke Beranda" className="shrink-0">
            <Image src="/brand/patchmos-logo.png" alt="Patchmos" width={1837} height={1237} priority className="h-12 w-auto" />
          </Link>
          <nav aria-label="Navigasi utama" className="hidden md:flex gap-8 text-[15px] font-medium">
            <Link href="/pantau" className="hover:underline underline-offset-4">Pantau risiko</Link>
            <Link href="/lapor" className="hover:underline underline-offset-4">Lapor warga</Link>
            <Link href="/edukasi" className="hover:underline underline-offset-4">Edukasi</Link>
          </nav>
          <Link href="/checkout" className="inline-flex items-center min-h-[44px] px-5 rounded-full font-semibold text-white" style={{ background: T.tinta }}>
            Beli
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className="mx-auto max-w-6xl px-4 md:px-8 pt-10 md:pt-14 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-[38px] leading-[1.08] md:text-[60px] md:leading-[1.04] font-extrabold tracking-[-0.02em] max-w-[16ch]">
              Dari limbah penyulingan nilam Aceh, menjadi Patchmos.
            </h1>
            <p className="mt-6 text-lg leading-relaxed max-w-[52ch]" style={{ color: T.sekunder }}>
              Patchmos memakai ampas pascasuling sebagai sumber bahan aktif spray bio-repellent tanpa DEET, lalu menghubungkan
              pemakainya dengan data risiko nyamuk MosqRisk.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href="/checkout" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full font-semibold text-white" style={{ background: T.tinta }}>
                Beli Patchmos
              </Link>
              <Link href="/pantau" className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-[6px] decoration-2" style={{ textDecorationColor: T.daun }}>
                Cek risiko di wilayahmu
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Image src="/brand/patchmos-produk.png" alt="Botol dan kotak Patchmos Spray" width={1471} height={1236} priority sizes="(min-width: 1024px) 38vw, 100vw" className="w-full h-auto" />
          </div>
        </div>

        {/* Signature: rantai yang dijahit garis tangkai — desktop */}
        <div className="hidden lg:block mx-auto max-w-6xl px-8 pt-14 pb-20">
          <div className="relative h-[120px]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
              <path d={JALUR_TANGKAI} pathLength={1} fill="none" stroke={T.daun} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="lab-stem" />
            </svg>
            {rantai.map((s, i) => (
              <div key={s.no} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${((i * 2 + 1) / 12) * 100}%`, top: SIMPUL_Y[i] }}>
                <Nomor no={s.no} ampas={s.ampas} />
              </div>
            ))}
          </div>
          <ol className="grid grid-cols-6 gap-6 mt-6">
            {rantai.map((s) => (
              <li key={s.no} className={s.produk ? "rounded-[24px] px-4 py-3 -mx-4 -my-3" : ""} style={s.produk ? { background: T.kertas, outline: `2px solid ${T.emas}` } : undefined}>
                <p className="font-bold text-[17px]" style={{ color: s.ampas ? T.ampas : T.tinta }}>{s.judul}</p>
                <p className="text-[14px] leading-relaxed mt-1" style={{ color: T.sekunder }}>{s.isi}</p>
                {s.sumber && <p className="text-[12px] mt-2" style={{ color: T.sekunder }}>{s.sumber}</p>}
              </li>
            ))}
          </ol>
        </div>

        {/* Rantai — mobile & tablet: vertikal */}
        <ol className="lg:hidden mx-auto max-w-xl px-4 pt-12 pb-16">
          {rantai.map((s, i) => (
            <li key={s.no} className="relative pl-14 pb-8">
              {i < rantai.length - 1 && (
                <span aria-hidden="true" className="absolute left-[17px] top-9 bottom-0 w-[3px] rounded-full" style={{ background: T.daun }} />
              )}
              <span className="absolute left-0 top-0"><Nomor no={s.no} ampas={s.ampas} /></span>
              <div className={s.produk ? "rounded-[24px] px-4 py-3 -mx-1" : ""} style={s.produk ? { background: T.kertas, outline: `2px solid ${T.emas}` } : undefined}>
                <p className="font-bold text-[18px] pt-1" style={{ color: s.ampas ? T.ampas : T.tinta }}>{s.judul}</p>
                <p className="text-[16px] leading-relaxed mt-1" style={{ color: T.sekunder }}>{s.isi}</p>
                {s.sumber && <p className="text-[13px] mt-1.5" style={{ color: T.sekunder }}>{s.sumber}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Section: Bukti — garis utuh = sudah, garis putus-putus = direncanakan */}
      <section style={{ background: T.kertas }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-24">
          <h2 className="text-[30px] md:text-[42px] font-extrabold tracking-[-0.02em] max-w-[20ch]">Bukti yang sudah ada, dan yang belum.</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-10">
            <div className="pl-6 border-l-[3px]" style={{ borderColor: T.daun }}>
              <p className="font-bold text-[18px]">Sudah dilakukan: uji persepsi pengguna</p>
              <p className="text-[15px] mt-1" style={{ color: T.sekunder }}>10 responden, usia 20–58 tahun, memakai sampel selama 5 hari. Bukan uji klinis.</p>
              <dl className="mt-6 grid grid-cols-3 gap-4">
                {[
                  ["92,8%", "Kelayakan"],
                  ["94,5%", "Kepraktisan"],
                  ["92,5%", "Keefektifan menurut responden"],
                ].map(([v, k]) => (
                  <div key={k} className="flex flex-col-reverse justify-end">
                    <dt className="text-[13px] mt-2 leading-snug" style={{ color: T.sekunder }}>{k}</dt>
                    <dd className="text-[28px] md:text-[36px] font-extrabold tabular-nums leading-none">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[15px] mt-6" style={{ color: T.sekunder }}>Tidak ada laporan iritasi kulit selama uji coba.</p>
            </div>
            <div className="pl-6 border-l-[3px] border-dashed" style={{ borderColor: T.daun }}>
              <p className="font-bold text-[18px]">Direncanakan: uji laboratorium</p>
              <p className="text-[15px] mt-1" style={{ color: T.sekunder }}>Belum dilakukan per 6 November 2026.</p>
              <ul className="mt-6 flex flex-col gap-4 text-[16px] leading-relaxed">
                <li><strong>Efikasi:</strong> adaptasi cage test WHO, target Complete Protection Time terukur.</li>
                <li><strong>Keamanan kulit:</strong> patch test pada panelis, pengamatan 30 menit–96 jam.</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 text-sm" style={{ color: T.sekunder }}>Sumber: Proposal UTU Awards 2026 (uji persepsi) dan Proposal PIKU USK 2026 (rencana uji).</p>
        </div>
      </section>
    </div>
  );
}
