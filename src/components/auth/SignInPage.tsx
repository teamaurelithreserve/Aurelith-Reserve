import React, { useState } from 'react';
import { Lock, Mail, Phone, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { NewDeviceVerificationModal } from './NewDeviceVerificationModal';
import { BrandLogo } from '../common/BrandLogo';

interface SignInPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onNavigateRegister,
  onNavigateHome,
}) => {
  const {
    login,
    pendingVerification,
    completeDeviceVerification,
    setupInitialPinAndVerifyDevice,
    cancelDeviceVerification,
  } = useBankingAuth();

  const [identifier, setIdentifier] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Recovery Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotToken, setForgotToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

  const isEmail = identifier.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = identifier.trim();
    const trimmedGov = governmentId.trim();

    if ((!trimmedId && !trimmedGov) || !password) {
      setErrorMessage('Please provide your email, phone, or Government Identification and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(trimmedId || trimmedGov, password, trimmedGov || undefined);
      if (!res.requireDeviceVerification) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = forgotIdentifier.trim();
    if (!cleanId) return;

    try {
      if (cleanId.includes('@')) {
        await sendPasswordResetEmail(auth, cleanId);
        setForgotSuccess(true);
        setForgotToken('');
      } else {
        alert('Please enter your registered email address to receive password recovery instructions.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch password recovery email.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotModal(false);
    setForgotSuccess(false);
  };

  const isFormComplete = Boolean(identifier.trim() && governmentId.trim() && password.trim());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-red-100 selection:text-red-900 transition-colors duration-200">
      {/* Top Header / Back Button */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center text-xs font-semibold text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>

        {/* Brand Emblem */}
        <BrandLogo showText imgClassName="h-7 w-auto object-contain" />
      </div>

      {/* Main Sign-In Card */}
      <div className="max-w-md mx-auto w-full bg-white dark:bg-[#152033] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-2.5 text-red-800 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier: Email OR Phone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider">
                  Email or Phone Number
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {isEmail ? 'Detected: Email' : identifier.length > 3 ? 'Detected: Phone' : 'Accepted'}
                </span>
              </div>
              <div className="relative">
                {isEmail ? (
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                ) : (
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                )}
                <input
                  type="text"
                  placeholder="Enter your registered email or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  autoFocus
                />
              </div>
            </div>

            {/* Government Identification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider">
                  Government Identification
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  SSN, Driver's License, or State ID
                </span>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter SSN, Driver's License, or State ID"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#C8102E] dark:text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormComplete || loading}
                className={`w-full py-3.5 px-6 font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center space-x-2 ${
                  !isFormComplete || loading
                    ? 'bg-[#1C2B4C]/40 dark:bg-[#1E2D44]/40 opacity-40 text-white/50 cursor-not-allowed shadow-none'
                    : 'bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#1E2D44] dark:hover:bg-slate-700 text-white shadow-md hover:shadow-lg cursor-pointer opacity-100'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* New Customer Registration CTA */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">New to Aurelith Reserve?</p>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="w-full py-2.5 px-4 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-850 text-[#C8102E] dark:text-red-400 font-bold text-xs sm:text-sm rounded-full border-2 border-[#C8102E] dark:border-red-400 transition-colors cursor-pointer"
            >
              Open an Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative text-slate-900 dark:text-slate-100">
            <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Enter your registered email address or phone number to retrieve your access credentials.
            </p>

            {resetCompleted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">Password Reset Successful!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">You can now sign in with your updated password.</p>
              </div>
            ) : !forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or phone"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1C2B4C] dark:bg-slate-700 hover:bg-[#152033] dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full cursor-pointer"
                  >
                    Send Recovery Code
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Password reset instructions have been sent to <strong>{forgotIdentifier}</strong> via Firebase Authentication. Please check your inbox or spam folder.
                  </span>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSuccess(false);
                    }}
                    className="px-5 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Disclaimer Bottom */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6 space-y-1">
        <p>Aurelith Reserve • Member FDIC • Equal Housing Lender</p>
      </div>

      {/* New Device Detected Security Verification Modal */}
      {pendingVerification && (
        <NewDeviceVerificationModal
          challenge={pendingVerification}
          onVerify={async (pin) => {
            await completeDeviceVerification(pin);
            onSuccess();
          }}
          onSetupPinAndVerify={async (payload) => {
            await setupInitialPinAndVerifyDevice(payload);
            onSuccess();
          }}
          onCancel={async () => {
            await cancelDeviceVerification();
          }}
        />
      )}
    </div>
  );
};
