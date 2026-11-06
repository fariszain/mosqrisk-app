"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { toast } from 'react-hot-toast';

import Navbar from "@/components/Navbar";

// Harga, batas jumlah, dan mode pembayaran datang dari backend (GET /api/produk) —
// satu-satunya sumber harga ada di backend/main.py (HARGA_PER_BOTOL).
type InfoProduk = {
  nama: string;
  harga_per_botol: number;
  maks_per_pesanan: number;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-medium focus:outline-none focus:border-[#1A3626] focus:ring-4 focus:ring-[#1A3626]/10 transition-all text-gray-800 placeholder-gray-400";
const labelClass = "block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1";

export default function CheckoutPage() {
  const [produk, setProduk] = useState<InfoProduk | null>(null);
  const [gagalMuat, setGagalMuat] = useState(false);
  const [snapSiap, setSnapSiap] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [memproses, setMemproses] = useState(false);
  const [hasil, setHasil] = useState<HasilBayar | null>(null);
  const [orderId, setOrderId] = useState("");

  const muatProduk = useCallback(() => {
    setGagalMuat(false);
    fetch(`${API_URL}/api/produk`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProduk(data);
        else setGagalMuat(true);
      })
      .catch(() => setGagalMuat(true));
  }, []);

  useEffect(() => {
    muatProduk();
  }, [muatProduk]);

  const harga = produk?.harga_per_botol ?? 0;
  const maks = produk?.maks_per_pesanan ?? 1;
  const totalPrice = quantity * harga;
  const modeUjiCoba = produk ? produk.pembayaran.mode !== "produksi" : false;
  const clientKey = produk?.pembayaran.client_key || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  const ubahJumlah = (n: number) => {
    const bulat = Number.isFinite(n) ? Math.round(n) : 1;
    setQuantity(Math.min(Math.max(1, bulat), maks));
  };

  // Lokasi hanya diambil kalau pembeli menekan tombol (tidak otomatis saat halaman dibuka).
  const isiAlamatDariLokasi = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Browser tidak mendukung lokasi. Ketik alamat secara manual.");
      return;
    }
    setIsLoadingAddress(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            toast.success("Alamat terisi dari lokasimu. Lengkapi nomor rumah & patokan.");
          }
        } catch {
          toast.error("Gagal membaca lokasi. Ketik alamat secara manual.");
        } finally {
          setIsLoadingAddress(false);
        }
      },
      () => {
        toast.error("Izin lokasi ditolak. Ketik alamat secara manual.");
        setIsLoadingAddress(false);
      }
    );
  };

  // Status pembayaran selalu dicek ke server (yang bertanya langsung ke Midtrans).
  // dariTutup: dipanggil saat popup ditutup — kalau ternyata sudah dibayar (mis. QRIS), tetap tampil "diterima".
  const cekStatusPembayaran = async (id: string, dariTutup = false) => {
    let status: HasilBayar = "menunggu_pembayaran";
    try {
      const res = await fetch(`${API_URL}/api/payment/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      });
      const data = await res.json();
      if (data.success && data.status) status = data.status;
    } catch {
      // biarkan "menunggu_pembayaran" — status akan diperbarui lewat notifikasi Midtrans
    }
    if (status === "dibayar") {
      localStorage.setItem("isPremium", "true");
    }
    setHasil(dariTutup && status === "menunggu_pembayaran" ? "ditutup" : status);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produk) return;
    if (!snapSiap || !window.snap) {
      toast.error("Jendela pembayaran belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }
    setMemproses(true);
    const toastId = toast.loading("Menyiapkan pembayaran...");
    try {
      const res = await fetch(`${API_URL}/api/payment/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: address.trim(),
          quantity,
          expectedTotal: totalPrice
        })
      });
      const data = await res.json();
      toast.dismiss(toastId);

      if (res.status === 409) {
        toast.error(data.message || "Harga sudah diperbarui.");
        muatProduk();
        return;
      }
      if (res.status === 422) {
        toast.error("Periksa lagi nama, nomor HP, dan alamat pengiriman.");
        return;
      }
      if (!res.ok || !data.success || !data.token) {
        toast.error(data.message || "Gagal memproses pembayaran.");
        return;
      }

      const id = data.order_id as string;
      setOrderId(id);
      window.snap.pay(data.token, {
        onSuccess: () => { void cekStatusPembayaran(id); },
        onPending: () => { void cekStatusPembayaran(id); },
        onError: () => { setHasil("gagal"); },
        onClose: () => { void cekStatusPembayaran(id, true); }
      });
    } catch {
      toast.dismiss(toastId);
      toast.error("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setMemproses(false);
    }
  };

  const pesanHasil: Record<HasilBayar, { judul: string; isi: string }> = {
    dibayar: {
      judul: "Pembayaran diterima",
      isi: `Pesanan ${quantity} botol tercatat. Tim Patchmos akan menghubungi nomor HP yang kamu isi untuk mengatur pengiriman. Akses Premium MosqRisk juga aktif di perangkat ini.`
    },
    menunggu_pembayaran: {
      judul: "Menunggu pembayaran",
      isi: "Selesaikan pembayaran sesuai instruksi di jendela Midtrans. Status pesanan diperbarui setelah pembayaran terkonfirmasi."
    },
    gagal: {
      judul: "Pembayaran tidak berhasil",
      isi: "Pembayaran ditolak atau gagal diproses. Silakan coba lagi atau pilih metode lain."
    },
    batal: {
      judul: "Pembayaran dibatalkan",
      isi: "Transaksi dibatalkan atau kedaluwarsa. Kamu bisa membuat pesanan baru dari halaman ini."
    },
    ditutup: {
      judul: "Pembayaran belum selesai",
      isi: "Jendela pembayaran ditutup sebelum selesai. Pesanan tercatat dengan status menunggu pembayaran; kamu bisa mengulang dari halaman ini."
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] font-sans text-gray-800 pb-20">
      {produk && (
        <Script
          src={produk.pembayaran.snap_url}
          data-client-key={clientKey}
          strategy="afterInteractive"
          onReady={() => setSnapSiap(true)}
          onError={() => toast.error("Gagal memuat jendela pembayaran Midtrans. Periksa koneksi.")}
        />
      )}

      <Navbar />

      {/* Hero */}
      <div className="w-full bg-[#1A3626] pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight leading-tight">
            Beli Patchmos Spray
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
            Spray bio-repellent dengan bahan aktif dari ampas nilam Aceh. Tanpa DEET.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10">
        {modeUjiCoba && (
          <div role="status" className="mb-8 bg-[#FFF7E0] border border-[#EAC775] text-[#5C4A12] rounded-2xl p-4 md:p-5 text-sm md:text-[15px] leading-relaxed shadow-sm">
            <strong className="font-black">Mode uji coba.</strong> Pembayaran memakai sandbox Midtrans: tidak ada uang yang ditarik dan pesanan uji coba tidak dikirim.
          </div>
        )}

        {gagalMuat && (
          <div role="alert" className="mb-8 bg-white border border-red-200 text-red-700 rounded-2xl p-5 text-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between shadow-sm">
            <span>Harga tidak dapat dimuat. Periksa koneksi, lalu coba lagi.</span>
            <button type="button" onClick={muatProduk} className="bg-red-600 text-white font-bold px-5 py-3 rounded-xl min-h-[44px]">Muat ulang</button>
          </div>
        )}

        <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* KIRI: jumlah + data pengiriman */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">

            {/* 1. Jumlah */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#EAC775] text-[#1A3626] font-black text-xl flex items-center justify-center">1</div>
                <h2 className="font-black text-2xl text-[#1A3626] tracking-tight">Jumlah botol</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="font-bold text-lg text-[#1A3626]">Patchmos Spray 50 mL</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {produk ? `${rupiah(harga)} per botol` : gagalMuat ? "Harga belum tersedia" : "Memuat harga…"}
                  </p>
                </div>

                <div className="flex items-center gap-3" role="group" aria-label="Jumlah botol">
                  <button
                    type="button"
                    onClick={() => ubahJumlah(quantity - 1)}
                    disabled={!produk || quantity <= 1}
                    aria-label="Kurangi jumlah"
                    className="w-12 h-12 rounded-full border-2 border-[#1A3626] text-[#1A3626] text-2xl font-black flex items-center justify-center disabled:opacity-30 hover:bg-[#1A3626] hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maks}
                    value={quantity}
                    onChange={(e) => ubahJumlah(Number(e.target.value))}
                    disabled={!produk}
                    aria-label="Jumlah botol"
                    className="w-20 h-12 text-center text-xl font-black text-[#1A3626] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A3626] tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => ubahJumlah(quantity + 1)}
                    disabled={!produk || quantity >= maks}
                    aria-label="Tambah jumlah"
                    className="w-12 h-12 rounded-full border-2 border-[#1A3626] text-[#1A3626] text-2xl font-black flex items-center justify-center disabled:opacity-30 hover:bg-[#1A3626] hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              {produk && quantity >= maks && (
                <p className="text-xs text-gray-500 mt-4">Maksimal {maks} botol per pesanan online. Untuk jumlah lebih besar, hubungi mosqrisk.official@gmail.com.</p>
              )}
            </div>

            {/* 2. Data pengiriman */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#EAC775] text-[#1A3626] font-black text-xl flex items-center justify-center">2</div>
                <h2 className="font-black text-2xl text-[#1A3626] tracking-tight">Data pengiriman</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="nama" className={labelClass}>Nama lengkap</label>
                  <input id="nama" type="text" required minLength={2} maxLength={80} autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama penerima" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="hp" className={labelClass}>Nomor HP / WhatsApp</label>
                  <input id="hp" type="tel" required inputMode="tel" autoComplete="tel" pattern="\+?[0-9][0-9 \-]{6,18}" title="Hanya angka, minimal 8 digit" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Contoh: 081234567890" className={inputClass} />
                </div>
              </div>
              <div>
                <div className="flex items-end justify-between gap-3 mb-3">
                  <label htmlFor="alamat" className={`${labelClass} mb-0`}>Alamat lengkap</label>
                  <button type="button" onClick={isiAlamatDariLokasi} disabled={isLoadingAddress} className="text-sm font-bold text-[#1A3626] underline underline-offset-4 min-h-[44px] px-1 disabled:opacity-50">
                    {isLoadingAddress ? "Mencari lokasi…" : "Isi dari lokasi saya"}
                  </button>
                </div>
                <textarea id="alamat" required minLength={10} maxLength={400} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos, patokan." rows={3} className={`${inputClass} resize-none`}></textarea>
              </div>
            </div>
          </div>

          {/* KANAN: ringkasan */}
          <div className="col-span-1 lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-[#1A3626] rounded-[2rem] p-6 md:p-8 shadow-xl text-white">
              <h3 className="font-black mb-6 text-[#EAC775] uppercase tracking-widest text-[13px]">
                Ringkasan pesanan
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-bold">Patchmos Spray 50 mL <span className="text-[#EAC775]">×{quantity}</span></p>
                    <p className="text-[12px] text-white/70 mt-1">{produk ? `${rupiah(harga)} per botol` : "—"}</p>
                  </div>
                  <p className="text-sm font-black tabular-nums">{produk ? rupiah(totalPrice) : "—"}</p>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  Metode pembayaran (QRIS, e-wallet, transfer bank, dll.) dipilih di jendela Midtrans, sesuai yang tersedia.
                </p>
              </div>

              <div className="pt-6 border-t border-white/20 flex justify-between items-center mb-8">
                <p className="font-bold text-white/80 text-sm">Total</p>
                <p className="font-black text-3xl text-[#EAC775] tabular-nums">{produk ? rupiah(totalPrice) : "—"}</p>
              </div>

              <button
                type="submit"
                disabled={!produk || memproses}
                className="w-full bg-white text-[#1A3626] font-black text-lg py-4 rounded-[2rem] transition-colors hover:bg-[#EAC775] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]"
              >
                {memproses ? "Memproses…" : produk ? `Bayar ${rupiah(totalPrice)}` : "Memuat…"}
              </button>

              <p className="text-[12px] text-white/70 mt-5 leading-relaxed">
                Nama, nomor HP, dan alamat dipakai untuk memproses & mengirim pesanan. Lihat{" "}
                <Link href="/privasi" className="underline underline-offset-2 text-white">Kebijakan Privasi</Link>.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Hasil pembayaran */}
      {hasil && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="judul-hasil">
          <div className="bg-white max-w-sm w-full rounded-[2rem] p-8 text-center shadow-2xl">
            <h2 id="judul-hasil" className="text-2xl font-black text-[#1A3626] mb-3 tracking-tight">{pesanHasil[hasil].judul}</h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{pesanHasil[hasil].isi}</p>
            {modeUjiCoba && hasil === "dibayar" && (
              <p className="text-[#5C4A12] bg-[#FFF7E0] rounded-xl p-3 mb-4 text-xs leading-relaxed">Mode uji coba: tidak ada uang yang ditarik dan pesanan ini tidak dikirim.</p>
            )}
            {orderId && <p className="text-xs text-gray-500 mb-6">Nomor pesanan: <span className="font-mono font-bold">{orderId}</span></p>}
            <button onClick={() => setHasil(null)} className="w-full bg-[#1A3626] text-white font-black py-4 rounded-2xl hover:bg-[#0c1f13] transition-colors min-h-[48px]">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
