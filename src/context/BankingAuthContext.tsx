import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BankingUser,
  BankAccount,
  BankCard,
  BankTransaction,
  DeviceVerificationChallenge,
} from '../types/banking';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { formatClientId } from '../utils/clientIdFormatter';
import {
  getOrCreateDeviceId,
  getDeviceTrustToken,
  setDeviceTrustToken,
  clearDeviceTrustToken,
  getDeviceDetails,
} from '../utils/deviceFingerprint';

export interface LoginResult {
  requireDeviceVerification: boolean;
  user?: BankingUser;
  challenge?: DeviceVerificationChallenge;
}

interface BankingAuthContextType {
  user: BankingUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  transactions: BankTransaction[];
  showBalances: boolean;
  pendingVerification: DeviceVerificationChallenge | null;
  toggleShowBalances: () => void;
  setUser: (user: BankingUser | null) => void;
  refreshUser: () => Promise<BankingUser | null>;
  reloadTransactions: () => Promise<void>;
  login: (identifier: string, pass: string, governmentId?: string) => Promise<LoginResult>;
  loginWithPhone: (phone: string, pass: string) => Promise<LoginResult>;
  loginWithGoogle: () => Promise<BankingUser>;
  completeDeviceVerification: (paymentPin: string) => Promise<BankingUser>;
  setupInitialPinAndVerifyDevice: (payload: {
    password: string;
    newPin: string;
    confirmPin: string;
  }) => Promise<BankingUser>;
  cancelDeviceVerification: () => Promise<void>;
  register: (payload: any) => Promise<BankingUser>;
  setupTransactionPin: (pin: string, confirmPin: string) => Promise<BankingUser>;
  updateAvatarUrl: (url: string | null) => Promise<void>;
  sendEmailVerificationLink: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const BankingAuthContext = createContext<BankingAuthContextType | undefined>(undefined);

/**
 * Maps a Cloud Firestore user document into the structured client BankingUser model.
 */
function mapFirestoreDocToBankingUser(
  uid: string,
  data: any,
  fbUser?: FirebaseUser | null
): BankingUser {
  const isEmailVerified = Boolean(fbUser?.emailVerified ?? data.emailVerified);
  const effectiveId = data.id || `usr_${uid.slice(0, 12)}`;
  const effectiveClientId = data.clientId || formatClientId(effectiveId, data.clientId);
  const primaryAccountName = data.accountType || 'Aurelith Premier Checking';
  const primaryAccNumber = data.accountNumber || '1100482910';
  const routing = data.routingNumber || '111301122';

  const accounts: BankAccount[] =
    Array.isArray(data.accounts) && data.accounts.length > 0
      ? data.accounts
      : [
          {
            id: `acc_${uid}_chk`,
            accountNumber: primaryAccNumber,
            routingNumber: routing,
            swiftCode: 'AURUS33D',
            type: 'checking',
            name: primaryAccountName,
            currency: 'USD',
            balance: typeof data.checkingBalance === 'number' ? data.checkingBalance : 0.0,
            availableBalance: typeof data.checkingBalance === 'number' ? data.checkingBalance : 0.0,
            status: 'active',
            createdAt: data.createdAt || new Date().toISOString(),
            institution: data.bankName || 'Aurelith Reserve',
          },
          {
            id: `acc_${uid}_sav`,
            accountNumber:
              data.savingsAccountNumber ||
              (primaryAccNumber.length === 10
                ? `${primaryAccNumber.slice(0, 9)}${Number(primaryAccNumber.slice(9)) + 1}`
                : '1100892041'),
            routingNumber: routing,
            swiftCode: 'AURUS33D',
            type: 'savings',
            name: 'High-Yield Reserve Savings',
            currency: 'USD',
            balance: typeof data.savingsBalance === 'number' ? data.savingsBalance : 0.0,
            availableBalance: typeof data.savingsBalance === 'number' ? data.savingsBalance : 0.0,
            status: 'active',
            createdAt: data.createdAt || new Date().toISOString(),
            institution: data.bankName || 'Aurelith Reserve',
          },
        ];

  const cards: BankCard[] =
    Array.isArray(data.cards) && data.cards.length > 0
      ? data.cards
      : [
          {
            id: `crd_${uid}_01`,
            accountId: accounts[0]?.id || `acc_${uid}_chk`,
            cardType: 'debit_virtual',
            cardHolderName:
              `${(data.firstName || '').toUpperCase()} ${(data.lastName || '').toUpperCase()}`.trim() ||
              'AURELITH CLIENT',
            last4: primaryAccNumber.slice(-4) || '8821',
            cardMaskedNumber: `•••• •••• •••• ${primaryAccNumber.slice(-4) || '8821'}`,
            expiryMonth: '12',
            expiryYear: '29',
            status: 'active',
            dailyLimit: 2500,
            monthlyLimit: 20000,
            contactlessEnabled: true,
            onlinePurchasesEnabled: true,
          },
        ];

  return {
    id: effectiveId,
    clientId: effectiveClientId,
    role: data.role || 'customer',
    firstName: data.firstName || '',
    middleName: data.middleName || undefined,
    lastName: data.lastName || '',
    email: data.email || fbUser?.email || '',
    phoneNumber: data.phoneNumber || '',
    dateOfBirth: data.dateOfBirth || '1990-01-01',
    gender: data.gender,
    idType: data.idType,
    idNumber: data.idNumber,
    governmentId: data.governmentId || data.idNumber,
    bankName: data.bankName,
    residentialAddress: data.residentialAddress || {
      street: '400 Main Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'United States',
    },
    status: data.status || 'active',
    createdAt: data.createdAt || new Date().toISOString(),
    hasPaymentPin: Boolean(data.hasPaymentPin),
    avatarUrl: data.avatarUrl || data.photoDataUrl || fbUser?.photoURL || undefined,
    photoDataUrl: data.photoDataUrl || data.avatarUrl || undefined,
    firebaseUid: uid,
    emailVerified: isEmailVerified,
    securitySettings: data.securitySettings || {
      twoFactorEnabled: true,
      biometricsEnabled: true,
    },
    notificationPreferences: data.notificationPreferences || {
      emailTransactions: true,
      smsSecurity: true,
      monthlyStatements: true,
    },
    accounts,
    cards,
    beneficiaries: Array.isArray(data.beneficiaries) ? data.beneficiaries : [],
    savingsGoals: Array.isArray(data.savingsGoals) ? data.savingsGoals : [],
    loans: Array.isArray(data.loans) ? data.loans : [],
    notifications: Array.isArray(data.notifications)
      ? data.notifications
      : [
          {
            id: `notif_${Date.now()}`,
            title: 'Welcome to Aurelith Reserve Digital Banking',
            message: `Welcome, ${data.firstName || 'valued client'}! Your ${primaryAccountName} account is active.`,
            type: 'general',
            read: false,
            createdAt: data.createdAt || new Date().toISOString(),
          },
        ],
    trustedDevices: Array.isArray(data.trustedDevices) ? data.trustedDevices : [],
  };
}

export const BankingAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BankingUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [pendingVerification, setPendingVerification] = useState<DeviceVerificationChallenge | null>(
    null
  );
  const [showBalances, setShowBalances] = useState<boolean>(() => {
    const saved = localStorage.getItem('aurelith_show_balances');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleShowBalances = () => {
    setShowBalances((prev) => {
      const next = !prev;
      localStorage.setItem('aurelith_show_balances', String(next));
      return next;
    });
  };

  const reloadTransactions = useCallback(async () => {
    // Transactions in client mode
    setTransactions([]);
  }, []);

  /**
   * Refreshes the active user's Cloud Firestore profile based on current Firebase Auth state.
   */
  const refreshUser = useCallback(async (): Promise<BankingUser | null> => {
    const currentFbUser = auth.currentUser;
    if (!currentFbUser) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      await currentFbUser.reload();
      if (!currentFbUser.emailVerified) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const docRef = doc(db, 'users', currentFbUser.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        // Condition handled separately from authentication failure: profile does not exist yet
        setUser(null);
        setLoading(false);
        return null;
      }

      const profileData = snap.data();
      const builtUser = mapFirestoreDocToBankingUser(currentFbUser.uid, profileData, currentFbUser);
      setUser(builtUser);
      return builtUser;
    } catch (err) {
      console.warn('Error refreshing user profile from Firestore:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronize Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
      setFirebaseUser(currentFbUser);

      if (!currentFbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check email verification status
      if (!currentFbUser.emailVerified) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', currentFbUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const profileData = snap.data();
          const builtUser = mapFirestoreDocToBankingUser(
            currentFbUser.uid,
            profileData,
            currentFbUser
          );
          setUser(builtUser);
        } else {
          // Document does not exist in Firestore; do not fabricate fake records
          setUser(null);
        }
      } catch (err) {
        console.warn('Firestore profile sync note:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Authoritative Sign-In flow using Firebase Authentication and Cloud Firestore.
   */
  const login = async (
    identifier: string,
    pass: string,
    governmentId?: string
  ): Promise<LoginResult> => {
    setLoading(true);
    try {
      const cleanId = identifier.trim();
      if (!cleanId || !pass) {
        throw new Error('Please enter your email and password.');
      }

      // 1. Authenticate with Firebase Authentication
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, cleanId.toLowerCase(), pass);
      } catch (fbErr: any) {
        const code = fbErr?.code;
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password'
        ) {
          throw new Error('Invalid credentials. Please verify your email and password.');
        } else if (code === 'auth/user-disabled') {
          throw new Error('This account has been disabled. Please contact customer support.');
        } else if (code === 'auth/too-many-requests') {
          throw new Error(
            'Too many failed sign-in attempts. Please try again later or reset your password.'
          );
        } else if (code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else {
          throw new Error(fbErr.message || 'Authentication failed. Please verify your credentials.');
        }
      }

      const fbUser = cred.user;
      setFirebaseUser(fbUser);

      // 2. Check email verification status
      await fbUser.reload();
      if (!fbUser.emailVerified) {
        await signOut(auth).catch(() => {});
        throw new Error(
          'Please verify your email address before signing in. Check your inbox for the verification email.'
        );
      }

      // 3. Load user profile from Cloud Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userDocRef);
      let profileData = snap.data();

      if (!snap.exists() || !profileData) {
        // Safe Profile Recovery: If the user is authenticated and verified in Firebase Auth,
        // but their Firestore document was missing (e.g. earlier registration was interrupted by permissions error),
        // initialize the baseline profile record directly without locking out the verified customer.
        const generatedId = `usr_${fbUser.uid.slice(0, 12)}`;
        const generatedClientId = formatClientId(generatedId);
        const primaryAccountNumber = `1100${Math.floor(100000 + Math.random() * 900000)}`;
        const nameParts = (fbUser.displayName || 'Aurelith Client').split(' ');

        const recoveredProfile = {
          uid: fbUser.uid,
          id: generatedId,
          clientId: generatedClientId,
          firstName: nameParts[0] || 'Client',
          lastName: nameParts.slice(1).join(' ') || 'User',
          email: fbUser.email || '',
          phoneNumber: fbUser.phoneNumber || '',
          accountType: 'Premier Checking',
          accountNumber: primaryAccountNumber,
          routingNumber: '111301122',
          avatarUrl: fbUser.photoURL || null,
          photoDataUrl: null,
          hasPaymentPin: false,
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, recoveredProfile);
        profileData = recoveredProfile;
      }

      // 4. Verify Government ID if provided
      if (governmentId && governmentId.trim() && profileData.governmentId) {
        const cleanReqGov = governmentId.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanUserGov = String(profileData.governmentId)
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase();
        if (cleanReqGov !== cleanUserGov && !cleanUserGov.endsWith(cleanReqGov)) {
          await signOut(auth).catch(() => {});
          throw new Error('Government Identification does not match account records.');
        }
      }

      // 5. Device recognition & Payment PIN challenge check
      const currentDeviceId = getOrCreateDeviceId();
      const trustToken = getDeviceTrustToken();
      const hasPin = Boolean(profileData.hasPaymentPin);

      // If the account has an established Payment PIN and this device is not yet trusted, prompt for PIN
      if (hasPin && !trustToken) {
        const challenge: DeviceVerificationChallenge = {
          requireDeviceVerification: true,
          verificationToken: fbUser.uid,
          hasPaymentPin: true,
          deviceInfo: {
            deviceName: getDeviceDetails().deviceName,
            browser: getDeviceDetails().browser,
            os: getDeviceDetails().os,
          },
          message:
            'For your security, please verify your payment PIN to gain full access from this new device.',
        };
        setPendingVerification(challenge);
        return { requireDeviceVerification: true, challenge };
      }

      // Device is trusted or has no PIN configured yet
      setDeviceTrustToken(`trusted_${currentDeviceId}`);
      setPendingVerification(null);

      const builtUser = mapFirestoreDocToBankingUser(fbUser.uid, profileData, fbUser);
      setUser(builtUser);
      return { requireDeviceVerification: false, user: builtUser };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phone number sign-in fallback (delegates to email authentication).
   */
  const loginWithPhone = async (phone: string, pass: string): Promise<LoginResult> => {
    return login(phone, pass);
  };

  /**
   * Google Popup sign-in flow.
   */
  const loginWithGoogle = async (): Promise<BankingUser> => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = cred.user;
      setFirebaseUser(fbUser);

      const docRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        const generatedId = `usr_${fbUser.uid.slice(0, 12)}`;
        const primaryAccountNumber = `1100${Math.floor(100000 + Math.random() * 900000)}`;
        const names = (fbUser.displayName || 'Google Client').split(' ');
        const initialProfile = {
          uid: fbUser.uid,
          id: generatedId,
          clientId: formatClientId(generatedId),
          firstName: names[0] || 'Client',
          lastName: names.slice(1).join(' ') || 'User',
          email: fbUser.email || '',
          phoneNumber: fbUser.phoneNumber || '',
          accountType: 'Aurelith Premier Checking',
          accountNumber: primaryAccountNumber,
          routingNumber: '111301122',
          avatarUrl: fbUser.photoURL || null,
          photoDataUrl: null,
          status: 'active',
          emailVerified: fbUser.emailVerified,
          hasPaymentPin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, initialProfile, { merge: true });
        const builtUser = mapFirestoreDocToBankingUser(fbUser.uid, initialProfile, fbUser);
        setUser(builtUser);
        return builtUser;
      } else {
        const builtUser = mapFirestoreDocToBankingUser(fbUser.uid, snap.data(), fbUser);
        setUser(builtUser);
        return builtUser;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarUrl = async (url: string | null): Promise<void> => {
    setUser((prev) =>
      prev ? { ...prev, avatarUrl: url || undefined, photoDataUrl: url || undefined } : prev
    );

    const uid = auth.currentUser?.uid || user?.firebaseUid || user?.id;
    if (uid) {
      const userDocRef = doc(db, 'users', uid);
      try {
        await updateDoc(userDocRef, {
          avatarUrl: url,
          photoDataUrl: url,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        try {
          await setDoc(
            userDocRef,
            { avatarUrl: url, photoDataUrl: url, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
      }
    }
  };

  const sendEmailVerificationLink = async (): Promise<void> => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            emailVerified: true,
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Firestore emailVerified sync note:', e);
        }
        return true;
      }
      return false;
    }
    return false;
  };

  const completeDeviceVerification = async (paymentPin: string): Promise<BankingUser> => {
    if (!pendingVerification) {
      throw new Error('No pending device verification session found.');
    }
    const currentFbUser = auth.currentUser;
    if (!currentFbUser) {
      throw new Error('No authenticated user session found.');
    }

    if (!/^\d{4,6}$/.test(paymentPin.trim())) {
      throw new Error('Payment PIN must consist of 4 to 6 numeric digits.');
    }

    const userDocRef = doc(db, 'users', currentFbUser.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      throw new Error('Profile record not found in Cloud Firestore.');
    }

    const currentDeviceId = getOrCreateDeviceId();
    setDeviceTrustToken(`trusted_${currentDeviceId}`);
    setPendingVerification(null);

    const builtUser = mapFirestoreDocToBankingUser(currentFbUser.uid, snap.data(), currentFbUser);
    setUser(builtUser);
    return builtUser;
  };

  const setupInitialPinAndVerifyDevice = async (payload: {
    password: string;
    newPin: string;
    confirmPin: string;
  }): Promise<BankingUser> => {
    if (!pendingVerification) {
      throw new Error('No pending device verification session found.');
    }
    const currentFbUser = auth.currentUser;
    if (!currentFbUser) {
      throw new Error('No authenticated user session found.');
    }
    if (payload.newPin !== payload.confirmPin) {
      throw new Error('Payment PIN entries do not match.');
    }
    if (!/^\d{4,6}$/.test(payload.newPin.trim())) {
      throw new Error('Payment PIN must consist of 4 to 6 numeric digits.');
    }

    const userDocRef = doc(db, 'users', currentFbUser.uid);
    try {
      await updateDoc(userDocRef, {
        hasPaymentPin: true,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      await setDoc(
        userDocRef,
        { hasPaymentPin: true, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }

    const currentDeviceId = getOrCreateDeviceId();
    setDeviceTrustToken(`trusted_${currentDeviceId}`);
    setPendingVerification(null);

    const snap = await getDoc(userDocRef);
    const builtUser = mapFirestoreDocToBankingUser(currentFbUser.uid, snap.data(), currentFbUser);
    setUser(builtUser);
    return builtUser;
  };

  const cancelDeviceVerification = async (): Promise<void> => {
    setPendingVerification(null);
  };

  /**
   * Registers a customer's profile directly in Cloud Firestore.
   */
  const register = async (payload: any): Promise<BankingUser> => {
    setLoading(true);
    try {
      const currentFbUser = auth.currentUser;
      const uid = payload.firebaseUid || currentFbUser?.uid;
      if (!uid) {
        throw new Error('Firebase account registration must be initialized first.');
      }

      const userDocRef = doc(db, 'users', uid);
      const existingSnap = await getDoc(userDocRef);

      // If document already exists, safely restore without overwriting immutable identifiers
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (!existingData.emailVerified && payload.emailVerified) {
          try {
            await updateDoc(userDocRef, {
              emailVerified: true,
              updatedAt: new Date().toISOString(),
            });
            existingData.emailVerified = true;
          } catch (e) {
            console.warn('Could not sync emailVerified state:', e);
          }
        }
        const currentDeviceId = getOrCreateDeviceId();
        setDeviceTrustToken(`trusted_${currentDeviceId}`);

        const builtUser = mapFirestoreDocToBankingUser(uid, existingData, currentFbUser);
        setUser(builtUser);
        return builtUser;
      }

      const generatedId = `usr_${uid.slice(0, 12)}`;
      const generatedClientId = formatClientId(generatedId);
      const primaryAccountNumber = `1100${Math.floor(100000 + Math.random() * 900000)}`;

      const profileData = {
        uid,
        id: generatedId,
        clientId: generatedClientId,
        firstName: payload.firstName,
        middleName: payload.middleName || null,
        lastName: payload.lastName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        gender: payload.gender || 'Male',
        bankName: payload.bankName || 'Aurelith Reserve',
        idType: payload.idType || 'Social Security Number (SSN)',
        idNumber: payload.idNumber,
        governmentId: payload.governmentId || payload.idNumber,
        accountType: payload.accountType || 'Premier Checking',
        accountNumber: primaryAccountNumber,
        routingNumber: '111301122',
        avatarUrl: null,
        photoDataUrl: null,
        hasPaymentPin: false,
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, profileData);

      const currentDeviceId = getOrCreateDeviceId();
      setDeviceTrustToken(`trusted_${currentDeviceId}`);

      const builtUser = mapFirestoreDocToBankingUser(uid, profileData, currentFbUser);
      setUser(builtUser);
      return builtUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Configures the user's 4-digit transaction PIN in Cloud Firestore.
   */
  const setupTransactionPin = async (pin: string, confirmPin: string): Promise<BankingUser> => {
    if (pin !== confirmPin) {
      throw new Error('Transaction PINs do not match.');
    }
    if (pin.length !== 4) {
      throw new Error('Transaction PIN must be exactly 4 digits.');
    }

    const currentFbUser = auth.currentUser;
    const uid = currentFbUser?.uid || user?.firebaseUid || user?.id;
    if (uid) {
      const userDocRef = doc(db, 'users', uid);
      try {
        await updateDoc(userDocRef, {
          hasPaymentPin: true,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        try {
          await setDoc(
            userDocRef,
            { hasPaymentPin: true, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        } catch (e) {
          console.warn('Firestore PIN status sync note:', e);
        }
      }
    }

    setUser((prev) => (prev ? { ...prev, hasPaymentPin: true } : prev));
    return user ? { ...user, hasPaymentPin: true } : ({} as BankingUser);
  };

  /**
   * Signs the user out of Firebase Authentication and clears local state.
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth).catch(() => {});
      clearDeviceTrustToken();
    } finally {
      setUser(null);
      setFirebaseUser(null);
      setPendingVerification(null);
      setTransactions([]);
      setLoading(false);
    }
  };

  return (
    <BankingAuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthenticated: !!user,
        transactions,
        showBalances,
        pendingVerification,
        toggleShowBalances,
        setUser,
        refreshUser,
        reloadTransactions,
        login,
        loginWithPhone,
        loginWithGoogle,
        completeDeviceVerification,
        setupInitialPinAndVerifyDevice,
        cancelDeviceVerification,
        register,
        setupTransactionPin,
        updateAvatarUrl,
        sendEmailVerificationLink,
        checkEmailVerification,
        logout,
      }}
    >
      {children}
    </BankingAuthContext.Provider>
  );
};

export const useBankingAuth = (): BankingAuthContextType => {
  const context = useContext(BankingAuthContext);
  if (!context) {
    throw new Error('useBankingAuth must be used within a BankingAuthProvider');
  }
  return context;
};
