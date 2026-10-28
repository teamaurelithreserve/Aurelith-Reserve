import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  ChevronDown,
  Globe,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Landmark,
  Building,
  Check,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { REGISTER_BANK_OPTIONS } from '../../data/bankOptions';
import { COUNTRY_CALLING_CODES, CountryCallingCode, formatToE164 } from '../../data/countryCodes';
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';
import { cleanAndLimitPhoneDigits, validateCountryPhoneNumber } from '../../utils/phoneValidation';
import {
  formatIdentityInput,
  validateIdentityDocument,
  getIdentityPlaceholder,
} from '../../utils/identityValidation';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../common/BrandLogo';
import { auth, db } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import {
  ACCOUNT_TIERS,
  AccountTierConfig,
  getAccountTier,
  formatCurrency,
} from '../../data/accountTiers';

export type AccountTypeOption = AccountTierConfig;
export const ACCOUNT_TYPE_OPTIONS = ACCOUNT_TIERS;

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateSignIn: () => void;
  onNavigateHome: () => void;
  onNavigateAccountSelection?: () => void;
  initialAccountType?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateSignIn,
  onNavigateHome,
  onNavigateAccountSelection,
  initialAccountType,
}) => {
  const { register } = useBankingAuth();

  const [selectedAccountType, setSelectedAccountType] = useState<string>(
    initialAccountType || 'Premier Checking'
  );

  const currentAccountOption =
    getAccountTier(selectedAccountType) ||
    ACCOUNT_TIERS[4]; // Premier Checking

  useEffect(() => {
    if (initialAccountType) {
      setSelectedAccountType(initialAccountType);
    }
  }, [initialAccountType]);

  const [selectedCountry, setSelectedCountry] = useState<CountryCallingCode>(COUNTRY_CALLING_CODES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bank selection state
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const bankSearchInputRef = useRef<HTMLInputElement>(null);

  const filteredBanks = REGISTER_BANK_OPTIONS.filter((bank) =>
    bank.toLowerCase().includes(bankSearchQuery.toLowerCase().trim())
  );

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '' as 'Male' | 'Female' | '',
    bankName: '',
    idType: 'Social Security Number (SSN)',
    idNumber: '',
    street: '',
    city: '',
    state: 'TX',
    zipCode: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneFormatHint, setPhoneFormatHint] = useState('');
  const [phoneFormatValid, setPhoneFormatValid] = useState(false);
  const [idFormatHint, setIdFormatHint] = useState('');
  const [idFormatValid, setIdFormatValid] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Email verification state
  const [pendingEmailVerification, setPendingEmailVerification] = useState<{
    email: string;
    fbUser: FirebaseUser;
    e164Phone: string;
  } | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close bank dropdown on outside click
  useEffect(() => {
    const handleBankOutsideClick = (e: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleBankOutsideClick);
    return () => document.removeEventListener('mousedown', handleBankOutsideClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (countryDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [countryDropdownOpen]);

  // Focus bank search input when bank dropdown opens
  useEffect(() => {
    if (bankDropdownOpen && bankSearchInputRef.current) {
      setTimeout(() => bankSearchInputRef.current?.focus(), 50);
    }
  }, [bankDropdownOpen]);

  // Filter countries by query (name or dialing code)
  const filteredCountries = COUNTRY_CALLING_CODES.filter((c) => {
    const query = countrySearchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.toLowerCase().includes(query) ||
      c.isoCode.toLowerCase().includes(query)
    );
  });

  const handleSelectCountry = (country: CountryCallingCode) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
    setCountrySearchQuery('');

    // Re-format and enforce length for existing phone input with newly selected country
    if (formData.phoneNumber) {
      const { formatted, digits } = cleanAndLimitPhoneDigits(
        formData.phoneNumber,
        country.dialCode,
        country.isoCode
      );
      setFormData((prev) => ({ ...prev, phoneNumber: formatted }));

      if (digits) {
        const res = validateCountryPhoneNumber(
          formatted,
          country.dialCode,
          country.isoCode,
          country.name
        );
        setPhoneFormatValid(res.isValid);
        setPhoneFormatHint(res.isValid ? (res.hint || `Valid ${country.name} number`) : (res.error || ''));
      } else {
        setPhoneFormatHint('');
        setPhoneFormatValid(false);
      }
    }

    // If document is passport, re-validate against newly selected country
    if (formData.idType.includes('Passport') && formData.idNumber) {
      const res = validateIdentityDocument(formData.idNumber, formData.idType, formData.state, country.isoCode);
      setIdFormatValid(res.isValid);
      setIdFormatHint(res.isValid ? (res.hint || 'Valid document format') : (res.error || ''));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatted, digits } = cleanAndLimitPhoneDigits(
      e.target.value,
      selectedCountry.dialCode,
      selectedCountry.isoCode
    );
    setFormData((prev) => ({ ...prev, phoneNumber: formatted }));

    if (digits) {
      const res = validateCountryPhoneNumber(
        formatted,
        selectedCountry.dialCode,
        selectedCountry.isoCode,
        selectedCountry.name
      );
      setPhoneFormatValid(res.isValid);
      setPhoneFormatHint(res.isValid ? (res.hint || `Valid ${selectedCountry.name} number`) : (res.error || ''));
    } else {
      setPhoneFormatValid(false);
      setPhoneFormatHint('');
    }
  };

  const handleIdTypeChange = (newType: string) => {
    const formatted = formatIdentityInput(
      formData.idNumber,
      newType,
      formData.state,
      selectedCountry.isoCode
    );
    setFormData((prev) => ({ ...prev, idType: newType, idNumber: formatted }));

    if (formatted) {
      const res = validateIdentityDocument(formatted, newType, formData.state, selectedCountry.isoCode);
      setIdFormatValid(res.isValid);
      setIdFormatHint(res.isValid ? (res.hint || 'Valid document format') : (res.error || ''));
    } else {
      setIdFormatValid(false);
      setIdFormatHint('');
    }
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIdentityInput(
      e.target.value,
      formData.idType,
      formData.state,
      selectedCountry.isoCode
    );
    setFormData((prev) => ({ ...prev, idNumber: formatted }));

    if (formatted) {
      const res = validateIdentityDocument(formatted, formData.idType, formData.state, selectedCountry.isoCode);
      setIdFormatValid(res.isValid);
      setIdFormatHint(res.isValid ? (res.hint || 'Valid document format') : (res.error || ''));
    } else {
      setIdFormatValid(false);
      setIdFormatHint('');
    }
  };

  const handleStateChange = (newState: string) => {
    setFormData((prev) => ({ ...prev, state: newState }));
    if (
      (formData.idType.includes("Driver's License") || formData.idType.includes('State Identification')) &&
      formData.idNumber
    ) {
      const res = validateIdentityDocument(formData.idNumber, formData.idType, newState, selectedCountry.isoCode);
      setIdFormatValid(res.isValid);
      setIdFormatHint(res.isValid ? (res.hint || 'Valid document format') : (res.error || ''));
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const isFormComplete = Boolean(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.phoneNumber.trim() &&
    formData.dateOfBirth &&
    formData.gender &&
    formData.bankName.trim() &&
    formData.idNumber.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.termsAccepted
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Please enter your first and last name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Country-specific phone validation using libphonenumber-js
    const phoneRes = validateCountryPhoneNumber(
      formData.phoneNumber,
      selectedCountry.dialCode,
      selectedCountry.isoCode,
      selectedCountry.name
    );

    if (!phoneRes.isValid) {
      setErrorMessage(
        phoneRes.error ||
          `Please enter a valid telephone number for ${selectedCountry.name}.`
      );
      return;
    }

    const e164Number = phoneRes.e164;

    if (!formData.dateOfBirth) {
      setErrorMessage('Please enter your date of birth.');
      return;
    }

    if (!formData.gender || (formData.gender !== 'Male' && formData.gender !== 'Female')) {
      setErrorMessage('Please select your gender (Male or Female).');
      return;
    }

    if (!formData.bankName || !formData.bankName.trim()) {
      setErrorMessage('Please select a Bank Name.');
      return;
    }

    // Identity document validation
    const idRes = validateIdentityDocument(
      formData.idNumber,
      formData.idType,
      formData.state,
      selectedCountry.isoCode
    );

    if (!idRes.isValid) {
      setErrorMessage(idRes.error || 'Please enter a valid official identification document number.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMessage('You must accept the Aurelith Reserve Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      let fbUser: FirebaseUser;
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        fbUser = cred.user;
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-in-use') {
          try {
            const cred = await signInWithEmailAndPassword(
              auth,
              formData.email.trim(),
              formData.password
            );
            fbUser = cred.user;
          } catch {
            setErrorMessage('An account with this email address already exists. Please sign in or use a different email.');
            setLoading(false);
            return;
          }
        } else {
          setErrorMessage(fbErr.message || 'Firebase Authentication could not create account. Please check your details.');
          setLoading(false);
          return;
        }
      }

      const fullName = [formData.firstName.trim(), formData.middleName.trim(), formData.lastName.trim()].filter(Boolean).join(' ');
      await updateProfile(fbUser, {
        displayName: fullName,
      }).catch(() => {});

      // Check if already verified (e.g. returning user)
      if (fbUser.emailVerified) {
        await completeVerifiedRegistration(fbUser, e164Number);
      } else {
        // Dispatch official verification email
        await sendEmailVerification(fbUser).catch((e) => console.warn('Send verification note:', e));
        setPendingEmailVerification({
          email: formData.email.trim(),
          fbUser,
          e164Phone: e164Number,
        });
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account creation. Please try again.');
      setLoading(false);
    }
  };

  const completeVerifiedRegistration = async (fbUser: FirebaseUser, e164Phone: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await register({
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || undefined,
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: e164Phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bankName: formData.bankName.trim(),
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        governmentId: formData.idNumber.trim(),
        accountType: selectedAccountType,
        residentialAddress: {
          street: formData.street || '400 Main Street',
          city: formData.city || 'Dallas',
          state: formData.state || 'TX',
          zipCode: formData.zipCode || '75201',
          country: selectedCountry.name || 'United States',
        },
        password: formData.password,
        firebaseUid: fbUser.uid,
        emailVerified: true,
      });

      setPendingEmailVerification(null);
      setSuccessAnimation(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account activation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailVerification = async () => {
    if (!pendingEmailVerification) return;
    setCheckingVerification(true);
    setVerificationFeedback(null);
    try {
      await pendingEmailVerification.fbUser.reload();
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
      const isVerified = Boolean(
        auth.currentUser?.emailVerified || pendingEmailVerification.fbUser.emailVerified
      );
      if (isVerified) {
        await completeVerifiedRegistration(
          pendingEmailVerification.fbUser,
          pendingEmailVerification.e164Phone
        );
      } else {
        setVerificationFeedback(
          'Email verification is still pending. Please verify your email before proceeding.'
        );
      }
    } catch (err: any) {
      setVerificationFeedback(err.message || 'Error checking verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-red-100 selection:text-red-900 transition-colors duration-200">
      {/* Top Header / Back Button */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onNavigateAccountSelection || onNavigateHome}
          className="inline-flex items-center text-xs font-semibold text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
          {onNavigateAccountSelection ? 'Back to Account Selection' : 'Back'}
        </button>

        {/* Brand Emblem */}
        <BrandLogo showText imgClassName="h-7 w-auto object-contain" />
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#152033] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {/* Banner */}
        <div className="bg-[#1C2B4C] dark:bg-[#0F172A] px-6 sm:px-8 py-6 text-white relative">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Banking with AURELITH RESERVE
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Opening your {currentAccountOption.name} account with authoritative identity records.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-800 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {pendingEmailVerification ? (
            <div className="py-8 px-4 sm:px-6 space-y-6 text-center animate-fadeIn">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B4C] dark:text-white">
                  Email Verification Required
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                  Check your inbox or spam folder to verify your account.
                </p>
              </div>

              {verificationFeedback && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2.5 text-amber-900 dark:text-amber-200 text-xs text-left max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{verificationFeedback}</span>
                </div>
              )}

              <div className="pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  disabled={checkingVerification || loading}
                  onClick={handleCheckEmailVerification}
                  className="w-full py-3.5 px-6 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {checkingVerification ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      <span>Checking Verification Status...</span>
                    </>
                  ) : (
                    <span>I Have Verified My Email</span>
                  )}
                </button>
              </div>
            </div>
          ) : successAnimation ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Account Initialized Successfully!</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Opening your personalized Aurelith Reserve dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Fields */}
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Middle Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your middle name"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  {/* Searchable Country Code Selector + Phone Input */}
                  <div className="relative" ref={countryDropdownRef}>
                    <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#1C2B4C] dark:focus-within:ring-slate-600 bg-slate-50 dark:bg-[#0B111E]">
                      {/* Country Flag & Dial Code Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="px-2.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-r border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer shrink-0 transition-colors"
                        title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      </button>

                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="Your phone number"
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-transparent text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-sm font-medium focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone format feedback */}
                    {phoneFormatHint && (
                      <div className={`text-[11px] font-medium flex items-center space-x-1.5 mt-1.5 ${
                        phoneFormatValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {phoneFormatValid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        )}
                        <span>{phoneFormatHint}</span>
                      </div>
                    )}

                    {/* Searchable Country Dropdown Modal */}
                    {countryDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-80 max-w-[calc(100vw-3rem)] bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fadeIn">
                        {/* Search Input */}
                        <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#10192A]">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search country or dialing code..."
                              value={countrySearchQuery}
                              onChange={(e) => setCountrySearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1C2B4C] dark:focus:ring-slate-500"
                            />
                          </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 text-xs">
                          {filteredCountries.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs">
                              No matching country calling code found.
                            </div>
                          ) : (
                            filteredCountries.map((c) => (
                              <button
                                key={`${c.isoCode}-${c.dialCode}`}
                                type="button"
                                onClick={() => handleSelectCountry(c)}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                                  selectedCountry.isoCode === c.isoCode && selectedCountry.dialCode === c.dialCode
                                    ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                                    : ''
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <span className="text-base leading-none">{c.flag}</span>
                                  <span className="text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                                </div>
                                <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold text-[11px] ml-2">
                                  {c.dialCode}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | '' })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400 dark:bg-[#10192A] dark:text-slate-400">
                        Select Gender
                      </option>
                      <option value="Male" className="dark:bg-[#10192A] dark:text-slate-100">Male</option>
                      <option value="Female" className="dark:bg-[#10192A] dark:text-slate-100">Female</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none stroke-[2]" />
                  </div>
                </div>
              </div>

              {/* Bank Name Selection (Searchable Dropdown) */}
              <div className="relative" ref={bankDropdownRef}>
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setBankDropdownOpen(!bankDropdownOpen);
                      setBankSearchQuery('');
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      formData.bankName
                        ? 'text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={bankDropdownOpen}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Landmark className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <span className="truncate">
                        {formData.bankName || 'Select Bank'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        bankDropdownOpen ? 'rotate-180 text-[#1C2B4C] dark:text-slate-200' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {bankDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fadeIn">
                      {/* Search Bar */}
                      <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#10192A]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            ref={bankSearchInputRef}
                            type="text"
                            placeholder="Search bank name..."
                            value={bankSearchQuery}
                            onChange={(e) => setBankSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1C2B4C] dark:focus:ring-slate-500"
                          />
                        </div>
                      </div>

                      {/* Bank List */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 text-xs" role="listbox">
                        {filteredBanks.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            No matching bank found.
                          </div>
                        ) : (
                          filteredBanks.map((bank) => {
                            const isSelected = formData.bankName === bank;
                            return (
                              <button
                                key={bank}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, bankName: bank }));
                                  setBankDropdownOpen(false);
                                  setBankSearchQuery('');
                                }}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-slate-100 dark:bg-slate-800 font-bold text-[#1C2B4C] dark:text-white'
                                    : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{bank}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#C8102E] shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Select your primary institution or preferred bank association.
                </p>
              </div>

              {/* Official Government Identification (SSN, Driver's License, State ID, Passport) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Government Identification <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={formData.idType}
                      onChange={(e) => handleIdTypeChange(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 appearance-none cursor-pointer"
                    >
                      <option value="Social Security Number (SSN)">Social Security Number (SSN)</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="State Identification Card">State Identification Card</option>
                      <option value="Passport / Consular ID">Passport / Consular ID</option>
                      <option value="Other Official Government ID">Other Official Government ID</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none stroke-[2]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {formData.idType.includes('SSN') ? 'Social Security Number (SSN)' : 'ID / Document Number'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      placeholder={getIdentityPlaceholder(formData.idType, formData.state, selectedCountry.isoCode)}
                      value={formData.idNumber}
                      onChange={handleIdNumberChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 font-mono"
                    />
                  </div>
                  {/* Dynamic ID Format Hint */}
                  {idFormatHint && (
                    <div className={`text-[11px] font-medium flex items-center space-x-1.5 mt-1.5 ${
                      idFormatValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {idFormatValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                      )}
                      <span>{idFormatHint}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Residential Street Address
                </label>
                <div className="relative mb-3">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Your street address"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Your state or province"
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Your postal code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
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

                <div>
                  <label className="block text-xs font-bold text-[#1C2B4C] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B111E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-sm sm:placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-base sm:text-sm font-medium focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Password Strength</span>
                    <span className="font-semibold text-[#1C2B4C] dark:text-slate-200">
                      {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 1
                          ? 'w-1/4 bg-red-500'
                          : passwordStrength <= 2
                          ? 'w-2/4 bg-amber-500'
                          : passwordStrength <= 3
                          ? 'w-3/4 bg-blue-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Terms & Privacy */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    I acknowledge that I am opening a digital banking profile with Aurelith Reserve. I accept the{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#1C2B4C] dark:text-white font-bold underline hover:text-[#C8102E] dark:hover:text-red-400">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#1C2B4C] dark:text-white font-bold underline hover:text-[#C8102E] dark:hover:text-red-400">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!isFormComplete || loading}
                  className={`w-full py-3.5 px-6 font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center space-x-2 ${
                    !isFormComplete || loading
                      ? 'bg-[#C8102E]/40 opacity-40 text-white/60 cursor-not-allowed shadow-none'
                      : 'bg-[#C8102E] hover:bg-[#A00B22] text-white shadow-md hover:shadow-lg cursor-pointer opacity-100'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Creating Your Account...</span>
                    </>
                  ) : (
                    <span>Complete Account Registration</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Already have an account */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateSignIn}
                className="font-bold text-[#1C2B4C] dark:text-white hover:text-[#C8102E] dark:hover:text-red-400 underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Bottom */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6 space-y-1">
        <p>Aurelith Reserve • Member FDIC • Equal Housing Lender</p>
      </div>
    </div>
  );
};
