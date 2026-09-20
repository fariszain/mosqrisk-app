"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MosquitoCycle = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev - 90);
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { num: "01", title: "Telur", desc: "Diletakkan di dinding wadah berisi air. Bertahan kering berbulan-bulan, menunggu air menetas.", detail: "~100 telur per siklus", emoji: "🥚" },
    { num: "02", title: "Jentik (Larva)", desc: "Hidup di air tenang selama 5-10 hari. Target utama program 3M karena sangat mudah dibasmi.", detail: "5-10 hari di air", emoji: "🪱" },
    { num: "03", title: "Pupa", desc: "Fase istirahat 2-4 hari. Pupa tidak makan, hanya bernapas di permukaan air sebelum berubah menjadi nyamuk.", detail: "2-4 hari transformasi", emoji: "🫘" },
    { num: "04", title: "Nyamuk Dewasa", desc: "Betina menggigit manusia untuk protein darah. Sangat aktif pada pagi (08-10) dan sore (16-18) hari.", detail: "Hidup 2-4 minggu", emoji: "🦟" },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 max-w-5xl mx-auto mt-16 mb-8 px-4">
      {/* Circle Wheel */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#EAC775]/50"
          style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            let posClass = "";
            if (i === 0) posClass = "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
            if (i === 1) posClass = "top-1/2 right-0 translate-x-1/2 -translate-y-1/2";
            if (i === 2) posClass = "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
            if (i === 3) posClass = "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";

            return (
              <div key={i} className={`absolute ${posClass}`}>
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-xl border-4 transition-all duration-700 ${isActive ? 'bg-[#1A3626] border-[#EAC775] text-white scale-[1.15] shadow-2xl' : 'bg-white border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer'}`}
                  style={{ transform: `rotate(${-rotation}deg)`, transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  onClick={() => {
                    const diff = (i - activeStep + 4) % 4;
                    setRotation(r => r - (diff * 90));
                    setActiveStep(i);
                  }}
                >
                  {step.emoji}
                </div>
              </div>
            )
          })}
        </div>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="block text-5xl md:text-6xl font-black text-[#1A3626]/10 mb-1">{steps[activeStep].num}</span>
            <span className="block text-sm font-bold text-[#EAC775] uppercase tracking-widest">Siklus</span>
          </div>
        </div>
      </div>

      {/* Active Content Card */}
      <div className="flex-1 w-full max-w-lg">
        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden h-full transition-all duration-500">
          <div className="text-[120px] font-black text-[#1A3626]/5 absolute -right-8 -top-8 leading-none">{steps[activeStep].num}</div>
          <h3 className="text-3xl font-extrabold text-[#1A3626] mb-4 relative z-10">{steps[activeStep].title}</h3>
          <p className="text-[#414844] text-lg leading-relaxed mb-8 relative z-10 min-h-[90px]">{steps[activeStep].desc}</p>
          <div className="inline-flex items-center gap-2 bg-[#F4F7F4] px-4 py-2 rounded-full border border-green-100 text-[#1A3626] text-[13px] font-bold relative z-10">
            <span className="material-symbols-outlined text-lg text-[#EAC775]">info</span>
            {steps[activeStep].detail}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EdukasiPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [climateData, setClimateData] = useState([]);
  const [climatePeriod, setClimatePeriod] = useState('');
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchClimateData = async (lat: number, lon: number) => {
      try {
        setIsLoadingChart(true);
        // Bulatkan koordinat ke 2 desimal agar konsisten
        const roundedLat = Math.round(lat * 100) / 100;
        const roundedLon = Math.round(lon * 100) / 100;
        
        // Simpan ke localStorage agar refresh berikutnya konsisten
        try {
          localStorage.setItem('edukasi_lat', String(roundedLat));
          localStorage.setItem('edukasi_lon', String(roundedLon));
        } catch(e) { /* ignore */ }
        
        const res = await fetch(`http://127.0.0.1:8000/api/climate-trend?lat=${roundedLat}&lon=${roundedLon}`);
        const result = await res.json();
        
        if (result.success && result.data) {
          setClimateData(result.data);
          if (result.period) setClimatePeriod(result.period);
        } else {
          console.error("API Error:", result.error);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoadingChart(false);
      }
    };

    // Cek apakah sudah ada koordinat tersimpan
    try {
      const cachedLat = localStorage.getItem('edukasi_lat');
      const cachedLon = localStorage.getItem('edukasi_lon');
      if (cachedLat && cachedLon) {
        fetchClimateData(parseFloat(cachedLat), parseFloat(cachedLon));
        return;
      }
    } catch(e) { /* ignore */ }

    // Jika belum ada, ambil dari GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchClimateData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("GPS denied/timeout, fallback to Jakarta");
          fetchClimateData(-6.20, 106.81);
        },
        { timeout: 15000, maximumAge: 300000 }
      );
    } else {
      fetchClimateData(-6.20, 106.81);
    }
  }, []);

  // Hitung bulan dengan risiko tertinggi untuk highlight
  const peakMonth = climateData.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? climateData.reduce((prev: any, curr: any) => (curr.risiko > prev.risiko ? curr : prev), climateData[0])
    : null;

  return (
    <div className="w-full flex flex-col min-h-screen font-['Plus_Jakarta_Sans'] antialiased">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — APA ITU DBD? */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="seksi-dbd" className="relative w-full min-h-[90vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/aedes-aegypti.jpg"
            alt="Nyamuk Aedes aegypti"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient Overlay to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a12] via-[#1A3626]/80 to-[#1A3626]/40" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center mt-10">
          <RevealOnScroll>
            <div className="flex flex-col items-center">
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                Apa Itu <span className="text-[#E07A5F]">Demam Berdarah?</span>
              </h1>
              
              <p className="text-gray-200 leading-relaxed text-lg md:text-xl mb-12 max-w-3xl mx-auto font-light">
                <strong>Demam Berdarah Dengue (DBD)</strong> adalah penyakit yang ditularkan melalui gigitan nyamuk <em>Aedes aegypti</em> yang terinfeksi virus dengue. Penyakit ini merupakan ancaman kesehatan terbesar di daerah tropis.
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full max-w-5xl mx-auto">
                {/* Warning Card */}
                <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-2xl p-6 flex-1 text-left">
                  <h4 className="font-bold text-red-400 text-sm mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    Fase Kritis (Hari ke-3 s/d ke-7)
                  </h4>
                  <p className="text-red-100/90 text-[15px] leading-relaxed">
                    Pada fase ini trombosit turun drastis dan risiko perdarahan meningkat. 
                    Segera ke rumah sakit jika suhu tubuh anak Anda tiba-tiba turun namun kondisinya terlihat memburuk.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <p className="text-3xl md:text-5xl font-black text-[#EAC775]">161.752</p>
                    <p className="text-gray-300 text-sm md:text-base mt-2 font-medium">Kasus DBD 2025</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                       <span className="material-symbols-outlined text-[100px]">coronavirus</span>
                    </div>
                    <p className="text-3xl md:text-5xl font-black text-[#EAC775]">706.297</p>
                    <p className="text-gray-300 text-sm md:text-base mt-2 font-medium">Kasus Malaria 2025</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-6 text-center w-full">Sumber: Kementerian Kesehatan Republik Indonesia, Proyeksi Kasus 2025</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI GEJALA & LAINNYA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#F4F7F4] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Gejala Grid */}
          <RevealOnScroll delay={200}>
            <h3 className="text-2xl font-extrabold text-[#1A3626] mb-8 text-center">
              Gejala Utama DBD
            </h3>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "thermostat", title: "Demam Tinggi Mendadak", desc: "Suhu tubuh 38-40°C selama 2-7 hari tanpa penyebab jelas" },
              { icon: "bloodtype", title: "Bintik Merah (Petekie)", desc: "Bercak merah kecil muncul di kulit akibat pembuluh darah pecah" },
              { icon: "sentiment_very_dissatisfied", title: "Nyeri Otot & Sendi", desc: "Nyeri hebat di otot, sendi, dan belakang mata (breakbone fever)" },
              { icon: "hotel", title: "Mual & Lemas", desc: "Mual, muntah, kehilangan nafsu makan, dan kelelahan ekstrem" },
            ].map((gejala, i) => (
              <RevealOnScroll key={i} delay={300 + i * 100}>
                <div className="bg-white text-[#1A3626] border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 hover:border-[#EAC775]/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F7F4] border border-green-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-[#1A3626]">{gejala.icon}</span>
                  </div>
                  <h4 className="font-bold text-[15px] mb-2">{gejala.title}</h4>
                  <p className="text-[13px] leading-relaxed opacity-80">{gejala.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 3 — SIKLUS HIDUP NYAMUK (Redesigned with Pastel Watermark Theme) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="seksi-siklus" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A3626] tracking-tight mb-4">
                Siklus Hidup Aedes aegypti
              </h2>
              <p className="text-[#414844] text-lg max-w-2xl mx-auto">
                Memahami siklus hidup nyamuk adalah kunci memutus rantai penularan Demam Berdarah Dengue.
              </p>
              <div className="w-24 h-1.5 bg-[#EAC775] rounded-full mx-auto mt-6"></div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <MosquitoCycle />
          </RevealOnScroll>

          <RevealOnScroll delay={600}>
            <div className="mt-12 bg-white border border-gray-100 rounded-3xl p-8 max-w-4xl mx-auto flex items-start gap-4 shadow-sm">
              <span className="material-symbols-outlined text-[#EAC775] text-3xl">lightbulb</span>
              <div>
                <h4 className="font-bold text-[#1A3626] mb-1">Tahukah Anda?</h4>
                <p className="text-[#414844] text-[15px] leading-relaxed">
                  Nyamuk <em>Aedes aegypti</em> berkembang biak optimal pada suhu <strong>26-30°C</strong> dan 
                  kelembapan <strong>≥70%</strong> — parameter inilah yang diukur otomatis oleh <strong>MosqRisk Analytics</strong>.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 4 — PENCEGAHAN 3M PLUS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="seksi-3m" className="py-24 bg-gradient-to-br from-[#1A3626] to-[#0c1a12] text-white relative overflow-hidden">
        {/* Giant background watermark */}
        <div className="absolute left-[5%] bottom-[-10%] opacity-5 transform rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[350px] text-white">shield</span>
        </div>
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#EAC775]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <div className="mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Metode <span className="text-[#EAC775]">3M Plus</span>
              </h2>
              <p className="text-white/80 max-w-xl text-[16px] leading-relaxed">
                Program pencegahan DBD yang terbukti ampuh memutus rantai penularan dari sarangnya.
              </p>
            </div>
          </RevealOnScroll>

          {/* 3M Cards — Dark UI Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                num: "1",
                title: "Menguras",
                desc: "Bersihkan bak mandi, ember, dan semua penampungan air minimal seminggu sekali. Sikat dinding wadah agar telur nyamuk lepas.",
              },
              {
                num: "2",
                title: "Menutup",
                desc: "Tutup rapat wadah penyimpanan air (drum, tangki, gentong) agar nyamuk tidak bisa masuk dan meletakkan telurnya.",
              },
              {
                num: "3",
                title: "Mendaur Ulang",
                desc: "Kubur atau manfaatkan barang bekas (ban, kaleng, botol) yang berpotensi menampung air hujan dan menjadi sarang.",
              },
            ].map((item, i) => (
              <RevealOnScroll key={i} delay={i * 150}>
                <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-[#EAC775]/30 transition-all duration-300 h-full group`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAC775] flex items-center justify-center text-[#1A3626] text-2xl font-extrabold shadow-[0_0_15px_rgba(234,199,117,0.3)] group-hover:scale-110 transition-transform duration-300">
                      {item.num}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70 text-[14px] leading-relaxed">{item.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 5 — CARA KERJA MOSQRISK ANALYTICS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="seksi-analytics" className="py-24 bg-[#F4F7F4] relative overflow-hidden">
        {/* Giant background text for depth */}
        <div className="absolute left-10 top-10 opacity-[0.02] pointer-events-none select-none font-black text-[200px] text-[#1A3626] leading-none">
          AI
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A3626] tracking-tight mb-4">
                Cara Kerja <span className="text-[#EAC775]">MosqRisk</span> Analytics
              </h2>
              <p className="text-[#414844] text-lg max-w-2xl mx-auto">
                Sistem peringatan dini (Early Warning System) cerdas berbasis data BMKG.
              </p>
              <div className="w-24 h-1.5 bg-[#EAC775] rounded-full mx-auto mt-6"></div>
            </div>
          </RevealOnScroll>

          {/* How it works flow */}
          <RevealOnScroll delay={50}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { step: "1", icon: "cloud_download", title: "Ambil Data BMKG", desc: "Mengambil data prakiraan suhu, kelembapan, dan hujan secara real-time" },
                { step: "2", icon: "calculate", title: "Hitung Risk Score", desc: "Parameter diberi skor bobot menggunakan algoritma kustom Mosquito Risk" },
                { step: "3", icon: "map", title: "Visualisasi Peta", desc: "Skor dipetakan dalam zona Rendah, Sedang, atau Tinggi di dasbor" },
              ].map((flow, i) => (
                <div key={i} className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 bg-white rounded-3xl p-8 border border-green-100/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f5ec] border border-green-200 flex items-center justify-center text-[#1A3626] font-extrabold text-xl shrink-0">
                    {flow.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A3626] text-lg mb-2">{flow.title}</h4>
                    <p className="text-[#414844] text-[14px] leading-relaxed">{flow.desc}</p>
                  </div>
                  {i < 2 && (
                    <span className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-[#1A3626]/20 text-3xl z-10 font-bold">→</span>
                  )}
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Parameter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                param: "Suhu (°C)",
                icon: "thermostat",
                weight: 40,
                ideal: "26 – 30°C",
                ranges: [
                  { label: "26-30°C (Ideal)", score: 40, bar: "w-full", color: "bg-[#1A3626]" },
                  { label: "24-26°C / 30-32°C", score: 25, bar: "w-[62%]", color: "bg-[#EAC775]" },
                  { label: "< 24°C / > 32°C", score: 10, bar: "w-[25%]", color: "bg-red-400" },
                ],
              },
              {
                param: "Kelembapan (%)",
                icon: "water_drop",
                weight: 30,
                ideal: "≥ 80%",
                ranges: [
                  { label: "≥ 80%", score: 30, bar: "w-full", color: "bg-[#1A3626]" },
                  { label: "70 – 80%", score: 20, bar: "w-[67%]", color: "bg-[#EAC775]" },
                  { label: "< 70%", score: 10, bar: "w-[33%]", color: "bg-red-400" },
                ],
              },
              {
                param: "Curah Hujan (mm)",
                icon: "rainy",
                weight: 30,
                ideal: "0.5 – 20 mm",
                ranges: [
                  { label: "0.5-20mm (Genangan ideal)", score: 30, bar: "w-full", color: "bg-[#1A3626]" },
                  { label: "> 20mm (Jentik tersapu)", score: 15, bar: "w-[50%]", color: "bg-[#EAC775]" },
                  { label: "< 0.5mm (Kering)", score: 10, bar: "w-[33%]", color: "bg-red-400" },
                ],
              },
            ].map((param, i) => (
              <RevealOnScroll key={i} delay={i * 150}>
                <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg hover:-translate-y-1 hover:border-[#EAC775]/50 transition-all duration-300 h-full shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F4F7F4] border border-green-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#1A3626] text-2xl">{param.icon}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#1A3626]">{param.param}</h3>
                    </div>
                  </div>
                  
                  <div className="mb-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] text-[#414844]">Bobot Sistem:</span>
                      <span className="font-extrabold text-[#1A3626]">{param.weight}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#414844]">Rentang Ideal:</span>
                      <span className="font-extrabold text-[#1A3626]">{param.ideal}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {param.ranges.map((range, j) => (
                      <div key={j}>
                        <div className="flex justify-between text-[13px] mb-1.5">
                          <span className="text-[#414844] font-medium">{range.label}</span>
                          <span className="font-bold text-[#1A3626]">{range.score} pts</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${range.bar} ${range.color} rounded-full transition-all duration-700`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Kategori */}
          <RevealOnScroll delay={500}>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 mb-8">
              <h3 className="text-2xl font-bold text-[#1A3626] mb-8 text-center">Indikator Tingkat Risiko</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                  <span className="text-5xl mb-3 block">🟢</span>
                  <h4 className="text-xl font-extrabold text-green-700 mb-1">RENDAH</h4>
                  <p className="text-green-600 font-bold text-sm mb-3">Skor &lt; 50</p>
                  <p className="text-green-600/80 text-[13px] leading-relaxed">Risiko infeksi minim. Tetap jaga kebersihan sanitasi.</p>
                </div>
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                  <span className="text-5xl mb-3 block">🟡</span>
                  <h4 className="text-xl font-extrabold text-yellow-700 mb-1">SEDANG</h4>
                  <p className="text-yellow-600 font-bold text-sm mb-3">Skor 50 – 74</p>
                  <p className="text-yellow-600/80 text-[13px] leading-relaxed">Waspada! Awasi potensi genangan air di sekitar rumah.</p>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                  <span className="text-5xl mb-3 block">🔴</span>
                  <h4 className="text-xl font-extrabold text-red-700 mb-1">TINGGI</h4>
                  <p className="text-red-600 font-bold text-sm mb-3">Skor ≥ 75</p>
                  <p className="text-red-600/80 text-[13px] leading-relaxed">Kritis! Lakukan 3M Plus dan semprotkan Patchmos Spray.</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Tren Grafik */}
          <RevealOnScroll delay={550}>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 mb-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#1A3626] mb-2 text-center">Tren Curah Hujan vs Risiko DBD</h3>
                {climatePeriod && (
                  <p className="text-[#E07A5F] font-semibold text-sm text-center mb-1">📅 Periode: {climatePeriod}</p>
                )}
                <p className="text-[#414844] text-[14px] text-center max-w-2xl mx-auto">
                  Data historis aktual dari Open-Meteo menunjukkan korelasi antara tingginya curah hujan 
                  dan peningkatan skor risiko penyebaran nyamuk di daerah Anda.
                </p>
              </div>
              <div className="h-[400px] w-full relative flex items-center justify-center">
                {isLoadingChart ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-[#E07A5F] text-4xl">sync</span>
                    <p className="text-[#414844] font-medium text-sm">Menarik data 1 tahun terakhir...</p>
                  </div>
                ) : isMounted && climateData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={climateData}
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 0,
                      }}
                    >
                      <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#f8fcf9' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar yAxisId="left" dataKey="hujan" name="Curah Hujan (mm)" fill="#1A3626" opacity={0.15} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="risiko" name="Skor Risiko (0-100)" stroke="#EAC775" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#EAC775', strokeWidth: 2 }} />
                      <Line yAxisId="right" type="monotone" dataKey="suhu" name="Suhu Rata-rata (°C)" stroke="#1A3626" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Highlight Bulan Puncak Risiko */}
              {peakMonth && !isLoadingChart && (
                <div className="mt-6 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200/60 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                    <span className="material-symbols-outlined text-white text-3xl">crisis_alert</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">⚠️ Bulan Puncak Risiko Tertinggi</p>
                    <h4 className="text-2xl font-extrabold text-[#1A3626]">{peakMonth.name}</h4>
                    <p className="text-[#414844] text-sm mt-1">
                      Bulan dengan risiko penyebaran nyamuk DBD tertinggi dalam 12 bulan terakhir di wilayah Anda.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
                      <p className="text-2xl font-black text-[#E07A5F]">{peakMonth.risiko}</p>
                      <p className="text-[11px] text-gray-500 font-medium">Skor Risiko</p>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
                      <p className="text-2xl font-black text-blue-600">{peakMonth.hujan}</p>
                      <p className="text-[11px] text-gray-500 font-medium">mm Hujan</p>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
                      <p className="text-2xl font-black text-[#1A3626]">{peakMonth.suhu}°</p>
                      <p className="text-[11px] text-gray-500 font-medium">Rata-rata</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 6 — NILAM SEBAGAI BIO-REPELLENT (with image) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="seksi-nilam" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#EAC775]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A3626] tracking-tight mb-4">
                Nilam: <span className="text-[#EAC775]">Bio-Repellent</span> Alami
              </h2>
              <p className="text-[#414844] text-lg max-w-2xl mx-auto">
                Solusi pengusir nyamuk alami dari limbah tanaman nilam khas Aceh
              </p>
              <div className="w-24 h-1.5 bg-[#EAC775] rounded-full mx-auto mt-6"></div>
            </div>
          </RevealOnScroll>

          {/* Nilam Image Banner */}
          <RevealOnScroll delay={50}>
            <div className="relative rounded-3xl overflow-hidden mb-12 h-[300px] md:h-[400px] shadow-xl">
              <Image
                src="/nilam-patchouli.jpg"
                alt="Daun nilam (patchouli) dan produk Patchmos Spray"
                fill
                className="object-cover"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3626]/90 via-[#1A3626]/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12">
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                  Dari Limbah Menjadi <span className="text-[#EAC775]">Pelindung</span>
                </h3>
                <p className="text-white/80 text-[15px] md:text-[17px] max-w-2xl leading-relaxed">
                  Indonesia menguasai 90% pasar minyak nilam dunia. Ampas nilam yang sebelumnya terbuang, 
                  kini diolah menjadi bio-repellent alami yang aman dan 100% bebas DEET kimia.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <RevealOnScroll delay={100}>
              <div className="bg-[#f8fcf9] rounded-3xl shadow-sm border border-green-100/50 p-10 h-full">
                <h3 className="text-2xl font-bold text-[#1A3626] mb-5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600 text-3xl">psychology</span>
                  Mengapa Memilih Nilam?
                </h3>
                <p className="text-[#414844] text-[15px] leading-relaxed mb-8">
                  Ampas nilam masih mengandung senyawa <strong>Patchouli alcohol</strong> yang terbukti secara laboratorium efektif 
                  menolak gigitan nyamuk. Pendekatan ini mendukung konsep <em>circular economy</em> bagi petani di Aceh.
                </p>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-green-200 transition-colors">
                    <span className="material-symbols-outlined text-[#1A3626] text-2xl mt-0.5 shrink-0">science</span>
                    <div>
                      <h4 className="font-bold text-[#1A3626] text-[15px] mb-1">Kandungan Aktif Terpenoid</h4>
                      <p className="text-[#414844] text-[13px] leading-relaxed">Senyawa murni pembenci nyamuk alami tanpa efek samping gangguan pernapasan.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-green-200 transition-colors">
                    <span className="material-symbols-outlined text-[#1A3626] text-2xl mt-0.5 shrink-0">volunteer_activism</span>
                    <div>
                      <h4 className="font-bold text-[#1A3626] text-[15px] mb-1">Mendukung Petani Lokal</h4>
                      <p className="text-[#414844] text-[13px] leading-relaxed">Menambah nilai ekonomi dari limbah pertanian yang sebelumnya dibakar atau dibuang.</p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={250}>
              <div className="bg-gradient-to-br from-[#1A3626] to-[#0c1a12] rounded-3xl p-10 border border-[#EAC775]/20 shadow-2xl h-full text-white relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[300px] text-[#EAC775]">verified_user</span>
                </div>

                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
                  <span className="material-symbols-outlined text-[#EAC775] text-3xl">star</span>
                  Keunggulan Patchmos Spray
                </h3>
                
                <div className="space-y-5 relative z-10">
                  {[
                    { icon: "block", title: "100% Bebas Bahan DEET", desc: "Aman untuk bayi, ibu hamil, dan kulit sangat sensitif." },
                    { icon: "timer", title: "Proteksi Kuat 6 Jam", desc: "Formulasi mikroenkapsulasi menjaga molekul penolak menguap perlahan." },
                    { icon: "recycling", title: "Zero Waste Product", desc: "Produk ramah lingkungan 100% dari ampas daur ulang (upcycled)." },
                    { icon: "health_and_safety", title: "Teruji Laboratorium", desc: "Estimasi berdasarkan literatur akademik terbukti efektif mengusir nyamuk." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-[#EAC775]/20 border border-[#EAC775]/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#EAC775] text-2xl">{item.icon}</span>
                      </div>
                      <div className="pt-1">
                        <h4 className="font-bold text-[15px] mb-1">{item.title}</h4>
                        <p className="text-white/70 text-[13px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/checkout"
                  className="mt-10 w-full bg-[#EAC775] text-[#1A3626] hover:bg-yellow-400 font-extrabold py-5 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(234,199,117,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 text-lg relative z-10"
                >
                  <span className="material-symbols-outlined font-bold">shopping_bag</span>
                  Beli Patchmos Sekarang
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
