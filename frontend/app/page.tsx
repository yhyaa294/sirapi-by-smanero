'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Zap,
  LayoutDashboard,
  UserCheck,
  ChevronDown,
  ArrowRight,
  Bell,
  School,
  LogIn,
  AlertTriangle,
  FileX,
  Clock,
  Users,
  MonitorPlay,
  Smartphone,
  Lock,
} from 'lucide-react';

import PixelWarpBackground from '../components/PixelWarpBackground';


// --- Shared Components ---

const GlassCard = ({ children, className = '', hoverEffect = true }: { children: React.ReactNode; className?: string; hoverEffect?: boolean }) => (
  <motion.div
    className={`bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl ${className}`}
    whileHover={hoverEffect ? { y: -4, transition: { duration: 0.3 } } : {}}
  >
    {children}
  </motion.div>
);

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Sections ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto flex items-center justify-between gap-6 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/40 transition-all duration-300 w-full max-w-6xl ${isScrolled ? 'bg-white/90 shadow-2xl py-2.5' : ''
          }`}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sirapi-logo.png" alt="SiRapi Logo" className="w-full h-full object-contain object-left" />
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            {['Beranda', 'Fitur', 'Cara Kerja', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-blue-700 transition-colors">
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: School Placeholder & Login */}
        <div className="flex items-center gap-4">
          {/* School Placeholder */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/school-logo.jpg" alt="SMAN Ngoro" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-slate-700">SMAN Ngoro Jombang</span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors text-sm font-semibold px-4 py-2 hover:bg-slate-50 rounded-full"
          >
            <span>Masuk</span>
            <LogIn size={16} />
          </Link>
        </div>
      </motion.nav>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-32">
      {/* Floating Monochrome Cards - Orbiting */}
      <motion.div
        className="absolute top-[25%] left-[5%] lg:left-[15%] z-10 hidden md:block"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-full text-slate-600">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
            <p className="text-sm font-bold text-slate-800">Atribut Lengkap</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[25%] right-[5%] lg:right-[15%] z-10 hidden md:block"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-52">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-500 font-semibold">Skor Disiplin</span>
            <span className="text-lg font-bold text-blue-700">98%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-[98%] rounded-full" />
          </div>
        </div>
      </motion.div>

      <AnimatedSection className="max-w-4xl relative z-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
          Kedisiplinan Sekolah <br />
          <span className="text-blue-700">Dalam Satu Scan AI.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Sistem monitoring atribut siswa otomatis berbasis Computer Vision. <br className="hidden md:block" />
          Objektif, Akurat, dan Terpercaya.
        </p>

        {/* Single Primary Action */}
        <div>
          <Link href="/login" className="group relative inline-flex items-center justify-center gap-3 bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95">
            Coba Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
};

// 1. VISUAL SHOWCASE (Enhanced with Glowing Aura)
const VisualShowcase = () => {
  const { scrollYProgress } = useScroll();
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  return (
    <section className="py-20 flex justify-center px-4 pb-32">
      <motion.div
        style={{ rotateX: rotateX, scale: scale, transformStyle: "preserve-3d" }}
        className="relative max-w-6xl w-full"
      >
        {/* Glowing Aura Background */}
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full -z-10 transform scale-75" />

        <div className="relative bg-white rounded-2xl p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 ring-1 ring-slate-100">
          <div className="aspect-[16/9] bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100">
            {/* Mock Dashboard UI */}
            <div className="absolute top-0 w-full h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <div className="flex-1 max-w-sm h-8 bg-slate-50 rounded-lg border border-slate-200" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
            </div>

            <div className="pt-16 p-8 grid grid-cols-12 gap-6 h-full font-sans">
              <div className="col-span-2 hidden lg:block space-y-2">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-full bg-white border border-slate-100 rounded-lg" />)}
              </div>
              <div className="col-span-12 lg:col-span-10 grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="h-4 w-20 bg-slate-100 rounded mb-4" />
                    <div className="h-8 w-12 bg-blue-100 rounded" />
                  </div>
                ))}
                <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-64 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">
                  Analytics Visualization
                </div>
                <div className="col-span-1 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-64 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">
                  Live Feed
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Definition = () => {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto border-y border-slate-200" id="cara-kerja">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 font-bold text-xs mb-6">
            <Zap size={14} className="fill-blue-700" />
            AI POWERED
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">Bukan Sekadar CCTV, <br /> Ini Asisten Cerdas.</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            SiRapi tidak menggantikan peran guru, melainkan memberdayakan mereka.
            Dengan kecerdasan buatan, kami mengonversi rekaman visual menjadi data objektif yang dapat ditindaklanjuti.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Otomatisasi pencatatan pelanggaran atribut",
              "Laporan objektif tanpa bias subjektivitas",
              "Notifikasi real-time ke wali kelas via Telegram"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mt-1">
                  <CheckCircle2 size={20} className="text-blue-700" />
                </div>
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
        <AnimatedSection className="relative bg-slate-50 rounded-3xl p-10 border border-slate-200 shadow-inner">
          <div className="space-y-8 relative">
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-slate-200" />
            {[
              { step: "1", title: "Scan CCTV", desc: "Kamera wawasan mendeteksi siswa di gerbang masuk sekolah." },
              { step: "2", title: "Analisis AI", desc: "Algoritma mengecek kelengkapan 6 titik atribut (Dasi, Sabuk, dll)." },
              { step: "3", title: "Laporan & Aksi", desc: "Data pelanggaran tersimpan aman & notifikasi terkirim ke guru." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start relative z-10">
                <div className="w-10 h-10 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center font-bold text-blue-700 shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

// 2. THE CRISIS (New Section)
const TheCrisis = () => {
  return (
    <section className="py-24 px-4 bg-red-50/90 backdrop-blur-sm border-y border-red-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Mengapa Metode Manual Gagal?</h2>
          <p className="text-lg text-red-600 font-medium">Masalah klasik yang dihadapi sekolah setiap hari.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FileX size={32} />,
              title: "85% Data Hilang",
              desc: "Pencatatan manual di kertas sering terselip atau tidak terinput ke buku poin."
            },
            {
              icon: <Clock size={32} />,
              title: "45 Menit Terbuang",
              desc: "Guru piket menghabiskan waktu produktif hanya untuk mencatat pelanggaran siswa satu per satu."
            },
            {
              icon: <AlertTriangle size={32} />,
              title: "Subjektivitas",
              desc: "Penilaian kerap bias. Siswa yang sama bisa dinilai berbeda oleh guru yang berbeda."
            }
          ].map((item, i) => (
            <GlassCard key={i} className="p-8 border-red-100 bg-white/80">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// 3. THE SOLUTION (New Section)
const TheSolution = () => {
  return (
    <section className="py-24 px-4 bg-slate-900 text-white overflow-hidden relative">
      {/* Background Mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transformasi Total</h2>
          <p className="text-slate-400 text-lg">Dari manual yang melelahkan menuju digital yang presisi.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-700 rounded-3xl overflow-hidden">
          {/* Before */}
          <div className="p-10 bg-slate-800/50 flex flex-col items-center text-center">
            <div className="mb-6 opacity-50 grayscale">
              {/* Abstract Visual for Manual */}
              <div className="w-40 h-40 bg-slate-700 rounded-full flex items-center justify-center">
                <FileX size={60} className="text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Cara Lama</h3>
            <p className="text-slate-500 text-sm">Tumpukan kertas, rekap ulang manual, data tidak akurat.</p>
          </div>

          {/* After */}
          <div className="p-10 bg-blue-900/20 flex flex-col items-center text-center relative border-t md:border-t-0 md:border-l border-slate-700">
            <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full" />
              <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center relative z-10 shadow-lg">
                <MonitorPlay size={60} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cara SiRapi</h3>
            <p className="text-blue-200 text-sm">Otomatis, Real-time, Analitik lengkap dalam satu dashboard.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CoreFeatures = () => {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="fitur">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Unggulan</h2>
        <p className="text-slate-600 text-lg">Teknologi pemantauan canggih yang dikemas dalam antarmuka sederhana.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="md:col-span-2 p-8 flex flex-col md:flex-row gap-8 items-center bg-white overflow-hidden group">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <UserCheck size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Deteksi 6 Titik Atribut</h3>
              <p className="text-slate-600 leading-relaxed">Mendeteksi kelengkapan siswa dari ujung kepala hingga kaki secara presisi menggunakan model AI Computer Vision terbaru.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Dasi", "Sabuk", "Kaos Kaki", "Sepatu", "Badge", "Logo"].map((item) => (
                <span key={item} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
            <UserCheck size={80} className="text-slate-300" />
          </div>
        </GlassCard>

        {/* Feature 2: Privacy (Updated) */}
        <GlassCard className="p-8 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">End-to-End Encryption</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Data siswa dilindungi dengan enkripsi tingkat militer (AES-256). Hanya pihak sekolah yang memiliki kunci akses (Private Key) untuk melihat data.</p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-white">
          <Bell className="text-blue-600 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Alert</h3>
          <p className="text-slate-600 text-sm">Notifikasi pelanggaran masuk instan via Telegram ke HP Guru.</p>
        </GlassCard>

        <GlassCard className="p-8 bg-white md:col-span-2">
          <div className="flex items-start gap-4">
            <LayoutDashboard className="text-purple-600 mt-1" size={32} />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Comprehensive Analytics</h3>
              <p className="text-slate-600 text-sm">Laporan bulanan visual untuk evaluasi kedisiplinan tingkat sekolah, kelas, maupun individu.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

// 4. INTEGRATION (New Section)
const Integration = () => {
  return (
    <section className="py-20 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-8">Kompatibel dengan CCTV Lama Anda</h3>
        <p className="text-slate-600 mb-10 max-w-2xl mx-auto">
          Tanpa perlu membeli kamera baru. SiRapi bekerja sebagai "otak tambahan" yang terhubung ke sistem CCTV IP Camera yang sudah ada.
        </p>

        {/* Marquee Grayscale Logos */}
        <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder Brands - using text for generic representation */}
          {["HIKVISION", "DAHUA", "SONY", "PANASONIC", "BOSCH", "SAMSUNG"].map((brand) => (
            <span key={brand} className="text-xl font-bold text-slate-400 tracking-widest">{brand}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. STAKEHOLDER BENEFITS (New Section)
const StakeholderBenefits = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Guru & Staf",
      icon: <School size={18} />,
      benefits: ["Tidak perlu piket catat manual", "Laporan otomatis di Excel/PDF", "Notifikasi real-time via WA/Telegram"]
    },
    {
      title: "Wali Murid",
      icon: <Users size={18} />,
      benefits: ["Transparansi poin disiplin anak", "Bukti pelanggaran berupa foto (blur)", "Notifikasi otomatis jika anak melanggar"]
    },
    {
      title: "Kepala Sekolah",
      icon: <LayoutDashboard size={18} />,
      benefits: ["Dashboard analitik satu sekolah", "Pengambilan keputusan berbasis data", "Meningkatkan citra kedisiplinan sekolah"]
    }
  ];

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Solusi Untuk Semua</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all ${activeTab === idx
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            {tab.icon}
            {tab.title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Keuntungan bagi {tabs[activeTab].title}</h3>
              <ul className="space-y-4">
                {tabs[activeTab].benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <CheckCircle2 size={14} />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 flex items-center justify-center border border-slate-100 aspect-video col-span-1">
              <div className="text-center">
                <Smartphone size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 text-sm">Ilustrasi tampilan aplikasi untuk {tabs[activeTab].title}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section className="py-24 px-4 max-w-3xl mx-auto" id="faq">
      <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Pertanyaan Umum</h2>
      <div className="space-y-4">
        {[
          { q: "Apakah perlu internet kencang?", a: "Tidak. Pemrosesan AI dilakukan di server lokal sekolah (Edge Computing). Internet hanya dibutuhkan untuk mengirim notifikasi teks ke Telegram (sangat ringan)." },
          { q: "Apakah data siswa aman?", a: "Sangat aman. Kami menggunakan sistem Enkripsi N2N (Node-to-Node). Data tidak disimpan di cloud publik sembarangan." },
          { q: "Apakah bisa pakai CCTV lama?", a: "Bisa. SiRapi kompatibel dengan 99% IP Camera standar (RTSP/ONVIF). Tidak perlu bongkar pasang kamera baru." },
          { q: "Berapa biaya instalasinya?", a: "Biaya bervariasi tergantung jumlah titik kamera. Hubungi kami untuk survei lokasi gratis." },
          { q: "Apakah ada notifikasi ke Orang Tua?", a: "Ya. Orang tua bisa mendapatkan laporan harian via WhatsApp atau Aplikasi SiRapi Parents." },
          { q: "Bagaimana jika internet mati?", a: "Sistem tetap berjalan mencatat pelanggaran di database lokal. Notifikasi akan terkirim otomatis saat internet kembali nyala." }
        ].map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <details className="group p-4">
              <summary className="flex justify-between items-center font-bold text-slate-800 cursor-pointer list-none text-base">
                <span>{item.q}</span>
                <span className="transition-transform group-open:rotate-180 text-slate-400">
                  <ChevronDown size={20} />
                </span>
              </summary>
              <div className="text-slate-600 mt-3 pt-3 border-t border-slate-100 text-sm leading-relaxed">
                {item.a}
              </div>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- NEW SECTIONS ---

// Live System Performance Metrics (replaced marquee)
const LiveSystemMetrics = () => {
  const metrics = [
    { label: "Siswa Terdeteksi", value: "735", sub: "Hari ini", icon: <Users size={22} /> },
    { label: "Tingkat Kepatuhan", value: "96.2%", sub: "+2.1% dari minggu lalu", icon: <CheckCircle2 size={22} /> },
    { label: "Kamera Aktif", value: "12", sub: "dari 16 total", icon: <MonitorPlay size={22} /> },
    { label: "Pelanggaran Hari Ini", value: "28", sub: "Rata-rata 45/hari", icon: <AlertTriangle size={22} /> },
  ];

  return (
    <section className="py-16 px-4 border-y border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Performa Sistem</p>
            <h3 className="text-2xl font-bold text-slate-900">Ringkasan Operasional</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">Sistem Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                  {m.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{m.value}</p>
              <p className="text-sm font-medium text-slate-600 mb-1">{m.label}</p>
              <p className="text-xs text-slate-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Clean CTA Section
const CallToAction = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Siap Meningkatkan<br />Kedisiplinan Sekolah?
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
          Bergabung dengan sekolah-sekolah modern yang telah bertransformasi dengan SiRapi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/10 active:scale-[0.98]">
            Jadwalkan Demo
            <ArrowRight size={18} />
          </Link>
          <a href="#fitur" className="inline-flex items-center gap-2 text-slate-600 font-semibold px-6 py-4 rounded-full hover:bg-slate-100 transition-colors text-base">
            Lihat Fitur
          </a>
        </div>
      </div>
    </section>
  );
};

// Professional Static Footer (Hashnode-style)
const SiteFooter = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Branding */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sirapi-logo.png" alt="SiRapi" className="h-7 object-contain" />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Sistem deteksi seragam berbasis AI untuk sekolah modern.
            </p>
            <p className="text-xs text-slate-400">
              Partner Resmi: <span className="font-semibold text-slate-600">SMAN Ngoro Jombang</span>
            </p>
          </div>

          {/* Produk */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Produk</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#fitur" className="hover:text-slate-900 transition-colors">Fitur</a></li>
              <li><a href="#cara-kerja" className="hover:text-slate-900 transition-colors">Cara Kerja</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a></li>
              <li><Link href="/login" className="hover:text-slate-900 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Sekolah */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Sekolah</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">SMAN Ngoro</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Panduan Guru</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Bantuan</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Dokumentasi</a></li>
              <li><a href="#faq" className="hover:text-slate-900 transition-colors">Kontak</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">© 2026 SiRapi Intelligence System. All rights reserved.</span>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <main className="min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-900 scroll-smooth relative isolate">
      <PixelWarpBackground />
      <Navbar />
      <HeroSection />

      {/* System Metrics Showcase */}
      <LiveSystemMetrics />

      <VisualShowcase />
      <Definition />
      <TheCrisis />
      <TheSolution />
      <CoreFeatures />
      <Integration />
      <StakeholderBenefits />
      <FAQ />

      {/* CTA + Footer */}
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
