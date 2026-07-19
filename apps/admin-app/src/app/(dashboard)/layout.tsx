"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, HelpCircle, Menu, X, CheckSquare, FileText, Bell, HeartHandshake, MessageSquare, Image } from 'lucide-react';
import { logoutUser } from '@techinejigbo/firebase/src/auth';
import { useAdmin } from '../../components/AdminProvider';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAdmin();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
  };

  const navItems = [
    { name: 'Overview', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Trainees', href: '/trainees', icon: <Users size={20} /> },
    { name: 'Exams', href: '/exams', icon: <BookOpen size={20} /> },
    { name: 'Questions', href: '/questions', icon: <CheckSquare size={20} /> },
    { name: 'Materials', href: '/materials', icon: <FileText size={20} /> },
    { name: 'Announcements', href: '/announcements', icon: <Bell size={20} /> },
    { name: 'Volunteers', href: '/volunteers', icon: <HeartHandshake size={20} /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Gallery', href: '/gallery', icon: <Image size={20} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-orange text-white rounded-lg flex items-center justify-center font-bold text-sm">
              TE
            </div>
            <span className="font-display font-bold text-slate-900 tracking-tight">AdminApp</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-brand-orange-light/10 text-brand-orange' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-3 bg-slate-50 rounded-lg mb-2">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-500 font-mono uppercase">Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-900">
              <Menu size={24} />
            </button>
            <h1 className="font-display font-bold text-lg md:text-xl text-slate-900 capitalize tracking-tight">
              {pathname === '/' ? 'Overview' : pathname.replace('/', '')}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="mailto:support@techinejigbo.com" className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <HelpCircle size={20} />
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
