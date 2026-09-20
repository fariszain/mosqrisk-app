"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Report {
  id: number;
  report_type?: string;
  location_name?: string;
  description?: string;
  created_at: string;
  [key: string]: unknown;
}

interface Subscriber {
  id: number;
  email?: string;
  location_name?: string;
  created_at: string;
  [key: string]: unknown;
}

const ExportButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
    <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
  </button>
);

const DeleteButton = ({ onClick, title }: { onClick: () => void, title: string }) => (
  <button onClick={onClick} className="p-2 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title={title}>
    <span className="material-symbols-outlined text-[18px]">delete</span>
  </button>
);

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const t = setTimeout(() => setLoading(true), 0);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const headers = { 'Authorization': `Bearer ${pin}` };

    const fetchAndParse = (url: string) => fetch(url, { headers }).then(async res => {
      const text = await res.text();
      try {
        return { status: res.status, ok: res.ok, data: JSON.parse(text) };
      } catch {
        return { status: res.status, ok: res.ok, text };
      }
    });

    Promise.all([
      fetchAndParse(`${API_URL}/api/reports`),
      fetchAndParse(`${API_URL}/api/subscribe`)
    ])
    .then(([reportsRes, subsRes]) => {
      if(reportsRes.ok && reportsRes.data?.success) {
        setReports(reportsRes.data.data || []);
      } else {
        console.error("Gagal load reports:", reportsRes);
        toast.error("Gagal memuat laporan");
      }
      
      if(subsRes.ok && subsRes.data?.success) {
        setSubscribers(subsRes.data.data || []);
      } else {
        console.error("Gagal load subscribers:", subsRes);
        toast.error("Gagal memuat data pelanggan");
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      toast.error("Error jaringan saat memuat data");
    })
    .finally(() => {
      setLoading(false);
      clearTimeout(t);
    });
  }, [isAuthenticated, pin]);

  const filteredReports = reports.filter(r => 
    String(r.location_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s => 
    String(s.location_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReports = reports.length;
  const dbdCases = reports.filter(r => r.report_type?.toUpperCase() === 'DBD').length;
  const nyamukCases = reports.filter(r => r.report_type?.toUpperCase() === 'JENTIK').length;
  const totalSubscribers = subscribers.length;
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${pin}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch (err) {
      console.error(err);
      setPinError(true);
    }
  };

  const handleBroadcast = async () => {
    if (!confirm('Apakah Anda yakin ingin menyiarkan Peringatan Bahaya ke SEMUA alamat email yang terdaftar?')) return;
    
    setIsBroadcasting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/broadcast`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${pin}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Broadcast Peringatan berhasil dijadwalkan!');
      } else {
        toast.error('Gagal: ' + data.message);
      }
    } catch {
      toast.error('Error koneksi ke server.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
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

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Hapus laporan ini permanen?')) return;
    
    // Optimistic Update
    const previousReports = [...reports];
    setReports(reports.filter(r => r.id !== id));
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/reports/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${pin}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Laporan berhasil dihapus');
      } else {
        setReports(previousReports);
        toast.error('Gagal menghapus laporan: ' + data.message);
      }
    } catch {
      setReports(previousReports);
      toast.error('Error koneksi ke server.');
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('Hapus pelanggan email ini permanen?')) return;
    
    // Optimistic Update
    const previousSubscribers = [...subscribers];
    setSubscribers(subscribers.filter(s => s.id !== id));

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/subscribe/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${pin}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pelanggan berhasil dihapus');
      } else {
        setSubscribers(previousSubscribers);
        toast.error('Gagal menghapus pelanggan: ' + data.message);
      }
    } catch {
      setSubscribers(previousSubscribers);
      toast.error('Error koneksi ke server.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-700 text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="font-semibold text-xl text-gray-900 mb-2">Pusat Komando</h1>
          <p className="text-gray-500 text-sm mb-8">Silakan masukkan PIN Rahasia untuk mengakses dasbor.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN" 
              className={`w-full px-4 py-3 rounded-lg border ${pinError ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-green-600'} focus:outline-none transition-colors text-center tracking-[0.3em] text-lg mb-4 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm`}
              autoFocus
            />
            {pinError && <p className="text-red-500 text-xs mb-4">PIN salah, silakan coba lagi.</p>}
            <button type="submit" className="w-full bg-[#1A3626] text-white py-3 rounded-lg font-medium hover:bg-[#0c1f13] transition-colors">
              Akses Dasbor
            </button>
          </form>
          <Link href="/">
            <p className="mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-2">
              Kembali ke Web Publik
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-gray-900 font-sans pb-16">
      {/* Header - Minimalist */}
      <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1A3626] text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">Admin Patchmos</h1>
              <p className="text-xs text-gray-500">Dasbor Data Warga</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleBroadcast}
              disabled={isBroadcasting || totalSubscribers === 0}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${totalSubscribers === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBroadcasting ? 'hourglass_top' : 'campaign'}
              </span>
              {isBroadcasting ? 'Mengirim...' : 'Kirim Peringatan'}
            </button>
            <Link href="/">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 transition-colors rounded-lg text-sm font-medium text-gray-700 justify-center w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Web Publik
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Stats Cards - Clean and Soft */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600">description</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Laporan Masuk</p>
              <h2 className="text-3xl font-semibold text-gray-900">{loading ? '...' : totalReports}</h2>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-600">health_and_safety</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Indikasi Kasus DBD</p>
              <h2 className="text-3xl font-semibold text-gray-900">{loading ? '...' : dbdCases}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-yellow-600">bug_report</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Populasi Nyamuk</p>
              <h2 className="text-3xl font-semibold text-gray-900">{loading ? '...' : nyamukCases}</h2>
            </div>
          </div>
        </div>

        {/* Global Search Bar - Soft */}
        <div className="mb-8 relative max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Cari nama daerah, laporan, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-12 pr-10 py-3 rounded-xl text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Stacked Tables (Top-Bottom) - Clean layout */}
        <div className="flex flex-col gap-8">
          
          {/* Data Table Laporan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
              <div>
                <h3 className="font-semibold text-gray-900">Data Laporan Warga</h3>
                <p className="text-gray-500 text-sm mt-0.5">Daftar laporan yang masuk dari halaman pantauan.</p>
              </div>
              <ExportButton onClick={() => exportCSV(reports, 'laporan_patchmos.csv')} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                    <th className="px-6 py-3 font-medium w-1/4">Lokasi & Waktu</th>
                    <th className="px-6 py-3 font-medium w-1/6">Tipe Laporan</th>
                    <th className="px-6 py-3 font-medium w-auto">Deskripsi</th>
                    <th className="px-6 py-3 font-medium text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400">Memuat data...</td>
                    </tr>
                  )}
                  {!loading && filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400">
                        {searchQuery ? "Tidak ada laporan yang cocok." : "Belum ada laporan dari warga."}
                      </td>
                    </tr>
                  )}
                  {!loading && filteredReports.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900 mb-1 leading-snug">{r.location_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {r.report_type?.toUpperCase() === 'DBD' ? (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-medium border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Kasus DBD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md text-[11px] font-medium border border-yellow-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Nyamuk
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-gray-600 leading-relaxed max-w-md">
                        {r.description || '-'}
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <DeleteButton onClick={() => handleDeleteReport(r.id)} title="Hapus Laporan" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
              <div>
                <h3 className="font-semibold text-gray-900">Database Pelanggan Email</h3>
                <p className="text-gray-500 text-sm mt-0.5">Daftar pengguna yang berlangganan peringatan dini.</p>
              </div>
              <ExportButton onClick={() => exportCSV(subscribers, 'leads_patchmos.csv')} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                    <th className="px-6 py-3 font-medium w-1/3">Alamat Email</th>
                    <th className="px-6 py-3 font-medium w-1/2">Lokasi Pantauan & Waktu Daftar</th>
                    <th className="px-6 py-3 font-medium text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-gray-400">Memuat data...</td>
                    </tr>
                  )}
                  {!loading && filteredSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-gray-400">
                        {searchQuery ? "Tidak ada pelanggan yang cocok." : "Belum ada pelanggan notifikasi."}
                      </td>
                    </tr>
                  )}
                  {!loading && filteredSubscribers.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="text-gray-900 font-medium">
                          {s.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900 mb-1">{s.location_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(s.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <DeleteButton onClick={() => handleDeleteSubscriber(s.id)} title="Hapus Pelanggan" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
}
