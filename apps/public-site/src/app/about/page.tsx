import React from 'react';
import { Target, Lightbulb, MapPin, Rocket, HelpCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-50 py-24 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-display text-brand-dark mb-8">
            Techin <span className="text-brand-orange">Ejigbo</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">
            A name coined from two words, "Teching" and "Ejigbo". <br className="hidden md:block"/>
            This yielded "Techin Ejigbo" which means empowering Ejigbo community through tech skills.
          </p>
        </div>
      </section>

      {/* What Birthed Techin Ejigbo */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-dark text-white rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 text-brand-orange">
              <HelpCircle size={250} />
            </div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-8 text-brand-orange">
                What birthed Techin Ejigbo?
              </h2>
              <div className="space-y-6 text-lg md:text-xl text-slate-300 leading-relaxed">
                <p>
                  A group of tech enthusiasts saw the need to redirect the influence of social media and internet on the teenagers of Ejigbo.
                </p>
                <p>
                  The level of tech awareness amongst Ejigbo teenagers shows a growing interest but faces notable challenges in access and depth.
                </p>
                <p className="font-semibold text-white text-xl md:text-2xl mt-8">
                  "Techin Ejigbo" was created to bridge that gap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Mission */}
            <div className="bg-white border border-slate-100 p-10 lg:p-14 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-200/50 hover:border-brand-orange/30 transition-colors group">
              <div className="bg-brand-orange/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target size={40} className="text-brand-orange" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-6 text-brand-dark">Our Mission</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                Our mission is to revolutionise Ejigbo into a tech aware environ where it's youths and teenagers can fit into the growing demand for tech skills in the world.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white border border-slate-100 p-10 lg:p-14 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-200/50 hover:border-brand-orange/30 transition-colors group">
              <div className="bg-brand-dark/5 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Lightbulb size={40} className="text-brand-dark" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-6 text-brand-dark">Our Vision</h2>
              <p className="text-lg leading-relaxed text-slate-600">
                We are committed to empowering the next generation of teenagers and youths in Ejigbo and Nigeria as a whole with knowledge and hands-on skills that opens doors to future opportunities in tech and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Plan */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-brand-orange/10 p-4 rounded-full mb-8 shadow-sm">
            <Rocket size={40} className="text-brand-orange" />
          </div>
          <h2 className="text-4xl font-bold font-display text-brand-dark mb-8">Our Plan</h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            We aim at doing this by reaching out to secondary school students, starting from the underprivileged areas in Ejigbo, offering technical and non technical empowerment to them. This will inturn improve their outlook to the use of internet and give them lifetime access to quality information and opportunities.
          </p>
        </div>
      </section>

      {/* Location / Action */}
      <section className="py-20 bg-brand-dark text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
            <MapPin size={32} className="text-brand-orange" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-6">Join the Movement in Ejigbo</h2>
          <p className="text-slate-300 mb-10 text-lg">
            Whether you want to sponsor a student, volunteer as an instructor, or partner with us, there's a place for you.
          </p>
          <a href="/get-involved" className="inline-flex bg-brand-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-orange-dark transition-colors shadow-lg shadow-brand-orange/20">
            Get Involved Today
          </a>
        </div>
      </section>
    </div>
  );
}
