"use client";

import React from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { User as UserIcon, Phone, Mail, MapPin, Award, Download } from 'lucide-react';

export default function ProfilePage() {
  const { trainee } = useStudent();

  if (!trainee) return null;

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-brand-orange-light/20 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-xl bg-slate-200 border-4 border-white shadow-md overflow-hidden relative z-10 shrink-0">
              {trainee.passportPhotoBase64 ? (
                <img src={trainee.passportPhotoBase64} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl uppercase font-bold bg-slate-100">
                  {trainee.firstName[0]}{trainee.lastName[0]}
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-display font-bold text-slate-900">{trainee.firstName} {trainee.lastName}</h1>
              <p className="text-sm font-mono text-slate-500 uppercase tracking-wider mt-1">TechinEjigbo Trainee</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Contact Details</h3>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm">{trainee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} className="text-slate-400" />
                <span className="text-sm">{trainee.phone}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Academic Details</h3>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-sm">{trainee.school}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <UserIcon size={16} className="text-slate-400" />
                <span className="text-sm">Class: {trainee.traineeClass}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Wallet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-orange-light/20 text-brand-orange rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Certificate Wallet</h2>
            <p className="text-sm text-slate-500">View and download your official certifications.</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
          <Award size={48} className="mx-auto text-slate-300 mb-4" />
          <p>No certificates available yet.</p>
          <p className="text-xs mt-2">Certificates are automatically generated upon passing the Final Exam with an 80% or higher.</p>
        </div>
      </div>

    </div>
  );
}
