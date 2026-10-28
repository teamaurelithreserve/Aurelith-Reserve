import React, { useState } from 'react';
import { Lock, ChevronDown, Copy, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useBankingAuth } from '../context/BankingAuthContext';
import { NewDeviceVerificationModal } from './auth/NewDeviceVerificationModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateBanking?: () => void;
  onNavigateRegister?: () => void;
  onNavigateSignIn?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onNavigateBanking,
  onNavigateRegister,
  onNavigateSignIn,
}) => {
  const {
    login,
    pendingVerification,
    completeDeviceVerification,
    setupInitialPinAndVerifyDevice,
    cancelDeviceVerification,
  } = useBankingAuth();

  const [loginType, setLoginType] = useState('Online Banking');
  const [username, setUsername] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (pendingVerification) {
    return (
      <NewDeviceVerificationModal
        challenge={pendingVerification}
        onVerify={async (pin) => {
          await completeDeviceVerification(pin);
          onClose();
          if (onNavigateBanking) {
            onNavigateBanking();
          }
        }}
        onSetupPinAndVerify={async (payload) => {
          await setupInitialPinAndVerifyDevice(payload);
          onClose();
          if (onNavigateBanking) {
            onNavigateBanking();
          }
        }}
        onCancel={async () => {
          await cancelDeviceVerification();
          onClose();
        }}
      />
    );
  }

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginType !== 'Online Banking') {
      alert(`Redirecting to ${loginType} portal...`);
      onClose();
      return;
    }

    const trimmedUser = username.trim();
    const trimmedGov = governmentId.trim();

    if ((!trimmedUser && !trimmedGov) || !password) {
      setError('Please provide email, phone, or Government Identification and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(trimmedUser || trimmedGov, password, trimmedGov || undefined);
      if (res.requireDeviceVerification) {
        return;
      }
      onClose();
      if (onNavigateBanking) {
        onNavigateBanking();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOnlineBanking = loginType === 'Online Banking';
  const isFormComplete = isOnlineBanking
    ? Boolean(username.trim() && governmentId.trim() && password.trim())
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 lg:p-12 bg-slate-950/30 animate-fadeIn">
      <div className="relative bg-[#1C2B4C] dark:bg-[#152033] text-white rounded-2xl shadow-2xl overflow-hidden w-[310px] sm:w-[335px] border border-[#202B48] dark:border-slate-800 mt-12 sm:mt-16">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer"
          aria-label="Close Login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dark Navy Upper Form Section */}
        <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-3.5">
          {/* Login to Dropdown Select */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              Login to
            </label>
            <div className="relative">
              <select
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
                className="w-full bg-white dark:bg-[#10192A] text-gray-900 dark:text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-gray-300 dark:border-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer pr-10"
              >
                <option value="Online Banking" className="dark:bg-[#10192A] dark:text-white">Online Banking</option>
                <option value="Credit Cards" className="dark:bg-[#10192A] dark:text-white">Credit Cards</option>
                <option value="Wealth Management Client Login" className="dark:bg-[#10192A] dark:text-white">Wealth Management Client Login</option>
                <option value="401K Leverage Login" className="dark:bg-[#10192A] dark:text-white">401K Leverage Login</option>
                <option value="RJ Investor Client Access" className="dark:bg-[#10192A] dark:text-white">RJ Investor Client Access</option>
                <option value="Aurelith Reserve Payroll Card - Paynuver" className="dark:bg-[#10192A] dark:text-white">Aurelith Reserve Payroll Card - Paynuver</option>
                <option value="RemitPlus Express" className="dark:bg-[#10192A] dark:text-white">RemitPlus Express</option>
                <option value="Purchase Card/Aurelith Reserve Bankcard" className="dark:bg-[#10192A] dark:text-white">Purchase Card/Aurelith Reserve Bankcard</option>
                <option value="Retail Finance Dealer Login" className="dark:bg-[#10192A] dark:text-white">Retail Finance Dealer Login</option>
                <option value="Make a Loan Payment" className="dark:bg-[#10192A] dark:text-white">Make a Loan Payment</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-gray-900 dark:text-slate-300 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Conditional Inputs */}
          {isOnlineBanking && (
            <>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter email or phone"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white dark:bg-[#10192A] text-gray-900 dark:text-white text-xs sm:text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Government Identification
                </label>
                <input
                  type="text"
                  placeholder="SSN, Driver's License, or State ID"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  className="w-full bg-white dark:bg-[#10192A] text-gray-900 dark:text-white text-xs sm:text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#10192A] text-gray-900 dark:text-white text-xs sm:text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {onNavigateSignIn && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateSignIn();
                    }}
                    className="text-[11px] text-blue-200 hover:underline cursor-pointer"
                  >
                    Full Sign In
                  </button>
                </div>
              )}
            </>
          )}

          {/* Login Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={!isFormComplete || loading}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
                !isFormComplete || loading
                  ? 'border border-white/30 text-white/40 opacity-40 cursor-not-allowed bg-transparent shadow-none'
                  : 'border border-white text-white opacity-100 hover:bg-white/10 cursor-pointer bg-transparent'
              }`}
            >
              <Lock className="w-4 h-4 text-white stroke-[2.2]" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </div>

          {/* New Customer Registration Link */}
          {onNavigateRegister && (
            <div className="text-center pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateRegister();
                }}
                className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center space-x-1 w-full"
              >
                <span>Don't have an account?</span>
                <span className="font-bold text-[#C8102E] underline flex items-center">
                  Register <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </button>
            </div>
          )}
        </form>

        {/* Footer Section */}
        <div className="bg-[#BCE0F5] dark:bg-[#121c2d] p-4 sm:p-5 flex flex-col space-y-2 text-[#1C2B4C] dark:text-slate-200 border-t border-transparent dark:border-slate-800">
          <div className="flex items-center space-x-2.5 font-semibold text-xs text-[#1C2B4C] dark:text-slate-200">
            <Copy className="w-4 h-4 text-[#1C2B4C] dark:text-slate-300 shrink-0" />
            <span>Routing: 111301122</span>
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-400">
            Aurelith Reserve Wealth Management &amp; Digital Banking
          </div>
        </div>
      </div>
    </div>
  );
};
