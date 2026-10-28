import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserAccount {
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

export interface UserCard {
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

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  nickname?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  type: string;
  requestedAmount: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  purpose: string;
  status: 'approved' | 'under_review' | 'completed';
  applicationDate: string;
  approvedAmount: number;
  remainingBalance: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'loan' | 'general';
  read: boolean;
  createdAt: string;
}

export interface Transaction {
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

export interface UserRecord {
  id: string;
  clientId?: string;
  role?: 'customer' | 'admin';
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string; // e.g. +12145550189
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
  passwordHash: string;
  salt: string;
  paymentPinHash?: string;
  paymentPinSalt?: string;
  securitySettings?: {
    twoFactorEnabled: boolean;
    biometricsEnabled: boolean;
  };
  notificationPreferences?: {
    emailTransactions: boolean;
    smsSecurity: boolean;
    monthlyStatements: boolean;
  };
  pendingPasswordReset?: {
    token: string;
    expiresAt: number;
  };
  status: 'active' | 'pending_verification';
  createdAt: string;
  accounts: UserAccount[];
  cards: UserCard[];
  beneficiaries: Beneficiary[];
  savingsGoals: SavingsGoal[];
  loans: LoanApplication[];
  notifications: AppNotification[];
  trustedDevices?: TrustedDevice[];
  avatarUrl?: string;
  photoDataUrl?: string;
  bankName?: string;
  firebaseUid?: string;
  emailVerified?: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceId: string;
  deviceTrustToken: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  trustedAt: string;
  lastUsedAt: string;
  status: 'trusted' | 'revoked';
}

export interface PendingDeviceVerification {
  token: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  attempts: number;
  lockoutUntil?: number;
  createdAt: number;
  expiresAt: number;
}

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

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface BankingDatabase {
  users: UserRecord[];
  transactions: Transaction[];
  sessions: Record<string, { userId: string; expiresAt: number; status?: 'active' | 'pending_device_verification' }>;
  pendingVerifications?: Record<string, PendingDeviceVerification>;
  supportTickets: SupportTicket[];
  statementRequests: StatementRequest[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'banking-db.json');

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Password hashing helpers
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = crypto.scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(derivedHash, storedHashBuffer);
  } catch {
    return false;
  }
}

// Generator helpers
export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function generateAccountNumber(): string {
  // 10 digits starting with 1100
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `1100${randomSuffix}`;
}

export function generateCardNumber(): { fullMasked: string; last4: string } {
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  return {
    fullMasked: `•••• •••• •••• ${last4}`,
    last4,
  };
}

export function generateClientId(seed?: string): string {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);
    const hex = abs.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    return `AR-${hex}`;
  }
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AR-${rand}`;
}

export function generateUniqueClientId(existingUsers: UserRecord[] = [], seed?: string): string {
  if (seed) {
    const candidate = generateClientId(seed);
    const inUse = existingUsers.some((u) => (u.clientId || '').toUpperCase() === candidate.toUpperCase());
    if (!inUse) {
      return candidate;
    }
  }

  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let candidate = '';
  let attempts = 0;
  do {
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    candidate = `AR-${code}`;
    attempts++;
  } while (
    attempts < 100 &&
    existingUsers.some((u) => (u.clientId || '').toUpperCase() === candidate.toUpperCase())
  );

  return candidate;
}

export function generateReference(prefix = 'AUR'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

// Initial demo seed data
function createSeedDatabase(): BankingDatabase {
  const { hash, salt } = hashPassword('AurelithSecure123!');
  const alexPin = hashPassword('8821');
  const alexId = 'usr_alex_morgan';
  const checkingAccNumber = '1100482910';
  const savingsAccNumber = '1100892041';

  const seedUser: UserRecord = {
    id: alexId,
    clientId: 'AR-882190',
    role: 'admin',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phoneNumber: '+12145550189',
    dateOfBirth: '1988-06-14',
    residentialAddress: {
      street: '4200 Preston Road, Suite 300',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75205',
      country: 'United States',
    },
    passwordHash: hash,
    salt: salt,
    paymentPinHash: alexPin.hash,
    paymentPinSalt: alexPin.salt,
    trustedDevices: [],
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    accounts: [
      {
        id: 'acc_chk_01',
        accountNumber: checkingAccNumber,
        routingNumber: '111301122',
        swiftCode: 'AURUS33D',
        type: 'checking',
        name: 'Aurelith Premier Checking',
        currency: 'USD',
        balance: 14850.75,
        availableBalance: 14850.75,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'acc_sav_01',
        accountNumber: savingsAccNumber,
        routingNumber: '111301122',
        swiftCode: 'AURUS33D',
        type: 'savings',
        name: 'High-Yield Reserve Savings',
        currency: 'USD',
        balance: 42500.00,
        availableBalance: 42500.00,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      },
    ],
    cards: [
      {
        id: 'crd_01',
        accountId: 'acc_chk_01',
        cardType: 'debit_virtual',
        cardHolderName: 'ALEX MORGAN',
        last4: '8821',
        cardMaskedNumber: '•••• •••• •••• 8821',
        expiryMonth: '08',
        expiryYear: '29',
        status: 'active',
        dailyLimit: 3000,
        monthlyLimit: 25000,
        contactlessEnabled: true,
        onlinePurchasesEnabled: true,
      },
      {
        id: 'crd_02',
        accountId: 'acc_chk_01',
        cardType: 'debit_physical',
        cardHolderName: 'ALEX MORGAN',
        last4: '4190',
        cardMaskedNumber: '•••• •••• •••• 4190',
        expiryMonth: '11',
        expiryYear: '30',
        status: 'active',
        dailyLimit: 5000,
        monthlyLimit: 40000,
        contactlessEnabled: true,
        onlinePurchasesEnabled: true,
      },
    ],
    beneficiaries: [
      {
        id: 'ben_01',
        name: 'Sarah Jenkins',
        bankName: 'Aurelith Reserve',
        accountNumber: '1100998822',
        routingNumber: '111301122',
        nickname: 'Sister - Rent Split',
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ben_02',
        name: 'Lone Star Electric Co.',
        bankName: 'JPMorgan Chase',
        accountNumber: '9843210091',
        routingNumber: '111000614',
        nickname: 'Home Power Utility',
        createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      },
    ],
    savingsGoals: [
      {
        id: 'sg_01',
        name: 'Hill Country Vacation Home',
        targetAmount: 50000,
        currentAmount: 28500,
        targetDate: '2027-06-30',
        category: 'Real Estate',
        createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'sg_02',
        name: 'Emergency Reserve Fund (6 Months)',
        targetAmount: 25000,
        currentAmount: 25000,
        targetDate: '2026-12-31',
        category: 'Safety Net',
        createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
      },
    ],
    loans: [
      {
        id: 'ln_01',
        type: 'Personal Loan',
        requestedAmount: 15000,
        approvedAmount: 15000,
        remainingBalance: 9400,
        termMonths: 36,
        interestRate: 6.49,
        monthlyPayment: 459.72,
        purpose: 'Home Energy & Solar Optimization',
        status: 'approved',
        applicationDate: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
      },
    ],
    notifications: [
      {
        id: 'notif_01',
        title: 'Direct Deposit Credited',
        message: 'Your payroll direct deposit of $4,850.00 from Apex Wealth Partners has cleared.',
        type: 'transaction',
        read: false,
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
      {
        id: 'notif_02',
        title: 'Security Notice: New Session',
        message: 'Sign-in detected from Dallas, TX via Aurelith Reserve Web Portal.',
        type: 'security',
        read: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'notif_03',
        title: 'Monthly Account Statement Ready',
        message: 'Your September 2026 Aurelith Reserve account statement is available for download.',
        type: 'general',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  };

  const seedTransactions: Transaction[] = [
    {
      id: 'tx_01',
      reference: 'AUR-20261022-7F2A',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'deposit',
      category: 'Income',
      amount: 4850.00,
      direction: 'credit',
      description: 'Payroll ACH Direct Deposit - Apex Wealth Partners',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      balanceAfter: 14850.75,
    },
    {
      id: 'tx_02',
      reference: 'AUR-20261021-39B1',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'transfer',
      category: 'Transfer',
      amount: 500.00,
      direction: 'debit',
      description: 'Transfer to High-Yield Reserve Savings',
      recipientName: 'Alex Morgan',
      recipientAccount: savingsAccNumber,
      recipientBank: 'Aurelith Reserve',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      balanceAfter: 10000.75,
    },
    {
      id: 'tx_03',
      reference: 'AUR-20261019-9C4D',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'bill_payment',
      category: 'Utilities',
      amount: 142.80,
      direction: 'debit',
      description: 'Lone Star Electric Utility Bill Payment',
      recipientName: 'Lone Star Electric Co.',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      balanceAfter: 10500.75,
    },
    {
      id: 'tx_04',
      reference: 'AUR-20261017-E182',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'card_purchase',
      category: 'Dining & Food',
      amount: 78.45,
      direction: 'debit',
      description: 'Debit Card Purchase • Central Market Dallas',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
      balanceAfter: 10643.55,
    },
    {
      id: 'tx_05',
      reference: 'AUR-20261015-884A',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'transfer',
      category: 'Personal Transfer',
      amount: 250.00,
      direction: 'debit',
      description: 'Transfer to Sarah Jenkins (Sister - Rent Split)',
      recipientName: 'Sarah Jenkins',
      recipientAccount: '1100998822',
      recipientBank: 'Aurelith Reserve',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 160 * 3600 * 1000).toISOString(),
      balanceAfter: 10722.00,
    },
    {
      id: 'tx_06_water',
      reference: 'AUR-20261012-4C19',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'bill_payment',
      category: 'Water',
      amount: 68.45,
      direction: 'debit',
      description: 'Dallas Water Utilities • Monthly Municipal Service',
      recipientName: 'Dallas Water Utilities',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 240 * 3600 * 1000).toISOString(),
      balanceAfter: 10972.00,
    },
    {
      id: 'tx_07_airtime',
      reference: 'AUR-20261010-8A71',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'airtime',
      category: 'Airtime',
      amount: 35.00,
      direction: 'debit',
      description: 'Airtime Top-up • AT&T Mobility (+1 214-555-0189)',
      recipientName: 'AT&T Mobility',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 290 * 3600 * 1000).toISOString(),
      balanceAfter: 11040.45,
    },
    {
      id: 'tx_08_inflow',
      reference: 'AUR-20261005-9B21',
      userId: alexId,
      accountId: 'acc_chk_01',
      type: 'transfer',
      category: 'Wire Inflow',
      amount: 2500.00,
      direction: 'credit',
      description: 'Wire Transfer Inward • Henderson Capital Advisory Distribution',
      recipientName: 'Alex Morgan',
      recipientBank: 'JPMorgan Chase',
      status: 'completed',
      fee: 0,
      timestamp: new Date(Date.now() - 410 * 3600 * 1000).toISOString(),
      balanceAfter: 11075.45,
    },
  ];

  const seedStatementRequests: StatementRequest[] = [
    {
      id: 'req_stmt_01',
      userId: alexId,
      customerName: 'Alex Morgan',
      customerEmail: 'alex.morgan@example.com',
      accountIdentifier: '1100482910',
      accountType: 'Aurelith Premier Checking',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      category: 'Entire Account Statement',
      deliveryMethod: 'email',
      status: 'Completed',
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      serverTimestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      serverTimezone: 'CDT (UTC-05:00)',
      statementSummary: {
        totalDebits: 971.25,
        totalCredits: 4850.00,
        openingBalance: 10972.00,
        closingBalance: 14850.75,
        transactionCount: 8,
      },
    },
    {
      id: 'req_stmt_02',
      userId: alexId,
      customerName: 'Alex Morgan',
      customerEmail: 'alex.morgan@example.com',
      accountIdentifier: '1100482910',
      accountType: 'Aurelith Premier Checking',
      startDate: '2026-10-01',
      endDate: '2026-10-23',
      category: 'Utility Bill Payments',
      deliveryMethod: 'email',
      status: 'Processing',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      serverTimestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      serverTimezone: 'CDT (UTC-05:00)',
      statementSummary: {
        totalDebits: 211.25,
        totalCredits: 0,
        openingBalance: 11075.45,
        closingBalance: 14850.75,
        transactionCount: 2,
      },
    },
  ];

  return {
    users: [seedUser],
    transactions: seedTransactions,
    sessions: {},
    supportTickets: [],
    statementRequests: seedStatementRequests,
  };
}

// Database Read/Write with atomic guarantee
export class DatabaseManager {
  private static db: BankingDatabase | null = null;

  public static getDB(): BankingDatabase {
    if (this.db) return this.db;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        if (this.db) {
          this.db.statementRequests = this.db.statementRequests || [];
          this.db.pendingVerifications = this.db.pendingVerifications || {};
          // Ensure seed user has admin role, swiftCode, trustedDevices, and secure PIN
          const user = this.db.users.find((u) => u.id === 'usr_alex_morgan');
          if (user) {
            user.role = user.role || 'admin';
            if (!user.clientId) user.clientId = 'AR-882190';
            user.trustedDevices = user.trustedDevices || [];
            if (!user.paymentPinHash || !user.paymentPinSalt) {
              const alexPin = hashPassword('8821');
              user.paymentPinHash = alexPin.hash;
              user.paymentPinSalt = alexPin.salt;
            }
            user.accounts.forEach((a) => {
              if (!a.swiftCode) a.swiftCode = 'AURUS33D';
              if (!a.institution) a.institution = 'Aurelith Reserve';
            });
          }

          // Ensure all existing users have a stable, unique, user-friendly Client ID (AR-XXXXXX)
          let dbMutated = false;
          this.db.users.forEach((u) => {
            if (!u.clientId || !/^AR-[A-Z0-9]{6}$/i.test(u.clientId)) {
              u.clientId = generateUniqueClientId(this.db!.users, u.id);
              dbMutated = true;
            }
          });
          if (dbMutated) {
            this.saveDB();
          }
          return this.db;
        }
      } catch (err) {
        console.error('Failed reading existing DB, initializing seed data', err);
      }
    }

    this.db = createSeedDatabase();
    this.saveDB();
    return this.db;
  }

  public static saveDB(): void {
    if (!this.db) return;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // Statement Request Management
  public static addStatementRequest(req: StatementRequest): StatementRequest {
    const db = this.getDB();
    db.statementRequests = db.statementRequests || [];
    db.statementRequests.unshift(req);
    this.saveDB();
    return req;
  }

  public static getStatementRequests(userId?: string): StatementRequest[] {
    const db = this.getDB();
    db.statementRequests = db.statementRequests || [];
    if (userId) {
      return db.statementRequests.filter((r) => r.userId === userId);
    }
    return db.statementRequests;
  }

  public static getStatementRequestById(id: string): StatementRequest | null {
    const db = this.getDB();
    db.statementRequests = db.statementRequests || [];
    return db.statementRequests.find((r) => r.id === id) || null;
  }

  public static updateStatementRequestStatus(
    id: string,
    status: 'Pending' | 'Processing' | 'Completed'
  ): StatementRequest | null {
    const db = this.getDB();
    db.statementRequests = db.statementRequests || [];
    const req = db.statementRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    this.saveDB();
    return req;
  }

  // Pending Device Verification Management
  public static createPendingDeviceVerification(params: {
    userId: string;
    deviceId: string;
    deviceName: string;
    browser?: string;
    os?: string;
    ipAddress?: string;
  }): string {
    const db = this.getDB();
    db.pendingVerifications = db.pendingVerifications || {};
    const token = `aur_pnd_${crypto.randomBytes(24).toString('hex')}`;
    const now = Date.now();
    // 15-minute verification validity window
    const expiresAt = now + 15 * 60 * 1000;
    db.pendingVerifications[token] = {
      token,
      userId: params.userId,
      deviceId: params.deviceId,
      deviceName: params.deviceName,
      browser: params.browser,
      os: params.os,
      ipAddress: params.ipAddress,
      attempts: 0,
      createdAt: now,
      expiresAt,
    };
    this.saveDB();
    return token;
  }

  public static getPendingDeviceVerification(token: string): PendingDeviceVerification | null {
    const db = this.getDB();
    db.pendingVerifications = db.pendingVerifications || {};
    const pending = db.pendingVerifications[token];
    if (!pending) return null;
    if (pending.expiresAt < Date.now()) {
      delete db.pendingVerifications[token];
      this.saveDB();
      return null;
    }
    return pending;
  }

  public static recordFailedPinAttempt(token: string): { attempts: number; isLocked: boolean; lockoutMinutesRemaining?: number } {
    const db = this.getDB();
    db.pendingVerifications = db.pendingVerifications || {};
    const pending = db.pendingVerifications[token];
    if (!pending) {
      return { attempts: 1, isLocked: false };
    }
    pending.attempts = (pending.attempts || 0) + 1;
    // After 5 attempts, temporary 5-minute lockout
    if (pending.attempts >= 5) {
      pending.lockoutUntil = Date.now() + 5 * 60 * 1000;
      this.saveDB();
      return { attempts: pending.attempts, isLocked: true, lockoutMinutesRemaining: 5 };
    }
    this.saveDB();
    return { attempts: pending.attempts, isLocked: false };
  }

  public static invalidatePendingDeviceVerification(token: string): void {
    const db = this.getDB();
    if (db.pendingVerifications && db.pendingVerifications[token]) {
      delete db.pendingVerifications[token];
      this.saveDB();
    }
  }

  // Trusted Devices Management
  public static findTrustedDevice(userId: string, deviceId: string, deviceTrustToken?: string): TrustedDevice | null {
    const user = this.findUserById(userId);
    if (!user || !user.trustedDevices || !deviceId) return null;
    return (
      user.trustedDevices.find(
        (d) =>
          d.deviceId === deviceId &&
          (!deviceTrustToken || d.deviceTrustToken === deviceTrustToken) &&
          d.status === 'trusted'
      ) || null
    );
  }

  public static addOrUpdateTrustedDevice(
    userId: string,
    deviceData: {
      deviceId: string;
      deviceName: string;
      browser?: string;
      os?: string;
      ipAddress?: string;
    }
  ): { trustedDevice: TrustedDevice; deviceTrustToken: string } {
    const db = this.getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.trustedDevices = user.trustedDevices || [];

    const existingIndex = user.trustedDevices.findIndex((d) => d.deviceId === deviceData.deviceId);
    const deviceTrustToken = `aur_dvt_${crypto.randomBytes(32).toString('hex')}`;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      user.trustedDevices[existingIndex] = {
        ...user.trustedDevices[existingIndex],
        deviceTrustToken,
        deviceName: deviceData.deviceName || user.trustedDevices[existingIndex].deviceName,
        browser: deviceData.browser || user.trustedDevices[existingIndex].browser,
        os: deviceData.os || user.trustedDevices[existingIndex].os,
        ipAddress: deviceData.ipAddress || user.trustedDevices[existingIndex].ipAddress,
        lastUsedAt: now,
        status: 'trusted',
      };
      this.saveDB();
      return { trustedDevice: user.trustedDevices[existingIndex], deviceTrustToken };
    }

    const newDevice: TrustedDevice = {
      id: generateId('dev'),
      deviceId: deviceData.deviceId,
      deviceTrustToken,
      deviceName: deviceData.deviceName || 'Registered Web Device',
      browser: deviceData.browser,
      os: deviceData.os,
      ipAddress: deviceData.ipAddress,
      trustedAt: now,
      lastUsedAt: now,
      status: 'trusted',
    };

    user.trustedDevices.unshift(newDevice);
    this.saveDB();
    return { trustedDevice: newDevice, deviceTrustToken };
  }

  public static getUserTrustedDevices(userId: string): TrustedDevice[] {
    const user = this.findUserById(userId);
    if (!user || !user.trustedDevices) return [];
    return user.trustedDevices;
  }

  public static revokeTrustedDevice(userId: string, deviceId: string): boolean {
    const db = this.getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user || !user.trustedDevices) return false;

    const device = user.trustedDevices.find((d) => d.deviceId === deviceId);
    if (device) {
      device.status = 'revoked';
      this.saveDB();
      return true;
    }
    return false;
  }

  public static revokeAllOtherTrustedDevices(userId: string, currentDeviceId: string): number {
    const db = this.getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user || !user.trustedDevices) return 0;

    let count = 0;
    user.trustedDevices.forEach((d) => {
      if (d.deviceId !== currentDeviceId && d.status === 'trusted') {
        d.status = 'revoked';
        count++;
      }
    });

    if (count > 0) {
      this.saveDB();
    }
    return count;
  }

  // Session handling
  public static createSession(userId: string): string {
    const db = this.getDB();
    const token = `aur_sess_${crypto.randomBytes(32).toString('hex')}`;
    // 7 days expiration
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    db.sessions[token] = { userId, expiresAt, status: 'active' };
    this.saveDB();
    return token;
  }

  public static getSessionUser(token: string): UserRecord | null {
    const db = this.getDB();
    const session = db.sessions[token];
    if (!session) return null;

    if (session.expiresAt < Date.now()) {
      delete db.sessions[token];
      this.saveDB();
      return null;
    }

    // Deny access if session is still pending device verification
    if (session.status === 'pending_device_verification') {
      return null;
    }

    const user = db.users.find((u) => u.id === session.userId);
    return user || null;
  }

  public static invalidateSession(token: string): void {
    const db = this.getDB();
    if (db.sessions[token]) {
      delete db.sessions[token];
      this.saveDB();
    }
  }

  // User finders
  public static findUserByIdentifier(identifier: string): UserRecord | null {
    const db = this.getDB();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');
    const cleanDoc = identifier.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    return (
      db.users.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanId;
        const uDigits = u.phoneNumber.replace(/[^0-9]/g, '');
        const inDigits = cleanPhone.replace(/[^0-9]/g, '');
        const phoneMatch =
          inDigits.length >= 7 &&
          (uDigits === inDigits ||
            (inDigits.length >= 10 && uDigits.endsWith(inDigits)) ||
            (uDigits.length >= 10 && inDigits.endsWith(uDigits)));

        const uGov = (u.governmentId || u.idNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const govMatch = Boolean(cleanDoc && uGov && (uGov === cleanDoc || (cleanDoc.length >= 4 && uGov.endsWith(cleanDoc))));

        return emailMatch || phoneMatch || govMatch;
      }) || null
    );
  }

  public static findUserById(id: string): UserRecord | null {
    const db = this.getDB();
    return db.users.find((u) => u.id === id) || null;
  }

  public static findUserByAccountNumber(accountNumber: string): { user: UserRecord; account: UserAccount } | null {
    const db = this.getDB();
    for (const u of db.users) {
      const acc = u.accounts.find((a) => a.accountNumber === accountNumber);
      if (acc) {
        return { user: u, account: acc };
      }
    }
    return null;
  }

  public static findUserByClientId(clientId: string): { user: UserRecord; account: UserAccount } | null {
    const db = this.getDB();
    const clean = clientId.trim().toUpperCase();
    for (const u of db.users) {
      const uClientId = (u.clientId || generateClientId(u.id)).toUpperCase();
      if (uClientId === clean) {
        return { user: u, account: u.accounts[0] };
      }
    }
    return null;
  }
}
