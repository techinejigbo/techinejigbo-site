"use client";

import React, { useState } from 'react';
import { loginUser } from '@techinejigbo/firebase/src/auth';
import { getTraineeData } from '@techinejigbo/firebase/src/firestore';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your credentials.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user } = await loginUser(email, password);
      const traineeData = await getTraineeData(user.uid);
      
      if (!traineeData) {
        setError("No trainee profile found. Please register first.");
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-brand-orange" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Student Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your learning hub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-mono font-bold uppercase tracking-wider py-3.5 px-6 rounded-lg text-xs transition-all flex items-center justify-center gap-2 mt-6 shadow-sm"
          >
            {loading ? 'Logging in...' : 'Enter Portal'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </form>

      </div>
    </div>
  );
}
