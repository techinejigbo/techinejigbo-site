/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, BookOpen, ChevronRight, GraduationCap, Layout, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react';
import { StudentInfo } from '../types';

interface RegistrationFormProps {
  onRegister: (info: StudentInfo) => void;
}

export default function RegistrationForm({ onRegister }: RegistrationFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState<'canva' | 'html'>('canva');
  const [studentId, setStudentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!fullName.trim()) tempErrors.fullName = "Full name is required";
    else if (fullName.trim().length < 3) tempErrors.fullName = "Please enter your real full name";

    if (!email.trim()) tempErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = "Please enter a valid email address";

    if (!phone.trim()) tempErrors.phone = "Phone number is required";
    else if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      tempErrors.phone = "Please enter a valid phone number";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        course,
        studentId: studentId.trim() || undefined
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Intro Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-md text-xs font-semibold mb-4 font-mono uppercase tracking-wider">
          <GraduationCap size={14} className="animate-bounce text-orange-600" />
          Empowering the Next Generation of Tech Talents
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight mb-4">
          TechinEjigbo <span className="text-orange-600">Examination Portal</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
          Welcome to the official assessment site. Verify your skills, earn your certification, and showcase your achievements in web development and graphic design.
        </p>
      </motion.div>

      {/* Grid: Instructions + Registration Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Exam Instructions & Information */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 space-y-6"
        >
          <div className="bg-white border border-slate-200 rounded-lg p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-full blur-2xl" />
            
            <h3 className="text-base font-display font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wide">
              <BookOpen size={18} className="text-orange-600" />
              Guidelines
            </h3>
            
            <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <div className="bg-orange-50 border border-orange-100 text-orange-600 p-1.5 rounded shrink-0">
                  <Award size={14} />
                </div>
                <div>
                  <strong className="text-slate-800 block text-xs font-mono uppercase tracking-wide">Passing Criteria</strong>
                  Score <strong className="text-orange-600">80% or higher</strong> (at least 40 out of 50 correct answers) to pass and qualify for certification.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-50 border border-orange-100 text-orange-600 p-1.5 rounded shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <strong className="text-slate-800 block text-xs font-mono uppercase tracking-wide">Assessment Format</strong>
                  Consists of <strong className="text-slate-800">50 randomized multiple-choice questions</strong> testing core conceptual and practical aspects.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-50 border border-orange-100 text-orange-600 p-1.5 rounded shrink-0">
                  <Sparkles size={14} />
                </div>
                <div>
                  <strong className="text-slate-800 block text-xs font-mono uppercase tracking-wide">Dynamic Certificate</strong>
                  Upon passing, download or print your customized, authentic <strong className="text-slate-800 font-bold">TechinEjigbo Completion Certificate</strong> immediately.
                </div>
              </li>
            </ul>
          </div>

          {/* Banner of active courses */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-slate-50 p-3 rounded border border-slate-100 shrink-0">
              <Layout size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Active Tracks</p>
              <h4 className="text-xs font-semibold text-slate-700 font-sans mt-0.5">Graphic Design (Canva) & Web Development (HTML)</h4>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-7"
        >
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-wide">Student Onboarding</h2>
              <p className="text-xs text-slate-400 mt-1">Please enter your verified training details to load your assessment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Full Name <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User size={16} />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full bg-slate-50 border ${
                      errors.fullName ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-orange-600 focus:ring-orange-600/10'
                    } text-slate-900 pl-10 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 focus:bg-white`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-mono font-bold">
                    <span>•</span> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Email Address <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="e.g. name@domain.com"
                      className={`w-full bg-slate-50 border ${
                        errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-orange-600 focus:ring-orange-600/10'
                      } text-slate-900 pl-10 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 focus:bg-white`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-mono font-bold">
                      <span>•</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Phone Number <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <Phone size={16} />
                    </span>
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="e.g. 08123456789"
                      className={`w-full bg-slate-50 border ${
                        errors.phone ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-orange-600 focus:ring-orange-600/10'
                      } text-slate-900 pl-10 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 focus:bg-white`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-mono font-bold">
                      <span>•</span> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Student ID / Roll Number (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="studentId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Student ID / Roll Number <span className="text-slate-400 text-[10px] lowercase italic font-normal">(optional)</span>
                </label>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. TE-2026-042"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded text-sm focus:border-orange-600 focus:ring-orange-600/10 focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 focus:bg-white"
                />
              </div>

              {/* Course Selection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Select Your Trained Course <span className="text-orange-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Canva Track */}
                  <div
                    onClick={() => setCourse('canva')}
                    className={`relative p-4 rounded border flex flex-col gap-1 cursor-pointer transition-all ${
                      course === 'canva'
                        ? 'bg-orange-50/50 border-orange-600 ring-1 ring-orange-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-800 uppercase tracking-wide">Canva Track</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        course === 'canva' ? 'border-orange-600 bg-orange-600' : 'border-slate-300 bg-white'
                      }`}>
                        {course === 'canva' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 leading-snug">
                      Graphic Design, layouts, templates, typography rules, branding elements, and assets.
                    </span>
                  </div>

                  {/* HTML Track */}
                  <div
                    onClick={() => setCourse('html')}
                    className={`relative p-4 rounded border flex flex-col gap-1 cursor-pointer transition-all ${
                      course === 'html'
                        ? 'bg-orange-50/50 border-orange-600 ring-1 ring-orange-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-800 uppercase tracking-wide">HTML Track</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        course === 'html' ? 'border-orange-600 bg-orange-600' : 'border-slate-300 bg-white'
                      }`}>
                        {course === 'html' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 leading-snug">
                      Web structure, tags, attributes, lists, tables, inputs, forms, and semantic elements.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold uppercase tracking-wider py-3.5 px-6 rounded text-xs transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer group shadow-sm"
              >
                Assemble & Start Examination
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
