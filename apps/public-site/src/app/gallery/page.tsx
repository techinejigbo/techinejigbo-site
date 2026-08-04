"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Code, PenTool, LayoutGrid, Loader2, X, Play, Video, ExternalLink } from 'lucide-react';
import { GalleryItem, subscribeToGalleryItems } from '@techinejigbo/firebase/src/firestore';

export type VideoType = 'gdrive' | 'youtube' | 'vimeo' | 'direct' | 'generic';

export interface VideoMetadata {
  type: VideoType;
  embedUrl: string;
  thumbnailUrl: string;
  directUrl?: string;
  rawUrl: string;
}

export const getVideoMetadata = (url?: string, customImage?: string): VideoMetadata => {
  if (!url) {
    return {
      type: 'generic',
      embedUrl: '',
      thumbnailUrl: customImage || '',
      rawUrl: '',
    };
  }

  // Google Drive
  const driveMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`,
      directUrl: `https://drive.google.com/file/d/${fileId}/view`,
      thumbnailUrl: customImage || `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      rawUrl: url,
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&modestbranding=1&rel=0&controls=1`,
      directUrl: `https://youtu.be/${ytId}`,
      thumbnailUrl: customImage || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      rawUrl: url,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1&controls=1`,
      directUrl: `https://vimeo.com/${vimeoId}`,
      thumbnailUrl: customImage || `https://vumbnail.com/${vimeoId}.jpg`,
      rawUrl: url,
    };
  }

  // Direct MP4 / WebM / Firebase Storage / Cloudinary URL
  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('firebasestorage') || url.includes('cloudinary');
  if (isDirect) {
    return {
      type: 'direct',
      embedUrl: url,
      directUrl: url,
      thumbnailUrl: customImage || '',
      rawUrl: url,
    };
  }

  const separator = url.includes('?') ? '&' : '?';
  return {
    type: 'generic',
    embedUrl: `${url}${separator}autoplay=1`,
    directUrl: url,
    thumbnailUrl: customImage || '',
    rawUrl: url,
  };
};

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'design' | 'web'>('all');

  const tabs = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'media', label: 'General Media', icon: Camera },
    { id: 'design', label: 'Graphic Design', icon: PenTool },
    { id: 'web', label: 'Web Development', icon: Code },
  ] as const;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);

  const selectedVideoMeta = selectedItem?.mediaType === 'video' 
    ? getVideoMetadata(selectedItem.videoUrl, selectedItem.imageUrl) 
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-brand-dark text-white py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Our Gallery</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A visual showcase of our students' incredible projects, classroom moments, and the vibrant TechinEjigbo community.
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-8 sm:mb-12 justify-start sm:justify-center gap-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto p-8">
              <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No media items found</h3>
              <p className="text-slate-500 text-sm mt-1">Check back later for new updates to this category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const isVideo = item.mediaType === 'video';
                const videoMeta = isVideo ? getVideoMetadata(item.videoUrl, item.imageUrl) : null;
                const displayThumbnail = isVideo ? (item.imageUrl || videoMeta?.thumbnailUrl) : item.imageUrl;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                      {isVideo ? (
                        <>
                          {displayThumbnail ? (
                            <img
                              src={displayThumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <Video size={40} className="text-slate-500" />
                            </div>
                          )}

                          {/* Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Video Badge */}
                          <div className="absolute top-3 left-3 bg-brand-dark/85 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 shadow-lg">
                            <Video size={13} className="text-brand-orange" />
                            <span>Video</span>
                          </div>

                          {/* Center Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-orange/90 text-white flex items-center justify-center shadow-xl backdrop-blur-sm group-hover:scale-110 group-hover:bg-brand-orange transition-all duration-300 border-2 border-white/30">
                              <Play size={24} className="fill-white ml-1" />
                            </div>
                          </div>

                          {/* Bottom Click-to-Play Indicator */}
                          <div className="absolute bottom-3 right-3 text-white/90 text-xs font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                            Tap to Watch
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            item.category === 'design' ? 'bg-purple-100 text-purple-700' :
                            item.category === 'web' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {item.category === 'design' ? 'Graphic Design' : item.category === 'web' ? 'Web Development' : 'General Media'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-orange transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal (Images & Videos) */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 md:p-8 backdrop-blur-md transition-opacity" 
          onClick={() => setSelectedItem(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white/90 hover:text-white transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 shadow-2xl backdrop-blur-md border border-white/10"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
          
          <div 
            className="max-w-4xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.mediaType === 'video' && selectedVideoMeta ? (
              <div className="w-full">
                {selectedVideoMeta.type === 'direct' ? (
                  /* Native HTML5 Video for direct MP4 / WebM / Storage */
                  <video 
                    src={selectedVideoMeta.directUrl || selectedVideoMeta.embedUrl}
                    controls 
                    autoPlay 
                    playsInline
                    className="w-full max-h-[70vh] rounded-2xl object-contain bg-black shadow-2xl ring-1 ring-white/15 mx-auto"
                  />
                ) : selectedVideoMeta.type === 'gdrive' ? (
                  /* Google Drive Player with top-header cropped out to remove the popout icon & bar */
                  <div className="w-full aspect-video max-h-[72vh] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 relative">
                    <iframe 
                      src={selectedVideoMeta.embedUrl} 
                      className="w-full h-[calc(100%+54px)] -mt-[54px] border-0" 
                      title={selectedItem.title}
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  /* YouTube / Vimeo Player */
                  <div className="w-full aspect-video max-h-[72vh] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 relative">
                    <iframe 
                      src={selectedVideoMeta.embedUrl} 
                      className="w-full h-full border-0" 
                      title={selectedItem.title}
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            ) : (
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10" 
              />
            )}

            {/* Video Info / Title Bar */}
            <div className="mt-4 sm:mt-5 text-center max-w-2xl px-3 w-full">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">{selectedItem.title}</h3>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full ${
                  selectedItem.category === 'design' ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/30' :
                  selectedItem.category === 'web' ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30' :
                  'bg-brand-orange/20 text-brand-orange ring-1 ring-brand-orange/30'
                }`}>
                  {selectedItem.category === 'design' ? 'Graphic Design' : selectedItem.category === 'web' ? 'Web Development' : 'General Media'}
                </span>

                {selectedVideoMeta?.directUrl && (
                  <a
                    href={selectedVideoMeta.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
                  >
                    <span>Open in full view</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
