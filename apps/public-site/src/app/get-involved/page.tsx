"use client";

import React, { useState } from 'react';
import { Heart, Laptop, Users, Building2, Send, CheckCircle2 } from 'lucide-react';
import { saveVolunteer } from '@techinejigbo/firebase/src/firestore';

export default function GetInvolvedPage() {
  const [activeTab, setActiveTab] = useState<'sponsor' | 'volunteer'>('sponsor');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    expertise: 'Web Development',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await saveVolunteer({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', expertise: 'Web Development', linkedin: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-brand-dark text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange via-brand-dark to-brand-dark"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Heart size={48} className="mx-auto text-brand-orange mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6">Be the Catalyst</h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto text-balance">
            TechinEjigbo is entirely community-driven. Your support directly funds the training, equipment, and mentorship that transforms the lives of underprivileged students.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Action Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-slate-200/50 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('sponsor')}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'sponsor' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sponsor & Donate
              </button>
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'volunteer' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Volunteer
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {activeTab === 'sponsor' ? (
              <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="bg-orange-50 p-4 rounded-full w-fit mb-6 text-brand-orange"><Users size={32}/></div>
                  <h3 className="text-2xl font-bold font-display text-brand-dark mb-3">Sponsor a Student</h3>
                  <p className="text-slate-600 mb-6 flex-grow">Cover the complete training, mentorship, and certification costs for one student entering Cohort 2.</p>
                  <button className="w-full bg-brand-orange text-white py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors">
                    Donate Now
                  </button>
                </div>
                
                <div className="bg-brand-dark text-white p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden md:-mt-4 md:mb-4">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Laptop size={100}/></div>
                  <div className="bg-white/10 p-4 rounded-full w-fit mb-6 text-brand-orange backdrop-blur-sm relative z-10"><Laptop size={32}/></div>
                  <h3 className="text-2xl font-bold font-display mb-3 relative z-10">Donate Equipment</h3>
                  <p className="text-slate-300 mb-6 flex-grow relative z-10">The biggest hurdle for our students is access to devices. Donate fairly used laptops, internet routers, or design tablets.</p>
                  <button className="w-full bg-white text-brand-dark py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors relative z-10">
                    Contact to Donate
                  </button>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="bg-orange-50 p-4 rounded-full w-fit mb-6 text-brand-orange"><Building2 size={32}/></div>
                  <h3 className="text-2xl font-bold font-display text-brand-dark mb-3">Corporate Partner</h3>
                  <p className="text-slate-600 mb-6 flex-grow">Fund an entire cohort, provide a training facility, or partner your organization with our mission for widespread impact.</p>
                  <button className="w-full border-2 border-brand-orange text-brand-orange py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
                    View Partnership Deck
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2">
                  <div className="p-10 lg:p-14 bg-brand-dark text-white relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-bold font-display mb-6">Join Our Faculty</h3>
                      <p className="text-slate-300 mb-8 leading-relaxed">
                        We are looking for passionate professionals to help guide the next generation. Whether you can spare a few hours for a guest lecture, or commit to regular mentoring, we need you.
                      </p>
                      <ul className="space-y-4 mb-8 text-slate-300">
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                          Web Development Instructors
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                          Graphic Design Instructors
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                          Career & Soft Skills Mentors
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                          Operations & Logistics Volunteers
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-10 lg:p-14">
                    <h3 className="text-2xl font-bold font-display text-brand-dark mb-6">Volunteer Application</h3>
                    {isSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                        <h4 className="text-xl font-bold mb-2">Application Received!</h4>
                        <p className="text-emerald-700">Thank you for volunteering. We will review your application and get back to you shortly.</p>
                        <button 
                          onClick={() => setIsSubmitted(false)}
                          className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline"
                        >
                          Submit another application
                        </button>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input 
                              type="text" 
                              required
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
                              placeholder="John" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input 
                              type="text" 
                              required
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
                              placeholder="Doe" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
                            placeholder="john@example.com" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Area of Expertise</label>
                          <select 
                            value={formData.expertise}
                            onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-white"
                          >
                            <option value="Web Development">Web Development</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="Mentorship / Career">Mentorship / Career</option>
                            <option value="Operations / Other">Operations / Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn / Portfolio URL</label>
                          <input 
                            type="url" 
                            value={formData.linkedin}
                            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
                            placeholder="https://" 
                          />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-brand-orange text-white py-4 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-70"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                          {!isSubmitting && <Send size={18} />}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
