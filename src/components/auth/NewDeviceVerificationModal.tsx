import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
  KeyRound,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DeviceVerificationChallenge } from '../../types/banking';

interface NewDeviceVerificationModalProps {
  challenge: DeviceVerificationChallenge;
  onVerify: (paymentPin: string) => Promise<void>;
  onSetupPinAndVerify: (payload: { password: string; newPin: string; confirmPin: string }) => Promise<void>;
  onCancel: () => void;
}

export const NewDeviceVerificationModal: React.FC<NewDeviceVerificationModalProps> = ({
  challenge,
  onVerify,
  onSetupPinAndVerify,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Setup / Recovery flow state (if user has no PIN or needs setup)
  const [showSetupFlow, setShowSetupFlow] = useState(!challenge.hasPaymentPin);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupNewPin, setSetupNewPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  const [showSetupPins, setShowSetupPins] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPin = pin.trim();
    if (!cleanPin) {
      setErrorMessage('Please enter your payment PIN.');
      return;
    }

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setErrorMessage('Payment PIN must consist of 4 to 6 numeric digits.');
      return;
    }

    setLoading(true);
    try {
      await onVerify(cleanPin);
      setSuccess(true);
    } catch (err: any) {
      // The server will respond with "Incorrect payment PIN. Please try again."
      setErrorMessage(err.message || 'Incorrect payment PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!setupPassword) {
      setErrorMessage('Please enter your account password to verify identity.');
      return;
    }

    if (!/^\d{4,6}$/.test(setupNewPin.trim())) {
      setErrorMessage('Payment PIN must consist of exactly 4 to 6 numeric digits.');
      return;
    }

    if (setupNewPin !== setupConfirmPin) {
      setErrorMessage('Payment PIN entries do not match.');
      return;
    }

    setLoading(true);
    try {
      await onSetupPinAndVerify({
        password: setupPassword,
        newPin: setupNewPin.trim(),
        confirmPin: setupConfirmPin.trim(),
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to establish payment PIN. Please verify your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-white dark:bg-[#152033] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Top Decorative Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1C2B4C] via-[#C8102E] to-[#1C2B4C]" />

        {/* Close / Cancel Button Top Right */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || success}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Cancel verification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Shield Emblem & Header */}
        <div className="flex items-start space-x-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 flex items-center justify-center shrink-0 text-[#C8102E] dark:text-red-400 shadow-xs">
            {success ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 id="modal-title" className="text-xl font-bold text-[#1C2B4C] dark:text-white tracking-tight">
                New Device Detected
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Security Check
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              For your security, please verify your payment PIN to gain full access to this Aurelith Reserve account.
            </p>
          </div>
        </div>

        {/* Device Metadata Card */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
            <Smartphone className="w-4 h-4 text-[#1C2B4C] dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {challenge.deviceInfo?.deviceName || 'Unrecognized Browser / Device'}
              </span>
              {challenge.deviceInfo?.ipAddress && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                  (IP: {challenge.deviceInfo.ipAddress})
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-[#152033] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            Unverified
          </span>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-start space-x-2.5 text-red-800 dark:text-red-300 text-xs animate-shake"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="font-medium leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Device Verified Successfully</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Establishing secure session and opening your banking dashboard...
              </div>
            </div>
          </div>
        )}

        {/* Flow 1: Verification Form (User has PIN configured) */}
        {!showSetupFlow && (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="payment-pin-input"
                  className="block text-xs font-bold text-[#1C2B4C] dark:text-white uppercase tracking-wider"
                >
                  Payment PIN
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">4 to 6 numeric digits</span>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="payment-pin-input"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={loading || success}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter your payment PIN"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-base tracking-widest font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  disabled={loading || success}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                Digits are masked for your security. Never share your PIN with anyone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || success || !pin}
                className="w-full py-3.5 px-6 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify and Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={loading || success}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel or Sign Out
              </button>
            </div>

            {/* Need Recovery or Setup Assistance */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowSetupFlow(true);
                  setErrorMessage('');
                }}
                className="text-xs text-[#C8102E] dark:text-red-400 hover:underline font-semibold cursor-pointer inline-flex items-center space-x-1"
              >
                <span>Forgot or need to set up Payment PIN?</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </form>
        )}

        {/* Flow 2: Setup / Recovery Flow (When user has not configured a PIN or forgot it) */}
        {showSetupFlow && (
          <form onSubmit={handleSetupPinSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
              <div className="font-bold mb-1 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Verification Cannot Be Bypassed</span>
              </div>
              <p className="leading-relaxed">
                {challenge.hasPaymentPin
                  ? 'To reset your Payment PIN on this new device, verify your account password below.'
                  : 'No Payment PIN is currently configured on this account. Please verify your account password and establish your 4-6 digit numeric payment PIN.'}
              </p>
            </div>

            {/* Password Verification */}
            <div>
              <label className="block text-xs font-bold text-[#1C2B4C] dark:text-white uppercase tracking-wider mb-1.5">
                Current Account Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  disabled={loading || success}
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                />
              </div>
            </div>

            {/* New PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-white uppercase tracking-wider mb-1.5">
                  New Payment PIN
                </label>
                <div className="relative">
                  <input
                    type={showSetupPins ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    disabled={loading || success}
                    value={setupNewPin}
                    onChange={(e) => setSetupNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="4-6 digits"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono tracking-widest focus:bg-white dark:focus:bg-[#10192A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-white uppercase tracking-wider mb-1.5">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    type={showSetupPins ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    disabled={loading || success}
                    value={setupConfirmPin}
                    onChange={(e) => setSetupConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Re-enter PIN"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono tracking-widest focus:bg-white dark:focus:bg-[#10192A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowSetupPins(!showSetupPins)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer flex items-center space-x-1"
              >
                {showSetupPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSetupPins ? 'Hide PINs' : 'Show PINs'}</span>
              </button>

              {challenge.hasPaymentPin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSetupFlow(false);
                    setErrorMessage('');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                >
                  I remember my PIN
                </button>
              )}
            </div>

            {/* Submit Action */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || success || !setupPassword || !setupNewPin}
                className="w-full py-3.5 px-6 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Securing Device...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Establish PIN &amp; Trust Device</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={loading || success}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel or Sign Out
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
