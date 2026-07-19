"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToVolunteers, VolunteerData } from '@techinejigbo/firebase/src/firestore';
import { HeartHandshake, Mail, ExternalLink } from 'lucide-react';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToVolunteers((data) => {
      setVolunteers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <HeartHandshake className="text-brand-orange" size={24} />
            Volunteer Applications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review submissions from individuals wanting to volunteer or mentor.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading volunteers...</div>
      ) : volunteers.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
          No volunteer applications have been submitted yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {volunteers.map((v) => (
            <div key={v.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {v.firstName} {v.lastName}
                  </h3>
                  <p className="text-sm font-semibold text-brand-orange mt-1">
                    {v.expertise}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(v.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <a 
                  href={`mailto:${v.email}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange transition-colors"
                >
                  <Mail size={16} /> {v.email}
                </a>
                
                {v.linkedin && (
                  <a 
                    href={v.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange transition-colors"
                  >
                    <ExternalLink size={16} /> {v.linkedin}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
