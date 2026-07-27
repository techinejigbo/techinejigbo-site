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
        useCORS: true,
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body * { visibility: hidden; }
          .print-card, .print-card * { visibility: visible; }
          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0 !important;
            padding: 2rem !important;
            box-shadow: none !important;
            transform: none !important;
            max-width: none !important;
          }
        }
        
        .print-card *:not([class*='border']) {
          border-color: rgba(0,0,0,0) !important;
          outline-color: rgba(0,0,0,0) !important;
        }
      ` }} />
      <div className="flex items-center justify-between mb-4 no-print px-1">
        <h2 className="text-sm font-mono font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Award className="text-orange-600 animate-spin" size={18} />
          Verified Certification Paper
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-none justify-center text-[11px] sm:text-[10px] text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 font-mono font-bold flex items-center gap-1.5 cursor-pointer px-4 py-2 sm:py-1.5 rounded uppercase tracking-wider shadow-sm"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-1 sm:p-4 rounded-lg overflow-x-auto shadow-sm">
        <div 
          id="printable-certificate"
          ref={certificateRef}
          className="print-card min-w-[720px] max-w-[960px] mx-auto bg-[#FDFCF7] text-[#18181B] p-8 sm:p-12 md:p-16 border-[12px] border-double border-[#C4953C] rounded-2xl relative shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] text-center font-sans select-none"
        >
          {/* Fancy watermark background */}
          <div className="absolute inset-4 border border-[#E4E4E7] pointer-events-none rounded" />
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
              <div className="flex items-stretch font-display font-bold text-xl tracking-tight leading-none">
                <div className="bg-[#E37300] text-[#FFFFFF] px-3 py-1.5 rounded-l font-black flex items-center justify-center">
                  Techin
                </div>
                <div className="bg-[#18181B] text-[#E37300] px-3 py-1.5 rounded-r font-black flex items-center justify-center">
                  Ejigbo
                </div>
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#A1A1AA] uppercase font-bold">
              Official Technical Competency Assessment
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#2D2311] mt-2 font-serif uppercase">
              Certificate of Completion
            </h2>
          </div>

          {/* Certificate Presentation Text */}
          <div className="space-y-4 max-w-xl mx-auto my-8">
            <p className="italic text-[#71717A] font-serif text-sm">
              This is proudly presented to
            </p>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-[#E37300] tracking-wide border-b-2 border-[#E4E4E7] pb-2 inline-block px-10 font-display uppercase">
              {studentName}
            </h3>

            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed max-w-lg mx-auto mt-4 font-sans">
              for outstanding academic achievement, successfully completing all assessment tasks and meeting requirements of the rigorous certification curriculum in
            </p>

            <p className="font-bold text-[#1E293B] text-lg uppercase tracking-wider mb-8">
              {course === 'graphic-design' ? 'Basic Graphic Design' : 'Basic Web Development'}
            </p>

            <p className="text-xs font-mono text-[#71717A]">
              with a verified score of <strong className="text-[#27272A]">{correctCount} of {totalQuestions} ({score}%)</strong>
              {elapsedSeconds > 0 && (
                <> completed in <strong className="text-[#27272A]">{formatTime(elapsedSeconds)}</strong></>
              )}
              .
            </p>
          </div>

          {/* Certificate Footer / Signatures & QR Code */}
          <div className="grid grid-cols-3 gap-4 items-end mt-12 pt-6 border-t border-[#F4F4F5] max-w-2xl mx-auto">
            {/* Instructor Sign */}
            <div className="text-center">
              <div className="font-serif italic text-base sm:text-lg text-[#3F3F46] h-8 flex items-center justify-center select-none font-semibold">
                AbdulMuiz Jimoh
              </div>
              <div className="w-full h-px bg-[#D4D4D8] my-1.5" />
              <p className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                Program Coordinator
              </p>
            </div>

            {/* Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-14 h-14 bg-[#C4953C] rounded-full flex items-center justify-center shadow-[0_4px_6px_-1px_rgba(196,149,60,0.45)] border-4 border-[#FDFCF7]">
                <ShieldCheck size={26} className="text-[#FFFFFF]" />
                <div className="absolute top-0 w-full text-[6px] text-[rgba(255,255,255,0.5)] text-center uppercase tracking-widest font-mono select-none">
                  ★ ★ ★
                </div>
              </div>
              <p className="text-[8px] font-mono font-bold text-[#A1A1AA] mt-2 uppercase tracking-widest">
                Verified Seal
              </p>
            </div>

            {/* Coordinator Sign */}
            <div className="text-center">
              <div className="font-serif italic text-base sm:text-lg text-[#3F3F46] h-8 flex items-center justify-center select-none font-semibold">
                {course === 'graphic-design' ? 'Ganiyat Faruq' : 'Jafar Lihameed'}
              </div>
              <div className="w-full h-px bg-[#D4D4D8] my-1.5" />
              <p className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                Lead Instructor
              </p>
            </div>
          </div>

          {/* Certificate Identification */}
          <div className="flex items-center justify-between mt-10 pt-4 border-t border-[#F4F4F5] text-[10px] font-mono text-[#A1A1AA]">
            <span>Date Issued: {formattedDate}</span>
            <span className="font-bold text-[#C4953C]">{certificateId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
