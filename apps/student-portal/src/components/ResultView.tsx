/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Check, ChevronDown, ChevronUp, Download, Printer, RefreshCw, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { StudentInfo } from '../types';
import { QuestionData } from '@techinejigbo/firebase/src/firestore';

interface ResultViewProps {
  student: StudentInfo;
  questions: QuestionData[];
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  elapsedSeconds: number;
  onRetake: () => void;
  onExit: () => void;
}

export default function ResultView({ student, questions, answers, elapsedSeconds, onRetake, onExit }: ResultViewProps) {
  const [showReview, setShowReview] = useState(false);

  // Calculate score
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const isPassed = percentage >= 70;

  // Format date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate a unique certificate ID
  const generateCertificateId = () => {
    const courseCode = student.course.toUpperCase();
    const cleanName = student.fullName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4);
    return `TE-${courseCode}-2026-${cleanName}-${timestamp}`;
  };

  const certificateId = generateCertificateId();

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
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 md:p-10 mb-10 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Circular Score Visual (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                isPassed ? 'bg-emerald-100' : 'bg-rose-100'
              }`} />
              
              {/* SVG circular progress */}
              <svg className="w-full h-full transform -rotate-90">
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
                  {correctCount} / 50 Correct
                </span>
              </div>
            </div>
          </div>

          {/* Feedback & Stats (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold font-mono tracking-widest uppercase ${
                isPassed 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {isPassed ? 'PASSED • CONGRATULATIONS' : 'FAILED • TRY AGAIN'}
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                {isPassed 
                  ? 'You have earned your certification!' 
                  : 'Keep learning and try once more!'}
              </h1>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                {isPassed 
                  ? <>Incredible job, {student.fullName}! You have successfully demonstrated your proficiency in <span className="text-slate-800 font-bold capitalize">
                      {student.course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}
                    </span> with a passing score of {percentage}%. Your certification is ready below.</>
                  : `You scored ${percentage}%, which is short of the required 70% passing mark (35 correct answers). Don't worry, failure is just a step to master. Review your answers below, study the materials, and try again.`}
              </p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 border border-slate-200 p-4 rounded text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Time Spent</span>
                <span className="text-slate-800 font-bold text-sm">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Trained Course</span>
                <span className="text-slate-800 font-bold text-sm capitalize">{student.course}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Certificate</span>
                <span className={`font-bold text-sm ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPassed ? 'Ready' : 'Not Eligible'}
                </span>
              </div>
            </div>

            {/* Actions for results summary */}
            <div className="flex flex-wrap gap-3 pt-2">
              {isPassed ? (
                <>
                  <button
                    onClick={handlePrint}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold uppercase tracking-wider py-3 px-5 rounded text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Printer size={14} />
                    Print Certificate
                  </button>
                  <button
                    onClick={onExit}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider py-3 px-5 rounded text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Return to Lobby
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onRetake}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold uppercase tracking-wider py-3 px-5 rounded text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} />
                    Retake Examination
                  </button>
                  <button
                    onClick={onExit}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider py-3 px-5 rounded text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Change Details
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. Official Certificate View (Only shown if passed) */}
      {isPassed && (
        <div className="mb-12 bg-white border border-emerald-200 bg-emerald-50/30 p-8 rounded-lg shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 mb-2">
            Certification Pending Approval
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Your results have been submitted and a certificate has been generated. It is currently waiting for admin review and approval. Once approved, it will be available for viewing and download in your <strong className="text-slate-900">Certificate Wallet</strong> (in the Profile page).
          </p>
        </div>
      )}

      {/* 3. Detailed Review of Questions */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden no-print shadow-sm">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className="text-left">
            <h3 className="font-display font-bold text-sm sm:text-base uppercase tracking-wide text-slate-900">Review Detailed Answers</h3>
            <p className="text-xs text-slate-500 mt-1">Review explanations and evaluate performance for each question.</p>
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
                  className={`p-5 rounded border transition-all ${
                    isCorrect
                      ? 'bg-[#F0FDF4] border-emerald-200'
                      : 'bg-[#FEF2F2] border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
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
                              className={`flex items-start gap-2.5 p-3 rounded text-xs sm:text-sm border ${
                                isOptionCorrect
                                  ? 'bg-emerald-100/50 border-emerald-300 text-emerald-900 font-semibold'
                                  : isOptionSelected
                                  ? 'bg-rose-100/50 border-rose-300 text-rose-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-500'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 border ${
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
                                  ✗ Selected
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600 flex items-start gap-2 shadow-sm">
                        <span className="text-orange-600 font-bold font-mono uppercase tracking-wide">Note:</span>
                        <span>
                          The correct answer is <strong className="text-slate-800 font-semibold font-mono">{q.correctAnswer}</strong>. 
                          {isCorrect 
                            ? " Perfect! You answered correctly." 
                            : selectedAnswer 
                            ? ` You selected option ${selectedAnswer}, which was incorrect.` 
                            : " You did not answer this question during the exam."}
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
