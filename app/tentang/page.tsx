import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-surface-container-low">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 leading-tight max-w-4xl">
            Inovasi Hijau dari Serambi Mekkah untuk <span className="text-tertiary">Keluarga Bebas Nyamuk</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl mb-10 leading-relaxed">
            Patchmos bukan sekadar obat nyamuk biasa. Kami mendaur ulang ribuan kilogram ampas nilam (patchouli) sisa penyulingan di Aceh menjadi pelindung kulit alami yang ampuh, aman, dan terintegrasi dengan Kecerdasan Buatan (AI) MosqRisk.
          </p>
          <Link href="/checkout" className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 text-lg">
            <span className="material-symbols-outlined">shopping_bag</span> Coba Patchmos Sekarang
          </Link>
        </div>
      </section>

      {/* Tiga Pilar Utama */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Pilar 1 */}
            <div className="bg-surface p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-outline/10 text-center group">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-green-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl">eco</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Misi Lingkungan (Zero Waste)</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Setiap tahun, berton-ton ampas nilam Aceh dibuang begitu saja. Kami bekerja sama dengan petani lokal untuk mengekstrak sisa minyak atsirinya. Setiap botol Patchmos yang Anda beli berarti Anda membantu mengurangi limbah pertanian dan menyejahterakan petani lokal.
              </p>
            </div>
            
            {/* Pilar 2 */}
            <div className="bg-surface p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-outline/10 text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-blue-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl">health_and_safety</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">100% Bebas DEET & Aman</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Kulit bayi dan anak-anak sangat sensitif terhadap bahan kimia sintetis seperti DEET. Patchmos diformulasikan murni dari *Patchouli Oil*, sereh wangi, dan bahan nabati lainnya. Memberikan proteksi hingga 6 jam tanpa risiko iritasi atau efek samping jangka panjang.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-surface p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-outline/10 text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-purple-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl">memory</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Terhubung AI MosqRisk</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Satu-satunya produk penolak nyamuk yang dilengkapi dengan *Early Warning System*. Sistem kami memantau data cuaca BMKG dan memperingatkan Anda via Email/WhatsApp kapan waktu yang paling krusial untuk mengoleskan Patchmos pada kulit keluarga Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulasi Testimoni & Review */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12">Apa Kata Mereka?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/5 text-left relative">
              <div className="flex text-[#FFD700] mb-4">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6">"Wanginya sangat menenangkan, tidak menyengat seperti obat nyamuk biasa. Anak saya yang biasanya alergi merah-merah kalau pakai lotion nyamuk kimia, sekarang aman pakai Patchmos."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">SI</div>
                <div>
                  <h4 className="font-bold text-on-surface">Siti Rahma</h4>
                  <p className="text-xs text-on-surface-variant">Ibu Rumah Tangga, Banda Aceh</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/5 text-left relative">
              <div className="flex text-[#FFD700] mb-4">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6">"Konsepnya luar biasa. Membeli produk ini sama dengan mendukung petani lokal kita. Plus fitur notifikasi cuacanya bikin kita lebih aware kalau musim hujan dan banyak genangan air."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">BU</div>
                <div>
                  <h4 className="font-bold text-on-surface">Budi Santoso</h4>
                  <p className="text-xs text-on-surface-variant">Pekerja Lapangan, Jakarta</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/5 text-left relative hidden lg:block">
              <div className="flex text-[#FFD700] mb-4">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6">"Saya suka karena teksturnya tidak lengket sama sekali. Cepat meresap dan aroma khas nilamnya bikin rileks saat dipakai sebelum tidur malam."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">AN</div>
                <div>
                  <h4 className="font-bold text-on-surface">Anita Dewi</h4>
                  <p className="text-xs text-on-surface-variant">Mahasiswi, Bandung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Static copy of main footer) */}
      <footer className="w-full bg-surface-container-highest border-t border-outline/10 mt-auto py-8 px-4 md:px-8">
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
            <Link href="/" className="hover:text-primary transition-colors text-sm font-semibold">Beranda</Link>
            <Link href="/lapor" className="hover:text-primary transition-colors text-sm font-semibold">Lapor Warga</Link>
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
