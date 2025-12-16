import Link from 'next/link';

export default function PartnershipBanner() {
  return (
    <section className="bg-gradient-to-r from-orange-900/80 to-amber-900/80 text-white py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/patterns/dots.svg')] opacity-10"></div>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2 text-amber-200">PENAWARAN TERBATAS</h3>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Kemitraan Eksklusif SmartAPD <span className="text-amber-300">+ Pasalku.ai</span>
            </h2>
            <p className="text-amber-100 max-w-2xl">
              Dapatkan akses premium ke platform manajemen K3 terintegrasi kami
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-white p-2 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center text-white font-bold">
                  APD
                </div>
              </div>
              <div className="text-3xl text-amber-300">+</div>
              <div className="bg-white p-2 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded flex items-center justify-center text-white font-bold">
                  AI
                </div>
              </div>
            </div>
            
            <h4 className="text-2xl font-bold text-center text-amber-300 mb-2">
              GRATIS 3 Bulan Akun Premium
            </h4>
            <p className="text-center text-amber-100 text-sm mb-4">
              Senilai Rp 297.000 untuk 10 mitra pertama
            </p>
            
            <Link 
              href="#daftar-sekarang" 
              className="block w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              Daftar Sekarang
            </Link>
            
            <p className="text-xs text-amber-200/80 text-center mt-3">
              Penawaran terbatas. Syarat dan ketentuan berlaku.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
