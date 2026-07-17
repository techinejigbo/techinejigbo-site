"use client";

import React, { useEffect, useState } from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { getGlobalSettings, saveExamScore, getAllExams, getQuestions, ExamRecord } from '@techinejigbo/firebase/src/firestore';
import ExamInterface from '../../../components/ExamInterface';
import ResultView from '../../../components/ResultView';
import { StudentInfo } from '../../../types';
import { PenTool, Lock, AlertCircle, Clock } from 'lucide-react';

export default function ExamsPage() {
  const { trainee } = useStudent();
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States for exam flow
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [examElapsedSeconds, setExamElapsedSeconds] = useState(0);
  const [pastExams, setPastExams] = useState<ExamRecord[]>([]);

  useEffect(() => {
    async function loadSettings() {
      if (!trainee) return;
      const [settings, myExams] = await Promise.all([
        getGlobalSettings(),
        getAllExams(trainee.uid)
      ]);
      setIsExamOpen(settings.isExamOpen);
      setPastExams(myExams);
      setLoading(false);
    }
    loadSettings();
  }, [trainee]);

  const studentInfo: StudentInfo | null = trainee ? {
    uid: trainee.uid,
    fullName: `${trainee.firstName} ${trainee.lastName}`,
    email: trainee.email,
    phone: trainee.phone,
    school: trainee.school,
    course: trainee.course || (trainee.program === 'Graphic Design' ? 'graphic-design' : 'web-development')
  } : null;

  const handleStartExam = () => {
    setIsExamStarted(true);
  };

  const handleExamSubmit = async (submittedAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>, finalSeconds: number) => {
    setIsExamStarted(false);
    setIsExamCompleted(true);
    setExamAnswers(submittedAnswers);
    setExamElapsedSeconds(finalSeconds);

    if (trainee && studentInfo) {
      const questions = await getQuestions(studentInfo.course);
      
      let correctCount = 0;
      questions.forEach((q) => {
        if (submittedAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      
      const total = questions.length > 0 ? questions.length : 1;
      const percentage = Math.round((correctCount / total) * 100);
      setScore(percentage);

      try {
        await saveExamScore({
          traineeId: trainee.uid,
          examId: studentInfo.course,
          score: percentage,
          totalQuestions: questions.length,
          completedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save exam score to Firestore:", err);
      }
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading assessment portal...</div>;
  }

  // If exam is actively running, override the page layout to show only the exam interface
  if (isExamStarted && studentInfo) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
        <ExamInterface 
          student={studentInfo} 
          onExit={() => setIsExamStarted(false)} 
          onSubmit={handleExamSubmit} 
        />
      </div>
    );
  }

  // If exam was just completed
  if (isExamCompleted && studentInfo) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <ResultView 
          student={studentInfo} 
          answers={examAnswers as any}
          elapsedSeconds={examElapsedSeconds}
          onRetake={() => setIsExamCompleted(false)} 
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
          Active Assessment
        </h2>

        {isExamOpen ? (
          <div className="bg-white border-2 border-brand-orange/30 p-8 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-brand-orange-light/20 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Final Certification Exam</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              The exam portal is currently open! You have 50 questions to answer. Please ensure you have a stable internet connection before starting.
            </p>
            <button 
              onClick={handleStartExam}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-mono font-bold uppercase tracking-wider py-4 px-8 rounded-lg transition-colors shadow-sm"
            >
              Start Assessment Now
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Portal Closed</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              There are no active assessments at this time. The portal will be opened by your instructor when it is time for your exam.
            </p>
          </div>
        )}
      </section>

      {/* Past Results Section */}
      <section>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" />
          Past Exam History
        </h2>

        {pastExams.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-center text-slate-500">
            You have not taken any exams yet.
          </div>
        ) : (
          <div className="space-y-4">
            {pastExams.map((exam, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 capitalize">{exam.examId === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Dev'} Certification</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Completed: {new Date(exam.completedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${exam.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    Score: {exam.score}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{exam.score >= 80 ? 'Passed' : 'Failed'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
