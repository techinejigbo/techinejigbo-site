/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Clock, FileText, LogOut, User } from 'lucide-react';
import { StudentInfo } from '../types';

interface HeaderProps {
  student: StudentInfo | null;
  timeSpentSeconds?: number;
  onExit?: () => void;
  isExamActive?: boolean;
}

export default function Header({ student, timeSpentSeconds, onExit, isExamActive }: HeaderProps) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand Logo styled precisely with Geometric Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center font-display font-bold text-lg tracking-tight select-none">
            <span className="bg-orange-600 text-white px-2.5 py-1 font-extrabold shadow-sm uppercase tracking-wide">
              Techin
            </span>
            <span className="bg-white text-orange-600 px-2.5 py-1 font-extrabold shadow-sm border-y border-r border-slate-200 uppercase tracking-wide">
              Ejigbo
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
            Examination Portal
          </span>
        </div>

        {/* Dynamic Context: Active Student or Stats */}
        {student ? (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-slate-700">
              <User size={14} className="text-orange-600" />
              <span className="font-medium max-w-[120px] sm:max-w-[200px] truncate text-xs uppercase font-mono tracking-wide">
                {student.fullName}
              </span>
              <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-600 px-2 py-0.5 rounded font-mono font-bold capitalize">
                {student.course === 'canva' ? 'Canva' : 'HTML'}
              </span>
            </div>

            {isExamActive && typeof timeSpentSeconds === 'number' && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-md text-orange-600 font-mono font-bold animate-pulse">
                <Clock size={15} />
                <span className="text-xs uppercase tracking-wider">{formatTime(timeSpentSeconds)}</span>
              </div>
            )}

            {onExit && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to exit the exam? Your progress will be lost.")) {
                    onExit();
                  }
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-1"
                title="Exit Portal"
              >
                <LogOut size={14} />
                <span className="hidden md:inline">Exit Portal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1 text-slate-600">
              <Award size={14} className="text-orange-600" />
              <span>Pass Score: 80%</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <FileText size={14} className="text-orange-600" />
              <span>50 Questions</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
