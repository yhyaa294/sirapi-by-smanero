import { TrendingDown, Activity, ShieldCheck, Users } from 'lucide-react';

const benefits = [
  {
    icon: <TrendingDown className="w-6 h-6 text-orange-500" />,
    title: "Turunkan Biaya Insiden",
    description: "Kurangi biaya kompensasi, asuransi, dan downtime akibat kecelakaan kerja"
  },
  {
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    title: "Tingkatkan Produktivitas",
    description: "Lingkungan kerja yang aman meningkatkan efisiensi dan moral tim"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
    title: "Penuhi Kepatuhan",
    description: "Patuhi regulasi K3 dan hindari sanksi dengan dokumentasi yang terpercaya"
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Bangun Budaya Aman",
    description: "Tingkatkan kesadaran dan tanggung jawab keselamatan di seluruh level organisasi"
  }
];

export default function Benefits() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Investasi K3, Bukan Sekadar Biaya
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Solusi yang memberikan nilai tambah nyata bagi bisnis Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-orange-500/20">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Konsultasi Gratis dengan Tim Kami
          </div>
        </div>
      </div>
    </section>
  );
}
