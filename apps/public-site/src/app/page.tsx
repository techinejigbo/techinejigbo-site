import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Code2, Heart, Users, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-brand-dark to-brand-dark"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            {/* <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/20 text-brand-orange-light text-sm font-medium mb-6 border border-brand-orange/30">
              Cohort 2 Applications Opening Soon
            </span> */}
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 leading-tight">
              Empowering Ejigbo Youths Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange-light">Tech</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              TechinEjigbo equips underprivileged youths and teenagers in Ejigbo with world-class tech skills. From zero to hero, we’re building the next generation of developers, designers, and digital innovators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-involved" className="inline-flex justify-center items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-lg shadow-brand-orange/20">
                Sponsor a Student
              </Link>
              <Link href="/impact" className="inline-flex justify-center items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all">
                See Our Impact <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-brand-dark font-display mb-2">1+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Cohorts Completed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-brand-dark font-display mb-2">2</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Partner Schools</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-brand-dark font-display mb-2">5</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Months of Training</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-brand-dark font-display mb-2">100%</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Passion & Grit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                We believe that talent is equally distributed, but opportunity is not. Many talented young minds in Ejigbo lack access to digital skills that could open doors to brighter futures.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                TechinEjigbo bridges the digital skills gap through hands-on workshops in web development, graphic design, and digital literacy. We change lives by equipping underprivileged students with practical tech skills, fostering self-discovery, innovation, and future opportunities.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Hands-on, practical training",
                  "Mentorship from industry professionals",
                  "Building real-world projects",
                  "Fostering a supportive tech community"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="text-brand-orange shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="text-brand-orange font-semibold hover:text-brand-orange-dark flex items-center gap-1 group">
                Read our full story <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-slate-200 rounded-2xl overflow-hidden relative shadow-2xl">
                <Image 
                  src="/TechinEjigboLogo.png"
                  alt="TechinEjigbo"
                  fill
                  className="object-contain bg-white p-8"
                />
              </div>
              {/* Decorative element */}
              {/* <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs border border-slate-100">
                <div className="flex gap-4 items-start">
                  <div className="bg-orange-50 p-3 rounded-full text-brand-orange">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark">Skills Taught</h4>
                    <p className="text-sm text-slate-500 mt-1">Web Development (HTML/CSS/JS) & Graphic Design</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Teaser CTA Section */}
      <section className="py-24 bg-brand-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <Heart size={48} className="mx-auto text-brand-orange mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">Be Part of the Next Chapter</h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed text-balance">
            Your support can multiply this impact. Whether you want to sponsor a student's education, volunteer your time, or donate equipment, you make a direct difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/get-involved" className="bg-brand-orange text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-lg shadow-brand-orange/20">
              Support Our Mission
            </Link>
            <Link href="/get-involved" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all">
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
