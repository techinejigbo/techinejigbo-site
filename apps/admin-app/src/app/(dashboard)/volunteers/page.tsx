"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToVolunteers, VolunteerData, updateVolunteerStatus } from '@techinejigbo/firebase/src/firestore';
import { HeartHandshake, Mail, ExternalLink, Clock, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'contacted':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200"><MessageCircle size={12}/> Contacted</span>;
    case 'accepted':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12}/> Accepted</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200"><XCircle size={12}/> Rejected</span>;
    case 'pending':
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12}/> Pending</span>;
  }
};

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

  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'contacted' | 'accepted' | 'rejected') => {
    try {
      await updateVolunteerStatus(id, newStatus);
      toast.success(`Application marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {volunteers.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-bold text-slate-900 text-lg truncate" title={`${v.firstName} ${v.lastName}`}>
                      {v.firstName} {v.lastName}
                    </h3>
                    <p className="text-sm font-semibold text-brand-orange mt-0.5 truncate" title={v.expertise}>
                      {v.expertise}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(v.status)}
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 font-mono mb-4">
                  Applied: {new Date(v.createdAt).toLocaleDateString()}
                </div>
                
                <div className="space-y-2.5">
                  <a 
                    href={`mailto:${v.email}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange transition-colors truncate"
                    title={v.email}
                  >
                    <Mail size={16} className="shrink-0 text-slate-400" /> 
                    <span className="truncate">{v.email}</span>
                  </a>
                  
                  {v.linkedin && (
                    <a 
                      href={v.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      title={v.linkedin}
                    >
                      <ExternalLink size={16} className="shrink-0 text-slate-400" /> 
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col gap-2">
                <a 
                  href={`mailto:${v.email}?subject=Volunteer Application - Techinejigbo`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Mail size={16} />
                  Send Email
                </a>
                
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button 
                    onClick={() => v.id && handleStatusUpdate(v.id, 'contacted')}
                    className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center"
                  >
                    Contacted
                  </button>
                  <button 
                    onClick={() => v.id && handleStatusUpdate(v.id, 'accepted')}
                    className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors flex items-center justify-center"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => v.id && handleStatusUpdate(v.id, 'rejected')}
                    className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
