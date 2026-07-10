"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface SlidingAuthCardProps {
  initialMode: "signin" | "signup";
  onClose: () => void;
}

export default function SlidingAuthCard({
  initialMode,
  onClose,
}: SlidingAuthCardProps) {
  const router = useRouter();
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");

  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setIsSignUp(initialMode === "signup");
  }

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    setSignInLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login berhasil!");
      onClose();
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: {
          name: signUpName,
        }
      }
    });
    setSignUpLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
      setIsSignUp(false); // Switch to login
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/pantau`,
      }
    });
    setIsGoogleLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  // Tema Warna Terinspirasi dari Website
  const primaryGreen = "bg-[#1A3626]";
  const textPrimaryGreen = "text-[#1A3626]";
  const accentGold = "bg-[#EAC775]";
  const textAccentGold = "text-[#EAC775]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="material-symbols-outlined text-3xl text-[#1A3626]" style={{fontVariationSettings: "'FILL' 1" }}>
            water_drop
          </span>
          <span className="text-xl font-black text-[#1A3626] tracking-widest uppercase">MosqRisk</span>
        </div>

        <h2 className="text-2xl font-black mb-2 text-center text-[#1A3626]">
          {isSignUp ? "Daftar Akun" : "Selamat Datang"}
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center font-medium">
          {isSignUp ? "Buat akun untuk mendapatkan perlindungan maksimal." : "Masuk untuk melanjutkan ke dasbor Anda."}
        </p>

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Nama</label>
              <input type="text" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} required placeholder="Nama Anda" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:ring-2 focus:ring-[#1A3626]/20 transition-all text-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Email</label>
              <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required placeholder="nama@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:ring-2 focus:ring-[#1A3626]/20 transition-all text-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:ring-2 focus:ring-[#1A3626]/20 transition-all text-gray-800" />
            </div>
            <button type="submit" disabled={signUpLoading} className="mt-2 w-full bg-[#EAC775] hover:bg-[#d4b05a] text-[#1A3626] font-black py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
              {signUpLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Daftar Sekarang"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Email</label>
              <input type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required placeholder="nama@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:ring-2 focus:ring-[#1A3626]/20 transition-all text-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A3626] focus:ring-2 focus:ring-[#1A3626]/20 transition-all text-gray-800" />
            </div>
            <button type="submit" disabled={signInLoading} className="mt-2 w-full bg-[#1A3626] hover:bg-[#12261b] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
              {signInLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Masuk"}
            </button>
          </form>
        )}

        <div className="mt-6 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase">Atau dengan</div>
        </div>

        <button onClick={handleGoogleAuth} disabled={isGoogleLoading} className="mt-6 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-3">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>
        
        <div className="mt-6 text-center">
          {isSignUp ? (
            <button onClick={() => setIsSignUp(false)} className="text-sm font-bold text-gray-500 hover:text-[#1A3626] transition-colors">
              Sudah punya akun? <span className="underline">Masuk</span>
            </button>
          ) : (
            <button onClick={() => setIsSignUp(true)} className="text-sm font-bold text-gray-500 hover:text-[#1A3626] transition-colors">
              Belum punya akun? <span className="underline">Daftar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
