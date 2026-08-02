"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, Sparkles, ShieldCheck, Laptop, Zap, 
  GraduationCap, Award, Users, CheckCircle2, 
  ArrowRight, HelpCircle, ChevronDown, ChevronUp, 
  Wifi, Monitor, HardDrive, PackageCheck, Mail, Phone,
  Check
} from 'lucide-react';
import DonationModal, { DONATION_TIERS } from '@/components/DonationModal';
import { formatCurrency } from '@/lib/paystack';

export default function DonatePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(35000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleOpenDonateModal = (amount: number) => {
    setSelectedTier(amount);
    setModalOpen(true);
  };

  const hardwareItems = [
    {
      icon: <Laptop size={28} className="text-brand-orange" />,
      title: "Laptops & MacBooks",
      desc: "Working or gently used Windows, Mac, or Linux laptops with chargers. Essential for students' daily coding practicals."
    },
    {
      icon: <Wifi size={28} className="text-brand-orange" />,
      title: "Routers & MiFi Devices",
      desc: "4G/5G mobile WiFi devices, network switches, and data subscriptions to keep students connected."
    },
    {
      icon: <Monitor size={28} className="text-brand-orange" />,
      title: "Monitors & Peripherals",
      desc: "External displays, USB keyboards, mice, flash drives, external HDDs/SSDs, and USB hubs."
    },
    {
      icon: <Zap size={28} className="text-brand-orange" />,
      title: "Power Banks & UPS Units",
      desc: "Portable power stations, UPS backup systems, and laptop power banks for stable electricity."
    }
  ];

  const faqs = [
    {
      q: "How is my online donation processed and is it secure?",
      a: "All online transactions are securely processed through Paystack, a PCI-DSS certified and CBN-licensed payment gateway. We do not store your credit card or bank details on our servers."
    },
    {
      q: "Can I donate physical laptops or computer hardware?",
      a: "Yes! Lack of a laptop is the primary bottleneck for eager students. You can donate new or fairly used laptops, monitors, chargers, or MiFi devices. We securely wipe the hardware, install developer tooling, and assign it to an enrolled student."
    },
    {
      q: "How will my financial donation be used?",
      a: "100% of public donations directly fund student education: purchasing refurbished hardware, paying for high-speed fiber internet and power backup, learning materials, and capstone certification fees."
    },
    {
      q: "Can I donate from outside Nigeria?",
      a: "Yes! Our Paystack checkout accepts international cards (MasterCard, Visa, Apple Pay). For international bank wire transfers, please email us directly at techinejigbo@gmail.com."
    },
    {
      q: "Will I receive a receipt for my donation?",
      a: "Yes! Immediately after your payment is confirmed, an official digital receipt with a unique transaction reference will be displayed on screen and sent to your email."
    }
  ];

  const impactBreakdown = [
    {
      icon: <GraduationCap size={32} className="text-brand-orange" />,
      percent: "45%",
      title: "Tuition & Expert Mentorship",
      desc: "Providing 5 months of hands-on software development & design workshops led by industry mentors."
    },
    {
      icon: <Laptop size={32} className="text-brand-orange" />,
      percent: "30%",
      title: "Hardware & Device Access",
      desc: "Refurbishing and supplying reliable laptops and learning peripherals so every student has a coding workstation."
    },
    {
      icon: <Zap size={32} className="text-brand-orange" />,
      percent: "15%",
      title: "Internet & Power Infrastructure",
      desc: "Guaranteeing high-speed fiber internet and generator backup power for smooth uninterrupted weekend sessions."
    },
    {
      icon: <Award size={32} className="text-brand-orange" />,
      percent: "10%",
      title: "Certifications & Project Showcase",
      desc: "Covering student capstone demo days, community hackathons, and globally recognized certificates."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-dark text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-brand-dark to-brand-dark"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 text-brand-orange-light px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6">
              <Heart size={16} className="fill-brand-orange text-brand-orange" />
              <span>TechinEjigbo Donation Fund</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight mb-6 leading-tight">
              Fuel the Tech Dreams of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange-light">Ejigbo Youths</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto text-balance">
              Every Naira or laptop you donate provides an underprivileged student with real-world programming skills, dedicated workstation access, and life-changing mentorship.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => handleOpenDonateModal(35000)}
                className="bg-brand-orange text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-xl shadow-brand-orange/25 flex items-center gap-2 cursor-pointer"
              >
                <Heart size={20} className="fill-white" />
                <span>Donate Online via Paystack</span>
              </button>
              
              <a 
                href="#hardware-donations"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Laptop size={20} className="text-brand-orange" />
                <span>Donate Hardware</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Impact Stats */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold font-display text-brand-dark mb-1">100%</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Direct Impact Allocation</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold font-display text-brand-orange mb-1">₦35,000</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Full Cohort per Student</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold font-display text-brand-dark mb-1">5 Months</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Intensive Hands-on Training</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold font-display text-emerald-600 mb-1">Zero Cost</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">For Every Student Admitted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Giving Options Tiers Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">Choose Your Level of Support</span>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-brand-dark mb-4">
              Online Giving Options
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Select a sponsorship tier or customize your gift. Every contribution directly expands our capacity for the upcoming cohort.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {DONATION_TIERS.map((tier) => (
              <div 
                key={tier.amount}
                className={`bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                  tier.popular 
                    ? 'border-brand-orange ring-2 ring-brand-orange/20 md:-translate-y-2' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
                      {formatCurrency(tier.amount)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-brand-dark mb-2">{tier.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{tier.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDonateModal(tier.amount)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      tier.popular
                        ? 'bg-brand-orange text-white hover:bg-brand-orange-dark shadow-md shadow-brand-orange/20'
                        : 'bg-slate-900 text-white hover:bg-brand-orange'
                    }`}
                  >
                    <span>Select {tier.label}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Custom Amount Card */}
            <div className="bg-gradient-to-br from-brand-dark to-brand-gray text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="bg-brand-orange/20 p-3 rounded-2xl w-fit text-brand-orange mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-2xl font-bold font-display mb-2 text-white">Custom Contribution</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Any amount you give makes a direct difference. Support our mission with an amount tailored to your budget.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleOpenDonateModal(5000)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-white text-brand-dark hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Choose Custom Amount</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HARDWARE & DEVICE DONATION SECTION */}
      <section id="hardware-donations" className="py-20 bg-white border-t border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/30 text-brand-orange-light px-3 py-1 rounded-full text-xs font-semibold mb-6">
                <Laptop size={14} className="text-brand-orange" />
                <span>Physical Equipment Drive</span>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6">
                  <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight mb-6 leading-tight">
                    Donate Hardware & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange-light">Laptops for Students</span>
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed mb-8">
                    Lack of access to a laptop is the single biggest barrier for young people in Ejigbo seeking tech careers. Have a spare laptop, monitor, or internet router? Your gently used device will become a student's daily workstation.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <PackageCheck size={20} className="text-brand-orange shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-white">Secure Data Wipe:</strong> We perform clean military-grade data wipes before installing developer tools.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <PackageCheck size={20} className="text-brand-orange shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-white">Direct Handover:</strong> Hardware is assigned directly to verified students and tracked through their training.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <PackageCheck size={20} className="text-brand-orange shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-white">Doorstep Pickup Available:</strong> We can arrange dispatch pickup anywhere in Lagos and major Nigerian cities.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/contact"
                      className="bg-brand-orange text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-lg shadow-brand-orange/30 inline-flex items-center gap-2"
                    >
                      <span>Contact Us to Donate Hardware</span>
                      <ArrowRight size={16} />
                    </Link>
                    <a
                      href="mailto:techinejigbo@gmail.com?subject=Hardware%20Donation%20Inquiry"
                      className="bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all inline-flex items-center gap-2"
                    >
                      <Mail size={16} />
                      <span>techinejigbo@gmail.com</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4">
                  {hardwareItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/80 border border-slate-700/70 p-6 rounded-2xl">
                      <div className="bg-white/10 p-3 rounded-xl w-fit mb-4 text-brand-orange">
                        {item.icon}
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-slate-300 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Allocation Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">100% Financial Accountability</span>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-brand-dark mb-4">
              Where Your Donation Goes
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              We operate with maximum transparency. Every fund received goes directly into expanding student reach, tech tools, and high-quality learning materials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactBreakdown.map((item, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 hover:border-brand-orange/30 transition-colors">
                <div className="bg-white p-3 rounded-2xl w-fit mb-4 shadow-sm border border-slate-100">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold font-display text-brand-orange mb-1">{item.percent}</div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">Common Questions</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-brand-dark mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left font-bold font-display text-slate-900 text-base sm:text-lg flex justify-between items-center gap-4 hover:text-brand-orange transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} className="text-brand-orange shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-brand-dark text-white text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <Heart size={44} className="mx-auto text-brand-orange mb-6 fill-brand-orange/20" />
          <h2 className="text-3xl sm:text-5xl font-bold font-display mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Join other generous sponsors in transforming the lives of young tech enthusiasts in Ejigbo today.
          </p>
          <button
            type="button"
            onClick={() => handleOpenDonateModal(35000)}
            className="bg-brand-orange text-white px-9 py-4 rounded-full text-lg font-bold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-xl shadow-brand-orange/30 cursor-pointer inline-flex items-center gap-2"
          >
            <Heart size={20} className="fill-white" />
            <span>Donate via Paystack Now</span>
          </button>
        </div>
      </section>

      {/* Global Donation Modal */}
      <DonationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTier={selectedTier}
      />
    </div>
  );
}
