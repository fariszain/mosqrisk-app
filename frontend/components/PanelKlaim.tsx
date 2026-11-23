"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IScannerError } from "@yudiel/react-qr-scanner";
import { ImageIcon, KeyboardIcon, QrCodeIcon } from "@phosphor-icons/react/ssr";
import Catatan from "@/components/ui/Catatan";
import CentangBerhasil from "@/components/ui/CentangBerhasil";
import { kelasTombol } from "@/components/ui/tombol";
import { kelasInput, kelasLabel } from "@/components/ui/bidang";
import { klaimKode, kodeDariTeks } from "@/lib/klaim";
import { bisaMenyimpan } from "@/lib/premium";

// Isi klaim kode Premium — dipakai di ClaimModal dan halaman /claim.
// Bawaan "Ketik kode": selalu bisa dipakai dan tidak langsung meminta izin kamera.
type Props = { kodeAwal?: string; tautanBeli?: boolean; onSelesai?: () => void };

const PESAN_KAMERA: Partial<Record<IScannerError["kind"], string>> = {
  "permission-denied": "Akses kamera ditolak. Izinkan kamera di pengaturan browser, atau ketik kode / unggah foto QR.",
  "no-camera": "Perangkat ini tidak punya kamera yang bisa dipakai. Ketik kode atau unggah foto QR.",
  "in-use": "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu, lalu buka tab ini lagi.",
  "insecure-context": "Kamera hanya bisa dipakai di halaman https. Ketik kode atau unggah foto QR.",
};

