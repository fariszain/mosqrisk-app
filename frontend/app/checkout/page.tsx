"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  CopyIcon,
  CrosshairIcon,
  HourglassIcon,
  LockKeyIcon,
  MinusIcon,
  PlusIcon,
  StorefrontIcon,
  TruckIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Catatan from "@/components/ui/Catatan";
import HeroHalaman from "@/components/ui/HeroHalaman";
import Dialog from "@/components/ui/Dialog";
import { kelasTombol } from "@/components/ui/tombol";
import { kelasInput, kelasLabel, kelasPetunjuk } from "@/components/ui/bidang";
import { PRODUK, bacaPengiriman, rupiah, teksOngkir, type KodeKirim } from "@/lib/produk";
import { aktifkanPremium } from "@/lib/premium";

// Harga tampil langsung dari backend/produk.json (di-inline saat build, lihat lib/produk.ts),
// jadi tetap terlihat walau backend mati. Konfigurasi Snap & harga otoritatif tetap dari
// GET /api/produk, dan total yang DITAGIH selalu dihitung ulang di server.
type InfoProduk = {
  nama: string;
  harga_per_botol: number;
  maks_per_pesanan: number;
  pengiriman?: unknown;
  pembayaran: { mode: "produksi" | "uji_coba"; snap_url: string; client_key: string };
};

type HasilBayar = "dibayar" | "menunggu_pembayaran" | "gagal" | "batal" | "ditutup";

type SnapCallbacks = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapCallbacks) => void };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ORDER_ID_RE = /^MOSQ-\d{14}-[0-9a-f]{8}$/;
const POLA_HP = /^\+?[0-9][0-9 \-]{6,18}$/; // sama dengan validasi backend (PaymentRequest)
const STATUS_LUNAS = ["dibayar", "diproses", "dikirim", "selesai"];

const PESAN: Record<HasilBayar, { judul: string; isi: string }> = {
  dibayar: {
    judul: "Pembayaran diterima",
    isi: "Tim Patchmos akan menghubungi nomor HP yang kamu isi untuk mengatur pengiriman atau pengambilan. Akses Premium MosqRisk juga aktif di perangkat ini.",
  },
  menunggu_pembayaran: {
    judul: "Menunggu pembayaran",
    isi: "Selesaikan pembayaran sesuai instruksi di jendela Midtrans. Status pesanan berubah setelah pembayaran terkonfirmasi.",
  },
  gagal: {
    judul: "Pembayaran tidak berhasil",
    isi: "Pembayaran ditolak atau gagal diproses. Coba lagi, atau pilih metode pembayaran lain.",
  },
  batal: {
    judul: "Pembayaran dibatalkan",
    isi: "Transaksi dibatalkan atau kedaluwarsa. Kamu bisa membuat pesanan baru dari halaman ini.",
  },
  ditutup: {
    judul: "Pembayaran belum selesai",
    isi: "Jendela pembayaran ditutup sebelum selesai. Pesanan tercatat dengan status menunggu pembayaran; kamu bisa mengulang dari halaman ini.",
  },
};

type Galat = Partial<Record<"nama" | "hp" | "alamat", string>>;

