"use client";

import React, { useEffect, useState } from 'react';
import { 
  subscribeToExams, 
  subscribeToTrainees, 
  subscribeToGlobalSettings, 
  updateGlobalSettings, 
  updateExamScore,
  deleteExamRecord,
  saveCertificate,
  ExamRecord, 
  TraineeData, 
  GlobalSettings, 
  getAllCoursesFromQuestions 
} from '@techinejigbo/firebase/src/firestore';
import { 
  Search, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  RotateCcw, 
  X, 
  Check, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Award,
  Calculator
} from 'lucide-react';
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

  // Edit Score Modal state
  const [editingExam, setEditingExam] = useState<ExamRecord | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<number>(0);
  const [newCorrectInput, setNewCorrectInput] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

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
        const isExamOpen = Object.values(newOpenPrograms).some(isOpen => isOpen);
        
        await updateGlobalSettings({ openPrograms: newOpenPrograms, isExamOpen });
        setSettings(prev => ({ ...prev, openPrograms: newOpenPrograms, isExamOpen }));
        toast.success(`Exam portal for ${courseId} is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
      } catch (err) {
        toast.error("Failed to toggle exam portal.");
      }
    }
  };

  // Open Edit Score Modal
  const openEditModal = (exam: ExamRecord) => {
    setEditingExam(exam);
    const totalQ = exam.totalQuestions || 50;
    const initialCorrect = exam.correctCount !== undefined 
      ? exam.correctCount 
      : Math.round((exam.score / 100) * totalQ);
    setNewCorrectInput(initialCorrect);
    setNewScoreInput(exam.score);
  };

  // Synchronized inputs in modal
  const handleCorrectChange = (val: number) => {
    const totalQ = editingExam?.totalQuestions || 50;
    const clampedCorrect = Math.max(0, Math.min(totalQ, val));
    setNewCorrectInput(clampedCorrect);
    const calculatedPct = Math.round((clampedCorrect / totalQ) * 100);
    setNewScoreInput(calculatedPct);
  };

  const handlePercentageChange = (val: number) => {
    const totalQ = editingExam?.totalQuestions || 50;
    const clampedPct = Math.max(0, Math.min(100, val));
    setNewScoreInput(clampedPct);
    const calculatedCorrect = Math.round((clampedPct / 100) * totalQ);
    setNewCorrectInput(calculatedCorrect);
  };

  // Save Updated Score
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    if (newScoreInput < 0 || newScoreInput > 100) {
      toast.error("Score must be between 0% and 100%");
      return;
    }

    setIsUpdating(true);
    try {
      const docId = editingExam.id || `${editingExam.traineeId}_${editingExam.examId}`;
      const totalQ = editingExam.totalQuestions || 50;
      
      await updateExamScore(docId, {
        score: newScoreInput,
        correctCount: newCorrectInput
      });

      // If passing score (>=50%), automatically generate / update certificate record
      if (newScoreInput >= 50) {
        const trainee = trainees[editingExam.traineeId];
        const studentName = trainee ? `${trainee.firstName} ${trainee.lastName}` : 'Candidate';
        const cleanName = studentName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'CAN';
        const courseCode = editingExam.examId.toLowerCase().includes('graphic') ? 'GD' : 'WD';
        const certificateId = `TE-${courseCode}-2026-${cleanName}-${Date.now().toString().slice(-4)}`;

        await saveCertificate({
          id: `${editingExam.traineeId}_${editingExam.examId}`,
          traineeId: editingExam.traineeId,
          examId: editingExam.examId,
          course: editingExam.examId,
          score: newScoreInput,
          correctCount: newCorrectInput,
          totalQuestions: totalQ,
          elapsedSeconds: editingExam.timeSpentSeconds || 0,
          issueDate: new Date().toISOString(),
          status: 'approved',
          certificateId
        });
      }

      toast.success(`Score updated to ${newScoreInput}% (${newCorrectInput}/${totalQ} correct) successfully!`);
      setEditingExam(null);
    } catch (err) {
      console.error("Error updating exam score:", err);
      toast.error("Failed to update score. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset / Allow Retake
  const handleResetAttempt = async (exam: ExamRecord) => {
    const trainee = trainees[exam.traineeId];
    const candidateName = trainee ? `${trainee.firstName} ${trainee.lastName}` : exam.traineeId;
    
    if (window.confirm(`Are you sure you want to RESET the assessment for ${candidateName}?\n\nThis will delete their current attempt and allow them to take the exam again immediately.`)) {
      try {
        const docId = exam.id || `${exam.traineeId}_${exam.examId}`;
        await deleteExamRecord(docId);
        toast.success(`Exam attempt reset for ${candidateName}. Candidate can now retake.`);
      } catch (err) {
        console.error("Error resetting exam attempt:", err);
        toast.error("Failed to reset exam attempt.");
      }
    }
  };

  const filteredExams = exams.filter(e => {
    const trainee = trainees[e.traineeId];
    const name = trainee ? `${trainee.firstName} ${trainee.lastName}`.toLowerCase() : '';
    const email = trainee?.email?.toLowerCase() || '';
    const searchLower = search.toLowerCase();
    const courseMatch = e.examId.toLowerCase().includes(searchLower);
    return name.includes(searchLower) || email.includes(searchLower) || courseMatch;
  });

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      
      {/* Portal Toggle Cards */}
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
                  {isOpen ? 'Lock Portal' : 'Open Portal'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exam Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">Exam Results & Marking Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">View student submissions, auto-calculated correct scores, or reset attempts for retakes.</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or program..."
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
                <th className="px-6 py-4">Submitted At / Audit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Score / Correct</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading data...</td>
                </tr>
              ) : paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No exam records found.</td>
                </tr>
              ) : (
                paginatedExams.map(exam => {
                  const trainee = trainees[exam.traineeId];
                  const passed = exam.score >= 50;
                  const docId = exam.id || `${exam.traineeId}_${exam.examId}`;
                  
                  return (
                    <tr key={docId} className="hover:bg-slate-50/50 transition-colors">
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
                        <div>{new Date(exam.completedAt).toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {exam.timeSpentSeconds !== undefined && exam.timeSpentSeconds > 0 && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock size={10} /> {Math.floor(exam.timeSpentSeconds / 60)}m {exam.timeSpentSeconds % 60}s
                            </span>
                          )}
                          {exam.violationsCount !== undefined && exam.violationsCount > 0 && (
                            <span className="bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
                              <AlertTriangle size={9} /> {exam.violationsCount} strikes
                            </span>
                          )}
                          {exam.autoSubmitted && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              Auto-Submitted
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <div className={`text-base font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {exam.score}%
                        </div>
                        {exam.correctCount !== undefined && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            {exam.correctCount} / {exam.totalQuestions || 50} correct
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(exam)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-brand-orange transition-colors"
                            title="Calculate & Update Score"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleResetAttempt(exam)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Reset Exam Attempt (Allow Retake)"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
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

      {/* Edit Score Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-lg">
                <Calculator size={20} className="text-brand-orange" />
                <span>Calculate & Update Student Score</span>
              </div>
              <button 
                onClick={() => setEditingExam(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <div className="text-slate-500 font-mono">
                  Candidate: <strong className="text-slate-800">{trainees[editingExam.traineeId]?.firstName} {trainees[editingExam.traineeId]?.lastName}</strong>
                </div>
                <div className="text-slate-500 font-mono">
                  Program: <strong className="text-slate-800 capitalize">{editingExam.examId.replace('-', ' ')}</strong>
                </div>
                <div className="text-slate-500 font-mono">
                  Total Exam Questions: <strong className="text-slate-800">{editingExam.totalQuestions || 50} questions</strong>
                </div>
                <div className="text-slate-500 font-mono">
                  Current Score: <strong className={editingExam.score >= 50 ? 'text-emerald-600' : 'text-rose-600'}>{editingExam.score}%</strong>
                </div>
              </div>

              {/* Number of correct questions input */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Correct Questions Answered (Out of {editingExam.totalQuestions || 50})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={editingExam.totalQuestions || 50}
                    required
                    value={newCorrectInput}
                    onChange={(e) => handleCorrectChange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-bold focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-semibold text-xs text-slate-400">
                    / {editingExam.totalQuestions || 50}
                  </span>
                </div>
              </div>

              {/* Percentage score input */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Calculated Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={newScoreInput}
                    onChange={(e) => handlePercentageChange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-bold focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  50% or above qualifies candidate for an automated certificate.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-mono text-xs font-bold uppercase transition-all shadow-md shadow-brand-orange/20 flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Calculated Score</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
