"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToMaterials, saveMaterial, deleteMaterial, getAllCoursesFromQuestions, Material } from '@techinejigbo/firebase/src/firestore';
import { Database, Plus, Trash2, Save, X, FileText, PlayCircle, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState('graphic-design');
  const [allCourses, setAllCourses] = useState<string[]>(['graphic-design', 'web-development']);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseId, setNewCourseId] = useState('');
  
  const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    async function init() {
      setLoading(true);
      const courses = await getAllCoursesFromQuestions();
      setAllCourses(courses);
      if (!courses.includes(activeCourse) && courses.length > 0) {
        setActiveCourse(courses[0]);
      }
      
      courses.forEach(course => {
        const unsub = subscribeToMaterials(course, (mats) => {
          setMaterials(prev => {
            const filtered = prev.filter(m => m.course !== course);
            return [...filtered, ...mats];
          });
        });
        unsubs.push(unsub);
      });
      setLoading(false);
    }
    
    init();
    
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const handleAddNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourseId && newCourseId.trim() !== '') {
      const formatted = newCourseId.trim().toLowerCase().replace(/\s+/g, '-');
      if (!allCourses.includes(formatted)) {
        setAllCourses([...allCourses, formatted]);
      }
      setActiveCourse(formatted);
      setIsAddingCourse(false);
      setNewCourseId('');
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    try {
      const payload: Partial<Material> = {
        ...editingMaterial,
        createdAt: editingMaterial.createdAt || new Date().toISOString()
      };
      await saveMaterial(payload);
      setEditingMaterial(null);
      toast.success("Material saved successfully!");
    } catch (err) {
      toast.error("Failed to save material.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
        toast.success("Material deleted.");
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  const currentMaterials = materials.filter(m => m.course === activeCourse);
  const videos = currentMaterials.filter(m => m.type === 'video');
  const pdfs = currentMaterials.filter(m => m.type === 'pdf');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900">Learning Materials Manager</h2>
          <p className="text-sm text-slate-500 mt-1">Manage videos and PDFs for all courses.</p>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {allCourses.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCourse(c)}
            className={`px-4 py-2 font-medium capitalize text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeCourse === c
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {c.replace('-', ' ')}
          </button>
        ))}
        <button 
          onClick={() => setIsAddingCourse(true)}
          className="px-4 py-2 rounded-t-lg text-sm font-bold text-brand-orange hover:bg-brand-orange/5 transition-colors flex items-center gap-1"
        >
          <Plus size={16} />
          New Course
        </button>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-lg text-slate-900 capitalize flex items-center gap-2">
            <Database size={20} className="text-brand-orange" />
            {activeCourse.replace('-', ' ')} Materials
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{currentMaterials.length}</span>
          </h3>
          <button
            onClick={() => setEditingMaterial({
              course: activeCourse,
              title: '',
              type: 'video',
              link: ''
            })}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Add Material
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading materials...</div>
        ) : currentMaterials.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center">
            <Database size={32} className="mb-2 opacity-50" />
            <p>No materials found for this course.</p>
            <p className="text-sm mt-1">Click "Add Material" to begin.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Videos */}
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <PlayCircle size={18} className="text-red-500" /> Video Tutorials ({videos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(m => (
                  <div key={m.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-brand-orange/30 transition-colors relative group flex flex-col">
                    <h5 className="font-semibold text-slate-900 mb-2 pr-8">{m.title}</h5>
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-orange hover:underline flex items-center gap-1 mb-2 mt-auto">
                      <LinkIcon size={14} /> View Link
                    </a>
                    <button onClick={() => handleDelete(m.id!)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs */}
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <FileText size={18} className="text-blue-500" /> Documents & PDFs ({pdfs.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pdfs.map(m => (
                  <div key={m.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-brand-orange/30 transition-colors relative group flex flex-col">
                    <h5 className="font-semibold text-slate-900 mb-2 pr-8">{m.title}</h5>
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-orange hover:underline flex items-center gap-1 mb-2 mt-auto">
                      <LinkIcon size={14} /> View Link
                    </a>
                    <button onClick={() => handleDelete(m.id!)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-display font-bold text-lg">Add New Material</h3>
              <button onClick={() => setEditingMaterial(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveMaterial} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course ID</label>
                <input 
                  type="text" 
                  value={editingMaterial.course} 
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Material Type</label>
                <select 
                  value={editingMaterial.type}
                  onChange={e => setEditingMaterial({...editingMaterial, type: e.target.value as 'video' | 'pdf'})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="video">Video Tutorial (YouTube/Vimeo)</option>
                  <option value="pdf">Document / PDF (Google Drive/Dropbox)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Introduction to HTML"
                  value={editingMaterial.title}
                  onChange={e => setEditingMaterial({...editingMaterial, title: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">External Link</label>
                <input 
                  required
                  type="url"
                  placeholder="https://..."
                  value={editingMaterial.link}
                  onChange={e => setEditingMaterial({...editingMaterial, link: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingMaterial(null)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-brand-orange hover:bg-brand-orange-dark rounded-lg flex items-center gap-2 transition-colors">
                  <Save size={16} /> Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-display font-bold text-lg">Add New Course</h3>
              <button onClick={() => setIsAddingCourse(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddNewCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course ID</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. python, cybersecurity"
                  value={newCourseId}
                  onChange={e => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Spaces will be automatically converted to hyphens.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddingCourse(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-brand-orange hover:bg-brand-orange-dark rounded-lg flex items-center gap-2 transition-colors">
                  <Plus size={16} /> Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
