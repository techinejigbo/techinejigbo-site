"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Laptop, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Sparkles,
  Monitor,
  PackageCheck
} from 'lucide-react';
import DonationModal from '@/components/DonationModal';

export default function DonatePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const moneyPoints = [
    "Purchase learning materials",
    "Provide internet access for training",
    "Organize workshops and classes",
    "Print learning resources and certificates",
    "Maintain training equipment"
  ];

  const hardwareItems = [
    "Laptops",
    "Desktop computers",
    "Monitors",
    "Keyboards and mice",
    "Tablets",
    "Projectors",
    "Networking equipment",
    "Extension cables and power strips",
    "Other working tech accessories"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero / Header Section */}
      <section className="bg-brand-dark text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-brand-dark to-brand-dark pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 text-brand-orange-light px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6">
            <Heart size={16} className="fill-brand-orange text-brand-orange" />
            <span>Make a Difference</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight mb-6 leading-tight">
            Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange-light">TechinEjigbo</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-6 leading-relaxed max-w-2xl mx-auto">
            Every young person deserves the opportunity to learn digital skills and build a brighter future. Your support helps us provide free tech training, learning materials, and equipment for students in Ejigbo.
          </p>

          <p className="text-base md:text-lg text-slate-300 font-medium max-w-xl mx-auto">
            Whether you give financially or donate devices, you&apos;re investing in the next generation of innovators.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-brand-orange text-white px-8 py-3.5 rounded-full text-base font-bold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-xl shadow-brand-orange/25 flex items-center gap-2 cursor-pointer"
            >
              <Heart size={18} className="fill-white" />
              <span>Donate Now</span>
            </button>
            <a
              href="#donate-hardware"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Laptop size={18} className="text-brand-orange" />
              <span>Donate Hardware</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Options Section: Donate Money & Donate Hardware */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Donate Money */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="bg-amber-100/80 text-brand-orange p-3.5 rounded-2xl w-fit mb-6">
                  <Heart size={28} className="fill-brand-orange" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mb-4">
                  Donate Money
                </h2>

                <p className="text-slate-600 font-medium mb-4">
                  Your financial support helps us:
                </p>

                <ul className="space-y-3 mb-8">
                  {moneyPoints.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base">
                      <CheckCircle2 size={20} className="text-brand-orange shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="font-semibold text-slate-900 mb-5 text-sm sm:text-base">
                  Every donation, no matter the size, makes a difference.
                </p>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-orange-dark transition-all hover:scale-[1.02] shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart size={18} className="fill-white" />
                  <span>Donate Now</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Card 2: Donate Hardware */}
            <div id="donate-hardware" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden scroll-mt-24">
              <span id="hardware-donations" className="absolute -top-24 opacity-0 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/15 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="bg-brand-orange/20 text-brand-orange p-3.5 rounded-2xl w-fit mb-6 border border-brand-orange/30">
                  <Laptop size={28} className="text-brand-orange" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
                  Donate Hardware
                </h2>

                <p className="text-slate-300 font-medium mb-4">
                  Do you have tech equipment you no longer use?
                </p>

                <p className="text-slate-400 text-sm mb-3">
                  We welcome donations such as:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {hardwareItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl text-slate-200 text-xs sm:text-sm border border-slate-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/40">
                  All donated equipment will be refurbished (where necessary) and used to support students during training.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact?subject=Hardware%20Donation"
                  className="flex-1 bg-brand-orange text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-orange-dark transition-all hover:scale-[1.02] shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 text-center"
                >
                  <Laptop size={18} />
                  <span>Donate Hardware</span>
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="mailto:techinejigbo@gmail.com?subject=Hardware%20Donation%20Inquiry"
                  className="bg-white/10 border border-white/20 text-white px-5 py-4 rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  title="Send us an email"
                >
                  <Mail size={18} />
                  <span className="hidden sm:inline">Email Us</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Your Support Matters */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100/70 text-amber-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-4">
            <Sparkles size={14} className="text-brand-orange" />
            <span>Community Impact</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-6">
            Why Your Support Matters
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            Many of our students are eager to learn but have limited access to computers and digital resources. Your generosity helps remove these barriers and gives them the opportunity to develop life-changing skills.
          </p>

          <p className="text-slate-900 font-semibold text-lg mb-8">
            Together, we can build a more digitally empowered Ejigbo.
          </p>

          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/70 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
            <p className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">
              Thank you for supporting TechinEjigbo. ❤️
            </p>
            <p className="text-slate-600 text-sm mb-6">
              Ready to take action? Choose an option above or click below to give online.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-brand-orange text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-md shadow-brand-orange/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <Heart size={18} className="fill-white" />
              <span>Donate Online Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* Global Donation Modal */}
      <DonationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
