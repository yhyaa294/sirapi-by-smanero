'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Activate Loading State
    setIsLoading(true);

    // 2. Mock Server Delay
    setTimeout(() => {
      // 3. Set Auth Cookie (CRITICAL FOR MIDDLEWARE)
      document.cookie = "auth-token=mock-token-secure; path=/; max-age=86400";

      // 4. Show Success UI
      setShowSuccess(true);
      setIsLoading(false);

      // 5. Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh(); // Ensure middleware re-runs
      }, 1000);

    }, 1000);
  };

  const fillDemoData = () => {
    setNip('19850101201001');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[450px] relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 mx-auto mb-6 shadow-sm border border-blue-100">
              <Shield size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Masuk SiRapi</h1>
            <p className="text-slate-500 text-sm">Silakan masukkan NIP dan kredensial Anda untuk mengakses Dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="px-8 pb-10 space-y-5">

            {/* Success Alert */}
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-700 text-sm font-bold">
                <CheckCircle2 size={18} />
                Login Berhasil! Mengalihkan...
              </motion.div>
            )}

            {/* Input: NIP */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="nip">NIP (Nomor Induk Pegawai)</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  id="nip"
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 19850101201001"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Input: Email Sekolah (ReadOnly) */}
            <div className="space-y-1.5 opacity-80 cursor-not-allowed">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Sekolah</label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value="admin@sirapi.id"
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-xl pl-11 pr-4 py-3 cursor-not-allowed font-medium select-none"
                />
              </div>
            </div>

            {/* Input: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-12 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading || showSuccess}
              type="submit"
              className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 active:scale-[0.98] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Footer & Demo */}
            <div className="text-center space-y-6 pt-2">
              <button
                type="button"
                onClick={fillDemoData}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"
              >
                🛠️ Demo Mode (Auto-Fill)
              </button>

              <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                Lupa password? Hubungi administrator IT sekolah Anda untuk reset kredensial.
              </p>
            </div>

          </form>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
