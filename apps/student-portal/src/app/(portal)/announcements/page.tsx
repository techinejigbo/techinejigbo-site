"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToAnnouncements, Announcement } from '@techinejigbo/firebase/src/firestore';
import { Megaphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-brand-orange hover:border-brand-orange transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-brand-orange" size={24} />
            All Announcements
          </h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with the latest news and information.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 text-center">
              <Megaphone size={48} className="text-slate-200 mb-4" />
              <p>No announcements have been posted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative pl-8">
                  {/* Left indicator line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-orange rounded-l-xl" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h3 className="font-bold text-slate-900 text-xl">{ann.title}</h3>
                    <span className="text-xs text-slate-400 font-mono bg-white px-3 py-1 rounded-full border border-slate-200 w-fit">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed text-base">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
