"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, UploadCloud, Loader2, X, Video, Play, Film, Link as LinkIcon, Info, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  GalleryItem, 
  subscribeToGalleryItems, 
  saveGalleryItem, 
  deleteGalleryItem, 
  uploadVideoToCloudinary 
} from '@techinejigbo/firebase';

const parseVideoUrl = (url: string) => {
  if (!url) return { embedUrl: '', thumbnailUrl: '' };

  // Google Drive
  const driveMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
    };
  }

  const separator = url.includes('?') ? '&' : '?';
  return {
    embedUrl: `${url}${separator}autoplay=1`,
    thumbnailUrl: '',
  };
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'media' | 'design' | 'web'>('media');
  const [uploadMode, setUploadMode] = useState<'image' | 'video_file' | 'video_link'>('image');
  
  // Files State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [autoVideoThumbnail, setAutoVideoThumbnail] = useState<string>('');
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [customCoverPreview, setCustomCoverPreview] = useState<string>('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  
  // Upload progress
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const isCloudinaryConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedVideoFile(file);
      
      // Auto generate video frame thumbnail preview
      try {
        const thumb = await generateVideoThumbnail(file);
        if (thumb) setAutoVideoThumbnail(thumb);
      } catch (err) {
        console.warn('Could not extract thumbnail from video:', err);
      }
    }
  };

  const handleCustomCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomCoverFile(file);
      try {
        const compressed = await compressImage(file);
        setCustomCoverPreview(compressed);
      } catch (err) {
        console.warn('Could not preview custom cover:', err);
      }
    }
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadeddata = () => {
          video.currentTime = Math.min(1, (video.duration || 2) / 2);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 800;
            let w = video.videoWidth || 640;
            let h = video.videoHeight || 360;
            if (w > h && w > MAX_DIM) {
              h = (h * MAX_DIM) / w;
              w = MAX_DIM;
            } else if (h > MAX_DIM) {
              w = (w * MAX_DIM) / h;
              h = MAX_DIM;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, w, h);
            const thumb = canvas.toDataURL('image/jpeg', 0.75);
            URL.revokeObjectURL(url);
            resolve(thumb);
          } catch {
            URL.revokeObjectURL(url);
            resolve('');
          }
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };
      } catch {
        resolve('');
      }
    });
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

  const resetForm = () => {
    setTitle('');
    setCategory('media');
    setUploadMode('image');
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
    setAutoVideoThumbnail('');
    setCustomCoverFile(null);
    setCustomCoverPreview('');
    setVideoUrlInput('');
    setUploadProgress(0);
    setStatusMessage('');
    setShowForm(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please provide a title.');
      return;
    }

    if (uploadMode === 'image' && !selectedImageFile) {
      toast.error('Please select an image to upload.');
      return;
    }

    if (uploadMode === 'video_file' && !selectedVideoFile) {
      toast.error('Please select an MP4 / WebM video file.');
      return;
    }

    if (uploadMode === 'video_link' && !videoUrlInput.trim()) {
      toast.error('Please provide a video URL.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const dataToSave: Partial<GalleryItem> = {
        title: title.trim(),
        category,
        mediaType: uploadMode === 'image' ? 'image' : 'video',
        createdAt: new Date().toISOString()
      };

      if (uploadMode === 'image') {
        setStatusMessage('Compressing image...');
        dataToSave.imageUrl = await compressImage(selectedImageFile!);
      } else if (uploadMode === 'video_file') {
        setStatusMessage('Uploading video (free cloud storage)...');
        
        // Upload video file directly to Cloudinary (Free Tier)
        const cloudResult = await uploadVideoToCloudinary(
          selectedVideoFile!, 
          (progress) => {
            setUploadProgress(progress);
            setStatusMessage(`Uploading video (${progress}%)...`);
          }
        );

        dataToSave.videoUrl = cloudResult.secureUrl;

        // Custom Cover or automatic Cloudinary / frame thumbnail
        if (customCoverFile) {
          dataToSave.imageUrl = await compressImage(customCoverFile);
        } else if (cloudResult.thumbnailUrl) {
          dataToSave.imageUrl = cloudResult.thumbnailUrl;
        } else if (autoVideoThumbnail) {
          dataToSave.imageUrl = autoVideoThumbnail;
        }
      } else {
        // video_link
        setStatusMessage('Processing video link...');
        const parsed = parseVideoUrl(videoUrlInput.trim());
        dataToSave.videoUrl = parsed.embedUrl;

        if (customCoverFile) {
          dataToSave.imageUrl = await compressImage(customCoverFile);
        } else if (parsed.thumbnailUrl) {
          dataToSave.imageUrl = parsed.thumbnailUrl;
        }
      }

      setStatusMessage('Saving gallery record...');
      await saveGalleryItem(dataToSave);

      toast.success('Gallery item added successfully!');
      resetForm();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item. Check your configuration or network.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await deleteGalleryItem(item.id!);
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
          <p className="text-slate-500 text-sm mt-1">Upload photos, MP4 video files, or add YouTube/Vimeo/Drive links to the public showcase.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange-dark transition-colors shadow-sm"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
            <UploadCloud className="text-brand-orange" size={22} />
            Add New Gallery Item
          </h3>
          <form onSubmit={handleUpload} className="space-y-5 max-w-2xl">
            
            {/* Media Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Media Type</label>
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-full sm:w-max border border-slate-200">
                <button 
                  type="button"
                  onClick={() => setUploadMode('image')}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    uploadMode === 'image' 
                      ? 'bg-white shadow-sm text-brand-dark ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ImageIcon size={16} className="text-brand-orange" /> Photo Upload
                </button>
                <button 
                  type="button"
                  onClick={() => setUploadMode('video_file')}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    uploadMode === 'video_file' 
                      ? 'bg-white shadow-sm text-brand-dark ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Film size={16} className="text-brand-orange" /> Upload MP4 Video
                </button>
                <button 
                  type="button"
                  onClick={() => setUploadMode('video_link')}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    uploadMode === 'video_link' 
                      ? 'bg-white shadow-sm text-brand-dark ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LinkIcon size={16} className="text-brand-orange" /> Video Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title / Caption</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Robotics Workshop in Session"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none text-sm bg-white"
                >
                  <option value="media">General Media</option>
                  <option value="design">Graphic Design</option>
                  <option value="web">Web Development</option>
                </select>
              </div>
            </div>
            
            {/* Mode 1: Photo Upload */}
            {uploadMode === 'image' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Image File</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-1 text-sm text-slate-600">
                        <span className="font-semibold text-brand-orange">Click to select</span> or drag and drop image
                      </p>
                      {selectedImageFile ? (
                        <p className="text-xs text-brand-dark font-semibold mt-1 bg-brand-orange/10 px-3 py-1 rounded-md">
                          Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(0)} KB)
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageFileSelect} />
                  </label>
                </div>
              </div>
            )}

            {/* Mode 2: MP4 Video File Upload */}
            {uploadMode === 'video_file' && (
              <div className="space-y-4">
                {!isCloudinaryConfigured && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Info size={15} /> Free Cloudinary Setup Required
                    </div>
                    <p>
                      To enable direct MP4 uploads for free, add your Cloudinary details in <code>.env.local</code>:
                    </p>
                    <code className="block bg-white/80 p-2 rounded border border-amber-200 text-[11px] font-mono text-slate-800">
                      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name<br />
                      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
                    </code>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Video File (MP4 / WebM / MOV)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-brand-orange/40 rounded-xl cursor-pointer bg-orange-50/40 hover:bg-orange-50/70 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4 text-center">
                        <Film className="w-8 h-8 mb-2 text-brand-orange" />
                        <p className="mb-1 text-sm text-slate-700">
                          <span className="font-semibold text-brand-orange">Select video file</span> to upload directly
                        </p>
                        {selectedVideoFile ? (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-md border border-emerald-200">
                              ✓ {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Fast playback with native controls on iOS & Android</p>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="video/mp4,video/webm,video/quicktime,video/*" onChange={handleVideoFileSelect} />
                    </label>
                  </div>
                </div>

                {/* Auto Extracted Poster or Custom Poster */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Video Cover / Poster</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {customCoverPreview ? (
                      <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                        <img src={customCoverPreview} alt="Cover" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center py-0.5 font-semibold">Custom</span>
                      </div>
                    ) : autoVideoThumbnail ? (
                      <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                        <img src={autoVideoThumbnail} alt="Auto Frame" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center py-0.5 font-semibold">Auto Frame</span>
                      </div>
                    ) : null}

                    <div className="flex-1 min-w-[200px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCustomCoverSelect}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Optional custom poster image. If left blank, a high-resolution frame will be generated automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Video Link (YouTube / Vimeo / Drive) */}
            {uploadMode === 'video_link' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Video Link (URL)</label>
                  <input
                    type="url"
                    required
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://youtu.be/... or Google Drive / Vimeo link"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Supports YouTube, Vimeo, direct MP4 video URLs, and Google Drive ("Anyone with the link").
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Custom Video Thumbnail (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCustomCoverSelect}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">If left blank, a high-resolution thumbnail will be generated automatically.</p>
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-orange" />
                    {statusMessage || 'Processing upload...'}
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-brand-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70 text-sm shadow-md"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {uploading ? (statusMessage || 'Uploading...') : 'Publish Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of gallery items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const videoThumb = item.mediaType === 'video' ? (item.imageUrl || parseVideoUrl(item.videoUrl || '').thumbnailUrl) : null;
          
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
              <div className="h-48 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                {item.mediaType === 'video' ? (
                  <>
                    {videoThumb ? (
                      <img src={videoThumb} alt={item.title} className="w-full h-full object-cover opacity-90" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Video size={36} className="text-slate-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                      <Play size={8} className="fill-white" /> VIDEO
                    </div>
                  </>
                ) : (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <button
                    onClick={() => handleDelete(item)}
                    className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-all duration-200 shadow-lg"
                    title="Delete Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
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
          );
        })}

        {items.length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 border-dashed">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No items found in the gallery.</p>
            <p className="text-slate-400 text-sm mt-1">Upload your first item above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
