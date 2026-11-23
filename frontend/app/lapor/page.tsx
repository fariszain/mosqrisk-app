"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChatTextIcon, CrosshairIcon, MegaphoneIcon, DropIcon, EnvelopeSimpleIcon, FirstAidKitIcon, HospitalIcon, ListChecksIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Catatan from "@/components/ui/Catatan";
import CentangBerhasil from "@/components/ui/CentangBerhasil";
import { kelasTombol } from "@/components/ui/tombol";
import HeroHalaman from "@/components/ui/HeroHalaman";
import { kelasInput, kelasLabel, kelasPetunjuk } from "@/components/ui/bidang";
import { FOTO } from "@/lib/foto";

// Nama & kontak pelapor tidak dikumpulkan (keputusan Fase 1) — dulu diminta tetapi tidak pernah disimpan.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const JENIS = [
  { nilai: "JENTIK", judul: "Genangan atau jentik", isi: "Tempat air yang berisi jentik, atau genangan yang sulit dikuras.", Ikon: DropIcon },
  { nilai: "DBD", judul: "Kasus suspect DBD", isi: "Ada warga sekitar yang dirawat karena gejala demam berdarah. Jangan sebut nama atau data pribadinya.", Ikon: FirstAidKitIcon },
  { nilai: "LAINNYA", judul: "Lainnya", isi: "Temuan lain yang berkaitan dengan nyamuk di lingkunganmu.", Ikon: ChatTextIcon },
] as const;

const SETELAH = [
  { Ikon: ListChecksIcon, teks: "Laporan tercatat di dasbor tim MosqRisk." },
  { Ikon: EnvelopeSimpleIcon, teks: "Warga yang berlangganan notifikasi di wilayah yang sama menerima email berisi laporanmu." },
  { Ikon: PaperPlaneTiltIcon, teks: "Laporan tidak mengubah skor risiko. Skor dihitung dari prakiraan cuaca BMKG." },
];

type Jenis = (typeof JENIS)[number]["nilai"];

