"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToTrainees, subscribeToExams, updateTraineeStatus, deleteTrainee, TraineeData, ExamRecord } from '@techinejigbo/firebase/src/firestore';
import { Search, MoreVertical, ShieldAlert, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 20;

export default function TraineesPage() {
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let traineesLoaded = false;
    let examsLoaded = false;
    
    const unsubscribeTrainees = subscribeToTrainees((data) => {
      setTrainees(data);
      traineesLoaded = true;
      if (examsLoaded) setLoading(false);
    });

    const unsubscribeExams = subscribeToExams((data) => {
      setExams(data);
      examsLoaded = true;
      if (traineesLoaded) setLoading(false);
    });

    return () => {
      unsubscribeTrainees();
      unsubscribeExams();
    };
  }, []);

  const handleApproveAccount = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    if (window.confirm(`Are you sure you want to approve ${trainee.firstName}'s registration?`)) {
      try {
        await updateTraineeStatus(trainee.uid, 'active');
        setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: 'active' } : t));
        toast.success("Account approved successfully.");
      } catch (err) {
        toast.error("Failed to approve account.");
      }
    }
  };

  const handleStatusToggle = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    const newStatus = trainee.status === 'suspended' ? 'active' : 'suspended';
    const confirmMessage = newStatus === 'suspended' 
      ? `Are you sure you want to suspend ${trainee.firstName}? They will be completely locked out of the Student Portal.`
      : `Are you sure you want to reactivate ${trainee.firstName}'s account?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        await updateTraineeStatus(trainee.uid, newStatus);
        setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: newStatus } : t));
        toast.success(`Account ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} successfully.`);
      } catch (err) {
        toast.error("Failed to update status.");
      }
    }
  };

  const handleDelete = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    if (window.confirm(`CRITICAL WARNING: Are you absolutely sure you want to permanently delete ${trainee.firstName} ${trainee.lastName}? This action cannot be undone.`)) {
      try {
        await deleteTrainee(trainee.uid);
        setTrainees(prev => prev.filter(t => t.uid !== trainee.uid));
        toast.success("Trainee deleted permanently.");
      } catch (err) {
        toast.error("Failed to delete trainee.");
      }
    }
  };

  const filteredTrainees = trainees.filter(t => 
    t.firstName.toLowerCase().includes(search.toLowerCase()) || 
    t.lastName.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainees.length / ITEMS_PER_PAGE);
  const paginatedTrainees = filteredTrainees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-display font-bold text-xl text-slate-900">Trainee Directory</h2>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search trainees..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-mono font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Trainee</th>
                <th className="px-6 py-4">School / Class</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exam Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Loading data...
                  </td>
                </tr>
              ) : paginatedTrainees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No trainees found.
                  </td>
                </tr>
              ) : (
                paginatedTrainees.map(trainee => {
                  const traineeExams = exams.filter(e => e.traineeId === trainee.uid);
                  const bestExam = traineeExams.sort((a, b) => b.score - a.score)[0];
                  const isSuspended = trainee.status === 'suspended';

                  return (
                    <tr key={trainee.uid} className={`transition-colors ${isSuspended ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden shrink-0">
                            {trainee.passportPhotoBase64 ? (
                              <img src={trainee.passportPhotoBase64} alt={trainee.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 uppercase font-bold text-xs">
                                {trainee.firstName[0]}{trainee.lastName[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold ${isSuspended ? 'text-rose-900' : 'text-slate-900'}`}>
                              {trainee.firstName} {trainee.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{trainee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{trainee.school}</p>
                        <p className="text-xs text-slate-500">{trainee.traineeClass}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 capitalize">
                          {trainee.program ? trainee.program.replace(/-/g, ' ') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {trainee.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        {bestExam ? (
                          <span className={bestExam.score >= 70 ? "text-emerald-600" : "text-rose-600"}>
                            {bestExam.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === trainee.uid ? null : trainee.uid)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === trainee.uid && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-6 top-10 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
                              <div className="p-1">
                                {trainee.status === 'pending' && (
                                  <button
                                    onClick={() => handleApproveAccount(trainee)}
                                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 size={16} />
                                    Approve Account
                                  </button>
                                )}
                                {trainee.status !== 'pending' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        setActiveDropdown(null);
                                        if (window.confirm(`Are you sure you want to mark ${trainee.firstName}'s account as pending?`)) {
                                          try {
                                            await updateTraineeStatus(trainee.uid, 'pending');
                                            setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: 'pending' } : t));
                                            toast.success("Account marked as pending.");
                                          } catch (err) {
                                            toast.error("Failed to update status.");
                                          }
                                        }
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors text-amber-700 hover:bg-amber-50"
                                    >
                                      <ShieldAlert size={16} />
                                      Mark as Pending
                                    </button>
                                    <button
                                      onClick={() => handleStatusToggle(trainee)}
                                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors ${
                                        isSuspended 
                                          ? 'text-emerald-700 hover:bg-emerald-50' 
                                          : 'text-amber-700 hover:bg-amber-50'
                                      }`}
                                    >
                                      {isSuspended ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                                      {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                    </button>
                                  </>
                                )}
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => handleDelete(trainee)}
                                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 rounded-md transition-colors font-semibold"
                                >
                                  <Trash2 size={16} />
                                  Delete Permanently
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTrainees.length)} of {filteredTrainees.length} trainees
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
