import React from 'react';
import Link from 'next/link';
import { Code2, Heart, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="bg-brand-orange text-white p-1.5 rounded-lg">
                <Code2 size={20} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Techin<span className="text-brand-orange">Ejigbo</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Equipping underprivileged youths and teenagers in Ejigbo with world-class tech skills. From zero to hero, we’re building the next generation of digital innovators.
            </p>
            <div className="flex space-x-6 text-sm font-medium items-center">
              <a href="https://x.com/TechinEjigbo" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-orange transition-colors" aria-label="X">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
              <a href="https://facebook.com/Tech-In-Ejigbo-61567228547648" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-orange transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-orange transition-colors">Our Story</Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-brand-orange transition-colors">Programs</Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-brand-orange transition-colors">Impact & Gallery</Link>
              </li>
              <li>
                <Link href="https://exam.techinejigbo.com" className="hover:text-brand-orange transition-colors">Student Portal</Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-white font-semibold mb-6">Support Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/get-involved" className="hover:text-brand-orange transition-colors">Sponsor a Student</Link>
              </li>
              <li>
                <Link href="/get-involved" className="hover:text-brand-orange transition-colors">Volunteer</Link>
              </li>
              <li>
                <Link href="/get-involved" className="hover:text-brand-orange transition-colors">Corporate Partnerships</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-orange transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <a href="mailto:techinejigbo@gmail.com" className="hover:text-white transition-colors">
                  techinejigbo@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <span>Ejigbo, Lagos State<br/>Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} TechinEjigbo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
