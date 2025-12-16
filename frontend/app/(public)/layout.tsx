import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartAPD - Solusi K3 4.0 untuk Industri Anda',
  description: 'Ciptakan Zero Accident. Otomatiskan Kepatuhan dengan solusi AI untuk keselamatan kerja.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-white`}>
      <PublicHeader />
      <main className="min-h-screen">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
