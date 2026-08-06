"use client";

import React, { useEffect, useState } from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { 
  getGlobalSettings, 
  subscribeToGlobalSettings, 
  saveExamScore, 
  saveCertificate,
  subscribeToExams, 
  getQuestions, 
  ExamRecord, 
  QuestionData 
} from '@techinejigbo/firebase/src/firestore';
import ExamInterface, { ExamMetaAudit } from '../../../components/ExamInterface';
import ResultView from '../../../components/ResultView';
import { StudentInfo } from '../../../types';
import { PenTool, Lock, AlertCircle, Clock, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';

export default function ExamsPage() {
  const { user, trainee } = useStudent();
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States for exam flow
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [examElapsedSeconds, setExamElapsedSeconds] = useState(0);
  const [examAudit, setExamAudit] = useState<ExamMetaAudit | undefined>(undefined);
  const [examQuestions, setExamQuestions] = useState<QuestionData[]>([]);
  const [pastExams, setPastExams] = useState<ExamRecord[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    
    async function loadSettings() {
      if (!trainee && !user) return;
      
      const unsubSettings = subscribeToGlobalSettings((settings) => {
        const rawCourse = trainee?.course || trainee?.program || 'web-development';
        const normalizedCourse = rawCourse.toLowerCase().replace(/\s+/g, '-');
        
        const isOpen = settings.openPrograms?.[normalizedCourse] 
          || settings.openPrograms?.[rawCourse] 
          || settings.isExamOpen
          || false;
          
        setIsExamOpen(isOpen);
      });
      
      unsubscribe = () => {
        unsubSettings();
      };

      const effectiveUid = trainee?.uid || user?.uid;
      const unsubExams = subscribeToExams((myExams) => {
        setPastExams(myExams);
        setLoading(false);
      }, effectiveUid);
      
      const previousUnsubscribe = unsubscribe;
      unsubscribe = () => {
        previousUnsubscribe();
        unsubExams();
      };
    }
    
    loadSettings();
    return () => unsubscribe();
  }, [trainee, user]);

  const rawCourse = trainee ? (trainee.course || trainee.program || 'web-development') : 'web-development';
  const normalizedCourse = rawCourse.toLowerCase().replace(/\s+/g, '-');

  // Check if student has already completed an exam for this program
  const completedExamRecord = pastExams.find((e) => {
    if (!e || !e.examId) return false;
    const norm = e.examId.toLowerCase().replace(/\s+/g, '-');
    return norm === normalizedCourse || norm === rawCourse.toLowerCase().replace(/\s+/g, '-');
  });
  const hasAlreadyCompleted = Boolean(completedExamRecord);

  const effectiveTraineeUid = trainee?.uid || user?.uid || '';
  const studentInfo: StudentInfo | null = (trainee || user) ? {
    uid: effectiveTraineeUid,
    fullName: trainee ? `${trainee.firstName} ${trainee.lastName}` : (user?.displayName || 'Student'),
    email: trainee?.email || user?.email || '',
    phone: trainee?.phone || '',
    school: trainee?.school || '',
    course: normalizedCourse as 'graphic-design' | 'web-development'
  } : null;

  const handleStartExam = () => {
    if (hasAlreadyCompleted) {
      alert("You have already completed and submitted your examination for this course. Retakes are not permitted.");
      return;
    }
    setIsExamStarted(true);
  };

  const handleExamSubmit = async (
    submittedAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>, 
    finalSeconds: number,
    audit?: ExamMetaAudit,
    activeQuestions?: QuestionData[]
  ) => {
    const effectiveUid = trainee?.uid || user?.uid;
    if (!effectiveUid || !studentInfo) {
      console.error("No student profile or trainee UID found during submission.");
      alert("Error: Unable to identify student account. Please log in again.");
      return;
    }

    // 1. Use the active questions array that the student actually took
    let questions = (activeQuestions && activeQuestions.length > 0) ? activeQuestions : examQuestions;
    if (questions.length === 0) {
      try {
        questions = await getQuestions(studentInfo.course);
      } catch (err) {
        console.error("Error fetching questions for grading:", err);
      }
    }
    setExamQuestions(questions);

    let correctCount = 0;
    questions.forEach((q) => {
      if (submittedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    const total = questions.length > 0 ? questions.length : 1;
    const percentage = Math.round((correctCount / total) * 100);
    setScore(percentage);
    setExamAnswers(submittedAnswers);
    setExamElapsedSeconds(finalSeconds);
    setExamAudit(audit);

    const newRecord: ExamRecord = {
      traineeId: effectiveUid,
      examId: studentInfo.course,
      score: percentage,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: finalSeconds,
      violationsCount: audit?.violationsCount || 0,
      autoSubmitted: audit?.autoSubmitted || false,
      reason: audit?.reason || (audit?.autoSubmitted ? "Auto-submitted by proctoring engine" : "Normal Submission")
    };

    // Immediately lock out further attempts in local state
    setPastExams((prev) => {
      const filtered = prev.filter(e => e.examId !== studentInfo.course);
      return [newRecord, ...filtered];
    });

    try {
      await saveExamScore(newRecord);

      if (percentage >= 70) {
        const courseCode = studentInfo.course.toUpperCase();
        const cleanName = studentInfo.fullName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4);
        const certificateId = `TE-${courseCode}-2026-${cleanName}-${timestamp}`;

        await saveCertificate({
          traineeId: effectiveUid,
          examId: studentInfo.course,
          course: studentInfo.course,
          score: percentage,
          correctCount,
          totalQuestions: questions.length,
          elapsedSeconds: finalSeconds,
          issueDate: new Date().toISOString(),
          status: 'pending',
          certificateId
        });
      }
    } catch (err: any) {
      console.error("Failed to save exam score or certificate to Firestore:", err);
      alert(`Note: Submission processed. (${err?.message || 'Archived locally'})`);
    }

    setIsExamStarted(false);
    setIsExamCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full mr-3" />
        <span className="text-slate-500 font-mono text-sm uppercase">Loading assessment portal...</span>
      </div>
    );
  }

  // If exam is actively running, override the page layout to show only the full secure exam interface
  if (isExamStarted && studentInfo) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
        <ExamInterface 
          student={studentInfo} 
          onExit={() => setIsExamStarted(false)} 
          onSubmit={handleExamSubmit} 
        />
      </div>
    );
  }

  // If exam was just completed in this session
  if (isExamCompleted && studentInfo) {
    return (
      <div className="w-full">
        <ResultView 
          student={studentInfo} 
          questions={examQuestions}
          answers={examAnswers}
          elapsedSeconds={examElapsedSeconds}
          audit={examAudit}
          onExit={() => setIsExamCompleted(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Active Exam Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PenTool size={24} className="text-brand-orange" />
          Official Assessment Portal
        </h2>

        {/* State 1: Already Completed & Submitted */}
        {hasAlreadyCompleted && completedExamRecord ? (
          <div className="bg-white border-2 border-emerald-500/30 p-8 rounded-2xl shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl flex items-center gap-1">
              <Lock size={12} />
              Attempt Recorded (1/1)
            </div>

            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 size={34} />
            </div>

            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
              Assessment Completed & Locked
            </h3>
            
            <p className="text-slate-600 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              You have successfully completed and submitted your certification examination for <strong className="text-slate-900 capitalize">{normalizedCourse.replace('-', ' ')}</strong>. In accordance with examination regulations, assessments are strictly one-time and cannot be re-taken.
            </p>

            {/* Score pill & details */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono mb-6">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Your Score</span>
                <span className={`text-base font-black ${completedExamRecord.score >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {completedExamRecord.score}% ({completedExamRecord.score >= 70 ? 'Passed' : 'Completed'})
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Submission Date</span>
                <span className="text-slate-800 font-bold">
                  {new Date(completedExamRecord.completedAt).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Certificate Status</span>
                <span className={`font-bold ${completedExamRecord.score >= 70 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {completedExamRecord.score >= 70 ? 'Verified / Pending Admin' : 'Not Eligible (<70%)'}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Lock size={12} className="text-brand-orange" />
                Exam portal access is now permanently locked for this enrolled program.
              </span>
            </div>
          </div>
        ) : isExamOpen ? (
          /* State 2: Exam Open & Not Yet Attempted */
          <div className="bg-white border-2 border-brand-orange/30 p-8 rounded-2xl shadow-sm text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PenTool size={32} />
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange">
              Live Assessment Window
            </span>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-1 mb-2">
              Final Certification Examination
            </h3>
            
            <p className="text-slate-600 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              The assessment portal is currently open for your program (<strong className="text-slate-900 capitalize">{normalizedCourse.replace('-', ' ')}</strong>). 
              You will be presented with 50 questions with a 60-minute (1 hour) strict countdown timer and live malpractice detection.
            </p>

            <div className="bg-amber-50/80 border border-amber-200 text-amber-800 rounded-xl p-4 max-w-md mx-auto mb-6 text-xs text-left font-mono space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert size={14} className="text-amber-600" /> Important Examination Notice:
              </div>
              <p className="leading-relaxed">
                • You have exactly <strong>1 attempt</strong>.<br />
                • Tab switching or leaving the screen triggers violation strikes.<br />
                • The exam auto-submits when the timer reaches 00:00.
              </p>
            </div>

            <button 
              onClick={handleStartExam}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-mono font-bold uppercase tracking-wider py-4 px-10 rounded-xl transition-all duration-200 shadow-lg shadow-brand-orange/20 cursor-pointer text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <PenTool size={18} />
              Start Assessment Now (1 Attempt Only)
            </button>
          </div>
        ) : (
          /* State 3: Portal Closed */
          <div className="bg-slate-50 border border-slate-200 border-dashed p-8 rounded-2xl text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Portal Closed</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              There are no active assessments at this time. The portal will be scheduled and opened by your instructor when your cohort is eligible for evaluation.
            </p>
          </div>
        )}
      </section>

      {/* Past Results Section */}
      <section>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" />
          Candidate History & Records
        </h2>

        {pastExams.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center text-slate-500 text-sm">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            No previous examination records found for this account.
          </div>
        ) : (
          <div className="space-y-4">
            {pastExams.map((exam, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 capitalize text-base">
                      {exam.examId.replace('-', ' ')} Certification
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      Locked
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Submitted: {new Date(exam.completedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-right">
                  {exam.violationsCount !== undefined && exam.violationsCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                      {exam.violationsCount} Proctoring Warning(s)
                    </span>
                  )}
                  <div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      exam.score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      Score: {exam.score}%
                    </div>
                    <p className="text-[11px] font-mono font-bold text-slate-500 mt-1">
                      {exam.score >= 70 ? 'Passed (≥70%)' : 'Below Pass Mark'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
