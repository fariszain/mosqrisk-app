import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpenTextIcon,
  BathtubIcon,
  BedIcon,
  CylinderIcon,
  FirstAidKitIcon,
  FishIcon,
  FlaskIcon,
  RecycleIcon,
  SprayBottleIcon,
} from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KartuLabel from "@/components/ui/KartuLabel";
import HeroHalaman from "@/components/ui/HeroHalaman";
import AngkaNaik from "@/components/ui/AngkaNaik";
import TrenIklim from "@/components/edukasi/TrenIklim";
import SiklusAedes from "@/components/edukasi/SiklusAedes";
import SimulatorRisiko from "@/components/edukasi/SimulatorRisiko";
import { kelasTombol } from "@/components/ui/tombol";
import { KATEGORI, ZONA } from "@/lib/risiko";
import { FOTO, teksKredit } from "@/lib/foto";
import { GEJALA, PLUS, SUMBER, TANDA_BAHAYA, TIGA_M } from "@/lib/edukasi";
import { RUMUS } from "@/lib/rumus";

export const metadata: Metadata = {
  title: "Edukasi DBD",
  description:
    "Gejala dan tanda bahaya DBD, siklus hidup nyamuk Aedes, pencegahan 3M Plus, cara Model Risiko MosqRisk menghitung skor, dan nilam sebagai bahan Patchmos.",
};

// Klaim kesehatan hanya dari sumber resmi yang dicantumkan di halaman (WHO, CDC, Kemenkes) —
// lihat docs/expo/05_FAKTA_TERVERIFIKASI.md §7. Parameter rumus dari backend/rumus_risiko.json (lib/rumus.ts).
const DAFTAR_ISI = [
  { href: "#dbd", label: "Apa itu DBD" },
  { href: "#siklus", label: "Siklus hidup Aedes" },
  { href: "#pencegahan", label: "Pencegahan 3M Plus" },
  { href: "#model", label: "Cara skor dihitung" },
  { href: "#nilam", label: "Nilam dan ampasnya" },
];

const IKON_3M = [BathtubIcon, CylinderIcon, RecycleIcon];
const IKON_PLUS = [FishIcon, SprayBottleIcon, BedIcon, FlaskIcon];

function Sumber({ s }: { s: { teks: string; url: string } }) {
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="tautan">
      {s.teks}
    </a>
  );
}

