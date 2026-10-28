import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  FlipHorizontal,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserAvatar } from '../common/UserAvatar';

interface ProfilePhotoManagerProps {
  onPhotoUpdated?: (newUrl: string | null) => void;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ onPhotoUpdated }) => {
  const { user, updateAvatarUrl } = useBankingAuth();

  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera capture modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!user) return null;

  // Cleanup camera stream
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stream]);

  // Start Camera
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or device environment.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or select an existing photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use the "Upload Photo" option.');
      } else {
        setCameraError('Unable to access camera. Please check your camera permissions or upload an image.');
      }
    }
  };

  const handleOpenModal = () => {
    setCameraOpen(true);
    startCamera('user');
  };

  const handleCloseModal = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCapturedBlob(null);
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
      setCapturedPreviewUrl(null);
    }
    setCameraError(null);
  };

  // Flip Camera
  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Snap Photo from Video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);

    // Square crop
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = (width - size) / 2;
    const sy = (height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 600, 600);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const previewUrl = URL.createObjectURL(blob);
          setCapturedPreviewUrl(previewUrl);
          stopCameraStream();
        }
      },
      'image/jpeg',
      0.88
    );
  };

  const handleRetake = () => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
      setCapturedPreviewUrl(null);
    }
    setCapturedBlob(null);
    startCamera(cameraFacing);
  };

  // Compact Image Processing & Base64 Data URL Encoding
  const processAndEncodeImage = (fileOrBlob: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (fileOrBlob.type && !validTypes.includes(fileOrBlob.type)) {
        return reject(new Error('Only JPEG, PNG, and WebP images are supported.'));
      }

      // Validate size (max 10MB input before processing)
      if (fileOrBlob.size > 10 * 1024 * 1024) {
        return reject(new Error('Image file exceeds the 10MB limit. Please choose a smaller file.'));
      }

      const img = new Image();
      const url = URL.createObjectURL(fileOrBlob);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Center square crop & resize to compact 256x256 profile avatar
        const targetDim = 256;
        const canvas = document.createElement('canvas');
        canvas.width = targetDim;
        canvas.height = targetDim;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Canvas graphics context unavailable for image processing.'));
        }

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetDim, targetDim);

        // Export as optimized JPEG Base64 Data URL (typically ~15KB - 28KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        // Validate final document-size safeguard (must safely fit within Firestore 1MB document limit)
        if (dataUrl.length > 250000) {
          return reject(new Error('Image payload exceeds safety limit for user document. Please select a simpler image.'));
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read image file. Please provide a valid JPEG, PNG, or WebP photo.'));
      };

      img.src = url;
    });
  };

  // Execute Upload and Permanent Persistence in Firestore & Backend
  const uploadPhotoBlob = async (blob: Blob) => {
    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Process and produce validated compact Base64 Data URL
      const dataUrl = await processAndEncodeImage(blob);

      // Authenticated UID
      const uid = auth.currentUser?.uid || user.firebaseUid || user.id;

      // Persist directly to user profile document in Firestore (/users/{uid})
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(
          userDocRef,
          {
            uid,
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: dataUrl,
            photoDataUrl: dataUrl,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr: any) {
        console.warn('Firestore profile photo persist warning:', fsErr);
      }

      // Update in application auth state & backend storage
      await updateAvatarUrl(dataUrl);

      setSuccessMessage('Profile photo updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4500);
      onPhotoUpdated?.(dataUrl);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setErrorMessage(err.message || 'Failed to process and save photo. Please try again.');
    } finally {
      // Guaranteed cleanup: never allow upload spinner to run indefinitely
      setUploading(false);
    }
  };

  // Handle File Input Selection
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadPhotoBlob(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.value = '';
      }
    }
  };

  // Handle Camera Submit
  const handleApplyCapturedPhoto = async () => {
    if (!capturedBlob) return;
    handleCloseModal();
    await uploadPhotoBlob(capturedBlob);
  };

  // Remove Photo
  const handleRemovePhoto = async () => {
    if (!confirm('Remove your profile photo and return to your standard initials monogram?')) {
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const uid = auth.currentUser?.uid || user.firebaseUid || user.id;

      // Clear in Firestore profile document
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(
          userDocRef,
          {
            avatarUrl: null,
            photoDataUrl: null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('Firestore profile remove warning:', fsErr);
      }

      // Update in app auth state & backend
      await updateAvatarUrl(null);

      setSuccessMessage('Profile photo removed. Default initials monogram restored.');
      setTimeout(() => setSuccessMessage(null), 4500);
      onPhotoUpdated?.(null);
    } catch (err: any) {
      console.error('Failed to remove photo:', err);
      setErrorMessage(err.message || 'Failed to remove profile photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Hidden Mobile Native Camera Input */}
      <input
        type="file"
        ref={mobileCameraInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      {/* Main Avatar Display & Interactive Controls */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar Display */}
        <div className="relative group">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={user.avatarUrl}
            size="2xl"
            shape="rounded-2xl"
            className="border-3 border-white dark:border-[#152033] ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
          />

          {uploading && (
            <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center text-white backdrop-blur-2xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C8102E]" />
              <span className="text-[10px] font-bold mt-1">Uploading...</span>
            </div>
          )}

          {user.status === 'active' && !uploading && (
            <div
              title="Verified Identity"
              className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full border-2 border-white dark:border-[#152033] shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Action Controls & Guidelines */}
        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">
              Executive Profile Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a verified portrait or take a real-time photo with your camera. Synced securely to Firebase Cloud Storage.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            {/* Upload Button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-xs cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{user.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {/* Take Photo Button */}
            <button
              type="button"
              disabled={uploading}
              onClick={handleOpenModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#10192A] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-[#C8102E] dark:text-red-400" />
              <span>Take Photo</span>
            </button>

            {/* Remove Photo (if set) */}
            {user.avatarUrl && (
              <button
                type="button"
                disabled={uploading}
                onClick={handleRemovePhoto}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                title="Remove current photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Accepts JPEG, PNG, or WebP. Automatically resized and optimized. Max 10MB.
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#C8102E] dark:text-red-400" />
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">
                  {capturedPreviewUrl ? 'Confirm Profile Portrait' : 'Capture Profile Photo'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Camera Viewport */}
            <div className="p-6 space-y-4">
              {cameraError ? (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    {cameraError}
                  </div>
                  <button
                    onClick={() => {
                      handleCloseModal();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1C2B4C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#152033]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File Instead</span>
                  </button>
                </div>
              ) : capturedPreviewUrl ? (
                /* Captured Frame Preview */
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-[#1C2B4C] shadow-lg relative bg-slate-900">
                    <img
                      src={capturedPreviewUrl}
                      alt="Captured snapshot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Does this photo look good for your Aurelith Reserve verified profile?
                  </p>
                </div>
              ) : (
                /* Live Video View */
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-black relative shadow-inner border border-slate-700">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {/* Viewfinder Circle Target Overlay */}
                    <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border border-dashed border-white/60 pointer-events-none" />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Position your face within the frame and capture when ready.
                  </span>
                </div>
              )}

              {/* Modal Action Controls */}
              {!cameraError && (
                <div className="flex items-center justify-between pt-2">
                  {capturedPreviewUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        Retake Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCapturedPhoto}
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Use This Photo</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleFacing}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        title="Flip Camera"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleCloseModal();
                          mobileCameraInputRef.current?.click();
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        title="Open device native camera app"
                      >
                        <Camera className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Device Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#C8102E] hover:bg-[#a60d26] text-white text-xs font-bold rounded-full shadow-md cursor-pointer transition-colors active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Snapshot</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
