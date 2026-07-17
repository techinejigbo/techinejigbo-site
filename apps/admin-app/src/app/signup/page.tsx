"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@techinejigbo/firebase/src/config';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@techinejigbo/firebase/src/config';
import { checkInviteStatus } from '@techinejigbo/firebase/src/firestore';
import { ShieldCheck, UserPlus, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SignupForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email');

  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Verify they are invited FIRST
      const isInvited = await checkInviteStatus(email.toLowerCase().trim());
      if (!isInvited) {
        throw new Error("This email has not been invited to join the admin team. Please contact the Super Admin.");
      }

      // 2. Create the Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Create the Admin Document
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      });

      // 4. Redirect to Dashboard
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-orange-light rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-brand-dark rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-brand-orange" size={28} />
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Admin Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Create a password for your invited email account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-white">
          <form className="space-y-6" onSubmit={handleSignup}>
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-rose-700 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700">Invited Email Address</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  readOnly={!!defaultEmail}
                  value={email}
                  onChange={(e) => !defaultEmail && setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all shadow-sm ${defaultEmail ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
                  placeholder="admin@techinejigbo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Create Password</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all shadow-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-orange/20 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : (
                  <>Create Account <UserPlus size={18} /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Already have an account? Log in here <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
