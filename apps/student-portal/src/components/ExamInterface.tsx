/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FileCheck, HelpCircle } from 'lucide-react';
import { StudentInfo } from '../types';
import { getQuestions, QuestionData } from '@techinejigbo/firebase/src/firestore';

interface ExamInterfaceProps {
  student: StudentInfo;
  onExit: () => void;
  onSubmit: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>, elapsedSeconds: number) => void;
}

const QUESTIONS_PER_PAGE = 5;

export default function ExamInterface({ student, onExit, onSubmit }: ExamInterfaceProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quiz states
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentPage, setCurrentPage] = useState(0); 
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadQuestions() {
      const q = await getQuestions(student.course);
      // Optional: shuffle questions here if needed
      setQuestions(q);
      setLoading(false);
    }
    loadQuestions();
  }, [student.course]);

  // Timer effect using primitive interval
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Total completed questions
  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Handle select option
  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  // Navigate pages
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      scrollToTop();
    }
  };

  const jumpToQuestionPage = (questionIndex: number) => {
    const page = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    setCurrentPage(page);
    scrollToTop();
  };

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Submit trigger
  const handleFinalSubmit = () => {
    onSubmit(answers, elapsedSeconds);
  };

  // Questions on current page
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500 font-mono font-bold uppercase tracking-wider text-sm">Loading Exam Questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-full mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">No Questions Available</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md">There are no questions configured for the {student.course} program. Please contact your instructor.</p>
        <button onClick={onExit} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Return to Portal</button>
      </div>
    );
  }

  return (
    <div ref={topRef} className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 no-print">
      {/* Exam Header Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-orange-600 uppercase tracking-widest font-bold block">
            Official Certification Exam
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-1 uppercase tracking-tight">
            {student.course === 'graphic-design' ? 'Basic Graphic Design Quiz' : 'Basic Web Development Quiz'}
          </h1>
          <p className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase tracking-wider font-bold">
            Questions 1 to {totalQuestions} • Passing mark: 80% ({Math.ceil(totalQuestions * 0.8)} correct)
          </p>
        </div>

        {/* Progress summary widget */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Progress</span>
            <span className="text-xs font-bold text-slate-800 font-mono">
              {answeredCount} <span className="text-slate-400">/ {totalQuestions} Answered</span>
            </span>
          </div>
          <div className="w-32 bg-slate-100 h-2 rounded overflow-hidden border border-slate-200">
            <div
              className="bg-orange-600 h-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Left - Questions (8 Cols), Right - Navigation Grid & Actions (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Questions Container */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {currentPageQuestions.map((q, idx) => {
                const questionIndex = startIndex + idx;
                const isAnswered = answers[q.id] !== undefined;
                const selectedAnswer = answers[q.id];

                return (
                  <div
                    key={q.id}
                    id={`question-card-${q.id}`}
                    className={`bg-white border rounded-lg p-5 sm:p-6 transition-all duration-150 ${
                      isAnswered
                        ? 'border-orange-600 ring-1 ring-orange-600/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Question Statement */}
                    <div className="flex items-start gap-3.5 mb-5">
                      <span className="bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs font-bold w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5">
                        {questionIndex + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed pt-0.5">
                        {q.question}
                      </h3>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Object.keys(q.options) as Array<'A' | 'B' | 'C' | 'D'>).map((key) => {
                        const isSelected = selectedAnswer === key;
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectOption(q.id, key)}
                            className={`flex items-start gap-3 p-3.5 rounded border text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer group ${
                              isSelected
                                ? 'bg-orange-50/50 border-orange-600 text-slate-900 ring-1 ring-orange-600/10 font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-xs shrink-0 font-bold border transition-colors ${
                              isSelected
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-slate-300'
                            }`}>
                              {key}
                            </span>
                            <span className="leading-snug pt-0.5 font-medium">{q.options[key]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded border text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 0
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
              Page {currentPage + 1} of {totalPages}
            </span>

            {currentPage < 9 ? (
              <button
                onClick={handleNextPage}
                className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Next
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm animate-pulse"
              >
                Submit Exam
                <FileCheck size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Navigation Grid & Real-time Stats */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* 50-Item Navigation Grid Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <HelpCircle size={14} className="text-orange-600" />
                Navigator
              </h3>
              <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                {totalPages} Pages
              </span>
            </div>

            {/* Questions boxes 1-50 */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-5">
              {questions.map((q, qIdx) => {
                const isCurrentPage = Math.floor(qIdx / QUESTIONS_PER_PAGE) === currentPage;
                const isAnswered = answers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestionPage(qIdx)}
                    className={`h-9 rounded text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer border ${
                      isAnswered
                        ? 'bg-orange-600 border-orange-600 text-white hover:bg-orange-700'
                        : isCurrentPage
                        ? 'bg-orange-50 border-orange-600 text-orange-600'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                    title={`Go to Question ${qIdx + 1}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Grid Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mt-5 pt-4 border-t border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-600 shrink-0" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-50 border border-slate-200 shrink-0" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-orange-600 bg-orange-50 shrink-0" />
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Quick Submit Board */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 text-center shadow-sm">
            <p className="text-xs text-slate-700 font-bold uppercase font-mono tracking-wider">Ready to submit?</p>
            <p className="text-[11px] font-mono text-slate-400 mt-1 mb-4 font-bold uppercase tracking-wide">
              {answeredCount} of {totalQuestions} answered
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-orange-600 hover:bg-orange-600 hover:text-white text-slate-700 font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded text-xs transition-all duration-200 cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal overlay */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-xl"
            >
              {/* Highlight Background Flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4 text-orange-600">
                <AlertCircle size={24} />
                <h3 className="text-base font-display font-bold text-slate-900 uppercase tracking-wide">
                  Finish Examination?
                </h3>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                <p>
                  You are about to submit your exam. Please review your statistics before confirmation:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase">Student:</span>
                    <span className="text-slate-800 font-bold truncate max-w-[180px]">{student.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase">Course:</span>
                    <span className="text-slate-800 font-bold capitalize">{student.course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase">Answered:</span>
                    <span className="text-emerald-600 font-bold">{answeredCount} / {totalQuestions}</span>
                  </div>
                  {unansweredCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-rose-600 font-bold uppercase">Unanswered:</span>
                      <span className="text-rose-600 font-bold">{unansweredCount}</span>
                    </div>
                  )}
                </div>

                {unansweredCount > 0 ? (
                  <p className="text-xs text-rose-600 font-mono font-bold uppercase tracking-wider">
                    ⚠️ Warning: You have {unansweredCount} unanswered questions. Unanswered questions count as incorrect.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    All {totalQuestions} questions answered!
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="sm:flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider py-3 px-4 rounded text-xs transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="sm:flex-1 bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold uppercase tracking-wider py-3 px-4 rounded text-xs transition-all cursor-pointer shadow-sm"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
