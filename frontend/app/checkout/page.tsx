"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [address, setAddress] = useState("KOTA BANDA ACEH, ACEH");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if ("geolocation" in navigator) {
      setIsLoadingAddress(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoadingAddress(false);
          }
        },
        () => {
          setIsLoadingAddress(false);
        }
      );
    }
  }, []);

  const pricePerBottle = 35000;
  
  let totalPrice = quantity * pricePerBottle;
  if (quantity === 2) totalPrice = 65000;
  if (quantity === 3) totalPrice = 90000;

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "QRIS") {
      setIsQrisModalOpen(true);
    } else {
      setIsSuccessModalOpen(true);
    }
  };

  // Tema Warna Terinspirasi dari Card "Tindakan Disarankan" MosqRisk
  const darkGreen = "bg-[#1A3626]";
  const textDarkGreen = "text-[#1A3626]";
  const goldAccent = "text-[#EAC775]";
  const bgGoldAccent = "bg-[#EAC775]";

  return (
    <div className="min-h-screen bg-[#F4F6F5] font-sans text-gray-800 pb-20">
      
      {/* Navigation Bar */}
      <Navbar rightAction={
        <div className="flex items-center text-slate-600 gap-1.5 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="material-symbols-outlined text-danger text-[18px]">location_on</span>
          <span className="font-bold text-[13px]">KOTA BANDA ACEH, ACEH</span>
        </div>
      } />

      {/* Premium Hero Banner */}
      <div className="w-full relative overflow-hidden pt-32 pb-32 md:pt-40 md:pb-48 bg-gradient-to-br from-[#0c1f13] via-[#1A3626] to-[#0e261a] border-b border-[#EAC775]/20">
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#EAC775]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#4ade80]/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=')] opacity-60 pointer-events-none"></div>

        {/* Decorative Spray Silhouette (Bigger, Better Positioned) */}
        <div className="absolute right-[-10%] md:right-[0%] bottom-[-15%] opacity-40 w-[350px] h-[350px] md:w-[600px] md:h-[600px] pointer-events-none mix-blend-overlay transition-transform duration-1000 hover:scale-105">
           <img 
              className="w-full h-full object-contain filter drop-shadow-2xl" 
              alt="Spray Silhouette" 
              src="/spray-square-white.png"
            />
        </div>

        {/* Floating Abstract Elements */}
        <div className="absolute left-[5%] top-[10%] opacity-10 transform -rotate-12 pointer-events-none">
           <span className="material-symbols-outlined text-[180px] text-white">eco</span>
        </div>
        <div className="absolute right-[30%] top-[20%] w-3 h-3 rounded-full bg-[#EAC775] opacity-50 blur-[2px] pointer-events-none animate-pulse"></div>
        <div className="absolute left-[40%] bottom-[20%] w-4 h-4 rounded-full bg-[#4ade80] opacity-30 blur-[1px] pointer-events-none animate-bounce-slow"></div>
        <div className="absolute right-[45%] top-[45%] flex gap-2 opacity-20 pointer-events-none">
           <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-start justify-between h-full">
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-2 ${goldAccent} font-bold text-xs tracking-widest uppercase mb-4 px-3 py-1 bg-white/10 rounded-full border border-white/10 shadow-sm backdrop-blur-sm`}>
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Eksklusif Regional Aceh
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tight leading-tight drop-shadow-lg">
              PATCHMOS SPRAY <br className="hidden md:block"/>100% ALAMI
            </h1>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed hidden md:block max-w-xl font-medium drop-shadow-md">
              Perlindungan ekstra dari gigitan nyamuk, terbuat murni dari ekstrak nilam Aceh. Mendukung misi zero-waste dan kesejahteraan petani lokal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto px-4 transition-all duration-1000 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* Profile Card & Info Overlap - Fixed spacing and alignment */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-end relative z-20 mb-10 pl-2">
          
          {/* Square Image Card */}
          <div className="w-36 h-36 md:w-48 md:h-48 -mt-16 md:-mt-24 bg-white rounded-[2rem] p-2 shadow-xl shadow-gray-200/80 flex-shrink-0 relative overflow-hidden group">
             <div className="w-full h-full bg-gray-50 rounded-[1.5rem] flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden group-hover:bg-gray-100 transition-colors duration-500">
                <span className={`material-symbols-outlined text-[50px] md:text-[70px] ${textDarkGreen} drop-shadow-sm mb-2 relative z-10 group-hover:scale-110 transition-transform duration-500`} style={{fontVariationSettings: "'FILL' 1" }}>
                  water_drop
                </span>
                <span className={`${textDarkGreen} font-black text-xs md:text-sm tracking-widest uppercase relative z-10`}>PATCHMOS</span>
             </div>
          </div>
          
          {/* Title & Badges */}
          <div className="flex-1 pb-2 md:pb-4 mt-6 md:mt-8 text-center md:text-left">
            <h2 className={`text-2xl md:text-3xl font-black ${textDarkGreen} uppercase tracking-tight mb-3 drop-shadow-sm`}>MosqRisk Analytics</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-bold text-gray-600 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-gray-100 inline-flex">
              <span className="flex items-center gap-1.5 text-[#D97706]"><span className="material-symbols-outlined text-[16px]">bolt</span> Proses Cepat</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">headset_mic</span> Layanan 24/7</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
              <span className={`flex items-center gap-1.5 ${textDarkGreen}`}><span className="material-symbols-outlined text-[16px]">verified_user</span> Pembayaran Aman</span>
            </div>
          </div>
        </div>

        {/* Info Bar - Better spacing */}
        <div className="bg-white rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-10 text-xs md:text-sm font-bold text-gray-500 mb-10 shadow-sm border border-gray-100">
          <div className={`flex items-center gap-2 hover:${textDarkGreen} transition-colors cursor-default`}>
            <span className={`material-symbols-outlined text-[20px] ${textDarkGreen}`}>verified</span>
            Jaminan Kualitas
          </div>
          <div className={`flex items-center gap-2 hover:${textDarkGreen} transition-colors cursor-default`}>
            <span className={`material-symbols-outlined text-[20px] ${textDarkGreen}`}>eco</span>
            100% Bahan Alami
          </div>
          <div className={`flex items-center gap-2 hover:${textDarkGreen} transition-colors cursor-default hidden sm:flex`}>
            <span className={`material-symbols-outlined text-[20px] ${textDarkGreen}`}>lock</span>
            Transaksi Terenkripsi
          </div>
        </div>

        {/* Form Layout */}
        <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (Forms) */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            
            {/* 1. Informasi Pengiriman */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-full ${bgGoldAccent} text-[#1A3626] font-black text-xl flex items-center justify-center shadow-inner`}>1</div>
                <h2 className={`font-black text-2xl ${textDarkGreen} tracking-tight`}>Data Pengiriman</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nama Lengkap</label>
                  <input type="text" required placeholder="Ketik nama penerima" className={`w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#1A3626] focus:ring-4 focus:ring-[#1A3626]/10 transition-all text-gray-800 placeholder-gray-400`} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nomor WhatsApp</label>
                  <input type="tel" required placeholder="Contoh: 081234567890" className={`w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#1A3626] focus:ring-4 focus:ring-[#1A3626]/10 transition-all text-gray-800 placeholder-gray-400`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Alamat Lengkap</label>
                <div className="relative">
                  <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos. Patokan rumah." rows={3} className={`w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#1A3626] focus:ring-4 focus:ring-[#1A3626]/10 transition-all resize-none text-gray-800 placeholder-gray-400`}></textarea>
                  {isLoadingAddress && <div className="absolute top-4 right-4 text-xs font-bold text-[#EAC775] animate-pulse bg-white/80 px-2 py-1 rounded">Mencari Lokasi Anda...</div>}
                </div>
              </div>
            </div>

            {/* 2. Pilih Jumlah Pembelian */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-full ${bgGoldAccent} text-[#1A3626] font-black text-xl flex items-center justify-center shadow-inner`}>2</div>
                <h2 className={`font-black text-2xl ${textDarkGreen} tracking-tight`}>Pilih Jumlah Botol</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Option 1 */}
                <div 
                  onClick={() => setQuantity(1)}
                  className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col relative transition-all duration-300 transform hover:-translate-y-1 ${quantity === 1 ? `border-[#1A3626] ${darkGreen} text-white shadow-lg` : 'border-gray-100 bg-white hover:border-gray-300 text-gray-800'}`}
                >
                  {/* Background Bottle Image Container */}
                  <div className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
                    <div className={`absolute right-[-20%] bottom-[-25%] w-32 h-32 pointer-events-none transition-all duration-500 ease-in-out mix-blend-screen ${quantity === 1 ? 'opacity-20 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-4'}`}>
                      <img src="/spray-square-white.png" alt="" className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className={`font-black text-lg`}>1 Botol</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${quantity === 1 ? 'border-[#EAC775] bg-[#EAC775]' : 'border-gray-300'}`}>
                      {quantity === 1 && <span className="material-symbols-outlined text-[#1A3626] text-sm font-bold">check</span>}
                    </div>
                  </div>
                  <p className={`font-black text-xl mt-auto relative z-10 ${quantity === 1 ? goldAccent : textDarkGreen}`}>Rp 35.000</p>
                </div>
                
                {/* Option 2 */}
                <div 
                  onClick={() => setQuantity(2)}
                  className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col relative transition-all duration-300 transform hover:-translate-y-1 ${quantity === 2 ? `border-[#1A3626] ${darkGreen} text-white shadow-lg` : 'border-gray-100 bg-white hover:border-gray-300 text-gray-800'}`}
                >
                  {/* Background Bottle Image Container */}
                  <div className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
                    <div className={`absolute right-[-20%] bottom-[-25%] w-32 h-32 pointer-events-none transition-all duration-500 ease-in-out mix-blend-screen ${quantity === 2 ? 'opacity-20 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-4'}`}>
                      <img src="/spray-square-white.png" alt="" className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                  </div>

                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md z-20">LEBIH HEMAT</div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className={`font-black text-lg`}>2 Botol</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${quantity === 2 ? 'border-[#EAC775] bg-[#EAC775]' : 'border-gray-300'}`}>
                      {quantity === 2 && <span className="material-symbols-outlined text-[#1A3626] text-sm font-bold">check</span>}
                    </div>
                  </div>
                  <p className={`text-xs font-bold line-through mb-1 relative z-10 ${quantity === 2 ? 'text-gray-400' : 'text-gray-400'}`}>Rp 70.000</p>
                  <p className={`font-black text-xl mt-auto relative z-10 ${quantity === 2 ? goldAccent : textDarkGreen}`}>Rp 65.000</p>
                </div>

                {/* Option 3 */}
                <div 
                  onClick={() => setQuantity(3)}
                  className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col relative transition-all duration-300 transform hover:-translate-y-1 ${quantity === 3 ? `border-[#1A3626] ${darkGreen} text-white shadow-lg` : 'border-gray-100 bg-white hover:border-gray-300 text-gray-800'}`}
                >
                  {/* Background Bottle Image Container */}
                  <div className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
                    <div className={`absolute right-[-20%] bottom-[-25%] w-32 h-32 pointer-events-none transition-all duration-500 ease-in-out mix-blend-screen ${quantity === 3 ? 'opacity-20 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-4'}`}>
                      <img src="/spray-square-white.png" alt="" className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                  </div>

                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse z-20 whitespace-nowrap">PAKET KELUARGA</div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className={`font-black text-lg`}>3 Botol</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${quantity === 3 ? 'border-[#EAC775] bg-[#EAC775]' : 'border-gray-300'}`}>
                      {quantity === 3 && <span className="material-symbols-outlined text-[#1A3626] text-sm font-bold">check</span>}
                    </div>
                  </div>
                  <p className={`text-xs font-bold line-through mb-1 relative z-10 ${quantity === 3 ? 'text-gray-400' : 'text-gray-400'}`}>Rp 105.000</p>
                  <p className={`font-black text-xl mt-auto relative z-10 ${quantity === 3 ? goldAccent : textDarkGreen}`}>Rp 90.000</p>
                </div>
              </div>
            </div>

            {/* 3. Pilih Pembayaran */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-full ${bgGoldAccent} text-[#1A3626] font-black text-xl flex items-center justify-center shadow-inner`}>3</div>
                <h2 className={`font-black text-2xl ${textDarkGreen} tracking-tight`}>Metode Pembayaran</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Method QRIS */}
                <div 
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition-all duration-300 relative overflow-hidden group ${paymentMethod === "QRIS" ? `border-[#1A3626] bg-gray-50 shadow-sm` : 'border-gray-100 bg-white hover:border-gray-300'}`}
                >
                  <div className={`absolute top-4 -right-8 w-36 text-center ${bgGoldAccent} text-[#1A3626] text-[9px] font-black py-1 transform rotate-45 shadow-sm`}>BEBAS BIAYA</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-1 shadow-sm">
                      <span className="font-extrabold text-red-500 text-sm tracking-tighter">QRIS</span>
                    </div>
                    <div>
                      <h3 className={`font-black text-sm ${paymentMethod === "QRIS" ? textDarkGreen : 'text-gray-800'}`}>QRIS (Semua Payment)</h3>
                      <p className="text-xs text-green-600 font-bold mt-1">Gratis biaya admin</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-6 transition-colors ${paymentMethod === "QRIS" ? 'border-[#1A3626] bg-[#1A3626]' : 'border-gray-300'}`}>
                    {paymentMethod === "QRIS" && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                  </div>
                </div>

                {/* Method E-Wallet */}
                <div 
                  onClick={() => setPaymentMethod("E-WALLET")}
                  className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition-all duration-300 group ${paymentMethod === "E-WALLET" ? `border-[#1A3626] bg-gray-50 shadow-sm` : 'border-gray-100 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2 group-hover:scale-105 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white z-30 shadow-sm">DANA</div>
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white z-20 shadow-sm">GoPay</div>
                    </div>
                    <div>
                      <h3 className={`font-black text-sm ${paymentMethod === "E-WALLET" ? textDarkGreen : 'text-gray-800'}`}>Dompet Digital</h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">Biaya admin Rp 1.000</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "E-WALLET" ? 'border-[#1A3626] bg-[#1A3626]' : 'border-gray-300'}`}>
                    {paymentMethod === "E-WALLET" && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Summary) */}
          <div className="col-span-1 lg:col-span-4 lg:sticky lg:top-24">
            <div className="flex flex-col gap-6">
              
              {/* Review Card */}
              <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center md:items-start text-center md:text-left hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Ulasan dan Rating</p>
                <div className="flex items-end justify-center md:justify-start gap-3 mb-1 w-full">
                  <span className={`text-5xl font-black ${textDarkGreen} leading-none`}>4.99</span>
                  <div className="flex gap-1 pb-1">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="material-symbols-outlined text-xl text-[#F59E0B]" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-2">Berdasarkan 2.4k+ rating pembeli setia</p>
              </div>

              {/* Order Summary Card - EXACTLY LIKE MOSQRISK CARD (Image 2) */}
              <div className={`${darkGreen} rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden text-white border border-[#2c523d]`}>
                {/* Decorative background spray silhouette from Image 2 */}
                <div className="absolute right-[-20%] bottom-[-20%] opacity-20 w-64 h-64 pointer-events-none mix-blend-screen">
                   <img 
                      className="w-full h-full object-contain" 
                      alt="Spray Silhouette" 
                      src="/spray-square-white.png"
                    />
                </div>
                
                <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${goldAccent} uppercase tracking-widest text-[13px]`}>
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Ringkasan Pesanan
                </h3>
                
                <div className="space-y-4 mb-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">Patchmos Spray <span className={goldAccent}>x{quantity}</span></p>
                      <p className="text-[11px] text-gray-300 mt-1 font-medium">Ekstrak Ampas Nilam</p>
                    </div>
                    <p className="text-sm font-black">Rp {totalPrice.toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-300 font-medium">Pembayaran</p>
                    <p className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full">{paymentMethod}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-300 font-medium">Biaya Admin</p>
                    <p className="text-xs font-bold">{paymentMethod === "QRIS" ? "Gratis" : "Rp 1.000"}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/20 border-dashed flex justify-between items-center mb-8 relative z-10">
                  <p className="font-bold text-gray-300 text-sm">Total Tagihan</p>
                  <p className={`font-black text-3xl ${goldAccent}`}>Rp {(totalPrice + (paymentMethod === "QRIS" ? 0 : 1000)).toLocaleString('id-ID')}</p>
                </div>

                {/* White button exactly like Image 2 */}
                <button type="submit" className="w-full bg-white text-[#1A3626] font-black text-lg py-4 rounded-[2rem] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-3 relative z-10">
                  <span className="material-symbols-outlined text-[#1A3626]">shopping_cart</span>
                  Beli Patchmos Spray
                </button>
              </div>

            </div>
          </div>
          
        </form>
      </div>

      {/* QRIS Modal */}
      {isQrisModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <h2 className={`text-2xl font-black ${textDarkGreen} mb-2 tracking-tight`}>Scan QRIS</h2>
            <p className="text-gray-500 mb-6 text-sm font-medium">
              Gunakan aplikasi m-Banking atau E-Wallet pilihan Anda untuk melakukan pembayaran.
            </p>
            
            <div className="bg-gray-50 rounded-[2rem] p-4 mb-6 border-2 border-dashed border-gray-200 flex justify-center">
              <img src="/qris-payment.png" alt="QRIS MosqRisk" className="w-full max-w-[280px] rounded-xl shadow-sm" />
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                setIsQrisModalOpen(false);
                setIsSuccessModalOpen(true);
              }} className={`w-full ${bgGoldAccent} ${textDarkGreen} font-black py-4 rounded-2xl hover:brightness-105 transition-all shadow-lg`}>
                Saya Sudah Bayar
              </button>
              <button onClick={() => setIsQrisModalOpen(false)} className={`w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors text-sm`}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white max-w-sm w-full rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl border border-gray-100">
            <div className={`w-24 h-24 ${darkGreen} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform scale-110 animate-bounce-slow`}>
              <span className={`material-symbols-outlined text-5xl ${goldAccent} font-bold`} style={{fontVariationSettings: "'FILL' 1"}}>check</span>
            </div>
            <h2 className={`text-2xl font-black ${textDarkGreen} mb-3 tracking-tight`}>Transaksi Sukses!</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed font-medium">
              Desain Checkout telah diperbaiki! Semua elemen kini tersusun rapi tanpa ada bagian yang saling menabrak.
            </p>
            <button onClick={() => setIsSuccessModalOpen(false)} className={`inline-block w-full bg-gray-100 ${textDarkGreen} font-black py-4 rounded-2xl hover:bg-gray-200 transition-colors`}>
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
