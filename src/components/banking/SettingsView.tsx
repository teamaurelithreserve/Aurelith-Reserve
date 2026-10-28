import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  Bell,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Save,
  RefreshCw,
  Send,
  Check,
  Hash,
  Laptop,
  Sun,
  Moon,
  Monitor,
  Wallet,
  Tag,
  Building,
  Info,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';
import { TrustedDeviceInfo } from '../../types/banking';
import { useTheme } from '../../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { user, refreshUser, logout } = useBankingAuth();
  const { theme, themePreference, isDark, setTheme, resetToSystem } = useTheme();

  // Trusted Devices State
  const [devices, setDevices] = useState<TrustedDeviceInfo[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);
  const [deviceActionMsg, setDeviceActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await bankingApi.getTrustedDevices();
      setDevices(res.devices);
    } catch (err: any) {
      console.warn('Could not load trusted devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  React.useEffect(() => {
    loadDevices();
  }, []);

  const handleRevokeDevice = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Revoke trust for "${deviceName}"? Future sign-ins from this device will require payment PIN verification.`)) {
      return;
    }
    try {
      await bankingApi.revokeTrustedDevice(deviceId);
      await loadDevices();
      await refreshUser();
      setDeviceActionMsg({ type: 'success', text: `Trust revoked for ${deviceName}.` });
      setTimeout(() => setDeviceActionMsg(null), 4000);
    } catch (err: any) {
      setDeviceActionMsg({ type: 'error', text: err.message || 'Failed to revoke device.' });
    }
  };

  const handleRevokeAllOtherDevices = async () => {
    if (!confirm('Revoke trust for all other devices? Future sign-ins will require payment PIN verification.')) {
      return;
    }
    try {
      const res = await bankingApi.revokeAllOtherDevices();
      await loadDevices();
      await refreshUser();
      setDeviceActionMsg({ type: 'success', text: `Revoked ${res.revokedCount} other device(s).` });
      setTimeout(() => setDeviceActionMsg(null), 4000);
    } catch (err: any) {
      setDeviceActionMsg({ type: 'error', text: err.message || 'Failed to revoke devices.' });
    }
  };

  // Notification Preferences State (initialized from user preferences or defaults)
  const [notifEmailTxs, setNotifEmailTxs] = useState(
    user?.notificationPreferences?.emailTransactions ?? true
  );
  const [notifSmsSecurity, setNotifSmsSecurity] = useState(
    user?.notificationPreferences?.smsSecurity ?? true
  );
  const [notifStatements, setNotifStatements] = useState(
    user?.notificationPreferences?.monthlyStatements ?? true
  );
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.securitySettings?.twoFactorEnabled ?? true
  );
  const [biometricsEnabled, setBiometricsEnabled] = useState(
    user?.securitySettings?.biometricsEnabled ?? true
  );

  // Password Change Workflow State
  const [passwordStep, setPasswordStep] = useState<'idle' | 'code_sent' | 'success'>('idle');
  const [requestingCode, setRequestingCode] = useState(false);
  const [codeSentInfo, setCodeSentInfo] = useState<{ email: string; demoCode?: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment PIN State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentPasswordForPin, setCurrentPasswordForPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinPassword, setShowPinPassword] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  // Save Notification & Security Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsMessage(null);
    try {
      await bankingApi.updatePreferences({
        notificationPreferences: {
          emailTransactions: notifEmailTxs,
          smsSecurity: notifSmsSecurity,
          monthlyStatements: notifStatements,
        },
        securitySettings: {
          twoFactorEnabled,
          biometricsEnabled,
        },
      });
      await refreshUser();
      setPrefsMessage({ type: 'success', text: 'Notification preferences & security controls updated successfully.' });
      setTimeout(() => setPrefsMessage(null), 4000);
    } catch (err: any) {
      setPrefsMessage({ type: 'error', text: err.message || 'Failed to update preferences.' });
    } finally {
      setSavingPrefs(false);
    }
  };

  // Password Step 1: Request Code
  const handleRequestPasswordCode = async () => {
    setRequestingCode(true);
    setPasswordMsg(null);
    try {
      const res = await bankingApi.requestPasswordCode();
      setCodeSentInfo({
        email: res.destinationEmail || user.email,
        demoCode: res.verificationCode,
      });
      setPasswordStep('code_sent');
      setPasswordMsg({
        type: 'success',
        text: res.message || `Verification code dispatched to ${user.email}.`,
      });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to request verification code.' });
    } finally {
      setRequestingCode(false);
    }
  };

  // Password Step 2: Verify Code and Update Password
  const handleVerifyAndUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!verificationCode.trim()) {
      setPasswordMsg({ type: 'error', text: 'Please enter the authorization verification code.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await bankingApi.verifyAndChangePassword({
        verificationCode: verificationCode.trim(),
        newPassword,
        confirmPassword,
      });
      await refreshUser();
      setPasswordStep('success');
      setPasswordMsg({
        type: 'success',
        text: res.message || 'Your account password has been successfully updated and verified.',
      });
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password. Please check your code.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Payment PIN Configuration
  const handleSavePaymentPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);

    if (!currentPasswordForPin) {
      setPinMsg({ type: 'error', text: 'Please enter your current account password.' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMsg({ type: 'error', text: 'PIN entries do not match.' });
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setPinMsg({ type: 'error', text: 'Payment PIN must consist of exactly 4 to 6 numeric digits.' });
      return;
    }

    setSavingPin(true);
    try {
      const res = await bankingApi.setPaymentPin({
        currentPassword: currentPasswordForPin,
        newPin: newPin.trim(),
        confirmPin: confirmPin.trim(),
      });
      await refreshUser();
      setPinMsg({ type: 'success', text: res.message || 'Payment PIN successfully set and secured!' });
      setCurrentPasswordForPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setPinModalOpen(false);
        setPinMsg(null);
      }, 2000);
    } catch (err: any) {
      setPinMsg({ type: 'error', text: err.message || 'Failed to configure payment PIN. Please check your password.' });
    } finally {
      setSavingPin(false);
    }
  };

  // Account Customization (Nicknames & Display Labels)
  const [selectedCustomAccountId, setSelectedCustomAccountId] = useState<string>(
    user.accounts[0]?.id || ''
  );
  const activeCustomAccount =
    user.accounts.find((a) => a.id === selectedCustomAccountId) || user.accounts[0];
  const [customNickname, setCustomNickname] = useState<string>(
    activeCustomAccount?.nickname || ''
  );
  const [savingNickname, setSavingNickname] = useState<boolean>(false);
  const [nicknameMsg, setNicknameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Keep input synchronized if user or selection changes
  React.useEffect(() => {
    if (activeCustomAccount) {
      setCustomNickname(activeCustomAccount.nickname || '');
    }
  }, [selectedCustomAccountId, activeCustomAccount?.nickname]);

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomAccount) return;
    setSavingNickname(true);
    setNicknameMsg(null);
    try {
      const res = await bankingApi.customizeAccount(activeCustomAccount.id, {
        nickname: customNickname.trim(),
      });
      await refreshUser();
      setNicknameMsg({
        type: 'success',
        text: res.message || 'Account display label saved successfully.',
      });
      setTimeout(() => setNicknameMsg(null), 4000);
    } catch (err: any) {
      setNicknameMsg({
        type: 'error',
        text: err.message || 'Failed to update account nickname.',
      });
    } finally {
      setSavingNickname(false);
    }
  };

  const handleResetNickname = async () => {
    if (!activeCustomAccount) return;
    setSavingNickname(true);
    setNicknameMsg(null);
    try {
      await bankingApi.customizeAccount(activeCustomAccount.id, { nickname: '' });
      setCustomNickname('');
      await refreshUser();
      setNicknameMsg({
        type: 'success',
        text: `Display label reset to default (${activeCustomAccount.name}).`,
      });
      setTimeout(() => setNicknameMsg(null), 4000);
    } catch (err: any) {
      setNicknameMsg({
        type: 'error',
        text: err.message || 'Failed to reset nickname.',
      });
    } finally {
      setSavingNickname(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Title & Overview */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Security &amp; Account Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage multi-factor authentication, theme preferences, verified password credentials, payment authorization PIN, and notification preferences.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECURITY SETTINGS SECTION                                              */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 transition-colors">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white">Security Controls &amp; Credentials</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure payment transfer PINs, display theme, email-verified password changes, and 2FA access.
            </p>
          </div>
        </div>

        {/* =================================================== */}
        {/* THEME & APPEARANCE (EXCLUSIVELY INSIDE SECURITY)    */}
        {/* =================================================== */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#10192A] border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Theme &amp; Display Appearance</h3>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span>Current: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Choose your preferred visual presentation throughout the public landing page and authenticated banking screens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                themePreference === 'light'
                  ? 'bg-white dark:bg-slate-800 border-[#C8102E] dark:border-red-500 ring-2 ring-[#C8102E]/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>Light Mode</span>
                  {themePreference === 'light' && <Check className="w-3.5 h-3.5 text-[#C8102E] dark:text-red-400" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Approved Brand Clean</div>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                themePreference === 'dark'
                  ? 'bg-white dark:bg-slate-800 border-[#C8102E] dark:border-red-500 ring-2 ring-[#C8102E]/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>Dark Mode</span>
                  {themePreference === 'dark' && <Check className="w-3.5 h-3.5 text-[#C8102E] dark:text-red-400" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Reserve Midnight Navy</div>
              </div>
            </button>

            {/* System Default Option */}
            <button
              type="button"
              onClick={resetToSystem}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                themePreference === 'system'
                  ? 'bg-white dark:bg-slate-800 border-[#C8102E] dark:border-red-500 ring-2 ring-[#C8102E]/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>System Scheme</span>
                  {themePreference === 'system' && <Check className="w-3.5 h-3.5 text-[#C8102E] dark:text-red-400" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Auto Device Preference</div>
              </div>
            </button>
          </div>
        </div>

        {/* =================================================== */}
        {/* A. PAYMENT AUTHORIZATION PIN                        */}
        {/* =================================================== */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#10192A] border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-[#C8102E] dark:text-red-400" />
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Payment Authorization PIN</h3>
                {user.hasPaymentPin ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <Check className="w-3 h-3" />
                    <span>Active &amp; Configured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-3 h-3" />
                    <span>Not Set</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                A 4 to 6 digit numeric code required to authorize money transfers, wires, and sensitive disbursements.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPinModalOpen(true);
                setPinMsg(null);
              }}
              className="px-4 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              {user.hasPaymentPin ? 'Change Payment PIN' : 'Set Up Payment PIN'}
            </button>
          </div>

          {user.hasPaymentPin && (
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl p-2.5 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Your Payment Authorization PIN is securely hashed and required during transfer confirmation.</span>
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* B. PASSWORD MANAGEMENT (EMAIL VERIFIED WORKFLOW)    */}
        {/* =================================================== */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#10192A] border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-[#C8102E] dark:text-red-400" />
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Password Modification Workflow</h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            For account protection, password updates require a one-time security authorization code dispatched to your verified electronic address (<span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>).
          </p>

          {passwordMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          {passwordStep === 'idle' ? (
            <div className="pt-1">
              <button
                type="button"
                disabled={requestingCode}
                onClick={handleRequestPasswordCode}
                className="px-5 py-2.5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center space-x-2 shadow-xs disabled:opacity-50"
              >
                {requestingCode ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Password Change Verification Code</span>
                  </>
                )}
              </button>
            </div>
          ) : passwordStep === 'code_sent' ? (
            <form onSubmit={handleVerifyAndUpdatePassword} className="space-y-4 pt-2">
              {/* Demo preview banner for rapid testing */}
              {codeSentInfo?.demoCode && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      One-time code dispatched: <strong className="font-mono text-[#1C2B4C] dark:text-white text-sm">{codeSentInfo.demoCode}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(codeSentInfo.demoCode || '')}
                    className="text-[11px] font-bold text-[#1C2B4C] dark:text-sky-300 hover:text-[#C8102E] dark:hover:text-red-400 underline cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              {/* Verification Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  1. One-Time Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUR-123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full sm:w-80 px-3.5 py-2.5 bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
              </div>

              {/* New Password & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    2. New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    3. Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {updatingPassword ? 'Verifying & Updating...' : 'Confirm & Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordStep('idle')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPasswordStep('idle')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full cursor-pointer"
              >
                Change Password Again
              </button>
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* C. PRIVACY & ACCESS CONTROLS (2FA / BIOMETRICS)     */}
        {/* =================================================== */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Smartphone className="w-4 h-4 text-[#1C2B4C] dark:text-slate-300" />
            <span>Multi-Factor &amp; Device Authentication</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Require one-time verification code on new sign-ins</div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                  twoFactorEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Biometric Authentication</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Touch ID / Face ID access on enrolled devices</div>
              </div>
              <button
                type="button"
                onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                  biometricsEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {biometricsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* D. TRUSTED DEVICES & RECOGNITION                    */}
        {/* =================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Laptop className="w-4 h-4 text-[#1C2B4C] dark:text-slate-300" />
                <span>Recognized &amp; Trusted Devices</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Devices authorized to access your account without repeating payment PIN verification on each login.
              </p>
            </div>

            {devices.filter((d) => d.status === 'trusted' && !d.isCurrentDevice).length > 0 && (
              <button
                type="button"
                onClick={handleRevokeAllOtherDevices}
                className="text-xs font-semibold text-[#C8102E] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Revoke All Other Devices
              </button>
            )}
          </div>

          {deviceActionMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                deviceActionMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {deviceActionMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{deviceActionMsg.text}</span>
            </div>
          )}

          {loadingDevices ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading recognized devices...</div>
          ) : devices.filter((d) => d.status === 'trusted').length === 0 ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
              No additional trusted devices registered. Your session will prompt for payment PIN verification when accessed from a newly detected device.
            </div>
          ) : (
            <div className="space-y-2.5">
              {devices
                .filter((d) => d.status === 'trusted')
                .map((device) => (
                  <div
                    key={device.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#152033] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#1C2B4C] dark:text-slate-200 shrink-0">
                        {device.os === 'iOS' || device.os === 'Android' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{device.deviceName}</span>
                          {device.isCurrentDevice && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                              This Device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Trusted: {new Date(device.trustedAt).toLocaleDateString()}
                          {device.ipAddress && ` • IP: ${device.ipAddress}`}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeDevice(device.deviceId, device.deviceName)}
                      className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/60"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* E. AUTHENTICATED SESSION & SIGN OUT                 */}
        {/* =================================================== */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <LogOut className="w-4 h-4 text-[#C8102E] dark:text-red-400" />
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Account Session &amp; Sign Out</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Securely terminate your authenticated session on this device. Future access will require your verified credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to sign out of your Aurelith Reserve session?')) {
                  logout();
                }
              }}
              className="px-4 py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs shrink-0 flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACCOUNT CUSTOMIZATION & DISPLAY NAMES                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white">Account Customization &amp; Display Names</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize account labels and nicknames. Bank-issued identifiers and depository charters remain authoritatively verified.
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {nicknameMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn ${
              nicknameMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {nicknameMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{nicknameMsg.text}</span>
          </div>
        )}

        {/* Multi-Account Selector Tabs */}
        {user.accounts.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Account to Customize
            </label>
            <div className="flex flex-wrap gap-2">
              {user.accounts.map((acc) => {
                const isSelected = activeCustomAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomAccountId(acc.id);
                      setNicknameMsg(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{acc.nickname || acc.name}</span>
                    <span className="font-mono text-[10px] opacity-75">({acc.accountNumber.slice(-4)})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeCustomAccount && (
          <div className="space-y-6">
            {/* Read-Only Authoritative Bank-Issued Identifiers */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-[#1C2B4C] dark:text-slate-400" />
                  <span>Authoritative Depository Credentials (Read-Only)</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-3 h-3" />
                  <span>Depository Certified</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Legal Account Holder</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{user.firstName} {user.lastName}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Issuing Financial Institution</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {activeCustomAccount.institution || 'Aurelith Reserve'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Depository Product Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{activeCustomAccount.name}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Bank Account Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">{activeCustomAccount.accountNumber}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">ABA Routing Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">{activeCustomAccount.routingNumber || '111301122'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">SWIFT / BIC Wire Code</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">{activeCustomAccount.swiftCode || 'AURUS33D'}</span>
                </div>
              </div>
            </div>

            {/* Custom Nickname / Display Name Form */}
            <form onSubmit={handleSaveNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Custom Account Nickname / Display Label
                </label>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="e.g. Personal Checking, Everyday Account, Business Funds"
                  value={customNickname}
                  onChange={(e) => setCustomNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Letters, numbers, spaces, and hyphens permitted. Up to 40 characters.</span>
                  <span>{customNickname.length}/40</span>
                </div>
              </div>

              {/* Preset Nickname Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Suggested Nicknames:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Personal Checking', 'Everyday Account', 'Business Funds', 'Primary Operating', 'Emergency Reserve', 'Family Vault'].map(
                    (suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => setCustomNickname(suggested)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        + {suggested}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Informational Guidance Box on Bank Identities vs Nicknames */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-sky-950/30 border border-blue-200/70 dark:border-sky-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-semibold text-sky-950 dark:text-sky-200">
                    Display Label vs. Bank Identity Distinction
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    A custom display name is a label for your personal convenience in Aurelith Reserve. It does not alter your underlying legal depository institution, bank routing code, account number, or FDIC-insured status. Accounts at external institutions (e.g., JPMorgan Chase, Bank of America) can only be represented when authoritatively issued or verified through certified banking integrations.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingNickname}
                  className="px-6 py-2.5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  {savingNickname ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Nickname...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Display Label</span>
                    </>
                  )}
                </button>

                {activeCustomAccount.nickname && (
                  <button
                    type="button"
                    onClick={handleResetNickname}
                    disabled={savingNickname}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    Reset to Default ({activeCustomAccount.name})
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. NOTIFICATION PREFERENCES SECTION                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white">Electronic Notification Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize alerts for money transfers, 2FA security dispatches, and periodic statements.
            </p>
          </div>
        </div>

        {prefsMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
              prefsMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {prefsMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{prefsMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="space-y-2 text-xs">
            {/* Transaction Alerts */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors">
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block">Instant Transaction Email Receipts</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Receive real-time electronic confirmations to {user.email} for incoming and outgoing wire transfers.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifEmailTxs}
                onChange={(e) => setNotifEmailTxs(e.target.checked)}
                className="w-4 h-4 text-[#1C2B4C] rounded-md focus:ring-0 cursor-pointer accent-[#C8102E]"
              />
            </label>

            {/* SMS 2FA Security */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors">
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block">SMS Two-Factor Security Codes</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Transmit one-time verification tokens to {user.phoneNumber} for wire authorizations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifSmsSecurity}
                onChange={(e) => setNotifSmsSecurity(e.target.checked)}
                className="w-4 h-4 text-[#1C2B4C] rounded-md focus:ring-0 cursor-pointer accent-[#C8102E]"
              />
            </label>

            {/* Monthly Statements */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors">
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block">Monthly Statement Dispatch Alerts</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Notify when monthly PDF account statements and audit ledgers become available for download.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifStatements}
                onChange={(e) => setNotifStatements(e.target.checked)}
                className="w-4 h-4 text-[#1C2B4C] rounded-md focus:ring-0 cursor-pointer accent-[#C8102E]"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPrefs}
              className="px-6 py-2.5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              {savingPrefs ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notification Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* PAYMENT PIN CONFIGURATION MODAL                                           */}
      {/* ========================================================================= */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#C8102E] dark:text-red-400 flex items-center justify-center">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                  {user.hasPaymentPin ? 'Update Payment Authorization PIN' : 'Set Up Payment Authorization PIN'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requires current password verification to secure your transfer authorization PIN.
                </p>
              </div>
            </div>

            {pinMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                  pinMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {pinMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{pinMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentPin} className="space-y-4">
              {/* Current Password Verification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Current Account Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPinPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={currentPasswordForPin}
                    onChange={(e) => setCurrentPasswordForPin(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinPassword(!showPinPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New 4-6 Digit PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    New PIN (4-6 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-center text-sm font-mono tracking-widest font-bold focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirm PIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-center text-sm font-mono tracking-widest font-bold focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPin}
                  className="flex-1 py-2.5 px-4 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingPin ? 'Securing PIN...' : 'Save Payment PIN'}
                </button>
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
