import React from 'react';
import { Target, Lightbulb, Heart, MapPin, Users2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold font-display text-brand-dark mb-6">Our Story</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            We are driven by a singular belief: talent is everywhere, but opportunity is not. We exist to bring world-class tech opportunities to the heart of Ejigbo.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-brand-orange text-white p-12 rounded-3xl relative overflow-hidden shadow-xl shadow-brand-orange/20">
              <div className="absolute top-0 right-0 p-8 opacity-20"><Target size={120} /></div>
              <h2 className="text-3xl font-bold font-display mb-6 relative z-10">Our Mission</h2>
              <p className="text-lg leading-relaxed relative z-10">
                To change lives by equipping underprivileged youths and teenagers in Ejigbo with practical tech skills, fostering self-discovery, innovation, and future opportunities. We bridge the digital skills gap through hands-on workshops in web development, graphic design, and digital literacy.
              </p>
            </div>
            <div className="bg-brand-dark text-white p-12 rounded-3xl relative overflow-hidden shadow-xl shadow-brand-dark/20">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Lightbulb size={120} /></div>
              <h2 className="text-3xl font-bold font-display mb-6 relative z-10">Our Vision</h2>
              <p className="text-lg leading-relaxed relative z-10 text-slate-300">
                A community where every young person, regardless of their background, has the digital skills to compete globally, build sustainable livelihoods, and innovate for the future of Nigeria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-brand-dark mb-4">Our Core Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">The principles that guide our workshops, our community, and our growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Empathy First", desc: "We understand the unique challenges our students face and design our programs to be supportive and accessible." },
              { icon: Target, title: "Relentless Grit", desc: "We celebrate the late nights, the hard work, and the determination it takes to go from zero to hero." },
              { icon: Users2, title: "Community Driven", desc: "We build together. Our alumni, volunteers, and partners form a family that supports continuous growth." }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="inline-block bg-orange-50 text-brand-orange p-4 rounded-full mb-6">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Focus */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-brand-dark text-white p-4 rounded-full mb-8 shadow-lg shadow-brand-dark/20">
            <MapPin size={40} className="text-brand-orange" />
          </div>
          <h2 className="text-3xl font-bold font-display text-brand-dark mb-6">Rooted in Ejigbo</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            While tech is global, our focus is incredibly local. We partner directly with local schools, like Sevenstar Academy and AsSobru Private School, in Ejigbo, Lagos State. By focusing deeply on our immediate community, we create a concentrated, visible impact that inspires neighbors and siblings to join the digital revolution.
          </p>
        </div>
      </section>

      {/* Team / Volunteers (Placeholder) */}
      <section className="py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">Meet the Team</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">
            The passionate volunteers, mentors, and educators making this possible.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-800 rounded-full mb-4 border-2 border-brand-orange flex items-center justify-center">
                  <span className="text-slate-600 text-sm">Photo</span>
                </div>
                <h4 className="font-bold text-lg">Lead Volunteer {i}</h4>
                <p className="text-brand-orange text-sm">Instructor / Mentor</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
