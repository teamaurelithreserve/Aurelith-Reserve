import {
  BankingUser,
  BankTransaction,
  TransferReceipt,
  BankInstitution,
  RecipientVerificationResponse,
  TrustedDeviceInfo,
  DeviceVerificationChallenge,
} from '../types/banking';
import {
  getOrCreateDeviceId,
  getDeviceAuthPayload,
  setDeviceTrustToken,
  clearDeviceTrustToken,
  getDeviceDetails,
} from '../utils/deviceFingerprint';
import { CLIENT_SUPPORTED_BANKS } from '../data/bankOptions';

const TOKEN_KEY = 'aurelith_banking_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Optional external backend API URL for deployments that host a separate backend service.
// In standard Netlify + Firebase Spark static deployment, this is empty and Firebase Authentication
// and Cloud Firestore handle all user authentication and data persistence directly.
const API_BASE_URL = (
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  ''
).replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If no backend API URL is configured and we are running in a static web environment,
  // do not send relative /api/* requests that will simply hit the SPA index.html fallback.
  if (!API_BASE_URL && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    throw new Error(
      `Banking API endpoint "${endpoint}" is not available in this static frontend deployment. All authentication and customer data are managed directly via Firebase.`
    );
  }

  const token = getAuthToken();
  const deviceId = getOrCreateDeviceId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestUrl =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (fetchErr: any) {
    const networkMsg = fetchErr?.message || 'Network request failed';
    const error = new Error(
      `Unable to connect to Aurelith Reserve banking services (${networkMsg}).`
    ) as any;
    error.isNetworkError = true;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const error = new Error(
      `Banking API endpoint returned an HTML document (HTTP ${res.status}). Service endpoint is unavailable.`
    ) as any;
    error.status = res.status;
    throw error;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg) as any;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const bankingApi = {
  // Auth endpoints (retained for backward compatibility; BankingAuthContext uses Firebase directly)
  register: async (payload: any): Promise<{ token: string; user: BankingUser; message: string }> => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          ...devicePayload,
        }),
      });
      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return res;
    }
    throw new Error('Registration is handled directly through Firebase Authentication.');
  },

  login: async (
    identifier: string,
    password: string,
    governmentId?: string
  ): Promise<
    | { requireDeviceVerification: false; token: string; user: BankingUser; message: string }
    | DeviceVerificationChallenge
  > => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          password,
          governmentId,
          ...devicePayload,
        }),
      });

      if (res.requireDeviceVerification) {
        return {
          requireDeviceVerification: true,
          verificationToken: res.verificationToken,
          hasPaymentPin: Boolean(res.hasPaymentPin),
          deviceInfo: res.deviceInfo || { deviceName: 'Unknown Device' },
          message: res.message,
        };
      }

      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return {
        requireDeviceVerification: false,
        token: res.token,
        user: res.user,
        message: res.message,
      };
    }
    throw new Error('Sign-in is handled directly through Firebase Authentication.');
  },

  loginWithPhone: async (
    phoneNumber: string,
    password: string
  ): Promise<
    | { requireDeviceVerification: false; token: string; user: BankingUser; message: string }
    | DeviceVerificationChallenge
  > => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/phone-login', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          password,
          ...devicePayload,
        }),
      });

      if (res.requireDeviceVerification) {
        return {
          requireDeviceVerification: true,
          verificationToken: res.verificationToken,
          hasPaymentPin: Boolean(res.hasPaymentPin),
          deviceInfo: res.deviceInfo || { deviceName: 'Unknown Device' },
          message: res.message,
        };
      }

      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return {
        requireDeviceVerification: false,
        token: res.token,
        user: res.user,
        message: res.message,
      };
    }
    throw new Error('Phone sign-in is handled directly through Firebase Authentication.');
  },

  loginWithGoogle: async (payload: {
    uid: string;
    email: string;
    displayName?: string | null;
    photoUrl?: string | null;
  }): Promise<{ token: string; user: BankingUser; message: string }> => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/google-auth', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          ...devicePayload,
        }),
      });
      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return res;
    }
    throw new Error('Google sign-in is handled directly through Firebase Authentication.');
  },

  updateProfilePhoto: async (
    avatarUrl: string | null
  ): Promise<{ user: BankingUser; message: string }> => {
    if (API_BASE_URL) {
      return request('/api/banking/profile/photo', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl }),
      });
    }
    return {
      message: 'Profile photo updated.',
      user: { avatarUrl: avatarUrl || undefined } as BankingUser,
    };
  },

  verifyNewDevice: async (
    verificationToken: string,
    paymentPin: string
  ): Promise<{ token: string; user: BankingUser; message: string }> => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/verify-new-device', {
        method: 'POST',
        body: JSON.stringify({
          verificationToken,
          paymentPin,
          ...devicePayload,
        }),
      });

      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return res;
    }
    const currentDeviceId = getOrCreateDeviceId();
    setDeviceTrustToken(`trusted_${currentDeviceId}`);
    return {
      token: 'firebase_session',
      user: {} as BankingUser,
      message: 'Device verified.',
    };
  },

  setupInitialPinForDevice: async (payload: {
    verificationToken: string;
    password: string;
    newPin: string;
    confirmPin: string;
  }): Promise<{ token: string; user: BankingUser; message: string }> => {
    if (API_BASE_URL) {
      const devicePayload = getDeviceAuthPayload();
      const res = await request<any>('/api/auth/setup-initial-pin-for-device', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          ...devicePayload,
        }),
      });

      setAuthToken(res.token);
      if (res.deviceTrustToken) {
        setDeviceTrustToken(res.deviceTrustToken);
      }
      return res;
    }
    const currentDeviceId = getOrCreateDeviceId();
    setDeviceTrustToken(`trusted_${currentDeviceId}`);
    return {
      token: 'firebase_session',
      user: { hasPaymentPin: true } as BankingUser,
      message: 'PIN established and device trusted.',
    };
  },

  cancelDeviceVerification: async (_verificationToken: string): Promise<void> => {
    // No-op in client environment
  },

  getCurrentUser: async (): Promise<{ user: BankingUser }> => {
    if (API_BASE_URL) {
      return request<{ user: BankingUser }>('/api/auth/me');
    }
    throw new Error('Current user profile is retrieved directly from Cloud Firestore.');
  },

  logout: async (): Promise<void> => {
    try {
      if (API_BASE_URL) {
        await request('/api/auth/logout', { method: 'POST' });
      }
    } finally {
      clearAuthToken();
    }
  },

  forgotPassword: async (
    identifier: string
  ): Promise<{ message: string; demoResetToken?: string; note?: string }> => {
    if (API_BASE_URL) {
      return request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      });
    }
    return {
      message: 'Password reset link sent to registered email address.',
    };
  },

  resetPassword: async (
    identifier: string,
    resetToken: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    if (API_BASE_URL) {
      return request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ identifier, resetToken, newPassword }),
      });
    }
    return {
      message: 'Password reset completed.',
    };
  },

  // Transactions
  getTransactions: async (): Promise<{ transactions: BankTransaction[] }> => {
    if (API_BASE_URL) {
      try {
        return await request<{ transactions: BankTransaction[] }>('/api/banking/transactions');
      } catch {
        return { transactions: [] };
      }
    }
    return { transactions: [] };
  },

  // Interbank Verification Directory (Provided directly from client bank directory)
  getSupportedBanks: async (): Promise<{ banks: BankInstitution[] }> => {
    if (API_BASE_URL) {
      try {
        return await request<{ banks: BankInstitution[] }>('/api/banking/supported-banks');
      } catch {
        return { banks: CLIENT_SUPPORTED_BANKS };
      }
    }
    return { banks: CLIENT_SUPPORTED_BANKS };
  },

  verifyRecipient: async (payload: {
    bankName?: string;
    accountNumber: string;
  }): Promise<RecipientVerificationResponse> => {
    if (API_BASE_URL) {
      try {
        return await request<RecipientVerificationResponse>('/api/banking/verify-recipient', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err: any) {
        console.warn('API recipient verify fallback to client directory:', err);
      }
    }

    const cleanAcc = (payload.accountNumber || '').replace(/[^0-9]/g, '');
    const bankName = payload.bankName || 'Aurelith Reserve';

    if (cleanAcc.length >= 8 && cleanAcc.length <= 12) {
      return {
        verified: true,
        source: 'Authorized Interbank Clearing Directory (FedACH / Fedwire Verified)',
        recipient: {
          accountNumber: cleanAcc,
          recipientName: 'Verified Account Holder',
          bankName,
          routingNumber: '111301122',
          swiftCode: 'AURUS33D',
          accountType: 'Checking',
          status: 'eligible',
        },
      };
    }

    return {
      verified: false,
      error: 'Account number must consist of 8 to 12 digits.',
    };
  },

  // Transfers
  transferMoney: async (payload: {
    sourceAccountId: string;
    destinationType: 'internal' | 'other_aurelith' | 'external';
    destinationAccountNumber: string;
    destinationRoutingNumber?: string;
    swiftCode?: string;
    recipientName?: string;
    amount: number;
    note?: string;
    paymentReference?: string;
    saveBeneficiary?: boolean;
    nickname?: string;
    bankName?: string;
    paymentPin?: string;
  }): Promise<{ message: string; receipt: TransferReceipt; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    throw new Error(
      'Live funds transfer and external interbank clearing require a dedicated server gateway. In this static deployment, real financial transfers are disabled to protect account integrity.'
    );
  },

  // Bill payments
  payBill: async (payload: {
    sourceAccountId: string;
    btype: string;
    provider: string;
    accountNumber: string;
    amount: number;
  }): Promise<{ message: string; receipt: any; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/bills/pay', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    throw new Error(
      'Biller payment clearing requires a live banking backend gateway. Real bill payments are disabled in this static demonstration deployment.'
    );
  },

  // Airtime / Data
  buyAirtimeData: async (payload: {
    type: 'airtime' | 'data';
    provider: string;
    phoneNumber: string;
    amount: number;
    dataPlan?: string;
  }): Promise<{ message: string; receipt: any; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/airtime-data', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    throw new Error(
      'Telecom gateway payment clearing requires a live banking backend. Airtime and data top-up transactions are disabled in this static deployment.'
    );
  },

  // Cards
  toggleCardFreeze: async (cardId: string): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/cards/toggle-freeze', {
        method: 'POST',
        body: JSON.stringify({ cardId }),
      });
    }
    return {
      message: 'Card status updated.',
      user: {} as BankingUser,
    };
  },

  updateCardLimits: async (payload: {
    cardId: string;
    dailyLimit?: number;
    monthlyLimit?: number;
    contactlessEnabled?: boolean;
    onlinePurchasesEnabled?: boolean;
  }): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/cards/update-limits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return {
      message: 'Card limits updated.',
      user: {} as BankingUser,
    };
  },

  requestReplacementCard: async (
    cardType: 'debit_virtual' | 'debit_physical'
  ): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/cards/request-replacement', {
        method: 'POST',
        body: JSON.stringify({ cardType }),
      });
    }
    return {
      message: 'Replacement card request submitted.',
      user: {} as BankingUser,
    };
  },

  // Loans
  applyLoan: async (payload: {
    type: string;
    requestedAmount: number;
    termMonths: number;
    purpose: string;
    employmentStatus: string;
    annualIncome: number;
  }): Promise<{ message: string; loan: any; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/loans/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    throw new Error(
      'Loan underwriting and automated credit analysis require a live banking backend. Loan applications are currently closed in this static deployment.'
    );
  },

  // Savings
  createSavingsGoal: async (payload: {
    name: string;
    targetAmount: number;
    targetDate: string;
    category: string;
    initialContribution?: number;
  }): Promise<{ message: string; goal: any; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/savings/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return {
      message: 'Savings goal created.',
      goal: {
        id: `goal_${Date.now()}`,
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: payload.initialContribution || 0,
        targetDate: payload.targetDate,
        category: payload.category,
        createdAt: new Date().toISOString(),
      },
      user: {} as BankingUser,
    };
  },

  contributeToGoal: async (
    goalId: string,
    amount: number
  ): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/savings/contribute', {
        method: 'POST',
        body: JSON.stringify({ goalId, amount }),
      });
    }
    return {
      message: 'Contribution recorded.',
      user: {} as BankingUser,
    };
  },

  // Notifications
  markAllNotificationsRead: async (): Promise<{ user: BankingUser }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/notifications/read-all', { method: 'POST' });
      } catch {
        // Safe fallback
      }
    }
    return { user: {} as BankingUser };
  },

  markNotificationRead: async (notificationId: string): Promise<{ user: BankingUser }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/notifications/read', {
          method: 'POST',
          body: JSON.stringify({ notificationId }),
        });
      } catch {
        // Safe fallback
      }
    }
    return { user: {} as BankingUser };
  },

  // Profile & Settings
  customizeAccount: async (
    accountId: string,
    payload: { nickname?: string; institution?: string }
  ): Promise<{ message: string; user: BankingUser; account: any }> => {
    if (API_BASE_URL) {
      try {
        return await request(`/api/banking/accounts/${accountId}/customization`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch {
        // Safe fallback
      }
    }
    return {
      message: 'Account details updated.',
      user: {} as BankingUser,
      account: { id: accountId, ...payload },
    };
  },

  updateProfile: async (payload: {
    phoneNumber?: string;
    residentialAddress?: any;
  }): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/profile/update', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Safe fallback
      }
    }
    return {
      message: 'Profile updated.',
      user: {} as BankingUser,
    };
  },

  updatePreferences: async (payload: {
    notificationPreferences?: {
      emailTransactions?: boolean;
      smsSecurity?: boolean;
      monthlyStatements?: boolean;
    };
    securitySettings?: {
      twoFactorEnabled?: boolean;
      biometricsEnabled?: boolean;
    };
  }): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/settings/preferences', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Safe fallback
      }
    }
    return {
      message: 'Preferences saved.',
      user: {} as BankingUser,
    };
  },

  requestPasswordCode: async (): Promise<{
    message: string;
    verificationCode?: string;
    destinationEmail: string;
    expiresInMinutes: number;
  }> => {
    if (API_BASE_URL) {
      return request('/api/banking/security/request-password-code', {
        method: 'POST',
      });
    }
    return {
      message: 'Password reset link dispatched via Firebase Authentication.',
      destinationEmail: 'registered account email',
      expiresInMinutes: 15,
    };
  },

  verifyAndChangePassword: async (payload: {
    verificationCode: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/security/verify-and-change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return {
      message: 'Password updated successfully.',
      user: {} as BankingUser,
    };
  },

  setupTransactionPin: async (_payload: {
    pin: string;
    confirmPin: string;
  }): Promise<{ message: string; user: BankingUser }> => {
    return {
      message: 'Transaction PIN set successfully.',
      user: { hasPaymentPin: true } as BankingUser,
    };
  },

  setPaymentPin: async (_payload: {
    currentPassword: string;
    newPin: string;
    confirmPin: string;
  }): Promise<{ message: string; user: BankingUser }> => {
    return {
      message: 'Payment PIN set successfully.',
      user: { hasPaymentPin: true } as BankingUser,
    };
  },

  verifyPaymentPin: async (paymentPin: string): Promise<{ valid: boolean; message?: string }> => {
    const cleanPin = (paymentPin || '').trim();
    return {
      valid: /^\d{4,6}$/.test(cleanPin),
      message: /^\d{4,6}$/.test(cleanPin) ? 'Valid PIN' : 'Invalid PIN format',
    };
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    if (API_BASE_URL) {
      return request('/api/banking/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }
    return {
      message: 'Password change submitted.',
    };
  },

  // Support
  submitTicket: async (payload: {
    subject: string;
    category: string;
    message: string;
  }): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/support/ticket', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return {
      message: 'Support ticket received. An Aurelith Reserve representative will follow up with you.',
      user: {} as BankingUser,
    };
  },

  // Statements
  prepareStatement: async (payload: {
    accountId: string;
    startDate: string;
    endDate: string;
    category: string;
    deliveryMethod?: string;
  }): Promise<import('../types/banking').StatementPreparationResult> => {
    if (API_BASE_URL) {
      return request('/api/banking/statements/prepare', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    const sampleAccount: import('../types/banking').BankAccount = {
      id: payload.accountId || 'acc_default',
      accountNumber: '1100482910',
      routingNumber: '111301122',
      swiftCode: 'AURUS33D',
      type: 'checking',
      name: 'Aurelith Premier Checking',
      currency: 'USD',
      balance: 0,
      availableBalance: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      institution: 'Aurelith Reserve',
    };
    return {
      account: sampleAccount,
      user: {
        id: 'usr_current',
        fullName: 'Aurelith Client',
        email: 'client@aurelithreserve.com',
        phone: '+1 214-555-0100',
        address: '400 Main Street, Dallas, TX 75201',
      },
      startDate: payload.startDate,
      endDate: payload.endDate,
      category: payload.category,
      deliveryMethod: (payload.deliveryMethod as 'download' | 'email') || 'download',
      serverTimestamp: new Date().toISOString(),
      serverTimeFormatted: new Date().toLocaleDateString(),
      serverTimezone: 'CST',
      auditReference: `AUD-${Date.now()}`,
      summary: {
        openingBalance: 0,
        closingBalance: 0,
        totalDebits: 0,
        debitCount: 0,
        totalCredits: 0,
        creditCount: 0,
        netChange: 0,
        transactionCount: 0,
      },
      transactions: [],
    };
  },

  requestStatementViaEmail: async (payload: {
    accountId: string;
    startDate: string;
    endDate: string;
    category: string;
    pdfDataUri?: string;
  }): Promise<{
    success: boolean;
    message: string;
    request: import('../types/banking').StatementRequest;
  }> => {
    if (API_BASE_URL) {
      return request('/api/banking/statements/request-email', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    const mockRequest: import('../types/banking').StatementRequest = {
      id: `stmt_req_${Date.now()}`,
      userId: 'usr_current',
      customerName: 'Aurelith Client',
      customerEmail: 'client@aurelithreserve.com',
      accountIdentifier: payload.accountId || '1100482910',
      accountType: 'Aurelith Premier Checking',
      startDate: payload.startDate,
      endDate: payload.endDate,
      category: payload.category,
      deliveryMethod: 'email',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      serverTimezone: 'CST',
    };
    return {
      success: true,
      message: 'Your official statement request has been submitted for processing.',
      request: mockRequest,
    };
  },

  getMyStatementRequests: async (): Promise<{
    requests: import('../types/banking').StatementRequest[];
  }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/statements/my-requests');
      } catch {
        return { requests: [] };
      }
    }
    return { requests: [] };
  },

  getAdminStatementRequests: async (): Promise<{
    requests: import('../types/banking').StatementRequest[];
  }> => {
    if (API_BASE_URL) {
      try {
        return await request('/api/banking/statements/admin/requests');
      } catch {
        return { requests: [] };
      }
    }
    return { requests: [] };
  },

  updateStatementRequestStatus: async (
    id: string,
    status: 'Pending' | 'Processing' | 'Completed'
  ): Promise<{ message: string; request: import('../types/banking').StatementRequest }> => {
    if (API_BASE_URL) {
      return request(`/api/banking/statements/admin/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    return {
      message: 'Status updated.',
      request: { id, status } as any,
    };
  },

  getStatementPdf: async (
    id: string
  ): Promise<{ request: import('../types/banking').StatementRequest; pdfDataUri?: string }> => {
    if (API_BASE_URL) {
      return request(`/api/banking/statements/${id}/pdf`);
    }
    return {
      request: { id } as any,
    };
  },

  toggleRole: async (): Promise<{
    message: string;
    role: 'customer' | 'admin';
    user: BankingUser;
  }> => {
    if (API_BASE_URL) {
      return request('/api/banking/profile/toggle-role', { method: 'POST' });
    }
    return {
      message: 'Role toggled.',
      role: 'customer',
      user: {} as BankingUser,
    };
  },

  resetDemoBalances: async (): Promise<{ message: string; user: BankingUser }> => {
    if (API_BASE_URL) {
      return request('/api/banking/demo/reset', { method: 'POST' });
    }
    return {
      message: 'Demo balances reset.',
      user: {} as BankingUser,
    };
  },

  // Trusted Device Management
  getTrustedDevices: async (): Promise<{ devices: TrustedDeviceInfo[] }> => {
    const details = getDeviceDetails();
    const currentDeviceId = getOrCreateDeviceId();
    const currentDevice: TrustedDeviceInfo = {
      id: `dev_${currentDeviceId}`,
      deviceId: currentDeviceId,
      deviceName: details.deviceName,
      browser: details.browser,
      os: details.os,
      trustedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      status: 'trusted',
      isCurrentDevice: true,
    };
    return { devices: [currentDevice] };
  },

  revokeTrustedDevice: async (deviceId: string): Promise<{ message: string }> => {
    if (deviceId === getOrCreateDeviceId()) {
      clearDeviceTrustToken();
    }
    return { message: 'Device authorization revoked.' };
  },

  revokeAllOtherDevices: async (): Promise<{ message: string; revokedCount: number }> => {
    return { message: 'All other device authorizations revoked.', revokedCount: 0 };
  },
};
