/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Printer, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { StudentInfo } from '../types';
import { QuestionData } from '@techinejigbo/firebase/src/firestore';
import { ExamMetaAudit } from './ExamInterface';

interface ResultViewProps {
  student: StudentInfo;
  questions: QuestionData[];
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  elapsedSeconds: number;
  audit?: ExamMetaAudit;
  onExit: () => void;
}

export default function ResultView({ 
  student, 
  questions, 
  answers, 
  elapsedSeconds, 
  audit, 
  onExit 
}: ResultViewProps) {
  const [showReview, setShowReview] = useState(false);

  // Calculate score
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length || 50;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 70;

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      
      {/* 1. Results Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 md:p-10 mb-8 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Circular Score Visual (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                isPassed ? 'bg-emerald-100' : 'bg-rose-100'
              }`} />
              
              {/* SVG circular progress */}
              <svg viewBox="0 0 176 176" className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  className={`fill-none transition-all duration-1000 ${
                    isPassed ? 'stroke-emerald-500' : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={490}
                  strokeDashoffset={490 - (490 * percentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Score Value Text */}
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-mono font-black text-slate-800">{percentage}%</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 uppercase font-bold">
                  {correctCount} / {totalQuestions} Correct
                </span>
              </div>
            </div>

            {/* Single Attempt Lock Notice */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Lock size={12} className="text-brand-orange" />
              <span>Assessment Completed & Locked</span>
            </div>
          </div>

          {/* Feedback & Stats (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold font-mono tracking-widest uppercase ${
                  isPassed 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {isPassed ? 'PASSED • CONGRATULATIONS' : 'ASSESSMENT COMPLETED'}
                </span>

                {audit && audit.violationsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle size={10} />
                    {audit.violationsCount} Proctoring Warning(s)
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                {isPassed 
                  ? 'You have earned your certification!' 
                  : 'Official Assessment Record Submitted'}
              </h1>
              
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {isPassed 
                  ? <>Incredible job, {student.fullName}! You have successfully demonstrated your proficiency in <span className="text-slate-900 font-bold capitalize">
                      {student.course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}
                    </span> with a passing score of {percentage}%. Your certification is undergoing final verification.</>
                  : `You completed the examination with a score of ${percentage}% (${correctCount} of ${totalQuestions} correct). Per Tech in Ejigbo examination guidelines, assessments can only be written once per cohort.`}
              </p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Time Spent</span>
                <span className="text-slate-800 font-bold text-sm">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Program</span>
                <span className="text-slate-800 font-bold text-sm capitalize">{student.course.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Status</span>
                <span className={`font-bold text-sm ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPassed ? 'Passed (≥70%)' : 'Below Pass Mark'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Attempts</span>
                <span className="text-slate-800 font-bold text-sm">1 / 1 (Locked)</span>
              </div>
            </div>

            {/* Actions for results summary */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onExit}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-mono font-bold uppercase tracking-wider py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                Return to Dashboard
                <ArrowRight size={14} />
              </button>

              {isPassed && (
                <button
                  onClick={handlePrint}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider py-3 px-5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={14} />
                  Print Record
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. Official Certificate Pending View (Only shown if passed) */}
      {isPassed && (
        <div className="mb-8 bg-emerald-50/40 border border-emerald-200 p-6 sm:p-8 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award size={28} />
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 mb-1.5">
            Certification Pending Verification
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
            Your passing score has been securely archived. The admin team will review and approve your official digital credential, which will appear in your <strong className="text-slate-900">Certificate Wallet</strong> in your profile.
          </p>
        </div>
      )}

      {/* 3. Detailed Review of Questions */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden no-print shadow-sm">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className="text-left">
            <h3 className="font-display font-bold text-sm sm:text-base uppercase tracking-wide text-slate-900">
              Review Submitted Answers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View your selected options and performance breakdown.
            </p>
          </div>
          {showReview ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
        </button>

        {showReview && (
          <div className="border-t border-slate-200 p-5 sm:p-6 space-y-6 bg-slate-50/50">
            {questions.map((q, qIdx) => {
              const selectedAnswer = answers[q.id];
              const isCorrect = selectedAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isCorrect 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {qIdx + 1}
                    </span>
                    <div className="space-y-4 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.question}
                      </h4>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(Object.keys(q.options) as Array<'A' | 'B' | 'C' | 'D'>).map((key) => {
                          const isOptionCorrect = q.correctAnswer === key;
                          const isOptionSelected = selectedAnswer === key;

                          return (
                            <div
                              key={key}
                              className={`flex items-start gap-2.5 p-3 rounded-lg text-xs sm:text-sm border ${
                                isOptionCorrect
                                  ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900 font-semibold'
                                  : isOptionSelected
                                  ? 'bg-rose-100/60 border-rose-300 text-rose-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-500'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 border ${
                                isOptionCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : isOptionSelected
                                  ? 'bg-rose-600 border-rose-600 text-white'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                                {key}
                              </span>
                              <span className="leading-tight pt-0.5">{q.options[key]}</span>
                              
                              {isOptionCorrect && (
                                <span className="ml-auto text-emerald-700 font-mono text-[9px] font-bold uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded">
                                  ✓ Correct
                                </span>
                              )}
                              {isOptionSelected && !isOptionCorrect && (
                                <span className="ml-auto text-rose-700 font-mono text-[9px] font-bold uppercase shrink-0 tracking-wide bg-rose-50 px-1.5 py-0.5 border border-rose-200 rounded">
                                  ✗ Your Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-sm">
                        <span className="text-brand-orange font-bold font-mono uppercase tracking-wide">Note:</span>
                        <span>
                          The correct answer is <strong className="text-slate-800 font-semibold font-mono">{q.correctAnswer}</strong>. 
                          {isCorrect 
                            ? " Perfect! You answered correctly." 
                            : selectedAnswer 
                            ? ` You selected option ${selectedAnswer}.` 
                            : " You did not provide an answer for this question."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
