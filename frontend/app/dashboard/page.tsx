"use client";

import { useState, useEffect } from "react";
import ViolationTrendChart from "@/components/dashboard/ViolationTrendChart";
import ViolationDistributionChart from "@/components/dashboard/ViolationDistributionChart";
import { motion } from "framer-motion";
import {
  Calendar,
  Settings2,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Shirt,
  Footprints,
  GraduationCap,
  X,
  Plus,
  Info
} from "lucide-react";

// Day Configuration Presets
const DAY_PRESETS: Record<string, { dasi: boolean; topi: boolean; sabuk: boolean; sepatu: boolean; hasduk: boolean; batik: boolean; label: string }> = {
  senin: { dasi: true, topi: true, sabuk: true, sepatu: true, hasduk: false, batik: false, label: "Seragam Putih Abu-Abu + Topi" },
  selasa: { dasi: true, topi: false, sabuk: true, sepatu: true, hasduk: false, batik: false, label: "Seragam Putih Abu-Abu" },
  rabu: { dasi: false, topi: false, sabuk: true, sepatu: true, hasduk: false, batik: true, label: "Seragam Batik" },
  kamis: { dasi: true, topi: false, sabuk: true, sepatu: true, hasduk: false, batik: false, label: "Seragam Putih Abu-Abu" },
  jumat: { dasi: false, topi: false, sabuk: true, sepatu: true, hasduk: true, batik: false, label: "Seragam Pramuka + Hasduk" },
  sabtu: { dasi: false, topi: false, sabuk: true, sepatu: true, hasduk: false, batik: false, label: "Seragam Bebas Rapi" },
};

// Stats Data - Placeholder values (waiting for backend)
const STATS = [
  { label: "Total Siswa Masuk", value: "--", subtext: "dari -- siswa", icon: Users, color: "text-slate-400", bg: "bg-slate-500/10", border: "" },
  { label: "Tingkat Kepatuhan", value: "--%", subtext: "Belum ada data", icon: CheckCircle2, color: "text-slate-400", bg: "bg-slate-500/10", border: "" },
  { label: "Pelanggaran Atribut", value: "--", subtext: "Hari ini", icon: AlertTriangle, color: "text-slate-400", bg: "bg-slate-500/10", border: "" },
];

