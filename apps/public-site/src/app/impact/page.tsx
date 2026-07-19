import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, BookOpen, Clock, Users, Briefcase, CheckCircle2 } from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-brand-dark text-white py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-sm font-semibold tracking-widest text-brand-orange uppercase mb-4">Our Impact</h1>
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">From Zero to Hero: Real Stories, Real Results</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
            In just five months, TechinEjigbo took secondary school students with little to no tech exposure and turned them into confident designers and developers. This is more than training: it’s proof that with opportunity, Ejigbo’s youth can compete on any stage.
          </p>
          <Link href="#gallery" className="inline-flex items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-orange-dark transition-all hover:scale-105">
            Explore Student Projects <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-center mb-8 font-display">Impact At A Glance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><Clock size={24}/></div>
                <div className="font-bold text-slate-900">Cohort 1 Completed</div>
                <div className="text-sm text-slate-500">February to July 2025</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><BookOpen size={24}/></div>
                <div className="font-bold text-slate-900">Schools Reached</div>
                <div className="text-sm text-slate-500">Sevenstar Academy & AsSobru Private School</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><Users size={24}/></div>
                <div className="font-bold text-slate-900">Students Trained</div>
                <div className="text-sm text-slate-500">50+ passionate learners</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><Briefcase size={24}/></div>
                <div className="font-bold text-slate-900">Skills Delivered</div>
                <div className="text-sm text-slate-500">Web Dev, Graphic Design, Digital Literacy</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><Trophy size={24}/></div>
                <div className="font-bold text-slate-900">Ongoing Support</div>
                <div className="text-sm text-slate-500">Alumni network for advanced projects</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full text-brand-orange mb-3"><ArrowRight size={24}/></div>
                <div className="font-bold text-slate-900">Next Step</div>
                <div className="text-sm text-slate-500">Cohort 2 launching soon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Journey Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold font-display text-brand-dark mb-6">The Journey: 5 Months of Grit & Growth</h3>
          <div className="prose prose-lg prose-slate max-w-none">
            <p>
              Months ago, we identified a critical gap in our community. Many talented young minds in Ejigbo lacked access to digital skills that could open doors to brighter futures.
            </p>
            <p>
              We launched TechinEjigbo with a simple mission: <strong>To impact.</strong>
            </p>
            <p>What followed was nothing short of inspiring:</p>
            <ul>
              <li>Students who had never touched design tools were creating professional logos and branding materials.</li>
              <li>Beginners in coding progressed to building their own web projects.</li>
              <li>Late-night submissions (some until 1 AM) using shared phones showed unmatched dedication.</li>
              <li>While some hesitated, the committed ones pushed us to show up stronger every session.</li>
            </ul>
            <p>
              These weren’t just classes, they were journeys of self-discovery. Students learned they could exceed expectations and beat the odds.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Call to Action */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold font-display text-brand-dark mb-6">See Our Students in Action</h3>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            From graphic design to web development, our students have built incredible projects. Check out our comprehensive gallery to view their work and classroom moments.
          </p>
          <Link href="/gallery" className="inline-flex items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-lg shadow-brand-orange/20">
            View the Full Gallery <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 bg-brand-dark text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold font-display mb-6">Why This Matters</h3>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            These students balanced academics, limited resources, and sometimes lack of personal devices, yet they showed up with enthusiasm and determination that moved everyone involved.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            We are not leaving them behind. Cohort 1 graduates remain part of the TechinEjigbo family. We continue mentoring them while preparing to reach even more schools in Cohort 2.
          </p>
        </div>
      </section>
    </div>
  );
}
