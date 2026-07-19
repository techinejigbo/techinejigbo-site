"use client";

import React, { useEffect, useState } from 'react';
import { useStudent } from '../../../components/StudentProvider';
import { subscribeToMaterials, Material } from '@techinejigbo/firebase/src/firestore';
import { PlayCircle, FileText, ExternalLink } from 'lucide-react';

export default function MaterialsPage() {
  const { trainee } = useStudent();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trainee) {
      const rawCourse = trainee.course || trainee.program || 'web-development';
      const courseId = rawCourse.toLowerCase().replace(/\s+/g, '-');
      if (courseId) {
        setLoading(true);
        const unsubscribe = subscribeToMaterials(courseId, (data) => {
          setMaterials(data);
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    }
  }, [trainee]);

  const videos = materials.filter(m => m.type === 'video');
  const pdfs = materials.filter(m => m.type === 'pdf');

  // Simple youtube URL parser for embedding
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${v}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {
      return url;
    }
    return url;
  };

  return (
    <div className="space-y-10">
      
      {/* Videos Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <PlayCircle size={24} />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Video Tutorials</h2>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading materials...</div>
        ) : videos.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
            No video tutorials have been uploaded for your track yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <div key={video.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-slate-100 relative">
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src={getEmbedUrl(video.link)} 
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-2" title={video.title}>{video.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-mono">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PDF Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Documents & PDFs</h2>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading materials...</div>
        ) : pdfs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
            No documents have been uploaded for your track yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdfs.map(pdf => (
              <a 
                key={pdf.id}
                href={pdf.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-orange hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{pdf.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">Click to view/download</p>
                  </div>
                </div>
                <ExternalLink size={20} className="text-slate-300 group-hover:text-brand-orange transition-colors" />
              </a>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
