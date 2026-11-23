"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  BellRingingIcon,
  CaretDownIcon,
  CloudRainIcon,
  CrosshairIcon,
  GoogleLogoIcon,
  LockSimpleIcon,
  MapPinIcon,
  QrCodeIcon,
  ThermometerSimpleIcon,
} from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClaimModal from "@/components/ClaimModal";
import SkalaRisiko from "@/components/SkalaRisiko";
import IkonCuaca from "@/components/IkonCuaca";
import ChecklistPencegahan from "@/components/pantau/ChecklistPencegahan";
import Catatan from "@/components/ui/Catatan";
import { kelasTombol } from "@/components/ui/tombol";
import { kelasLabel, kelasInput } from "@/components/ui/bidang";
import { supabase } from "@/lib/supabase";
import { usePremium } from "@/lib/premium";
import { PRODUK, rupiah } from "@/lib/produk";
import {
  DataRisiko,
  HariTren,
  KATEGORI,
  LOKASI_BAWAAN,
  LokasiTersimpan,
  StatusRisiko,
  ambilRisiko,
  bacaLokasi,
  fmtAngka,
  fmtHari,
  rapikanNama,
  simpanLokasi,
  tanggalLokalHariIni,
} from "@/lib/risiko";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const WILAYAH_API = "https://www.emsifa.com/api-wilayah-indonesia/api";

type Wilayah = { id: string; name: string };

let cacheProvinsi: Promise<Wilayah[]> | null = null;
function ambilProvinsi() {
  cacheProvinsi ??= fetch(`${WILAYAH_API}/provinces.json`).then((r) => {
    if (!r.ok) throw new Error("provinsi");
    return r.json();
  });
  return cacheProvinsi.catch((e) => {
    cacheProvinsi = null;
    throw e;
  });
}
const ambilKabupaten = (provId: string): Promise<Wilayah[]> =>
  fetch(`${WILAYAH_API}/regencies/${provId}.json`).then((r) => {
    if (!r.ok) throw new Error("kabupaten");
    return r.json();
  });

const tanpaAwalan = (s: string) => s.toUpperCase().replace(/^(KOTA|KABUPATEN|KAB\.)\s+/, "").replace(/\s+/g, "");

// Status langganan email disimpan di browser (kunci lama dipertahankan).
function bacaLangganan(): { email: string; lokasi: string } | null {
  try {
    if (localStorage.getItem("emailRegistered") !== "true") return null;
    return { email: localStorage.getItem("subscribedEmail") || "", lokasi: localStorage.getItem("subscribedLocation") || "" };
  } catch {
    return null;
  }
}

