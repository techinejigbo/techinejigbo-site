"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@techinejigbo/firebase/src/config';
import { getTraineeData, TraineeData } from '@techinejigbo/firebase/src/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface StudentContextProps {
  user: User | null;
  trainee: TraineeData | null;
  loading: boolean;
}

const StudentContext = createContext<StudentContextProps>({
  user: null,
  trainee: null,
  loading: true,
});

export const useStudent = () => useContext(StudentContext);

export default function StudentProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trainee, setTrainee] = useState<TraineeData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Verify trainee status
        const traineeProfile = await getTraineeData(currentUser.uid);
        
        if (!traineeProfile) {
          // If they are logged in but not a trainee, boot them
          auth.signOut();
        } else {
          setTrainee(traineeProfile);
          if (pathname === '/login') {
            router.push('/');
          }
        }
      } else {
        setUser(null);
        setTrainee(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  // Prevent rendering protected routes if not a trainee (except for the login page)
  if (!trainee && pathname !== '/login') {
    return null;
  }

  if (trainee?.status === 'suspended' && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-rose-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Your trainee account has been suspended by the administrators. You cannot access the student portal or take exams at this time. Please contact support for more information.
          </p>
          <button 
            onClick={() => auth.signOut()} 
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudentContext.Provider value={{ user, trainee, loading }}>
      {children}
    </StudentContext.Provider>
  );
}
