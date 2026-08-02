"use client";

import React, { useEffect, useState } from 'react';
import { getAllTrainees, getAllExams, getDonations, TraineeData, ExamRecord, DonationRecord } from '@techinejigbo/firebase/src/firestore';
import { Users, BookOpen, Award, TrendingUp, Settings, CheckSquare, Heart, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [fetchedTrainees, fetchedExams, fetchedDonations] = await Promise.all([
        getAllTrainees(),
        getAllExams(),
        getDonations()
      ]);
      setTrainees(fetchedTrainees);
      setExams(fetchedExams);
      setDonations(fetchedDonations);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeTrainees = trainees.filter(t => t.status !== 'suspended').length;
  const passedExams = exams.filter(e => e.score >= 70).length;
  const totalDonations = donations
    .filter(d => d.status === 'success')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">{trainees.length}</h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mt-1">Total Trainees</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">{activeTrainees}</h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mt-1">Active Accounts</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-orange-light/10 text-brand-orange flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">{exams.length}</h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mt-1">Exams Taken</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-brand-orange flex items-center justify-center shrink-0">
              <Heart size={20} className="fill-brand-orange/20" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">{formatCurrency(totalDonations)}</h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mt-1">Donations Raised</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Recent Registrations</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : trainees.slice(0, 5).map(trainee => (
              <div key={trainee.uid} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase overflow-hidden shrink-0">
                    {trainee.passportPhotoBase64 ? (
                      <img src={trainee.passportPhotoBase64} alt="" className="w-full h-full object-cover" />
                    ) : (
                      `${trainee.firstName[0]}${trainee.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{trainee.firstName} {trainee.lastName}</p>
                    <p className="text-xs text-slate-500">{trainee.program}</p>
                  </div>
                </div>
                <Link href="/trainees" className="text-brand-orange text-xs font-bold hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/donations" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-brand-orange-light/5 border border-slate-100 hover:border-brand-orange/20 rounded-xl transition-all group">
              <Heart size={24} className="text-slate-400 group-hover:text-brand-orange mb-3" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-orange">View Donations</span>
            </Link>
            <Link href="/trainees" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-brand-orange-light/5 border border-slate-100 hover:border-brand-orange/20 rounded-xl transition-all group">
              <Users size={24} className="text-slate-400 group-hover:text-brand-orange mb-3" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-orange">Manage Trainees</span>
            </Link>
            <Link href="/exams" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-brand-orange-light/5 border border-slate-100 hover:border-brand-orange/20 rounded-xl transition-all group">
              <BookOpen size={24} className="text-slate-400 group-hover:text-brand-orange mb-3" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-orange">Toggle Exams</span>
            </Link>
            <Link href="/questions" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-brand-orange-light/5 border border-slate-100 hover:border-brand-orange/20 rounded-xl transition-all group">
              <CheckSquare size={24} className="text-slate-400 group-hover:text-brand-orange mb-3" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-orange">Edit Questions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
