/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Maximize2, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';
import { StudentInfo } from '../types';
import { getQuestions, QuestionData } from '@techinejigbo/firebase/src/firestore';

export interface ExamMetaAudit {
  violationsCount: number;
  autoSubmitted: boolean;
  reason?: string;
  timeSpentSeconds: number;
}

interface ExamInterfaceProps {
  student: StudentInfo;
  onExit: () => void;
  onSubmit: (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>, 
    elapsedSeconds: number,
    audit?: ExamMetaAudit,
    activeQuestions?: QuestionData[]
  ) => void;
  examDurationMinutes?: number;
}

const QUESTIONS_PER_PAGE = 5;
const MAX_STRIKES = 3;
const DEFAULT_DURATION_MINUTES = 60;

// Shuffling helper (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ExamInterface({ 
  student, 
  onExit, 
  onSubmit,
  examDurationMinutes = DEFAULT_DURATION_MINUTES 
}: ExamInterfaceProps) {
  const totalDurationSeconds = examDurationMinutes * 60;
  const storageKey = `techinejigbo_exam_session_${student.uid}_${student.course}`;

  // Pre-exam briefing agreement state
  const [hasAgreedRules, setHasAgreedRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Exam data states
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentPage, setCurrentPage] = useState(0); 
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Security & Proctoring States
  const [violationsCount, setViolationsCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const lastBlurTimestampRef = useRef<number>(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const elapsedSecondsRef = useRef(elapsedSeconds);
  elapsedSecondsRef.current = elapsedSeconds;
  const violationsRef = useRef(violationsCount);
  violationsRef.current = violationsCount;

  // 1. Load questions & restore any existing active session
  useEffect(() => {
    async function initExamSession() {
      try {
        const rawQuestions = await getQuestions(student.course);
        
        // Check if there is an ongoing session stored locally
        const cachedSession = sessionStorage.getItem(storageKey);
        if (cachedSession) {
          try {
            const parsed = JSON.parse(cachedSession);
            if (parsed && parsed.startTime && parsed.questions) {
              const now = Date.now();
              const elapsed = Math.floor((now - parsed.startTime) / 1000);
              const remaining = Math.max(0, totalDurationSeconds - elapsed);
              
              setQuestions(parsed.questions);
              setAnswers(parsed.answers || {});
              setViolationsCount(parsed.violationsCount || 0);
              setElapsedSeconds(elapsed);
              setRemainingSeconds(remaining);
              setHasAgreedRules(true);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached exam session:", e);
          }
        }

        // Fresh session: Randomize question order, but keep options A, B, C, D canonical and intact
        const shuffledQuestions = shuffleArray(rawQuestions);
        setQuestions(shuffledQuestions);
      } catch (err) {
        console.error("Error loading exam questions:", err);
      } finally {
        setLoading(false);
      }
    }

    initExamSession();
  }, [student.course, storageKey, totalDurationSeconds]);

  // 2. Final Submit Handler with cleanup
  const handleFinalSubmit = useCallback((
    isAuto = false, 
    reason = "Normal Submission"
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Clear active session storage
    sessionStorage.removeItem(storageKey);

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    onSubmit(answersRef.current, elapsedSecondsRef.current, {
      violationsCount: violationsRef.current,
      autoSubmitted: isAuto,
      reason,
      timeSpentSeconds: elapsedSecondsRef.current
    }, questions);
  }, [isSubmitting, onSubmit, storageKey, questions]);

  // 3. Countdown & Session Persistence Timer
  useEffect(() => {
    if (!hasAgreedRules || isSubmitting || loading || questions.length === 0) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextElapsed = prev + 1;
        const nextRemaining = Math.max(0, totalDurationSeconds - nextElapsed);
        setRemainingSeconds(nextRemaining);

        // Persist to session storage
        const currentSession = sessionStorage.getItem(storageKey);
        let startTime = Date.now() - (nextElapsed * 1000);
        if (currentSession) {
          try {
            const parsed = JSON.parse(currentSession);
            if (parsed.startTime) startTime = parsed.startTime;
          } catch {}
        }

        sessionStorage.setItem(storageKey, JSON.stringify({
          startTime,
          questions,
          answers: answersRef.current,
          violationsCount: violationsRef.current
        }));

        // Trigger auto-submit when time expires
        if (nextRemaining <= 0) {
          clearInterval(interval);
          handleFinalSubmit(true, "Time Expired (60-Minute Limit)");
        }

        return nextElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasAgreedRules, isSubmitting, loading, questions, totalDurationSeconds, storageKey, handleFinalSubmit]);

  // 4. Tab Switch & Blur Anti-Malpractice Monitor
  const triggerViolation = useCallback((message: string) => {
    if (isSubmitting || !hasAgreedRules) return;

    const now = Date.now();
    // Debounce to prevent simultaneous visibilitychange + blur triggers
    if (now - lastBlurTimestampRef.current < 1500) return;
    lastBlurTimestampRef.current = now;

    setViolationsCount((prev) => {
      const nextCount = prev + 1;
      violationsRef.current = nextCount;

      if (nextCount >= MAX_STRIKES) {
        setViolationMessage(
          `Security violation: ${message}. You have accumulated ${nextCount} strikes. Your exam is being automatically submitted immediately.`
        );
        setShowViolationModal(true);
        setTimeout(() => {
          handleFinalSubmit(true, `Exceeded malpractice limit (${nextCount} strikes): ${message}`);
        }, 2000);
      } else {
        setViolationMessage(
          `Security violation: ${message}. Leaving or blurring the exam window is strictly monitored. (Strike ${nextCount} of ${MAX_STRIKES}).`
        );
        setShowViolationModal(true);
      }

      return nextCount;
    });
  }, [isSubmitting, hasAgreedRules, handleFinalSubmit]);

  useEffect(() => {
    if (!hasAgreedRules || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab or Application Switch Detected");
      }
    };

    const handleWindowBlur = () => {
      triggerViolation("Window Focus Lost (Clicked Outside Exam)");
    };

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && hasAgreedRules && !isSubmitting) {
        triggerViolation("Exited Fullscreen Mode");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasAgreedRules, isSubmitting, triggerViolation]);

  // 5. Block Clipboard, Context Menu, Selection, and Developer Shortcut Keys
  useEffect(() => {
    if (!hasAgreedRules || isSubmitting) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'i' || e.key === 'I' || e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 'v' || e.key === 'V' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A')
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyCutPaste);
    window.addEventListener('cut', handleCopyCutPaste);
    window.addEventListener('paste', handleCopyCutPaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyCutPaste);
      window.removeEventListener('cut', handleCopyCutPaste);
      window.removeEventListener('paste', handleCopyCutPaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasAgreedRules, isSubmitting]);

  // Fullscreen launcher
  const handleStartWithFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Browser may block automatic fullscreen without direct gesture; continue gracefully
    }

    const now = Date.now();
    sessionStorage.setItem(storageKey, JSON.stringify({
      startTime: now,
      questions,
      answers: {},
      violationsCount: 0
    }));

    setHasAgreedRules(true);
  };

  // Re-enter Fullscreen helper
  const handleReEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error("Could not enter fullscreen:", err);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionKey };
      answersRef.current = updated;
      return updated;
    });
  };

  // Page Navigation
  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

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

  // Formatted remaining time (HH:MM:SS or MM:SS)
  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Summary counts
  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const isTimeCritical = remainingSeconds <= 300; // less than 5 minutes

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  // -------------------------------------------------------------
  // RENDER: Loading State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full mb-4" />
        <p className="text-slate-600 font-mono font-bold uppercase tracking-wider text-sm">
          Initializing Secure Exam Environment...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: No Questions Configured
  // -------------------------------------------------------------
  if (questions.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-full mb-4">
          <AlertCircle size={36} />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">No Questions Available</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md">
          There are currently no questions configured for the {student.course} program. Please contact your instructor.
        </p>
        <button onClick={onExit} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm">
          Return to Portal
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Pre-Exam Security & Honesty Rules Screen
  // -------------------------------------------------------------
  if (!hasAgreedRules) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 text-brand-orange">
            <div className="p-3 bg-brand-orange/10 rounded-xl">
              <ShieldAlert size={32} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange-light">
                Secure Assessment Portal
              </span>
              <h1 className="text-2xl font-display font-bold text-white">
                Exam Instructions & Security Protocol
              </h1>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 mb-8 leading-relaxed">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Candidate:</span>
                <span className="text-white font-bold">{student.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Program:</span>
                <span className="text-brand-orange capitalize font-bold">{student.course.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Questions / Pass Mark:</span>
                <span className="text-white font-bold">{totalQuestions} Questions (50% to Pass)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Time:</span>
                <span className="text-emerald-400 font-bold">{examDurationMinutes} Minutes (1 Hour Strict Countdown)</span>
              </div>
            </div>

            <h3 className="font-bold text-white text-base pt-2 flex items-center gap-2">
              <Lock size={16} className="text-brand-orange" /> Strict Anti-Malpractice Rules:
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-white">Single Attempt Only:</strong> Once you begin and submit (or run out of time), you <span className="text-rose-400">cannot retake</span> this exam.
              </li>
              <li>
                <strong className="text-white">Tab & Application Switching Monitored:</strong> Navigating away from this tab, opening another window, or switching apps is recorded as a strike. <span className="text-rose-400 font-bold">3 strikes will automatically submit your exam.</span>
              </li>
              <li>
                <strong className="text-white">Clipboard & Shortcut Lock:</strong> Copying questions, pasting, right-clicking, and developer inspection keys are completely disabled.
              </li>
              <li>
                <strong className="text-white">Timed Countdown:</strong> The exam will auto-submit when the countdown timer reaches 00:00.
              </li>
              <li>
                <strong className="text-white">Fullscreen Mode:</strong> The assessment runs in fullscreen for complete focus.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-700 pt-6">
            <button
              onClick={onExit}
              className="sm:flex-1 py-3 px-5 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel & Exit
            </button>
            <button
              onClick={handleStartWithFullscreen}
              className="sm:flex-2 py-3.5 px-6 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
            >
              <Maximize2 size={16} />
              I Agree • Enter Fullscreen & Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Active Secure Assessment Interface
  // -------------------------------------------------------------
  return (
    <div 
      ref={topRef} 
      className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 select-none no-print"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Top Security Banner & Countdown Bar */}
      <div className="sticky top-2 z-40 mb-6 bg-slate-900 text-white border border-slate-700 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Course & Security Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-brand-orange uppercase tracking-widest font-bold">
                Live Proctoring Active
              </span>
              {violationsCount > 0 && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Strikes: {violationsCount}/{MAX_STRIKES}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-display font-bold text-white uppercase tracking-tight">
              {student.course === 'graphic-design' ? 'Graphic Design Certification Exam' : 'Web Development Certification Exam'}
            </h1>
          </div>
        </div>

        {/* Center/Right: Timer, Progress & Fullscreen */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          
          {/* Countdown Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono ${
            isTimeCritical 
              ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse font-black text-sm sm:text-base' 
              : 'bg-slate-800 border-slate-700 text-emerald-400 text-sm font-bold'
          }`}>
            <Clock size={16} className={isTimeCritical ? 'text-rose-400 animate-spin' : 'text-emerald-400'} />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">Time Left</span>
              <span>{formatCountdown(remainingSeconds)}</span>
            </div>
          </div>

          {/* Progress Widget */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Answered</span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <div className="w-20 bg-slate-700 h-2 rounded overflow-hidden">
              <div
                className="bg-brand-orange h-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Fullscreen Restore Button */}
          {!isFullscreen && (
            <button
              onClick={handleReEnterFullscreen}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-mono font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Return to Fullscreen"
            >
              <Maximize2 size={14} className="text-brand-orange" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Questions Container (8 Cols) */}
        <div className="w-full lg:col-span-8 space-y-6 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
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
                    className={`bg-white border rounded-xl p-5 sm:p-6 transition-all duration-150 shadow-sm ${
                      isAnswered
                        ? 'border-brand-orange ring-1 ring-brand-orange/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Question Statement */}
                    <div className="flex items-start gap-3.5 mb-5">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
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
                            type="button"
                            onClick={() => handleSelectOption(q.id, key)}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer group ${
                              isSelected
                                ? 'bg-orange-50/70 border-brand-orange text-slate-900 ring-1 ring-brand-orange/20 font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 font-bold border transition-colors ${
                              isSelected
                                ? 'bg-brand-orange border-brand-orange text-white'
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                currentPage === 0
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
              Page {currentPage + 1} of {totalPages}
            </span>

            {currentPage < totalPages - 1 ? (
              <button
                onClick={handleNextPage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Next
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm animate-pulse"
              >
                Submit Exam
                <FileCheck size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Navigator & Real-time Stats (4 Cols) */}
        <div className="w-full lg:col-span-4 lg:sticky lg:top-24 order-1 lg:order-2">
          
          {/* Mobile Navigator Toggle */}
          <button 
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="w-full lg:hidden flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-xs font-bold font-mono text-slate-800 uppercase tracking-wider mb-4"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={14} className="text-brand-orange"/> Navigator ({answeredCount}/{totalQuestions})
            </span>
            <span className="bg-orange-50 text-brand-orange px-3 py-1 rounded border border-orange-200">
              {showMobileNav ? 'Hide' : 'Show'}
            </span>
          </button>

          <div className={`space-y-6 ${showMobileNav ? 'block' : 'hidden lg:block'}`}>
            
            {/* Question Navigator Grid */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <HelpCircle size={14} className="text-brand-orange" />
                  Question Grid
                </h3>
                <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                  {totalPages} Pages
                </span>
              </div>

              {/* Box grid */}
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-5">
                {questions.map((q, qIdx) => {
                  const isCurrentPage = Math.floor(qIdx / QUESTIONS_PER_PAGE) === currentPage;
                  const isAnswered = answers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestionPage(qIdx)}
                      className={`h-9 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer border ${
                        isAnswered
                          ? 'bg-brand-orange border-brand-orange text-white hover:bg-brand-orange-dark'
                          : isCurrentPage
                          ? 'bg-orange-50 border-brand-orange text-brand-orange'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                      }`}
                      title={`Go to Question ${qIdx + 1}`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange shrink-0" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-50 border border-slate-200 shrink-0" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm border border-brand-orange bg-orange-50 shrink-0" />
                  <span>Current</span>
                </div>
              </div>
            </div>

            {/* Quick Submit Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-800 font-bold uppercase font-mono tracking-wider">Ready to submit?</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1 mb-4 font-bold uppercase tracking-wide">
                {answeredCount} of {totalQuestions} answered
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-lg text-xs transition-all duration-200 cursor-pointer shadow-sm"
              >
                Submit Exam
              </button>
            </div>

            {/* Proctoring Warning Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldAlert size={14} className="text-brand-orange" />
                Active Safeguards
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Tab switching is recorded. Reaching 3 strikes results in immediate termination and submission.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Violation Alert Modal Overlay */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showViolationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle size={32} />
              </div>

              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                Malpractice Warning
              </span>
              <h2 className="text-xl font-display font-bold text-white mt-1 mb-3">
                Security Violation Detected
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {violationMessage}
              </p>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-6 text-xs font-mono flex items-center justify-between">
                <span className="text-slate-400">Total Strikes:</span>
                <span className="text-rose-400 font-bold text-sm">
                  {violationsCount} of {MAX_STRIKES} Strikes
                </span>
              </div>

              {violationsCount < MAX_STRIKES ? (
                <button
                  onClick={() => {
                    setShowViolationModal(false);
                    handleReEnterFullscreen();
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  I Understand • Resume Assessment
                </button>
              ) : (
                <div className="text-xs font-mono text-rose-400 font-bold animate-pulse">
                  Terminating session and submitting assessment...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* Final Confirmation Modal Overlay */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4 text-brand-orange">
                <AlertCircle size={24} />
                <h3 className="text-base font-display font-bold text-slate-900 uppercase tracking-wide">
                  Finish & Submit Assessment?
                </h3>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                <p>
                  You are about to submit your exam. Once submitted, you <strong className="text-slate-900">cannot retake</strong> this assessment.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase">Candidate:</span>
                    <span className="text-slate-800 font-bold truncate max-w-[180px]">{student.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase">Program:</span>
                    <span className="text-slate-800 font-bold capitalize">{student.course.replace('-', ' ')}</span>
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

              <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="sm:flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleFinalSubmit(false, "Candidate Confirmed Submission");
                  }}
                  className="sm:flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
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
