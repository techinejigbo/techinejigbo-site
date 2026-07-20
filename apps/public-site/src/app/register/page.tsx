"use client";

import React, { useState, useRef } from 'react';
import { Camera, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { registerUserWithEmail, registerTrainee, TraineeData } from '@techinejigbo/firebase';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    school: '',
    traineeClass: '',
    program: 'Web Development'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to keep it well under 1MB
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await compressImage(file);
        setPhotoPreview(compressedBase64);
        setPhotoBase64(compressedBase64);
      } catch (err) {
        console.error("Error compressing image:", err);
        setErrorMsg("Failed to process image. Please try another one.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!photoBase64) {
      setErrorMsg("Please upload a passport photograph.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User & Send Verification Email
      const user = await registerUserWithEmail(formData.email, formData.password);
      
      // 2. Save Trainee Data to Firestore
      // Map the program display name to the course ID
      let courseId = 'web-development';
      if (formData.program === 'graphic-design' || formData.program === 'Graphic Design') courseId = 'graphic-design';

      const traineeData: TraineeData = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        school: formData.school,
        traineeClass: formData.traineeClass,
        program: courseId as any,
        course: courseId as any,
        passportPhotoBase64: photoBase64,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await registerTrainee(traineeData);
      
      setSuccess(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg("This email is already registered. Please log in instead.");
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg("Password should be at least 6 characters.");
      } else {
        setErrorMsg(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-bold font-display text-slate-900 mb-4">Registration Successful!</h1>
            <p className="text-lg text-slate-600 mb-8">
              Welcome to TechinEjigbo, {formData.firstName}! We've sent a verification email to <span className="font-semibold">{formData.email}</span>.
            </p>
            <div className="bg-orange-50 p-6 rounded-xl text-left w-full mb-8 border border-orange-100">
              <h3 className="font-bold text-brand-dark mb-2">Next Steps:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                <li>Check your inbox (and spam folder) for the verification email.</li>
                <li>Click the link in the email to verify your account.</li>
                <li>You can use this email and password to log into the Exam Portal later.</li>
              </ol>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-orange-dark transition-all">
              Return to Home <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold font-display text-slate-900 mb-4">Trainee Registration</h1>
          <p className="text-lg text-slate-600">Join the next TechinEjigbo cohort and kickstart your tech journey.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details */}
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-4 pb-2 border-b border-slate-100">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="08012345678" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password <span className="text-slate-400 font-normal">(Needed for exam portal later)</span></label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} minLength={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="Create a secure password" />
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-4 pb-2 border-b border-slate-100">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">School</label>
                  <input type="text" name="school" required value={formData.school} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="e.g., Sevenstar Academy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                  <input type="text" name="traineeClass" required value={formData.traineeClass} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" placeholder="e.g., SS2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Program</label>
                  <select name="program" required value={formData.program} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange bg-white">
                    <option value="web-development">Web Development</option>
                    <option value="graphic-design">Graphic Design</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-4 pb-2 border-b border-slate-100">Passport Photograph</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div 
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                        Change
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <Camera size={32} className="mb-2" />
                      <span className="text-xs font-medium">Upload Photo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm text-slate-600">
                  <p className="mb-2">Please upload a clear passport-sized photograph of yourself. This will be used on your student ID and exam portal profile.</p>
                  <p className="text-xs text-slate-400">Accepted formats: JPG, PNG. Image will be automatically compressed to save space.</p>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Select Image
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-orange-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" /> Processing Registration...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
