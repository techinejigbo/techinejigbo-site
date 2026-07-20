"use client";

import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { saveContactMessage } from '@techinejigbo/firebase/src/firestore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await saveContactMessage({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-brand-dark text-white py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold font-display mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Whether you want to partner with us, ask a question about our cohorts, or just say hello, we’d love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 -mt-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Contact Info (Left Sidebar) */}
            <div className="md:col-span-2 bg-brand-orange text-white p-10 lg:p-14 relative overflow-hidden">
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-3xl font-bold font-display mb-8 relative z-10">Contact Information</h3>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-full shrink-0">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Email Us</h4>
                    <a href="mailto:techinejigbo@gmail.com" className="text-orange-100 hover:text-white transition-colors">
                      techinejigbo@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-full shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">X</h4>
                    <a href="https://x.com/TechinEjigbo" target="_blank" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors">
                      @TechinEjigbo
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-full shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Facebook</h4>
                    <a href="https://facebook.com/Tech-In-Ejigbo-61567228547648" target="_blank" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors">
                      TechInEjigbo
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-full shrink-0">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Location</h4>
                    <p className="text-orange-100 leading-relaxed">
                      Ejigbo, Lagos State<br />
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Area) */}
            <div className="md:col-span-3 p-10 lg:p-14">
              <h3 className="text-2xl font-bold font-display text-brand-dark mb-6">Send us a message</h3>
              
              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-emerald-700">Thank you for reaching out. We will get back to you shortly.</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" 
                      placeholder="How can we help?" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea 
                      rows={5} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white resize-none" 
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold hover:bg-black transition-colors flex items-center gap-2 group disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
