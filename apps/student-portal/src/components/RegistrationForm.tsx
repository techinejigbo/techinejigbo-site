/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, GraduationCap, Layout, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { StudentInfo } from '../types';
import { loginUser } from '@techinejigbo/firebase/src/auth';
import { getTraineeData } from '@techinejigbo/firebase/src/firestore';

interface RegistrationFormProps {
  onRegister: (info: StudentInfo) => void;
}

export default function RegistrationForm({ onRegister }: RegistrationFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { user } = await loginUser(email, password);
      const traineeData = await getTraineeData(user.uid);
      
      if (!traineeData) {
        setError("Account verified, but trainee profile not found.");
        setLoading(false);
        return;
      }

      onRegister({
        uid: user.uid,
        fullName: `${traineeData.firstName} ${traineeData.lastName}`,
        email: traineeData.email,
        phone: traineeData.phone,
        school: traineeData.school,
        course: traineeData.program as 'web-development' | 'graphic-design',
      });
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16">
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
          Log in with your registration credentials to access your assessment.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 space-y-6"
        >
          <div className="bg-white border border-slate-200 rounded-lg p-6 relative overflow-hidden shadow-sm">
            <h3 className="text-base font-display font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wide">
              <BookOpen size={18} className="text-orange-600" />
              Guidelines
            </h3>
            
            <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
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
                  Upon passing, download or print your customized, authentic completion certificate immediately.
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-7"
        >
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-wide">Student Login</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your registered email and password.</p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-md text-sm border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded text-sm focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded text-sm focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-mono font-bold uppercase tracking-wider py-3.5 px-6 rounded text-xs transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
              >
                {loading ? 'Verifying...' : 'Log In & Start Exam'}
                <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
