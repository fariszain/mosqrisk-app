"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowsClockwiseIcon, DownloadSimpleIcon } from "@phosphor-icons/react/ssr";
import { kelasTombol } from "@/components/ui/tombol";
import { PRODUK } from "@/lib/produk";
import { kelasInput } from "@/components/ui/bidang";

// Panel penjualan di /admin: satu tabel `orders` untuk pesanan online (checkout + Midtrans)
// dan penjualan offline yang dicatat manual. Semua aksi lewat backend (ADMIN_KEY).

type StatusPesanan = "menunggu_pembayaran" | "dibayar" | "dikirim" | "selesai" | "batal" | "gagal";

type Order = {
  id: number;
  created_at: string;
  channel: "online" | "offline";
  status: StatusPesanan;
  quantity: number;
  unit_price: number;
  total: number;
  customer_name?: string | null;
  phone?: string | null;
  address?: string | null;
  payment_method?: string | null;
  midtrans_order_id?: string | null;
  midtrans_status?: string | null;
  sold_at?: string | null;
  notes?: string | null;
  is_test?: boolean | null;
};

const LABEL_STATUS: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "Menunggu pembayaran",
  dibayar: "Dibayar",
  dikirim: "Dikirim",
  selesai: "Selesai",
  batal: "Batal",
  gagal: "Gagal",
};
const STATUS_TERJUAL: StatusPesanan[] = ["dibayar", "dikirim", "selesai"];
const METODE_OFFLINE = [
  { value: "tunai", label: "Tunai" },
  { value: "qris", label: "QRIS" },
  { value: "transfer", label: "Transfer bank" },
  { value: "lainnya", label: "Lainnya" },
];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

