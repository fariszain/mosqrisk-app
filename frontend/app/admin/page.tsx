"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ChatTextIcon,
  DownloadSimpleIcon,
  DropIcon,
  EnvelopeSimpleIcon,
  FirstAidKitIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";
import SalesPanel, { selCSV } from "@/components/admin/SalesPanel";
import Dialog from "@/components/ui/Dialog";
import { kelasTombol } from "@/components/ui/tombol";
import { kelasInput, kelasLabel } from "@/components/ui/bidang";

// Dasbor admin: fungsional dan padat, bukan halaman pamer (02_DESIGN_BRIEF §6).
// Semua aksi divalidasi backend dengan ADMIN_KEY (fail closed — tanpa ADMIN_KEY semua ditolak).
interface Report {
  id: number;
  report_type?: string;
  location_name?: string;
  description?: string;
  created_at: string;
  [key: string]: unknown;
}

interface Subscriber {
  id: number;
  email?: string;
  location_name?: string;
  created_at: string;
  [key: string]: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const LABEL_JENIS: Record<string, string> = { JENTIK: "Jentik / genangan", DBD: "Suspect DBD", LAINNYA: "Lainnya" };
const waktu = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

type Konfirmasi = { judul: string; isi: string; tombol: string; jalankan: () => Promise<void> } | null;

function unduhCSV(data: Record<string, unknown>[], namaBerkas: string) {
  if (!data.length) return;
  const kolom = Object.keys(data[0]);
  const csv = [kolom.join(","), ...data.map((baris) => kolom.map((k) => selCSV(baris[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = namaBerkas;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [masuk, setMasuk] = useState(false);
  const [pin, setPin] = useState("");
  const [pinSalah, setPinSalah] = useState("");
  const [memeriksa, setMemeriksa] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [cari, setCari] = useState("");
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null);
  const [menjalankan, setMenjalankan] = useState(false);

  const header = useMemo(() => ({ Authorization: `Bearer ${pin}` }), [pin]);

  useEffect(() => {
    if (!masuk) return;
    setMemuat(true);
    const ambil = (url: string) =>
      fetch(url, { headers: header }).then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => null) }));
    Promise.all([ambil(`${API_URL}/api/reports`), ambil(`${API_URL}/api/subscribe`)])
      .then(([r, s]) => {
        if (r.ok && r.data?.success) setReports(r.data.data || []);
        else toast.error("Laporan gagal dimuat.");
        if (s.ok && s.data?.success) setSubscribers(s.data.data || []);
        else toast.error("Data pelanggan gagal dimuat.");
      })
      .catch(() => toast.error("Server tidak bisa dihubungi."))
      .finally(() => setMemuat(false));
  }, [masuk, header]);

  const masukDasbor = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinSalah("");
    setMemeriksa(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, { method: "POST", headers: header });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setMasuk(true);
      else if (res.status === 503) setPinSalah("Akses admin belum dikonfigurasi di server (ADMIN_KEY kosong).");
      else setPinSalah("PIN tidak cocok. Coba lagi.");
    } catch {
      setPinSalah("Server tidak bisa dihubungi. Periksa koneksi, lalu coba lagi.");
    } finally {
      setMemeriksa(false);
    }
  };

  const kirimPeringatan = async () => {
    const res = await fetch(`${API_URL}/api/broadcast`, { method: "POST", headers: header });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) toast.success("Peringatan dijadwalkan untuk dikirim ke semua pelanggan.");
    else toast.error(data.message || "Peringatan gagal dikirim.");
  };

  const hapusLaporan = async (id: number) => {
    const sebelumnya = reports;
    setReports(reports.filter((r) => r.id !== id));
    const res = await fetch(`${API_URL}/api/reports/${id}`, { method: "DELETE", headers: header }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.success) toast.success("Laporan dihapus.");
    else {
      setReports(sebelumnya);
      toast.error("Laporan gagal dihapus.");
    }
  };

  const hapusPelanggan = async (id: number) => {
    const sebelumnya = subscribers;
    setSubscribers(subscribers.filter((s) => s.id !== id));
    const res = await fetch(`${API_URL}/api/subscribe/${id}`, { method: "DELETE", headers: header }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.success) toast.success("Pelanggan dihapus.");
    else {
      setSubscribers(sebelumnya);
      toast.error("Pelanggan gagal dihapus.");
    }
  };

  const jalankanKonfirmasi = async () => {
    if (!konfirmasi) return;
    setMenjalankan(true);
    try {
      await konfirmasi.jalankan();
    } catch {
      toast.error("Server tidak bisa dihubungi.");
    } finally {
      setMenjalankan(false);
      setKonfirmasi(null);
    }
  };

  const q = cari.trim().toLowerCase();
  const laporanTampil = reports.filter((r) => !q || `${r.location_name} ${r.description} ${r.report_type}`.toLowerCase().includes(q));
  const pelangganTampil = subscribers.filter((s) => !q || `${s.location_name} ${s.email}`.toLowerCase().includes(q));
  const ringkas = [
    { label: "Laporan warga", nilai: reports.length, Ikon: ChatTextIcon },
    { label: "Laporan suspect DBD", nilai: reports.filter((r) => r.report_type?.toUpperCase() === "DBD").length, Ikon: FirstAidKitIcon },
    { label: "Laporan jentik", nilai: reports.filter((r) => r.report_type?.toUpperCase() === "JENTIK").length, Ikon: DropIcon },
    { label: "Pelanggan email", nilai: subscribers.length, Ikon: EnvelopeSimpleIcon },
  ];

  if (!masuk) {
    return (
      <main id="konten" className="flex flex-1 items-center justify-center bg-kertas px-4 py-16">
        <div className="w-full max-w-sm rounded-media bg-white p-6 shadow-angkat md:p-8">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/patchmos-logo-mark.png" alt="" width={894} height={886} className="h-10 w-10" priority />
            <span className="text-[21px] font-extrabold tracking-[-0.03em] text-kemasan">Patchmos</span>
          </div>
          <h1 className="judul-3 mt-6">Dasbor admin</h1>
          <p className="mt-1 text-[15px] text-sekunder">Masukkan PIN admin untuk membuka data laporan, pelanggan, dan penjualan.</p>
          <form onSubmit={masukDasbor} className="mt-6">
            <label htmlFor="pin" className={kelasLabel}>
              PIN admin
            </label>
            <input
              id="pin"
              type="password"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              aria-invalid={!!pinSalah}
              aria-describedby={pinSalah ? "pesan-pin" : undefined}
              className={kelasInput}
              autoFocus
            />
            {pinSalah && (
              <p id="pesan-pin" role="alert" className="mt-2 text-[14px] text-galat">
                {pinSalah}
              </p>
            )}
            <button type="submit" disabled={memeriksa || !pin} className={kelasTombol("utama", "md", "mt-5 w-full")}>
              {memeriksa ? "Memeriksa…" : "Masuk"}
            </button>
          </form>
          <Link href="/" className="tautan mt-6 inline-flex min-h-11 items-center text-[15px]">
            Kembali ke situs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-garis bg-white">
        <div className="wadah flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3">
            <Image src="/brand/patchmos-logo-mark.png" alt="" width={894} height={886} className="h-9 w-9" />
            <p className="text-[17px] font-semibold">Dasbor admin MosqRisk</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={subscribers.length === 0}
              onClick={() =>
                setKonfirmasi({
                  judul: "Kirim peringatan ke semua pelanggan?",
                  isi: `Email peringatan kewaspadaan DBD akan dikirim ke ${subscribers.length} pelanggan. Pengiriman belum ditarget per tingkat risiko wilayah.`,
                  tombol: "Kirim peringatan",
                  jalankan: kirimPeringatan,
                })
              }
              className={kelasTombol("garis", "sm")}
            >
              <MegaphoneIcon size={18} aria-hidden="true" />
              Kirim peringatan
            </button>
            <Link href="/" className={kelasTombol("garis", "sm")}>
              Situs publik
            </Link>
          </div>
        </div>
      </header>

      <main id="konten" className="flex-1 bg-kertas">
        <div className="wadah space-y-8 py-8 md:py-10">
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ringkas.map(({ label, nilai, Ikon }) => (
              <div key={label} className="rounded-kartu bg-white px-5 py-4 shadow-tipis">
                <dt className="flex items-center gap-2 text-[14px] text-sekunder">
                  <Ikon size={18} weight="duotone" aria-hidden="true" className="text-kemasan" />
                  {label}
                </dt>
                <dd className="angka mt-2 text-[34px] font-extrabold leading-none tracking-[-0.04em]">{memuat ? "…" : nilai.toLocaleString("id-ID")}</dd>
              </div>
            ))}
          </dl>

          <SalesPanel pin={pin} apiUrl={API_URL} />

          <div className="relative max-w-xl">
            <label htmlFor="cari" className="sr-only">
              Cari laporan atau pelanggan
            </label>
            <MagnifyingGlassIcon size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sekunder" />
            <input
              id="cari"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari lokasi, isi laporan, atau email"
              className={`${kelasInput} pl-11 pr-11`}
            />
            {cari && (
              <button
                type="button"
                onClick={() => setCari("")}
                aria-label="Hapus pencarian"
                className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-sekunder hover:text-tinta"
              >
                <XIcon size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Laporan */}
          <section aria-labelledby="judul-laporan" className="overflow-hidden rounded-kartu bg-white shadow-tipis">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-5 py-4">
              <h2 id="judul-laporan" className="text-[18px] font-semibold">
                Laporan warga <span className="font-normal text-sekunder angka">({laporanTampil.length})</span>
              </h2>
              <button type="button" onClick={() => unduhCSV(laporanTampil, "laporan_mosqrisk.csv")} disabled={!laporanTampil.length} className={kelasTombol("garis", "sm")}>
                <DownloadSimpleIcon size={18} aria-hidden="true" />
                Ekspor CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="bg-kertas text-sekunder">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Waktu</th>
                    <th scope="col" className="px-5 py-3 font-medium">Jenis</th>
                    <th scope="col" className="px-5 py-3 font-medium">Lokasi</th>
                    <th scope="col" className="px-5 py-3 font-medium">Deskripsi</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {memuat ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sekunder">Memuat laporan…</td>
                    </tr>
                  ) : laporanTampil.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sekunder">{q ? "Tidak ada laporan yang cocok." : "Belum ada laporan warga."}</td>
                    </tr>
                  ) : (
                    laporanTampil.map((r) => (
                      <tr key={r.id} className="border-t border-garis align-top">
                        <td className="whitespace-nowrap px-5 py-3 angka">{waktu(r.created_at)}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className={r.report_type === "DBD" ? "font-semibold text-galat" : ""}>{LABEL_JENIS[r.report_type ?? ""] ?? r.report_type}</span>
                        </td>
                        <td className="px-5 py-3">{r.location_name}</td>
                        <td className="max-w-[28rem] px-5 py-3 text-sekunder">{r.description}</td>
                        <td className="px-5 py-2 text-right">
                          <button
                            type="button"
                            aria-label={`Hapus laporan ${r.id}`}
                            onClick={() =>
                              setKonfirmasi({
                                judul: "Hapus laporan ini?",
                                isi: "Laporan dihapus permanen dari database dan tidak bisa dikembalikan.",
                                tombol: "Hapus laporan",
                                jalankan: () => hapusLaporan(r.id),
                              })
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sekunder transition-colors hover:bg-risiko-tinggi-latar hover:text-galat"
                          >
                            <TrashIcon size={20} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pelanggan */}
          <section aria-labelledby="judul-pelanggan" className="overflow-hidden rounded-kartu bg-white shadow-tipis">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-5 py-4">
              <h2 id="judul-pelanggan" className="text-[18px] font-semibold">
                Pelanggan email <span className="font-normal text-sekunder angka">({pelangganTampil.length})</span>
              </h2>
              <button type="button" onClick={() => unduhCSV(pelangganTampil, "pelanggan_mosqrisk.csv")} disabled={!pelangganTampil.length} className={kelasTombol("garis", "sm")}>
                <DownloadSimpleIcon size={18} aria-hidden="true" />
                Ekspor CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-[14px]">
                <thead className="bg-kertas text-sekunder">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Email</th>
                    <th scope="col" className="px-5 py-3 font-medium">Wilayah</th>
                    <th scope="col" className="px-5 py-3 font-medium">Terdaftar</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {memuat ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sekunder">Memuat pelanggan…</td>
                    </tr>
                  ) : pelangganTampil.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sekunder">{q ? "Tidak ada pelanggan yang cocok." : "Belum ada pelanggan email."}</td>
                    </tr>
                  ) : (
                    pelangganTampil.map((s) => (
                      <tr key={s.id} className="border-t border-garis">
                        <td className="break-all px-5 py-3">{s.email}</td>
                        <td className="px-5 py-3">{s.location_name}</td>
                        <td className="whitespace-nowrap px-5 py-3 angka">{waktu(s.created_at)}</td>
                        <td className="px-5 py-2 text-right">
                          <button
                            type="button"
                            aria-label={`Hapus pelanggan ${s.email}`}
                            onClick={() =>
                              setKonfirmasi({
                                judul: "Hapus pelanggan ini?",
                                isi: `${s.email} tidak akan menerima email MosqRisk lagi. Data dihapus permanen.`,
                                tombol: "Hapus pelanggan",
                                jalankan: () => hapusPelanggan(s.id),
                              })
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sekunder transition-colors hover:bg-risiko-tinggi-latar hover:text-galat"
                          >
                            <TrashIcon size={20} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Dialog terbuka={!!konfirmasi} onTutup={() => !menjalankan && setKonfirmasi(null)} judul={konfirmasi?.judul ?? ""}>
        {konfirmasi && (
          <div>
            <p className="text-[16px] leading-relaxed">{konfirmasi.isi}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setKonfirmasi(null)} disabled={menjalankan} className={kelasTombol("garis")}>
                Batal
              </button>
              <button type="button" onClick={() => void jalankanKonfirmasi()} disabled={menjalankan} className={kelasTombol("utama")}>
                {menjalankan ? "Memproses…" : konfirmasi.tombol}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