export default function LaporPage() {
  const [jenis, setJenis] = useState<Jenis>("JENTIK");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [cariLokasi, setCariLokasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const [galat, setGalat] = useState("");
  const [galatField, setGalatField] = useState<{ lokasi?: string; deskripsi?: string }>({});

  const pakaiLokasi = () => {
    setGalatField((g) => ({ ...g, lokasi: undefined }));
    if (!("geolocation" in navigator)) {
      setGalatField((g) => ({ ...g, lokasi: "Browser ini tidak bisa membaca lokasi. Ketik lokasi secara manual." }));
      return;
    }
    setCariLokasi(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=id&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          if (!data?.display_name) throw new Error("kosong");
          setLokasi(data.display_name);
        } catch {
          setGalatField((g) => ({ ...g, lokasi: "Lokasi tidak bisa diubah menjadi alamat. Ketik lokasi secara manual." }));
        } finally {
          setCariLokasi(false);
        }
      },
      () => {
        setCariLokasi(false);
        setGalatField((g) => ({ ...g, lokasi: "Izin lokasi ditolak. Ketik lokasi secara manual." }));
      },
      { timeout: 15000 }
    );
  };

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalat("");
    const g: { lokasi?: string; deskripsi?: string } = {};
    if (lokasi.trim().length < 2) g.lokasi = "Isi lokasi temuan, misalnya nama jalan dan kelurahan.";
    if (deskripsi.trim().length < 3) g.deskripsi = "Ceritakan temuanmu dalam beberapa kata.";
    setGalatField(g);
    if (g.lokasi || g.deskripsi) {
      document.getElementById(g.lokasi ? "lokasi" : "deskripsi")?.focus();
      return;
    }
    setMengirim(true);
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationName: lokasi.trim(), description: deskripsi.trim(), reportType: jenis }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTerkirim(true);
        window.scrollTo({ top: 0 });
      } else if (res.status === 422) {
        setGalat("Periksa lagi isian laporan: lokasi dan deskripsi wajib diisi, deskripsi maksimal 1.000 karakter.");
      } else {
        setGalat(data.message || "Laporan belum bisa disimpan. Coba lagi beberapa saat lagi.");
      }
    } catch {
      setGalat("Server tidak bisa dihubungi. Periksa koneksi internet, lalu coba lagi.");
    } finally {
      setMengirim(false);
    }
  };

  const ulang = () => {
    setTerkirim(false);
    setLokasi("");
    setDeskripsi("");
    setJenis("JENTIK");
  };

  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        <HeroHalaman
          id="judul-lapor"
          label="Lapor warga"
          Ikon={MegaphoneIcon}
          judul={
            <>
              Lapor genangan, jentik, atau <span className="teks-foil">kasus suspect DBD</span>
            </>
          }
          pengantar="Laporanmu tercatat di dasbor tim MosqRisk dan diteruskan lewat email ke warga yang berlangganan notifikasi di wilayah yang sama."
          aksi={
            <a href="#formulir" className={kelasTombol("foil", "lg", "rounded-full! px-8")}>
              <PaperPlaneTiltIcon size={22} weight="duotone" aria-hidden="true" />
              Isi laporan
            </a>
          }
          kanan={
            <figure className="relative rotate-[1.5deg]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-media bg-hutan shadow-angkat ring-1 ring-white/10">
                <Image src={FOTO.genangan.src} alt={FOTO.genangan.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="absolute -bottom-5 left-5 -rotate-[2deg] rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-tinta shadow-angkat">
                Genangan seperti ini bisa jadi tempat jentik tumbuh
              </figcaption>
            </figure>
          }
        />

        <section>
          <div className="wadah grid gap-6 py-8 md:py-12 lg:grid-cols-12 lg:gap-8">
            <div className="rounded-media bg-white p-5 shadow-tipis md:p-9 lg:col-span-8">
              {terkirim ? (
                <div role="status" className="ganti-isi py-4 text-center md:py-8">
                  <CentangBerhasil ukuran={76} className="mx-auto" />
                  <h2 className="judul-3 mt-5">Laporan terkirim. Terima kasih</h2>
                  <p className="mx-auto mt-3 max-w-[52ch] text-[16px] leading-relaxed text-sekunder">
                    Laporan tercatat untuk tim MosqRisk. Kalau ada warga yang berlangganan notifikasi di wilayah yang sama, mereka menerima email
                    berisi laporan ini.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={ulang} className={kelasTombol("utama")}>
                      Kirim laporan lain
                    </button>
                    <Link href="/pantau" className={kelasTombol("garis")}>
                      Lihat risiko wilayahmu
                    </Link>
                  </div>
                </div>
              ) : (
                <form id="formulir" onSubmit={kirim} noValidate className="scroll-mt-28 space-y-8">
                  <fieldset>
                    <legend className="text-[20px] font-bold tracking-tight">Apa yang ingin kamu laporkan?</legend>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {JENIS.map(({ nilai, judul, isi, Ikon }) => {
                        const dipilih = jenis === nilai;
                        return (
                          <label
                            key={nilai}
                            className={`flex cursor-pointer flex-col gap-3 rounded-kartu border-[1.5px] p-4 transition-[border-color,background-color] duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-kemasan/20 ${
                              dipilih ? "border-kemasan bg-kertas" : "border-garis hover:border-garis-kuat"
                            }`}
                          >
                            <input type="radio" name="jenis" value={nilai} checked={dipilih} onChange={() => setJenis(nilai)} className="sr-only" />
                            <span
                              className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${dipilih ? "bg-kemasan text-white" : "bg-kertas text-kemasan"}`}
                            >
                              <Ikon size={22} weight="duotone" aria-hidden="true" />
                            </span>
                            <span>
                              <span className="block text-[16px] font-bold">{judul}</span>
                              <span className="mt-1 block text-[13.5px] leading-relaxed text-sekunder">{isi}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4">
                      <label htmlFor="lokasi" className={`${kelasLabel} mb-0`}>
                        Lokasi temuan
                      </label>
                      <button
                        type="button"
                        onClick={pakaiLokasi}
                        disabled={cariLokasi}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[14.5px] font-semibold text-kemasan transition-colors hover:bg-kertas disabled:opacity-60"
                      >
                        <CrosshairIcon size={18} weight="duotone" aria-hidden="true" className={cariLokasi ? "animate-spin" : ""} />
                        {cariLokasi ? "Mencari lokasi…" : "Pakai lokasiku"}
                      </button>
                    </div>
                    <input
                      id="lokasi"
                      type="text"
                      maxLength={300}
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      placeholder="Contoh: Jl. Teuku Nyak Arief, Kopelma Darussalam, Banda Aceh"
                      aria-invalid={!!galatField.lokasi}
                      aria-describedby={galatField.lokasi ? "galat-lokasi" : "petunjuk-lokasi"}
                      className={kelasInput}
                    />
                    {galatField.lokasi ? (
                      <p id="galat-lokasi" className="mt-1.5 text-[14px] text-galat">
                        {galatField.lokasi}
                      </p>
                    ) : (
                      <p id="petunjuk-lokasi" className={kelasPetunjuk}>
                        Sebutkan kelurahan dan kabupaten/kota supaya laporan sampai ke pelanggan di wilayah itu.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deskripsi" className={kelasLabel}>
                      Apa yang kamu temukan?
                    </label>
                    <textarea
                      id="deskripsi"
                      rows={5}
                      maxLength={1000}
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Contoh: Ban bekas di lahan kosong samping masjid berisi air dan jentik."
                      aria-invalid={!!galatField.deskripsi}
                      aria-describedby={galatField.deskripsi ? "galat-deskripsi" : "hitung-deskripsi"}
                      className={`${kelasInput} resize-y`}
                    />
                    {galatField.deskripsi ? (
                      <p id="galat-deskripsi" className="mt-1.5 text-[14px] text-galat">
                        {galatField.deskripsi}
                      </p>
                    ) : (
                      <div className="mt-2 flex items-center gap-3">
                        <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-kertas-gelap">
                          <div className="h-full rounded-full bg-daun transition-[width] duration-200" style={{ width: `${deskripsi.length / 10}%` }} />
                        </div>
                        <p id="hitung-deskripsi" className="angka text-[13px] text-sekunder">
                          {deskripsi.length.toLocaleString("id-ID")} dari 1.000 karakter
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="rounded-kontrol bg-kertas px-4 py-3 text-[14px] leading-relaxed text-sekunder">
                    Jenis, lokasi, dan deskripsi laporan disimpan dan bisa diteruskan lewat email ke pelanggan notifikasi di wilayah yang sama. Jangan
                    cantumkan nama, nomor telepon, atau data pribadi orang lain.{" "}
                    <Link href="/privasi" className="tautan font-semibold text-tinta">
                      Kebijakan privasi
                    </Link>
                  </p>

                  {galat && <Catatan nada="galat">{galat}</Catatan>}

                  <button type="submit" disabled={mengirim} className={kelasTombol("utama", "lg", "w-full sm:w-auto")}>
                    <PaperPlaneTiltIcon size={20} weight="duotone" aria-hidden="true" />
                    {mengirim ? "Mengirim laporan…" : "Kirim laporan"}
                  </button>
                </form>
              )}
            </div>

            <aside className="grid content-start gap-5 lg:col-span-4">
              <div className="rounded-media bg-white p-6 shadow-tipis md:p-7">
                <h2 className="text-[18px] font-bold tracking-tight">Setelah laporan dikirim</h2>
                <ol className="mt-5 space-y-5">
                  {SETELAH.map(({ Ikon, teks }, i) => (
                    <li key={teks} className="relative flex gap-3.5">
                      {i < SETELAH.length - 1 && <span aria-hidden="true" className="absolute -bottom-5 left-[21px] top-11 w-[2px] bg-garis" />}
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-kertas text-kemasan">
                        <Ikon size={20} weight="duotone" aria-hidden="true" />
                      </span>
                      <p className="pt-2 text-[15px] leading-relaxed">{teks}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="permukaan-gelap rounded-media bg-hutan p-6 text-white md:p-7">
                <HospitalIcon size={28} weight="duotone" aria-hidden="true" className="text-foil" />
                <p className="mt-3 text-[16px] font-bold">Ada kasus DBD yang perlu ditangani?</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-pucat">
                  Hubungi puskesmas atau fasilitas kesehatan terdekat. MosqRisk tidak menggantikan layanan kesehatan.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
