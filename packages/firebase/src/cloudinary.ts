export interface CloudinaryUploadProgressCallback {
  (progress: number): void;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  thumbnailUrl: string;
  publicId: string;
  duration?: number;
}

/**
 * Uploads a video file directly to Cloudinary using an Unsigned Upload Preset.
 * 100% Free - no backend server or Firebase Storage billing required.
 */
export const uploadVideoToCloudinary = async (
  file: File,
  onProgress?: CloudinaryUploadProgressCallback
): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'techinejigbo_gallery');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const percent = Math.round((e.loaded / e.total) * 100);
        if (onProgress) onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const secureUrl: string = response.secure_url;
          // Generate poster image automatically from the uploaded video URL
          const thumbnailUrl: string = secureUrl.replace(/\.[^/.]+$/, ".jpg");
          resolve({
            secureUrl,
            thumbnailUrl,
            publicId: response.public_id,
            duration: response.duration,
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during video upload. Please check your internet connection.'));
    };

    xhr.send(formData);
  });
};
