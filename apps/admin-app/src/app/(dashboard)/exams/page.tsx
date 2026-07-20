"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToExams, subscribeToTrainees, getGlobalSettings, subscribeToGlobalSettings, updateGlobalSettings, ExamRecord, TraineeData, GlobalSettings, getAllCoursesFromQuestions } from '@techinejigbo/firebase/src/firestore';
import { Search, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 20;

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [trainees, setTrainees] = useState<Record<string, TraineeData>>({});
  const [settings, setSettings] = useState<GlobalSettings>({ isExamOpen: false, openPrograms: {} });
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let examsLoaded = false;
    let traineesLoaded = false;
    
    async function init() {
      const fetchedCourses = await getAllCoursesFromQuestions();
      setCourses(fetchedCourses);
    }
    
    init();

    const unsubSettings = subscribeToGlobalSettings((fetchedSettings) => {
      setSettings({
        isExamOpen: fetchedSettings?.isExamOpen ?? false,
        openPrograms: fetchedSettings?.openPrograms ?? {}
      });
    });

    const unsubExams = subscribeToExams((fetchedExams) => {
      setExams(fetchedExams);
      examsLoaded = true;
      if (traineesLoaded) setLoading(false);
    });

    const unsubTrainees = subscribeToTrainees((fetchedTrainees) => {
      const traineeMap: Record<string, TraineeData> = {};
      fetchedTrainees.forEach(t => traineeMap[t.uid] = t);
      setTrainees(traineeMap);
      traineesLoaded = true;
      if (examsLoaded) setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubExams();
      unsubTrainees();
    };
  }, []);

  const handleToggleExam = async (courseId: string) => {
    const isCurrentlyOpen = settings.openPrograms?.[courseId] || false;
    const newStatus = !isCurrentlyOpen;
    const confirmMessage = newStatus 
      ? `Are you sure you want to OPEN the exam portal for ${courseId}?`
      : `Are you sure you want to CLOSE the exam portal for ${courseId}?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        const newOpenPrograms = { ...settings.openPrograms, [courseId]: newStatus };
        await updateGlobalSettings({ openPrograms: newOpenPrograms });
        setSettings(prev => ({ ...prev, openPrograms: newOpenPrograms }));
        toast.success(`Exam portal for ${courseId} is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
      } catch (err) {
        toast.error("Failed to toggle exam portal.");
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

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(course => {
          const isOpen = settings.openPrograms?.[course] || false;
          return (
            <div key={course} className={`p-6 rounded-xl shadow-sm border flex flex-col items-start justify-between gap-4 transition-colors ${
              isOpen ? 'bg-brand-orange-light/10 border-brand-orange/30' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-4 w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  isOpen ? 'bg-brand-orange text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isOpen ? <Unlock size={24} /> : <Lock size={24} />}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-display font-bold text-slate-900 capitalize">
                    {course.replace('-', ' ')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {isOpen ? 'Portal OPEN' : 'Portal CLOSED'}
                  </p>
                </div>
                <button 
                  onClick={() => handleToggleExam(course)}
                  className={`px-4 py-2 rounded-lg font-bold font-mono uppercase tracking-wider text-xs transition-all shadow-sm ${
                    isOpen 
                      ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50' 
                      : 'bg-brand-orange text-white hover:bg-brand-orange-dark border border-brand-orange'
                  }`}
                >
                  {isOpen ? 'Lock' : 'Open'}
                </button>
              </div>
            </div>
          );
        })}
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
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
              ) : paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No exam records found.</td>
                </tr>
              ) : (
                paginatedExams.map(exam => {
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
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)} of {filteredExams.length} results
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
