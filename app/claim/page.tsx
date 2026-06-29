"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ClaimPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Untuk demo, kita pakai localStorage menyimpan daftar kode yang sudah terpakai
  // Di sistem asli, ini akan mengecek database
  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      if (!code.trim()) {
        setStatus("error");
        setErrorMessage("Kode tidak boleh kosong.");
        return;
      }

      // Ambil daftar kode yang sudah terpakai dari localStorage
      const usedCodesStr = localStorage.getItem("usedQRCodes");
      const usedCodes = usedCodesStr ? JSON.parse(usedCodesStr) : [];

      if (usedCodes.includes(code.toUpperCase())) {
        setStatus("error");
        setErrorMessage("Maaf, QR Code ini sudah pernah diklaim sebelumnya.");
      } else {
        // Berhasil klaim
        usedCodes.push(code.toUpperCase());
        localStorage.setItem("usedQRCodes", JSON.stringify(usedCodes));
        localStorage.setItem("isPremium", "true");
        setStatus("success");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] font-sans text-gray-800 pb-20">
      <Navbar />

      <div className="max-w-md mx-auto pt-40 px-4">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-[#EAC775]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-[#EAC775]">qr_code_scanner</span>
          </div>
          
          <h1 className="text-2xl font-black text-[#1A3626] mb-2 tracking-tight">Klaim Akses Premium</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Masukkan kode unik dari dalam kotak kemasan Patchmos Spray untuk mengaktifkan fitur analitik tingkat lanjut.
          </p>

          {status === "success" ? (
            <div className="animate-in zoom-in duration-300">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <span className="material-symbols-outlined text-green-500 text-3xl mb-2">check_circle</span>
                <p className="text-green-700 font-bold text-sm">Berhasil! Akun Anda kini berstatus Premium selama 30 Hari.</p>
              </div>
              <button onClick={() => router.push("/")} className="w-full bg-[#1A3626] text-white font-black py-4 rounded-[1rem] transition-all hover:bg-[#0c1f13] shadow-lg">
                Ke Dashboard MosqRisk
              </button>
            </div>
          ) : (
            <form onSubmit={handleClaim}>
              <div className="mb-6">
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: MOSQ-X7B9" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-center text-lg font-black tracking-widest focus:outline-none focus:border-[#1A3626] focus:ring-4 focus:ring-[#1A3626]/10 uppercase transition-all"
                  required
                />
              </div>

              {status === "error" && (
                <div className="mb-6 bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-100 flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "loading"}
                className="w-full bg-[#EAC775] text-[#1A3626] font-black py-4 rounded-[1rem] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {status === "loading" ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined">vpn_key</span>
                )}
                Klaim Sekarang
              </button>
            </form>
          )}

        </div>
        
        <div className="mt-8 text-center text-xs font-bold text-gray-400">
          *Satu kode unik hanya dapat digunakan 1 kali oleh 1 akun.
        </div>
      </div>
    </div>
  );
}
