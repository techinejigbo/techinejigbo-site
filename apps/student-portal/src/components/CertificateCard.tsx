"use client";

import React, { useRef, useState } from 'react';
import { Award, ShieldCheck, Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateCardProps {
  studentName: string;
  course: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  elapsedSeconds: number;
  formattedDate: string;
  certificateId: string;
}

export default function CertificateCard({
  studentName,
  course,
  score,
  correctCount,
  totalQuestions,
  elapsedSeconds,
  formattedDate,
  certificateId
}: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#FDFCF7',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaled height to maintain aspect ratio
      const imgRatio = canvas.height / canvas.width;
      let printWidth = pdfWidth;
      let printHeight = pdfWidth * imgRatio;
      
      // If the scaled height exceeds the page height, scale by height instead
      if (printHeight > pdfHeight) {
        printHeight = pdfHeight;
        printWidth = pdfHeight / imgRatio;
      }
      
      // Center the image on the page
      const x = (pdfWidth - printWidth) / 2;
      const y = (pdfHeight - printHeight) / 2;
      
      pdf.addImage(imgData, 'JPEG', x, y, printWidth, printHeight);
      pdf.save(`Certificate_${studentName.replace(/\s+/g, '_')}_${course}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try printing instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 no-print px-1">
        <h2 className="text-sm font-mono font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Award className="text-orange-600 animate-spin" size={18} />
          Verified Certification Paper
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-[10px] text-white hover:bg-orange-700 bg-orange-600 font-mono font-bold flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="text-[10px] text-orange-600 hover:text-orange-700 font-mono font-bold flex items-center gap-1 cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded uppercase tracking-wider"
          >
            <Printer size={12} />
            Print Version
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-1 sm:p-4 rounded-lg overflow-x-auto shadow-sm">
        <div 
          id="printable-certificate"
          ref={certificateRef}
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
            
            <h3 className="text-2xl sm:text-3xl font-bold text-[#E37300] tracking-wide border-b-2 border-zinc-200 pb-2 inline-block px-10 font-display uppercase">
              {studentName}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-lg mx-auto mt-4 font-sans">
              for outstanding academic achievement, successfully completing all assessment tasks and meeting requirements of the rigorous certification curriculum in
            </p>

            <p className="font-bold text-slate-800 text-lg uppercase tracking-wider mb-8">
              {course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}
            </p>

            <p className="text-xs font-mono text-zinc-500">
              with a verified score of <strong className="text-zinc-800">{correctCount} of {totalQuestions} ({score}%)</strong> completed in <strong className="text-zinc-800">{formatTime(elapsedSeconds)}</strong>.
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

            {/* Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-14 h-14 bg-[#C4953C] rounded-full flex items-center justify-center shadow shadow-[#C4953C]/45 border-4 border-[#FDFCF7]">
                <ShieldCheck size={26} className="text-white" />
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
  );
}