export default function CheckoutPage() {
  const [produk, setProduk] = useState<InfoProduk | null>(null);
  const [statusProduk, setStatusProduk] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [snapSiap, setSnapSiap] = useState(false);
  const [snapGagal, setSnapGagal] = useState(false);
  const [jumlah, setJumlah] = useState(1);
  const [teksJumlah, setTeksJumlah] = useState("1");
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kirim, setKirim] = useState<KodeKirim>("antar");
  const [galat, setGalat] = useState<Galat>({});
  const [infoAlamat, setInfoAlamat] = useState("");
  const [cariLokasi, setCariLokasi] = useState(false);
  const [memproses, setMemproses] = useState(false);
  const [pesanKirim, setPesanKirim] = useState("");
  const [hasil, setHasil] = useState<HasilBayar | null>(null);
  const [orderId, setOrderId] = useState("");
  const [mengecek, setMengecek] = useState(false);
  const [tersalin, setTersalin] = useState(false);
  const refNama = useRef<HTMLInputElement>(null);
  const refHp = useRef<HTMLInputElement>(null);
  const refAlamat = useRef<HTMLTextAreaElement>(null);

  const harga = produk?.harga_per_botol ?? PRODUK.harga;
  const maks = produk?.maks_per_pesanan ?? PRODUK.maks ?? 1;
  const opsiKirim = bacaPengiriman(produk?.pengiriman) ?? PRODUK.pengiriman;
  const kodeKirim: KodeKirim | null = opsiKirim?.[kirim] ? kirim : opsiKirim?.antar ? "antar" : opsiKirim?.ambil ? "ambil" : null;
  const ongkir = kodeKirim && opsiKirim?.[kodeKirim] ? opsiKirim[kodeKirim]!.ongkir : 0;
  const perluAlamat = kodeKirim !== "ambil";
  const subtotal = harga ? jumlah * harga : null;
  const total = subtotal !== null ? subtotal + ongkir : null;
  const namaProduk = produk?.nama ?? PRODUK.nama ?? "Patchmos Spray";
  const modeUjiCoba = produk?.pembayaran.mode === "uji_coba";
  const clientKey = produk?.pembayaran.client_key || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const bisaBayar = statusProduk === "siap" && !!total;

  const muatProduk = useCallback(async () => {
    setStatusProduk("memuat");
    try {
      const res = await fetch(`${API_URL}/api/produk`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("produk");
      setProduk(data);
      setStatusProduk("siap");
    } catch {
      setStatusProduk("gagal");
    }
  }, []);

  useEffect(() => {
    void muatProduk();
  }, [muatProduk]);

  const ubahJumlah = (n: number) => {
    const bulat = Number.isFinite(n) ? Math.round(n) : 1;
    const j = Math.min(Math.max(1, bulat), maks);
    setJumlah(j);
    setTeksJumlah(String(j));
  };

  // Status pembayaran selalu dicek ke server (yang bertanya langsung ke Midtrans).
  const cekStatus = useCallback(async (id: string, dariTutup = false) => {
    setMengecek(true);
    let status = "menunggu_pembayaran";
    try {
      const res = await fetch(`${API_URL}/api/payment/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (data.success && data.status) status = data.status;
    } catch {
      // biarkan "menunggu" — status diperbarui lewat notifikasi Midtrans
    }
    setMengecek(false);
    const akhir: HasilBayar = STATUS_LUNAS.includes(status)
      ? "dibayar"
      : status === "gagal" || status === "batal"
        ? status
        : dariTutup
          ? "ditutup"
          : "menunggu_pembayaran";
    if (akhir === "dibayar") aktifkanPremium();
    setHasil(akhir);
  }, []);

  // Kembali dari aplikasi pembayaran (callbacks.finish Midtrans): /checkout?order_id=...
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order_id");
    if (id && ORDER_ID_RE.test(id)) {
      setOrderId(id);
      void cekStatus(id);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [cekStatus]);

  // Lokasi hanya diambil kalau pembeli menekan tombol (tidak otomatis saat halaman dibuka).
  const isiDariLokasi = () => {
    setInfoAlamat("");
    if (!("geolocation" in navigator)) {
      setGalat((g) => ({ ...g, alamat: "Browser ini tidak bisa membaca lokasi. Ketik alamat secara manual." }));
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
          setAlamat(data.display_name);
          setGalat((g) => ({ ...g, alamat: undefined }));
          setInfoAlamat("Alamat terisi dari lokasimu. Tambahkan nomor rumah dan patokan.");
        } catch {
          setGalat((g) => ({ ...g, alamat: "Lokasi tidak bisa diubah menjadi alamat. Ketik alamat secara manual." }));
        } finally {
          setCariLokasi(false);
        }
      },
      () => {
        setCariLokasi(false);
        setGalat((g) => ({ ...g, alamat: "Izin lokasi ditolak. Ketik alamat secara manual." }));
      },
      { timeout: 15000 }
    );
  };

  const validasi = (): Galat => {
    const g: Galat = {};
    if (nama.trim().length < 2) g.nama = "Isi nama penerima.";
    if (!POLA_HP.test(hp.trim())) g.hp = "Isi nomor HP yang aktif, contohnya 081234567890.";
    if (perluAlamat && alamat.trim().length < 10) g.alamat = "Isi alamat lengkap: jalan, nomor rumah, kelurahan, kecamatan, kota.";
    return g;
  };

  const bayar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanKirim("");
    const g = validasi();
    setGalat(g);
    if (g.nama) return refNama.current?.focus();
    if (g.hp) return refHp.current?.focus();
    if (g.alamat) return refAlamat.current?.focus();
    if (statusProduk === "memuat") {
      setPesanKirim("Pembayaran sedang disiapkan. Tunggu sebentar, lalu tekan Bayar lagi.");
      return;
    }
    if (!bisaBayar || !total) {
      setPesanKirim("Pembayaran online sedang tidak tersedia. Tekan Coba lagi di atas, atau pesan lewat email.");
      return;
    }
    if (!snapSiap || !window.snap) {
      setPesanKirim(
        snapGagal
          ? "Jendela pembayaran Midtrans gagal dimuat. Periksa koneksi, lalu muat ulang halaman."
          : "Jendela pembayaran sedang disiapkan. Tunggu sebentar, lalu tekan Bayar lagi."
      );
      return;
    }
    setMemproses(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nama.trim(),
          phone: hp.trim(),
          address: perluAlamat ? alamat.trim() : undefined,
          delivery: kodeKirim ?? "antar",
          quantity: jumlah,
          expectedTotal: total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setPesanKirim(data.message || "Harga sudah diperbarui. Periksa total, lalu tekan Bayar lagi.");
        await muatProduk();
        return;
      }
      if (res.status === 422) {
        setPesanKirim(data.message && typeof data.message === "string" ? data.message : "Periksa lagi nama, nomor HP, dan alamat pengiriman.");
        return;
      }
      if (!res.ok || !data.success || !data.token) {
        setPesanKirim(data.message || "Pembayaran belum bisa dibuat. Coba lagi beberapa saat lagi.");
        return;
      }
      const id = data.order_id as string;
      setOrderId(id);
      window.snap.pay(data.token, {
        onSuccess: () => void cekStatus(id),
        onPending: () => void cekStatus(id),
        onError: () => setHasil("gagal"),
        onClose: () => void cekStatus(id, true),
      });
    } catch {
      setPesanKirim("Server tidak bisa dihubungi. Periksa koneksi internet, lalu coba lagi.");
    } finally {
      setMemproses(false);
    }
  };

  const salinNomor = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      setTersalin(false);
    }
  };

  const tombolBayar = memproses ? "Menyiapkan pembayaran…" : total ? `Bayar ${rupiah(total)}` : "Bayar";

  const LANGKAH = ["Isi pesanan", "Bayar lewat Midtrans", kodeKirim === "ambil" ? "Ambil pesanan" : "Pesanan diantar"];

  return (
    <>
      {produk && (
        <Script
          src={produk.pembayaran.snap_url}
          data-client-key={clientKey}
          strategy="afterInteractive"
          onReady={() => setSnapSiap(true)}
          onError={() => setSnapGagal(true)}
        />
      )}

      <Navbar />
      <main id="konten" className="flex-1 bg-kertas">
        <HeroHalaman
          id="judul-beli"
          label="Pembelian"
          Ikon={ShoppingBagIcon}
          judul={
            <>
              Beli <span className="teks-foil">Patchmos Spray</span>
            </>
          }
          pengantar="Spray bio-repellent dengan bahan aktif dari ampas nilam Aceh, tanpa DEET. Bayar lewat Midtrans; tim Patchmos menghubungimu lewat nomor HP."
          aksi={
            <ol className="flex flex-wrap justify-center gap-2">
              {LANGKAH.map((l, i) => (
                <li
                  key={l}
                  className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[14px] font-semibold ${
                    i === 0 ? "bg-white text-tinta" : "border border-white/20 text-pucat"
                  }`}
                >
                  <span className={`angka grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold ${i === 0 ? "bg-foil text-tinta" : "bg-white/10 text-white"}`}>
                    {i + 1}
                  </span>
                  {l}
                </li>
              ))}
            </ol>
          }
          bawah={
            modeUjiCoba || statusProduk === "gagal" ? (
              <div className="wadah -mt-4 space-y-4 pb-10 md:-mt-8 md:pb-14">
            {modeUjiCoba && (
              <Catatan nada="peringatan" className="mx-auto max-w-[56rem]" judul="Mode uji coba">
                Pembayaran memakai sandbox Midtrans: tidak ada uang yang ditarik dan pesanan uji coba tidak dikirim.
              </Catatan>
            )}
            {statusProduk === "gagal" && (
              <Catatan
                nada="galat"
                className="mx-auto max-w-[56rem]"
                judul="Pembayaran online sedang tidak tersedia"
                aksi={
                  <button type="button" onClick={() => void muatProduk()} className={kelasTombol("garis", "sm", "bg-white")}>
                    Coba lagi
                  </button>
                }
              >
                Server pembayaran tidak bisa dihubungi.{harga ? ` Harga tetap ${rupiah(harga)} per botol.` : ""} Untuk memesan sekarang, kirim email ke{" "}
                <a href="mailto:mosqrisk.official@gmail.com" className="tautan font-semibold">
                  mosqrisk.official@gmail.com
                </a>
                .
              </Catatan>
            )}
              </div>
            ) : null
          }
        />

        <form id="form-checkout" onSubmit={bayar} noValidate className="wadah grid gap-6 py-8 md:py-12 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-5 lg:col-span-7">
            {/* Produk & jumlah */}
            <section aria-labelledby="judul-produk" className="rounded-media bg-white p-5 shadow-tipis md:p-8">
              <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
                <div className="relative overflow-hidden rounded-kartu bg-hutan">
                  <Image src="/foto/nilam-daun.webp" alt="" fill sizes="240px" className="object-cover opacity-35" />
                  <Image
                    src="/brand/patchmos-produk.png"
                    alt="Botol dan kotak Patchmos Spray"
                    width={1471}
                    height={1236}
                    sizes="(min-width: 640px) 240px, 92vw"
                    priority
                    className="relative mx-auto h-auto w-full max-w-[240px] p-3"
                  />
                </div>
                <div>
                  <h2 id="judul-produk" className="text-[24px] font-extrabold leading-tight tracking-tight">
                    {namaProduk}
                  </h2>
                  <p className="mt-1 text-[17px] font-semibold text-kemasan angka">{harga ? `${rupiah(harga)} per botol` : "Harga sedang dimuat…"}</p>
                  <ul className="mt-4 space-y-1.5 text-[14.5px] text-sekunder">
                    <li>Bahan aktif ekstrak ampas nilam, dimikroenkapsulasi</li>
                    <li>Tanpa DEET</li>
                    <li>Kode QR di kemasan membuka Premium MosqRisk</li>
                    <li>Simpan di suhu di bawah 30°C</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-garis pt-5">
                <div>
                  <label htmlFor="jumlah" className="text-[15px] font-semibold">
                    Jumlah botol
                  </label>
                  <p id="petunjuk-jumlah" className={kelasPetunjuk}>
                    Maks. {maks} botol per pesanan online.
                  </p>
                </div>
                <div className="flex items-center rounded-full border-[1.5px] border-garis bg-white p-1">
                  <button
                    type="button"
                    aria-label="Kurangi satu botol"
                    onClick={() => ubahJumlah(jumlah - 1)}
                    disabled={jumlah <= 1}
                    className="grid h-11 w-11 place-items-center rounded-full text-kemasan transition-colors hover:bg-kertas active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <MinusIcon size={18} weight="bold" aria-hidden="true" />
                  </button>
                  <input
                    id="jumlah"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={teksJumlah}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setTeksJumlah(v);
                      const n = Number(v);
                      if (v && n >= 1) setJumlah(Math.min(n, maks));
                    }}
                    onBlur={() => ubahJumlah(Number(teksJumlah) || 1)}
                    aria-describedby="petunjuk-jumlah"
                    className="angka h-11 w-14 bg-transparent text-center text-[19px] font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Tambah satu botol"
                    onClick={() => ubahJumlah(jumlah + 1)}
                    disabled={jumlah >= maks}
                    className="grid h-11 w-11 place-items-center rounded-full bg-kemasan text-white transition-colors hover:bg-kemasan-gelap active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <PlusIcon size={18} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            {/* Pengiriman */}
            {opsiKirim && (
              <section aria-labelledby="judul-pengiriman" className="rounded-media bg-white p-5 shadow-tipis md:p-8">
                <h2 id="judul-pengiriman" className="text-[20px] font-bold tracking-tight">
                  Cara menerima pesanan
                </h2>
                <div role="radiogroup" aria-labelledby="judul-pengiriman" className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(["antar", "ambil"] as KodeKirim[]).map((k) => {
                    const o = opsiKirim[k];
                    if (!o) return null;
                    const dipilih = kodeKirim === k;
                    const Ikon = k === "antar" ? TruckIcon : StorefrontIcon;
                    return (
                      <label
                        key={k}
                        className={`relative flex cursor-pointer gap-3 rounded-kartu border-[1.5px] p-4 transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-kemasan/20 ${
                          dipilih ? "border-kemasan bg-kertas" : "border-garis hover:border-garis-kuat"
                        }`}
                      >
                        <input type="radio" name="pengiriman" value={k} checked={dipilih} onChange={() => setKirim(k)} className="sr-only" />
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${dipilih ? "bg-kemasan text-white" : "bg-kertas text-kemasan"}`}
                        >
                          <Ikon size={22} weight="duotone" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-[16px] font-bold">{o.label}</span>
                            <span className={`shrink-0 text-[14px] font-bold ${o.ongkir ? "text-tinta" : "text-risiko-rendah"}`}>{teksOngkir(o.ongkir)}</span>
                          </span>
                          <span className="mt-1 block text-[14px] leading-relaxed text-sekunder">{o.keterangan}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-sekunder">
                  Di luar Banda Aceh dan Aceh Besar? Kirim email ke{" "}
                  <a href="mailto:mosqrisk.official@gmail.com" className="tautan font-semibold text-kemasan">
                    mosqrisk.official@gmail.com
                  </a>{" "}
                  untuk menanyakan pengiriman.
                </p>
              </section>
            )}

            {/* Data penerima */}
            <section aria-labelledby="judul-kirim" className="rounded-media bg-white p-5 shadow-tipis md:p-8">
              <h2 id="judul-kirim" className="text-[20px] font-bold tracking-tight">
                {perluAlamat ? "Data penerima" : "Data pemesan"}
              </h2>
              <p className="mt-1 text-[14.5px] text-sekunder">Dipakai tim Patchmos untuk memproses pesanan dan menghubungimu.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nama" className={kelasLabel}>
                    {perluAlamat ? "Nama penerima" : "Nama"}
                  </label>
                  <input
                    ref={refNama}
                    id="nama"
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    aria-invalid={!!galat.nama}
                    aria-describedby={galat.nama ? "galat-nama" : undefined}
                    className={kelasInput}
                  />
                  {galat.nama && (
                    <p id="galat-nama" className="mt-1.5 text-[14px] text-galat">
                      {galat.nama}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="hp" className={kelasLabel}>
                    Nomor HP / WhatsApp
                  </label>
                  <input
                    ref={refHp}
                    id="hp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="081234567890"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    aria-invalid={!!galat.hp}
                    aria-describedby={galat.hp ? "galat-hp" : undefined}
                    className={kelasInput}
                  />
                  {galat.hp && (
                    <p id="galat-hp" className="mt-1.5 text-[14px] text-galat">
                      {galat.hp}
                    </p>
                  )}
                </div>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out sm:col-span-2 ${perluAlamat ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  inert={!perluAlamat}
                >
                  <div className="overflow-hidden px-1 pb-1">
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4">
                      <label htmlFor="alamat" className={`${kelasLabel} mb-0`}>
                        Alamat lengkap
                      </label>
                      <button
                        type="button"
                        onClick={isiDariLokasi}
                        disabled={cariLokasi}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[14.5px] font-semibold text-kemasan transition-colors hover:bg-kertas disabled:opacity-60"
                      >
                        <CrosshairIcon size={18} weight="duotone" aria-hidden="true" className={cariLokasi ? "animate-spin" : ""} />
                        {cariLokasi ? "Mencari lokasi…" : "Isi dari lokasi saya"}
                      </button>
                    </div>
                    <textarea
                      ref={refAlamat}
                      id="alamat"
                      rows={3}
                      maxLength={400}
                      autoComplete="street-address"
                      placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos, patokan"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      aria-invalid={!!galat.alamat}
                      aria-describedby={galat.alamat ? "galat-alamat" : infoAlamat ? "info-alamat" : undefined}
                      className={`${kelasInput} resize-y`}
                    />
                    {galat.alamat ? (
                      <p id="galat-alamat" className="mt-1.5 text-[14px] text-galat">
                        {galat.alamat}
                      </p>
                    ) : (
                      infoAlamat && (
                        <p id="info-alamat" className={kelasPetunjuk}>
                          {infoAlamat}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Ringkasan */}
          <aside aria-labelledby="judul-ringkasan" className="self-start lg:sticky lg:top-24 lg:col-span-5">
            <div className="permukaan-gelap overflow-hidden rounded-media bg-hutan text-white shadow-angkat">
              <div className="p-6 md:p-8">
                <h2 id="judul-ringkasan" className="text-[22px] font-extrabold tracking-tight">
                  Ringkasan pesanan
                </h2>
                <dl className="mt-5 space-y-3 text-[15px]">
                  <div className="flex justify-between gap-4">
                    <dt>
                      {namaProduk} <span className="angka text-pucat">× {jumlah}</span>
                    </dt>
                    <dd className="angka shrink-0">{subtotal !== null ? rupiah(subtotal) : "–"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-pucat">
                      Ongkos kirim{kodeKirim && opsiKirim?.[kodeKirim] ? <span className="block text-[13px]">{opsiKirim[kodeKirim]!.label}</span> : null}
                    </dt>
                    <dd className={`angka shrink-0 ${ongkir ? "" : "font-semibold text-pucuk"}`}>{opsiKirim ? teksOngkir(ongkir) : "Diatur tim"}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-white/12 pt-4">
                    <dt className="font-semibold">Total dibayar</dt>
                    <dd key={total ?? 0} className="angka ganti-isi text-[34px] font-extrabold leading-none tracking-[-0.04em] text-foil">
                      {total ? rupiah(total) : "–"}
                    </dd>
                  </div>
                </dl>
                <button type="submit" disabled={memproses || statusProduk === "gagal"} className={kelasTombol("foil", "lg", "mt-7 w-full")}>
                  <LockKeyIcon size={20} weight="duotone" aria-hidden="true" />
                  {tombolBayar}
                </button>
                {pesanKirim && (
                  <p role="alert" className="mt-3 rounded-kontrol bg-risiko-tinggi-latar px-3 py-2.5 text-[14px] leading-relaxed text-galat">
                    {pesanKirim}
                  </p>
                )}
              </div>
              <div className="space-y-2 border-t border-white/10 bg-white/[0.04] px-6 py-5 text-[13px] leading-relaxed text-pucat md:px-8">
                <p>Pembayaran diproses Midtrans. Pilih QRIS, e-wallet, atau transfer bank di jendela pembayaran, sesuai yang tersedia.</p>
                <p>
                  Nama, nomor HP, dan alamat hanya dipakai untuk memproses pesanan.{" "}
                  <Link href="/privasi" className="tautan text-white">
                    Kebijakan privasi
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        </form>
      </main>
      <Footer />
      <div aria-hidden="true" className="h-3 md:h-[76px] lg:hidden" />

      {/* Bar bayar di layar kecil (ringkasan ada di bawah formulir) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <p className="text-[13px] text-sekunder">Total dibayar{ongkir === 0 && opsiKirim ? ", ongkir gratis" : ""}</p>
            <p className="angka text-[21px] font-extrabold leading-tight tracking-tight">{total ? rupiah(total) : "–"}</p>
          </div>
          <button type="submit" form="form-checkout" disabled={memproses || statusProduk === "gagal"} className={kelasTombol("utama")}>
            {memproses ? "Memproses…" : "Bayar"}
          </button>
        </div>
      </div>

      <Dialog terbuka={!!hasil} onTutup={() => setHasil(null)} judul={hasil ? PESAN[hasil].judul : ""}>
        {hasil && (
          <div>
            <div className="flex gap-3">
              {hasil === "dibayar" ? (
                <CheckCircleIcon size={30} weight="duotone" aria-hidden="true" className="shrink-0 text-risiko-rendah" />
              ) : hasil === "menunggu_pembayaran" || hasil === "ditutup" ? (
                <HourglassIcon size={30} weight="duotone" aria-hidden="true" className="shrink-0 text-risiko-sedang" />
              ) : (
                <XCircleIcon size={30} weight="duotone" aria-hidden="true" className="shrink-0 text-galat" />
              )}
              <p className="text-[16px] leading-relaxed">{PESAN[hasil].isi}</p>
            </div>
            {orderId && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-kontrol bg-kertas px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] text-sekunder">Nomor pesanan</p>
                  <p className="break-all font-mono text-[15px] font-semibold">{orderId}</p>
                </div>
                <button type="button" onClick={salinNomor} className={kelasTombol("garis", "sm", "shrink-0 bg-white")}>
                  <CopyIcon size={18} aria-hidden="true" />
                  {tersalin ? "Tersalin" : "Salin"}
                </button>
              </div>
            )}
            {modeUjiCoba && hasil === "dibayar" && (
              <Catatan nada="peringatan" className="mt-4">
                Mode uji coba: tidak ada uang yang ditarik dan pesanan ini tidak dikirim.
              </Catatan>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {hasil === "menunggu_pembayaran" && orderId && (
                <button type="button" onClick={() => void cekStatus(orderId)} disabled={mengecek} className={kelasTombol("garis")}>
                  {mengecek ? "Mengecek…" : "Cek status lagi"}
                </button>
              )}
              {hasil === "dibayar" ? (
                <Link href="/pantau" className={kelasTombol("utama")}>
                  Buka pantauan risiko
                </Link>
              ) : (
                <button type="button" onClick={() => setHasil(null)} className={kelasTombol("utama")}>
                  Tutup
                </button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
