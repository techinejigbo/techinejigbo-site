"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { subscribeToClassRecordings, ClassRecording } from '@techinejigbo/firebase/src/firestore';
import { 
  Play, 
  Video, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  ExternalLink, 
  Search, 
  X, 
  BookOpen, 
  Sparkles,
  Maximize2,
  CheckCircle2,
  Film
} from 'lucide-react';

const parseVideoUrl = (url: string) => {
  if (!url) return { type: 'unknown', embedUrl: '', directUrl: '' };

  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('cloudinary');
  if (isDirect) {
    return { type: 'direct', embedUrl: '', directUrl: url };
  }

  // Google Drive
  const driveMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`,
      directUrl: ''
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`,
      directUrl: ''
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`,
      directUrl: ''
    };
  }

  return {
    type: 'embed',
    embedUrl: url,
    directUrl: ''
  };
};

export default function ClassRecordingsPage() {
  const { trainee } = useStudent();
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [activeRecording, setActiveRecording] = useState<ClassRecording | null>(null);

  const courseId = useMemo(() => {
    if (!trainee) return 'web-development';
    const rawCourse = trainee.course || trainee.program || 'web-development';
    return rawCourse.toLowerCase().replace(/\s+/g, '-');
  }, [trainee]);

  const courseName = useMemo(() => {
    if (!trainee) return 'Your Course';
    const raw = trainee.course || trainee.program || 'Web Development';
    return raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [trainee]);

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      const unsubscribe = subscribeToClassRecordings((data) => {
        setRecordings(data);
        setLoading(false);
      }, courseId);
      return () => unsubscribe();
    }
  }, [courseId]);

  // Extract unique weeks for filter tabs
  const availableWeeks = useMemo(() => {
    const weeks = new Set<string>();
    recordings.forEach(rec => {
      if (rec.week && rec.week.trim()) {
        weeks.add(rec.week.trim());
      }
    });
    return Array.from(weeks).sort();
  }, [recordings]);

  // Filter recordings by search and week
  const filteredRecordings = useMemo(() => {
    return recordings.filter(rec => {
      const matchesWeek = selectedWeek === 'all' || rec.week === selectedWeek;
      const matchesSearch = searchQuery.trim() === '' || 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.description && rec.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.instructor && rec.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.week && rec.week.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesWeek && matchesSearch;
    });
  }, [recordings, selectedWeek, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-brand-dark rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/20 border border-brand-orange/30 rounded-full text-brand-orange-light text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={13} />
              {courseName} Archive
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Class Recordings & Lecture Replays
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Review live lectures, recap coding sessions, and catch up on any missed classes at your own pace.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl text-center min-w-[110px]">
              <span className="block text-2xl font-bold font-display text-white">
                {recordings.length}
              </span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                Sessions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, lesson, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Week Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedWeek('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedWeek === 'all'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Classes ({recordings.length})
          </button>
          {availableWeeks.map(week => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedWeek === week
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {week}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recordings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
              <div className="aspect-video bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Film size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {searchQuery || selectedWeek !== 'all' ? 'No matching recordings' : 'No class recordings yet'}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchQuery || selectedWeek !== 'all'
              ? 'Try resetting your search filters to see all available lectures.'
              : 'Class recordings for your track will be published here once online classes commence.'}
          </p>
          {(searchQuery || selectedWeek !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedWeek('all'); }}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((rec) => {
            const formattedDate = rec.classDate
              ? new Date(rec.classDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : new Date(rec.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Video Card Thumbnail Header */}
                <div 
                  onClick={() => setActiveRecording(rec)}
                  className="aspect-video bg-slate-900 relative cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {rec.thumbnailUrl ? (
                    <img 
                      src={rec.thumbnailUrl} 
                      alt={rec.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                      <Film size={36} className="text-slate-600 mb-2" />
                      <span className="text-xs text-slate-400 font-semibold">{rec.title}</span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play size={22} className="fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {rec.week && (
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                        {rec.week}
                      </span>
                    )}
                    {rec.lessonNumber && (
                      <span className="bg-brand-orange text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        Lesson {rec.lessonNumber}
                      </span>
                    )}
                  </div>

                  {rec.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={11} /> {rec.duration}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {formattedDate}
                      </span>
                      {rec.instructor && (
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-slate-400" />
                          {rec.instructor}
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => setActiveRecording(rec)}
                      className="font-display font-bold text-slate-900 text-base line-clamp-2 hover:text-brand-orange cursor-pointer transition-colors"
                      title={rec.title}
                    >
                      {rec.title}
                    </h3>

                    {rec.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {rec.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer / Resources */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {rec.attachmentLink ? (
                      <a
                        href={rec.attachmentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-orange-dark hover:underline"
                      >
                        <FileText size={14} />
                        {rec.attachmentTitle || 'Class Slides & Notes'}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">Class Session</span>
                    )}

                    <button
                      onClick={() => setActiveRecording(rec)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-brand-orange hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Play size={12} className="fill-current" /> Watch
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Watch Class Recording Lightbox / Modal */}
      {activeRecording && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/80 border-b border-white/10 flex items-center justify-between gap-4 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-brand-orange-light font-semibold mb-0.5">
                  {activeRecording.week && <span>{activeRecording.week}</span>}
                  {activeRecording.lessonNumber && <span>• Lesson {activeRecording.lessonNumber}</span>}
                  {activeRecording.instructor && <span>• Instructor: {activeRecording.instructor}</span>}
                </div>
                <h2 className="text-base sm:text-lg font-bold font-display truncate">
                  {activeRecording.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveRecording(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative bg-black flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[480px]">
              {(() => {
                const parsed = parseVideoUrl(activeRecording.videoUrl);
                if (parsed.type === 'direct') {
                  return (
                    <video
                      controls
                      autoPlay
                      playsInline
                      poster={activeRecording.thumbnailUrl}
                      className="w-full h-full max-h-[70vh] object-contain"
                    >
                      <source src={parsed.directUrl} type="video/mp4" />
                      Your browser does not support HTML5 video playback.
                    </video>
                  );
                } else if (parsed.type === 'drive') {
                  return (
                    <div className="relative w-full h-[65vh] overflow-hidden bg-black flex items-center justify-center">
                      <div className="absolute inset-0 top-[-52px] bottom-[-10px] w-full h-[calc(100%+62px)]">
                        <iframe
                          src={parsed.embedUrl}
                          className="w-full h-full border-0"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                          title={activeRecording.title}
                        />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      className="w-full h-[65vh] border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={activeRecording.title}
                    />
                  );
                }
              })()}
            </div>

            {/* Modal Footer / Description & Resources */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-white/10 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-1">
                {activeRecording.description ? (
                  <p className="line-clamp-2 text-slate-300">{activeRecording.description}</p>
                ) : (
                  <p className="text-slate-500">No additional lesson notes provided for this session.</p>
                )}
              </div>

              {activeRecording.attachmentLink && (
                <a
                  href={activeRecording.attachmentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl text-xs font-semibold flex items-center gap-2 flex-shrink-0 transition-colors shadow-sm"
                >
                  <FileText size={15} />
                  {activeRecording.attachmentTitle || 'Open Class Resources'}
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
