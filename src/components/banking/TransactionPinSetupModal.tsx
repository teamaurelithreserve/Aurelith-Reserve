import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';

interface TransactionPinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransactionPinSetupModal: React.FC<TransactionPinSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setupTransactionPin } = useBankingAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const pinInputRef = React.useRef<HTMLInputElement>(null);
  const confirmPinInputRef = React.useRef<HTMLInputElement>(null);

  const handleFirstPinChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
    setErrorMessage('');

    // When the user enters the fourth digit, automatically move focus to Confirm PIN field
    if (digitsOnly.length === 4) {
      requestAnimationFrame(() => {
        confirmPinInputRef.current?.focus();
      });
    }
  };

  const handleConfirmPinChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(digitsOnly);
    setErrorMessage('');
  };

  const handleFirstPinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length > 0) {
      e.preventDefault();
      setPin(digitsOnly);
      setErrorMessage('');
      if (digitsOnly.length === 4) {
        requestAnimationFrame(() => {
          confirmPinInputRef.current?.focus();
        });
      }
    }
  };

  const handleConfirmPinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If the user presses backspace on an empty confirm field, smoothly return focus to the first PIN field
    if (e.key === 'Backspace' && confirmPin.length === 0) {
      e.preventDefault();
      pinInputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strictly validate 4 digits
    if (pin.length !== 4) {
      setErrorMessage('Create Transaction PIN must be exactly four numeric digits.');
      return;
    }

    if (confirmPin.length !== 4) {
      setErrorMessage('Confirm Transaction PIN must be exactly four numeric digits.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage('Transaction PINs do not match.');
      return;
    }

    setLoading(true);

    try {
      await setupTransactionPin(pin, confirmPin);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to configure transaction PIN. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-setup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-[#1C2B4C] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5 text-red-300 dark:text-red-400" />
            </div>
            <div>
              <h3 id="pin-setup-title" className="text-lg sm:text-xl font-bold tracking-tight">
                Set Up Your Transaction PIN
              </h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Secure your transactions by creating a four-digit transaction PIN.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                Transaction PIN Activated
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your transaction PIN is securely configured and ready to authorize transactions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-2.5 text-red-800 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Create Transaction PIN */}
              <div>
                <label htmlFor="create-transaction-pin" className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Create Transaction PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="create-transaction-pin"
                    ref={pinInputRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => handleFirstPinChange(e.target.value)}
                    onPaste={handleFirstPinPaste}
                    disabled={loading}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-center text-lg font-mono tracking-[0.4em] focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 transition-colors"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  <span>Enter 4 numeric digits</span>
                  <span className="font-mono">{pin.length}/4</span>
                </div>
              </div>

              {/* Confirm Transaction PIN */}
              <div>
                <label htmlFor="confirm-transaction-pin" className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Confirm Transaction PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirm-transaction-pin"
                    ref={confirmPinInputRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => handleConfirmPinChange(e.target.value)}
                    onKeyDown={handleConfirmPinKeyDown}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-center text-lg font-mono tracking-[0.4em] focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 transition-colors"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  <span>Re-enter identical 4 digits</span>
                  <span className="font-mono">{confirmPin.length}/4</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
                  className={`w-full py-3.5 px-6 font-bold text-sm rounded-full transition-all duration-200 flex items-center justify-center space-x-2 ${
                    loading || pin.length !== 4 || confirmPin.length !== 4
                      ? 'bg-[#C8102E]/40 text-white/60 cursor-not-allowed opacity-50 shadow-none'
                      : 'bg-[#C8102E] hover:bg-[#A00B22] text-white shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Securing Transaction PIN...</span>
                    </>
                  ) : (
                    <span>Set Transaction PIN</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
