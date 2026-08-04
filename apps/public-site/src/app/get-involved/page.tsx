"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Sparkles, CheckCircle2, Send, ArrowRight, 
  Code2, Palette, Briefcase, Calendar, Clock, 
  Award, Globe2, MessageSquare, ChevronDown, ChevronUp,
  HeartHandshake
} from 'lucide-react';
import { saveVolunteer } from '@techinejigbo/firebase/src/firestore';

export default function GetInvolvedPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    expertise: 'Web Development',
    availability: '2-4 hours / week',
    linkedin: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await saveVolunteer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        expertise: `${formData.expertise} (Availability: ${formData.availability})${formData.phone ? ` | Phone: ${formData.phone}` : ''}${formData.message ? ` | Note: ${formData.message}` : ''}`,
        linkedin: formData.linkedin,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        expertise: 'Web Development',
        availability: '2-4 hours / week',
        linkedin: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const volunteerRoles = [
    {
      icon: <Code2 size={28} className="text-brand-orange" />,
      title: "Web Development Instructors",
      tags: ["Frontend", "Backend", "Fullstack", "Git"],
      desc: "Guide students through HTML, CSS, JavaScript, React, and project building in hands-on weekend workshops."
    },
    {
      icon: <Palette size={28} className="text-brand-orange" />,
      title: "UI/UX & Design Mentors",
      tags: ["Figma", "Visual Identity", "Product Design"],
      desc: "Mentor aspiring designers on user research, wireframing, component libraries, and creating stellar portfolio pieces."
    },
    {
      icon: <Briefcase size={28} className="text-brand-orange" />,
      title: "Career & Soft Skills Coaches",
      tags: ["Resume Reviews", "Mock Interviews", "Workplace Skills"],
      desc: "Equip students with interview confidence, GitHub / LinkedIn branding, communication, and freelance skills."
    },
    {
      icon: <Calendar size={28} className="text-brand-orange" />,
      title: "Operations & Event Coordinators",
      tags: ["Onboarding", "Logistics", "Demo Days"],
      desc: "Support cohort management, student check-ins, event coordination, and community hackathons."
    }
  ];

  const benefits = [
    {
      icon: <HeartHandshake size={24} className="text-brand-orange" />,
      title: "Tangible Community Impact",
      desc: "Directly empower youth in Ejigbo with market-ready digital skills that lift families and create career breakthroughs."
    },
    {
      icon: <Globe2 size={24} className="text-brand-orange" />,
      title: "Flexible Commitment",
      desc: "Contribute remotely as a guest speaker, mentor asynchronously online, or join us on-site for weekend practicals."
    },
    {
      icon: <Users size={24} className="text-brand-orange" />,
      title: "Vibrant Tech Network",
      desc: "Connect with like-minded senior software engineers, founders, designers, and community leaders."
    },
    {
      icon: <Award size={24} className="text-brand-orange" />,
      title: "Volunteer Recognition",
      desc: "Receive official appreciation certificates, alumni network recognition, and spotlights across our channels."
    }
  ];

  const volunteerFaqs = [
    {
      q: "Do I need to be physically present in Ejigbo to volunteer?",
      a: "No! While we welcome on-site weekend workshop facilitators in Ejigbo, we also have remote mentorship roles, virtual guest lecture slots, code reviews, and curriculum advisory opportunities."
    },
    {
      q: "What is the expected time commitment?",
      a: "Our volunteer opportunities are flexible. You can commit as little as 1-2 hours for a masterclass or guest session, or 2-4 hours weekly for cohort mentoring."
    },
    {
      q: "What happens after I submit my volunteer application?",
      a: "Our core team will review your application and reach out via email or WhatsApp within 3 to 5 business days for a brief introductory call and onboarding."
    },
    {
      q: "Can I host a specialized masterclass or workshop?",
      a: "Absolutely! We love guest masterclasses on specialized topics like AI/ML, Cloud Computing, Cybersecurity, Mobile App Development, or Freelancing."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Hero */}
      <section className="bg-brand-dark text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-brand-dark to-brand-dark"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Share Your Knowledge. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange-light">Shape Future Innovators.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto text-balance mb-8">
            TechinEjigbo is built by passionate technologists and mentors. Lend your skills in programming, design, career guidance, or event logistics to transform lives in our community.
          </p>

          <div className="flex justify-center">
            <a 
              href="#volunteer-form"
              className="bg-brand-orange text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-brand-orange-dark transition-all hover:scale-105 shadow-xl shadow-brand-orange/25 flex items-center gap-2"
            >
              <span>Apply to Volunteer</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Volunteer Tracks / Roles */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">Areas of Contribution</span>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-brand-dark mb-4">
              How You Can Help
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              We welcome diverse talents. Choose where your passion and expertise can create the biggest impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {volunteerRoles.map((role, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-brand-orange/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="bg-white p-3.5 rounded-2xl w-fit mb-6 shadow-sm border border-slate-100">
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-brand-dark mb-3">{role.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{role.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-200/60">
                  {role.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-white text-slate-700 text-xs px-2.5 py-1 rounded-full border border-slate-200 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Volunteer With Us */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">Why Join Us</span>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-brand-dark mb-4">
              Why Volunteer with TechinEjigbo?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Volunteering is a two-way journey of personal growth, community leadership, and lasting social impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="bg-orange-50 p-3 rounded-xl w-fit mb-4 text-brand-orange">
                  {b.icon}
                </div>
                <h4 className="text-lg font-bold font-display text-brand-dark mb-2">{b.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Application Form Section */}
      <section id="volunteer-form" className="py-20 bg-white border-t border-slate-100 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="grid lg:grid-cols-5">
              
              {/* Left Column Info */}
              <div className="lg:col-span-2 bg-brand-dark text-white p-10 lg:p-14 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/30 text-brand-orange-light px-3 py-1 rounded-full text-xs font-semibold mb-6">
                    <Sparkles size={14} /> Faculty Application
                  </div>
                  <h3 className="text-3xl font-bold font-display mb-4">Join Our Faculty</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    Fill out this quick form and our team will get in touch with you. We appreciate every contribution of time and knowledge!
                  </p>

                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 shrink-0"></div>
                      <span>Open to all levels of experienced mentors & enthusiasts.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 shrink-0"></div>
                      <span>Hybrid format: remote guest lectures or on-site classes.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 shrink-0"></div>
                      <span>Full onboarding and curriculum support provided.</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-8 mt-8 border-t border-slate-800 text-xs text-slate-400">
                  Questions about volunteering? Email us directly at{' '}
                  <a href="mailto:techinejigbo@gmail.com" className="text-brand-orange font-semibold hover:underline">
                    techinejigbo@gmail.com
                  </a>
                </div>
              </div>

              {/* Right Column Form */}
              <div className="lg:col-span-3 p-8 sm:p-12 lg:p-14 bg-white">
                <h3 className="text-2xl font-bold font-display text-brand-dark mb-2">Volunteer Application Form</h3>
                <p className="text-slate-600 text-sm mb-8">Please tell us a bit about yourself and your skills.</p>

                {isSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center py-12">
                    <CheckCircle2 size={56} className="text-emerald-500 mb-4" />
                    <h4 className="text-2xl font-bold mb-2">Application Received!</h4>
                    <p className="text-emerald-700 max-w-md text-sm leading-relaxed">
                      Thank you for volunteering to empower Ejigbo's youth. Our team will review your application and reach out to you shortly.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-6 text-sm font-bold text-brand-orange hover:text-brand-orange-dark underline"
                    >
                      Submit another application
                    </button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">First Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm" 
                          placeholder="e.g. Adebayo" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Last Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm" 
                          placeholder="e.g. Ogunleye" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm" 
                          placeholder="adebayo@example.com" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Phone / WhatsApp</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm" 
                          placeholder="+234 800 000 0000" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Primary Area of Expertise *</label>
                        <select 
                          value={formData.expertise}
                          onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm bg-white"
                        >
                          <option value="Web Development (Frontend / Fullstack)">Web Development (Frontend / Fullstack)</option>
                          <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                          <option value="Graphic Design & Branding">Graphic Design & Branding</option>
                          <option value="Career & Soft Skills Mentorship">Career & Soft Skills Mentorship</option>
                          <option value="Operations, Logistics & Event Planning">Operations, Logistics & Event Planning</option>
                          <option value="Guest Masterclass Speaker">Guest Masterclass Speaker</option>
                          <option value="Other Skills">Other Skills</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Availability *</label>
                        <select 
                          value={formData.availability}
                          onChange={(e) => setFormData({...formData, availability: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm bg-white"
                        >
                          <option value="1-2 hours / week (Remote)">1-2 hours / week (Remote)</option>
                          <option value="2-4 hours / week (Weekend Workshop)">2-4 hours / week (Weekend Workshop)</option>
                          <option value="One-off Masterclass or Guest Lecture">One-off Masterclass or Guest Lecture</option>
                          <option value="Flexible / As Needed">Flexible / As Needed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">LinkedIn / GitHub / Portfolio URL</label>
                      <input 
                        type="url" 
                        value={formData.linkedin}
                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm" 
                        placeholder="https://linkedin.com/in/username" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Brief Note / Motivation (Optional)</label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm resize-none" 
                        placeholder="Tell us what excites you about mentoring or teaching with TechinEjigbo..." 
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold hover:bg-brand-orange-dark transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 shadow-md shadow-brand-orange/20 cursor-pointer text-base"
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
                      {!isSubmitting && <Send size={18} />}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Volunteer FAQs */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-orange mb-2 block">Common Questions</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-brand-dark mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {volunteerFaqs.map((faq, index) => {
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
    </div>
  );
}
