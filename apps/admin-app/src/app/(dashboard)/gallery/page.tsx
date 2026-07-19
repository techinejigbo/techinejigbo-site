"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, UploadCloud, Loader2, X, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { GalleryItem, subscribeToGalleryItems, saveGalleryItem, deleteGalleryItem } from '@techinejigbo/firebase/src/firestore';

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'media' | 'design' | 'web'>('media');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const extractDriveId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
          
          // Compress to JPEG with 0.7 quality to keep it well under 1MB
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Please provide a title.');
      return;
    }

    if (mediaType === 'image' && !selectedFile) {
      toast.error('Please select an image.');
      return;
    }

    if (mediaType === 'video' && !videoUrlInput) {
      toast.error('Please provide a Google Drive link.');
      return;
    }

    try {
      setUploading(true);
      
      const dataToSave: Partial<GalleryItem> = {
        title,
        category,
        mediaType,
        createdAt: new Date().toISOString()
      };

      if (mediaType === 'image') {
        dataToSave.imageUrl = await compressImage(selectedFile!);
      } else {
        const fileId = extractDriveId(videoUrlInput);
        if (!fileId) {
          throw new Error("Invalid Google Drive link format. Ensure it contains '/d/FILE_ID'.");
        }
        dataToSave.videoUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }

      await saveGalleryItem(dataToSave);

      toast.success('Gallery item added successfully!');
      
      setTitle('');
      setCategory('media');
      setMediaType('image');
      setSelectedFile(null);
      setVideoUrlInput('');
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item. Check permissions.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await deleteGalleryItem(id);
        toast.success('Item deleted successfully.');
      } catch (error) {
        toast.error('Failed to delete item.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Gallery Management</h2>
          <p className="text-slate-500 text-sm mt-1">Upload and manage images displayed on the public gallery.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Image'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <UploadCloud className="text-brand-orange" size={20} />
            Add New Gallery Item
          </h3>
          <form onSubmit={handleUpload} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-2 p-1 bg-slate-100 rounded-lg w-max">
              <button 
                type="button"
                onClick={() => setMediaType('image')}
                className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mediaType === 'image' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon size={16} /> Image Upload
              </button>
              <button 
                type="button"
                onClick={() => setMediaType('video')}
                className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${mediaType === 'video' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Video size={16} /> Video Link
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title / Caption</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Student Logo Design"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                >
                  <option value="media">General Media</option>
                  <option value="design">Graphic Design</option>
                  <option value="web">Web Development</option>
                </select>
              </div>
            </div>
            
            {mediaType === 'image' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Image File</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500">
                        <span className="font-semibold">Click to select</span> or drag and drop
                      </p>
                      {selectedFile && <p className="text-xs text-brand-orange font-medium">{selectedFile.name}</p>}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Google Drive Link</label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
                <p className="text-xs text-slate-500 mt-2">Make sure the Google Drive file access is set to "Anyone with the link".</p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-brand-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {uploading ? 'Processing...' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
              {item.mediaType === 'video' ? (
                <iframe 
                  src={item.videoUrl} 
                  className="w-full h-full border-0 pointer-events-none" 
                  title={item.title}
                  allow="autoplay"
                />
              ) : (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-all duration-200 shadow-lg"
                  title="Delete Item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                  item.category === 'design' ? 'bg-purple-100 text-purple-700' :
                  item.category === 'web' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {item.category === 'design' ? 'Graphic Design' : item.category === 'web' ? 'Web Development' : 'General Media'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 border-dashed">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No images found in the gallery.</p>
            <p className="text-slate-400 text-sm mt-1">Upload your first image above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
