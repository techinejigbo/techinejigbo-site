/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Check, ChevronDown, ChevronUp, Download, Printer, RefreshCw, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { Question, StudentInfo } from '../types';
import { canvaQuestions, htmlQuestions } from '../questions';

interface ResultViewProps {
  student: StudentInfo;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  elapsedSeconds: number;
  onRetake: () => void;
  onExit: () => void;
}

export default function ResultView({ student, answers, elapsedSeconds, onRetake, onExit }: ResultViewProps) {
  const questions: Question[] = student.course === 'graphic-design' ? canvaQuestions : htmlQuestions;
  const [showReview, setShowReview] = useState(false);

  // Calculate score
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const isPassed = percentage >= 80;

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
                  : `You scored ${percentage}%, which is short of the required 80% passing mark (40 correct answers). Don't worry, failure is just a step to master. Review your answers below, study the materials, and try again.`}
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

      {/* 2. Official Certificate View (Only shown if passed, and style optimized for paper prints) */}
      {isPassed && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 no-print px-1">
            <h2 className="text-sm font-mono font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Award className="text-orange-600 animate-spin" size={18} />
              Verified Certification Paper
            </h2>
            <button
              onClick={handlePrint}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-mono font-bold flex items-center gap-1 cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded uppercase tracking-wider"
            >
              <Printer size={12} />
              Print Version
            </button>
          </div>

          {/* Certificate Container Styled like a High-end Physical Certificate */}
          <div className="bg-white border border-slate-200 p-1 sm:p-4 rounded-lg overflow-x-auto shadow-sm">
            <div 
              id="printable-certificate"
              className="print-card min-w-[720px] max-w-[960px] mx-auto bg-[#FDFCF7] text-zinc-900 p-8 sm:p-12 md:p-16 border-[12px] border-double border-[#C4953C] rounded-2xl relative shadow-lg text-center font-sans select-none"
            >
              {/* Fancy watermark background */}
              <div className="absolute inset-4 border border-zinc-200 pointer-events-none rounded" />
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Award size={400} className="text-[#C4953C]" />
              </div>

              {/* Gold Flourish Corner Accents */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#C4953C]" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#C4953C]" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#C4953C]" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#C4953C]" />

              {/* Certificate Header */}
              <div className="mb-6">
                <div className="flex justify-center items-center gap-2 mb-4">
                  {/* Brand styling for print logo */}
                  <div className="flex items-center font-display font-bold text-xl tracking-tight">
                    <span className="bg-[#E37300] text-white px-2.5 py-1 rounded-l font-black">
                      Techin
                    </span>
                    <span className="bg-zinc-900 text-[#E37300] px-2.5 py-1 rounded-r font-black border border-zinc-900">
                      Ejigbo
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-bold">
                  Official Technical Competency Assessment
                </p>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#2D2311] mt-2 font-serif uppercase">
                  Certificate of Completion
                </h2>
              </div>

              {/* Certificate Presentation Text */}
              <div className="space-y-4 max-w-xl mx-auto my-8">
                <p className="italic text-zinc-500 font-serif text-sm">
                  This is proudly presented to
                </p>
                
                {/* Student Name */}
                <h3 className="text-2xl sm:text-3xl font-bold text-[#E37300] tracking-wide border-b-2 border-zinc-200 pb-2 inline-block px-10 font-display uppercase">
                  {student.fullName}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-lg mx-auto mt-4 font-sans">
                  for outstanding academic achievement, successfully completing all assessment tasks and meeting requirements of the rigorous certification curriculum in
                </p>

                {/* Course Name */}
                <p className="font-bold text-slate-800 text-lg uppercase tracking-wider mb-8">
                  {student.course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}
                </p>

                <p className="text-xs font-mono text-zinc-500">
                  with a verified score of <strong className="text-zinc-800">{correctCount} of 50 ({percentage}%)</strong> completed in <strong className="text-zinc-800">{formatTime(elapsedSeconds)}</strong>.
                </p>
              </div>

              {/* Certificate Footer / Signatures & QR Code */}
              <div className="grid grid-cols-3 gap-4 items-end mt-12 pt-6 border-t border-zinc-100 max-w-2xl mx-auto">
                {/* Instructor Sign */}
                <div className="text-center">
                  <div className="font-serif italic text-base sm:text-lg text-zinc-700 h-8 flex items-center justify-center select-none font-semibold">
                    Oluwaseun A.
                  </div>
                  <div className="w-full h-px bg-zinc-300 my-1.5" />
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Program Coordinator
                  </p>
                </div>

                {/* Seal visual representation */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-14 h-14 bg-[#C4953C] rounded-full flex items-center justify-center shadow shadow-[#C4953C]/45 border-4 border-[#FDFCF7]">
                    <ShieldCheck size={26} className="text-white" />
                    {/* Tiny star items surrounding */}
                    <div className="absolute top-0 w-full text-[6px] text-white/50 text-center uppercase tracking-widest font-mono select-none">
                      ★ ★ ★
                    </div>
                  </div>
                  <p className="text-[8px] font-mono font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                    Verified Seal
                  </p>
                </div>

                {/* Coordinator Sign */}
                <div className="text-center">
                  <div className="font-serif italic text-base sm:text-lg text-zinc-700 h-8 flex items-center justify-center select-none font-semibold">
                    Adebayo O.
                  </div>
                  <div className="w-full h-px bg-zinc-300 my-1.5" />
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Lead Instructor
                  </p>
                </div>
              </div>

              {/* Certificate Identification */}
              <div className="flex items-center justify-between mt-10 pt-4 border-t border-zinc-100 text-[10px] font-mono text-zinc-400">
                <span>Date Issued: {formattedDate}</span>
                <span className="font-bold text-[#C4953C]">{certificateId}</span>
              </div>
            </div>
          </div>
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
