import Image from "next/image";
import Link from "next/link";
import {
  BroomIcon,
  FlaskIcon,
  GaugeIcon,
  LeafIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TagIcon,
} from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuktiUji from "@/components/BuktiUji";
import RantaiNilam from "@/components/RantaiNilam";
import RisikoHariIni from "@/components/RisikoHariIni";
import BagianKlaim from "@/components/beranda/BagianKlaim";
import ChipRisiko from "@/components/beranda/ChipRisiko";
import Akordion from "@/components/ui/Akordion";
import AngkaNaik from "@/components/ui/AngkaNaik";
import { kelasTombol } from "@/components/ui/tombol";
import { FOTO } from "@/lib/foto";
import { PRODUK, rupiah, teksOngkir } from "@/lib/produk";
import { ANGGOTA } from "@/lib/tim";
import { cariWajahTim } from "@/lib/fotoTim";

// Beranda — urutan: produk (hero + risiko live) → masalah → cara kerja → risiko hari ini →
// rantai nilam → produk → bukti → klaim → tanya-jawab & tim.
// Semua angka dari docs/expo/05_FAKTA_TERVERIFIKASI.md.
const tunda = (ms: number) => ({ "--tunda": `${ms}ms` }) as React.CSSProperties;

const LANGKAH = [
  {
    Ikon: GaugeIcon,
    judul: "Cek risiko hari ini",
    isi: "Skor 0–100 untuk kabupaten atau kotamu, dihitung dari prakiraan cuaca BMKG.",
    href: "/pantau",
    tautan: "Pantau risiko",
  },
  {
    Ikon: BroomIcon,
    judul: "Bersihkan sarang nyamuk",
    isi: "Kuras dan tutup penampungan air, daur ulang barang bekas: langkah 3M Plus dari Kementerian Kesehatan.",
    href: "/edukasi#pencegahan",
    tautan: "Pelajari 3M Plus",
  },
  {
    Ikon: ShieldCheckIcon,
    judul: "Lindungi diri dari gigitan",
    isi: "Pakai penolak nyamuk saat beraktivitas, misalnya Patchmos dari ampas nilam Aceh.",
    href: "/checkout",
    tautan: "Beli Patchmos",
  },
];

function inisial(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((k) => k[0])
    .join("");
}
const WARNA_AVATAR = ["bg-kemasan", "bg-daun", "bg-emas-teks", "bg-ampas", "bg-hutan"];

