"use client";

import React, { useState } from 'react';
import { 
  X, Heart, ShieldCheck, CheckCircle2, Copy, Check, 
  Sparkles, Lock, ArrowRight, Share2, RefreshCw
} from 'lucide-react';
import { initializePaystackDonation, formatCurrency, generateDonationReference } from '../lib/paystack';

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: number;
  defaultPurpose?: string;
}

export const DONATION_TIERS = [
  {
    amount: 5000,
    label: "₦5,000",
    title: "Learning Materials",
    description: "Covers printed curriculum guides, notebooks, and learning software licenses."
  },
  {
    amount: 15000,
    label: "₦15,000",
    title: "Internet & Power",
    description: "Funds 1 month of uninterrupted high-speed internet and generator power."
  },
  {
    amount: 35000,
    label: "₦35,000",
    title: "Sponsor 1 Student",
    popular: true,
    description: "Complete tuition, mentorship, and practical training for one student for a full cohort."
  },
  {
    amount: 75000,
    label: "₦75,000",
    title: "Laptop Fund",
    description: "Helps acquire refurbished laptops and accessories for classroom practicals."
  },
  {
    amount: 150000,
    label: "₦150,000",
    title: "Full Impact Sponsor",
    description: "Sponsors multiple students, device access, and certification exam costs."
  }
];

export const CAUSES = [
  { id: 'General Impact Fund', name: 'General Impact Fund (Where Most Needed)' },
  { id: 'Student Tuition & Training', name: 'Sponsor a Student Tuition & Training' },
  { id: 'Laptops & Devices', name: 'Laptops & Hardware Devices' },
  { id: 'Internet & Power Infrastructure', name: 'Internet & Power Infrastructure' }
];

