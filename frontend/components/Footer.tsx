import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A3626] text-white mt-auto pt-16 pb-8 px-4 md:px-8 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EAC775]/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        {/* Brand Section */}
        <div className="md:col-span-5 flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#EAC775] text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            <h3 className="font-extrabold text-3xl tracking-tight">Mosq<span className="text-[#EAC775]">Risk</span></h3>
          </div>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-sm mb-6">
            Platform pemantauan risiko nyamuk terintegrasi pertama di Indonesia. Melindungi keluarga Anda dengan inovasi hijau dan Kecerdasan Buatan (AI).
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#EAC775] hover:text-[#1A3626] hover:border-[#EAC775] transition-all duration-300">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#EAC775] hover:text-[#1A3626] hover:border-[#EAC775] transition-all duration-300">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3">
          <h4 className="font-bold text-lg mb-6 text-white">Tautan Cepat</h4>
          <ul className="flex flex-col gap-4 text-white/70 text-[15px]">
            <li><Link href="/" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Beranda</Link></li>
            <li><Link href="/pantau" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Dasbor Pantauan AI</Link></li>
            <li><Link href="/lapor" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Lapor Genangan Warga</Link></li>
            <li><Link href="/checkout" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Beli Patchmos Spray</Link></li>
          </ul>
        </div>

        {/* Contact/Support */}
        <div className="md:col-span-4">
          <h4 className="font-bold text-lg mb-6 text-white">Dukungan & Mitra</h4>
          <ul className="flex flex-col gap-4 text-white/70 text-[15px] mb-8">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EAC775] text-[20px] mt-0.5">location_on</span>
              Universitas Syiah Kuala, <br/>Banda Aceh, Indonesia
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EAC775] text-[20px] mt-0.5">mail</span>
              mosqrisk.official@gmail.com
            </li>
          </ul>
          
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#EAC775]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#EAC775]">security</span>
            </div>
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Terintegrasi Resmi</p>
              <p className="text-[13px] font-semibold text-white/90">Kemenkes RI & BMKG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-white/40">
        <p>&copy; {new Date().getFullYear()} MosqRisk Analytics Team. Hak Cipta Dilindungi.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
        </div>
      </div>
    </footer>
  );
}
