"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClaimModal from "@/components/ClaimModal";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function LandingPage() {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    setTimeout(() => setIsPremium(localStorage.getItem('isPremium') === 'true'), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col justify-center pt-32 pb-20 lg:pt-0 lg:pb-0 overflow-hidden bg-gradient-to-b from-surface-container-low to-background">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EAC775]/10 rounded-full blur-[120px] -ml-20 -mb-20 pointer-events-none"></div>

        {/* Decorative Assets to fill empty sides */}
        <div className={`absolute top-[35%] right-[2%] hidden xl:block pointer-events-none motion-float-slow transition-all duration-1000 delay-300 ease-out transform ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
          <Image src="/spray-square.png" alt="Produk Patchmos" width={350} height={350} priority className="w-[350px] h-[350px] object-contain drop-shadow-2xl transform rotate-12" />
        </div>
        <div className={`absolute bottom-[20%] left-[3%] hidden xl:block pointer-events-none blur-[1px] motion-float-normal transition-all duration-1000 delay-500 ease-out transform ${isMounted ? 'opacity-40 -translate-x-0' : 'opacity-0 -translate-x-12'}`}>
          <Image src="/spray-square.png" alt="" width={200} height={200} className="w-[200px] h-[200px] object-contain drop-shadow-xl transform -rotate-12" />
        </div>
        
        {/* Floating Icons */}
        <div className={`absolute top-[20%] left-[10%] hidden lg:block pointer-events-none text-green-900 motion-float-fast transition-all duration-1000 delay-700 ease-out transform ${isMounted ? 'opacity-[0.07] scale-100' : 'opacity-0 scale-50'}`}>
          <span className="material-symbols-outlined transform -rotate-12" style={{ fontSize: '140px', fontVariationSettings: "'FILL' 1", display: 'inline-block' }}>eco</span>
        </div>
        <div className={`absolute bottom-[15%] right-[10%] hidden lg:block pointer-events-none text-[#EAC775] motion-float-normal transition-all duration-1000 delay-200 ease-out transform ${isMounted ? 'opacity-10 scale-100' : 'opacity-0 scale-50'}`}>
          <span className="material-symbols-outlined transform rotate-12" style={{ fontSize: '100px', fontVariationSettings: "'FILL' 1", display: 'inline-block' }}>verified_user</span>
        </div>
        <div className={`absolute top-[30%] right-[15%] hidden lg:block pointer-events-none text-green-900 motion-float-slow transition-all duration-1000 delay-1000 ease-out transform ${isMounted ? 'opacity-5 scale-100' : 'opacity-0 scale-50'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '80px', display: 'inline-block' }}>spa</span>
        </div>

        <div className={`max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out transform ${isMounted ? 'opacity-100 blur-0 translate-y-0 scale-100' : 'opacity-0 blur-md translate-y-8 scale-95'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#1A3626] mb-6 leading-tight max-w-5xl tracking-tight animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            Inovasi Hijau dari Serambi Mekkah: <span className="text-[#EAC775] drop-shadow-sm">Penolak Nyamuk dari Ampas Nilam</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            Patchmos memanfaatkan ampas nilam (patchouli) sisa penyulingan di Aceh menjadi spray bio-repellent dengan bahan aktif alami, tanpa DEET, dan terhubung dengan <strong className="text-primary">Model Risiko MosqRisk</strong> yang membaca prakiraan cuaca BMKG.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <Link href="/checkout" className="w-full sm:w-auto bg-[#1A3626] hover:bg-green-900 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 text-lg">
              <span className="material-symbols-outlined text-[#EAC775]">shopping_cart</span> Beli Patchmos
            </Link>
            <Link href="/pantau" className="w-full sm:w-auto bg-white border-2 border-[#1A3626] hover:bg-[#1A3626] hover:text-white text-[#1A3626] font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 text-lg group">
              <span className="material-symbols-outlined">map</span> Cek Risiko Wilayahmu
            </Link>
          </div>
        </div>
      </section>

      {/* Pusat Klaim Premium Section */}
      <section className="py-20 bg-gradient-to-br from-[#1A3626] to-[#0c1a12] text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#EAC775]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-[#4ade80]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute right-[5%] bottom-[-5%] opacity-10 transform -rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[200px] text-[#EAC775]">qr_code_scanner</span>
        </div>
        
        <RevealOnScroll className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAC775]/20 text-[#EAC775] font-bold text-xs uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
              Pusat Klaim
            </div>
            
            {isMounted && isPremium ? (
              <>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Anda Sudah Berstatus Premium!</h2>
                <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg">
                  Terima kasih telah menggunakan Patchmos. Perangkat ini sudah punya akses penuh ke <strong>prakiraan risiko 3 hari</strong> (dari data prakiraan cuaca BMKG) dan notifikasi email MosqRisk.
                </p>
                <Link href="/pantau" className="bg-[#EAC775] text-[#1A3626] hover:bg-yellow-400 font-extrabold py-4 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(234,199,117,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 text-lg w-full sm:w-auto w-fit">
                  Buka Dasbor Pantau
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Sudah Punya Kemasan Patchmos?</h2>
                <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg">
                  Setiap kemasan Patchmos dilengkapi kode QR Premium. Scan kodenya untuk membuka <strong>prakiraan risiko 3 hari</strong> (dari data prakiraan cuaca BMKG) dan notifikasi email MosqRisk.
                </p>
                <button 
                  onClick={() => setClaimModalOpen(true)}
                  className="bg-[#EAC775] text-[#1A3626] hover:bg-yellow-400 font-extrabold py-4 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(234,199,117,0.3)] hover:shadow-[0_0_30px_rgba(234,199,117,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3 text-lg w-full sm:w-auto"
                >
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                  Scan QR / Masukkan Kode
                </button>
                <p className="mt-4 text-white/70 text-sm">Belum punya kodenya? <Link href="/checkout" className="text-[#EAC775] hover:underline">Beli Patchmos di sini.</Link></p>
              </>
            )}
          </div>
          <div className="hidden md:flex lg:col-span-5 justify-center lg:justify-end relative">
            <div className="w-72 h-72 bg-gradient-to-tr from-white/10 to-white/5 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl p-6 flex flex-col items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-inner mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0zIDNoNnY2SDN6Ii8+PHBhdGggZD0iTTE1IDNoNnY2aC02eiIvPjxwYXRoIGQ9Ik0zIDE1aDZ2NkgzeiIvPjxwYXRoIGQ9Ik05IDN2NiIvPjxwYXRoIGQ9Ik0yMSAzdiIvPjxwYXRoIGQ9Ik0zIDlWM3Y2eiIvPjxwYXRoIGQ9Ik0yMSA5VjN2NnoiLz48cGF0aCBkPSJNOSAxNXY2Ii8+PHBhdGggZD0iTTE1IDN2NiIvPjxwYXRoIGQ9Ik0xNSAxNXY2Ii8+PHBhdGggZD0iTTMgMjF2LTZ2NnoiLz48cGF0aCBkPSJNMjEgMjF2LTZ2NnoiLz48cGF0aCBkPSJNMjEgMTV2NiIvPjwvc3ZnPg==')] opacity-20 w-full h-full bg-no-repeat bg-center bg-[length:150px_150px]"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#EAC775] shadow-[0_0_15px_#EAC775] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="font-mono text-[#EAC775] font-bold tracking-widest text-lg">MOSQ-XXXX</p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Tiga Pilar Utama - Phom Inspired */}
      <section className="py-24 bg-white">
        <RevealOnScroll className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A3626] mb-6 leading-tight tracking-tight">
                Berawal dari Ampas Nilam Aceh
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                Tiga hal yang membentuk Patchmos: bahan dari limbah penyulingan nilam, formula tanpa DEET, dan sistem pemantauan risiko berbasis data cuaca.
              </p>
              <div className="hidden lg:block w-24 h-1.5 bg-[#EAC775] rounded-full"></div>
            </div>

            {/* Right Cards (Grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pilar 1 */}
              <div className="bg-[#f8fcf9] p-8 rounded-3xl hover:shadow-md transition-all duration-300 border border-green-100/50">
                <div className="text-5xl font-black text-green-200 mb-4 tracking-tighter">01</div>
                <h3 className="text-xl font-bold text-[#1A3626] mb-3">Memanfaatkan Ampas Nilam</h3>
                <p className="text-on-surface-variant leading-relaxed text-[15px]">
                  Penyulingan nilam hanya menghasilkan sekitar 1,5–3% minyak atsiri; lebih dari 95% sisanya limbah padat yang umumnya belum dimanfaatkan (Indriani dkk., 2025). Patchmos memakai ampas pascasuling ini sebagai sumber bahan aktif.
                </p>
              </div>
              
              {/* Pilar 2 */}
              <div className="bg-[#fffdf8] p-8 rounded-3xl hover:shadow-md transition-all duration-300 border border-yellow-100/50">
                <div className="text-5xl font-black text-[#EAC775]/40 mb-4 tracking-tighter">02</div>
                <h3 className="text-xl font-bold text-[#1A3626] mb-3">Tanpa DEET</h3>
                <p className="text-on-surface-variant leading-relaxed text-[15px]">
                  Bahan aktif diekstrak dari ampas nilam, lalu dimikroenkapsulasi dengan gelatin dan gum arab sebelum diformulasikan menjadi spray. Formula tidak memakai DEET.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="bg-[#fcf8ff] p-8 rounded-3xl hover:shadow-md transition-all duration-300 border border-purple-100/50 sm:col-span-2">
                <div className="text-5xl font-black text-purple-200 mb-4 tracking-tighter">03</div>
                <h3 className="text-xl font-bold text-[#1A3626] mb-3">Terhubung dengan MosqRisk</h3>
                <p className="text-on-surface-variant leading-relaxed text-[15px] sm:max-w-2xl">
                  Kode QR di kemasan membuka fitur premium MosqRisk. Model Risiko MosqRisk menghitung skor dari prakiraan cuaca BMKG (suhu, kelembapan, curah hujan) dengan parameter dari literatur ilmiah, dan notifikasi dikirim lewat email.
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Hasil uji persepsi pengguna — data asli (05_FAKTA §4, Proposal UTU Awards 2026).
          Menggantikan section "Simulasi Testimoni" (3 testimoni rekaan) — keputusan C1, 2026-11-06. */}
      <section className="py-20 bg-surface-container-lowest">
        <RevealOnScroll className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A3626]/70 mb-3">Uji persepsi pengguna, bukan uji klinis</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Hasil Uji Coba Pengguna</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              10 responden berusia 20–58 tahun memakai sampel Patchmos selama 5 hari dan memberi penilaian.
            </p>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Kelayakan", nilai: "92,8%" },
              { label: "Kepraktisan", nilai: "94,5%" },
              { label: "Keefektifan menurut responden", nilai: "92,5%" },
            ].map((item) => (
              <div key={item.label} className="bg-white p-8 rounded-3xl border border-gray-100">
                <dt className="text-sm font-bold text-on-surface-variant mb-2">{item.label}</dt>
                <dd className="text-5xl font-extrabold text-[#1A3626] tabular-nums">{item.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-3xl">
            Tidak ditemukan laporan iritasi kulit pada seluruh responden selama masa uji coba. Uji efikasi repellent (adaptasi <em>cage test</em> WHO) dan uji keamanan kulit (<em>patch test</em>) sedang direncanakan.
          </p>
          <p className="text-xs text-on-surface-variant mt-3">Sumber: uji persepsi tim Patchmos, Proposal UTU Awards 2026.</p>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <Footer />

      <ClaimModal isOpen={claimModalOpen} onClose={() => setClaimModalOpen(false)} />
    </div>
  );
}
