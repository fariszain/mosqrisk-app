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
    Promise.all([
      fetch('http://127.0.0.1:8000/api/reports').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/subscribe').then(res => res.json())
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
  }, []);

  const totalReports = reports.length;
  const dbdCases = reports.filter(r => r.report_type === 'dbd').length;
  const nyamukCases = reports.filter(r => r.report_type === 'nyamuk').length;
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
      const res = await fetch('http://127.0.0.1:8000/api/broadcast', { method: 'POST' });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center font-['Plus_Jakarta_Sans'] p-4">
        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-outline/10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
          </div>
          <h1 className="font-bold text-2xl text-on-surface mb-2">Akses Terbatas</h1>
          <p className="text-on-surface-variant text-sm mb-6">Silakan masukkan PIN Rahasia Kemenkes untuk mengakses Dasbor Admin.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN" 
              className={`w-full px-4 py-3 rounded-xl border ${pinError ? 'border-danger focus:ring-danger' : 'border-outline focus:ring-primary'} focus:outline-none focus:ring-2 bg-surface-container-lowest text-center tracking-widest text-lg mb-4`}
              autoFocus
            />
            {pinError && <p className="text-danger text-xs mb-4">PIN salah, silakan coba lagi.</p>}
            <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Masuk Dasbor
            </button>
          </form>
          <Link href="/">
            <p className="mt-6 text-sm text-primary hover:underline cursor-pointer">Kembali ke Web Publik</p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="bg-surface border-b border-outline/10 p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-on-surface">Pusat Komando Kemenkes</h1>
              <p className="text-xs text-on-surface-variant">Dashboard Pemantauan Risiko & Laporan Warga</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleBroadcast}
              disabled={isBroadcasting || totalSubscribers === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${totalSubscribers === 0 ? 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed' : 'bg-danger text-white hover:bg-danger/90 hover:scale-105 active:scale-95'}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBroadcasting ? 'hourglass_top' : 'campaign'}
              </span>
              {isBroadcasting ? 'Mengirim...' : 'Kirim Peringatan (Broadcast)'}
            </button>
            <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-dim transition-colors rounded-lg text-sm font-bold text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Web Publik
            </button>
          </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">receipt_long</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total Laporan Masuk</p>
              <h2 className="text-3xl font-bold text-on-surface">{loading ? '...' : totalReports}</h2>
            </div>
          </div>
          
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600">coronavirus</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Laporan Indikasi DBD</p>
              <h2 className="text-3xl font-bold text-red-600">{loading ? '...' : dbdCases}</h2>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">pest_control</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Laporan Populasi Nyamuk</p>
              <h2 className="text-3xl font-bold text-yellow-600">{loading ? '...' : nyamukCases}</h2>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 overflow-hidden">
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface">
            <h3 className="font-bold text-lg text-on-surface">Data Pelaporan Terbaru</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-outline/10">
                  <th className="p-4 font-semibold uppercase tracking-wider">Waktu Lapor</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Lokasi</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Tipe</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant">Memuat data...</td>
                  </tr>
                )}
                {!loading && reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant">Belum ada laporan dari warga.</td>
                  </tr>
                )}
                {!loading && reports.map((r) => (
                  <tr key={r.id} className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-medium text-on-surface">{r.location_name}</td>
                    <td className="p-4">
                      {r.report_type === 'dbd' ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> DBD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Nyamuk
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-on-surface-variant max-w-xs truncate" title={r.description}>
                      {r.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline/10 overflow-hidden mt-8">
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Data Pelanggan Notifikasi Email</h3>
              <p className="text-sm text-on-surface-variant">Total {totalSubscribers} email terdaftar</p>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-outline/10">
                  <th className="p-4 font-semibold uppercase tracking-wider">Waktu Daftar</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Lokasi Pantauan</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Alamat Email</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-on-surface-variant">Memuat data...</td>
                  </tr>
                )}
                {!loading && subscribers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-on-surface-variant">Belum ada pelanggan notifikasi.</td>
                  </tr>
                )}
                {!loading && subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-outline/5 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-medium text-on-surface">{s.location_name}</td>
                    <td className="p-4 font-mono text-on-surface">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">mail</span>
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
