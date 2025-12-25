"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, AlertCircle, Phone, KeyRound, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [step, setStep] = useState(1); // 1 = email/pass, 2 = phone/auth
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    authCode: "",
  });

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Validate email & password
      if (!formData.email || !formData.password) {
        setError("Email dan password wajib diisi");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      // Langsung login tanpa step 2
      handleLogin();
    } else {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    setShake(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

    try {
      // Try API auth first
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Debug response
        console.log("Login response:", data);

        // Determine token from various possible structures
        const accessToken = data.access_token || data.token || (data.data && data.data.token);
        const refreshToken = data.refresh_token || (data.data && data.data.refresh_token);

        if (accessToken) {
          localStorage.setItem('auth-token', accessToken);
          document.cookie = `auth-token=${accessToken}; path=/; max-age=86400`;

          if (refreshToken) {
            localStorage.setItem('refresh-token', refreshToken);
          }
        } else {
          throw new Error("Token tidak ditemukan dalam respons server");
        }

        router.push("/dashboard");
        return;
      }

      // API failed
      const data = await response.json();
      throw new Error(data.error || "Email atau Password salah");

    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
      setIsLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans text-slate-200">

      {/* KIRI (50% - Visual) - CLEAN DESIGN */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-y-auto">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

        {/* Main Content - Added safe padding */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 py-20 my-auto">

          {/* Logo - Fixed clipping issue with larger container */}
          <div className="relative mb-10">
            <div className="absolute -inset-6 bg-orange-500/25 rounded-[2rem] blur-2xl"></div>
            <div className="relative w-40 h-40 rounded-3xl border-2 border-orange-500/40 shadow-2xl overflow-hidden bg-slate-900/80 flex items-center justify-center p-3">
              <Image
                src="/images/logo.jpg"
                alt="SmartAPD Logo"
                width={150}
                height={150}
                className="object-contain rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            SMART<span className="text-orange-500">APD</span>
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full mb-8"></div>

          {/* Worker with Hologram */}
          <div className="relative my-8">
            {/* Hologram Ring */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: "spin 40s linear infinite" }}
            >
              <div className="w-[280px] h-[280px] rounded-full border-2 border-dashed border-orange-500/20"></div>
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: "spin 35s linear infinite reverse" }}
            >
              <div className="w-[240px] h-[240px] rounded-full border border-emerald-500/15"></div>
            </div>

            {/* Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-12 bg-orange-500/20 rounded-full blur-2xl"></div>

            {/* Worker 3 */}
            <Image
              src="/images/worker 3.png"
              alt="Safety Worker"
              width={200}
              height={280}
              className="object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.3)] relative z-10"
              style={{ animation: "floatWorker 4s ease-in-out infinite" }}
            />
          </div>

          {/* Tagline */}
          <p className="text-base text-slate-400 italic max-w-xs mt-6">
            "Keselamatan bukan sekedar prioritas, tapi nilai yang harus dipegang."
          </p>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mt-8">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Enterprise Grade Security
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes floatWorker {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>

      {/* KANAN (50% - Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative min-h-screen">

        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-6 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {step === 1 ? "Selamat Datang" : "Verifikasi Keamanan"}
            </h2>
            <p className="text-slate-400">
              {step === 1
                ? "Masukkan kredensial untuk mengakses sistem"
                : "Masukkan kode autentikasi dan nomor telepon"}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3">
            <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleNextStep}
            className="space-y-5"
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
            transition={{ type: "tween", duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all outline-none"
                        placeholder="nama@perusahaan.com"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nomor Telepon
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all outline-none"
                        placeholder="+62 812 xxxx xxxx"
                      />
                    </div>
                  </div>

                  {/* Auth Code Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Kode Autentikasi <span className="text-slate-600">(opsional)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        name="authCode"
                        type="text"
                        value={formData.authCode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all outline-none tracking-[0.5em] text-center font-mono"
                        placeholder="• • • • • •"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Masukkan kode 6 digit dari aplikasi authenticator</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                >
                  Kembali
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memverifikasi...
                  </>
                ) : step === 1 ? (
                  <>
                    Lanjutkan
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer */}
          <div className="pt-4 text-center space-y-4">
            <p className="text-xs text-slate-500">
              Lupa Password? <span className="text-orange-500 hover:underline cursor-pointer">Hubungi Administrator</span>
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                2FA Protected
              </span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
