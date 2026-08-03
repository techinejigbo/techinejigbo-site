"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Code, PenTool, LayoutGrid, Loader2, X, Play, Video } from 'lucide-react';
import { GalleryItem, subscribeToGalleryItems } from '@techinejigbo/firebase/src/firestore';

export const getVideoMetadata = (url?: string, customImage?: string) => {
  if (!url) return { embedUrl: '', thumbnailUrl: customImage || '' };

  // Google Drive
  const driveMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: customImage || `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`,
      thumbnailUrl: customImage || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      thumbnailUrl: customImage || `https://vumbnail.com/${vimeoId}.jpg`,
    };
  }

  return {
    embedUrl: url,
    thumbnailUrl: customImage || '',
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-brand-dark text-white py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-sm font-semibold tracking-widest text-brand-orange uppercase mb-4">Showcase</h1>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 snap-center flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-brand-orange text-white shadow-md scale-105' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-brand-dark shadow-sm border border-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-brand-orange" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
              {filteredItems.map((item) => {
                const videoMeta = item.mediaType === 'video' ? getVideoMetadata(item.videoUrl, item.imageUrl) : null;
                
                return (
                  <div 
                    key={item.id} 
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-video w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
                      {item.mediaType === 'video' ? (
                        <div 
                          className="w-full h-full cursor-pointer relative group/video overflow-hidden bg-slate-900 flex items-center justify-center"
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Poster Thumbnail */}
                          {videoMeta?.thumbnailUrl ? (
                            <img 
                              src={videoMeta.thumbnailUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500 opacity-90 group-hover/video:opacity-100"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark flex items-center justify-center">
                              <Video size={40} className="text-slate-600" />
                            </div>
                          )}

                          {/* Video Badge */}
                          <div className="absolute top-3 right-3 z-10 pointer-events-none">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/10 shadow-sm">
                              <Play size={10} className="fill-white" />
                              Video
                            </span>
                          </div>

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/25 group-hover/video:bg-black/40 transition-colors z-10 flex flex-col items-center justify-center gap-2.5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-brand-orange/40 backdrop-blur-sm group-hover/video:scale-110 transition-all duration-300 ring-4 ring-white/20 group-hover/video:ring-brand-orange/50">
                              <Play size={24} className="fill-white translate-x-0.5" />
                            </div>
                            <span className="opacity-0 group-hover/video:opacity-100 text-white text-xs font-medium bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full transition-all transform translate-y-1 group-hover/video:translate-y-0 shadow-md">
                              Click to Watch
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full cursor-pointer relative group/image bg-slate-100"
                          onClick={() => setSelectedItem(item)}
                        >
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500" 
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-brand-dark/0 group-hover/image:bg-brand-dark/30 transition-colors z-10 flex items-center justify-center">
                            <span className="opacity-0 group-hover/image:opacity-100 text-white text-sm font-medium bg-brand-dark/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all transform scale-95 group-hover/image:scale-100 shadow-md">
                              View Full Image
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-brand-dark text-lg mb-2 line-clamp-1">{item.title}</h4>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        item.category === 'design' ? 'bg-purple-100 text-purple-700' :
                        item.category === 'web' ? 'bg-blue-100 text-blue-700' :
                        'bg-brand-orange/10 text-brand-orange'
                      }`}>
                        {item.category === 'design' ? 'Graphic Design' : item.category === 'web' ? 'Web Development' : 'General Media'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No items found for this category.
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal (Images & Videos) */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-8 backdrop-blur-md transition-opacity" 
          onClick={() => setSelectedItem(null)}
        >
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 shadow-lg"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
          
          <div 
            className="max-w-5xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.mediaType === 'video' ? (
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 relative">
                <iframe 
                  src={getVideoMetadata(selectedItem.videoUrl).embedUrl} 
                  className="w-full h-full border-0" 
                  title={selectedItem.title}
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10" 
              />
            )}

            <div className="mt-4 sm:mt-6 text-center max-w-2xl px-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{selectedItem.title}</h3>
              <span className={`inline-block px-3.5 py-1 text-xs font-semibold rounded-full ${
                selectedItem.category === 'design' ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/30' :
                selectedItem.category === 'web' ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30' :
                'bg-brand-orange/20 text-brand-orange ring-1 ring-brand-orange/30'
              }`}>
                {selectedItem.category === 'design' ? 'Graphic Design' : selectedItem.category === 'web' ? 'Web Development' : 'General Media'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
