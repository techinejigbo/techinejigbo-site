"use client";

import React from 'react';
import { Mail, MapPin, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
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
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Twitter / X</h4>
                    <a href="https://x.com/TechinEjigbo" target="_blank" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors">
                      @TechinEjigbo
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" placeholder="How can we help?" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white resize-none" placeholder="Write your message here..."></textarea>
                </div>

                <button type="button" className="bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold hover:bg-black transition-colors flex items-center gap-2 group">
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-500 mt-2">This form is currently a placeholder for the MVP.</p>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
