"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Code, PenTool, LayoutGrid, Loader2, X } from 'lucide-react';
import { GalleryItem, subscribeToGalleryItems } from '@techinejigbo/firebase/src/firestore';

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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
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
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className={`aspect-video w-full flex items-center justify-center bg-slate-100 relative overflow-hidden`}>
                    {item.mediaType === 'video' ? (
                      <iframe 
                        src={item.videoUrl} 
                        className="w-full h-full border-0 relative z-20" 
                        title={item.title}
                        allow="autoplay; fullscreen"
                      />
                    ) : (
                      <div 
                        className="w-full h-full cursor-pointer relative group/image"
                        onClick={() => setSelectedImage(item)}
                      >
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-dark/0 group-hover/image:bg-brand-dark/30 transition-colors z-10 flex items-center justify-center">
                           <span className="opacity-0 group-hover/image:opacity-100 text-white text-sm font-medium bg-brand-dark/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all transform scale-95 group-hover/image:scale-100">
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
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No items found for this category.
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-sm transition-opacity" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/70 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
          >
            <X size={24} />
          </button>
          
          <div 
            className="max-w-5xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10" 
            />
            <div className="mt-6 text-center max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{selectedImage.title}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                selectedImage.category === 'design' ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/30' :
                selectedImage.category === 'web' ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30' :
                'bg-brand-orange/20 text-brand-orange ring-1 ring-brand-orange/30'
              }`}>
                {selectedImage.category === 'design' ? 'Graphic Design' : selectedImage.category === 'web' ? 'Web Development' : 'General Media'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
