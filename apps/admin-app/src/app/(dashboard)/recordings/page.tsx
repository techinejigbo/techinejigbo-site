"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  subscribeToClassRecordings, 
  saveClassRecording, 
  deleteClassRecording, 
  getAllCoursesFromQuestions, 
  ClassRecording,
  uploadVideoToCloudinary
} from '@techinejigbo/firebase';
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  ExternalLink, 
  Search, 
  X, 
  Loader2, 
  Play, 
  UploadCloud, 
  Film, 
  Link as LinkIcon, 
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const parseVideoUrl = (url: string) => {
  if (!url) return { type: 'unknown', embedUrl: '', directUrl: '', thumbnailUrl: '' };

  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('cloudinary');
  if (isDirect) {
    return { type: 'direct', embedUrl: '', directUrl: url, thumbnailUrl: '' };
  }

  // Google Drive
  const driveMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`,
      directUrl: '',
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`,
      directUrl: '',
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`,
      directUrl: '',
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
    };
  }

  return {
    type: 'embed',
    embedUrl: url,
    directUrl: '',
    thumbnailUrl: '',
  };
};

export default function AdminRecordingsPage() {
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState('web-development');
  const [allCourses, setAllCourses] = useState<string[]>(['web-development', 'graphic-design']);
  
  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('web-development');
  const [week, setWeek] = useState('Week 1');
  const [lessonNumber, setLessonNumber] = useState<string>('1');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState('1h 30m');
  const [description, setDescription] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const [attachmentTitle, setAttachmentTitle] = useState('');
  
  // Video Source state
  const [videoSourceMode, setVideoSourceMode] = useState<'link' | 'upload'>('link');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [customCoverPreview, setCustomCoverPreview] = useState<string>('');
  
  // Upload status
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Preview modal
  const [previewRecording, setPreviewRecording] = useState<ClassRecording | null>(null);

  const isCloudinaryConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    async function init() {
      setLoading(true);
      try {
        const courses = await getAllCoursesFromQuestions();
        if (courses.length > 0) {
          setAllCourses(courses);
          if (!courses.includes(activeCourse)) {
            setActiveCourse(courses[0]);
            setCourse(courses[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }

      const unsub = subscribeToClassRecordings((data) => {
        setRecordings(data);
        setLoading(false);
      });
      unsubs.push(unsub);
    }

    init();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setCourse(activeCourse);
    setWeek('Week 1');
    setLessonNumber('1');
    setClassDate(new Date().toISOString().split('T')[0]);
    setInstructor('');
    setDuration('1h 30m');
    setDescription('');
    setAttachmentLink('');
    setAttachmentTitle('');
    setVideoSourceMode('link');
    setVideoUrlInput('');
    setSelectedVideoFile(null);
    setCustomCoverFile(null);
    setCustomCoverPreview('');
    setUploadProgress(0);
    setStatusMessage('');
  };

  const handleEdit = (rec: ClassRecording) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setCourse(rec.course);
    setWeek(rec.week || 'Week 1');
    setLessonNumber(rec.lessonNumber?.toString() || '1');
    setClassDate(rec.classDate || new Date().toISOString().split('T')[0]);
    setInstructor(rec.instructor || '');
    setDuration(rec.duration || '1h 30m');
    setDescription(rec.description || '');
    setAttachmentLink(rec.attachmentLink || '');
    setAttachmentTitle(rec.attachmentTitle || '');
    setVideoSourceMode('link');
    setVideoUrlInput(rec.videoUrl || '');
    setCustomCoverPreview(rec.thumbnailUrl || '');
    setShowForm(true);
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
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a session title.');
      return;
    }

    if (videoSourceMode === 'link' && !videoUrlInput.trim()) {
      toast.error('Please provide a video URL.');
      return;
    }

    if (videoSourceMode === 'upload' && !selectedVideoFile && !editingId) {
      toast.error('Please select an MP4 video file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      let finalVideoUrl = videoUrlInput.trim();
      let finalThumbnailUrl = customCoverPreview || '';

      if (customCoverFile) {
        setStatusMessage('Optimizing cover image...');
        finalThumbnailUrl = await compressImage(customCoverFile);
      }

      if (videoSourceMode === 'upload' && selectedVideoFile) {
        setStatusMessage('Uploading video to Cloudinary...');
        const result = await uploadVideoToCloudinary(selectedVideoFile, (progress) => {
          setUploadProgress(progress);
          setStatusMessage(`Uploading video (${progress}%)...`);
        });

        finalVideoUrl = result.secureUrl;
        if (!finalThumbnailUrl && result.thumbnailUrl) {
          finalThumbnailUrl = result.thumbnailUrl;
        }
      } else if (videoSourceMode === 'link') {
        const parsed = parseVideoUrl(finalVideoUrl);
        if (!finalThumbnailUrl && parsed.thumbnailUrl) {
          finalThumbnailUrl = parsed.thumbnailUrl;
        }
        if (parsed.embedUrl) {
          finalVideoUrl = parsed.embedUrl;
        }
      }

      const payload: Partial<ClassRecording> = {
        id: editingId || undefined,
        title: title.trim(),
        course,
        week: week.trim(),
        lessonNumber: lessonNumber ? parseInt(lessonNumber, 10) : undefined,
        classDate,
        instructor: instructor.trim(),
        duration: duration.trim(),
        description: description.trim(),
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        attachmentLink: attachmentLink.trim() || undefined,
        attachmentTitle: attachmentTitle.trim() || undefined,
      };

      setStatusMessage('Saving class recording...');
      await saveClassRecording(payload);

      toast.success(editingId ? 'Recording updated!' : 'Class recording published!');
      resetForm();
    } catch (err: any) {
      console.error('Error saving recording:', err);
      toast.error(err.message || 'Failed to save recording.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  const handleDelete = async (id: string, recTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${recTitle}"?`)) {
      try {
        await deleteClassRecording(id);
        toast.success('Recording deleted.');
      } catch (err) {
        toast.error('Failed to delete recording.');
      }
    }
  };

  const currentCourseRecordings = useMemo(() => {
    return recordings.filter(r => r.course === activeCourse);
  }, [recordings, activeCourse]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Video className="text-brand-orange" size={26} />
            Class Recordings Manager
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage online lecture replays, live workshop recordings, and session resources for students.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else {
              resetForm();
              setCourse(activeCourse);
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm self-start sm:self-center text-sm"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add New Recording'}
        </button>
      </div>

      {/* Course Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {allCourses.map(c => {
          const count = recordings.filter(r => r.course === c).length;
          const label = c.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
          const isActive = activeCourse === c;

          return (
            <button
              key={c}
              onClick={() => {
                setActiveCourse(c);
                if (showForm) setCourse(c);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add / Edit Recording Form */}
      {showForm && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Film className="text-brand-orange" size={20} />
              {editingId ? 'Edit Class Recording' : 'Publish New Class Recording'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            
            {/* Title & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to CSS Grid & Responsive Design"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Target Course Track *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none capitalize"
                >
                  {allCourses.map(c => (
                    <option key={c} value={c}>
                      {c.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Week, Lesson Number, Date, Instructor */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Week / Module
                </label>
                <input
                  type="text"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  placeholder="e.g. Week 2"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Lesson #
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(e.target.value)}
                  placeholder="1"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Class Date
                </label>
                <input
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Duration (approx)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 1h 45m"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Instructor / Facilitator Name (Optional)
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Mr. Oluwaseun"
                className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
              />
            </div>

            {/* Video Source Selection */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Video Playback Source *
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVideoSourceMode('link')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    videoSourceMode === 'link'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LinkIcon size={14} className="text-brand-orange" />
                  Video Link (YouTube / Drive / Vimeo)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceMode('upload')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    videoSourceMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UploadCloud size={14} className="text-brand-orange" />
                  Upload MP4 Video (Free Cloudinary)
                </button>
              </div>

              {videoSourceMode === 'link' ? (
                <div>
                  <input
                    type="url"
                    required={videoSourceMode === 'link'}
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://youtu.be/... or Google Drive / Vimeo preview link"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports YouTube Unlisted videos, Google Drive links (make sure permission is set to "Anyone with link"), or Vimeo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-brand-orange/40 rounded-xl cursor-pointer bg-orange-50/40 hover:bg-orange-50/70 transition-colors">
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <Film className="w-6 h-6 mb-1 text-brand-orange" />
                      <span className="text-xs font-semibold text-slate-700">
                        {selectedVideoFile ? selectedVideoFile.name : 'Select MP4 / WebM recording'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Direct cloud stream via Cloudinary</span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/mp4,video/webm,video/*" 
                      onChange={(e) => e.target.files && setSelectedVideoFile(e.target.files[0])} 
                    />
                  </label>
                </div>
              )}

              {/* Custom Cover Preview / Upload */}
              <div className="pt-2 flex items-center gap-4 flex-wrap">
                {customCoverPreview && (
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden border border-slate-300">
                    <img src={customCoverPreview} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Custom Thumbnail / Poster (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCustomCoverFile(e.target.files[0]);
                        compressImage(e.target.files[0]).then(setCustomCoverPreview);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-orange/10 file:text-brand-orange cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Description / Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Session Summary & Topics Covered
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key concepts discussed in this class, timestamps, or instructions for trainees..."
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none resize-none"
              />
            </div>

            {/* Resources / Slides Attachment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Attachment Link (Slides / GitHub / Drive)
                </label>
                <input
                  type="url"
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  placeholder="https://github.com/... or Google Slides URL"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Attachment Title
                </label>
                <input
                  type="text"
                  value={attachmentTitle}
                  onChange={(e) => setAttachmentTitle(e.target.value)}
                  placeholder="e.g. Lesson 2 Slides (PDF)"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                />
              </div>
            </div>

            {/* Progress Status */}
            {uploading && (
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-orange" />
                    {statusMessage || 'Publishing class recording...'}
                  </span>
                  {uploadProgress > 0 && <span>{uploadProgress}%</span>}
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-orange h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-brand-dark text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70 text-sm shadow-md"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {uploading ? (statusMessage || 'Saving...') : editingId ? 'Update Recording' : 'Publish Recording'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Published Recordings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">
            Published Sessions ({currentCourseRecordings.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-brand-orange" size={28} />
          </div>
        ) : currentCourseRecordings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 border-dashed">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No recordings published for {activeCourse.replace(/-/g, ' ')}.</p>
            <p className="text-slate-400 text-xs mt-1">Click "Add New Recording" above to post your first lecture replay.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourseRecordings.map((rec) => {
              const parsed = parseVideoUrl(rec.videoUrl);
              const thumb = rec.thumbnailUrl || parsed.thumbnailUrl;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Thumbnail / Header */}
                  <div 
                    onClick={() => setPreviewRecording(rec)}
                    className="aspect-video bg-slate-900 relative cursor-pointer overflow-hidden flex items-center justify-center group"
                  >
                    {thumb ? (
                      <img src={thumb} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Video size={36} className="text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={18} className="fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {rec.week && (
                        <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {rec.week}
                        </span>
                      )}
                      {rec.lessonNumber && (
                        <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Lesson {rec.lessonNumber}
                        </span>
                      )}
                    </div>

                    {rec.duration && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                        {rec.duration}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {rec.classDate || new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                        {rec.instructor && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {rec.instructor}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 line-clamp-2 text-sm hover:text-brand-orange cursor-pointer" onClick={() => setPreviewRecording(rec)}>
                        {rec.title}
                      </h4>

                      {rec.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {rec.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      {rec.attachmentLink ? (
                        <a
                          href={rec.attachmentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-orange flex items-center gap-1 hover:underline"
                        >
                          <FileText size={13} />
                          Resource Link
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No attachments</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Recording"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id, rec.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Recording"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewRecording && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden border border-white/10 text-white flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-orange-light font-semibold">
                  {previewRecording.week} • Lesson {previewRecording.lessonNumber}
                </span>
                <h3 className="font-bold text-base">{previewRecording.title}</h3>
              </div>
              <button onClick={() => setPreviewRecording(null)} className="p-1 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="bg-black flex-1 min-h-[350px] flex items-center justify-center">
              {(() => {
                const parsed = parseVideoUrl(previewRecording.videoUrl);
                if (parsed.type === 'direct') {
                  return (
                    <video controls autoPlay className="w-full max-h-[60vh]">
                      <source src={parsed.directUrl} type="video/mp4" />
                    </video>
                  );
                } else {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      className="w-full h-[55vh] border-0"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
