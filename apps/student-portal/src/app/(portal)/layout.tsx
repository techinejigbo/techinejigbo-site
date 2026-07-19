"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStudent } from '../../components/StudentProvider';
import { logoutUser } from '@techinejigbo/firebase/src/auth';
import { LayoutDashboard, BookOpen, PenTool, User as UserIcon, LogOut, Megaphone } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { trainee } = useStudent();

  const handleLogout = async () => {
    await logoutUser();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
    { name: 'Materials', href: '/materials', icon: BookOpen },
    { name: 'Assessments', href: '/exams', icon: PenTool },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-orange text-white rounded flex items-center justify-center font-bold text-lg">
              TE
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-900 tracking-tight leading-tight">TechinEjigbo</h1>
              <p className="text-[10px] uppercase font-mono font-bold text-brand-orange tracking-widest">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-brand-orange/10 text-brand-orange' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 capitalize">
              {pathname.replace('/', '') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{trainee?.firstName} {trainee?.lastName}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-mono">{trainee?.program}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100">
              {trainee?.passportPhotoBase64 ? (
                <img src={trainee.passportPhotoBase64} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
                  {trainee?.firstName?.[0]}{trainee?.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
