export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  type: 'checking' | 'savings';
  name: string;
  nickname?: string;
  institution?: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: 'active' | 'frozen';
  createdAt: string;
}

export interface BankCard {
  id: string;
  accountId: string;
  cardType: 'debit_virtual' | 'debit_physical';
  cardHolderName: string;
  last4: string;
  cardMaskedNumber: string;
  expiryMonth: string;
  expiryYear: string;
  status: 'active' | 'frozen';
  dailyLimit: number;
  monthlyLimit: number;
  contactlessEnabled: boolean;
  onlinePurchasesEnabled: boolean;
}

export interface BankBeneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  nickname?: string;
  createdAt: string;
}

export interface BankSavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  createdAt: string;
}

export interface BankLoan {
  id: string;
  type: string;
  requestedAmount: number;
  approvedAmount: number;
  remainingBalance: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  purpose: string;
  status: 'approved' | 'under_review' | 'completed';
  applicationDate: string;
}

export interface BankNotification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'loan' | 'general';
  read: boolean;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  reference: string;
  userId: string;
  accountId: string;
  type: 'transfer' | 'bill_payment' | 'airtime' | 'data' | 'deposit' | 'loan_disbursement' | 'card_purchase';
  category: string;
  amount: number;
  direction: 'debit' | 'credit';
  description: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientBank?: string;
  status: 'completed' | 'pending' | 'failed';
  fee: number;
  timestamp: string;
  balanceAfter: number;
}

export interface BankingUser {
  id: string;
  clientId?: string;
  role?: 'customer' | 'admin';
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender?: 'Male' | 'Female';
  idType?: string;
  idNumber?: string;
  governmentId?: string;
  residentialAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'active' | 'pending_verification';
  createdAt: string;
  hasPaymentPin?: boolean;
  securitySettings?: {
    twoFactorEnabled: boolean;
    biometricsEnabled: boolean;
  };
  notificationPreferences?: {
    emailTransactions: boolean;
    smsSecurity: boolean;
    monthlyStatements: boolean;
  };
  accounts: BankAccount[];
  cards: BankCard[];
  beneficiaries: BankBeneficiary[];
  savingsGoals: BankSavingsGoal[];
  loans: BankLoan[];
  notifications: BankNotification[];
  trustedDevices?: TrustedDeviceInfo[];
  avatarUrl?: string;
  photoDataUrl?: string;
  bankName?: string;
  firebaseUid?: string;
  emailVerified?: boolean;
}

export interface TrustedDeviceInfo {
  id: string;
  deviceId: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  trustedAt: string;
  lastUsedAt: string;
  status: 'trusted' | 'revoked';
  isCurrentDevice?: boolean;
}

export interface DeviceVerificationChallenge {
  requireDeviceVerification: true;
  verificationToken: string;
  hasPaymentPin: boolean;
  deviceInfo: {
    deviceName: string;
    ipAddress?: string;
    browser?: string;
    os?: string;
  };
  message?: string;
}

export interface TransferReceipt {
  reference: string;
  amount: number;
  fee: number;
  sourceAccountName: string;
  sourceAccountNumber: string;
  recipientName: string;
  recipientAccountNumber: string;
  recipientBank?: string;
  routingNumber?: string;
  swiftCode?: string;
  paymentReference?: string;
  timestamp: string;
  status: string;
  newBalance: number;
}

export type StatementCategory =
  | 'Entire Account Statement'
  | 'Utility Bill Payments'
  | 'Water Bill Payments'
  | 'Airtime Purchases'
  | 'Incoming Transfers (Inflows)'
  | 'Outgoing Transfers (Outflows)';

export type StatementDeliveryMethod = 'download' | 'email';

export interface StatementRequest {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  accountIdentifier: string;
  accountType: string;
  startDate: string;
  endDate: string;
  category: string;
  deliveryMethod: 'download' | 'email';
  status: 'Pending' | 'Processing' | 'Completed';
  createdAt: string;
  serverTimestamp: string;
  serverTimezone: string;
  pdfDataUri?: string;
  statementSummary?: {
    totalDebits: number;
    totalCredits: number;
    openingBalance: number;
    closingBalance: number;
    transactionCount: number;
  };
}

export interface StatementPreparationResult {
  account: BankAccount;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  category: string;
  deliveryMethod: 'download' | 'email';
  serverTimestamp: string;
  serverTimeFormatted: string;
  serverTimezone: string;
  auditReference: string;
  summary: {
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    debitCount: number;
    totalCredits: number;
    creditCount: number;
    netChange: number;
    transactionCount: number;
  };
  transactions: BankTransaction[];
}

export interface BankInstitution {
  id: string;
  name: string;
  shortName: string;
  routingNumber: string;
  swiftCode: string;
  country: string;
  countryCode?: string;
  currency?: string;
  supportedRails: string[];
}

export interface VerifiedRecipientAccount {
  accountNumber: string;
  recipientName: string;
  bankName: string;
  routingNumber: string;
  swiftCode: string;
  accountType: string;
  status: 'eligible' | 'ineligible';
  notes?: string;
}

export interface RecipientVerificationResponse {
  verified: boolean;
  error?: string;
  recipient?: VerifiedRecipientAccount;
  requiresBankSelection?: boolean;
  ambiguousBanks?: string[];
  source?: string;
}
