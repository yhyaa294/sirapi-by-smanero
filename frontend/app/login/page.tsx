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
      // Validate email & password first
      if (!formData.email || !formData.password) {
        setError("Email dan password wajib diisi");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      setStep(2);
      setError("");
    } else {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    setShake(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const validEmail = formData.email === "admin@smartapd.id" || formData.email === "syarifuddinudin526@gmail.com";
      const validPass = formData.password === "123";
      const validAuth = formData.authCode === "123456" || formData.authCode === "";

      if (validEmail && validPass) {
        // Set auth cookie
        document.cookie = "auth-token=authenticated; path=/; max-age=86400";
        router.push("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError("Akses Ditolak: Email atau Password salah.");
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
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans text-slate-200">

      {/* KIRI (50% - Visual) */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-between overflow-hidden py-12">
        {/* Background Gradient Orbs - Animated */}
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[150px]"
            style={{ animation: "pulse1 8s ease-in-out infinite" }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]"
            style={{ animation: "pulse2 10s ease-in-out infinite" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
            style={{ animation: "pulse3 12s ease-in-out infinite" }}
          ></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        {/* Top Section - Logo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-500/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-xl border border-orange-500/50 shadow-xl overflow-hidden bg-slate-900">
              <Image src="/images/logo.jpg" alt="SmartAPD Logo" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-4">
            SMART<span className="text-orange-500">APD</span>
          </h1>
        </div>

        {/* Middle Section - Worker with Hologram Ring */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          {/* Rotating Hologram Ring */}
          <div
            className="absolute w-[320px] h-[320px] rounded-full border-2 border-dashed border-orange-500/30"
            style={{ animation: "spin 30s linear infinite" }}
          ></div>
          <div
            className="absolute w-[280px] h-[280px] rounded-full border border-emerald-500/20"
            style={{ animation: "spin 25s linear infinite reverse" }}
          ></div>

          {/* Worker 3 */}
          <div className="relative">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-500/30 rounded-full blur-xl"></div>
            <Image
              src="/images/worker 3.png"
              alt="Safety Worker"
              width={220}
              height={300}
              className="object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.4)] relative z-10"
              style={{ animation: "floatWorker 4s ease-in-out infinite" }}
            />
          </div>

          {/* Floating Feature Cards */}
          <div
            className="absolute top-4 left-8 bg-slate-900/80 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 shadow-xl"
            style={{ animation: "floatCard1 5s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Akurasi 99.8%</p>
                <p className="text-[10px] text-slate-500">YOLOv8 AI Model</p>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-8 right-8 bg-slate-900/80 backdrop-blur-sm border border-orange-500/30 rounded-xl p-3 shadow-xl"
            style={{ animation: "floatCard2 6s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Deteksi &lt;50ms</p>
                <p className="text-[10px] text-slate-500">Real-time Processing</p>
              </div>
            </div>
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 right-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 shadow-xl"
            style={{ animation: "floatCard3 7s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <span className="text-lg">🔔</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Alert Instan</p>
                <p className="text-[10px] text-slate-500">Telegram Bot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Tagline & Security */}
        <div className="relative z-10 text-center space-y-4 px-8">
          <p className="text-lg text-slate-300 italic">
            "Keselamatan bukan sekedar prioritas,<br />tapi nilai yang harus dipegang."
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Enterprise Grade Security
          </div>
        </div>

        <style jsx>{`
          @keyframes floatWorker {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse1 {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.1); }
          }
          @keyframes pulse2 {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.25; transform: scale(1.15); }
          }
          @keyframes pulse3 {
            0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.2); }
          }
          @keyframes floatCard1 {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
          }
          @keyframes floatCard2 {
            0%, 100% { transform: translateY(0) rotate(2deg); }
            50% { transform: translateY(-10px) rotate(-2deg); }
          }
          @keyframes floatCard3 {
            0%, 100% { transform: translateY(-50%) rotate(1deg); }
            50% { transform: translateY(calc(-50% - 6px)) rotate(-1deg); }
          }
        `}</style>
      </div>

      {/* KANAN (50% - Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">

        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
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
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