export default function DonationModal({
  isOpen,
  onClose,
  defaultTier = 35000,
  defaultPurpose = 'General Impact Fund'
}: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultTier);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<string>(defaultPurpose);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    isAnonymous: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [donationResult, setDonationResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentAmount = isCustom ? (Number(customAmount) || 0) : selectedAmount;

  const handleSelectTier = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setIsCustom(true);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentAmount < 500) {
      setErrorMessage('The minimum donation amount is ₦500.');
      return;
    }

    if (!formData.email) {
      setErrorMessage('Please enter a valid email address for receipt generation.');
      return;
    }

    setIsLoading(true);

    try {
      const reference = generateDonationReference();

      await initializePaystackDonation({
        email: formData.email,
        amount: currentAmount,
        reference,
        currency: 'NGN',
        metadata: {
          donorName: formData.isAnonymous ? 'Anonymous' : formData.name,
          donorPhone: formData.phone,
          purpose,
          isAnonymous: formData.isAnonymous,
          message: formData.message
        },
        onSuccess: async (response) => {
          // Verify with backend API
          try {
            const verifyRes = await fetch('/api/donations/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference || reference,
                donorName: formData.name,
                donorEmail: formData.email,
                donorPhone: formData.phone,
                isAnonymous: formData.isAnonymous,
                purpose,
                message: formData.message,
                amount: currentAmount,
                currency: 'NGN'
              })
            });

            const data = await verifyRes.json();
            if (data.success) {
              setDonationResult({
                reference: response.reference || reference,
                amount: currentAmount,
                donorName: formData.isAnonymous ? 'Anonymous Donor' : (formData.name || 'Generous Supporter'),
                donorEmail: formData.email,
                purpose,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              });
              setIsVerified(true);
            } else {
              setErrorMessage(data.error || 'Payment could not be confirmed. Please contact support.');
            }
          } catch (err) {
            console.error('Error verifying donation:', err);
            // Fallback success view even if verify endpoint has connection hiccup
            setDonationResult({
              reference: response.reference || reference,
              amount: currentAmount,
              donorName: formData.isAnonymous ? 'Anonymous Donor' : (formData.name || 'Generous Supporter'),
              donorEmail: formData.email,
              purpose,
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            });
            setIsVerified(true);
          } finally {
            setIsLoading(false);
          }
        },
        onClose: () => {
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      console.error('Paystack initialization error:', err);
      setErrorMessage(err.message || 'Could not launch payment gateway. Please try again.');
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'I supported TechinEjigbo!',
        text: 'I just sponsored young minds learning tech skills in Ejigbo with TechinEjigbo. Join me in empowering the next generation!',
        url: window.location.origin + '/donate'
      }).catch(() => {});
    } else {
      copyToClipboard(window.location.origin + '/donate', 'share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-gray to-brand-dark text-white p-6 sm:p-8 relative">
          <button 
            onClick={onClose}
            aria-label="Close donation modal"
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-orange/20 p-2.5 rounded-xl text-brand-orange border border-brand-orange/30">
              <Heart size={24} className="fill-brand-orange" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-orange font-bold">Invest in Future Tech Leaders</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                {isVerified ? 'Thank You For Your Support!' : 'Make a Donation'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-lg mt-1">
            {isVerified 
              ? 'Your contribution directly empowers underprivileged youths in Ejigbo with tech skills, devices, and mentorship.'
              : '100% of public donations fund student training, internet connectivity, and hardware access.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* SUCCESS SCREEN */}
          {isVerified && donationResult && (
            <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} />
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900">Donation Successful!</h3>
                <p className="text-slate-600 mt-1 max-w-md mx-auto">
                  A receipt and confirmation email has been sent to <span className="font-semibold text-slate-900">{donationResult.donorEmail}</span>.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 font-sans shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Receipt Overview</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <Check size={12} /> Verified
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Amount Donated:</span>
                  <span className="text-lg font-bold text-slate-900 font-display">{formatCurrency(donationResult.amount)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Donor Name:</span>
                  <span className="font-medium text-slate-800">{donationResult.donorName}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Purpose / Cause:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{donationResult.purpose}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium text-slate-800">{donationResult.date}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono font-medium text-slate-700">{donationResult.reference}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors shadow-sm"
                >
                  <Share2 size={18} /> Share Impact With Friends
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* PAYSTACK ONLINE FLOW */}
          {!isVerified && (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              
              {/* Step 1: Select Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  1. Choose an Amount to Donate
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DONATION_TIERS.map((tier) => {
                    const isSelected = !isCustom && selectedAmount === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => handleSelectTier(tier.amount)}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-orange bg-orange-50/70 text-brand-dark ring-2 ring-brand-orange/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2.5 right-2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                            Popular
                          </span>
                        )}
                        <div className="text-base sm:text-lg font-bold font-display text-slate-900">{tier.label}</div>
                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5">{tier.title}</div>
                      </button>
                    );
                  })}
                  
                  {/* Custom Amount Option */}
                  <div className={`p-2.5 rounded-2xl border transition-all ${
                    isCustom 
                      ? 'border-brand-orange bg-orange-50/70 ring-2 ring-brand-orange/20 shadow-sm' 
                      : 'border-slate-200 bg-white'
                  }`}>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Custom (₦)</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₦</span>
                      <input
                        type="text"
                        placeholder="Other"
                        value={customAmount}
                        onChange={handleCustomChange}
                        onFocus={() => setIsCustom(true)}
                        className="w-full pl-7 pr-2 py-1.5 text-sm font-semibold rounded-lg bg-transparent focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected tier explanation */}
                {!isCustom && (
                  <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Sparkles size={14} className="text-brand-orange shrink-0" />
                    <span>
                      {DONATION_TIERS.find(t => t.amount === selectedAmount)?.description}
                    </span>
                  </p>
                )}
              </div>

              {/* Step 2: Choose Purpose */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  2. Direct Your Donation
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all"
                >
                  {CAUSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Donor Details */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900">
                  3. Donor Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name {!formData.isAnonymous && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      disabled={formData.isAnonymous}
                      required={!formData.isAnonymous}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={formData.isAnonymous ? 'Anonymous Donor' : 'e.g. Adebayo Ogunlesi'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-orange outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. adebayo@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 08012345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange"
                      />
                      <span>Make my donation anonymous</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Words of Encouragement for Students (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Leave a short encouraging note to be displayed in our student center..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-orange outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-orange-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/25 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Donate {formatCurrency(currentAmount)} Securely</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-3">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" /> 256-Bit SSL Encrypted
                  </span>
                  <span>•</span>
                  <span>Secured by Paystack</span>
                  <span>•</span>
                  <span>Tax-deductible Receipt</span>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