export default function PanelKlaim({ kodeAwal = "", tautanBeli = true, onSelesai }: Props) {
  const [mode, setMode] = useState<"ketik" | "pindai">("ketik");
  const [kode, setKode] = useState(kodeAwal);
  const [status, setStatus] = useState<"siap" | "memproses" | "berhasil" | "gagal">("siap");
  const [pesan, setPesan] = useState("");
  const [galatKamera, setGalatKamera] = useState("");
  const [sudahDipindai, setSudahDipindai] = useState(false);
  const sibuk = useRef(false);
  const terakhirDipindai = useRef("");
  const berkas = useRef<HTMLInputElement>(null);

  // Pemindai bisa melapor kode yang sama berkali-kali — hanya satu klaim yang diproses.
  const kirim = async (k: string) => {
    if (sibuk.current) return;
    if (!bisaMenyimpan()) {
      setStatus("gagal");
      setPesan(
        "Browser ini tidak mengizinkan penyimpanan data situs (mode privat atau pengaturan privasi), jadi status Premium tidak bisa disimpan. Kode belum dipakai. Buka halaman ini di browser biasa, lalu coba lagi."
      );
      return;
    }
    sibuk.current = true;
    setStatus("memproses");
    setPesan("");
    const hasil = await klaimKode(k);
    sibuk.current = false;
    setStatus(hasil.ok ? "berhasil" : "gagal");
    if (!hasil.ok) setPesan(hasil.pesan);
  };

  const bacaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      // Perkecil foto besar agar pembacaan QR cepat di HP
      const skala = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * skala);
      canvas.height = Math.round(img.naturalHeight * skala);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const hasil = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
      if (hasil?.data) {
        void kirim(kodeDariTeks(hasil.data));
      } else {
        setStatus("gagal");
        setPesan("Kode QR tidak terbaca di foto itu. Pastikan QR terlihat utuh dan tidak buram, atau ketik kodenya.");
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatus("gagal");
      setPesan("Berkas itu bukan gambar yang bisa dibaca.");
    };
    img.src = url;
  };

  if (status === "berhasil") {
    return (
      <div role="status" className="ganti-isi py-2 text-center">
        <CentangBerhasil ukuran={72} className="mx-auto" />
        <p className="judul-3 mt-4">Premium aktif di perangkat ini</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-[15px] leading-relaxed text-sekunder">
          Prakiraan risiko 3 hari dan notifikasi email kini terbuka di halaman pantauan risiko.
        </p>
        <Link href="/pantau" onClick={onSelesai} className={kelasTombol("utama", "md", "mt-6 w-full sm:w-auto")}>
          Buka pantauan risiko
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div role="tablist" aria-label="Cara memasukkan kode" className="relative grid grid-cols-2 gap-1 rounded-full bg-kertas p-1">
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-full bg-kemasan shadow-tipis transition-transform duration-300 ease-out ${
            mode === "pindai" ? "translate-x-[calc(100%+0.25rem)]" : ""
          }`}
        />
        {(
          [
            ["ketik", "Ketik kode", KeyboardIcon],
            ["pindai", "Pindai QR", QrCodeIcon],
          ] as const
        ).map(([m, label, Ikon]) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`tab-${m}`}
            aria-selected={mode === m}
            aria-controls={`panel-${m}`}
            onClick={() => setMode(m)}
            className={`relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-300 ${
              mode === m ? "text-white" : "text-tinta hover:text-kemasan"
            }`}
          >
            <Ikon size={18} weight="duotone" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {mode === "ketik" && (
        <form
          id="panel-ketik"
          role="tabpanel"
          aria-labelledby="tab-ketik"
          className="ganti-isi mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            void kirim(kode);
          }}
        >
          <label htmlFor="kode-premium" className={kelasLabel}>
            Kode di bawah QR kemasan
          </label>
          <input
            id="kode-premium"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
            placeholder="MOSQ-X7B9"
            aria-invalid={status === "gagal"}
            aria-describedby={status === "gagal" ? "pesan-klaim" : undefined}
            className={`${kelasInput} min-h-14 text-center font-mono text-[21px] font-semibold tracking-[0.14em]`}
          />
          <button type="submit" disabled={status === "memproses" || kode.trim().length < 4} className={kelasTombol("utama", "lg", "mt-4 w-full")}>
            {status === "memproses" ? "Memeriksa kode…" : "Aktifkan Premium"}
          </button>
        </form>
      )}

      {mode === "pindai" && (
        <div id="panel-pindai" role="tabpanel" aria-labelledby="tab-pindai" className="ganti-isi mt-5">
          {galatKamera ? (
            <Catatan nada="peringatan" judul="Kamera tidak bisa dibuka">
              {galatKamera}
            </Catatan>
          ) : (
            <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-kartu bg-hutan">
              <Scanner
                onScan={(hasil) => {
                  const v = hasil[0]?.rawValue;
                  if (!v) return;
                  const k = kodeDariTeks(v);
                  // QR yang sama yang masih di depan kamera tidak diklaim ulang (kamera menyala lagi setelah jeda)
                  if (k === terakhirDipindai.current) return;
                  terakhirDipindai.current = k;
                  setSudahDipindai(true);
                  setKode(k);
                  void kirim(k);
                }}
                onError={(e) => setGalatKamera(PESAN_KAMERA[e.kind] ?? "Browser ini tidak bisa memakai kamera untuk memindai. Ketik kode atau unggah foto QR.")}
                paused={status === "memproses"}
                constraints={{ facingMode: "environment" }}
                components={{ finder: false }}
                sound={false}
                styles={{ container: { width: "100%", height: "100%" } }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-7 rounded-kontrol border-2 border-foil/80" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-9 h-0.5 rounded-full bg-foil shadow-[0_0_12px_2px_rgb(228_174_60/0.6)] motion-safe:animate-[garis-pindai_2.6s_ease-in-out_infinite]"
                style={{ top: "50%" }}
              />
            </div>
          )}
          <p className="mt-3 text-center text-[14px] text-sekunder">Arahkan kamera ke kode QR di kemasan Patchmos.</p>
          <input ref={berkas} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={bacaFoto} />
          <button type="button" onClick={() => berkas.current?.click()} className={kelasTombol("garis", "sm", "mt-4 w-full")}>
            <ImageIcon size={19} aria-hidden="true" />
            Unggah foto QR dari galeri
          </button>
        </div>
      )}

      {status === "gagal" && pesan && (
        <div id="pesan-klaim" className="mt-4">
          <Catatan nada="galat">
            {pesan}
            {mode === "pindai" && sudahDipindai && (
              <span className="mt-1 block">Kode yang sama tidak dipindai ulang otomatis. Untuk mencoba lagi, buka tab Ketik kode — kodenya sudah terisi.</span>
            )}
          </Catatan>
        </div>
      )}
      {status === "memproses" && mode === "pindai" && <p className="mt-4 text-center text-[15px]">Memeriksa kode…</p>}

      <p className="mt-6 text-[13px] leading-relaxed text-sekunder">
        Satu kode hanya bisa dipakai sekali. Status Premium disimpan di browser ini, tidak terikat akun.
        {tautanBeli && (
          <>
            {" "}
            Belum punya kode?{" "}
            <Link href="/checkout" className="tautan font-semibold text-tinta">
              Beli Patchmos
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