export default function EdukasiPage() {
  const kreditHero = teksKredit(FOTO.aedesCdc);
  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1">
        {/* Kepala halaman */}
        <HeroHalaman
          id="judul-edukasi"
          label="Pusat edukasi"
          Ikon={BookOpenTextIcon}
          judul={
            <>
              Mengenal DBD, nyamuk <i>Aedes</i>, dan <span className="teks-foil">cara mencegahnya</span>
            </>
          }
          pengantar="Gejala yang perlu diwaspadai, cara nyamuk berkembang biak, langkah pencegahan dari Kementerian Kesehatan, dan cara MosqRisk membaca risiko dari cuaca."
          aksi={
            <nav aria-label="Daftar isi">
              <ul className="flex flex-wrap gap-2">
                {DAFTAR_ISI.map((d) => (
                  <li key={d.href}>
                    <a
                      href={d.href}
                      className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-white/25 px-4 text-[15px] font-medium text-white transition-colors hover:border-foil hover:bg-foil hover:text-tinta"
                    >
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          }
          kanan={
            <figure className="relative">
              <div className="relative aspect-[3/2] -rotate-[1.5deg] overflow-hidden rounded-media bg-hutan shadow-angkat ring-1 ring-white/10">
                <Image src={FOTO.aedesCdc.src} alt={FOTO.aedesCdc.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
              </div>
              {kreditHero && (
                <figcaption className="keterangan mt-4">
                  <i>Aedes aegypti</i> betina. {kreditHero},{" "}
                  <a href={FOTO.aedesCdc.tautan} target="_blank" rel="noopener noreferrer" className="tautan">
                    Wikimedia Commons
                  </a>
                </figcaption>
              )}
            </figure>
          }
        />

        {/* DBD */}
        <section id="dbd" aria-labelledby="judul-dbd" className="scroll-mt-20 bg-kertas">
          <div className="wadah py-20 md:py-28">
            <h2 id="judul-dbd" className="judul-2 max-w-[22ch]">
              Apa itu demam berdarah dengue?
            </h2>
            <div className="mt-10 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="teks-isi">
                  Demam berdarah dengue (DBD) adalah penyakit akibat virus dengue yang ditularkan lewat gigitan nyamuk <i>Aedes aegypti</i> yang
                  terinfeksi. Penyakit ini banyak ditemukan di daerah tropis, termasuk Indonesia.
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { nilai: 161752, label: "kasus DBD di 2025" },
                    { nilai: 673, label: "kematian" },
                    { nilai: 0.42, desimal: 2, akhiran: "%", label: "tingkat kematian kasus" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-kartu bg-white p-4">
                      <dd className="text-[24px] font-extrabold leading-none tracking-[-0.04em] md:text-[30px]">
                        <AngkaNaik nilai={s.nilai} desimal={s.desimal ?? 0} />
                        {s.akhiran}
                      </dd>
                      <dt className="mt-2 text-[13px] leading-snug text-sekunder">{s.label}</dt>
                    </div>
                  ))}
                </dl>
                <p className="keterangan mt-3">Sumber: {SUMBER.kemenkes2026}. Pada tahun yang sama tercatat 443.530 kasus malaria.</p>

                <h3 className="mt-10 text-[19px] font-bold tracking-tight">Gejala yang umum</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {GEJALA.map((g) => (
                    <li key={g} className="rounded-full bg-white px-4 py-2 text-[15px] font-medium">
                      {g}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[15px] leading-relaxed text-sekunder">
                  Banyak orang hanya bergejala ringan atau tanpa gejala. Bila muncul, gejala biasanya mulai 4–10 hari setelah tertular dan berlangsung
                  2–7 hari.
                </p>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <div className="rounded-media bg-risiko-tinggi-latar p-6 md:p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-galat text-white">
                    <FirstAidKitIcon size={24} weight="duotone" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[20px] font-bold leading-snug tracking-tight text-galat">Segera ke fasilitas kesehatan bila muncul tanda bahaya</h3>
                  <ul className="mt-4 space-y-2 text-[16px] leading-relaxed">
                    {TANDA_BAHAYA.map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-galat" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-galat/20 pt-4 text-[15px] font-medium leading-relaxed">
                    Bila muncul salah satu tanda ini, jangan menunggu: segera pergi ke puskesmas atau rumah sakit.
                  </p>
                </div>
                <p className="keterangan mt-3">
                  Sumber: <Sumber s={SUMBER.who} />. Informasi umum, bukan pengganti pemeriksaan tenaga kesehatan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Siklus */}
        <section id="siklus" aria-labelledby="judul-siklus" className="scroll-mt-20 bg-white">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-siklus" className="judul-2 lg:col-span-7">
                Dari telur ke nyamuk dalam sekitar 7–10 hari
              </h2>
              <p className="pengantar lg:col-span-5">
                Tiga tahap pertama <i>Aedes aegypti</i> hidup di air. Pilih tiap tahap untuk melihat bentuknya.
              </p>
            </div>
            <div className="mt-12 rounded-media bg-kertas p-4 md:p-8">
              <SiklusAedes />
            </div>
            <p className="teks-isi mt-8 max-w-[64ch]">
              Karena telur bisa menjadi nyamuk dewasa dalam sekitar 7–10 hari, menguras wadah air secara rutin memutus siklus ini sebelum nyamuk baru
              lahir.
            </p>
            <p className="keterangan mt-3">
              Sumber: <Sumber s={SUMBER.cdc} />.
            </p>
          </div>
        </section>

        {/* 3M Plus */}
        <section id="pencegahan" aria-labelledby="judul-3m" className="permukaan-gelap relative scroll-mt-20 bg-hutan text-white">
          <span id="3m-plus" className="absolute -top-20" aria-hidden="true" />
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-3m" className="judul-2 lg:col-span-6">
                Pencegahan: 3M Plus
              </h2>
              <p className="pengantar lg:col-span-5 lg:col-start-8">
                Pemberantasan sarang nyamuk (PSN) 3M Plus adalah cara pencegahan DBD yang dianjurkan Kementerian Kesehatan.
              </p>
            </div>
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {TIGA_M.map((m, i) => {
                const Ikon = IKON_3M[i];
                return (
                  <li key={m.judul} className="group rounded-media bg-white/[0.06] p-6 transition-colors hover:bg-white/[0.1] md:p-8">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-foil text-tinta transition-transform duration-300 group-hover:-rotate-6">
                      <Ikon size={28} weight="duotone" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-[26px] font-extrabold tracking-[-0.03em]">{m.judul}</h3>
                    <p className="mt-2 text-[16px] leading-relaxed text-pucat">{m.isi}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 rounded-media border border-white/12 p-6 md:p-8">
              <h3 className="text-[18px] font-bold">Plus: contoh langkah tambahan</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PLUS.map((p, i) => {
                  const Ikon = IKON_PLUS[i];
                  return (
                    <li key={p} className="flex items-center gap-3 text-[15.5px] leading-snug">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-pucuk">
                        <Ikon size={22} weight="duotone" aria-hidden="true" />
                      </span>
                      {p}
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="keterangan mt-6">
              Sumber: <Sumber s={SUMBER.kemenkes3m} /> (3M); <Sumber s={SUMBER.kemenkesPlus} /> (contoh langkah Plus).
            </p>
          </div>
        </section>

        {/* Model */}
        <section id="model" aria-labelledby="judul-model" className="scroll-mt-20 bg-kertas">
          <div className="wadah py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="judul-model" className="judul-2 lg:col-span-6">
                Cara MosqRisk menghitung skor
              </h2>
              <p className="pengantar lg:col-span-6">
                Skor 0–100 adalah indeks kesesuaian cuaca untuk penularan dengue oleh nyamuk <i>Aedes</i>, bukan perkiraan jumlah kasus. Datanya
                prakiraan BMKG untuk wilayahmu; rumusnya turunan dari rumus angka penularan (R<sub>0</sub>) di jurnal, bukan model kecerdasan
                buatan yang dilatih dari data kasus.
              </p>
            </div>

            {RUMUS ? (
              <>
                <ol className="mt-12 grid gap-4 md:grid-cols-3">
                  {(["suhu", "kelembapan", "hujan"] as const).map((k) => {
                    const f = RUMUS!.faktor[k];
                    return (
                      <li key={k} className="flex flex-col rounded-kartu bg-white p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-[19px] font-bold tracking-tight">{f.label}</h3>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold ${
                              f.status === "jurnal" ? "bg-kertas text-kemasan" : "bg-foil/20 text-emas-teks"
                            }`}
                          >
                            {f.status === "jurnal" ? "Dari jurnal" : "Asumsi tim"}
                          </span>
                        </div>
                        <p className="angka mt-2 text-[14px] font-semibold text-sekunder">Pengali 0–1</p>
                        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-sekunder">{f.alasan}</p>
                        <p className="mt-4 border-t border-garis pt-3 text-[13px] leading-relaxed text-sekunder">{f.sumber}</p>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-5 rounded-kartu bg-white p-6 md:p-7">
                  <p className="angka text-[20px] font-extrabold tracking-tight md:text-[24px]">Skor = 100 × pengali suhu × pengali kelembapan × pengali hujan</p>
                  <p className="mt-3 max-w-[80ch] text-[15px] leading-relaxed text-sekunder">
                    Faktornya dikalikan, bukan dijumlah, seperti pada rumus angka penularan: kalau satu syarat tidak terpenuhi (misalnya udara terlalu
                    dingin sehingga virus tidak berkembang di tubuh nyamuk), skornya ikut mendekati nol walau kelembapan dan hujan ideal. Hasilnya
                    dibulatkan. {RUMUS.dasar_perhitungan} {RUMUS.kategori.alasan} Versi rumus {RUMUS.versi}.
                  </p>
                </div>

                <h3 className="judul-3 mt-16">Coba sendiri</h3>
                <p className="mt-2 max-w-[64ch] text-[16px] leading-relaxed text-sekunder">
                  Geser nilai cuaca untuk melihat pengali tiap faktor. Garis hijau menunjukkan kurva pengali dari 0 sampai 1; titik menandai nilai yang
                  dipilih.
                </p>
                <div className="mt-6">
                  <SimulatorRisiko />
                </div>
              </>
            ) : (
              <p className="mt-10 text-[16px] text-sekunder">Rincian rumus belum tersedia di versi situs ini.</p>
            )}

            <div className="mt-14 rounded-kartu bg-white p-6 md:p-8">
              <h3 className="text-[19px] font-bold tracking-tight">Kategori</h3>
              <div className="mt-5 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
                {ZONA.map((z) => (
                  <div key={z.status} style={{ width: `${z.lebar}%`, background: KATEGORI[z.status].latar }} />
                ))}
              </div>
              <ul className="mt-4 grid gap-5 sm:grid-cols-3">
                {ZONA.map((z) => (
                  <li key={z.status}>
                    <p className="font-bold" style={{ color: KATEGORI[z.status].warna }}>
                      {KATEGORI[z.status].label} <span className="angka font-normal text-sekunder">({z.rentang})</span>
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-sekunder">{KATEGORI[z.status].penjelasan}</p>
                  </li>
                ))}
              </ul>
            </div>
            <p className="keterangan mt-4 max-w-[90ch]">
              Pustaka: Mordecai dkk. (2017), &ldquo;Detecting the impact of temperature on transmission of Zika, dengue, and chikungunya using
              mechanistic models&rdquo;, PLOS Neglected Tropical Diseases 11(4): e0005568 (persamaan 1 dan parameter <i>Ae. aegypti</i> di S2
              Text Tabel B). Schmidt dkk. (2018), &ldquo;Effects of desiccation stress on
              adult female longevity in Aedes aegypti and Ae. albopictus&rdquo;, Parasites &amp; Vectors 11: 267. Benedum dkk. (2018), &ldquo;Statistical
              modeling of the effect of rainfall flushing on dengue transmission in Singapore&rdquo;, PLOS Neglected Tropical Diseases 12(12): e0006935.
              Kategori intensitas hujan harian: BMKG.
            </p>

            <div className="mt-16">
              <h3 className="judul-3">Skor bulanan 12 bulan terakhir</h3>
              <p className="mt-2 max-w-[64ch] text-[16px] leading-relaxed text-sekunder">
                Rumus yang sama diterapkan pada rata-rata cuaca tiap bulan (faktor hujan memakai total hujan sebulan) untuk melihat pola musiman di
                wilayahmu.
              </p>
              <div className="mt-6 rounded-kartu bg-white p-5 md:p-8">
                <TrenIklim />
              </div>
            </div>
          </div>
        </section>

        {/* Nilam */}
        <section id="nilam" aria-labelledby="judul-nilam" className="scroll-mt-20 bg-white">
          <div className="wadah grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="judul-nilam" className="judul-2">
                Nilam dan ampasnya
              </h2>
              <p className="teks-isi mt-5">
                Indonesia menguasai sekitar 95% pasar minyak nilam dunia, dan Aceh salah satu sentra produksinya (Pusdatin Pertanian, 2024). Penyulingan
                hanya menghasilkan sekitar 1,5–3% minyak atsiri; lebih dari 95% sisanya limbah padat yang umumnya belum dimanfaatkan (Indriani dkk., 2025).
              </p>
              <p className="teks-isi mt-4">
                Ampas itu masih mengandung senyawa bioaktif seperti seskuiterpen dan <i>patchouli alcohol</i> yang berpotensi dimanfaatkan sebagai
                repellent alami (Hikal dkk., 2023). Ini temuan literatur tentang senyawanya, bukan hasil uji produk Patchmos.
              </p>
              <KartuLabel
                className="mt-8"
                judul="Patchmos Spray"
                baris={[
                  { label: "Bahan aktif", isi: "Ekstrak ampas nilam" },
                  { label: "Proses", isi: "Maserasi etanol 96%, lalu mikroenkapsulasi gelatin dan gum arab" },
                  { label: "Tanpa", isi: "DEET" },
                  { label: "Bahan penolong", isi: "Tween 80 (emulsifier), jadi tidak disebut 100% alami" },
                  { label: "Uji lab", isi: "Efikasi dan keamanan kulit: direncanakan" },
                ]}
              />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/checkout" className={kelasTombol("utama", "lg")}>
                  Beli Patchmos
                </Link>
                <Link href="/tim#produksi" className={kelasTombol("hantu", "lg")}>
                  Cara Patchmos dibuat
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-6">
              {[FOTO.nilamBunga, FOTO.nilamBibit].map((f, i) => (
                <figure key={f.src} className={i === 1 ? "mt-12" : ""}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-media bg-kertas">
                    <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover" />
                  </div>
                  <figcaption className="keterangan mt-2">
                    {teksKredit(f)},{" "}
                    <a href={f.tautan} target="_blank" rel="noopener noreferrer" className="tautan">
                      Commons
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