export default function PantauPage() {
  const premium = usePremium();
  const [lokasi, setLokasi] = useState<LokasiTersimpan>(LOKASI_BAWAAN);
  const [bawaan, setBawaan] = useState(true);
  const [data, setData] = useState<DataRisiko | null>(null);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [pesan, setPesan] = useState("");

  const [panelLokasi, setPanelLokasi] = useState(false);
  const [provinsi, setProvinsi] = useState<Wilayah[]>([]);
  const [kabupaten, setKabupaten] = useState<Wilayah[]>([]);
  const [provPilihan, setProvPilihan] = useState("");
  const [galatWilayah, setGalatWilayah] = useState("");
  const [gps, setGps] = useState<"diam" | "mencari">("diam");
  const [pesanGps, setPesanGps] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [langganan, setLangganan] = useState<{ email: string; lokasi: string } | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [pesanLangganan, setPesanLangganan] = useState<{ nada: "sukses" | "galat"; teks: string } | null>(null);
  const [klaimBuka, setKlaimBuka] = useState(false);
  // Hanya hasil permintaan TERBARU yang dipakai (mis. lokasi bawaan lambat, lalu pengguna memilih kota lain).
  const permintaan = useRef(0);

  const muatRisiko = useCallback(async (l: LokasiTersimpan) => {
    const id = ++permintaan.current;
    setStatus("memuat");
    try {
      const hasil = await ambilRisiko(l.regId);
      if (id !== permintaan.current) return;
      setData(hasil);
      setStatus("siap");
    } catch (e) {
      if (id !== permintaan.current) return;
      setData(null);
      setPesan(e instanceof Error ? e.message : "");
      setStatus("gagal");
    }
  }, []);

  const pilihLokasi = useCallback(
    (l: LokasiTersimpan) => {
      setLokasi(l);
      setBawaan(false);
      simpanLokasi(l);
      setPanelLokasi(false);
      void muatRisiko(l);
    },
    [muatRisiko]
  );

  // GPS hanya dipakai saat diminta, atau otomatis kalau izinnya SUDAH pernah diberikan.
  const pakaiGps = useCallback(async () => {
    setPesanGps("");
    if (!("geolocation" in navigator)) {
      setPesanGps("Browser ini tidak bisa membaca lokasi. Pilih wilayah secara manual.");
      return;
    }
    setGps("mencari");
    try {
      const pos = await new Promise<GeolocationPosition>((ok, gagal) =>
        navigator.geolocation.getCurrentPosition(ok, gagal, { timeout: 15000, maximumAge: 600000 })
      );
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=id&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
      );
      const alamat = (await res.json())?.address ?? {};
      const prov = String(alamat.state || "").toUpperCase();
      const kota = String(alamat.city || alamat.county || alamat.town || alamat.regency || "");
      if (!prov || !kota) throw new Error("Lokasimu belum bisa dikenali. Pilih wilayah secara manual.");
      const daftarProv = await ambilProvinsi();
      const p = daftarProv.find((x) => x.name.includes(prov) || prov.includes(x.name));
      if (!p) throw new Error(`Provinsi ${rapikanNama(prov)} tidak ditemukan. Pilih wilayah secara manual.`);
      const daftarKab = await ambilKabupaten(p.id);
      const target = tanpaAwalan(kota);
      const k = daftarKab.find((x) => tanpaAwalan(x.name).includes(target) || target.includes(tanpaAwalan(x.name)));
      if (!k) throw new Error(`${rapikanNama(kota)} belum ada di daftar wilayah. Pilih wilayah secara manual.`);
      pilihLokasi({ provId: p.id, regId: k.id, nama: k.name, provNama: p.name });
    } catch (e) {
      const izinDitolak = typeof e === "object" && e !== null && "code" in e && (e as GeolocationPositionError).code === 1;
      setPesanGps(
        izinDitolak ? "Izin lokasi ditolak. Pilih wilayah secara manual." : e instanceof Error ? e.message : "Lokasi belum bisa dibaca. Pilih wilayah secara manual."
      );
    } finally {
      setGps("diam");
    }
  }, [pilihLokasi]);

  // Awal: lokasi tersimpan → atau Banda Aceh (bawaan); auth Supabase; status langganan.
  useEffect(() => {
    const tersimpan = bacaLokasi();
    const l = tersimpan ?? LOKASI_BAWAAN;
    setLokasi(l);
    setBawaan(!tersimpan);
    void muatRisiko(l);
    setLangganan(bacaLangganan());

    if (!tersimpan && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((s) => {
          if (s.state === "granted") void pakaiGps();
        })
        .catch(() => {});
    }

    // Login ≠ berlangganan: langganan baru dibuat saat pengguna menekan tombol.
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null)).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bukaPanelLokasi = async () => {
    const buka = !panelLokasi;
    setPanelLokasi(buka);
    setGalatWilayah("");
    if (buka && provinsi.length === 0) {
      try {
        setProvinsi(await ambilProvinsi());
      } catch {
        setGalatWilayah("Daftar provinsi belum bisa dimuat. Periksa koneksi, lalu coba lagi.");
      }
    }
  };

  const gantiProvinsi = async (id: string) => {
    setProvPilihan(id);
    setKabupaten([]);
    setGalatWilayah("");
    if (!id) return;
    try {
      setKabupaten(await ambilKabupaten(id));
    } catch {
      setGalatWilayah("Daftar kabupaten/kota belum bisa dimuat. Periksa koneksi, lalu coba lagi.");
    }
  };

  const gantiKabupaten = (id: string) => {
    const k = kabupaten.find((x) => x.id === id);
    const p = provinsi.find((x) => x.id === provPilihan);
    if (k) pilihLokasi({ provId: provPilihan, regId: k.id, nama: k.name, provNama: p?.name });
  };

  const masukGoogle = async () => {
    setPesanLangganan(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/pantau` } });
    if (error) setPesanLangganan({ nada: "galat", teks: "Login Google belum bisa dimulai. Coba lagi beberapa saat lagi." });
  };

  // Daftar / pindahkan notifikasi — selalu lewat tombol (persetujuan eksplisit).
  const daftarkan = async () => {
    if (!user?.email) return;
    setMengirim(true);
    setPesanLangganan(null);
    try {
      const res = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationName: lokasi.nama, email: user.email }),
      });
      const hasil = await res.json().catch(() => ({}));
      if (!res.ok || !hasil.success) throw new Error(hasil.message || "Pendaftaran notifikasi gagal. Coba lagi nanti.");
      try {
        localStorage.setItem("emailRegistered", "true");
        localStorage.setItem("subscribedEmail", user.email);
        localStorage.setItem("subscribedLocation", lokasi.nama);
      } catch {
        // penyimpanan browser tidak tersedia
      }
      setLangganan({ email: user.email, lokasi: lokasi.nama });
      setPesanLangganan({ nada: "sukses", teks: hasil.message || `Notifikasi email aktif untuk ${rapikanNama(lokasi.nama)}.` });
    } catch (e) {
      setPesanLangganan({ nada: "galat", teks: e instanceof Error && e.message ? e.message : "Server tidak bisa dihubungi. Coba lagi nanti." });
    } finally {
      setMengirim(false);
    }
  };

  const keluar = async () => {
    await supabase.auth.signOut().catch(() => {});
    try {
      localStorage.removeItem("emailRegistered");
      localStorage.removeItem("subscribedEmail");
      localStorage.removeItem("subscribedLocation");
    } catch {
      // abaikan
    }
    setUser(null);
    setLangganan(null);
    setPesanLangganan(null);
  };

  const tren = (data?.trend ?? []).slice(0, 3);
  const tanggalHariIni = data ? tanggalLokalHariIni(data.timezone) : tanggalLokalHariIni("Asia/Jakarta");
  const namaLokasi = rapikanNama(lokasi.nama);
  const lokasiBeda = langganan && langganan.lokasi && langganan.lokasi !== lokasi.nama;

  return (
    <>
      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        {/* Kepala dasbor: wilayah + kontrol lokasi */}
        {/* Gaya hero gabungan (lihat components/ui/HeroHalaman.tsx): hutan penuh sampai belakang navbar kapsul */}
        <section
          aria-labelledby="judul-pantau"
          className="permukaan-gelap relative isolate -mt-[68px] bg-hutan pt-[68px] text-white md:-mt-20 md:pt-20"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <Image src="/foto/nilam-daun.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-hutan/75 via-hutan/50 to-hutan" />
            <div className="absolute -bottom-40 left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-foil/15 blur-[120px]" />
          </div>
          <div className="wadah pb-12 pt-10 md:pb-16 md:pt-16">
            <p className="masuk inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[14px] font-medium text-pucat backdrop-blur-sm">
              <MapPinIcon size={18} weight="duotone" aria-hidden="true" className="text-foil" />
              Risiko nyamuk DBD hari ini di
            </p>
            <h1
              id="judul-pantau"
              className="masuk mt-5 max-w-[20ch] text-[clamp(2.4rem,1.15rem+3.7vw,4.5rem)] font-extrabold leading-[1.0] tracking-[-0.04em]"
              style={{ "--tunda": "80ms" } as React.CSSProperties}
            >
              <span className="teks-foil">{namaLokasi}</span>
              {lokasi.provNama && <span className="font-semibold text-pucat">, {rapikanNama(lokasi.provNama)}</span>}
            </h1>
            {bawaan && <p className="mt-3 text-[15px] text-pucat">Lokasi bawaan. Pilih wilayahmu untuk skor yang sesuai.</p>}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void bukaPanelLokasi()} aria-expanded={panelLokasi} aria-controls="panel-wilayah" className={kelasTombol("foil", "md", "rounded-full! px-6")}>
                Pilih wilayah
                <CaretDownIcon size={18} weight="bold" aria-hidden="true" className={`transition-transform duration-300 ${panelLokasi ? "rotate-180" : ""}`} />
              </button>
              <button type="button" onClick={() => void pakaiGps()} disabled={gps === "mencari"} className={kelasTombol("terang", "md", "rounded-full! px-6")}>
                <CrosshairIcon size={18} weight="duotone" aria-hidden="true" className={gps === "mencari" ? "animate-spin" : ""} />
                {gps === "mencari" ? "Mencari lokasi…" : "Pakai lokasiku"}
              </button>
            </div>
            {pesanGps && (
              <p role="status" className="mt-3 rounded-kontrol bg-white/10 px-3 py-2 text-[14px] text-white">
                {pesanGps}
              </p>
            )}

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${panelLokasi ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              inert={!panelLokasi}
            >
              <div className="overflow-hidden">
                <div id="panel-wilayah" className="mt-5 grid gap-4 rounded-kartu bg-white p-4 text-tinta md:grid-cols-2 md:p-5">
                  <div>
                    <label htmlFor="provinsi" className={kelasLabel}>
                      Provinsi
                    </label>
                    <select id="provinsi" value={provPilihan} onChange={(e) => void gantiProvinsi(e.target.value)} className={kelasInput}>
                      <option value="">Pilih provinsi</option>
                      {provinsi.map((p) => (
                        <option key={p.id} value={p.id}>
                          {rapikanNama(p.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="kabupaten" className={kelasLabel}>
                      Kabupaten / kota
                    </label>
                    <select
                      id="kabupaten"
                      value=""
                      onChange={(e) => gantiKabupaten(e.target.value)}
                      disabled={!provPilihan || kabupaten.length === 0}
                      className={kelasInput}
                    >
                      <option value="">{provPilihan ? "Pilih kabupaten/kota" : "Pilih provinsi dulu"}</option>
                      {kabupaten.map((k) => (
                        <option key={k.id} value={k.id}>
                          {rapikanNama(k.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {galatWilayah && <p className="text-[14px] text-galat md:col-span-2">{galatWilayah}</p>}
                  <p className="keterangan md:col-span-2">Daftar wilayah: emsifa API Wilayah Indonesia. Titik prakiraan: satu desa/kelurahan per kabupaten/kota.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skor hari ini + checklist */}
        <div className="wadah grid gap-5 py-8 md:py-12 lg:grid-cols-12">
          <section aria-labelledby="judul-skor" className="rounded-media bg-white p-5 shadow-tipis md:p-9 lg:col-span-8">
            <h2 id="judul-skor" className="mb-6 text-[15px] font-semibold text-sekunder">
              Hari ini
            </h2>
            <SkalaRisiko data={data} status={status} pesanGagal={pesan} onCobaLagi={() => void muatRisiko(lokasi)} />
          </section>
          <aside className="grid content-start gap-5 lg:col-span-4">
            <div className="rounded-media bg-white p-5 shadow-tipis md:p-7">
              <ChecklistPencegahan tanggal={tanggalHariIni} />
            </div>
            <Link
              href="/checkout"
              className="group grid grid-cols-[84px_1fr] items-center gap-4 rounded-media bg-hutan p-4 pr-5 text-white transition-colors hover:bg-kemasan"
            >
              <span className="relative block aspect-square overflow-hidden rounded-kontrol bg-white/10">
                <Image src="/brand/patchmos-produk.png" alt="" fill sizes="84px" className="object-contain p-1 transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span>
                <span className="block text-[17px] font-bold">{premium ? "Stok Patchmos menipis?" : "Lindungi diri dari gigitan"}</span>
                <span className="mt-0.5 block text-[14px] leading-snug text-pucat">Spray dari ampas nilam, tanpa DEET.</span>
                <span className="mt-1.5 block text-[14.5px] font-semibold text-foil">
                  {premium ? "Beli lagi" : "Beli Patchmos"}
                  {PRODUK.harga ? `, ${rupiah(PRODUK.harga)}` : ""}
                </span>
              </span>
            </Link>
          </aside>
        </div>

        {/* Prakiraan 3 hari (Premium) */}
        <section aria-labelledby="judul-tiga-hari" className="pb-10 md:pb-14">
          <div className="wadah">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <h2 id="judul-tiga-hari" className="judul-2">
                Prakiraan risiko 3 hari
              </h2>
              {!premium && (
                <p className="inline-flex items-center gap-2 rounded-full bg-peringatan-latar px-3.5 py-1.5 text-[14px] font-semibold text-peringatan-teks">
                  <LockSimpleIcon size={16} weight="bold" aria-hidden="true" />
                  Fitur Premium
                </p>
              )}
            </div>

            {premium ? (
              tren.length > 0 && status === "siap" && data ? (
                <>
                  <ol className="mt-7 grid gap-4 md:grid-cols-3">
                    {tren.map((d, i) => (
                      <KartuHari key={d.date ?? i} d={d} hariIni={d.date ? d.date === tanggalHariIni : i === 0} urutan={i} />
                    ))}
                  </ol>
                  <p className="keterangan mt-5 max-w-[80ch]">
                    Setiap hari dihitung dengan rumus yang sama: rata-rata suhu dan kelembapan serta total hujan dari prakiraan BMKG per 3 jam di hari
                    itu.
                  </p>
                </>
              ) : (
                <p className="mt-6 text-[16px] text-sekunder">Prakiraan 3 hari muncul setelah skor wilayahmu termuat.</p>
              )
            ) : (
              <div className="relative mt-7 min-h-[26rem] overflow-hidden rounded-media md:min-h-[22rem]">
                <ol aria-hidden="true" className="grid gap-4 blur-[5px] md:grid-cols-3">
                  {["Hari ini", "Besok", "Lusa"].map((h, i) => (
                    <li key={h} className="h-[22rem] rounded-media bg-white p-6 md:h-[22rem]">
                      <p className="text-[16px] font-semibold">{h}</p>
                      <div className="mt-5 h-14 w-24 rounded-kontrol bg-kertas-gelap" />
                      <div className="mt-4 h-2 rounded-full bg-kertas-gelap">
                        <div className="h-2 rounded-full bg-daun/50" style={{ width: `${55 + i * 12}%` }} />
                      </div>
                      <div className="mt-5 h-4 w-3/4 rounded-full bg-kertas-gelap" />
                    </li>
                  ))}
                </ol>
                <div className="absolute inset-0 grid place-items-center bg-kertas/55 p-3 md:p-4">
                  <div className="max-w-lg rounded-kartu bg-white p-6 text-center shadow-angkat md:p-8">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-kemasan text-white">
                      <QrCodeIcon size={24} weight="duotone" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-[20px] font-bold tracking-tight">Terbuka dengan kode di kemasan Patchmos</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-sekunder">
                      Skor untuk hari ini dan dua hari ke depan, plus email saat ada laporan warga di wilayahmu atau peringatan dari tim MosqRisk.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <button type="button" onClick={() => setKlaimBuka(true)} className={kelasTombol("utama")}>
                        <QrCodeIcon size={20} aria-hidden="true" />
                        Masukkan kode
                      </button>
                      <Link href="/checkout" className={kelasTombol("garis")}>
                        Beli Patchmos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Notifikasi email (Premium) */}
        {premium && (
          <section aria-labelledby="judul-notifikasi" className="pb-12 md:pb-16">
            <div className="wadah">
              <div className="grid gap-8 rounded-media bg-white p-6 shadow-tipis md:p-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-kertas text-kemasan">
                    <BellRingingIcon size={24} weight="duotone" aria-hidden="true" />
                  </span>
                  <h2 id="judul-notifikasi" className="judul-3 mt-4">
                    Notifikasi email
                  </h2>
                  <p className="teks-isi mt-3 text-sekunder">
                    Email dikirim saat ada laporan warga di wilayah langgananmu, atau saat tim MosqRisk mengirim peringatan. Tidak ada peringatan
                    otomatis dari perubahan skor.
                  </p>
                </div>
                <div className="lg:col-span-6 lg:col-start-7">
                  {langganan ? (
                    <>
                      <p className="flex items-center gap-2 text-[17px] font-bold text-risiko-rendah">
                        <BellRingingIcon size={22} weight="fill" aria-hidden="true" />
                        Notifikasi aktif
                      </p>
                      <dl className="mt-4 divide-y divide-garis rounded-kontrol bg-kertas px-4 text-[15px]">
                        <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3">
                          <dt className="text-sekunder">Email</dt>
                          <dd className="break-all font-medium">{langganan.email}</dd>
                        </div>
                        <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3">
                          <dt className="text-sekunder">Wilayah</dt>
                          <dd className="font-medium">{rapikanNama(langganan.lokasi) || "–"}</dd>
                        </div>
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {lokasiBeda && user?.email && (
                          <button type="button" onClick={() => void daftarkan()} disabled={mengirim} className={kelasTombol("utama", "sm")}>
                            {mengirim ? "Memindahkan…" : `Pindahkan ke ${namaLokasi}`}
                          </button>
                        )}
                        {user && (
                          <button type="button" onClick={() => void keluar()} className={kelasTombol("garis", "sm")}>
                            Keluar dari akun Google
                          </button>
                        )}
                      </div>
                      {lokasiBeda && !user && (
                        <div className="mt-4">
                          <p className="text-[14px] text-sekunder">Untuk memindahkan notifikasi ke {namaLokasi}, masuk lagi dengan Google.</p>
                          <button type="button" onClick={() => void masukGoogle()} className={kelasTombol("garis", "sm", "mt-3")}>
                            <GoogleLogoIcon size={18} aria-hidden="true" />
                            Masuk dengan Google
                          </button>
                        </div>
                      )}
                      <p className="keterangan mt-4">Keluar dari akun tidak menghentikan email. Untuk berhenti, balas email MosqRisk dengan kata BERHENTI.</p>
                    </>
                  ) : user?.email ? (
                    <>
                      <p className="text-[16px] leading-relaxed">
                        Kirim notifikasi untuk <strong>{namaLokasi}</strong> ke <strong className="break-all">{user.email}</strong>?
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button type="button" onClick={() => void daftarkan()} disabled={mengirim} className={kelasTombol("utama")}>
                          {mengirim ? "Mendaftarkan…" : "Aktifkan notifikasi email"}
                        </button>
                        <button type="button" onClick={() => void keluar()} className={kelasTombol("garis")}>
                          Pakai akun lain
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[16px] leading-relaxed">Masuk dengan akun Google untuk memakai alamat emailmu.</p>
                      <button type="button" onClick={() => void masukGoogle()} className={kelasTombol("garis", "md", "mt-5")}>
                        <GoogleLogoIcon size={20} aria-hidden="true" />
                        Masuk dengan Google
                      </button>
                    </>
                  )}
                  {pesanLangganan && (
                    <Catatan nada={pesanLangganan.nada} className="mt-5">
                      {pesanLangganan.teks}
                    </Catatan>
                  )}
                  <p className="keterangan mt-4">
                    Email dan wilayah disimpan untuk mengirim notifikasi.{" "}
                    <Link href="/privasi" className="tautan">
                      Kebijakan privasi
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dari limbah nilam — fakta 05_FAKTA §2 */}
        <section className="border-t border-garis bg-white">
          <div className="wadah flex flex-col gap-4 py-8 md:flex-row md:items-center md:py-10">
            <Image src="/foto/nilam-racik.webp" alt="" width={600} height={896} sizes="64px" className="h-16 w-16 shrink-0 rounded-full object-cover" />
            <p className="max-w-[80ch] text-[15px] leading-relaxed text-sekunder">
              Penyulingan nilam hanya menghasilkan sekitar 1,5–3% minyak atsiri; lebih dari 95% sisanya limbah padat yang umumnya belum dimanfaatkan
              (Indriani dkk., 2025). Patchmos memakai ampas itulah sebagai sumber bahan aktif.{" "}
              <Link href="/edukasi#nilam" className="tautan font-semibold text-tinta">
                Tentang nilam dan ampasnya
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <ClaimModal isOpen={klaimBuka} onClose={() => setKlaimBuka(false)} />
    </>
  );
}

// Kartu satu hari prakiraan (Premium): ikon cuaca dominan, rentang suhu, hujan, skor + kategori.
function KartuHari({ d, hariIni, urutan }: { d: HariTren; hariIni: boolean; urutan: number }) {
  const st: StatusRisiko = d.risk_status ?? (d.risk_score >= 75 ? "TINGGI" : d.risk_score >= 50 ? "SEDANG" : "RENDAH");
  const kat = KATEGORI[st];
  const h = fmtHari(d.date);
  const sebagian = d.records !== undefined && d.records < 8;
  return (
    <li className="masuk rounded-media bg-white p-6 shadow-tipis" style={{ "--tunda": `${urutan * 110}ms` } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] font-bold tracking-tight">{hariIni ? "Hari ini" : h?.hari ?? d.day}</p>
          {h && <p className="text-[14px] text-sekunder">{h.tanggal}</p>}
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-kertas text-kemasan" title={d.weather_desc ?? undefined}>
          <IkonCuaca desc={d.weather_desc} size={26} />
        </span>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <p className="angka text-[56px] font-extrabold leading-[0.85] tracking-[-0.05em]">{d.risk_score}</p>
        <p className="mb-1 rounded-full px-3 py-1 text-[13px] font-bold" style={{ color: kat.warna, background: kat.latar }}>
          {kat.label}
        </p>
      </div>
      <div aria-hidden="true" className="mt-4 h-2 overflow-hidden rounded-full bg-kertas-gelap">
        <div className="h-full rounded-full" style={{ width: `${d.risk_score}%`, background: kat.isi }} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-[14px]">
        <div className="flex items-center gap-2">
          <ThermometerSimpleIcon size={18} weight="duotone" aria-hidden="true" className="text-kemasan" />
          <dt className="sr-only">Suhu</dt>
          <dd className="angka">
            {d.temperature_min != null && d.temperature_max != null ? `${fmtAngka(d.temperature_min)}–${fmtAngka(d.temperature_max)}°C` : "–"}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <CloudRainIcon size={18} weight="duotone" aria-hidden="true" className="text-kemasan" />
          <dt className="sr-only">Hujan</dt>
          <dd className="angka">{d.precipitation_mm != null ? `${fmtAngka(d.precipitation_mm)} mm` : "–"}</dd>
        </div>
      </dl>
      {sebagian && (
        <p className="keterangan mt-4">
          Dari {d.records} prakiraan per 3 jam; {hariIni ? "sisa hari ini" : "BMKG belum merilis prakiraan lengkap untuk hari itu"}.
        </p>
      )}
    </li>
  );
}
