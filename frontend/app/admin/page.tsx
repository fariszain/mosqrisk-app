"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  <motion.button 
    whileHover={{ scale: 1.03, backgroundColor: '#f9fafb' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick} 
    className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-shadow hover:shadow-md"
  >
    <span className="material-symbols-outlined text-[18px] text-[#EAC775]">download</span> Export CSV
  </motion.button>
);

const DeleteButton = ({ onClick, title }: { onClick: () => void, title: string }) => (
  <motion.button 
    whileHover={{ scale: 1.1, backgroundColor: '#fef2f2', color: '#dc2626' }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick} 
    className="w-10 h-10 flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl transition-colors border border-transparent hover:border-red-100" 
    title={title}
  >
    <span className="material-symbols-outlined text-[20px]">delete</span>
  </motion.button>
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
        toast.error("Gagal memuat laporan");
      }
      
      if(subsRes.ok && subsRes.data?.success) {
        setSubscribers(subsRes.data.data || []);
      } else {
        toast.error("Gagal memuat data pelanggan");
      }
    })
    .catch(() => {
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
    } catch {
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

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 max-w-sm w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A3626] to-[#EAC775]"></div>
          
          <div className="w-20 h-20 bg-[#F4F7F4] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#1A3626] text-4xl">admin_panel_settings</span>
          </div>
          <h1 className="font-bold text-2xl text-gray-900 mb-2 tracking-tight">Pusat Komando</h1>
          <p className="text-gray-500 text-sm mb-8 font-medium">Verifikasi PIN untuk akses data warga.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••" 
              className={`w-full px-4 py-4 rounded-xl border ${pinError ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-[#F4F7F4] text-gray-900 focus:border-[#1A3626] focus:bg-white focus:ring-4 focus:ring-[#1A3626]/10'} focus:outline-none transition-all text-center tracking-[0.5em] text-2xl mb-4 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-base font-bold`}
              autoFocus
            />
            <AnimatePresence>
              {pinError && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs mb-4 font-medium"
                >
                  PIN tidak valid, silakan coba lagi.
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full bg-[#1A3626] text-white py-4 rounded-xl font-semibold hover:bg-[#0c1f13] transition-colors shadow-lg shadow-[#1A3626]/20"
            >
              Masuk Dasbor
            </motion.button>
          </form>
          <Link href="/">
            <p className="mt-8 text-sm text-gray-400 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Web Publik
            </p>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-gray-900 font-sans pb-20 selection:bg-[#EAC775]/30">
      
      {/* Navbar - Interactive, Glassmorphism, Floating effect */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-30 pt-4 px-4 md:px-6"
      >
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="w-12 h-12 bg-gradient-to-br from-[#1A3626] to-[#2c573d] rounded-xl flex items-center justify-center shadow-md shadow-[#1A3626]/20"
            >
              <span className="material-symbols-outlined text-[#EAC775] text-2xl">dashboard</span>
            </motion.div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 tracking-tight">Admin Patchmos</h1>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sistem aktif & sinkron
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={totalSubscribers > 0 ? { scale: 1.05 } : {}}
              whileTap={totalSubscribers > 0 ? { scale: 0.95 } : {}}
              onClick={handleBroadcast}
              disabled={isBroadcasting || totalSubscribers === 0}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${totalSubscribers === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md hover:shadow-red-100/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isBroadcasting ? 'hourglass_top' : 'campaign'}
              </span>
              {isBroadcasting ? 'Memproses...' : 'Kirim Peringatan'}
            </motion.button>
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 transition-all shadow-sm hover:shadow-md rounded-xl text-sm font-semibold text-gray-700 justify-center w-full sm:w-auto"
              >
                Web Publik
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        
        {/* Stats Cards - Interactive with staggered entry */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {/* Card 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-900/5 border border-gray-100 flex items-center gap-5 transition-all cursor-default relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Laporan Masuk</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{loading ? '...' : totalReports}</h2>
            </div>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-red-900/5 border border-gray-100 flex items-center gap-5 transition-all cursor-default relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full blur-2xl group-hover:bg-red-100 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">health_and_safety</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 font-medium mb-1">Indikasi Kasus DBD</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{loading ? '...' : dbdCases}</h2>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-yellow-900/5 border border-gray-100 flex items-center gap-5 transition-all cursor-default relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full blur-2xl group-hover:bg-yellow-100 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">bug_report</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 font-medium mb-1">Populasi Nyamuk</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{loading ? '...' : nyamukCases}</h2>
            </div>
          </motion.div>
        </motion.div>

        {/* Global Search Bar - Interactive */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 relative max-w-2xl group"
        >
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A3626] transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Cari lokasi, isi laporan, atau email warga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-14 pr-12 py-4 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-[#1A3626]/5 focus:border-[#1A3626]/30 transition-all shadow-sm hover:shadow-md"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stacked Tables with Framer Motion Rows */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          
          {/* Data Table Laporan */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
              <div>
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-8 bg-[#EAC775] rounded-full inline-block mr-1"></span>
                  Laporan Warga
                </h3>
                <p className="text-gray-500 text-sm mt-1 ml-6">Data masuk dari pemantauan partisipatif.</p>
              </div>
              <ExportButton onClick={() => exportCSV(reports, 'laporan_patchmos.csv')} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider w-1/4">Lokasi & Waktu</th>
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider w-1/6">Indikator</th>
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider w-auto">Detail Pengamatan</th>
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {loading && (
                      <motion.tr exit={{ opacity: 0 }}>
                        <td colSpan={4} className="p-16 text-center text-gray-400 font-medium">Memuat data dari server...</td>
                      </motion.tr>
                    )}
                    {!loading && filteredReports.length === 0 && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={4} className="p-16 text-center text-gray-400 font-medium">
                          {searchQuery ? "Tidak ada laporan yang sesuai pencarian." : "Belum ada laporan dari warga."}
                        </td>
                      </motion.tr>
                    )}
                    {!loading && filteredReports.map((r) => (
                      <motion.tr 
                        key={r.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="border-b border-gray-50 hover:bg-[#F4F7F4]/50 transition-colors group"
                      >
                        <td className="px-8 py-5 align-top">
                          <div className="font-semibold text-gray-900 mb-1 leading-snug group-hover:text-[#1A3626] transition-colors">{r.location_name}</div>
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">history</span>
                            {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td className="px-8 py-5 align-top">
                          {r.report_type?.toUpperCase() === 'DBD' ? (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-100 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Kasus DBD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-yellow-100 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Nyamuk
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 align-top text-gray-600 leading-relaxed max-w-md">
                          {r.description || <span className="text-gray-300 italic">Tidak ada deskripsi</span>}
                        </td>
                        <td className="px-8 py-5 align-top text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                            <DeleteButton onClick={() => handleDeleteReport(r.id)} title="Hapus Laporan" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Subscribers Table */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-10">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
              <div>
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-8 bg-[#1A3626] rounded-full inline-block mr-1"></span>
                  Basis Data Pelanggan
                </h3>
                <p className="text-gray-500 text-sm mt-1 ml-6">Warga yang berlangganan Peringatan Dini.</p>
              </div>
              <ExportButton onClick={() => exportCSV(subscribers, 'leads_patchmos.csv')} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-xs border-b border-gray-100">
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider w-1/3">Alamat Email</th>
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider w-1/2">Lokasi Terdaftar</th>
                    <th className="px-8 py-4 font-semibold uppercase tracking-wider text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {loading && (
                      <motion.tr exit={{ opacity: 0 }}>
                        <td colSpan={3} className="p-16 text-center text-gray-400 font-medium">Memuat data dari server...</td>
                      </motion.tr>
                    )}
                    {!loading && filteredSubscribers.length === 0 && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={3} className="p-16 text-center text-gray-400 font-medium">
                          {searchQuery ? "Tidak ada pelanggan yang sesuai pencarian." : "Belum ada pelanggan notifikasi."}
                        </td>
                      </motion.tr>
                    )}
                    {!loading && filteredSubscribers.map((s) => (
                      <motion.tr 
                        key={s.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="border-b border-gray-50 hover:bg-[#F4F7F4]/50 transition-colors group"
                      >
                        <td className="px-8 py-5 align-middle">
                          <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-all">
                            <span className="material-symbols-outlined text-[#EAC775] text-lg">mail</span>
                            <span className="text-gray-900 font-semibold tracking-wide">{s.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 align-middle">
                          <div className="font-semibold text-gray-900 mb-1 group-hover:text-[#1A3626] transition-colors">{s.location_name}</div>
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">event_available</span>
                            Bergabung: {new Date(s.created_at).toLocaleString('id-ID', { dateStyle: 'long' })}
                          </div>
                        </td>
                        <td className="px-8 py-5 align-middle text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                            <DeleteButton onClick={() => handleDeleteSubscriber(s.id)} title="Hapus Pelanggan" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
          
        </motion.div>
      </main>
    </div>
  );
}
