"use client";

import Link from 'next/link';
import Navbar from "@/components/Navbar";

export default function LaporPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    fetch('http://localhost:8000/api/reports', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location_name: formData.get('location') || 'Tidak Diketahui',
        description: formData.get('description'),
        reporter_name: formData.get('name'),
        reporter_contact: formData.get('contact'),
        report_type: formData.get('type')
      })
    }).then(res=>res.json()).then(data=>{
      if(data.success) {
        alert('Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.');
        (e.target as HTMLFormElement).reset();
      } else {
        alert('Gagal mengirim laporan.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Form Section */}
      <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-danger/5 rounded-full blur-[100px] -mr-40 -mt-40 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/5 rounded-full blur-[100px] -ml-20 -mb-20 z-0 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          <div>
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-full mb-6 text-sm uppercase tracking-wider">
              Partisipasi Masyarakat
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">Laporkan Kasus & Temuan Jentik</h1>
            <p className="text-on-surface-variant text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
              Jadilah mata dan telinga untuk lingkungan Anda. Laporan Anda langsung terhubung ke dasbor pantauan dan membantu AI kami memperingatkan warga sekitar agar lebih waspada.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary shrink-0 border border-outline/10">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Genangan Air / Jentik</h3>
                  <p className="text-on-surface-variant text-sm">Bantu putus rantai perkembangbiakan nyamuk sebelum menjadi wabah.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-danger shrink-0 border border-outline/10">
                  <span className="material-symbols-outlined">local_hospital</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Kasus Suspect DBD</h3>
                  <p className="text-on-surface-variant text-sm">Laporkan jika ada anggota keluarga atau tetangga yang dirawat karena gejala demam berdarah.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 shrink-0 border border-outline/10">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Lindungi Sekitar</h3>
                  <p className="text-on-surface-variant text-sm">Setiap laporan Anda akan meningkatkan Skor Risiko di wilayah Anda untuk memberi peringatan ke warga lain.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface/80 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/50 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[4rem] rounded-tr-[2rem] -z-10"></div>
            
            <h2 className="text-2xl font-bold text-on-surface mb-6">Formulir Laporan Cepat</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nama Pelapor</label>
                  <input type="text" name="name" required placeholder="Nama Anda" className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Kontak (Email / HP)</label>
                  <input type="text" name="contact" required placeholder="Email / No HP Anda" className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Lokasi Temuan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/50">location_on</span>
                  <input type="text" name="location" required placeholder="Contoh: Jl. Merdeka, Rt 01 Rw 02" className="w-full bg-background border border-outline/20 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Jenis Laporan</label>
                <select name="type" required className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer appearance-none">
                  <option value="JENTIK">💧 Temuan Sarang / Jentik Nyamuk</option>
                  <option value="DBD">🌡️ Kasus Suspect DBD</option>
                  <option value="LAINNYA">📝 Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Deskripsi Detail</label>
                <textarea name="description" required placeholder="Ceritakan detail temuan Anda..." rows={4} className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm resize-none"></textarea>
              </div>
              
              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 mt-4 shadow-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">send</span>
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>
      </main>

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
            <Link href="/tentang" className="hover:text-primary transition-colors text-sm font-semibold">Tentang Produk</Link>
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
