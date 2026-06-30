"use client";

import { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "manual" | "qris">("scan");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleClaim = async (claimCode: string) => {
    setStatus("loading");
    setErrorMessage("");
    
    if (!claimCode.trim()) {
      setStatus("error");
      setErrorMessage("Kode tidak boleh kosong.");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API_URL}/api/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimCode.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('isPremium', 'true');
        setStatus("success");
        setTimeout(() => {
          onClose();
          router.push('/');
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(data.message);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Gagal terhubung ke server.");
    }
  };

  const handleQrisPayment = () => {
    setStatus("loading");
    setErrorMessage("");
    setTimeout(() => {
      localStorage.setItem('isPremium', 'true');
      setStatus("success");
      setTimeout(() => {
        onClose();
        router.push('/pantau'); // redirect to dashboard pantau
      }, 2000);
    }, 1500); // Simulate network request
  };

  const onScan = (result: any) => {
    if (result && result.length > 0 && result[0].rawValue) {
      const scannedUrl = result[0].rawValue;
      // Extract code from URL like https://mosqrisk.vercel.app/claim?code=MOSQ-XXXX
      const match = scannedUrl.match(/[?&]code=([^&]+)/);
      if (match && match[1]) {
        handleClaim(match[1].toUpperCase());
      } else {
        // Assume it might just be the raw code
        handleClaim(scannedUrl.toUpperCase());
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          const scannedUrl = qrCode.data;
          const match = scannedUrl.match(/[?&]code=([^&]+)/);
          if (match && match[1]) {
            handleClaim(match[1].toUpperCase());
          } else {
            handleClaim(scannedUrl.toUpperCase());
          }
        } else {
          setStatus("error");
          setErrorMessage("Tidak dapat menemukan QR Code di gambar tersebut.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-[#1A3626] text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[#EAC775]">verified</span>
            Klaim Patchmos Premium
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-100">
          <button 
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors ${activeTab === "scan" ? "text-[#1A3626] border-b-2 border-[#1A3626]" : "text-gray-400 hover:text-gray-600"}`}
          >
            Scan QR
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors ${activeTab === "manual" ? "text-[#1A3626] border-b-2 border-[#1A3626]" : "text-gray-400 hover:text-gray-600"}`}
          >
            Input Kode
          </button>
          <button 
            onClick={() => setActiveTab("qris")}
            className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${activeTab === "qris" ? "text-[#EAC775] border-b-2 border-[#EAC775]" : "text-gray-400 hover:text-[#EAC775]"}`}
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span> Beli Akses
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
              </div>
              <h4 className="font-bold text-xl text-[#1A3626] mb-2">Aktivasi Berhasil!</h4>
              <p className="text-gray-500 text-sm">Akun Anda sekarang berstatus Premium.</p>
            </div>
          ) : (
            <>
              {activeTab === "scan" && (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Arahkan kamera ke QR Code yang ada di kemasan Patchmos Anda.
                  </p>
                  <div className="w-full max-w-[250px] aspect-square rounded-2xl overflow-hidden border-4 border-[#EAC775]/30 shadow-inner bg-black relative mb-4">
                    <Scanner
                      onScan={onScan}
                      onError={(e) => console.error(e)}
                      styles={{ container: { width: "100%", height: "100%" } }}
                      components={{
                        finder: false
                      }}
                    />
                    {/* Scanning overlay effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#EAC775] shadow-[0_0_15px_#EAC775] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Upload Image Option */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-bold text-[#1A3626] bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors border border-green-200"
                  >
                    <span className="material-symbols-outlined text-[18px]">image</span>
                    Upload dari Galeri
                  </button>
                </div>
              )}

              {activeTab === "manual" && (
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Masukkan kode 9 digit yang tertera di bawah QR Code kemasan Anda.
                  </p>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: MOSQ-XXXX"
                    className="w-full text-center text-xl tracking-widest uppercase py-4 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#1A3626] focus:ring-0 transition-colors font-mono font-bold text-[#1A3626]"
                  />
                  <button
                    onClick={() => handleClaim(code)}
                    disabled={status === "loading" || !code.trim()}
                    className="mt-4 w-full bg-[#1A3626] hover:bg-green-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      "Verifikasi Kode"
                    )}
                  </button>
                </div>
              )}

              {activeTab === "qris" && (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Beli akses Premium MosqRisk (Tanpa Kemasan). Harga <strong>Rp 15.000</strong>.
                  </p>
                  <div className="w-full max-w-[200px] aspect-square bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden mb-4 p-2 border-4 border-[#EAC775]">
                    {/* Dummy QRIS Image */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Pembayaran_QRIS_MosqRisk" alt="QRIS" className="w-full h-full object-contain mix-blend-multiply opacity-80" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">QRIS</div>
                  </div>
                  <button
                    onClick={handleQrisPayment}
                    disabled={status === "loading"}
                    className="w-full bg-[#EAC775] hover:bg-yellow-400 text-[#1A3626] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      "Saya Sudah Bayar"
                    )}
                  </button>
                </div>
              )}

              {/* Error Message */}
              {status === "error" && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <p>{errorMessage}</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
