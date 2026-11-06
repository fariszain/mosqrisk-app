"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function LaporPage() {
  const [location, setLocation] = useState('');
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS tidak didukung browser Anda.");
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setLocation(data.display_name);
        }
      } catch {
        toast.error("Gagal melacak lokasi.");
      }
      setLoadingGPS(false);
    }, () => {
      toast.error("Izin lokasi ditolak.");
      setLoadingGPS(false);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    // Nama & kontak pelapor tidak dikumpulkan lagi — dulu diminta di form tetapi tidak pernah disimpan.
    fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        locationName: location || formData.get('location') || 'Tidak Diketahui',
        description: formData.get('description'),
        reportType: formData.get('type')
      })
    }).then(async res => ({ status: res.status, data: await res.json() })).then(({ status, data }) => {
      if(data.success) {
        toast.success('Laporan terkirim. Terima kasih! Laporan diteruskan ke pelanggan notifikasi di wilayah yang sama (jika ada).');
        (e.target as HTMLFormElement).reset();
        setLocation('');
      } else if (status === 422) {
        toast.error('Periksa lagi isian laporan: lokasi dan deskripsi wajib diisi.');
      } else {
        toast.error(data.message || 'Gagal mengirim laporan.');
      }
    }).catch(() => {
      toast.error('Terjadi kesalahan koneksi.');
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Form Section */}
      <main className="flex-grow flex items-center justify-center pt-32 pb-12 md:pt-40 md:pb-20 px-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-danger/5 rounded-full blur-[100px] -mr-40 -mt-40 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/5 rounded-full blur-[100px] -ml-20 -mb-20 z-0 pointer-events-none"></div>

        <div className={`max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 transition-all duration-1000 ease-out transform ${isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">Laporkan Kasus & Temuan Jentik</h1>
            <p className="text-on-surface-variant text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
              Jadilah mata dan telinga untuk lingkungan Anda. Laporan tercatat di dasbor tim MosqRisk dan diteruskan lewat email ke warga yang berlangganan notifikasi di wilayah yang sama.
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
                  <p className="text-on-surface-variant text-sm">Laporkan jika ada warga sekitar yang dirawat karena gejala demam berdarah — tanpa menyebut nama atau data pribadinya.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 shrink-0 border border-outline/10">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Kabari Tetangga</h3>
                  <p className="text-on-surface-variant text-sm">Laporan diteruskan lewat email ke warga yang berlangganan notifikasi di wilayah yang sama. Laporan tidak mengubah skor risiko — skor dihitung dari prakiraan cuaca BMKG.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface/80 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/50 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[4rem] rounded-tr-[2rem] -z-10"></div>
            
            <h2 className="text-2xl font-bold text-on-surface mb-6">Formulir Laporan Cepat</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Lokasi Temuan</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/50">location_on</span>
                    <input type="text" name="location" required placeholder="Contoh: Jl. Merdeka, Rt 01 Rw 02" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-background border border-outline/20 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                  </div>
                  <button type="button" onClick={handleGPS} disabled={loadingGPS} className="bg-primary/10 text-primary px-4 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center border border-primary/20 shrink-0" title="Gunakan Lokasi Saat Ini">
                    <span className={`material-symbols-outlined ${loadingGPS ? 'animate-spin' : ''}`}>{loadingGPS ? 'sync' : 'my_location'}</span>
                  </button>
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
                <textarea name="description" required minLength={3} maxLength={1000} placeholder="Ceritakan detail temuan Anda..." rows={4} className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm resize-none"></textarea>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Jenis, lokasi, dan deskripsi laporan disimpan dan dapat diteruskan lewat email ke pelanggan notifikasi di wilayah yang sama.
                Jangan cantumkan nama, nomor telepon, atau data pribadi orang lain. Lihat <Link href="/privasi" className="underline underline-offset-2 text-primary">Kebijakan Privasi</Link>.
              </p>

              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 mt-2 shadow-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">send</span>
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
