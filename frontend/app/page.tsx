"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  Camera,
  Bell,
  BarChart3,
  Cpu,
  Eye,
  CheckCircle2,
  HardHat,
  Shirt,
  Hand,
  Footprints,
  ChevronDown,
  Play,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// ============================================
// NAVBAR
// ============================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Solusi", href: "#solusi" },
    { name: "Fitur", href: "#features" },
    { name: "Cara Kerja", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out
      ${scrolled
        ? "top-3 w-auto bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full py-2 px-5"
        : "top-5 w-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-full py-2.5 px-6"}`}
    >
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/images/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="text-base font-bold text-white whitespace-nowrap">
            Smart<span className="text-orange-500">APD</span>
          </span>
        </Link>

        {/* Center Nav Pills */}
        <div className="hidden md:flex items-center gap-0.5 bg-white/5 rounded-full px-1 py-0.5">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all whitespace-nowrap">
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex shrink-0">
          <Link href="/login">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center gap-1.5">
              Masuk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="block py-3 text-slate-200 hover:text-orange-400" onClick={() => setMobileMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
          <Link href="/dashboard">
            <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold">Dashboard</button>
          </Link>
        </div>
      )}
    </nav>
  );
};

// ============================================
// HERO SECTION - dengan rotating background & sliding workers
// ============================================
const Hero = () => {
  const [currentWorker, setCurrentWorker] = useState(0);

  const workers = [
    "/images/worker 1.png",
    "/images/worker 2.png",
    "/images/worker 3.png",
    "/images/worker 4.png"
  ];

  // Auto-slide workers - lebih lambat (8 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWorker((prev) => (prev + 1) % workers.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const nextWorker = () => setCurrentWorker((prev) => (prev + 1) % workers.length);
  const prevWorker = () => setCurrentWorker((prev) => (prev - 1 + workers.length) % workers.length);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ========== BASE GRADIENT: More vibrant ========== */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0"></div>

      {/* ========== ANIMATED GRADIENT ORBS - LEBIH VIBRANT ========== */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        {/* Orange orb - kiri atas - LEBIH TERANG */}
        <div
          className="absolute -top-32 -left-32 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/60 to-amber-500/40 rounded-full blur-[150px]"
          style={{ animation: "float1 20s ease-in-out infinite" }}
        />
        {/* Green orb - kanan bawah - LEBIH TERANG */}
        <div
          className="absolute -bottom-32 right-0 w-[700px] h-[700px] bg-gradient-to-br from-emerald-500/40 to-green-500/30 rounded-full blur-[150px]"
          style={{ animation: "float2 25s ease-in-out infinite" }}
        />
        {/* White orb - tengah - LEBIH TERANG */}
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/15 rounded-full blur-[120px]"
          style={{ animation: "float3 18s ease-in-out infinite" }}
        />
        {/* Extra orange glow - kanan tengah */}
        <div
          className="absolute top-1/2 right-[10%] w-[400px] h-[400px] bg-orange-500/30 rounded-full blur-[100px]"
          style={{ animation: "float2 22s ease-in-out infinite reverse" }}
        />
      </div>

      {/* ========== ROTATING HOLOGRAM - pas di belakang worker (right-5%) ========== */}
      <div className="absolute top-1/2 right-[5%] -translate-y-1/2 z-[2]">
        <div
          className="w-[550px] h-[550px] md:w-[650px] md:h-[650px]"
          style={{ animation: "spin 45s linear infinite" }}
        >
          <Image
            src="/images/bg-hologram.png"
            alt="Hologram"
            width={650}
            height={650}
            className="object-contain opacity-70"
            priority
          />
        </div>
      </div>

      {/* Subtle overlay untuk readability teks kiri */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-[3]"></div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, 40px) scale(1.15); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(40px, -20px); }
          75% { transform: translate(-20px, 30px); }
        }
        @keyframes floatWorker {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
          {/* LEFT: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Sistem Monitoring K3 Berbasis AI
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Deteksi Pelanggaran APD
              <span className="text-orange-500"> Secara Real-Time</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl">
              SmartAPD menggunakan kecerdasan buatan YOLOv8 untuk memantau penggunaan Alat Pelindung Diri
              di area kerja. Deteksi dalam hitungan milidetik, cegah kecelakaan sebelum terjadi.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5 fill-white" /> Coba Aplikasi
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="px-8 py-4 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-colors">
                  Lihat Cara Kerja
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: WORKER CAROUSEL with FADE */}
          <div className="relative hidden lg:block h-[500px]">
            {/* Glow Effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-24 bg-orange-500/30 rounded-full blur-[60px]"></div>

            {/* Worker Fade Container */}
            <div className="relative h-full w-full">
              {workers.map((worker, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-end justify-center transition-all duration-700 ease-out
                    ${currentWorker === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                  <Image
                    src={worker}
                    alt={`Safety Worker ${index + 1}`}
                    width={320}
                    height={450}
                    className="object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.3)] max-h-[450px]"
                    style={{ animation: currentWorker === index ? 'floatWorker 3s ease-in-out infinite' : 'none' }}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevWorker}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextWorker}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Floating Detection Cards - diposisikan di luar area worker */}
            <div className="absolute top-8 -left-4 bg-slate-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-2.5 shadow-xl z-10 scale-90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                  <Image src="/images/gambar helm.png" alt="Helm" width={40} height={40} className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Helm <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="text-[10px] text-slate-400">98.5%</div>
                </div>
              </div>
            </div>

            <div className="absolute top-8 -right-4 bg-slate-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-2.5 shadow-xl z-10 scale-90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rompi ✓</div>
                  <div className="text-[10px] text-slate-400">Patuh</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-24 -left-4 bg-slate-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-2.5 shadow-xl z-10 scale-90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                  <Image src="/images/icon sepatu.png" alt="Sepatu" width={40} height={40} className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Sepatu <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="text-[10px] text-slate-400">SNI</div>
                </div>
              </div>
            </div>

            {/* Worker Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {workers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentWorker(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentWorker === i
                    ? 'bg-orange-500 scale-125 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                    : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// STATISTICS SECTION - Data Kecelakaan Kerja Indonesia
// ============================================
const StatisticsSection = () => (
  <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center mb-12">
        <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Data K3 Indonesia</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
          Mengapa Keselamatan Kerja <span className="text-orange-500">Sangat Penting?</span>
        </h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
          Hingga April 2025, tercatat peningkatan signifikan kasus kecelakaan kerja di Indonesia.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-5xl font-black text-red-500 mb-2">47.300</div>
          <div className="text-lg font-bold text-white">Kasus Kecelakaan</div>
          <div className="text-sm text-slate-400 mt-1">Per April 2025</div>
        </div>
        <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
          <div className="text-5xl font-black text-orange-500 mb-2">+12%</div>
          <div className="text-lg font-bold text-white">Peningkatan</div>
          <div className="text-sm text-slate-400 mt-1">Dibanding tahun lalu</div>
        </div>
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
          <div className="text-5xl font-black text-amber-500 mb-2">5.600+</div>
          <div className="text-lg font-bold text-white">Kasus Q1 2025</div>
          <div className="text-sm text-slate-400 mt-1">Tren meningkat</div>
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Sektor Penyumbang Utama</h3>
          <div className="space-y-4">
            {[
              { sector: "Konstruksi", percent: 29, color: "bg-orange-500" },
              { sector: "Manufaktur", percent: 26, color: "bg-red-500" },
              { sector: "Transportasi & Logistik", percent: 18, color: "bg-amber-500" },
              { sector: "Lainnya", percent: 27, color: "bg-slate-500" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{item.sector}</span>
                  <span className="text-white font-bold">{item.percent}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Faktor Penyebab Utama</h3>
          <ul className="space-y-4">
            {[
              "Kelalaian terhadap prosedur K3",
              "Kurangnya pelatihan tenaga kerja baru",
              "Minimnya penyediaan APD standar",
              "Tekanan deadline proyek strategis",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">{i + 1}</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-sm text-orange-300">
              <strong>Solusi SmartAPD:</strong> Deteksi otomatis pelanggaran APD untuk mencegah kecelakaan sebelum terjadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// SOLUSI SECTION - SmartAPD sebagai Solusi (LIGHT MODE)
// ============================================
const SolusiSection = () => (
  <section id="solusi" className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
    {/* Background accent */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[200px]"></div>
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px]"></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Solusi Cerdas</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            SmartAPD: <span className="text-emerald-600">Cegah Kecelakaan</span> Sebelum Terjadi
          </h2>

          <p className="text-slate-600 text-lg">
            Sistem monitoring APD berbasis AI yang mendeteksi pelanggaran secara real-time,
            memberikan alert instan, dan menyimpan bukti otomatis untuk audit kepatuhan K3.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "⚡", title: "Deteksi <50ms", desc: "Super cepat" },
              { icon: "🎯", title: "99.8% Akurat", desc: "YOLOv8 AI" },
              { icon: "📱", title: "Alert Instan", desc: "Via Telegram" },
              { icon: "📊", title: "Dashboard", desc: "Analytics lengkap" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-2xl">{item.icon}</span>
                <div className="mt-2 font-bold text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <button className="mt-4 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25">
              Coba Sekarang <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Right: Dashboard Image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-orange-500/10 rounded-3xl blur-xl"></div>
          <Image
            src="/images/dashboard.png"
            alt="SmartAPD Dashboard"
            width={600}
            height={400}
            className="relative rounded-2xl border border-slate-200 shadow-2xl"
          />
          <div className="absolute -bottom-4 -left-4 bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4" /> Real-time Monitoring
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// CCTV INTEGRATION SECTION
// ============================================
const CCTVSection = () => (
  <section className="py-24 bg-slate-900">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <Image src="/images/cctv.png" alt="CCTV Integration" width={600} height={400} className="rounded-2xl border border-white/10 shadow-2xl" />
          <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Integrasi CCTV</div>
        </div>

        <div className="space-y-6">
          <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Integrasi Mudah</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Hubungkan ke Kamera CCTV yang Sudah Ada</h2>
          <p className="text-slate-400">SmartAPD dapat terhubung ke berbagai jenis kamera: CCTV analog, IP Camera (RTSP), webcam USB, bahkan stream dari DVR/NVR.</p>
          <ul className="space-y-3">
            {["Support RTSP, HTTP, USB", "Multi-kamera simultan", "Recording otomatis saat pelanggaran", "Playback & evidence locker"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />{item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// FEATURES SECTION  
// ============================================
const Features = () => {
  const features = [
    { icon: Eye, title: "Deteksi AI Real-Time", desc: "YOLOv8 mendeteksi helm, rompi, sarung tangan, dan sepatu safety dalam <50ms.", image: "/images/feature-scan.png" },
    { icon: Bell, title: "Notifikasi Instan", desc: "Alert langsung ke Telegram dengan foto bukti pelanggaran.", image: "/images/feature-notif.png" },
    { icon: MapPin, title: "Peta Risiko", desc: "Visualisasi zona berbahaya berdasarkan frekuensi pelanggaran.", image: "/images/feature-map.png" },
  ];

  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Fitur Utama</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Kenapa Memilih SmartAPD?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group rounded-2xl bg-slate-900 border border-white/5 overflow-hidden hover:border-orange-500/30 transition-colors">
              <div className="h-48 relative overflow-hidden">
                <Image src={f.image} alt={f.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { icon: Camera, title: "Multi-Kamera", desc: "Hingga 50+ feed" },
            { icon: Cpu, title: "Edge Computing", desc: "Proses lokal, aman" },
            { icon: BarChart3, title: "Analytics", desc: "Laporan otomatis" },
            { icon: Lock, title: "Secure", desc: "Data terenkripsi" },
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-slate-900/50 border border-white/5 text-center hover:border-orange-500/30 transition-colors">
              <f.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h4 className="font-bold text-white">{f.title}</h4>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// APD EDUCATION SECTION
// ============================================
const APDEducation = () => {
  const apdItems = [
    { image: "/images/gambar helm.png", name: "Helm Safety", desc: "Melindungi kepala dari benturan dan jatuhan benda.", standard: "SNI 1811:2007" },
    { icon: Shirt, name: "Rompi Safety", desc: "Meningkatkan visibilitas pekerja di area berbahaya.", standard: "SNI 7089:2016" },
    { icon: Hand, name: "Sarung Tangan", desc: "Melindungi tangan dari bahan kimia dan benda tajam.", standard: "SNI 7619:2012" },
    { image: "/images/icon sepatu.png", name: "Sepatu Safety", desc: "Melindungi kaki dari tertimpa dan tertusuk.", standard: "SNI 7079:2009" },
  ];

  return (
    <section id="apd" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Edukasi K3</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Jenis APD yang Dideteksi</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apdItems.map((apd, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-orange-500/30 transition-all text-center">
              {apd.image ? (
                <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-slate-700 mb-4">
                  <Image src={apd.image} alt={apd.name} width={80} height={80} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  {apd.icon && <apd.icon className="w-10 h-10 text-white" />}
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-2">{apd.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{apd.desc}</p>
              <span className="text-xs text-orange-400 font-mono">{apd.standard}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// WORKFLOW SECTION - 9 Langkah Timeline (LIGHT MODE)
// ============================================
const WorkflowSection = () => {
  const steps = [
    { num: "01", icon: "📹", title: "Input CCTV", desc: "Kamera CCTV/Webcam terhubung ke sistem" },
    { num: "02", icon: "🌐", title: "Stream ke Server", desc: "Video stream dikirim via RTSP/HTTP" },
    { num: "03", icon: "🐍", title: "AI Processing", desc: "YOLOv8 memproses setiap frame" },
    { num: "04", icon: "🔍", title: "Deteksi Objek", desc: "AI mendeteksi pekerja dan objek" },
    { num: "05", icon: "🎯", title: "Identifikasi APD", desc: "Helm, rompi, sarung tangan, sepatu" },
    { num: "06", icon: "✅", title: "Klasifikasi", desc: "Patuh atau Pelanggaran" },
    { num: "07", icon: "⚡", title: "Alert Real-time", desc: "Notifikasi instan saat pelanggaran" },
    { num: "08", icon: "📱", title: "Telegram Bot", desc: "Foto bukti dikirim ke HP" },
    { num: "09", icon: "📊", title: "Dashboard & Laporan", desc: "Analytics dan evidence locker" },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px]"></div>
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-orange-600 text-sm font-bold uppercase tracking-wider">Arsitektur Sistem</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Cara Kerja SmartAPD</h2>
          <p className="text-slate-600 mt-4">9 langkah dari input hingga output</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-emerald-500 to-orange-500"></div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  {/* Circle */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-orange-500/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:border-orange-500 transition-all shrink-0 shadow-md">
                    {step.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded">{step.num}</span>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Workflow Image */}
          <div className="sticky top-24">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-slate-50 rounded-xl p-4">
                <Image
                  src="/images/workflow.png"
                  alt="System Workflow"
                  width={500}
                  height={300}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">Diagram Arsitektur SmartAPD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// INTEGRASI SECTION
// ============================================
const IntegrationSection = () => (
  <section id="integrations" className="py-24 bg-slate-950 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px]"></div>

    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Integrasi</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Terhubung dengan Sistem Anda</h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">SmartAPD dapat terintegrasi dengan berbagai platform dan protokol industri</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: "📱", name: "Telegram Bot", desc: "Alert real-time ke HP mandor" },
          { icon: "📹", name: "RTSP/ONVIF", desc: "Kompatibel semua IP Camera" },
          { icon: "🔌", name: "REST API", desc: "Integrasi ke sistem ERP/HR" },
          { icon: "💾", name: "Database", desc: "PostgreSQL, MySQL, SQLite" },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center hover:border-orange-500/30 transition-all group">
            <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
            <h3 className="font-bold text-white mb-2">{item.name}</h3>
            <p className="text-sm text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// TECH STACK SECTION
// ============================================
const TechStackSection = () => (
  <section id="tech" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Teknologi</span>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Dibangun dengan Tech Stack Modern</h2>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {[
          { icon: "🧠", name: "YOLOv8", desc: "State-of-the-art object detection", color: "from-purple-500 to-indigo-500" },
          { icon: "🐍", name: "Python", desc: "AI Engine & FastAPI backend", color: "from-blue-500 to-cyan-500" },
          { icon: "⚛️", name: "Next.js", desc: "React framework for dashboard", color: "from-slate-700 to-slate-900" },
          { icon: "🐹", name: "Go", desc: "High-performance API gateway", color: "from-cyan-500 to-teal-500" },
        ].map((tech, i) => (
          <div key={i} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-lg text-center">
              <span className="text-5xl block mb-4">{tech.icon}</span>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{tech.name}</h3>
              <p className="text-sm text-slate-500">{tech.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// DEMO VIDEO SECTION
// ============================================
const DemoVideoSection = () => (
  <section id="demo" className="py-24 bg-slate-950 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center mb-12">
        <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">Demo</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Lihat SmartAPD Beraksi</h2>
        <p className="text-slate-400 mt-4">Video demonstrasi sistem deteksi APD real-time</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
          {/* Video placeholder - bisa diganti dengan video asli */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-500 flex items-center justify-center mb-4 cursor-pointer hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-slate-400">Klik untuk memutar demo</p>
            </div>
          </div>
          {/* Uncomment untuk video asli */}
          {/* <video src="/videos/demo.mp4" controls className="w-full h-full object-cover" /> */}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Deteksi Helm", time: "0:00" },
            { label: "Alert Telegram", time: "0:45" },
            { label: "Dashboard Analytics", time: "1:30" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center cursor-pointer hover:border-orange-500/30 transition-colors">
              <p className="text-xs text-orange-500 font-bold">{item.time}</p>
              <p className="text-sm text-white">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// ABOUT SECTION
// ============================================
const AboutSection = () => (
  <section id="about" className="py-24 bg-gradient-to-b from-white to-slate-50 relative">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Tentang Kami</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-6">
            Dibangun oleh Tim yang Peduli <span className="text-emerald-600">Keselamatan Kerja</span>
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            SmartAPD dikembangkan sebagai solusi inovatif untuk mengatasi tingginya angka kecelakaan kerja
            di Indonesia. Dengan memanfaatkan kecerdasan buatan, kami berkomitmen untuk menciptakan
            lingkungan kerja yang lebih aman bagi seluruh pekerja.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 text-sm font-medium">🎓 Mahasiswa Teknologi</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-orange-50 border border-orange-200">
              <span className="text-orange-700 text-sm font-medium">🏆 Kompetisi Inovasi K3</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <span className="text-blue-700 text-sm font-medium">🇮🇩 Made in Indonesia</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "50+", label: "Jam Development" },
            { value: "4", label: "Jenis APD Terdeteksi" },
            { value: "<50ms", label: "Waktu Deteksi" },
            { value: "99.8%", label: "Akurasi AI" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md text-center">
              <div className="text-3xl font-black text-emerald-600">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// FAQ SECTION
// ============================================
const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Apakah SmartAPD bisa offline?", a: "Ya, semua proses berjalan di server lokal tanpa internet." },
    { q: "Berapa kamera yang bisa dipantau?", a: "GPU entry-level: 4-8 kamera. GPU high-end: 50+ kamera." },
    { q: "Apakah mendukung RTSP?", a: "Ya, mendukung berbagai merek IP Camera (Hikvision, Dahua, dll)." },
    { q: "Bagaimana cara notifikasi?", a: "Via Telegram Bot. WhatsApp & Email sedang dikembangkan." },
    { q: "Bagaimana cara notifikasi?", a: "Via Telegram Bot. WhatsApp & Email sedang dikembangkan." },
    { q: "Apa Saja Tech Stack yang digunakan dalam Pengembangan SoftWare ini", a: "Tech stack yang digunakan Dalam Pembuatan software ini adalah  1.Frontend menggunakan React , Next.js . tailwindcss  2.Backend menggunakan Golang  3.AI menggunakan Yolo v8" },
    { q: "Siapa Yang Mengembangkan Software ini ?", a: "Software ini di kembangkan oleh Muhammad Syarifuddin Yahya dan Nur Jannah favela A.Q. dari SMAN Ngoro Jombang untuk Lomba essay K3 dari PPNS . Serta didukung Oleh GenZ AI Berdampak" },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Pertanyaan Umum</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-slate-800/50 border border-white/5 overflow-hidden">
              <button className="w-full p-5 text-left flex items-center justify-between" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-bold text-white">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-slate-400 text-sm">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA SECTION - Orange Gradient Fullscreen
// ============================================
const CTA = () => (
  <section className="min-h-[85vh] flex items-center relative overflow-hidden">
    {/* Background: Orange gradient + pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600"></div>
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-8">
          <span className="text-2xl">🚀</span>
          <span className="text-white font-bold">Tingkatkan K3 Sekarang</span>
        </div>

        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
          Siap Meningkatkan<br />
          <span className="text-amber-200">Keselamatan Kerja?</span>
        </h2>

        {/* Description */}
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          SmartAPD membantu perusahaan Anda mencapai Zero Accident dengan deteksi APD berbasis AI.
          Mulai hari ini dan lindungi pekerja Anda.
        </p>

        {/* Benefits List */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: "✓", text: "Setup Mudah" },
            { icon: "✓", text: "Tanpa Internet" },
            { icon: "✓", text: "Support 24/7" },
            { icon: "✓", text: "Free Trial" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-white font-medium">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login">
            <button className="px-10 py-5 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-xl shadow-black/20 flex items-center gap-2">
              <Play className="w-5 h-5" /> Coba Sekarang
            </button>
          </Link>
        </div>

        {/* Trust Badge */}
        <p className="text-white/70 text-sm mt-8">
          🔒 Aman & Terenkripsi • Dibuat di Indonesia 🇮🇩
        </p>
      </div>
    </div>
  </section>
);

// ============================================
// FOOTER - White with Orange-Green Gradient
// ============================================
const Footer = () => (
  <footer className="bg-white relative">
    {/* Top gradient border */}
    <div className="h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-orange-500"></div>

    {/* Main Footer */}
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className="rounded-xl shadow-md" />
            <div>
              <span className="text-2xl font-black text-slate-900">Smart<span className="text-orange-500">APD</span></span>
              <p className="text-xs text-slate-500">AI-Powered PPE Detection</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md">
            Sistem monitoring kepatuhan APD berbasis kecerdasan buatan untuk menciptakan
            lingkungan kerja yang lebih aman. Deteksi real-time, notifikasi instan.
          </p>
          <div className="flex gap-3 mt-6">
            {["📧", "📱", "💼"].map((icon, i) => (
              <div key={i} className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer">
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-slate-900 mb-4">Navigasi</h4>
          <ul className="space-y-2">
            {[
              { name: "Fitur", href: "#features" },
              { name: "Jenis APD", href: "#apd" },
              { name: "Cara Kerja", href: "#how-it-works" },
              { name: "FAQ", href: "#faq" },
              { name: "Dashboard", href: "/dashboard" },
            ].map((link, i) => (
              <li key={i}>
                <Link href={link.href} className="text-slate-600 hover:text-orange-500 text-sm transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-slate-900 mb-4">Kontak</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>Jombang, Indonesia</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📧</span>
              <span>info@smartapd.id</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📞</span>
              <span>+62 851 8310 4294</span>
            </li>
          </ul>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-emerald-50 border border-orange-200">
            <p className="text-xs text-orange-700">
              🏆 Dikembangkan untuk Kompetisi Inovasi K3 2025
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-slate-200 py-6 bg-slate-50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">© 2025  SmartAPD. Dari SMANERO untuk Keselamatan Kerja indonesia.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-slate-500 hover:text-orange-500 text-sm transition-colors">Kebijakan Privasi</Link>
          <Link href="/terms" className="text-slate-500 hover:text-orange-500 text-sm transition-colors">Syarat & Ketentuan</Link>
        </div>
      </div>
    </div>
  </footer>
);

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <Navbar />
      <Hero />
      <StatisticsSection />
      <SolusiSection />
      <Features />
      <WorkflowSection />
      <DemoVideoSection />
      <TechStackSection />
      <IntegrationSection />
      <APDEducation />
      <AboutSection />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
