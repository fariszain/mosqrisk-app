"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from "@/components/Navbar";

export default function MosqRiskDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [isPremiumAlertOpen, setIsPremiumAlertOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waSuccess, setWaSuccess] = useState('');
  const [waError, setWaError] = useState('');
  const [pendingGPSCity, setPendingGPSCity] = useState("");
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [impactKg, setImpactKg] = useState(2.5);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('emailRegistered') === 'true') {
        setIsEmailRegistered(true);
      }
      if (localStorage.getItem('isPremium') === 'true') {
        setIsPremium(true);
      }
    }
    
    // Fetch dynamic impact stats
    fetch('http://127.0.0.1:8000/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setImpactKg(data.impact_kg);
      })
      .catch(err => console.error("Failed to fetch stats:", err));
  }, []);

  const handleWASubmit = async () => {
    if(!waNumber) { setWaError("Nomor tidak boleh kosong"); return; }
    setWaSubmitting(true);
    setWaError('');
    setWaSuccess('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: locationName || "Umum",
          email: waNumber
        })
      });
      const data = await res.json();
      if(data.success) {
        setWaSuccess(data.message);
        localStorage.setItem('emailRegistered', 'true');
        setIsEmailRegistered(true);
        setTimeout(() => { setIsWAModalOpen(false); setWaSuccess(''); setWaNumber(''); }, 3000);
      } else {
        setWaError(data.message);
      }
    } catch(e) {
      setWaError("Terjadi kesalahan koneksi.");
    } finally {
      setWaSubmitting(false);
    }
  };

  // State untuk Data Dinamis
  const [mosqRiskData, setMosqRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State untuk Dropdown Lokasi Emsifa
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedReg, setSelectedReg] = useState("");
  const [locationName, setLocationName] = useState("");

  // Fetch daftar provinsi saat komponen dimuat
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Gagal memuat provinsi:", err));
  }, []);

  // Fetch daftar kabupaten/kota ketika provinsi dipilih
  useEffect(() => {
    if (!selectedProv) {
      setRegencies([]);
      setSelectedReg("");
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv}.json`)
      .then(res => res.json())
      .then(data => {
        setRegencies(data);
        // GPS Auto-select logic
        if (pendingGPSCity) {
          const cleanPending = pendingGPSCity.replace("KOTA ", "").replace("KABUPATEN ", "").replace(/\s+/g, "");
          const matchedReg = data.find((r: any) => {
            const cleanRegName = r.name.replace("KOTA ", "").replace("KABUPATEN ", "").replace(/\s+/g, "");
            return cleanRegName.includes(cleanPending) || cleanPending.includes(cleanRegName);
          });
          
          if (matchedReg) {
            setSelectedReg(matchedReg.id);
            setIsLocationModalOpen(false);
          } else {
            alert(`Kota ${pendingGPSCity} tidak ditemukan di database (Kemungkinan GPS meleset). Silakan pilih manual.`);
          }
          setPendingGPSCity("");
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Gagal memuat kabupaten:", err);
        setLoading(false);
      });
  }, [selectedProv]);

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur GPS.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data && data.address) {
          const state = data.address.state?.toUpperCase() || "";
          const city = (data.address.city || data.address.county || data.address.town || "").toUpperCase();
          
          if (!state || !city) throw new Error("Data lokasi GPS tidak lengkap.");
          
          // Cari provinsi
          const matchedProv = provinces.find((p: any) => p.name.includes(state) || state.includes(p.name));
          if (matchedProv) {
            setPendingGPSCity(city);
            setSelectedProv((matchedProv as any).id);
          } else {
            throw new Error(`Provinsi ${state} tidak ditemukan.`);
          }
        }
      } catch (err: any) {
        alert("Gagal melacak lokasi: " + err.message);
        setLoading(false);
      }
    }, () => {
      alert("Izin GPS ditolak.");
      setLoading(false);
    });
  };

  // Eksekusi penarikan data BMKG saat kabupaten/kota dipilih
  useEffect(() => {
    if (!selectedReg) return;
    
    const regObj: any = regencies.find((r: any) => r.id === selectedReg);
    if (regObj) setLocationName(regObj.name);

    const fetchMosqRisk = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        // Ambil mapping regency ke adm4 (Kemendagri 2022) dari file lokal
        const mapRes = await fetch("/regency_to_adm4.json");
        const regencyMap = await mapRes.json();
        const adm4 = regencyMap[selectedReg];
        
        if (!adm4) throw new Error("Data wilayah tidak didukung oleh BMKG.");
        
        // Hit Backend FastAPI
        const backendRes = await fetch(`http://localhost:8000/api/mosqrisk?adm4=${adm4}`);
        const backendData = await backendRes.json();
        
        if (backendData.success) {
            setMosqRiskData(backendData.data);
        } else {
            setErrorMsg(backendData.error || "Gagal mengambil data cuaca dari backend.");
            setMosqRiskData(null);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Terjadi kesalahan saat memproses lokasi.");
        setMosqRiskData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMosqRisk();
  }, [selectedReg, regencies]);

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex flex-col min-h-screen pt-20 md:pt-24 font-['Plus_Jakarta_Sans'] antialiased">
      {/* Navigation Bar */}
      <Navbar rightAction={
        <button 
          onClick={() => {
            if (isEmailRegistered) return;
            if (isPremium) setIsWAModalOpen(true);
            else setIsPremiumAlertOpen(true);
          }}
          className={`flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full font-bold text-[15px] transition-all duration-300 shrink-0 shadow-sm ${isEmailRegistered ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-[#3552EB] text-white hover:bg-[#2841C5] hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer'}`}
          title={isEmailRegistered ? "Notifikasi Email Sudah Aktif" : "Aktifkan Notifikasi Email"}
        >
          <span className="material-symbols-outlined text-[20px] md:hidden">
            {isEmailRegistered ? 'mark_email_read' : 'notifications_active'}
          </span>
          <span className="hidden md:block">
            {isEmailRegistered ? 'Notifikasi Aktif' : isPremium ? 'Aktifkan Alert Darurat' : 'Aktifkan Peringatan'}
          </span>
        </button>
      } />

      {/* Main Content */}
      <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? 'opacity-100 blur-0 translate-y-0 scale-100' : 'opacity-0 blur-md translate-y-8 scale-95'}`}>
        <main id="beranda" className="flex-grow pt-24 pb-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dashboard Segment */}
          
          {/* Location Button (Compact) */}
          <div 
            className="col-span-1 lg:col-span-12 flex justify-between items-center bg-surface rounded-[20px] p-4 md:p-6 shadow-sm border border-outline/10 cursor-pointer hover:bg-surface-dim transition-colors" 
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">location_on</span>
              <div>
                <p className="font-label-sm text-xs md:text-sm text-on-surface-variant">Lokasi Pemantauan {isPremium && <span className="ml-2 bg-[#EAC775] text-[#1A3626] px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">Premium</span>}</p>
                <p className="font-headline-md text-sm md:text-base text-primary font-bold">
                  {locationName ? `${locationName}${provinces.find((p:any) => p.id === selectedProv) ? `, ${(provinces.find((p:any) => p.id === selectedProv) as any).name}` : ''}` : "Ketuk untuk memilih lokasi..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              {loading && <span className="material-symbols-outlined animate-spin text-primary">sync</span>}
              {!loading && errorMsg && <span className="material-symbols-outlined text-danger" title={errorMsg}>error</span>}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm md:text-base">edit_location</span>
              </div>
            </div>
          </div>

          
          
              {/* Left Column */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 md:gap-8">
          {/* Risk Score Card */}
          <div className="flex flex-col items-center justify-center text-center bg-surface rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 md:p-8 relative overflow-hidden">
            {!mosqRiskData && !loading && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <p className="text-on-surface-variant font-label-md bg-white px-4 py-2 rounded-full shadow-sm">Pilih Lokasi Terlebih Dahulu</p>
              </div>
            )}
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">TINGKAT RISIKO SAAT INI</h2>
            <div className="relative w-40 h-20 md:w-48 md:h-24 overflow-hidden mb-4">
              {/* Semi-circle gauge visualization placeholder */}
              <div 
                className={`absolute inset-0 rounded-t-full border-[12px] md:border-[16px] border-b-0 border-transparent transition-all duration-1000 ${mosqRiskData ? (mosqRiskData.risk_status === 'TINGGI' ? 'bg-gradient-to-tr from-warning to-danger' : mosqRiskData.risk_status === 'SEDANG' ? 'bg-gradient-to-tr from-yellow-300 to-warning' : 'bg-gradient-to-tr from-green-300 to-primary') : 'bg-surface-variant'}`}
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              ></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[136px] h-[68px] md:w-40 md:h-20 bg-surface rounded-t-full border-[8px] md:border-[12px] border-b-0 border-white"></div>
              <div className="absolute bottom-1 md:bottom-2 w-full text-center">
                <span className="font-display-md md:font-display-lg text-primary text-3xl md:text-5xl font-bold">{mosqRiskData ? mosqRiskData.risk_score : "-"}</span>
                <span className="text-on-surface-variant text-xs md:text-sm">/100</span>
              </div>
            </div>
            <div className={`px-4 py-1 rounded-full font-label-sm text-label-sm uppercase flex items-center gap-1 ${mosqRiskData ? (mosqRiskData.risk_status === 'TINGGI' ? 'bg-danger/10 text-danger' : mosqRiskData.risk_status === 'SEDANG' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary') : 'bg-surface-variant text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[16px]">{mosqRiskData ? 'warning' : 'help'}</span>
              RISIKO {mosqRiskData ? mosqRiskData.risk_status : "BELUM DIKETAHUI"}
            </div>
            {isPremium && mosqRiskData && (
              <div className="mt-4 w-full bg-[#EAC775]/20 border border-[#EAC775]/50 rounded-xl p-3 flex flex-col gap-1.5 items-start text-left animate-in zoom-in duration-300">
                <div className="font-black text-[#1A3626] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">radar</span> PERINGATAN DINI GEOSPASIAL
                </div>
                <div className="text-xs text-[#1A3626]/90 font-medium leading-relaxed">
                  <span className="text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded shadow-sm mr-1">AMAN</span> 
                  Tidak ada laporan kasus positif DBD dari tetangga di radius 1 KM dari Anda saat ini.
                </div>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="rounded-[20px] bg-primary text-white p-6 md:p-8 relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute right-[-20%] bottom-[-20%] opacity-20 w-64 h-64 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-[200px] text-white">sanitizer</span>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="font-headline-md text-headline-md font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">warning</span>
                TINDAKAN DISARANKAN
              </h3>
              <p className="font-body-md text-body-md text-white/90 mb-6 leading-relaxed">
                {mosqRiskData 
                  ? (mosqRiskData.risk_status === 'TINGGI' ? "Aktivitas nyamuk sedang tinggi. Gunakan semprotan Patchmos setiap 3-4 jam. Prioritaskan perlindungan area kamar tidur anak." : "Aktivitas nyamuk normal. Gunakan Patchmos saat beraktivitas di luar ruangan atau saat tidur.") 
                  : "Menunggu pemilihan lokasi untuk memberikan saran yang akurat."}
              </p>
              <div className="flex items-center gap-2 font-label-md text-xs md:text-label-md text-warning mb-6 md:mb-8 bg-black/20 p-3 rounded-lg w-fit">
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">timer</span>
                Estimasi Proteksi: {mosqRiskData ? "4" : "-"} Jam
              </div>
              {isPremium ? (
                <Link
                  href="/checkout"
                  className="w-full bg-[#EAC775] text-[#1A3626] font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d4b05a] transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg border border-yellow-400"
                >
                  <span className="text-lg">👑</span> Beli Ulang (Diskon Premium 15%)
                </Link>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full bg-white text-primary font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <span className="text-lg">🛒</span> Beli Patchmos Spray
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6 md:gap-8">
          {/* Weather Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 relative">
            {!mosqRiskData && !loading && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-[20px]">
                <p className="text-on-surface-variant font-label-md bg-white px-4 py-2 rounded-full shadow-sm">Pilih Lokasi Terlebih Dahulu</p>
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 bg-surface rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 md:p-8">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-lg md:text-3xl">rainy</span>
              </div>
              <div>
                <p className="font-label-sm text-xs md:text-label-sm text-on-surface-variant">Curah Hujan</p>
                <p className="font-headline-md text-base md:text-headline-md text-primary">{mosqRiskData && mosqRiskData.precipitation_mm !== undefined ? mosqRiskData.precipitation_mm : "-"} <span className="text-xs md:text-sm">mm</span></p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 bg-surface rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 md:p-8">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0">
                <span className="material-symbols-outlined text-lg md:text-3xl">device_thermostat</span>
              </div>
              <div>
                <p className="font-label-sm text-xs md:text-label-sm text-on-surface-variant">Suhu</p>
                <p className="font-headline-md text-base md:text-headline-md text-danger">{mosqRiskData ? mosqRiskData.temperature_celsius : "-"} <span className="text-xs md:text-sm">°C</span></p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 bg-surface rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 md:p-8">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                <span className="material-symbols-outlined text-lg md:text-3xl">humidity_percentage</span>
              </div>
              <div>
                <p className="font-label-sm text-xs md:text-label-sm text-on-surface-variant">Kelembaban</p>
                <p className="font-headline-md text-base md:text-headline-md text-warning">{mosqRiskData ? mosqRiskData.humidity_percent : "-"} <span className="text-xs md:text-sm">%</span></p>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="flex-grow flex flex-col bg-surface rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 md:p-10 relative">
            {!mosqRiskData && !loading && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-[20px]">
                <p className="text-on-surface-variant font-label-md bg-white px-4 py-2 rounded-full shadow-sm">Pilih Lokasi Terlebih Dahulu</p>
              </div>
            )}
            <h3 className="font-headline-md text-base md:text-headline-md text-primary mb-4 md:mb-6">
              {isPremium ? "Tren Risiko Geospasial (Prakiraan 3 Hari)" : "Tren Risiko (Hari Ini)"}
            </h3>
            <div className="flex-grow w-full bg-surface-container-low rounded-lg relative overflow-hidden min-h-[250px] md:min-h-[200px]">
              {mosqRiskData?.trend ? (
                <>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={mosqRiskData.trend} 
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPremium ? "#EAC775" : "#BA1A1A"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={isPremium ? "#EAC775" : "#BA1A1A"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#44474E' }} dy={10} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isPremium ? '#F4F6F5' : 'white' }}
                      itemStyle={{ color: isPremium ? '#1A3626' : '#BA1A1A', fontWeight: 'bold' }}
                      formatter={(value: any) => [`${value} / 100`, 'Skor Risiko']}
                    />
                    <Area type="monotone" dataKey="risk_score" stroke={isPremium ? "#EAC775" : "#BA1A1A"} strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
                {!isPremium && (
                  <div 
                    onClick={() => setIsPremiumAlertOpen(true)}
                    className="absolute top-0 right-0 w-[66%] h-full bg-[#F4F6F5] z-10 flex flex-col items-center justify-center rounded-l-[32px] border-l-2 border-dashed border-[#1A3626]/20 shadow-[-15px_0_25px_rgba(0,0,0,0.05)] cursor-pointer group"
                  >
                    <div className="bg-[#1A3626] p-2 md:p-3 rounded-full shadow-lg mb-2 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[#EAC775] text-xl md:text-2xl">lock</span>
                    </div>
                    <p className="text-xs md:text-sm font-black text-[#1A3626] text-center px-4 group-hover:text-green-800 transition-colors">
                      Buka Prakiraan H+3
                      <br/>
                      <span className="font-medium text-[10px] md:text-xs text-gray-700">Khusus Pengguna Premium</span>
                    </p>
                  </div>
                )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-danger/20 to-transparent flex items-end">
                  <svg className="w-full h-3/4 fill-danger/10 stroke-danger stroke-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M0,50 L0,30 C20,20 40,40 60,10 C80,-10 90,20 100,5 L100,50 Z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Eco Impact */}
          <div className="bg-surface-tint/5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 md:p-8">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg md:text-3xl">eco</span>
            </div>
            <div>
              <p className="font-body-md text-sm md:text-body-md text-on-surface-variant mb-1">Dampak Lingkungan</p>
              <p className="font-label-md text-sm md:text-label-md text-on-surface">Bulan ini, Anda telah membantu menyelamatkan <strong className="text-primary">{impactKg} kg</strong> limbah ampas nilam Aceh.</p>
            </div>
          </div>
        </div>

        </main>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-0 md:p-4" onClick={() => setIsLocationModalOpen(false)}>
          <div className="bg-surface w-full md:max-w-md rounded-t-[24px] md:rounded-[24px] p-6 shadow-xl transform transition-all animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-lg text-primary font-bold">Pilih Lokasi</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-on-surface-variant p-2 rounded-full hover:bg-surface-dim bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleGPSLocation}
                className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-2"
              >
                <span className="material-symbols-outlined">my_location</span>
                Gunakan Lokasi Saat Ini (GPS)
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-px bg-outline/20"></div>
                <span className="text-xs text-on-surface-variant font-bold">ATAU</span>
                <div className="flex-1 h-px bg-outline/20"></div>
              </div>

              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Provinsi</label>
                <select 
                  className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary text-sm cursor-pointer transition-colors"
                  value={selectedProv}
                  onChange={(e) => { setSelectedProv(e.target.value); setSelectedReg(""); }}
                >
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Kota / Kabupaten</label>
                <select 
                  className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary text-sm cursor-pointer disabled:opacity-50 transition-colors"
                  value={selectedReg}
                  onChange={(e) => { setSelectedReg(e.target.value); setIsLocationModalOpen(false); }}
                  disabled={selectedProv === ""}
                >
                  <option value="">-- Pilih Kota/Kabupaten --</option>
                  {regencies.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WA Modal */}
      {isWAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-0 md:p-4" onClick={() => setIsWAModalOpen(false)}>
          <div className="bg-surface w-full md:max-w-md rounded-t-[32px] md:rounded-[32px] shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">forum</span>
                Notifikasi Email
              </h2>
              <button onClick={() => setIsWAModalOpen(false)} className="text-on-surface-variant p-2 rounded-full hover:bg-surface-dim bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            {waSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Pendaftaran Berhasil!</h3>
                <p className="text-center text-sm text-on-surface-variant px-4">
                  Sistem kami telah mendaftarkan email Anda. Anda akan menerima pesan sambutan di kotak masuk email Anda sekarang juga.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant mb-6">
                  Masukkan alamat Email Anda untuk menerima peringatan otomatis jika status risiko di daerah <strong>{locationName || "Anda"}</strong> berubah menjadi TINGGI.
                </p>

                <div className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Contoh: nama@email.com" 
                    value={waNumber}
                    onChange={e => setWaNumber(e.target.value)}
                    className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary text-sm"
                  />
                  
                  {waError && <p className="text-red-500 text-sm font-semibold">{waError}</p>}

                  <button 
                    onClick={handleWASubmit}
                    disabled={waSubmitting}
                    className="w-full bg-[#25D366] text-white font-bold py-3 rounded-lg hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {waSubmitting ? "Mendaftarkan..." : "Daftar Sekarang"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Premium Alert Modal */}
      {isPremiumAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4" onClick={() => setIsPremiumAlertOpen(false)}>
          <div className="bg-surface w-full max-w-sm rounded-[24px] shadow-2xl p-6 text-center animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-[#EAC775]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-[#EAC775]">workspace_premium</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A3626] mb-2">Fitur Khusus Premium</h3>
            <p className="text-sm text-gray-500 mb-6">
              Fitur Peringatan Dini Otomatis (Email Alert) hanya tersedia untuk pengguna Premium. Beli Patchmos Spray untuk mendapatkan kode akses Premium di dalam kemasannya!
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/checkout" className="w-full bg-[#1A3626] text-white font-bold py-3 rounded-xl hover:bg-[#0c1f13] transition-all">
                Beli Patchmos Spray
              </Link>
              <button onClick={() => setIsPremiumAlertOpen(false)} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Nasional Kemenkes */}
      <footer className="w-full bg-surface-container-highest border-t border-outline/10 mt-12 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-on-surface font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">security</span>
              Sistem Kewaspadaan Dini Nasional
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 max-w-md">
              MosqRisk adalah platform pemantauan risiko nyamuk terintegrasi yang dikembangkan bersama Kementerian Kesehatan RI dan BMKG.
            </p>
          </div>
          <div className="flex gap-4 text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors text-sm font-semibold">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors text-sm font-semibold">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors text-sm font-semibold">Kontak Darurat (119)</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-outline/10 text-center text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} Kementerian Kesehatan Republik Indonesia & MosqRisk Analytics. Hak Cipta Dilindungi.
        </div>
      </footer>

    </div>
  );
}