// Sel CSV aman untuk Excel/Sheets: teks buatan pembeli yang diawali = + - @ tidak boleh
// dieksekusi sebagai formula (CSV/formula injection).
export const selCSV = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
const hariIni = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const tanggalPesanan = (o: Order) =>
  new Date(o.sold_at || o.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" });

const kelasLabelKecil = "mb-1.5 block text-[14px] font-semibold";

export default function SalesPanel({ pin, apiUrl }: { pin: string; apiUrl: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [harga, setHarga] = useState<number | null>(PRODUK.harga);
  const [loading, setLoading] = useState(true);
  const [pesanError, setPesanError] = useState("");
  const [tampilkanUjiCoba, setTampilkanUjiCoba] = useState(false);

  const [jumlah, setJumlah] = useState(1);
  const [metode, setMetode] = useState("tunai");
  const [namaPembeli, setNamaPembeli] = useState("");
  const [catatan, setCatatan] = useState("");
  const [tanggal, setTanggal] = useState(hariIni);
  const [menyimpan, setMenyimpan] = useState(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${pin}`, "Content-Type": "application/json" }), [pin]);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders`, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data || []);
        setHarga(data.harga_per_botol ?? PRODUK.harga);
        setPesanError("");
      } else {
        setPesanError(data.message || "Gagal memuat data penjualan.");
      }
    } catch {
      setPesanError("Error jaringan saat memuat data penjualan.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, headers]);

  useEffect(() => {
    void muat();
  }, [muat]);

  const terlihat = orders.filter((o) => tampilkanUjiCoba || !o.is_test);
  const terjual = terlihat.filter((o) => STATUS_TERJUAL.includes(o.status));
  const ringkas = {
    botol: terjual.reduce((s, o) => s + o.quantity, 0),
    pendapatan: terjual.reduce((s, o) => s + o.total, 0),
    botolOnline: terjual.filter((o) => o.channel === "online").reduce((s, o) => s + o.quantity, 0),
    botolOffline: terjual.filter((o) => o.channel === "offline").reduce((s, o) => s + o.quantity, 0),
    menunggu: terlihat.filter((o) => o.status === "menunggu_pembayaran").length,
  };
  const jumlahUjiCoba = orders.filter((o) => o.is_test).length;

  const catatPenjualan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenyimpan(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          quantity: jumlah,
          paymentMethod: metode,
          customerName: namaPembeli.trim() || null,
          notes: catatan.trim() || null,
          soldAt: tanggal || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Tercatat: ${jumlah} botol (${rupiah(data.data.total)})`);
        setJumlah(1);
        setNamaPembeli("");
        setCatatan("");
        void muat();
      } else {
        toast.error(data.message || "Gagal mencatat penjualan.");
      }
    } catch {
      toast.error("Error koneksi ke server.");
    } finally {
      setMenyimpan(false);
    }
  };

  const ubahStatus = async (o: Order, status: StatusPesanan) => {
    if (status === o.status) return;
    const sebelumnya = orders;
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status } : x)));
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders/${o.id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(`Status pesanan #${o.id}: ${LABEL_STATUS[status]}`);
    } catch {
      setOrders(sebelumnya);
      toast.error("Status gagal diubah.");
    }
  };

  const cekMidtrans = async (o: Order) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/orders/${o.id}/sync`, { method: "POST", headers });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Status pembayaran: ${LABEL_STATUS[data.status as StatusPesanan] ?? data.status}`);
        void muat();
      } else {
        toast.error(data.message || "Gagal mengecek ke Midtrans.");
      }
    } catch {
      toast.error("Error koneksi ke server.");
    }
  };

  const eksporCSV = () => {
    if (!terlihat.length) return;
    const kolom: (keyof Order)[] = ["id", "created_at", "sold_at", "channel", "status", "quantity", "unit_price", "total", "payment_method", "customer_name", "phone", "address", "midtrans_order_id", "midtrans_status", "is_test", "notes"];
    const csv = [kolom.join(","), ...terlihat.map((o) => kolom.map((k) => selCSV(o[k])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "penjualan_patchmos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="judul-penjualan" className="overflow-hidden rounded-kartu bg-white shadow-tipis">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-garis px-5 py-4">
        <div>
          <h2 id="judul-penjualan" className="text-[18px] font-semibold">
            Penjualan
          </h2>
          <p className="mt-0.5 text-[14px] text-sekunder">
            Online (checkout web) dan offline (dicatat di sini). Harga satuan saat ini: {harga ? rupiah(harga) : "–"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {jumlahUjiCoba > 0 && (
            <label className="flex min-h-11 cursor-pointer select-none items-center gap-2 text-[14px]">
              <input type="checkbox" checked={tampilkanUjiCoba} onChange={(e) => setTampilkanUjiCoba(e.target.checked)} className="h-4 w-4 accent-[var(--kemasan)]" />
              Tampilkan {jumlahUjiCoba} pesanan uji coba
            </label>
          )}
          <button type="button" onClick={() => void muat()} className={kelasTombol("garis", "sm")}>
            <ArrowsClockwiseIcon size={18} aria-hidden="true" />
            Muat ulang
          </button>
          <button type="button" onClick={eksporCSV} disabled={!terlihat.length} className={kelasTombol("garis", "sm")}>
            <DownloadSimpleIcon size={18} aria-hidden="true" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {pesanError ? (
        <p role="alert" className="bg-risiko-tinggi-latar px-5 py-4 text-[15px] text-galat">
          {pesanError}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-px border-b border-garis bg-garis lg:grid-cols-4">
            {[
              { label: "Botol terjual", nilai: loading ? "…" : ringkas.botol.toLocaleString("id-ID") },
              { label: "Pendapatan", nilai: loading ? "…" : rupiah(ringkas.pendapatan) },
              { label: "Online / offline (botol)", nilai: loading ? "…" : `${ringkas.botolOnline} / ${ringkas.botolOffline}` },
              { label: "Menunggu pembayaran", nilai: loading ? "…" : String(ringkas.menunggu) },
            ].map((x) => (
              <div key={x.label} className="bg-white px-5 py-4">
                <dt className="text-[14px] text-sekunder">{x.label}</dt>
                <dd className="angka mt-1 text-[28px] font-extrabold leading-none tracking-[-0.04em]">{x.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="px-5 pt-3 text-[13px] text-sekunder">
            Dihitung dari pesanan berstatus Dibayar, Dikirim, atau Selesai{tampilkanUjiCoba ? " (termasuk uji coba)" : ""}.
          </p>

          <form onSubmit={catatPenjualan} className="border-b border-garis px-5 py-5">
            <h3 className="text-[16px] font-semibold">Catat penjualan offline</h3>
            <div className="mt-4 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <label htmlFor="jumlah-offline" className={kelasLabelKecil}>Jumlah botol</label>
                <input id="jumlah-offline" type="number" inputMode="numeric" min={1} max={500} required value={jumlah} onChange={(e) => setJumlah(Math.max(1, Math.min(500, Math.round(Number(e.target.value)) || 1)))} className={kelasInput} />
              </div>
              <div>
                <label htmlFor="metode-offline" className={kelasLabelKecil}>Metode bayar</label>
                <select id="metode-offline" value={metode} onChange={(e) => setMetode(e.target.value)} className={kelasInput}>
                  {METODE_OFFLINE.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tanggal-offline" className={kelasLabelKecil}>Tanggal</label>
                <input id="tanggal-offline" type="date" required max={hariIni()} value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={kelasInput} />
              </div>
              <div>
                <label htmlFor="nama-offline" className={kelasLabelKecil}>Nama pembeli (opsional)</label>
                <input id="nama-offline" type="text" maxLength={80} value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} className={kelasInput} />
              </div>
              <div>
                <label htmlFor="catatan-offline" className={kelasLabelKecil}>Catatan (opsional)</label>
                <input id="catatan-offline" type="text" maxLength={300} placeholder="mis. booth expo" value={catatan} onChange={(e) => setCatatan(e.target.value)} className={kelasInput} />
              </div>
              <button type="submit" disabled={menyimpan || !harga} className={kelasTombol("utama", "sm", "min-h-12 w-full whitespace-nowrap")}>
                {menyimpan ? "Menyimpan…" : `Catat ${harga ? rupiah(jumlah * harga) : ""}`}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead className="bg-kertas text-sekunder">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Tanggal</th>
                  <th scope="col" className="px-5 py-3 font-medium">Kanal</th>
                  <th scope="col" className="px-5 py-3 font-medium">Pembeli</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Jumlah</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sekunder">Memuat data penjualan…</td>
                  </tr>
                )}
                {!loading && terlihat.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sekunder">Belum ada penjualan tercatat.</td>
                  </tr>
                )}
                {!loading &&
                  terlihat.map((o) => (
                    <tr key={o.id} className="border-t border-garis align-top">
                      <td className="whitespace-nowrap px-5 py-3 angka">{tanggalPesanan(o)}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="font-semibold">{o.channel === "online" ? "Online" : "Offline"}</span>
                        {o.is_test && <span className="ml-2 rounded-kontrol bg-peringatan-latar px-1.5 py-0.5 text-[12px] font-semibold text-peringatan-teks">uji coba</span>}
                        <div className="mt-1 text-[13px] text-sekunder">{o.payment_method || "–"}</div>
                        {o.midtrans_status && <div className="text-[13px] text-sekunder">Midtrans: {o.midtrans_status}</div>}
                      </td>
                      <td className="max-w-xs px-5 py-3">
                        <div className="font-medium">{o.customer_name || "–"}</div>
                        {o.phone && <div className="mt-1 text-[13px] text-sekunder">{o.phone}</div>}
                        {o.address && <div className="mt-1 text-[13px] leading-relaxed text-sekunder">{o.address}</div>}
                        {o.notes && <div className="mt-1 text-[13px] italic text-sekunder">{o.notes}</div>}
                      </td>
                      <td className="px-5 py-3 text-right angka">{o.quantity}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-semibold angka">{rupiah(o.total)}</td>
                      <td className="px-5 py-2">
                        <select
                          aria-label={`Status pesanan #${o.id}`}
                          value={o.status}
                          onChange={(e) => void ubahStatus(o, e.target.value as StatusPesanan)}
                          className="min-h-11 rounded-kontrol border border-garis-kuat bg-white px-2 text-[14px]"
                        >
                          {(Object.keys(LABEL_STATUS) as StatusPesanan[]).map((st) => (
                            <option key={st} value={st}>{LABEL_STATUS[st]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-2 text-right">
                        {o.channel === "online" && o.midtrans_order_id && (
                          <button type="button" onClick={() => void cekMidtrans(o)} title={o.midtrans_order_id} className="tautan inline-flex min-h-11 items-center whitespace-nowrap font-semibold">
                            Cek Midtrans
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
