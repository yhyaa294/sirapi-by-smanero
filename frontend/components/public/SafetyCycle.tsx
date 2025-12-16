import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const steps = [
  {
    title: 'DETEKSI',
    description: 'Sistem kami secara otomatis mendeteksi pelanggaran APD menggunakan teknologi computer vision',
    icon: '1',
  },
  {
    title: 'ANALISIS',
    description: 'Menganalisis pola dan tren pelanggaran untuk mengidentifikasi area risiko tinggi',
    icon: '2',
  },
  {
    title: 'AKSI',
    description: 'Memberikan notifikasi real-time dan panduan perbaikan segera',
    icon: '3',
  },
  {
    title: 'INTELIJEN',
    description: 'Laporan komprehensif dan rekomendasi berbasis data untuk peningkatan berkelanjutan',
    icon: '4',
  },
];

export default function SafetyCycle() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">
              Siklus Keselamatan Cerdas
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Pendekatan komprehensif kami memastikan setiap aspek keselamatan kerja terpantau dan terkelola dengan baik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-orange-400 mb-3 mt-2">{step.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{step.description}</p>
              <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors text-sm">
                <span className="font-medium">Pelajari lebih lanjut</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
              
              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/5 rounded-full -z-10 group-hover:bg-orange-500/10 transition-colors"></div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ChevronRight className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
