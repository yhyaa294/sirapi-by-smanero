"use client";

import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Phone,
  ArrowUpRight,
  MoreHorizontal,
  FileText
} from "lucide-react";
import Image from "next/image";
import ViolationDistributionChart from "@/components/dashboard/ViolationDistributionChart";
import ViolationTrendChart from "@/components/dashboard/ViolationTrendChart";

// Dummy Data untuk Mockup Tampilan
const RECENT_DETECTIONS = [
  { id: "100102030", time: "06:45 WIB", attr: "Tanpa Dasi", status: "Melanggar" },
  { id: "100102030", time: "06:40 WIB", attr: "Atribut Lengkap", status: "Aman" },
  { id: "100102031", time: "06:38 WIB", attr: "Tanpa Sabuk", status: "Melanggar" },
  { id: "100102032", time: "06:30 WIB", attr: "Atribut Lengkap", status: "Aman" },
];

const POTENTIAL_CLASSES = [
  { name: "Kelas X-IPA-1", users: "32 Pelanggar" },
  { name: "Kelas XI-IPS-2", users: "15 Pelanggar" },
  { name: "Kelas XII-IPA-4", users: "8 Pelanggar" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            icon={<Users className="text-slate-600" size={20} />} 
            value="845" 
            badge="+12%" 
            label="Total Kedatangan Siswa" 
            sub="hari ini" 
          />
          <MetricCard 
            icon={<CheckCircle2 className="text-slate-600" size={20} />} 
            value="92%" 
            badge="+2.4%" 
            label="Tingkat Kepatuhan" 
            sub="rata-rata mingguan" 
          />
          <MetricCard 
            icon={<AlertCircle className="text-slate-600" size={20} />} 
            value="68" 
            badge="-5%" 
            badgeNegative 
            label="Total Pelanggaran" 
            sub="hari ini" 
          />
          <MetricCard 
            icon={<TrendingUp className="text-slate-600" size={20} />} 
            value="Dasi" 
            badge="+18%" 
            label="Atribut Paling Sering Dilanggar" 
            sub="hari ini" 
          />
        </div>

        {/* Main Grid: Atribut & Sekolah */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Statistik Atribut (Kiri - 2 Kolom) */}
          <div className="lg:col-span-2 bg-[#E1E8F2] rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="text-slate-600" /> Statistik Pelanggaran Atribut
              </h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                  <ArrowUpRight size={18} className="text-slate-600" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                  <MoreHorizontal size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttrStatCard title="Pelanggaran Dasi" value="38 Siswa" badge="+12%" type="blue" updated="Update 1 jam lalu" />
              <AttrStatCard title="Pelanggaran Topi/Baret" value="12 Siswa" badge="-4%" type="dark" updated="Update 1 jam lalu" />
              <AttrStatCard title="Pelanggaran Sepatu" value="15 Siswa" badge="+2%" type="light" updated="Update 1 jam lalu" />
              <AttrStatCard title="Pelanggaran Sabuk" value="3 Siswa" badge="-1%" type="light" updated="Update 1 jam lalu" />
            </div>
          </div>

          {/* Profil Sekolah (Kanan - 1 Kolom) */}
          <div className="bg-[#E1E8F2] rounded-[32px] p-6 shadow-sm border border-white">
             <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Users className="text-slate-600" /> Profil Sekolah
              </h2>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                <ArrowUpRight size={18} className="text-slate-600" />
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-3 shadow-sm">
              <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-4">
                {/* Fallback image style since actual building image might not exist yet */}
                <div className="absolute inset-0 bg-slate-200">
                  <Image 
                    src="/school-logo.jpg" 
                    alt="School Building"
                    fill
                    className="object-cover opacity-80"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-bold text-lg text-slate-800">SMAN Ngoro Jombang</h3>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Sekolah Target</span>
                </div>
                
                <div className="space-y-3 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} />
                    <span>Jl. Raya Ngoro, Jombang, Jawa Timur 61473</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} />
                    <span>+62 321-736281 (Admin Sekolah)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Riwayat & Top Kelas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Riwayat Deteksi (Kiri - 2 Kolom) */}
          <div className="lg:col-span-2 bg-[#E1E8F2] rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="text-slate-600" /> Riwayat Deteksi CCTV Terkini
              </h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                  <ArrowUpRight size={18} className="text-slate-600" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                  <MoreHorizontal size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-100">
                    <th className="pb-4 font-semibold px-4">ID / Keterangan</th>
                    <th className="pb-4 font-semibold">Waktu Deteksi</th>
                    <th className="pb-4 font-semibold">Atribut Terkait</th>
                    <th className="pb-4 font-semibold">Status Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_DETECTIONS.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-700 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Aman' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        {item.id}
                      </td>
                      <td className="py-4 font-medium text-slate-800">{item.time}</td>
                      <td className="py-4 font-bold text-slate-800">{item.attr}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          item.status === 'Aman' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tren Kelas (Kanan - 1 Kolom) */}
          <div className="bg-[#E1E8F2] rounded-[32px] p-6 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Users className="text-slate-600" /> Daftar Pengawasan Kelas
              </h2>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                <MoreHorizontal size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-sm space-y-2">
              {POTENTIAL_CLASSES.map((cls, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition rounded-2xl group cursor-pointer border border-transparent hover:border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{cls.name}</h4>
                    <p className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-slate-200 text-[10px] flex items-center justify-center text-slate-600">{idx+1}</span>
                      {cls.users}
                    </p>
                  </div>
                  <ArrowUpRight className="text-slate-400 group-hover:text-blue-500 transition" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Komponen Pembantu (Micro-Components)

function MetricCard({ icon, value, badge, label, sub, badgeNegative }: any) {
  return (
    <div className="bg-[#EAEFF5] rounded-[24px] p-6 border border-white flex flex-col justify-between h-[140px]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#DFE6F0] shadow-inner flex items-center justify-center">
          {icon}
        </div>
        <div className="flex items-baseline gap-3">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${badgeNegative ? 'bg-slate-200 text-slate-600' : 'bg-blue-500 text-white'}`}>
            {badgeNegative ? '↘' : '↗'} {badge}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-xs font-medium text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function AttrStatCard({ title, value, badge, type, updated }: any) {
  const isBlue = type === 'blue';
  const isDark = type === 'dark';
  
  let bgClass = "bg-white text-slate-800 border-white";
  let textMuted = "text-slate-400";
  let badgeClass = "bg-slate-100 text-slate-700";
  
  if (isBlue) {
    bgClass = "bg-[#1E5BF0] text-white shadow-md border-transparent";
    textMuted = "text-blue-200";
    badgeClass = "bg-white text-blue-700";
  } else if (isDark) {
    bgClass = "bg-[#0F172A] text-white shadow-md border-transparent";
    textMuted = "text-slate-400";
    badgeClass = "bg-white text-slate-900";
  }

  return (
    <div className={`p-6 rounded-[28px] border flex flex-col justify-between h-[160px] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer ${bgClass}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm max-w-[60%] leading-relaxed">{title}</h4>
        <ArrowUpRight size={18} className={isBlue || isDark ? 'text-white/60 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'} />
      </div>
      
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-2xl font-black tracking-tight">{value}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>
            ↗ {badge}
          </span>
        </div>
        <p className={`text-xs font-medium ${textMuted}`}>{updated}</p>
      </div>
    </div>
  );
}