export default function Beranda() {
  const kirim = PRODUK.pengiriman;
  const tanyaJawab = [
    {
      tanya: "Apa arti skor risiko MosqRisk?",
      jawab: (
        <>
          Skor 0–100 menilai seberapa mendukung cuaca hari ini bagi penularan dengue oleh nyamuk <i>Aedes</i>. Suhu dinilai dengan kurva
          angka penularan dari jurnal (paling tinggi sekitar 29 °C), lalu dikalikan pengali kelembapan dan hujan. Skor tinggi bukan berarti ada
          kasus DBD di sekitarmu; itu tanda untuk lebih rajin menjalankan 3M Plus.{" "}
          <Link href="/edukasi#model" className="tautan font-semibold text-kemasan">
            Lihat cara skor dihitung
          </Link>
          .
        </>
      ),
    },
    {
      tanya: "Dari mana datanya?",
      jawab:
        "Dari prakiraan cuaca BMKG per 3 jam untuk titik prakiraan di kabupaten atau kotamu, lewat API publik BMKG. Skor dihitung dari rata-rata prakiraan satu hari.",
    },
    {
      tanya: "Apakah Patchmos sudah teruji?",
      jawab:
        "Uji persepsi pada 10 responden selama 5 hari sudah dilakukan; ini bukan uji klinis. Uji laboratorium untuk efikasi dan keamanan kulit masih direncanakan.",
    },
    {
      tanya: "Bagaimana cara membeli, dan berapa ongkos kirimnya?",
      jawab: (
        <>
          Pesan di halaman Beli, lalu bayar lewat Midtrans. Selama masa uji coba pembayaran memakai mode sandbox, jadi tidak ada uang sungguhan
          yang ditarik.
          {kirim?.antar && (
            <>
              {" "}
              {kirim.antar.label}: {teksOngkir(kirim.antar.ongkir).toLowerCase()}, {kirim.antar.keterangan.charAt(0).toLowerCase()}
              {kirim.antar.keterangan.slice(1)}
            </>
          )}
          {kirim?.ambil && (
            <>
              {" "}
              {kirim.ambil.label}: {teksOngkir(kirim.ambil.ongkir).toLowerCase()}, {kirim.ambil.keterangan.charAt(0).toLowerCase()}
              {kirim.ambil.keterangan.slice(1)}
            </>
          )}
        </>
      ),
    },
    {
      tanya: "Apa yang dibuka kode Premium di kemasan?",
      jawab:
        "Prakiraan risiko 3 hari untuk wilayahmu dan email peringatan saat ada laporan warga di wilayah langgananmu. Kode cukup dimasukkan sekali di perangkatmu, tanpa membuat akun.",
    },
    {
      tanya: "Data apa saja yang disimpan?",
      jawab: (
        <>
          Hanya yang kamu kirim sendiri: laporan warga, email untuk notifikasi, dan data pesanan. Lokasi dari GPS hanya dipakai di perangkatmu untuk
          memilih wilayah.{" "}
          <Link href="/privasi" className="tautan font-semibold text-kemasan">
            Baca kebijakan privasi
          </Link>
          .
        </>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1">
        {/* 1. Hero gabungan (2026-11-09): energi web lama — judul raksasa di tengah dengan frasa emas, produk melayang
            bercahaya, kartu kecil miring — dengan aset asli (render produk, foto daun nilam) dan skor risiko live.
            Tinggi = satu layar (100svh) termasuk area navbar: hero ditarik ke belakang navbar kapsul (-mt = tinggi
            header) dan produk mengisi sisa tinggi (object-contain), jadi seluruh hero terlihat tanpa menggulir. */}
        <section
          aria-labelledby="judul-utama"
          className="permukaan-gelap relative isolate -mt-[68px] flex min-h-[100svh] flex-col bg-hutan pt-[68px] text-white md:-mt-20 md:pt-20"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <Image src={FOTO.nilamDaun.src} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-hutan/70 via-hutan/40 to-hutan" />
            <div className="absolute bottom-[-12%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-foil/25 blur-[120px] md:h-[40rem] md:w-[40rem]" />
          </div>

          <div className="wadah pt-8 text-center md:pt-[clamp(1.5rem,4vh,3.5rem)]">
            <p
              className="masuk mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[14px] font-medium text-pucat backdrop-blur-sm"
              style={tunda(0)}
            >
              <LeafIcon size={18} weight="duotone" aria-hidden="true" className="text-foil" />
              <span className="sm:hidden">Buatan mahasiswa Universitas Syiah Kuala</span>
              <span className="hidden sm:inline">Spray bio-repellent buatan mahasiswa Universitas Syiah Kuala</span>
            </p>
            <h1
              id="judul-utama"
              className="masuk mx-auto mt-5 max-w-[15ch] text-[clamp(2.5rem,1rem+4.6vw+2vh,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em]"
              style={tunda(100)}
            >
              Penolak nyamuk dari <span className="teks-foil">ampas nilam Aceh</span>
            </h1>
            <p className="pengantar masuk mx-auto mt-5 max-w-[52ch]" style={tunda(200)}>
              Tanpa DEET, dari limbah penyulingan nilam. Kode QR di kemasannya membuka MosqRisk: pantauan risiko nyamuk DBD dari prakiraan cuaca BMKG.
            </p>
            <div className="masuk mt-7 flex flex-wrap items-center justify-center gap-3" style={tunda(300)}>
              <Link href="/checkout" className={kelasTombol("foil", "lg", "w-full rounded-full! px-8 sm:w-auto shadow-[0_10px_30px_-8px_rgb(228_174_60/0.6)]")}>
                <ShoppingBagIcon size={22} weight="duotone" aria-hidden="true" />
                Beli Patchmos
              </Link>
              <Link href="/pantau" className={kelasTombol("terang", "lg", "w-full rounded-full! px-8 sm:w-auto")}>
                <GaugeIcon size={22} weight="duotone" aria-hidden="true" />
                Cek risiko di wilayahmu
              </Link>
            </div>
          </div>

          {/* Panggung produk: mengisi sisa tinggi layar. Kartu kecil diletakkan relatif terhadap tengah. */}
          <div className="masuk relative mt-6 min-h-[11rem] flex-1 md:mt-[clamp(1rem,3vh,2rem)] md:min-h-[12rem]" style={tunda(380)}>
            <Image
              src="/brand/patchmos-produk.png"
              alt="Botol dan kotak Patchmos Spray di atas podium hijau, dikelilingi daun"
              fill
              priority
              sizes="(min-width: 768px) 46rem, 100vw"
              className="melayang-pelan object-contain object-bottom drop-shadow-[0_18px_22px_rgb(12_38_23/0.35)]"
            />
            <div className="absolute right-[calc(50%+min(14vw,13rem))] top-[14%] hidden -rotate-[3deg] md:block" >
              <div className="masuk" style={tunda(700)}>
                <ChipRisiko />
              </div>
            </div>
            {PRODUK.harga && (
              <p
                className="masuk absolute left-[calc(50%+min(13vw,12rem))] top-[6%] hidden rotate-[4deg] items-center gap-3 rounded-kartu bg-white px-5 py-4 text-left text-tinta shadow-angkat md:flex"
                style={tunda(640)}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-foil/20 text-emas-teks">
                  <TagIcon size={22} weight="duotone" aria-hidden="true" />
                </span>
                <span>
                  <span className="angka block text-[22px] font-extrabold leading-none tracking-tight">{rupiah(PRODUK.harga)}</span>
                  <span className="mt-1 block text-[13px] text-sekunder">per botol 50 mL</span>
                </span>
              </p>
            )}
            <p
              className="masuk absolute left-[calc(50%+min(11vw,10rem))] top-[50%] hidden -rotate-[3deg] items-center gap-2.5 rounded-full bg-kemasan px-4 py-2.5 text-[14px] font-semibold text-white shadow-angkat md:flex"
              style={tunda(760)}
            >
              <FlaskIcon size={20} weight="duotone" aria-hidden="true" className="text-foil" />
              Tanpa DEET
            </p>
          </div>
        </section>

        {/* 2. Tiga langkah — kartu berangka besar bergradasi (gaya web lama), urutan nyata jadi bernomor */}
        <section aria-labelledby="judul-langkah" className="bg-white">
          <div className="wadah grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <h2 id="judul-langkah" className="judul-1">
                Tiga langkah menjaga rumah dari DBD
              </h2>
              <p className="pengantar mt-5 max-w-[40ch]">
                MosqRisk memberi tahu kapan cuaca sedang mendukung nyamuk; pencegahannya tetap dimulai dari rumah sendiri.
              </p>
              <span aria-hidden="true" className="mt-8 block h-1.5 w-20 rounded-full bg-foil" />
            </div>
            <ol className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              {LANGKAH.map(({ Ikon, judul, isi, href, tautan }, i) => (
                <li
                  key={judul}
                  className={`group relative flex flex-col rounded-kartu p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-angkat ${
                    ["bg-kertas", "bg-foil/12", "bg-pucuk/25 sm:col-span-2"][i]
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span aria-hidden="true" className="angka angka-langkah text-[64px] font-extrabold leading-[0.85] tracking-[-0.05em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-kemasan shadow-tipis">
                      <Ikon size={24} weight="duotone" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-6 text-[21px] font-bold tracking-tight">{judul}</h3>
                  <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-sekunder">{isi}</p>
                  <Link href={href} className="tautan mt-5 inline-flex min-h-11 items-center self-start font-semibold text-kemasan">
                    {tautan}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Masalah — foto nyamuk + angka */}
        <section aria-labelledby="judul-masalah" className="permukaan-gelap relative isolate overflow-hidden bg-hutan text-white">
          <Image src={FOTO.aedesGigit.src} alt="" fill sizes="100vw" className="-z-10 object-cover object-[70%_50%] md:object-right" />
          <div aria-hidden="true" className="lapis-foto absolute inset-0 -z-10" />
          <div className="wadah py-20 md:py-28">
            <h2 id="judul-masalah" className="judul-1 max-w-[16ch]">
              Dengue menular lewat gigitan nyamuk <i className="font-extrabold">Aedes</i> yang terinfeksi
            </h2>
            <p className="pengantar mt-5 max-w-[48ch]">Sepanjang 2025, Kementerian Kesehatan mencatat:</p>
            <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {[
                { nilai: 161752, label: "kasus DBD" },
                { nilai: 673, label: "kematian akibat DBD" },
                { nilai: 0.42, desimal: 2, akhiran: "%", label: "tingkat kematian kasus DBD" },
                { nilai: 443530, label: "kasus malaria, penyakit tular nyamuk lain" },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-foil pl-4">
                  <dd className="text-[34px] font-extrabold leading-none tracking-[-0.04em] md:text-[44px]">
                    <AngkaNaik nilai={s.nilai} desimal={s.desimal ?? 0} />
                    {s.akhiran}
                  </dd>
                  <dt className="mt-2 text-[14px] leading-snug text-pucat">{s.label}</dt>
                </div>
              ))}
            </dl>
            <p className="keterangan mt-10">Sumber: Kementerian Kesehatan (2026), data kasus 2025.</p>
          </div>
        </section>

        {/* 4. Risiko hari ini */}
        <section aria-labelledby="judul-risiko" className="bg-kertas">
          <div className="wadah grid gap-10 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-5 xl:col-span-4">
              <h2 id="judul-risiko" className="judul-2">
                Risiko nyamuk hari ini, dari prakiraan BMKG
              </h2>
              <p className="teks-isi mt-5 text-sekunder">
                Model Risiko MosqRisk memberi skor 0–100 dari tiga faktor cuaca: suhu, kelembapan, dan hujan. Rumusnya matematis, dengan parameter
                dari penelitian yang dikutip lengkap, bukan model kecerdasan buatan.
              </p>
              <p className="teks-isi mt-4 text-sekunder">Pemilik kemasan Patchmos bisa membuka prakiraan 3 hari dan notifikasi email.</p>
              <Link href="/edukasi#model" className={kelasTombol("garis", "md", "mt-7")}>
                Cara skor dihitung
              </Link>
            </div>
            <div className="rounded-media bg-white p-5 shadow-tipis md:p-9 lg:col-span-7 xl:col-span-8">
              <RisikoHariIni />
            </div>
          </div>
        </section>

        {/* 5. Rantai nilam */}
        <section aria-labelledby="judul-rantai" className="permukaan-gelap bg-hutan text-white">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-rantai" className="judul-2 lg:col-span-7">
                Dari ampas penyulingan nilam, menjadi Patchmos
              </h2>
              <p className="pengantar lg:col-span-5">
                Aceh menghasilkan minyak nilam untuk pasar dunia. Sisa daunnya yang sudah disuling kami olah menjadi bahan aktif penolak nyamuk.
              </p>
            </div>
            <div className="mt-14">
              <RantaiNilam />
            </div>
          </div>
        </section>

        {/* 6. Produk */}
        <section aria-labelledby="judul-produk" className="bg-white">
          <div className="wadah grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12">
            <figure className="lg:col-span-6">
              {/* Panel bersih: render asli (latar putih) di atas gradasi kertas → putih; tanpa foto tempelan. */}
              <div className="relative isolate overflow-hidden rounded-media bg-gradient-to-b from-kertas to-white">
                <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pucuk/40 blur-3xl" />
                <Image
                  src="/brand/patchmos-produk-asli.png"
                  alt="Botol dan kotak Patchmos Spray"
                  width={2048}
                  height={1536}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="relative mx-auto h-auto w-full mix-blend-multiply"
                />
              </div>
              <figcaption className="keterangan mt-3">Render kemasan sementara; desain final menyusul.</figcaption>
            </figure>
            <div className="lg:col-span-6">
              <h2 id="judul-produk" className="judul-2">
                {PRODUK.nama ?? "Patchmos Spray"}
              </h2>
              {PRODUK.harga && (
                <p className="mt-3 text-[22px] font-bold text-kemasan">
                  <span className="angka">{rupiah(PRODUK.harga)}</span> <span className="text-[16px] font-medium text-sekunder">per botol</span>
                </p>
              )}
              <dl className="mt-7 divide-y divide-garis border-y border-garis text-[15.5px]">
                {[
                  { label: "Bahan aktif", isi: "Ekstrak ampas nilam, limbah padat penyulingan" },
                  { label: "Proses", isi: "Maserasi etanol, lalu mikroenkapsulasi gelatin dan gum arab" },
                  { label: "Tanpa", isi: "DEET" },
                  { label: "Bukti", isi: "Uji persepsi 10 responden (bukan uji klinis); uji lab direncanakan" },
                ].map((b) => (
                  <div key={b.label} className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="font-medium text-sekunder">{b.label}</dt>
                    <dd className="font-medium">{b.isi}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/checkout" className={kelasTombol("utama", "lg")}>
                  <ShoppingBagIcon size={22} weight="duotone" aria-hidden="true" />
                  Beli sekarang
                </Link>
                <Link href="/tim#produksi" className={kelasTombol("hantu", "lg")}>
                  Cara Patchmos dibuat
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Bukti */}
        <section aria-labelledby="judul-bukti" className="bg-kertas">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-bukti" className="judul-2 lg:col-span-6">
                Bukti yang sudah ada, dan yang belum
              </h2>
              <p className="pengantar lg:col-span-5 lg:col-start-8">
                Uji persepsi pengguna dan uji laboratorium kami pisahkan, supaya jelas mana yang sudah dilakukan dan mana yang masih direncanakan.
              </p>
            </div>
            <div className="mt-12">
              <BuktiUji />
            </div>
          </div>
        </section>

        {/* 8. Klaim kode kemasan */}
        <BagianKlaim />

        {/* 9. Tanya-jawab & tim */}
        <section aria-labelledby="judul-tanya" className="bg-white">
          <div className="wadah grid gap-14 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="judul-tanya" className="judul-2">
                Yang sering ditanyakan
              </h2>
              <div className="mt-8">
                <Akordion item={tanyaJawab} />
              </div>
            </div>
            <aside aria-labelledby="judul-tim" className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-media bg-kertas p-7 md:p-8 lg:sticky lg:top-28">
                {/* Foto wajah asli tim (public/tim/wajah/); inisial bila foto belum ada */}
                <ul className="flex -space-x-3">
                  {ANGGOTA.map((a, i) => {
                    const wajah = cariWajahTim(a.foto);
                    return (
                      <li key={a.nama} title={a.nama} className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-kertas">
                        {wajah ? (
                          <Image src={wajah} alt={a.nama} fill sizes="64px" className="object-cover" />
                        ) : (
                          <span
                            aria-label={a.nama}
                            className={`grid h-full w-full place-items-center text-[17px] font-bold text-white ${WARNA_AVATAR[i % WARNA_AVATAR.length]}`}
                          >
                            {inisial(a.nama)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <h2 id="judul-tim" className="mt-6 text-[24px] font-extrabold leading-tight tracking-tight">
                  Dibuat lima mahasiswa Universitas Syiah Kuala
                </h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-sekunder">
                  Bersama satu dosen pendamping, dalam Program Pendanaan Internal Kewirausahaan (PIKU) Batch II.
                </p>
                <Link href="/tim" className={kelasTombol("utama", "md", "mt-6 w-full")}>
                  Kenali tim Patchmos
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
