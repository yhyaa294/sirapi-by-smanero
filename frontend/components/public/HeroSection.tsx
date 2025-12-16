"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Zap, Sparkles, Phone, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONFIGURATION ---
const CAROUSEL_IMAGES = [
  "/images/orang landing page 1.png",
  "/images/orang landing page 2.png",
  "/images/orang landing page 3.png",
  "/images/orang landing page 4.png",
];

const GRID_SIZE = 60;

// --- SUB-COMPONENTS ---

/**
 * Industrial Background System
 * Gradient + Particles + Rotating Hologram Ring
 */
const BackgroundSystem = () => {
  // Particles logic
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-gradient-to-br from-[#022c22] to-[#020617]">
      
      {/* Moving Hex Grid Overlay */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      {/* Floating Particles (Orange/Green only) */}
      {particles.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ y: `${p.y}%`, x: `${p.x}%`, opacity: 0 }}
          animate={{
            y: ["110%", "-10%"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          className={cn(
            "absolute rounded-full",
            i % 2 === 0 ? "bg-emerald-500/40" : "bg-orange-500/40"
          )}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Floating Asset Decoration
 * New 'glass-shield' asset (using hiasan landing page.png as fallback/actual asset)
 */
const FloatingAsset = () => {
  return (
    <motion.img
      src="/images/hiasan landing page.png"
      alt="Safety Shield Hologram"
      initial={{ y: 20, opacity: 0 }}
      animate={{ 
        y: [0, -15, 0],
        opacity: 1 
      }}
      transition={{ 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.5, delay: 1.0 }
      }}
      className="absolute top-[30%] left-[10%] lg:left-[20%] z-30 w-32 lg:w-40 scale-110 object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"
    />
  );
};

/**
 * Hero Carousel with Rotating Hologram Ring
 */
const HeroCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[550px] lg:h-[85vh] w-full flex items-end justify-center lg:justify-end pointer-events-none">
      
      {/* ROTATING HOLOGRAM RING (Background Decoration) */}
      {/* Shifted more to right (translate-x-1/4) and lower opacity (opacity-60) */}
      <div className="absolute top-1/2 right-[-20%] lg:right-[5%] translate-x-1/4 -translate-y-1/2 w-[600px] h-[600px] lg:w-[900px] lg:h-[900px] z-0 mix-blend-screen opacity-30 lg:opacity-60">
         <motion.img 
            src="/images/background orang landing page.png"
            alt="Hologram Ring"
            className="w-full h-full object-contain rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
         />
      </div>

      {/* Glow Effect behind character */}
      <div className="absolute bottom-0 right-0 lg:right-20 w-[500px] h-[500px] bg-gradient-to-t from-emerald-900/30 to-transparent blur-[120px] rounded-full z-0" />

      {/* Floating Asset Decoration (New) */}
      <FloatingAsset />

      {/* Character Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={index}
          src={CAROUSEL_IMAGES[index]}
          alt={`SmartAPD Worker ${index + 1}`}
          className="absolute bottom-0 h-[85%] lg:h-[95%] w-auto object-contain object-bottom z-10 drop-shadow-2xl [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: [0, -10, 0], // Floating effect
            scale: 1.05
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.0, ease: "easeInOut" },
            scale: { duration: 6.5, ease: "linear" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" } // Floating animation
          }}
        />
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-orange-500/30">
      
      {/* 1. Background System */}
      <BackgroundSystem />

      {/* 2. Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-8 bg-slate-900/80 backdrop-blur-md border-b border-white/5"
      >
        {/* Logo */}
        <div className="flex items-center gap-4 select-none cursor-pointer group">
          <div className="relative h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center rounded-xl overflow-hidden border border-orange-500/30 bg-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform mix-blend-screen">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
                src="/images/logo-smartapd.jpg" 
                alt="SmartAPD Logo" 
                className="h-full w-full object-contain" 
             />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-xl tracking-wider">SMARTAPD</span>
            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
            <span className="font-thin text-orange-400 text-lg tracking-wide hidden sm:block">Vision AI</span>
          </div>
        </div>

        {/* Desktop Menu - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-slate-300">
          {['Fitur', 'Cara Kerja', 'Harga'].map((item) => (
            <Link key={item} href="#" className="hover:text-white transition-colors duration-300">
              {item}
            </Link>
          ))}
        </div>

        {/* CTA Button (Nav) - Visible on Mobile but smaller */}
        <Link 
          href="/login"
          className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        >
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
          LOGIN
        </Link>
      </motion.nav>

      {/* 3. Content Container (Grid Layout Fix for Mobile) */}
      <div className="relative z-10 mx-auto min-h-screen max-w-[1400px] px-6 lg:px-12 flex flex-col pt-20 lg:pt-0 lg:grid lg:grid-cols-12 items-center gap-8 lg:gap-16">
        
        {/* RIGHT COLUMN: Dynamic Visuals (Mobile First: Image Top) */}
        {/* On Mobile: Order 1 (Top), Height constrained */}
        {/* On Desktop: Order 2 (Right), Full Height */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="w-full h-[40vh] lg:h-full lg:col-span-5 relative flex items-end justify-center lg:justify-end order-1 lg:order-2"
        >
          <HeroCarousel />
        </motion.div>

        {/* LEFT COLUMN: Typography */}
        {/* On Mobile: Order 2 (Bottom) */}
        {/* On Desktop: Order 1 (Left) */}
        <div className="w-full pb-12 lg:pb-0 lg:pt-0 lg:col-span-7 relative z-20 text-left order-2 lg:order-1">
          <div className="max-w-3xl space-y-6 lg:space-y-8">
            {/* Headline - Responsive Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white"
            >
              AWASI PEKERJAMU <br />
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-[0_0_35px_rgba(249,115,22,0.3)]">
                SECARA REAL-TIME
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-base sm:text-lg leading-relaxed text-slate-400 md:text-xl max-w-xl font-light"
            >
              Platform pengawasan K3 berbasis AI untuk mendeteksi pelanggaran APD secara instan. 
              Tingkatkan keselamatan kerja dengan <span className="text-emerald-400 font-medium">Computer Vision</span> tingkat industri.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col gap-4 sm:flex-row pt-4"
            >
              <Link 
                href="/login"
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-orange-600 px-8 py-4 font-bold text-white shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all hover:bg-orange-500 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 animate-[pulse_2s_infinite] bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>Pakai Sekarang</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link 
                href="https://wa.me/6282330919114"
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-4 font-bold text-slate-300 transition-all hover:bg-slate-800 hover:border-slate-500 hover:text-white"
              >
                <Phone className="h-5 w-5" />
                <span>Hubungi Sales</span>
              </Link>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-8 border-t border-slate-800/50 pt-8"
            >
              <div>
                <div className="text-2xl font-bold text-white">99.8%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Akurasi Deteksi</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-2xl font-bold text-white">&lt; 2s</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Respon Waktu</div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
