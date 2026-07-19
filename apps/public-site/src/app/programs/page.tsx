import React from 'react';
import Link from 'next/link';
import { MonitorPlay, PenTool, Layout, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

export default function ProgramsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold font-display text-brand-dark mb-6">Our Programs</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Comprehensive, hands-on workshops designed to take students from absolute beginners to capable creators in just 5 months.
          </p>
        </div>
      </section>

      {/* Cohort Model Overview */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-brand-dark mb-6">The Cohort Model</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                We don't just drop off tutorials; we build structured, intensive learning environments. Our programs run in 5-month cohorts in direct partnership with local secondary schools.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="text-brand-orange mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">5-Month Duration</h4>
                    <p className="text-slate-600 text-sm">Intensive weekend and after-school sessions balancing tech education with regular academics.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Layout className="text-brand-orange mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Project-Based Learning</h4>
                    <p className="text-slate-600 text-sm">Theory is minimal. Students learn by building real websites, designing actual logos, and solving practical problems.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Award className="text-brand-orange mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Post-Cohort Support</h4>
                    <p className="text-slate-600 text-sm">Graduation isn't the end. We maintain an alumni network for advanced projects, freelance guidance, and continuous mentorship.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 text-center">
              <BookOpen size={48} className="mx-auto text-brand-orange mb-6" />
              <h3 className="text-2xl font-bold font-display text-brand-dark mb-4">Cohort 2 Enrollment</h3>
              <p className="text-slate-600 mb-8">We are actively preparing to launch Cohort 2 and expanding our reach to more schools in Ejigbo.</p>
              <Link href="/get-involved" className="inline-block bg-brand-dark text-white px-8 py-3 rounded-full font-semibold hover:bg-black transition-colors">
                Partner Your School
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Curriculum Tracks */}
      <section className="py-24 bg-brand-dark text-white border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">Core Curriculum</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Two distinct tracks designed to provide highly marketable digital skills.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Web Dev Track */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-10 rounded-3xl border border-slate-700 hover:border-brand-orange/50 transition-colors">
              <MonitorPlay size={48} className="text-brand-orange mb-6" />
              <h3 className="text-3xl font-bold font-display mb-4">Web Development</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                From understanding how the internet works to deploying functional applications. Students learn the foundational languages of the web and modern frameworks.
              </p>
              <div className="space-y-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 1: The Foundations</h4>
                  <p className="text-sm text-slate-400">HTML5 semantics, CSS3 styling, responsive layouts, and basic UI design principles.</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 2: Interactivity</h4>
                  <p className="text-sm text-slate-400">JavaScript fundamentals, DOM manipulation, logic, and problem-solving algorithms.</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 3: Modern Frameworks</h4>
                  <p className="text-sm text-slate-400">Introduction to component-based architecture using React and Tailwind CSS.</p>
                </div>
              </div>
            </div>

            {/* Graphic Design Track */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-10 rounded-3xl border border-slate-700 hover:border-brand-orange/50 transition-colors">
              <PenTool size={48} className="text-brand-orange mb-6" />
              <h3 className="text-3xl font-bold font-display mb-4">Graphic Design</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Empowering students to communicate visually. This track covers the principles of design, color theory, and mastery of industry-standard tools.
              </p>
              <div className="space-y-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 1: Design Principles</h4>
                  <p className="text-sm text-slate-400">Typography, color theory, alignment, contrast, and visual hierarchy.</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 2: Brand Identity</h4>
                  <p className="text-sm text-slate-400">Creating logos, brand guidelines, and understanding the psychology of branding.</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-brand-orange-light mb-1">Module 3: Tool Mastery</h4>
                  <p className="text-sm text-slate-400">Hands-on practice using Canva, and other tools for real-world scenarios like flyers, social media posts, banners and logos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
