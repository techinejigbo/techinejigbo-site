"use client";

import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, Search, X } from 'lucide-react';
import { CertificateRecord, subscribeToCertificates, updateCertificateStatus, getTraineeData, TraineeData } from '@techinejigbo/firebase/src/firestore';
import CertificateCard from '../../../components/CertificateCard';
import toast from 'react-hot-toast';

interface CertificateWithTrainee extends CertificateRecord {
  traineeName: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithTrainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [selectedCert, setSelectedCert] = useState<CertificateWithTrainee | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCertificates(async (certs) => {
      // Fetch trainee names for each cert
      const certsWithNames = await Promise.all(
        certs.map(async (cert) => {
          try {
            const trainee = await getTraineeData(cert.traineeId);
            return {
              ...cert,
              traineeName: trainee ? `${trainee.firstName} ${trainee.lastName}` : 'Unknown Trainee'
            };
          } catch (e) {
            return {
              ...cert,
              traineeName: 'Unknown Trainee'
            };
          }
        })
      );
      setCertificates(certsWithNames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (certId: string) => {
    setIsApproving(true);
    try {
      await updateCertificateStatus(certId, 'approved');
      toast.success('Certificate approved successfully');
      setSelectedCert(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve certificate');
    } finally {
      setIsApproving(false);
    }
  };

  const filteredCerts = certificates.filter(c => 
    c.traineeName.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Certificates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and approve trainee certificates</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Trainee</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading certificates...</td>
                </tr>
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No certificates found.</td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {cert.traineeName}
                      <div className="text-xs text-slate-500 font-normal font-mono mt-1">{cert.certificateId}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{cert.course.replace('-', ' ')}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {cert.score}%
                    </td>
                    <td className="px-6 py-4">
                      {cert.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle size={12} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="text-brand-orange hover:text-brand-orange-dark font-semibold text-sm"
                      >
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Certificate Review</h3>
                <p className="text-sm text-slate-500">Simulate and approve the generated certificate for {selectedCert.traineeName}</p>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              <CertificateCard
                studentName={selectedCert.traineeName}
                course={selectedCert.course}
                score={selectedCert.score}
                correctCount={selectedCert.correctCount}
                totalQuestions={selectedCert.totalQuestions}
                elapsedSeconds={selectedCert.elapsedSeconds}
                formattedDate={new Date(selectedCert.issueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                certificateId={selectedCert.certificateId}
              />
            </div>
            
            <div className="p-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-sm">
                Status: {selectedCert.status === 'approved' ? (
                  <strong className="text-emerald-600">Approved</strong>
                ) : (
                  <strong className="text-amber-600">Pending Approval</strong>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedCert.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(selectedCert.id!)}
                    disabled={isApproving}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isApproving ? 'Approving...' : (
                      <>
                        <CheckCircle size={16} />
                        Approve Certificate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
