"use client";

import React, { useEffect, useState } from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { getAnnouncements, Announcement } from '@techinejigbo/firebase/src/firestore';
import { Megaphone, ArrowRight, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { trainee } = useStudent();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Simple greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-brand-orange text-white p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">
            {greeting}, {trainee?.firstName}!
          </h1>
          <p className="text-orange-50 max-w-lg text-balance">
            Welcome back to your learning hub. You are enrolled in the <strong>{trainee?.program === 'web-development' ? 'Web Development' : 'Graphic Design'}</strong> program.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Actions / Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Learning Materials</h3>
            <p className="text-sm text-slate-500 mb-4">Access your videos and PDF resources for your current module.</p>
            <Link href="/materials" className="text-sm font-bold text-brand-orange hover:text-brand-orange-dark flex items-center gap-1 transition-colors">
              Go to materials <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Assessments</h3>
            <p className="text-sm text-slate-500 mb-4">Check if there are any active exams you need to complete.</p>
            <Link href="/exams" className="text-sm font-bold text-brand-orange hover:text-brand-orange-dark flex items-center gap-1 transition-colors">
              View exams <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Megaphone size={20} />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900">Latest Announcements</h2>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
              {loading ? (
                <div className="text-center py-10 text-slate-400">Loading announcements...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No new announcements at this time.</div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative pl-6">
                      {/* Left indicator line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange rounded-l-xl" />
                      
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{ann.title}</h3>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
