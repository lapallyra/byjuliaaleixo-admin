import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import imageCompression from 'browser-image-compression';

export interface UploadProgress {
  progress: number;
  url: string | null;
  error: string | null;
}

export const compressImage = async (file: File): Promise<File> => {
  console.log('Starting compression for:', file.name, file.size);
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
  };
  try {
    const compressed = await imageCompression(file, options);
    console.log('Compression finished, new size:', compressed.size);
    // Ensure the file is returned as a proper File object with correct type if needed
    return new File([compressed], file.name.replace(/\.[^/.]+$/, ".webp"), {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};

export interface UploadTaskResult {
  promise: Promise<string>;
  task: ReturnType<typeof uploadBytesResumable>;
}

export const uploadImage = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): UploadTaskResult => {
  const fileExtension = file.name.split('.').pop() || 'webp';
  const fullPath = `${path}/${Date.now()}_${Date.now()}.${fileExtension}`;
  console.log('Firebase Storage: Starting upload to path:', fullPath);
  
  const storageRef = ref(storage, fullPath);
  console.log('Firebase Storage: Reference created');
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  console.log('Firebase Storage: uploadTask initiated');

  const promise = new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Firebase Storage: Upload progress:', progress.toFixed(2), '%');
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage: CRITICAL Upload error:', error.code, error.message, error);
        reject(error);
      },
      async () => {
        console.log('Firebase Storage: Upload complete. Attempting to get download URL...');
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Firebase Storage: Download URL successfully generated:', downloadURL);
          resolve(downloadURL);
        } catch (error) {
          console.error('Firebase Storage: Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });

  return { promise, task: uploadTask };
};


export const deleteImage = async (url: string) => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
