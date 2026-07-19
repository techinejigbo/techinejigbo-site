"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToAnnouncements, saveAnnouncement, deleteAnnouncement, Announcement } from '@techinejigbo/firebase/src/firestore';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await saveAnnouncement({
          id: editingId,
          title: newTitle,
          content: newContent
        });
        toast.success('Announcement updated');
      } else {
        await saveAnnouncement({
          title: newTitle,
          content: newContent,
          createdAt: new Date().toISOString()
        });
        toast.success('Announcement posted');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      toast.error('Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (a: Announcement) => {
    setEditingId(a.id);
    setNewTitle(a.title);
    setNewContent(a.content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        toast.success('Announcement deleted');
      } catch (err) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Bell className="text-brand-orange" size={24} />
            Announcements Manager
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Post updates and important messages for all students.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
          No announcements have been posted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group pr-16">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(a)}
                  className="text-slate-300 hover:text-blue-500 transition-colors"
                  title="Edit Announcement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{a.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1 mb-4">
                {new Date(a.createdAt).toLocaleString()}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? 'Edit Announcement' : 'Post Announcement'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setNewTitle(''); setNewContent(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddOrEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="e.g. Exam Schedule Released"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea 
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                  placeholder="Type the announcement details here..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); setNewTitle(''); setNewContent(''); }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Post Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
