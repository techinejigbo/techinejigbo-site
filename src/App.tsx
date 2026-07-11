/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import ExamInterface from './components/ExamInterface';
import ResultView from './components/ResultView';
import { StudentInfo } from './types';
import { Award, BookOpen, Clock, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Restore student if they had registered and were in middle of exam
  useEffect(() => {
    const savedStudent = localStorage.getItem('techinejigbo_student');
    const savedAnswers = localStorage.getItem('techinejigbo_answers');
    const savedElapsed = localStorage.getItem('techinejigbo_elapsed');
    const savedIsStarted = localStorage.getItem('techinejigbo_started');
    const savedIsCompleted = localStorage.getItem('techinejigbo_completed');

    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
    }
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedElapsed) {
      setElapsedSeconds(parseInt(savedElapsed, 10));
    }
    if (savedIsStarted === 'true') {
      setIsExamStarted(true);
    }
    if (savedIsCompleted === 'true') {
      setIsExamCompleted(true);
    }
  }, []);

  const handleRegister = (info: StudentInfo) => {
    setStudent(info);
    setIsExamStarted(true);
    setIsExamCompleted(false);
    setAnswers({});
    setElapsedSeconds(0);

    localStorage.setItem('techinejigbo_student', JSON.stringify(info));
    localStorage.setItem('techinejigbo_started', 'true');
    localStorage.setItem('techinejigbo_completed', 'false');
    localStorage.removeItem('techinejigbo_answers');
    localStorage.removeItem('techinejigbo_elapsed');
  };

  const handleExamSubmit = (submittedAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>, finalSeconds: number) => {
    setAnswers(submittedAnswers);
    setElapsedSeconds(finalSeconds);
    setIsExamCompleted(true);
    setIsExamStarted(false);

    localStorage.setItem('techinejigbo_answers', JSON.stringify(submittedAnswers));
    localStorage.setItem('techinejigbo_elapsed', finalSeconds.toString());
    localStorage.setItem('techinejigbo_completed', 'true');
    localStorage.setItem('techinejigbo_started', 'false');
  };

  const handleRetakeExam = () => {
    setIsExamCompleted(false);
    setIsExamStarted(true);
    setAnswers({});
    setElapsedSeconds(0);

    localStorage.setItem('techinejigbo_completed', 'false');
    localStorage.setItem('techinejigbo_started', 'true');
    localStorage.removeItem('techinejigbo_answers');
    localStorage.removeItem('techinejigbo_elapsed');
  };

  const handleExitPortal = () => {
    setStudent(null);
    setIsExamStarted(false);
    setIsExamCompleted(false);
    setAnswers({});
    setElapsedSeconds(0);

    localStorage.clear();
  };

  // Timer simulation for header when exam is active
  const [headerTimer, setHeaderTimer] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExamStarted && !isExamCompleted) {
      interval = setInterval(() => {
        setHeaderTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setHeaderTimer(0);
    }
    return () => clearInterval(interval);
  }, [isExamStarted, isExamCompleted]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-600/30 selection:text-slate-900 antialiased">
      {/* Dynamic Navigation Header */}
      <Header
        student={student}
        timeSpentSeconds={isExamStarted ? headerTimer : undefined}
        onExit={student ? handleExitPortal : undefined}
        isExamActive={isExamStarted && !isExamCompleted}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {!student && !isExamStarted && !isExamCompleted && (
          <RegistrationForm onRegister={handleRegister} />
        )}

        {student && isExamStarted && !isExamCompleted && (
          <ExamInterface
            student={student}
            onExit={handleExitPortal}
            onSubmit={handleExamSubmit}
          />
        )}

        {student && isExamCompleted && !isExamStarted && (
          <ResultView
            student={student}
            answers={answers}
            elapsedSeconds={elapsedSeconds}
            onRetake={handleRetakeExam}
            onExit={handleExitPortal}
          />
        )}
      </main>

      {/* Modern, minimalist footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-[10px] text-slate-400 font-mono no-print uppercase tracking-wider font-bold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-orange-600" />
            <span>TechinEjigbo Assessment Board • All Rights Reserved</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Designed with</span>
            <Heart size={10} className="fill-orange-600 text-orange-600 animate-pulse mx-1" />
            <span>for creative skill verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
