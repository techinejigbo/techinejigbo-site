"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@techinejigbo/firebase/src/config';
import { checkIfAdmin } from '@techinejigbo/firebase/src/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AdminContextProps {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextProps>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const useAdmin = () => useContext(AdminContext);

export default function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Verify admin status
        const validAdmin = await checkIfAdmin(currentUser.uid);
        setIsAdmin(validAdmin);
        
        if (!validAdmin) {
          // If they are logged in but not an admin, boot them
          auth.signOut();
        } else if (pathname === '/login') {
          router.push('/');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
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

  // Prevent rendering protected routes if not an admin (except for the login page)
  if (!isAdmin && pathname !== '/login') {
    return null;
  }

  return (
    <AdminContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
}
