"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

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

const fieldClass = "w-full bg-[#F4F7F4] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:bg-white transition-colors";

export default function SalesPanel({ pin, apiUrl }: { pin: string; apiUrl: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [harga, setHarga] = useState<number | null>(null);
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
        setHarga(data.harga_per_botol ?? null);
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
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10" aria-labelledby="judul-penjualan">
      <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 id="judul-penjualan" className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <span className="w-3 h-8 bg-[#1A3626] rounded-full inline-block mr-1"></span>
            Penjualan
          </h3>
          <p className="text-gray-500 text-sm mt-1 ml-6">
            Online (checkout web) dan offline (dicatat di sini). Harga satuan saat ini: {harga ? rupiah(harga) : "—"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {jumlahUjiCoba > 0 && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input type="checkbox" checked={tampilkanUjiCoba} onChange={(e) => setTampilkanUjiCoba(e.target.checked)} className="w-4 h-4 accent-[#1A3626]" />
              Tampilkan {jumlahUjiCoba} pesanan uji coba
            </label>
          )}
          <button onClick={eksporCSV} className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition-shadow">
            Export CSV
          </button>
        </div>
      </div>

      {pesanError ? (
        <div className="p-8 text-sm text-red-700 bg-red-50 border-b border-red-100">{pesanError}</div>
      ) : (
        <>
          {/* Ringkasan */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border-b border-gray-100">
            {[
              { label: "Botol terjual", nilai: loading ? "…" : String(ringkas.botol) },
              { label: "Pendapatan", nilai: loading ? "…" : rupiah(ringkas.pendapatan) },
              { label: "Online / offline (botol)", nilai: loading ? "…" : `${ringkas.botolOnline} / ${ringkas.botolOffline}` },
              { label: "Menunggu pembayaran", nilai: loading ? "…" : String(ringkas.menunggu) },
            ].map((s) => (
              <div key={s.label} className="bg-white px-6 py-5">
                <dt className="text-xs text-gray-500 font-medium mb-1">{s.label}</dt>
                <dd className="text-2xl font-bold text-gray-900 tabular-nums">{s.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="px-6 md:px-8 pt-3 text-xs text-gray-400">Dihitung dari pesanan berstatus Dibayar, Dikirim, atau Selesai{tampilkanUjiCoba ? " (termasuk uji coba)" : ""}.</p>

          {/* Form penjualan offline */}
          <form onSubmit={catatPenjualan} className="px-6 md:px-8 py-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4">Catat penjualan offline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div>
                <label htmlFor="jumlah-offline" className="block text-xs font-semibold text-gray-500 mb-1.5">Jumlah botol</label>
                <input id="jumlah-offline" type="number" min={1} max={500} required value={jumlah} onChange={(e) => setJumlah(Math.max(1, Math.min(500, Math.round(Number(e.target.value)) || 1)))} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="metode-offline" className="block text-xs font-semibold text-gray-500 mb-1.5">Metode bayar</label>
                <select id="metode-offline" value={metode} onChange={(e) => setMetode(e.target.value)} className={fieldClass}>
                  {METODE_OFFLINE.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tanggal-offline" className="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal</label>
                <input id="tanggal-offline" type="date" required max={hariIni()} value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="nama-offline" className="block text-xs font-semibold text-gray-500 mb-1.5">Nama pembeli (opsional)</label>
                <input id="nama-offline" type="text" maxLength={80} value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="catatan-offline" className="block text-xs font-semibold text-gray-500 mb-1.5">Catatan (opsional)</label>
                <input id="catatan-offline" type="text" maxLength={300} placeholder="mis. booth expo" value={catatan} onChange={(e) => setCatatan(e.target.value)} className={fieldClass} />
              </div>
              <button type="submit" disabled={menyimpan || !harga} className="bg-[#1A3626] text-white font-semibold rounded-xl px-4 py-3 min-h-[46px] hover:bg-[#0c1f13] transition-colors disabled:opacity-50">
                {menyimpan ? "Menyimpan…" : `Catat ${harga ? rupiah(jumlah * harga) : ""}`}
              </button>
            </div>
          </form>

          {/* Tabel pesanan */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Kanal</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Pembeli</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Jumlah</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="p-12 text-center text-gray-400">Memuat data penjualan…</td></tr>
                )}
                {!loading && terlihat.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-gray-400">Belum ada penjualan tercatat.</td></tr>
                )}
                {!loading && terlihat.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 align-top hover:bg-[#F4F7F4]/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{tanggalPesanan(o)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{o.channel === "online" ? "Online" : "Offline"}</span>
                      {o.is_test && <span className="ml-2 text-[11px] font-bold text-[#5C4A12] bg-[#FFF7E0] px-2 py-0.5 rounded">uji coba</span>}
                      <div className="text-xs text-gray-400 mt-1">{o.payment_method || "—"}</div>
                      {o.midtrans_status && <div className="text-xs text-gray-400">Midtrans: {o.midtrans_status}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs">
                      <div className="font-medium text-gray-900">{o.customer_name || "—"}</div>
                      {o.phone && <div className="text-xs text-gray-500 mt-1">{o.phone}</div>}
                      {o.address && <div className="text-xs text-gray-500 mt-1 leading-relaxed">{o.address}</div>}
                      {o.notes && <div className="text-xs text-gray-400 italic mt-1">{o.notes}</div>}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">{o.quantity}</td>
                    <td className="px-6 py-4 text-right tabular-nums font-semibold whitespace-nowrap">{rupiah(o.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        aria-label={`Status pesanan #${o.id}`}
                        value={o.status}
                        onChange={(e) => void ubahStatus(o, e.target.value as StatusPesanan)}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm"
                      >
                        {(Object.keys(LABEL_STATUS) as StatusPesanan[]).map((s) => <option key={s} value={s}>{LABEL_STATUS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {o.channel === "online" && o.midtrans_order_id && (
                        <button onClick={() => void cekMidtrans(o)} className="text-sm font-semibold text-[#1A3626] underline underline-offset-4 whitespace-nowrap" title={o.midtrans_order_id}>
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
