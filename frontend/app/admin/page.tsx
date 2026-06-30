"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    Promise.all([
      fetch(`${API_URL}/api/reports`).then(res => res.json()),
      fetch(`${API_URL}/api/subscribe`).then(res => res.json())
    ])
    .then(([reportsData, subsData]) => {
      if(reportsData.success && reportsData.data) {
        setReports(reportsData.data);
      }
      if(subsData.success && subsData.data) {
        setSubscribers(subsData.data);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const totalReports = reports.length;
  const dbdCases = reports.filter(r => r.report_type === 'DBD').length;
  const nyamukCases = reports.filter(r => r.report_type === 'JENTIK').length;
  const totalSubscribers = subscribers.length;
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'kemenkes123') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleBroadcast = async () => {
    if (!confirm('Apakah Anda yakin ingin menyiarkan Peringatan Bahaya ke SEMUA alamat email yang terdaftar?')) return;
    
    setIsBroadcasting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/broadcast?key=kemenkes123`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('✅ Broadcast Peringatan berhasil dikirim ke ' + data.sent_count + ' warga!');
      } else {
        alert('❌ Gagal: ' + data.message);
      }
    } catch (err) {
      alert('❌ Error koneksi ke server.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1f13] via-[#1A3626] to-[#0e261a] flex items-center justify-center font-['Plus_Jakarta_Sans'] p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#EAC775]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#4ade80]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-sm w-full text-center relative z-10 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-[#EAC775] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#EAC775]/20">
            <span className="material-symbols-outlined text-white text-4xl">admin_panel_settings</span>
          </div>
          <h1 className="font-black text-2xl text-white mb-2 tracking-tight uppercase">Pusat Komando</h1>
          <p className="text-gray-300 text-sm mb-8 font-medium">Silakan masukkan PIN Rahasia Kemenkes untuk mengakses Dasbor Admin.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN" 
              className={`w-full px-4 py-4 rounded-xl border-2 ${pinError ? 'border-red-500/50 bg-red-500/10 text-white' : 'border-white/20 bg-black/20 text-white focus:border-[#EAC775]'} focus:outline-none transition-all duration-300 text-center tracking-[0.5em] text-xl mb-4 font-black placeholder:text-gray-500 placeholder:tracking-normal placeholder:font-normal placeholder:text-base`}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-xs mb-4 font-bold bg-red-500/10 py-2 rounded-lg">PIN salah, silakan coba lagi.</p>}
            <button type="submit" className="w-full bg-[#EAC775] text-[#1A3626] py-4 rounded-xl font-black text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95">
              AKSES DASBOR
            </button>
          </form>
          <Link href="/">
            <p className="mt-8 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer font-medium flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Kembali ke Web Publik
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] font-['Plus_Jakarta_Sans']">
      {/* Header - Premium Dark Theme */}
      <header className="bg-gradient-to-r from-[#0c1f13] via-[#1A3626] to-[#0e261a] p-6 sticky top-0 z-20 shadow-xl border-b border-[#EAC775]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EAC775] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-[#EAC775]/20">
              <span className="material-symbols-outlined text-[#1A3626] text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-black text-xl text-white uppercase tracking-wider">Pusat Komando Kemenkes</h1>
              <p className="text-xs text-[#EAC775] font-semibold tracking-widest uppercase mt-1">Dashboard Pemantauan Risiko & Laporan</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleBroadcast}
              disabled={isBroadcasting || totalSubscribers === 0}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg border border-transparent ${totalSubscribers === 0 ? 'bg-white/10 text-white/50 cursor-not-allowed border-white/5' : 'bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-95 hover:shadow-red-600/30'}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBroadcasting ? 'hourglass_top' : 'campaign'}
              </span>
              {isBroadcasting ? 'Mengirim...' : 'Kirim Peringatan Global'}
            </button>
            <Link href="/">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors rounded-xl text-sm font-bold text-white">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Web Publik
            </button>
          </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 relative z-10 shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Laporan Masuk</p>
              <h2 className="text-4xl font-black text-[#1A3626]">{loading ? '...' : totalReports}</h2>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-200 relative z-10 shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">coronavirus</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Indikasi Kasus DBD</p>
              <h2 className="text-4xl font-black text-red-600">{loading ? '...' : dbdCases}</h2>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#EAC775]/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EAC775] to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-200 relative z-10 shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">pest_control</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Populasi Nyamuk</p>
              <h2 className="text-4xl font-black text-yellow-600">{loading ? '...' : nyamukCases}</h2>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h3 className="font-black text-xl text-[#1A3626] uppercase tracking-tight">Data Pelaporan Terbaru</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Laporan masuk dari warga secara real-time</p>
            </div>
            <button onClick={() => exportCSV(reports, 'laporan_mosqrisk.csv')} className="bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="p-5 font-black uppercase tracking-widest pl-8">Waktu Lapor</th>
                  <th className="p-5 font-black uppercase tracking-widest">Lokasi</th>
                  <th className="p-5 font-black uppercase tracking-widest">Tipe</th>
                  <th className="p-5 font-black uppercase tracking-widest">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">Memuat data...</td>
                  </tr>
                )}
                {!loading && reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-4xl">inbox</span>
                      Belum ada laporan dari warga.
                    </td>
                  </tr>
                )}
                {!loading && reports.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 text-gray-500 whitespace-nowrap pl-8 font-medium">
                      {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-5 font-bold text-[#1A3626] max-w-[200px] truncate" title={r.location_name}>{r.location_name}</td>
                    <td className="p-5">
                      {r.report_type === 'dbd' ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> DBD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-100 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Nyamuk
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-gray-500 max-w-xs truncate font-medium" title={r.description}>
                      {r.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h3 className="font-black text-xl text-[#1A3626] uppercase tracking-tight">Database Pelanggan</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Total <span className="font-bold text-[#EAC775]">{totalSubscribers} email</span> terdaftar untuk peringatan dini</p>
            </div>
            <button onClick={() => exportCSV(subscribers, 'pelanggan_mosqrisk.csv')} className="bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="p-5 font-black uppercase tracking-widest pl-8">Waktu Daftar</th>
                  <th className="p-5 font-black uppercase tracking-widest">Lokasi Pantauan</th>
                  <th className="p-5 font-black uppercase tracking-widest">Alamat Email</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-400 font-medium">Memuat data...</td>
                  </tr>
                )}
                {!loading && subscribers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-400 font-medium">Belum ada pelanggan notifikasi.</td>
                  </tr>
                )}
                {!loading && subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 text-gray-500 whitespace-nowrap pl-8 font-medium">
                      {new Date(s.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-5 font-bold text-[#1A3626]">{s.location_name}</td>
                    <td className="p-5 font-mono text-gray-600">
                      <span className="bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">mail</span>
                        {s.email}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
