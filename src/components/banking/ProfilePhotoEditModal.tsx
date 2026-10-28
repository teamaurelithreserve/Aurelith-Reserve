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
  ImageIcon,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserAvatar } from '../common/UserAvatar';

interface ProfilePhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated?: (newUrl: string | null) => void;
}

export const ProfilePhotoEditModal: React.FC<ProfilePhotoEditModalProps> = ({
  isOpen,
  onClose,
  onPhotoUpdated,
}) => {
  const { user, updateAvatarUrl } = useBankingAuth();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Staged image for user preview before saving
  const [stagedDataUrl, setStagedDataUrl] = useState<string | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera stream safely
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

  // Reset state when modal closes
  const handleModalClose = () => {
    stopCameraStream();
    setCameraActive(false);
    setStagedDataUrl(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  // Start Camera
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    setStagedDataUrl(null);
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
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video playback notice:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or select an existing photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use the "Upload from Device" option.');
      } else {
        setCameraError('Unable to access camera. Please check device permissions or upload a photo file.');
      }
    }
  };

  // Flip Camera
  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Snap photo from live video and stage for preview
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);

    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = (width - size) / 2;
    const sy = (height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 256, 256);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
    setStagedDataUrl(dataUrl);
    stopCameraStream();
    setCameraActive(false);
  };

  // Process and crop uploaded file to compact 256x256 Base64 JPEG data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (file.type && !validTypes.includes(file.type)) {
        return reject(new Error('Only JPEG, PNG, and WebP images are supported.'));
      }

      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error('Image file exceeds 10MB limit. Please choose a smaller photo.'));
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);

        if (dataUrl.length > 250000) {
          return reject(new Error('Image payload exceeds safety limit for user document. Please select a simpler image.'));
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file. Please provide a valid JPEG, PNG, or WebP photo.'));
      };

      img.src = url;
    });
  };

  // Handle file chosen from device picker
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      const dataUrl = await processImageFile(file);
      setStagedDataUrl(dataUrl);
      stopCameraStream();
      setCameraActive(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read selected image file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
    }
  };

  // Save the staged photo permanently
  const handleSaveStagedPhoto = async () => {
    if (!stagedDataUrl) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const uid = auth.currentUser?.uid || user.firebaseUid || user.id;

      // Persist to Firestore user profile document (/users/{uid})
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
            avatarUrl: stagedDataUrl,
            photoDataUrl: stagedDataUrl,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('Firestore profile photo persist notice:', fsErr);
      }

      // Update in application auth state & backend storage
      await updateAvatarUrl(stagedDataUrl);

      setSuccessMessage('Profile photo successfully updated and saved.');
      onPhotoUpdated?.(stagedDataUrl);

      setTimeout(() => {
        handleModalClose();
      }, 900);
    } catch (err: any) {
      console.error('Failed to save profile photo:', err);
      setErrorMessage(err.message || 'Failed to save profile photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Remove photo and restore default monogram
  const handleRemovePhoto = async () => {
    if (!confirm('Remove your profile photo and restore your standard initials monogram?')) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const uid = auth.currentUser?.uid || user.firebaseUid || user.id;

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
        console.warn('Firestore profile photo clear notice:', fsErr);
      }

      await updateAvatarUrl(null);
      setSuccessMessage('Profile photo removed.');
      onPhotoUpdated?.(null);

      setTimeout(() => {
        handleModalClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove photo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
    >
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={mobileCameraInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-[#1C2B4C] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={saving}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Camera className="w-5 h-5 text-red-300 dark:text-red-400" />
            </div>
            <div>
              <h3 id="photo-edit-title" className="text-base sm:text-lg font-bold tracking-tight">
                Update Profile Photo
              </h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Upload a portrait or take a real-time photo with your camera.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* VIEW STATE 1: PREVIEW STAGED PHOTO */}
          {stagedDataUrl ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Preview New Photo
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review your portrait before saving to your verified banking profile.
                </p>
              </div>

              <div className="flex justify-center py-2">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#1C2B4C] dark:border-slate-600 shadow-lg relative bg-slate-900 ring-4 ring-red-500/20">
                  <img
                    src={stagedDataUrl}
                    alt="Staged Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Action Buttons: Save and Cancel */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveStagedPhoto}
                  disabled={saving}
                  className="w-full py-3 px-4 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      <span>Saving Profile Photo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Profile Photo</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setStagedDataUrl(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Choose Different Photo
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setStagedDataUrl(null)}
                    className="py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : cameraActive ? (
            /* VIEW STATE 2: ACTIVE LIVE CAMERA */
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-2.5">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    {cameraError}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setCameraActive(false);
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1C2B4C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#152033]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File Instead</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-black relative shadow-inner border border-slate-700">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border border-dashed border-white/60 pointer-events-none" />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    Center your face inside the frame and snap when ready.
                  </span>

                  <div className="flex items-center space-x-2 pt-1 w-full justify-center">
                    <button
                      type="button"
                      onClick={handleToggleFacing}
                      className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Flip Camera"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full shadow-md cursor-pointer transition-colors active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Snap Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        setCameraActive(false);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* VIEW STATE 3: DEFAULT SELECTION MENU */
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-[#10192A] rounded-2xl border border-slate-100 dark:border-slate-800">
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size="xl"
                  shape="rounded-2xl"
                  className="shadow-sm"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#1C2B4C] dark:text-white block truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {user.avatarUrl ? 'Custom photo currently active' : 'Default initials monogram active'}
                  </span>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {/* Upload from Device */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-left flex items-center space-x-3.5 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1C2B4C] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Upload from Device
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Choose an existing JPEG, PNG, or WebP photo (max 10MB)
                    </div>
                  </div>
                </button>

                {/* Take Photo with Camera */}
                <button
                  type="button"
                  onClick={() => startCamera('user')}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-left flex items-center space-x-3.5 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#C8102E] dark:text-red-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Take Photo with Camera
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Capture a real-time portrait using your device camera
                    </div>
                  </div>
                </button>

                {/* Remove Current Photo (if set) */}
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={saving}
                    className="w-full p-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-left flex items-center space-x-3 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
                        Remove Custom Photo
                      </div>
                      <div className="text-[10px] text-rose-500 dark:text-rose-400/80">
                        Restore default initials monogram
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
