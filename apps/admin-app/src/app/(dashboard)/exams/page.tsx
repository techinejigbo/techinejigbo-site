"use client";

import React, { useEffect, useState } from 'react';
import { getAllExams, getAllTrainees, getGlobalSettings, updateGlobalSettings, ExamRecord, TraineeData, GlobalSettings } from '@techinejigbo/firebase/src/firestore';
import { Search, Lock, Unlock } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [trainees, setTrainees] = useState<Record<string, TraineeData>>({});
  const [settings, setSettings] = useState<GlobalSettings>({ isExamOpen: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const [fetchedExams, fetchedTrainees, fetchedSettings] = await Promise.all([
        getAllExams(),
        getAllTrainees(),
        getGlobalSettings()
      ]);
      setExams(fetchedExams);
      setSettings(fetchedSettings);
      
      const traineeMap: Record<string, TraineeData> = {};
      fetchedTrainees.forEach(t => traineeMap[t.uid] = t);
      setTrainees(traineeMap);
      
      setLoading(false);
    }
    loadData();
  }, []);

  const handleToggleExam = async () => {
    const newStatus = !settings.isExamOpen;
    const confirmMessage = newStatus 
      ? "Are you sure you want to OPEN the exam portal? All active trainees will be able to start their final exams."
      : "Are you sure you want to CLOSE the exam portal? Trainees currently taking the exam might be interrupted or unable to submit if you close it forcefully.";
      
    if (window.confirm(confirmMessage)) {
      try {
        await updateGlobalSettings({ isExamOpen: newStatus });
        setSettings(prev => ({ ...prev, isExamOpen: newStatus }));
      } catch (err) {
        alert("Failed to toggle exam portal.");
      }
    }
  };

  const filteredExams = exams.filter(e => {
    const trainee = trainees[e.traineeId];
    if (!trainee) return false;
    const nameMatch = `${trainee.firstName} ${trainee.lastName}`.toLowerCase().includes(search.toLowerCase());
    const courseMatch = e.examId.toLowerCase().includes(search.toLowerCase());
    return nameMatch || courseMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Global Exam Toggle Widget */}
      <div className={`p-6 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
        settings.isExamOpen ? 'bg-brand-orange-light/10 border-brand-orange/30' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            settings.isExamOpen ? 'bg-brand-orange text-white animate-pulse' : 'bg-slate-100 text-slate-500'
          }`}>
            {settings.isExamOpen ? <Unlock size={24} /> : <Lock size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Exam Portal is {settings.isExamOpen ? 'OPEN' : 'CLOSED'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {settings.isExamOpen 
                ? 'Trainees can currently access and submit their final certification exams.' 
                : 'Trainees cannot access the final exam right now.'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleToggleExam}
          className={`px-6 py-3 rounded-lg font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-sm ${
            settings.isExamOpen 
              ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50' 
              : 'bg-brand-orange text-white hover:bg-brand-orange-dark border border-brand-orange'
          }`}
        >
          {settings.isExamOpen ? 'Lock Portal' : 'Open Portal Now'}
        </button>
      </div>

      {/* Exam Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-display font-bold text-xl text-slate-900">Exam Results</h2>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange w-full sm:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-mono font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Trainee</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Completed At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading data...</td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No exam records found.</td>
                </tr>
              ) : (
                filteredExams.map(exam => {
                  const trainee = trainees[exam.traineeId];
                  const passed = exam.score >= 80;
                  
                  return (
                    <tr key={exam.id || `${exam.traineeId}_${exam.completedAt}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {trainee ? (
                          <div>
                            <p className="font-semibold text-slate-900">{trainee.firstName} {trainee.lastName}</p>
                            <p className="text-xs text-slate-500">{trainee.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unknown Trainee ({exam.traineeId})</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono uppercase font-bold rounded">
                          {exam.examId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(exam.completedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        <span className={`text-base ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {exam.score}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