export default function DashboardPage() {
  // Get current day
  const getDayKey = () => {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = new Date().getDay();
    return days[today] === 'minggu' ? 'senin' : days[today];
  };

  const [selectedDay, setSelectedDay] = useState(getDayKey());
  const [uniformRules, setUniformRules] = useState(DAY_PRESETS[selectedDay]);
  const [exceptionClasses, setExceptionClasses] = useState<string[]>([]);
  const [newException, setNewException] = useState("");

  // Update rules when day changes
  useEffect(() => {
    setUniformRules(DAY_PRESETS[selectedDay]);
  }, [selectedDay]);

  const toggleRule = (key: keyof typeof uniformRules) => {
    setUniformRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addException = () => {
    if (newException.trim() && !exceptionClasses.includes(newException.trim())) {
      setExceptionClasses(prev => [...prev, newException.trim()]);
      setNewException("");
    }
  };

  const removeException = (cls: string) => {
    setExceptionClasses(prev => prev.filter(c => c !== cls));
  };

  const dayLabels: Record<string, string> = {
    senin: "SENIN",
    selasa: "SELASA",
    rabu: "RABU",
    kamis: "KAMIS",
    jumat: "JUMAT",
    sabtu: "SABTU",
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Today's Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-700 rounded-2xl shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)]">
          <p className="text-white text-sm font-bold flex items-center gap-2 tracking-wide">
            <Calendar size={18} />
            HARI INI: {dayLabels[selectedDay]} - {DAY_PRESETS[selectedDay].label.toUpperCase()}
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aturan seragam aktif berdasarkan hari</span>
      </motion.div>

      {/* Configuration Panels Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Panel 1: Day Selector + Uniform Rules (2 cols) */}
        <motion.div
          className="xl:col-span-2 glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200/50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings2 size={18} className="text-primary" />
              </div>
              <h2 className="font-bold text-slate-800 tracking-wide">Konfigurasi Aturan Hari Ini</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Auto-save aktif</span>
          </div>

          <div className="p-6">
            {/* Day Selector */}
            <div className="mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Pilih Hari</label>
              <div className="flex flex-wrap gap-2.5">
                {Object.keys(DAY_PRESETS).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedDay === day
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                  >
                    {dayLabels[day]}
                  </button>
                ))}
              </div>
            </div>

            {/* Attribute Toggles */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Atribut Wajib</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <ToggleCard
                  icon={<Shirt size={20} />}
                  label="Wajib Dasi"
                  active={uniformRules.dasi}
                  onChange={() => toggleRule('dasi')}
                />
                <ToggleCard
                  icon={<GraduationCap size={20} />}
                  label="Wajib Topi/Baret"
                  active={uniformRules.topi}
                  onChange={() => toggleRule('topi')}
                />
                <ToggleCard
                  icon={<Shield size={20} />}
                  label="Wajib Sabuk"
                  active={uniformRules.sabuk}
                  onChange={() => toggleRule('sabuk')}
                />
                <ToggleCard
                  icon={<Footprints size={20} />}
                  label="Wajib Sepatu Hitam"
                  active={uniformRules.sepatu}
                  onChange={() => toggleRule('sepatu')}
                />
                <ToggleCard
                  icon={<Shield size={20} />}
                  label="Wajib Hasduk"
                  active={uniformRules.hasduk}
                  onChange={() => toggleRule('hasduk')}
                  highlight={selectedDay === 'jumat'}
                />
                <ToggleCard
                  icon={<Shirt size={20} />}
                  label="Seragam Batik"
                  active={uniformRules.batik}
                  onChange={() => toggleRule('batik')}
                  highlight={selectedDay === 'rabu'}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel 2: Exception Mode (1 col) */}
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-amber-200/50 flex items-center gap-3 bg-amber-50/50">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={18} className="text-warning" />
            </div>
            <h2 className="font-bold text-amber-900 tracking-wide">Mode Bebas / Olahraga</h2>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
              <Info size={16} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800 leading-relaxed">
                Kelas yang sedang PJOK/Olahraga tidak akan terdeteksi pelanggaran atribut.
              </p>
            </div>

            {/* Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newException}
                onChange={(e) => setNewException(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addException()}
                placeholder="Contoh: X-IPA-1"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-slate-400"
              />
              <button
                onClick={addException}
                className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-soft hover:shadow-md hover:-translate-y-0.5"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Exception List */}
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-hide">
              {exceptionClasses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-400">Belum ada kelas yang dikecualikan</p>
                </div>
              ) : (
                exceptionClasses.map((cls) => (
                  <div key={cls} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-colors group">
                    <span className="text-sm font-bold text-slate-700 tracking-wide">{cls}</span>
                    <button
                      onClick={() => removeException(cls)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-critical transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {STATS.map((stat, idx) => (
          <div key={idx} className={`glass-card p-6 flex flex-col justify-between group`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-medium text-slate-400 mt-2">
                  {stat.subtext}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft transition-transform group-hover:scale-110 ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="h-[350px]"
        >
          <ViolationTrendChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="h-[350px]"
        >
          <ViolationDistributionChart />
        </motion.div>
      </div>
    </div>
  );
}

// Toggle Card Component (Compact Enterprise Design)
function ToggleCard({ icon, label, active, onChange, highlight }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onChange: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      onClick={onChange}
      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
        active
          ? 'bg-blue-50/50 border-blue-200 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300'
      } ${highlight ? 'ring-2 ring-blue-500/30' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
          {icon}
        </div>
        <p className={`text-sm font-semibold tracking-wide ${active ? 'text-blue-900' : 'text-slate-700'}`}>
          {label}
        </p>
      </div>

      <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 border ${
        active ? 'bg-blue-600 border-blue-600 justify-end' : 'bg-slate-200 border-slate-300 justify-start'
      }`}>
        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}
