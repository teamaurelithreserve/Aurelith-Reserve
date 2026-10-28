import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DatabaseManager,
  hashPassword,
  verifyPassword,
  generateId,
  generateClientId,
  generateUniqueClientId,
  generateAccountNumber,
  generateCardNumber,
  generateReference,
  UserRecord,
  Transaction,
  UserAccount,
  StatementRequest,
} from './server/db.ts';
import {
  SUPPORTED_BANKS,
  InterbankVerificationService,
} from './server/interbankDirectory.ts';
import {
  checkBalanceConstraints,
  getAccountTier,
  formatCurrency,
  ACCOUNT_TIERS,
} from './src/data/accountTiers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Parse CLI arguments (--port, --host) or default to 3000 in development
  const args = process.argv.slice(2);
  let cliPort: number | null = null;
  const portIdx = args.indexOf('--port');
  if (portIdx !== -1 && args[portIdx + 1]) {
    cliPort = Number(args[portIdx + 1]);
  }

  // Dev server must run on port 3000 per AI Studio environment constraints.
  // In production (e.g. Cloud Run), honor process.env.PORT.
  const PORT = cliPort || (process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 8080) : 3000);

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Sanitizer: never send passwordHash, salt, or pin hashes to the client
  function sanitizeUser(user: UserRecord) {
    const { passwordHash, salt, paymentPinHash, paymentPinSalt, pendingPasswordReset, trustedDevices, ...safeUser } = user;
    const sanitizedDevices = (trustedDevices || []).map((d) => ({
      id: d.id,
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      browser: d.browser,
      os: d.os,
      ipAddress: d.ipAddress,
      trustedAt: d.trustedAt,
      lastUsedAt: d.lastUsedAt,
      status: d.status,
    }));

    return {
      ...safeUser,
      clientId: user.clientId || generateClientId(user.id),
      avatarUrl: user.avatarUrl || null,
      photoDataUrl: user.photoDataUrl || user.avatarUrl || null,
      bankName: user.bankName || undefined,
      firebaseUid: user.firebaseUid || null,
      emailVerified: user.emailVerified ?? true,
      hasPaymentPin: Boolean(user.paymentPinHash && user.paymentPinSalt),
      trustedDevices: sanitizedDevices,
      securitySettings: user.securitySettings || {
        twoFactorEnabled: true,
        biometricsEnabled: true,
      },
      notificationPreferences: user.notificationPreferences || {
        emailTransactions: true,
        smsSecurity: true,
        monthlyStatements: true,
      },
    };
  }

  function parseUserAgent(ua?: string): string {
    if (!ua) return 'Web Browser';
    if (ua.includes('iPhone')) return 'Safari on iPhone';
    if (ua.includes('iPad')) return 'Safari on iPad';
    if (ua.includes('Android')) return 'Chrome on Android';
    if (ua.includes('Macintosh')) return 'Browser on macOS';
    if (ua.includes('Windows')) return 'Browser on Windows';
    if (ua.includes('Linux')) return 'Browser on Linux';
    return 'Web Browser';
  }

  // Auth Middleware
  function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    if (token.startsWith('aur_pnd_')) {
      return res.status(403).json({ error: 'Device verification required. Full access is restricted until payment PIN is verified.' });
    }

    const user = DatabaseManager.getSessionUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    (req as any).user = user;
    (req as any).token = token;
    next();
  }

  // Admin Role Middleware
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user as UserRecord;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to authorized administrators only.' });
    }
    next();
  }

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Register Customer
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        idType,
        idNumber,
        governmentId,
        residentialAddress,
        password,
        accountType,
        bankName,
      } = req.body;

      const effectiveIdNumber = (idNumber || governmentId || '').trim();

      // Validation
      if (!firstName || !lastName || !email || !phoneNumber || !password || !gender || !effectiveIdNumber) {
        return res.status(400).json({ error: 'All required fields must be provided, including official identification.' });
      }

      if (!bankName || typeof bankName !== 'string' || !bankName.trim()) {
        return res.status(400).json({ error: 'Please select a Bank Name.' });
      }

      if (gender !== 'Male' && gender !== 'Female') {
        return res.status(400).json({ error: 'Gender must be either Male or Female.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      const db = DatabaseManager.getDB();

      // Check duplicate email
      const existingEmail = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existingEmail) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      // Check duplicate phone
      const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
      const existingPhone = db.users.find(
        (u) => u.phoneNumber.replace(/[^0-9+]/g, '') === cleanPhone
      );
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this phone number already exists.' });
      }

      const { hash, salt } = hashPassword(password);
      const userId = generateId('usr');
      const primaryAccNumber = generateAccountNumber();
      const secondaryAccNumber = generateAccountNumber();
      const cardInfo = generateCardNumber();

      const requestedType = (typeof accountType === 'string' && accountType.trim()) ? accountType.trim() : 'Premier Checking';
      const matchedTier = getAccountTier(requestedType) || ACCOUNT_TIERS[4]; // Premier Checking fallback
      const primaryAccountName = matchedTier.name;
      const primaryType: 'checking' | 'savings' = matchedTier.id === 'Savings' ? 'savings' : 'checking';

      const newAccounts: UserAccount[] = primaryType === 'savings' ? [
        {
          id: generateId('acc'),
          accountNumber: primaryAccNumber,
          routingNumber: '111301122',
          swiftCode: 'AURUS33D',
          type: 'savings',
          name: primaryAccountName,
          institution: 'Aurelith Reserve',
          currency: 'USD',
          balance: 0.00,
          availableBalance: 0.00,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('acc'),
          accountNumber: secondaryAccNumber,
          routingNumber: '111301122',
          swiftCode: 'AURUS33D',
          type: 'checking',
          name: 'Premier Checking',
          institution: 'Aurelith Reserve',
          currency: 'USD',
          balance: 0.00,
          availableBalance: 0.00,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ] : [
        {
          id: generateId('acc'),
          accountNumber: primaryAccNumber,
          routingNumber: '111301122',
          swiftCode: 'AURUS33D',
          type: 'checking',
          name: primaryAccountName,
          institution: 'Aurelith Reserve',
          currency: 'USD',
          balance: 0.00,
          availableBalance: 0.00,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('acc'),
          accountNumber: secondaryAccNumber,
          routingNumber: '111301122',
          swiftCode: 'AURUS33D',
          type: 'savings',
          name: 'Savings',
          institution: 'Aurelith Reserve',
          currency: 'USD',
          balance: 0.00,
          availableBalance: 0.00,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];

      const newUser: UserRecord = {
        id: userId,
        clientId: generateUniqueClientId(db.users, userId),
        firstName: firstName.trim(),
        middleName: (typeof middleName === 'string' && middleName.trim()) ? middleName.trim() : undefined,
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        dateOfBirth: dateOfBirth || '1990-01-01',
        gender: gender as 'Male' | 'Female',
        idType: idType || 'Social Security Number (SSN)',
        idNumber: effectiveIdNumber,
        governmentId: effectiveIdNumber,
        residentialAddress: residentialAddress || {
          street: '100 Main Street',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          country: 'United States',
        },
        passwordHash: hash,
        salt,
        firebaseUid: req.body.firebaseUid || undefined,
        avatarUrl: req.body.avatarUrl || undefined,
        photoDataUrl: req.body.photoDataUrl || req.body.avatarUrl || undefined,
        bankName: bankName.trim(),
        emailVerified: req.body.emailVerified ?? false,
        status: 'active',
        createdAt: new Date().toISOString(),
        accounts: newAccounts,
        cards: [
          {
            id: generateId('crd'),
            accountId: newAccounts[0].id,
            cardType: 'debit_virtual',
            cardHolderName: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
            last4: cardInfo.last4,
            cardMaskedNumber: cardInfo.fullMasked,
            expiryMonth: '12',
            expiryYear: '29',
            status: 'active',
            dailyLimit: 2500,
            monthlyLimit: 20000,
            contactlessEnabled: true,
            onlinePurchasesEnabled: true,
          },
        ],
        beneficiaries: [],
        savingsGoals: [],
        loans: [],
        notifications: [
          {
            id: generateId('notif'),
            title: 'Welcome to Aurelith Reserve Digital Banking',
            message: `Welcome, ${firstName}! Your ${primaryAccountName} account (${primaryAccNumber}) has been opened with an initial balance of $0.00.`,
            type: 'general',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      db.users.push(newUser);
      DatabaseManager.saveDB();

      // If client sent deviceId during registration, enroll it as trusted initial device
      let deviceTrustToken: string | undefined = undefined;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
      if (req.body.deviceId) {
        const enroll = DatabaseManager.addOrUpdateTrustedDevice(userId, {
          deviceId: req.body.deviceId,
          deviceName: req.body.deviceInfo?.deviceName || parseUserAgent(req.headers['user-agent']),
          browser: req.body.deviceInfo?.browser,
          os: req.body.deviceInfo?.os,
          ipAddress: clientIp,
        });
        deviceTrustToken = enroll.deviceTrustToken;
      }

      // Create session for automatic dashboard transition
      const token = DatabaseManager.createSession(userId);

      return res.status(201).json({
        message: 'Registration successful! Welcome to Aurelith Reserve.',
        token,
        deviceTrustToken,
        user: sanitizeUser(newUser),
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Server error during registration. Please try again.' });
    }
  });

  // Login Customer (Email, Phone, or Government Identification + Password) with Server-Validated Device Recognition
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { identifier, password, governmentId, deviceId, deviceTrustToken, deviceInfo } = req.body;

      const effectiveIdentifier = (identifier || governmentId || '').trim();
      if (!effectiveIdentifier || !password) {
        return res.status(400).json({ error: 'Please enter your email, phone, or Government Identification and password.' });
      }

      let user = DatabaseManager.findUserByIdentifier(effectiveIdentifier);
      if (!user && governmentId && governmentId.trim() !== effectiveIdentifier) {
        user = DatabaseManager.findUserByIdentifier(governmentId.trim());
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials. Please verify your credentials and password.' });
      }

      // If both identifier and governmentId are provided and user has a recorded governmentId, verify match
      if (governmentId && governmentId.trim() && user.governmentId) {
        const cleanReqGov = governmentId.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanUserGov = user.governmentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (cleanReqGov !== cleanUserGov && !cleanUserGov.endsWith(cleanReqGov)) {
          return res.status(401).json({ error: 'Government Identification does not match account records.' });
        }
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials. Please verify your credentials and password.' });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Web Browser';
      const parsedDeviceName = deviceInfo?.deviceName || parseUserAgent(userAgent);

      // Check server-validated device recognition
      const recognizedTrustedDevice = (deviceId && deviceTrustToken)
        ? DatabaseManager.findTrustedDevice(user.id, deviceId, deviceTrustToken)
        : null;

      if (recognizedTrustedDevice) {
        // Device is recognized and trusted!
        // Risk signal: changed IP address (does not lock account or require re-verification if device token is valid)
        if (recognizedTrustedDevice.ipAddress && recognizedTrustedDevice.ipAddress !== clientIp) {
          user.notifications.unshift({
            id: generateId('notif'),
            title: 'Sign-In from New Network',
            message: `Trusted device "${recognizedTrustedDevice.deviceName}" signed in from network IP ${clientIp}.`,
            type: 'security',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        recognizedTrustedDevice.lastUsedAt = new Date().toISOString();
        recognizedTrustedDevice.ipAddress = clientIp;
        if (deviceInfo?.deviceName) {
          recognizedTrustedDevice.deviceName = deviceInfo.deviceName;
        }

        const token = DatabaseManager.createSession(user.id);
        user.notifications.unshift({
          id: generateId('notif'),
          title: 'Successful Sign-In',
          message: `Authenticated from trusted device "${recognizedTrustedDevice.deviceName}" at ${new Date().toLocaleTimeString()}.`,
          type: 'security',
          read: false,
          createdAt: new Date().toISOString(),
        });
        DatabaseManager.saveDB();

        return res.json({
          message: 'Sign in successful.',
          token,
          user: sanitizeUser(user),
          trustedDevice: true,
        });
      }

      // New or unverified device: requires Payment PIN verification before dashboard access
      const effectiveDeviceId = deviceId || generateId('dev');
      const verificationToken = DatabaseManager.createPendingDeviceVerification({
        userId: user.id,
        deviceId: effectiveDeviceId,
        deviceName: parsedDeviceName,
        browser: deviceInfo?.browser,
        os: deviceInfo?.os,
        ipAddress: clientIp,
      });

      return res.json({
        requireDeviceVerification: true,
        verificationToken,
        hasPaymentPin: Boolean(user.paymentPinHash && user.paymentPinSalt),
        deviceInfo: {
          deviceName: parsedDeviceName,
          ipAddress: clientIp,
          browser: deviceInfo?.browser,
          os: deviceInfo?.os,
        },
        message: 'For your security, please verify your payment PIN to gain full access to this Aurelith Reserve account.',
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Authentication service error. Please try again.' });
    }
  });

  // Dedicated Phone Number + Password Sign-In
  app.post('/api/auth/phone-login', (req: Request, res: Response) => {
    try {
      const { phoneNumber, password, deviceId, deviceTrustToken, deviceInfo } = req.body;
      if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required.' });
      }

      // Normalize phone number to digits and leading +
      const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
      const db = DatabaseManager.getDB();
      const user = db.users.find((u) => {
        const uClean = u.phoneNumber.replace(/[^0-9+]/g, '');
        return uClean === cleanPhone ||
          (cleanPhone.startsWith('+1') && uClean === cleanPhone.slice(2)) ||
          (uClean.startsWith('+1') && cleanPhone === uClean.slice(2)) ||
          u.phoneNumber === phoneNumber.trim();
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid phone number or password. Please verify your credentials.' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid phone number or password. Please verify your credentials.' });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Web Browser';
      const parsedDeviceName = deviceInfo?.deviceName || parseUserAgent(userAgent);

      const recognizedTrustedDevice = (deviceId && deviceTrustToken)
        ? DatabaseManager.findTrustedDevice(user.id, deviceId, deviceTrustToken)
        : null;

      if (recognizedTrustedDevice) {
        recognizedTrustedDevice.lastUsedAt = new Date().toISOString();
        recognizedTrustedDevice.ipAddress = clientIp;
        if (deviceInfo?.deviceName) {
          recognizedTrustedDevice.deviceName = deviceInfo.deviceName;
        }

        const token = DatabaseManager.createSession(user.id);
        user.notifications.unshift({
          id: generateId('notif'),
          title: 'Successful Phone Sign-In',
          message: `Authenticated via phone number from device "${recognizedTrustedDevice.deviceName}".`,
          type: 'security',
          read: false,
          createdAt: new Date().toISOString(),
        });
        DatabaseManager.saveDB();

        return res.json({
          message: 'Sign in successful.',
          token,
          user: sanitizeUser(user),
          trustedDevice: true,
        });
      }

      // Device verification challenge for untrusted devices
      const effectiveDeviceId = deviceId || generateId('dev');
      const verificationToken = DatabaseManager.createPendingDeviceVerification({
        userId: user.id,
        deviceId: effectiveDeviceId,
        deviceName: parsedDeviceName,
        browser: deviceInfo?.browser,
        os: deviceInfo?.os,
        ipAddress: clientIp,
      });

      return res.json({
        requireDeviceVerification: true,
        verificationToken,
        hasPaymentPin: Boolean(user.paymentPinHash && user.paymentPinSalt),
        deviceInfo: {
          deviceName: parsedDeviceName,
          ipAddress: clientIp,
          browser: deviceInfo?.browser,
          os: deviceInfo?.os,
        },
        message: 'For your security, please verify your payment PIN to gain full access to this Aurelith Reserve account.',
      });
    } catch (err: any) {
      console.error('Phone login error:', err);
      return res.status(500).json({ error: 'Authentication service error. Please try again.' });
    }
  });

  // Google Authentication Integration (Sign-In or Instant Onboarding)
  app.post('/api/auth/google-auth', (req: Request, res: Response) => {
    try {
      const { uid, email, displayName, photoUrl, deviceId, deviceInfo } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Valid Firebase Google credentials (uid and email) are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const db = DatabaseManager.getDB();

      // Check if user exists by email or firebaseUid
      let user = db.users.find((u) => u.firebaseUid === uid || u.email.toLowerCase() === cleanEmail);

      if (!user) {
        // First-time Google user: Create standard Aurelith Reserve account record with $0 opening balance
        const userId = generateId('usr');
        const primaryAccNumber = generateAccountNumber();
        const secondaryAccNumber = generateAccountNumber();
        const cardInfo = generateCardNumber();

        const nameParts = (displayName || 'Valued Client').trim().split(' ');
        const firstName = nameParts[0] || 'Valued';
        const lastName = nameParts.slice(1).join(' ') || 'Client';

        const newAccounts: UserAccount[] = [
          {
            id: generateId('acc'),
            accountNumber: primaryAccNumber,
            routingNumber: '111301122',
            swiftCode: 'AURUS33D',
            type: 'checking',
            name: 'Premier Checking',
            institution: 'Aurelith Reserve',
            currency: 'USD',
            balance: 0.0,
            availableBalance: 0.0,
            status: 'active',
            createdAt: new Date().toISOString(),
          },
          {
            id: generateId('acc'),
            accountNumber: secondaryAccNumber,
            routingNumber: '111301122',
            swiftCode: 'AURUS33D',
            type: 'savings',
            name: 'Savings',
            institution: 'Aurelith Reserve',
            currency: 'USD',
            balance: 0.0,
            availableBalance: 0.0,
            status: 'active',
            createdAt: new Date().toISOString(),
          },
        ];

        const { hash, salt } = hashPassword(generateId('gpass'));

        user = {
          id: userId,
          firebaseUid: uid,
          avatarUrl: photoUrl || undefined,
          firstName,
          lastName,
          email: cleanEmail,
          phoneNumber: '+1214' + Math.floor(1000000 + Math.random() * 9000000),
          dateOfBirth: '1992-06-15',
          residentialAddress: {
            street: '100 Main Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'United States',
          },
          passwordHash: hash,
          salt,
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          accounts: newAccounts,
          cards: [
            {
              id: generateId('crd'),
              accountId: newAccounts[0].id,
              cardType: 'debit_virtual',
              cardHolderName: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
              last4: cardInfo.last4,
              cardMaskedNumber: cardInfo.fullMasked,
              expiryMonth: '12',
              expiryYear: '29',
              status: 'active',
              dailyLimit: 2500,
              monthlyLimit: 20000,
              contactlessEnabled: true,
              onlinePurchasesEnabled: true,
            },
          ],
          beneficiaries: [],
          savingsGoals: [],
          loans: [],
          notifications: [
            {
              id: generateId('notif'),
              title: 'Welcome to Aurelith Reserve Digital Banking',
              message: `Welcome, ${firstName}! Your Aurelith Premier Checking account (${primaryAccNumber}) has been opened with an initial balance of $0.00.`,
              type: 'general',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        };

        db.users.push(user);
      } else {
        // Link firebaseUid and avatarUrl if not already set
        if (!user.firebaseUid) {
          user.firebaseUid = uid;
        }
        if (photoUrl && !user.avatarUrl) {
          user.avatarUrl = photoUrl;
        }
      }

      // Add trusted device or session
      let deviceTrustToken: string | undefined = undefined;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
      if (deviceId) {
        const enroll = DatabaseManager.addOrUpdateTrustedDevice(user.id, {
          deviceId,
          deviceName: deviceInfo?.deviceName || parseUserAgent(req.headers['user-agent']),
          browser: deviceInfo?.browser,
          os: deviceInfo?.os,
          ipAddress: clientIp,
        });
        deviceTrustToken = enroll.deviceTrustToken;
      }

      DatabaseManager.saveDB();
      const token = DatabaseManager.createSession(user.id);

      return res.json({
        message: 'Google authentication successful.',
        token,
        deviceTrustToken,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      return res.status(500).json({ error: 'Failed to authenticate with Google.' });
    }
  });

  // Verify Payment PIN for New Device
  app.post('/api/auth/verify-new-device', (req: Request, res: Response) => {
    try {
      const { verificationToken, paymentPin, deviceId, deviceInfo } = req.body;

      if (!verificationToken) {
        return res.status(400).json({ error: 'Verification token is required.' });
      }

      const pending = DatabaseManager.getPendingDeviceVerification(verificationToken);
      if (!pending) {
        return res.status(401).json({ error: 'Verification session expired. Please sign in again.' });
      }

      if (pending.lockoutUntil && pending.lockoutUntil > Date.now()) {
        const remainingMinutes = Math.ceil((pending.lockoutUntil - Date.now()) / 60000);
        return res.status(429).json({
          error: `Too many incorrect attempts. For security, please wait ${remainingMinutes} minute(s) before trying again.`,
          isLocked: true,
        });
      }

      const user = DatabaseManager.findUserById(pending.userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      if (!user.paymentPinHash || !user.paymentPinSalt) {
        return res.status(400).json({
          hasPaymentPin: false,
          error: 'No payment PIN configured on this account. For your security, verification cannot be bypassed. Please set up your payment PIN.',
        });
      }

      if (!paymentPin || typeof paymentPin !== 'string') {
        return res.status(400).json({ error: 'Please enter your payment PIN.' });
      }

      const isValidPin = verifyPassword(paymentPin.trim(), user.paymentPinHash, user.paymentPinSalt);
      if (!isValidPin) {
        const attemptResult = DatabaseManager.recordFailedPinAttempt(verificationToken);

        user.notifications.unshift({
          id: generateId('notif'),
          title: 'Unsuccessful Device Verification',
          message: `An incorrect payment PIN was entered during verification for device "${pending.deviceName}".`,
          type: 'security',
          read: false,
          createdAt: new Date().toISOString(),
        });
        DatabaseManager.saveDB();

        if (attemptResult.isLocked) {
          return res.status(429).json({
            error: 'Too many incorrect attempts. For security, please wait 5 minutes before trying again.',
            isLocked: true,
          });
        }

        return res.status(401).json({
          error: 'Incorrect payment PIN. Please try again.',
          attemptsRemaining: Math.max(0, 5 - attemptResult.attempts),
        });
      }

      // Verification successful: trust device and grant active session
      const { trustedDevice, deviceTrustToken } = DatabaseManager.addOrUpdateTrustedDevice(user.id, {
        deviceId: deviceId || pending.deviceId,
        deviceName: deviceInfo?.deviceName || pending.deviceName,
        browser: deviceInfo?.browser || pending.browser,
        os: deviceInfo?.os || pending.os,
        ipAddress: pending.ipAddress,
      });

      DatabaseManager.invalidatePendingDeviceVerification(verificationToken);
      const token = DatabaseManager.createSession(user.id);

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'New Device Verified & Trusted',
        message: `Device "${pending.deviceName}" was successfully verified using your payment PIN and added to your trusted devices.`,
        type: 'security',
        read: false,
        createdAt: new Date().toISOString(),
      });
      DatabaseManager.saveDB();

      return res.json({
        message: 'Device verified and trusted successfully.',
        token,
        deviceTrustToken,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Verify new device error:', err);
      return res.status(500).json({ error: 'Verification service error. Please try again.' });
    }
  });

  // Set Up Initial Payment PIN for Device (Secure Recovery / Setup Flow)
  app.post('/api/auth/setup-initial-pin-for-device', (req: Request, res: Response) => {
    try {
      const { verificationToken, password, newPin, confirmPin, deviceId, deviceInfo } = req.body;

      if (!verificationToken) {
        return res.status(400).json({ error: 'Verification session expired. Please sign in again.' });
      }

      const pending = DatabaseManager.getPendingDeviceVerification(verificationToken);
      if (!pending) {
        return res.status(401).json({ error: 'Verification session expired. Please sign in again.' });
      }

      const user = DatabaseManager.findUserById(pending.userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Account password is required to verify your identity.' });
      }

      const isPassValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isPassValid) {
        return res.status(401).json({ error: 'Incorrect account password. Identity verification failed.' });
      }

      if (!newPin || newPin !== confirmPin) {
        return res.status(400).json({ error: 'PIN entries do not match.' });
      }

      if (!/^\d{4,6}$/.test(String(newPin).trim())) {
        return res.status(400).json({ error: 'Payment PIN must consist of exactly 4 to 6 numeric digits.' });
      }

      const { hash: pinHash, salt: pinSalt } = hashPassword(String(newPin).trim());
      user.paymentPinHash = pinHash;
      user.paymentPinSalt = pinSalt;

      const { trustedDevice, deviceTrustToken } = DatabaseManager.addOrUpdateTrustedDevice(user.id, {
        deviceId: deviceId || pending.deviceId,
        deviceName: deviceInfo?.deviceName || pending.deviceName,
        browser: deviceInfo?.browser || pending.browser,
        os: deviceInfo?.os || pending.os,
        ipAddress: pending.ipAddress,
      });

      DatabaseManager.invalidatePendingDeviceVerification(verificationToken);
      const token = DatabaseManager.createSession(user.id);

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Payment PIN Configured & Device Trusted',
        message: `Your payment PIN was established and device "${pending.deviceName}" is now trusted.`,
        type: 'security',
        read: false,
        createdAt: new Date().toISOString(),
      });
      DatabaseManager.saveDB();

      return res.json({
        message: 'Payment PIN configured and device trusted successfully.',
        token,
        deviceTrustToken,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Setup initial PIN error:', err);
      return res.status(500).json({ error: 'Failed to configure payment PIN. Please try again.' });
    }
  });

  // Cancel Pending Device Verification
  app.post('/api/auth/cancel-verification', (req: Request, res: Response) => {
    const { verificationToken } = req.body;
    if (verificationToken) {
      DatabaseManager.invalidatePendingDeviceVerification(verificationToken);
    }
    return res.json({ message: 'Verification cancelled.' });
  });

  // Device Management Endpoints
  app.get('/api/banking/security/devices', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const currentDeviceId = (req.headers['x-device-id'] as string) || '';
    const devices = (user.trustedDevices || []).map((d) => ({
      id: d.id,
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      browser: d.browser,
      os: d.os,
      ipAddress: d.ipAddress,
      trustedAt: d.trustedAt,
      lastUsedAt: d.lastUsedAt,
      status: d.status,
      isCurrentDevice: Boolean(currentDeviceId && d.deviceId === currentDeviceId),
    }));

    return res.json({ devices });
  });

  app.post('/api/banking/security/revoke-device', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required.' });
    }

    const success = DatabaseManager.revokeTrustedDevice(user.id, deviceId);
    if (!success) {
      return res.status(404).json({ error: 'Device not found.' });
    }

    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Trusted Device Revoked',
      message: `A previously trusted device was revoked. Future logins from that device will require payment PIN verification.`,
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });
    DatabaseManager.saveDB();

    return res.json({ message: 'Device trust revoked successfully.' });
  });

  app.post('/api/banking/security/revoke-all-other-devices', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const currentDeviceId = (req.body.currentDeviceId || (req.headers['x-device-id'] as string)) || '';

    const count = DatabaseManager.revokeAllOtherTrustedDevices(user.id, currentDeviceId);

    user.notifications.unshift({
      id: generateId('notif'),
      title: 'All Other Trusted Devices Revoked',
      message: `${count} other device(s) were removed from your trusted devices list.`,
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });
    DatabaseManager.saveDB();

    return res.json({ message: `Successfully revoked ${count} other device(s).`, revokedCount: count });
  });

  // Check Active Session (me)
  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    return res.json({ user: sanitizeUser(user) });
  });

  // Logout
  app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
    const token = (req as any).token as string;
    DatabaseManager.invalidateSession(token);
    return res.json({ message: 'Signed out successfully.' });
  });

  // Forgot Password
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your email address or phone number.' });
    }

    const user = DatabaseManager.findUserByIdentifier(identifier);
    if (!user) {
      // Return neutral message for security
      return res.json({
        message: 'If an account exists with that information, password reset instructions have been sent.',
      });
    }

    // In demo environment, provide instant recovery code
    return res.json({
      message: 'Password reset instructions have been generated.',
      demoResetToken: 'AUR-RESET-9912',
      note: 'In this demonstration environment, use code AUR-RESET-9912 to reset your password.',
    });
  });

  // Reset Password
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { identifier, resetToken, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const user = DatabaseManager.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Password Updated',
      message: 'Your Aurelith Reserve account password was successfully updated.',
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });
    DatabaseManager.saveDB();

    return res.json({ message: 'Password has been updated successfully. You may now sign in.' });
  });

  // ==========================================
  // BANKING TRANSACTIONS & MONEY TRANSFERS
  // ==========================================

  // Get Transaction History
  app.get('/api/banking/transactions', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const db = DatabaseManager.getDB();
    const userTxs = db.transactions
      .filter((t) => t.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({ transactions: userTxs });
  });

  // ==========================================
  // INTERBANK CLEARING & RECIPIENT VERIFICATION
  // ==========================================

  // Get Supported Financial Institutions
  app.get('/api/banking/supported-banks', (_req: Request, res: Response) => {
    return res.json({ banks: SUPPORTED_BANKS });
  });

  // Authoritative Recipient Verification Endpoint (Automatic Directory Lookup)
  app.post('/api/banking/verify-recipient', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { bankName, accountNumber } = req.body;

      if (!accountNumber || typeof accountNumber !== 'string' || !accountNumber.trim()) {
        return res.status(400).json({
          verified: false,
          error: 'Please enter a valid recipient account number.',
        });
      }

      const verification = InterbankVerificationService.verifyRecipient(
        bankName,
        accountNumber.trim(),
        user.id
      );

      return res.json(verification);
    } catch (err: any) {
      console.error('Interbank verification error:', err);
      return res.status(500).json({
        verified: false,
        error: 'Interbank verification directory service temporarily unavailable.',
      });
    }
  });

  // Execute Money Transfer (with strict directory validation for other-bank transfers)
  app.post('/api/banking/transfer', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const {
        sourceAccountId,
        destinationType, // 'internal' | 'other_aurelith' | 'external'
        destinationAccountNumber,
        destinationRoutingNumber,
        swiftCode,
        recipientName,
        bankName,
        amount,
        note,
        paymentReference,
      } = req.body;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Please enter a valid transfer amount greater than $0.00.' });
      }

      if (numAmount > 25000) {
        return res.status(400).json({ error: 'Transfer amount exceeds maximum daily limit of $25,000.00.' });
      }

      const sourceAccount = user.accounts.find((a) => a.id === sourceAccountId);
      if (!sourceAccount) {
        return res.status(400).json({ error: 'Selected source account not found.' });
      }

      if (sourceAccount.availableBalance < numAmount) {
        return res.status(400).json({
          error: `Insufficient available funds. Current available balance is $${sourceAccount.availableBalance.toFixed(2)}.`,
        });
      }

      // Server-Side Balance Range Validation (Source Account)
      const sourceBalanceCheck = checkBalanceConstraints(sourceAccount.name, sourceAccount.balance - numAmount);
      if (!sourceBalanceCheck.allowed) {
        return res.status(400).json({
          error: sourceBalanceCheck.error || `Transfer rejected. This transaction would leave ${sourceAccount.name} below its required Minimum balance of ${formatCurrency(sourceBalanceCheck.minBalance!)}.`,
        });
      }

      // Server-Side Balance Range Validation (Destination Account if Internal or Other Aurelith User)
      if (destinationType === 'internal') {
        const targetAccount = user.accounts.find((a) => a.accountNumber === destinationAccountNumber);
        if (targetAccount) {
          const targetBalanceCheck = checkBalanceConstraints(targetAccount.name, targetAccount.balance + numAmount);
          if (!targetBalanceCheck.allowed) {
            return res.status(400).json({
              error: targetBalanceCheck.error || `Transfer rejected. This transaction would cause ${targetAccount.name} to exceed its Maximum balance limit of ${formatCurrency(targetBalanceCheck.maxBalance!)}.`,
            });
          }
        }
      } else if (destinationType === 'other_aurelith') {
        const otherUserTarget =
          DatabaseManager.findUserByAccountNumber(destinationAccountNumber) ||
          DatabaseManager.findUserByClientId(destinationAccountNumber);
        if (otherUserTarget) {
          const recipientBalanceCheck = checkBalanceConstraints(otherUserTarget.account.name, otherUserTarget.account.balance + numAmount);
          if (!recipientBalanceCheck.allowed) {
            return res.status(400).json({
              error: `Transfer rejected. This payment would cause the recipient's account (${otherUserTarget.account.name}) to exceed its Maximum balance limit of ${formatCurrency(recipientBalanceCheck.maxBalance!)}.`,
            });
          }
        }
      }

      // If user has a Payment PIN configured, require and verify it
      if (user.paymentPinHash && user.paymentPinSalt) {
        const paymentPin = req.body.paymentPin;
        if (!paymentPin) {
          return res.status(401).json({ error: 'Payment Authorization PIN is required to complete this transfer.' });
        }
        if (!verifyPassword(String(paymentPin).trim(), user.paymentPinHash, user.paymentPinSalt)) {
          return res.status(401).json({ error: 'Incorrect Payment Authorization PIN. Transfer cancelled.' });
        }
      }

      // Strict validation for External / Other Bank transfers
      let verifiedBankName = bankName || 'External Bank';
      let verifiedRouting = destinationRoutingNumber || '111301122';
      let verifiedSwift = swiftCode || 'AURUS33D';
      let authoritativeRecipientName = recipientName;

      if (destinationType === 'external') {
        if (!destinationAccountNumber) {
          return res.status(400).json({ error: 'Recipient account number is required.' });
        }

        const validation = InterbankVerificationService.validateTransferIdentifiers({
          bankName,
          accountNumber: destinationAccountNumber,
          recipientName: recipientName || '',
          routingNumber: destinationRoutingNumber,
          swiftCode,
        });

        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }

        if (validation.validatedRecipient) {
          verifiedBankName = validation.validatedRecipient.bankName;
          verifiedRouting = validation.validatedRecipient.routingNumber;
          verifiedSwift = validation.validatedRecipient.swiftCode;
          authoritativeRecipientName = validation.validatedRecipient.recipientName;
        }
      }

      const db = DatabaseManager.getDB();
      const reference = generateReference('AUR-TRF');
      const fee = 0; // Fee-free in demo reserve tier
      const finalNarration = paymentReference || note || '';

      // Atomic Balance Deduction
      sourceAccount.balance -= numAmount;
      sourceAccount.availableBalance -= numAmount;

      const debitTx: Transaction = {
        id: generateId('tx'),
        reference,
        userId: user.id,
        accountId: sourceAccount.id,
        type: 'transfer',
        category: destinationType === 'internal' ? 'Internal Transfer' : 'Interbank Wire / ACH Transfer',
        amount: numAmount,
        direction: 'debit',
        description: `Transfer to ${authoritativeRecipientName || destinationAccountNumber}${finalNarration ? ` • ${finalNarration}` : ''}`,
        recipientName: authoritativeRecipientName || 'Recipient',
        recipientAccount: destinationAccountNumber,
        recipientBank: verifiedBankName,
        status: 'completed',
        fee,
        timestamp: new Date().toISOString(),
        balanceAfter: sourceAccount.balance,
      };

      db.transactions.push(debitTx);

      // Handle if internal transfer to another account of same user or another registered Aurelith user
      if (destinationType === 'internal') {
        const targetAccount = user.accounts.find((a) => a.accountNumber === destinationAccountNumber);
        if (targetAccount) {
          targetAccount.balance += numAmount;
          targetAccount.availableBalance += numAmount;

          const creditTx: Transaction = {
            id: generateId('tx'),
            reference: `${reference}-IN`,
            userId: user.id,
            accountId: targetAccount.id,
            type: 'transfer',
            category: 'Internal Transfer',
            amount: numAmount,
            direction: 'credit',
            description: `Transfer from ${sourceAccount.name}`,
            status: 'completed',
            fee: 0,
            timestamp: new Date().toISOString(),
            balanceAfter: targetAccount.balance,
          };
          db.transactions.push(creditTx);
        }
      } else if (destinationType === 'other_aurelith') {
        const otherUserTarget =
          DatabaseManager.findUserByAccountNumber(destinationAccountNumber) ||
          DatabaseManager.findUserByClientId(destinationAccountNumber);
        if (otherUserTarget) {
          otherUserTarget.account.balance += numAmount;
          otherUserTarget.account.availableBalance += numAmount;

          const recipientTx: Transaction = {
            id: generateId('tx'),
            reference: `${reference}-RCV`,
            userId: otherUserTarget.user.id,
            accountId: otherUserTarget.account.id,
            type: 'transfer',
            category: 'Aurelith P2P Transfer',
            amount: numAmount,
            direction: 'credit',
            description: `Transfer received from ${user.firstName} ${user.lastName}`,
            status: 'completed',
            fee: 0,
            timestamp: new Date().toISOString(),
            balanceAfter: otherUserTarget.account.balance,
          };
          db.transactions.push(recipientTx);

          otherUserTarget.user.notifications.unshift({
            id: generateId('notif'),
            title: 'Payment Received',
            message: `You received $${numAmount.toFixed(2)} from ${user.firstName} ${user.lastName}.`,
            type: 'transaction',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Add notification for sender
      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Transfer Completed',
        message: `Successfully transferred $${numAmount.toFixed(2)} to ${authoritativeRecipientName || destinationAccountNumber} at ${verifiedBankName}. Ref: ${reference}`,
        type: 'transaction',
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Save Beneficiary if requested
      if (req.body.saveBeneficiary && authoritativeRecipientName && destinationAccountNumber) {
        const exists = user.beneficiaries.some((b) => b.accountNumber === destinationAccountNumber);
        if (!exists) {
          user.beneficiaries.push({
            id: generateId('ben'),
            name: authoritativeRecipientName,
            bankName: verifiedBankName,
            accountNumber: destinationAccountNumber,
            routingNumber: verifiedRouting,
            nickname: req.body.nickname,
            createdAt: new Date().toISOString(),
          });
        }
      }

      DatabaseManager.saveDB();

      return res.json({
        message: 'Transfer executed successfully!',
        receipt: {
          reference,
          amount: numAmount,
          fee,
          sourceAccountName: sourceAccount.name,
          sourceAccountNumber: sourceAccount.accountNumber,
          recipientName: authoritativeRecipientName || 'Beneficiary',
          recipientAccountNumber: destinationAccountNumber,
          recipientBank: verifiedBankName,
          routingNumber: verifiedRouting,
          swiftCode: verifiedSwift,
          paymentReference: finalNarration || undefined,
          timestamp: debitTx.timestamp,
          status: 'completed',
          newBalance: sourceAccount.balance,
        },
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Transfer execution error:', err);
      return res.status(500).json({ error: 'Transfer failed to process. Please try again.' });
    }
  });

  // Pay Bills
  app.post('/api/banking/bills/pay', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { sourceAccountId, btype, provider, accountNumber, amount, billerName } = req.body;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Please enter a valid bill payment amount.' });
      }

      const sourceAccount = user.accounts.find((a) => a.id === sourceAccountId) || user.accounts[0];
      if (!sourceAccount || sourceAccount.availableBalance < numAmount) {
        return res.status(400).json({ error: 'Insufficient funds for bill payment.' });
      }

      const billBalanceCheck = checkBalanceConstraints(sourceAccount.name, sourceAccount.balance - numAmount);
      if (!billBalanceCheck.allowed) {
        return res.status(400).json({
          error: billBalanceCheck.error || `Bill payment rejected. This payment would leave ${sourceAccount.name} below its required Minimum balance of ${formatCurrency(billBalanceCheck.minBalance!)}.`,
        });
      }

      sourceAccount.balance -= numAmount;
      sourceAccount.availableBalance -= numAmount;

      const reference = generateReference('AUR-BILL');
      const db = DatabaseManager.getDB();

      const tx: Transaction = {
        id: generateId('tx'),
        reference,
        userId: user.id,
        accountId: sourceAccount.id,
        type: 'bill_payment',
        category: btype || 'Utility Bill',
        amount: numAmount,
        direction: 'debit',
        description: `Bill Payment to ${provider || billerName || 'Biller'} (Acct: ${accountNumber || 'N/A'})`,
        recipientName: provider || billerName,
        recipientAccount: accountNumber,
        status: 'completed',
        fee: 0,
        timestamp: new Date().toISOString(),
        balanceAfter: sourceAccount.balance,
      };

      db.transactions.push(tx);

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Bill Payment Confirmation',
        message: `Paid $${numAmount.toFixed(2)} to ${provider || billerName}. Reference: ${reference}`,
        type: 'transaction',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: 'Bill payment processed successfully!',
        receipt: {
          reference,
          provider: provider || billerName,
          amount: numAmount,
          accountNumber,
          timestamp: tx.timestamp,
        },
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Bill payment error:', err);
      return res.status(500).json({ error: 'Bill payment failed. Please try again.' });
    }
  });

  // Buy Airtime / Mobile Data
  app.post('/api/banking/airtime-data', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { type, provider, phoneNumber, amount, dataPlan } = req.body;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Please enter a valid amount.' });
      }

      const sourceAccount = user.accounts[0];
      if (!sourceAccount || sourceAccount.availableBalance < numAmount) {
        return res.status(400).json({ error: 'Insufficient funds for airtime/data recharge.' });
      }

      const telecomBalanceCheck = checkBalanceConstraints(sourceAccount.name, sourceAccount.balance - numAmount);
      if (!telecomBalanceCheck.allowed) {
        return res.status(400).json({
          error: telecomBalanceCheck.error || `Transaction rejected. This transaction would leave ${sourceAccount.name} below its required Minimum balance of ${formatCurrency(telecomBalanceCheck.minBalance!)}.`,
        });
      }

      sourceAccount.balance -= numAmount;
      sourceAccount.availableBalance -= numAmount;

      const reference = generateReference('AUR-TEL');
      const db = DatabaseManager.getDB();

      const tx: Transaction = {
        id: generateId('tx'),
        reference,
        userId: user.id,
        accountId: sourceAccount.id,
        type: type === 'data' ? 'data' : 'airtime',
        category: 'Telecom',
        amount: numAmount,
        direction: 'debit',
        description: `${type === 'data' ? `Data Package (${dataPlan || 'Plan'})` : 'Mobile Airtime'} • ${provider} (${phoneNumber})`,
        recipientName: provider,
        recipientAccount: phoneNumber,
        status: 'completed',
        fee: 0,
        timestamp: new Date().toISOString(),
        balanceAfter: sourceAccount.balance,
      };

      db.transactions.push(tx);

      user.notifications.unshift({
        id: generateId('notif'),
        title: `${type === 'data' ? 'Mobile Data' : 'Airtime'} Purchased`,
        message: `Successfully sent $${numAmount.toFixed(2)} ${type} to ${phoneNumber} (${provider}).`,
        type: 'transaction',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: `${type === 'data' ? 'Data plan' : 'Airtime'} dispatched successfully!`,
        receipt: { reference, provider, phoneNumber, amount: numAmount, timestamp: tx.timestamp },
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Telecom topup error:', err);
      return res.status(500).json({ error: 'Failed to complete telecom recharge.' });
    }
  });

  // ==========================================
  // CARDS MANAGEMENT
  // ==========================================

  // Toggle Card Freeze
  app.post('/api/banking/cards/toggle-freeze', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { cardId } = req.body;

    const card = user.cards.find((c) => c.id === cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    card.status = card.status === 'active' ? 'frozen' : 'active';

    user.notifications.unshift({
      id: generateId('notif'),
      title: `Card ${card.status === 'frozen' ? 'Locked / Frozen' : 'Unlocked'}`,
      message: `Your debit card ending in ${card.last4} is now ${card.status}.`,
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();
    return res.json({ message: `Card status updated to ${card.status}.`, card, user: sanitizeUser(user) });
  });

  // Update Card Limits
  app.post('/api/banking/cards/update-limits', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { cardId, dailyLimit, monthlyLimit, contactlessEnabled, onlinePurchasesEnabled } = req.body;

    const card = user.cards.find((c) => c.id === cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    if (dailyLimit !== undefined) card.dailyLimit = Number(dailyLimit);
    if (monthlyLimit !== undefined) card.monthlyLimit = Number(monthlyLimit);
    if (contactlessEnabled !== undefined) card.contactlessEnabled = Boolean(contactlessEnabled);
    if (onlinePurchasesEnabled !== undefined) card.onlinePurchasesEnabled = Boolean(onlinePurchasesEnabled);

    DatabaseManager.saveDB();
    return res.json({ message: 'Card controls updated successfully.', card, user: sanitizeUser(user) });
  });

  // Request New Card
  app.post('/api/banking/cards/request-replacement', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { cardType } = req.body;

    const cardInfo = generateCardNumber();
    const newCard = {
      id: generateId('crd'),
      accountId: user.accounts[0].id,
      cardType: cardType === 'debit_physical' ? ('debit_physical' as const) : ('debit_virtual' as const),
      cardHolderName: `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`,
      last4: cardInfo.last4,
      cardMaskedNumber: cardInfo.fullMasked,
      expiryMonth: '10',
      expiryYear: '31',
      status: 'active' as const,
      dailyLimit: 3000,
      monthlyLimit: 25000,
      contactlessEnabled: true,
      onlinePurchasesEnabled: true,
    };

    user.cards.push(newCard);
    user.notifications.unshift({
      id: generateId('notif'),
      title: 'New Card Issued',
      message: `Your new Aurelith Reserve ${cardType === 'debit_physical' ? 'Physical' : 'Virtual'} Debit Card (ending in ${cardInfo.last4}) has been issued.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();
    return res.json({ message: 'New card activated successfully.', card: newCard, user: sanitizeUser(user) });
  });

  // ==========================================
  // LOANS MANAGEMENT
  // ==========================================

  // Apply for Loan
  app.post('/api/banking/loans/apply', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { type, requestedAmount, termMonths, purpose, employmentStatus, annualIncome } = req.body;

      const numAmount = Number(requestedAmount);
      const numTerm = Number(termMonths) || 24;

      if (!numAmount || numAmount < 1000) {
        return res.status(400).json({ error: 'Minimum loan request is $1,000.00.' });
      }

      // Interest rates based on product type
      let interestRate = 6.49;
      if (type === 'Home Mortgage') interestRate = 5.99;
      else if (type === 'Small Business Capital') interestRate = 7.25;
      else if (type === 'Auto Loan') interestRate = 5.49;

      const monthlyInterest = interestRate / 100 / 12;
      const monthlyPayment =
        (numAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, numTerm))) /
        (Math.pow(1 + monthlyInterest, numTerm) - 1);

      // In demonstration banking environment, standard qualified applicant is approved automatically for testing
      const isApproved = Number(annualIncome) > 35000 || numAmount <= 15000;
      const status = isApproved ? 'approved' : 'under_review';

      const loanRecord = {
        id: generateId('ln'),
        type: type || 'Personal Loan',
        requestedAmount: numAmount,
        approvedAmount: isApproved ? numAmount : 0,
        remainingBalance: isApproved ? numAmount : 0,
        termMonths: numTerm,
        interestRate,
        monthlyPayment: Number(monthlyPayment.toFixed(2)),
        purpose: purpose || 'General Financing',
        status: status as 'approved' | 'under_review',
        applicationDate: new Date().toISOString(),
      };

      user.loans.push(loanRecord);

      // If approved in demo environment, disburse to Checking account
      if (isApproved) {
        const checkingAccount = user.accounts[0];
        const candidateBalance = checkingAccount.balance + numAmount;
        const tierCheck = checkBalanceConstraints(checkingAccount.name, candidateBalance);
        if (!tierCheck.allowed) {
          return res.status(400).json({
            error: `Loan disbursement cannot be processed. Crediting $${numAmount.toLocaleString()} would cause ${checkingAccount.name} to exceed its Maximum balance limit of ${formatCurrency(tierCheck.maxBalance!)}.`,
          });
        }

        checkingAccount.balance += numAmount;
        checkingAccount.availableBalance += numAmount;

        const db = DatabaseManager.getDB();
        db.transactions.push({
          id: generateId('tx'),
          reference: generateReference('AUR-LN'),
          userId: user.id,
          accountId: checkingAccount.id,
          type: 'loan_disbursement',
          category: 'Loan Disbursement',
          amount: numAmount,
          direction: 'credit',
          description: `${type} Approved Disbursement (${loanRecord.id})`,
          status: 'completed',
          fee: 0,
          timestamp: new Date().toISOString(),
          balanceAfter: checkingAccount.balance,
        });

        user.notifications.unshift({
          id: generateId('notif'),
          title: 'Loan Approved & Disbursed',
          message: `Congratulations! Your ${type} for $${numAmount.toLocaleString()} has been approved. Funds have been credited to your checking account.`,
          type: 'loan',
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else {
        user.notifications.unshift({
          id: generateId('notif'),
          title: 'Loan Application Under Review',
          message: `Your ${type} application for $${numAmount.toLocaleString()} is currently under underwriter review.`,
          type: 'loan',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      DatabaseManager.saveDB();

      return res.status(201).json({
        message: isApproved
          ? 'Loan approved and funds disbursed to your checking account!'
          : 'Application received and currently under review.',
        loan: loanRecord,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Loan application error:', err);
      return res.status(500).json({ error: 'Loan processing error.' });
    }
  });

  // ==========================================
  // SAVINGS GOALS
  // ==========================================

  // Create Savings Goal
  app.post('/api/banking/savings/goals', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { name, targetAmount, targetDate, category, initialContribution } = req.body;

    const numTarget = Number(targetAmount);
    const numInitial = Number(initialContribution) || 0;

    if (!name || !numTarget || numTarget <= 0) {
      return res.status(400).json({ error: 'Please enter a goal name and valid target amount.' });
    }

    if (numInitial > 0) {
      const chk = user.accounts[0];
      if (chk.availableBalance < numInitial) {
        return res.status(400).json({ error: 'Insufficient funds for initial goal funding.' });
      }
      const goalBalanceCheck = checkBalanceConstraints(chk.name, chk.balance - numInitial);
      if (!goalBalanceCheck.allowed) {
        return res.status(400).json({
          error: goalBalanceCheck.error || `Savings deposit rejected. This funding would leave ${chk.name} below its required Minimum balance of ${formatCurrency(goalBalanceCheck.minBalance!)}.`,
        });
      }
      chk.balance -= numInitial;
      chk.availableBalance -= numInitial;

      const db = DatabaseManager.getDB();
      db.transactions.push({
        id: generateId('tx'),
        reference: generateReference('AUR-SAV'),
        userId: user.id,
        accountId: chk.id,
        type: 'transfer',
        category: 'Savings Deposit',
        amount: numInitial,
        direction: 'debit',
        description: `Deposit to Goal: ${name}`,
        status: 'completed',
        fee: 0,
        timestamp: new Date().toISOString(),
        balanceAfter: chk.balance,
      });
    }

    const newGoal = {
      id: generateId('sg'),
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: numInitial,
      targetDate: targetDate || '2027-12-31',
      category: category || 'General Reserve',
      createdAt: new Date().toISOString(),
    };

    user.savingsGoals.push(newGoal);
    DatabaseManager.saveDB();

    return res.status(201).json({
      message: 'Savings goal created successfully!',
      goal: newGoal,
      user: sanitizeUser(user),
    });
  });

  // Contribute to Savings Goal
  app.post('/api/banking/savings/contribute', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { goalId, amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid contribution amount.' });
    }

    const goal = user.savingsGoals.find((g) => g.id === goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }

    const chk = user.accounts[0];
    if (chk.availableBalance < numAmount) {
      return res.status(400).json({ error: 'Insufficient funds in checking account.' });
    }

    const contributeBalanceCheck = checkBalanceConstraints(chk.name, chk.balance - numAmount);
    if (!contributeBalanceCheck.allowed) {
      return res.status(400).json({
        error: contributeBalanceCheck.error || `Savings deposit rejected. This deposit would leave ${chk.name} below its required Minimum balance of ${formatCurrency(contributeBalanceCheck.minBalance!)}.`,
      });
    }

    chk.balance -= numAmount;
    chk.availableBalance -= numAmount;
    goal.currentAmount += numAmount;

    const db = DatabaseManager.getDB();
    db.transactions.push({
      id: generateId('tx'),
      reference: generateReference('AUR-SAV'),
      userId: user.id,
      accountId: chk.id,
      type: 'transfer',
      category: 'Savings Deposit',
      amount: numAmount,
      direction: 'debit',
      description: `Deposit to Savings Goal: ${goal.name}`,
      status: 'completed',
      fee: 0,
      timestamp: new Date().toISOString(),
      balanceAfter: chk.balance,
    });

    DatabaseManager.saveDB();
    return res.json({ message: 'Funds added to savings goal!', goal, user: sanitizeUser(user) });
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  // Mark all notifications read
  app.post('/api/banking/notifications/read-all', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    user.notifications.forEach((n) => (n.read = true));
    DatabaseManager.saveDB();
    return res.json({ message: 'All notifications marked as read.', user: sanitizeUser(user) });
  });

  // Mark single notification read
  app.post('/api/banking/notifications/read', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { notificationId } = req.body;
    const notif = user.notifications.find((n) => n.id === notificationId);
    if (notif) notif.read = true;
    DatabaseManager.saveDB();
    return res.json({ message: 'Notification updated.', user: sanitizeUser(user) });
  });

  // ==========================================
  // ACCOUNT CUSTOMIZATION (NICKNAMES & DISPLAY NAMES)
  // ==========================================

  // Customize Account Display Name (persists nickname, validates length, protects authoritative banking identity)
  app.patch('/api/banking/accounts/:accountId/customization', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { accountId } = req.params;
      const { nickname, institution } = req.body;

      const targetAccount = user.accounts.find((a) => a.id === accountId);
      if (!targetAccount) {
        return res.status(404).json({ error: 'Specified account not found in your authenticated profile.' });
      }

      // Check institution tampering:
      // Accounts at Aurelith Reserve cannot arbitrarily claim to be another institution (e.g., Chase, Bank of America)
      // unless issued by or authoritatively verified with that institution.
      if (institution && typeof institution === 'string') {
        const cleanInst = institution.trim();
        const currentInst = targetAccount.institution || 'Aurelith Reserve';
        if (cleanInst.toLowerCase() !== currentInst.toLowerCase() && cleanInst.toLowerCase() !== 'aurelith reserve') {
          return res.status(400).json({
            error: `Financial institution for this account is authoritative ("${currentInst}") and cannot be reassigned arbitrarily. Connecting external bank accounts (such as JPMorgan Chase or Bank of America) requires an authoritative banking integration or certified institution issuance.`,
          });
        }
      }

      // Validate nickname
      if (nickname !== undefined && nickname !== null) {
        if (typeof nickname !== 'string') {
          return res.status(400).json({ error: 'Account display name must be a text label.' });
        }
        const cleanNickname = nickname.trim();
        if (cleanNickname.length > 40) {
          return res.status(400).json({ error: 'Account display name must be 40 characters or fewer.' });
        }
        targetAccount.nickname = cleanNickname.length > 0 ? cleanNickname : undefined;
      }

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Account Display Name Personalization',
        message: targetAccount.nickname
          ? `Display name for account •••• ${targetAccount.accountNumber.slice(-4)} updated to "${targetAccount.nickname}".`
          : `Custom display name cleared for account •••• ${targetAccount.accountNumber.slice(-4)}. Default label restored.`,
        type: 'general',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: 'Account personalization saved successfully.',
        account: targetAccount,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Account customization error:', err);
      return res.status(500).json({ error: 'Failed to update account customization.' });
    }
  });

  // Alias POST endpoint
  app.post('/api/banking/accounts/customize', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { accountId, nickname, institution } = req.body;

      if (!accountId) {
        return res.status(400).json({ error: 'Account ID is required.' });
      }

      const targetAccount = user.accounts.find((a) => a.id === accountId);
      if (!targetAccount) {
        return res.status(404).json({ error: 'Specified account not found in your authenticated profile.' });
      }

      if (institution && typeof institution === 'string') {
        const cleanInst = institution.trim();
        const currentInst = targetAccount.institution || 'Aurelith Reserve';
        if (cleanInst.toLowerCase() !== currentInst.toLowerCase() && cleanInst.toLowerCase() !== 'aurelith reserve') {
          return res.status(400).json({
            error: `Financial institution for this account is authoritative ("${currentInst}") and cannot be reassigned arbitrarily. Connecting external bank accounts (such as JPMorgan Chase or Bank of America) requires an authoritative banking integration or certified institution issuance.`,
          });
        }
      }

      if (nickname !== undefined && nickname !== null) {
        if (typeof nickname !== 'string') {
          return res.status(400).json({ error: 'Account display name must be a text label.' });
        }
        const cleanNickname = nickname.trim();
        if (cleanNickname.length > 40) {
          return res.status(400).json({ error: 'Account display name must be 40 characters or fewer.' });
        }
        targetAccount.nickname = cleanNickname.length > 0 ? cleanNickname : undefined;
      }

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Account Display Name Personalization',
        message: targetAccount.nickname
          ? `Display name for account •••• ${targetAccount.accountNumber.slice(-4)} updated to "${targetAccount.nickname}".`
          : `Custom display name cleared for account •••• ${targetAccount.accountNumber.slice(-4)}. Default label restored.`,
        type: 'general',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: 'Account personalization saved successfully.',
        account: targetAccount,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Account customization error:', err);
      return res.status(500).json({ error: 'Failed to update account customization.' });
    }
  });

  // ==========================================
  // PROFILE, SETTINGS & SECURITY
  // ==========================================

  // Read-only Profile Protection (strictly blocks tampering with verified customer records)
  app.post('/api/banking/profile/update', requireAuth, (_req: Request, res: Response) => {
    return res.status(403).json({
      error: 'Personal profile details are authoritative and read-only. Official amendments require concierge or compliance verification.',
    });
  });

  // Update or Remove Profile Photo
  app.post('/api/banking/profile/photo', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { avatarUrl } = req.body;

      if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl === 'string') {
        if (avatarUrl.length > 500000) {
          return res.status(400).json({ error: 'Avatar data URL exceeds acceptable length (max 350KB).' });
        }
        user.avatarUrl = avatarUrl;
        user.photoDataUrl = avatarUrl;
      } else {
        user.avatarUrl = undefined;
        user.photoDataUrl = undefined;
      }

      user.notifications.unshift({
        id: generateId('notif'),
        title: user.avatarUrl ? 'Profile Photo Updated' : 'Profile Photo Removed',
        message: user.avatarUrl
          ? 'Your verified profile image was updated and stored securely.'
          : 'Your profile photo was removed and reverted to standard initials monogram.',
        type: 'general',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: user.avatarUrl ? 'Profile photo updated successfully.' : 'Profile photo removed.',
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Profile photo update error:', err);
      return res.status(500).json({ error: 'Failed to update profile photo.' });
    }
  });

  // Update Notification Preferences & Security Controls
  app.post('/api/banking/settings/preferences', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { notificationPreferences, securitySettings } = req.body;

    if (notificationPreferences) {
      user.notificationPreferences = {
        emailTransactions: notificationPreferences.emailTransactions ?? true,
        smsSecurity: notificationPreferences.smsSecurity ?? true,
        monthlyStatements: notificationPreferences.monthlyStatements ?? true,
      };
    }

    if (securitySettings) {
      user.securitySettings = {
        twoFactorEnabled: securitySettings.twoFactorEnabled ?? true,
        biometricsEnabled: securitySettings.biometricsEnabled ?? true,
      };
    }

    DatabaseManager.saveDB();
    return res.json({
      message: 'Preferences successfully saved.',
      user: sanitizeUser(user),
    });
  });

  // Security: Step 1 - Request One-Time Email Verification Code for Password Change
  app.post('/api/banking/security/request-password-code', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const verificationCode = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    user.pendingPasswordReset = {
      token: verificationCode,
      expiresAt,
    };

    // Dispatched to customer's verified electronic notification address
    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Security: Password Change Authorization Code',
      message: `Your one-time security authorization code is: ${verificationCode}. Dispatched to ${user.email}. Valid for 15 minutes.`,
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();

    return res.json({
      message: `Verification code successfully dispatched to your verified email address (${user.email}).`,
      verificationCode, // Exposed in response for rapid testing/preview in demo
      destinationEmail: user.email,
      expiresInMinutes: 15,
    });
  });

  // Security: Step 2 - Verify Email Code and Update Password
  app.post('/api/banking/security/verify-and-change-password', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { verificationCode, newPassword, confirmPassword } = req.body;

    if (!verificationCode || !newPassword) {
      return res.status(400).json({ error: 'Verification code and new password are required.' });
    }

    if (!user.pendingPasswordReset || user.pendingPasswordReset.expiresAt < Date.now()) {
      return res.status(400).json({
        error: 'No active password change authorization code found or the code has expired. Please request a new code.',
      });
    }

    const cleanInputCode = verificationCode.trim().toUpperCase();
    const cleanStoredCode = user.pendingPasswordReset.token.trim().toUpperCase();

    if (cleanInputCode !== cleanStoredCode && cleanInputCode !== cleanStoredCode.replace('AUR-', '')) {
      return res.status(400).json({
        error: 'Invalid verification code. Please check the authorization code sent to your email or notifications.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and password confirmation do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.pendingPasswordReset = undefined;

    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Password Successfully Changed',
      message: 'Your Aurelith Reserve account password was successfully updated via authorized email token verification.',
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();

    return res.json({
      message: 'Password successfully updated and verified.',
      user: sanitizeUser(user),
    });
  });

  // Security: Initial Setup of Transaction PIN (four numeric digits, only when user has no existing PIN)
  app.post('/api/banking/security/setup-pin', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { pin, confirmPin } = req.body;

      // Authoritative check: do not overwrite an existing transaction PIN or reset it through this setup pop-up
      if (user.paymentPinHash && user.paymentPinSalt) {
        return res.status(400).json({ error: 'A transaction PIN is already configured for this account.' });
      }

      if (!pin || !confirmPin) {
        return res.status(400).json({ error: 'Please enter and confirm your four-digit transaction PIN.' });
      }

      const cleanPin = String(pin).trim();
      const cleanConfirm = String(confirmPin).trim();

      // Accept exactly four numeric digits. Reject non-digits or wrong length.
      if (!/^\d{4}$/.test(cleanPin)) {
        return res.status(400).json({ error: 'Transaction PIN must consist of exactly four numeric digits.' });
      }

      if (cleanPin !== cleanConfirm) {
        return res.status(400).json({ error: 'Transaction PINs do not match.' });
      }

      const { hash, salt } = hashPassword(cleanPin);
      user.paymentPinHash = hash;
      user.paymentPinSalt = salt;

      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Transaction PIN Configured',
        message: 'Your four-digit Transaction PIN has been securely set up and activated.',
        type: 'security',
        read: false,
        createdAt: new Date().toISOString(),
      });

      DatabaseManager.saveDB();

      return res.json({
        message: 'Transaction PIN successfully set.',
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Setup PIN error:', err);
      return res.status(500).json({ error: 'Failed to configure transaction PIN.' });
    }
  });

  // Security: Configure or Update Payment Authorization PIN (requires current password)
  app.post('/api/banking/security/set-payment-pin', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { currentPassword, newPin, confirmPin } = req.body;

    if (!currentPassword || !newPin || !confirmPin) {
      return res.status(400).json({ error: 'Please enter your current account password and 4-6 digit Payment PIN.' });
    }

    // Verify current account password
    if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
      return res.status(401).json({ error: 'Incorrect account password. PIN configuration unauthorized.' });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({ error: 'Payment PIN entries do not match.' });
    }

    if (!/^\d{4,6}$/.test(newPin.trim())) {
      return res.status(400).json({ error: 'Payment PIN must consist of exactly 4 to 6 numeric digits.' });
    }

    const { hash, salt } = hashPassword(newPin.trim());
    user.paymentPinHash = hash;
    user.paymentPinSalt = salt;

    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Payment PIN Configured',
      message: 'Your 4-6 digit Payment Authorization PIN has been successfully activated for money transfers.',
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();

    return res.json({
      message: 'Payment PIN successfully set and secured.',
      user: sanitizeUser(user),
    });
  });

  // Security: Verify Payment PIN
  app.post('/api/banking/security/verify-payment-pin', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { paymentPin } = req.body;

    if (!paymentPin) {
      return res.status(400).json({ valid: false, error: 'Please enter your Payment PIN.' });
    }

    if (!user.paymentPinHash || !user.paymentPinSalt) {
      return res.json({ valid: true, note: 'No Payment PIN configured on account.' });
    }

    const isValid = verifyPassword(String(paymentPin).trim(), user.paymentPinHash, user.paymentPinSalt);
    if (!isValid) {
      return res.status(401).json({ valid: false, error: 'Incorrect Payment Authorization PIN.' });
    }

    return res.json({ valid: true, message: 'Payment PIN verified.' });
  });

  // Support / Dispute Ticket
  app.post('/api/banking/support/ticket', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Please enter a ticket subject and message.' });
    }

    const ticket = {
      id: generateId('tkt'),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      subject: subject.trim(),
      category: category || 'General Inquiry',
      message: message.trim(),
      status: 'open' as const,
      createdAt: new Date().toISOString(),
    };

    const db = DatabaseManager.getDB();
    db.supportTickets.push(ticket);

    user.notifications.unshift({
      id: generateId('notif'),
      title: 'Support Ticket Received',
      message: `Your inquiry "${subject}" has been received. Ticket ID: ${ticket.id}. An advisor will review it promptly.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString(),
    });

    DatabaseManager.saveDB();
    return res.status(201).json({
      message: 'Support ticket submitted successfully. Reference ticket ID: ' + ticket.id,
      ticket,
      user: sanitizeUser(user),
    });
  });

  // Reset demonstration data helper
  app.post('/api/banking/demo/reset', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    user.accounts[0].balance = 14850.75;
    user.accounts[0].availableBalance = 14850.75;
    user.accounts[1].balance = 42500.00;
    user.accounts[1].availableBalance = 42500.00;
    DatabaseManager.saveDB();
    return res.json({ message: 'Demonstration balances reset to default values.', user: sanitizeUser(user) });
  });

  // Role toggle helper (for verifying customer vs administrator permissions)
  app.post('/api/banking/profile/toggle-role', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    user.role = user.role === 'admin' ? 'customer' : 'admin';
    DatabaseManager.saveDB();
    return res.json({
      message: `Active profile permission role toggled to: ${user.role.toUpperCase()}`,
      role: user.role,
      user: sanitizeUser(user),
    });
  });

  // ==========================================
  // STATEMENT GENERATION & ADMIN DESK ENDPOINTS
  // ==========================================

  function filterTransactionsByCategory(transactions: Transaction[], category: string): Transaction[] {
    switch (category) {
      case 'Utility Bill Payments':
        return transactions.filter(
          (tx) =>
            tx.type === 'bill_payment' ||
            tx.category.toLowerCase().includes('utilit') ||
            tx.category.toLowerCase().includes('electric') ||
            tx.category.toLowerCase().includes('water') ||
            tx.category.toLowerCase().includes('power') ||
            tx.category.toLowerCase().includes('cable') ||
            tx.category.toLowerCase().includes('internet')
        );
      case 'Water Bill Payments':
        return transactions.filter(
          (tx) =>
            tx.category.toLowerCase().includes('water') ||
            tx.description.toLowerCase().includes('water') ||
            (tx.recipientName && tx.recipientName.toLowerCase().includes('water'))
        );
      case 'Airtime Purchases':
        return transactions.filter(
          (tx) =>
            tx.type === 'airtime' ||
            tx.category.toLowerCase().includes('airtime') ||
            tx.description.toLowerCase().includes('airtime')
        );
      case 'Incoming Transfers (Inflows)':
        return transactions.filter((tx) => tx.direction === 'credit');
      case 'Outgoing Transfers (Outflows)':
        return transactions.filter((tx) => tx.direction === 'debit');
      case 'Entire Account Statement':
      default:
        return transactions;
    }
  }

  // 1. Authoritative Statement Preparation & Calculation
  app.post('/api/banking/statements/prepare', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { accountId, startDate, endDate, category, deliveryMethod } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both start date and end date must be provided.' });
      }

      if (startDate > endDate) {
        return res.status(400).json({ error: 'Start date cannot be after end date.' });
      }

      const account = user.accounts.find((a) => a.id === accountId) || user.accounts[0];
      if (!account) {
        return res.status(404).json({ error: 'Designated account not found.' });
      }

      const db = DatabaseManager.getDB();
      // Only pull transactions for the currently authenticated customer and specified account
      const allUserTxs = db.transactions
        .filter((t) => t.userId === user.id && t.accountId === account.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Filter by date range
      const periodTxs = allUserTxs.filter((t) => {
        const d = t.timestamp.slice(0, 10);
        return d >= startDate && d <= endDate;
      });

      // Filter by requested category
      const targetCategory = category || 'Entire Account Statement';
      const matchingTxs = filterTransactionsByCategory(periodTxs, targetCategory);

      // Determine authoritative opening balance:
      // Last transaction before start date, or derive from earliest period tx
      const priorTxs = allUserTxs.filter((t) => t.timestamp.slice(0, 10) < startDate);
      let openingBalance = account.balance;
      if (priorTxs.length > 0) {
        openingBalance = priorTxs[priorTxs.length - 1].balanceAfter;
      } else if (periodTxs.length > 0) {
        const first = periodTxs[0];
        openingBalance = first.direction === 'credit'
          ? first.balanceAfter - first.amount
          : first.balanceAfter + first.amount;
      }

      const totalDebits = Number(
        matchingTxs
          .filter((t) => t.direction === 'debit')
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      );
      const debitCount = matchingTxs.filter((t) => t.direction === 'debit').length;

      const totalCredits = Number(
        matchingTxs
          .filter((t) => t.direction === 'credit')
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      );
      const creditCount = matchingTxs.filter((t) => t.direction === 'credit').length;

      const netChange = Number((totalCredits - totalDebits).toFixed(2));
      const closingBalance =
        periodTxs.length > 0
          ? periodTxs[periodTxs.length - 1].balanceAfter
          : account.balance;

      const now = new Date();
      const serverTimestamp = now.toISOString();
      const serverTimeFormatted = now.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const serverTimezone = 'CDT (UTC-05:00)';
      const auditReference = generateReference('AUR-STMT');

      return res.json({
        account: {
          ...account,
          swiftCode: account.swiftCode || 'AURUS33D',
        },
        user: {
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber,
          address: `${user.residentialAddress.street}, ${user.residentialAddress.city}, ${user.residentialAddress.state} ${user.residentialAddress.zipCode}`,
        },
        startDate,
        endDate,
        category: targetCategory,
        deliveryMethod: deliveryMethod || 'download',
        serverTimestamp,
        serverTimeFormatted: `${serverTimeFormatted} CDT`,
        serverTimezone,
        auditReference,
        summary: {
          openingBalance,
          closingBalance,
          totalDebits,
          debitCount,
          totalCredits,
          creditCount,
          netChange,
          transactionCount: matchingTxs.length,
        },
        transactions: matchingTxs,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error preparing account statement.' });
    }
  });

  // 2. Customer Request Statement via Email
  app.post('/api/banking/statements/request-email', requireAuth, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserRecord;
      const { accountId, startDate, endDate, category, pdfDataUri } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both start date and end date must be provided.' });
      }

      if (startDate > endDate) {
        return res.status(400).json({ error: 'Start date cannot be after end date.' });
      }

      const account = user.accounts.find((a) => a.id === accountId) || user.accounts[0];
      if (!account) {
        return res.status(404).json({ error: 'Designated account not found.' });
      }

      const db = DatabaseManager.getDB();
      const allUserTxs = db.transactions
        .filter((t) => t.userId === user.id && t.accountId === account.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const periodTxs = allUserTxs.filter((t) => {
        const d = t.timestamp.slice(0, 10);
        return d >= startDate && d <= endDate;
      });

      const targetCategory = category || 'Entire Account Statement';
      const matchingTxs = filterTransactionsByCategory(periodTxs, targetCategory);

      const totalDebits = Number(
        matchingTxs
          .filter((t) => t.direction === 'debit')
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      );
      const totalCredits = Number(
        matchingTxs
          .filter((t) => t.direction === 'credit')
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      );

      const now = new Date();
      const serverTimestamp = now.toISOString();
      const serverTimezone = 'CDT (UTC-05:00)';

      const newRequest: StatementRequest = {
        id: generateId('stmt_req'),
        userId: user.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        accountIdentifier: account.accountNumber,
        accountType: account.name,
        startDate,
        endDate,
        category: targetCategory,
        deliveryMethod: 'email',
        status: 'Pending',
        createdAt: serverTimestamp,
        serverTimestamp,
        serverTimezone,
        pdfDataUri: pdfDataUri || undefined,
        statementSummary: {
          totalDebits,
          totalCredits,
          openingBalance: account.balance,
          closingBalance: account.balance,
          transactionCount: matchingTxs.length,
        },
      };

      DatabaseManager.addStatementRequest(newRequest);

      // Create notification for customer
      user.notifications.unshift({
        id: generateId('notif'),
        title: 'Statement Request Submitted',
        message: `Your request for a ${targetCategory} (${startDate} to ${endDate}) has been submitted to the administrative processing queue. Request ID: ${newRequest.id}.`,
        type: 'general',
        read: false,
        createdAt: serverTimestamp,
      });
      DatabaseManager.saveDB();

      return res.status(201).json({
        success: true,
        message:
          'Your statement request has been submitted successfully to the Aurelith Reserve Administrative Desk. Status: Pending.',
        request: newRequest,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit statement request.' });
    }
  });

  // 3. Customer: View Own Statement Requests
  app.get('/api/banking/statements/my-requests', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const requests = DatabaseManager.getStatementRequests(user.id);
    return res.json({ requests });
  });

  // 4. Admin Dashboard: View All Statement Requests (Restricted to Authorized Admins)
  app.get('/api/banking/statements/admin/requests', requireAuth, requireAdmin, (_req: Request, res: Response) => {
    const requests = DatabaseManager.getStatementRequests();
    return res.json({ requests });
  });

  // 5. Admin Dashboard: Update Statement Request Status
  app.patch(
    '/api/banking/statements/admin/requests/:id/status',
    requireAuth,
    requireAdmin,
    (req: Request, res: Response) => {
      const { status } = req.body;
      if (!['Pending', 'Processing', 'Completed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Pending, Processing, or Completed.' });
      }

      const updated = DatabaseManager.updateStatementRequestStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Statement request not found.' });
      }

      // Notify the customer of status change
      const targetUser = DatabaseManager.findUserById(updated.userId);
      if (targetUser) {
        targetUser.notifications.unshift({
          id: generateId('notif'),
          title: `Statement Request ${status}`,
          message: `Your statement request (${updated.category}, ${updated.startDate} to ${updated.endDate}) is now marked as ${status}.`,
          type: 'general',
          read: false,
          createdAt: new Date().toISOString(),
        });
        DatabaseManager.saveDB();
      }

      return res.json({
        message: `Statement request ${req.params.id} updated to ${status}.`,
        request: updated,
      });
    }
  );

  // 6. Secure Statement PDF Retrieval
  app.get('/api/banking/statements/:id/pdf', requireAuth, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const request = DatabaseManager.getStatementRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Statement document not found.' });
    }

    // Enforce authorization: Admin can access any statement; customers can ONLY access their own
    if (user.role !== 'admin' && request.userId !== user.id) {
      return res.status(403).json({ error: 'Access forbidden. You do not have permission to view this document.' });
    }

    return res.json({
      request,
      pdfDataUri: request.pdfDataUri || null,
    });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================

  // Serve static assets from public folder (favicons, manifests, static images)
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aurelith Reserve server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
