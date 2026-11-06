import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A3626] text-white mt-auto pt-16 pb-8 px-4 md:px-8 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EAC775]/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        {/* Brand Section */}
        <div className="md:col-span-5 flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-6">
            <Image 
              src="/logonavbar.png" 
              alt="MosqRisk Logo" 
              width={1500}
              height={1500}
              quality={100}
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(234,199,117,0.3)]" 
            />
            <h3 className="font-extrabold text-3xl tracking-tight">Mosq<span className="text-[#EAC775]">Risk</span></h3>
          </div>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-sm mb-6">
            Patchmos: spray bio-repellent dengan bahan aktif dari ampas nilam Aceh. MosqRisk: pemantauan risiko nyamuk dari prakiraan cuaca BMKG.
          </p>
          <div className="flex gap-4">
            <a href="mailto:mosqrisk.official@gmail.com" aria-label="Kirim email ke tim MosqRisk" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#EAC775] hover:text-[#1A3626] hover:border-[#EAC775] transition-all duration-300">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3">
          <h4 className="font-bold text-lg mb-6 text-white">Tautan Cepat</h4>
          <ul className="flex flex-col gap-4 text-white/70 text-[15px]">
            <li><Link href="/" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Beranda</Link></li>
            <li><Link href="/pantau" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Peta Pantauan Risiko</Link></li>
            <li><Link href="/lapor" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Lapor Genangan Warga</Link></li>
            <li><Link href="/edukasi" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block">Pusat Edukasi</Link></li>
            <li><Link href="/checkout" className="hover:text-[#EAC775] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Beli Patchmos Spray</Link></li>
          </ul>
        </div>

        {/* Contact/Support */}
        <div className="md:col-span-4">
          <h4 className="font-bold text-lg mb-6 text-white">Kontak</h4>
          <ul className="flex flex-col gap-4 text-white/70 text-[15px] mb-8">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EAC775] text-[20px] mt-0.5">location_on</span>
              Universitas Syiah Kuala, <br/>Banda Aceh, Indonesia
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EAC775] text-[20px] mt-0.5">mail</span>
              <a href="mailto:mosqrisk.official@gmail.com" className="hover:text-[#EAC775] transition-colors">mosqrisk.official@gmail.com</a>
            </li>
          </ul>

          {/* Atribusi sumber data — bukan kemitraan/afiliasi resmi dengan instansi mana pun */}
          <div className="border-t border-white/10 pt-5">
            <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold mb-3">Sumber data</p>
            <ul className="flex flex-col gap-1.5 text-[13px] text-white/75 leading-relaxed">
              <li>Prakiraan cuaca: BMKG (API publik)</li>
              <li>Tren iklim historis: Open-Meteo</li>
              <li>Statistik kasus DBD: Kementerian Kesehatan (2026)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-white/40">
        <p>&copy; {new Date().getFullYear()} MosqRisk Analytics Team. Hak Cipta Dilindungi.</p>
        <div className="flex gap-6">
          <Link href="/privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
}
