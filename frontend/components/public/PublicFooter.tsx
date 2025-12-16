import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SmartAPD</h3>
            <p className="text-sm text-gray-300">
              Solusi K3 4.0 berbasis AI untuk menciptakan lingkungan kerja yang lebih aman dan produktif.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Tautan Cepat</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/#features" className="text-sm text-gray-300 hover:text-white">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-gray-300 hover:text-white">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="text-sm text-gray-300 hover:text-white">
                  Manfaat
                </Link>
              </li>
              <li>
                <Link href="/#technology" className="text-sm text-gray-300 hover:text-white">
                  Teknologi
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-300 hover:text-white">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-300 hover:text-white">
                  Kebijakan Cookie
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Hubungi Kami</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex">
                <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-300">
                  Jl. Contoh No. 123, Jakarta Selatan, Indonesia
                </span>
              </li>
              <li className="flex">
                <Phone className="flex-shrink-0 h-5 w-5 text-gray-400" />
                <a href="tel:+6281234567890" className="ml-3 text-sm text-gray-300 hover:text-white">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex">
                <Mail className="flex-shrink-0 h-5 w-5 text-gray-400" />
                <a href="mailto:info@smartapd.id" className="ml-3 text-sm text-gray-300 hover:text-white">
                  info@smartapd.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-sm text-center text-gray-400">
            &copy; {new Date().getFullYear()} SmartAPD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
