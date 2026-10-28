import { DatabaseManager } from './db.ts';

export interface BankInstitution {
  id: string;
  name: string;
  shortName: string;
  routingNumber: string;
  swiftCode: string;
  country: string;
  countryCode: string;
  currency: string;
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

export const SUPPORTED_BANKS: BankInstitution[] = [
  // United States Institutions
  {
    id: 'aurelith',
    name: 'Aurelith Reserve',
    shortName: 'Aurelith Reserve',
    routingNumber: '111301122',
    swiftCode: 'AURUS33D',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Internal Real-Time Book Transfer', 'Fedwire', 'FedACH'],
  },
  {
    id: 'chase',
    name: 'JPMorgan Chase Bank, N.A.',
    shortName: 'Chase Bank',
    routingNumber: '111000614',
    swiftCode: 'CHASUS33',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH', 'Real-Time Payments (RTP)'],
  },
  {
    id: 'bofa',
    name: 'Bank of America, N.A.',
    shortName: 'Bank of America',
    routingNumber: '111000025',
    swiftCode: 'BOFAUS3N',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH', 'Real-Time Payments (RTP)'],
  },
  {
    id: 'wells_fargo',
    name: 'Wells Fargo Bank, N.A.',
    shortName: 'Wells Fargo',
    routingNumber: '111900659',
    swiftCode: 'WFBIUS6S',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'citibank',
    name: 'Citibank, N.A.',
    shortName: 'Citibank',
    routingNumber: '021000089',
    swiftCode: 'CITIUS33',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH', 'SWIFT International'],
  },
  {
    id: 'pnc',
    name: 'PNC Bank, N.A.',
    shortName: 'PNC Bank',
    routingNumber: '043000096',
    swiftCode: 'PNCBUS33',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'capital_one',
    name: 'Capital One, N.A.',
    shortName: 'Capital One',
    routingNumber: '051405515',
    swiftCode: 'HIBKUS44',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'us_bank',
    name: 'U.S. Bank National Association',
    shortName: 'U.S. Bank',
    routingNumber: '091000022',
    swiftCode: 'USBKUS44',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'truist',
    name: 'Truist Bank',
    shortName: 'Truist',
    routingNumber: '061000104',
    swiftCode: 'SNTRUS3A',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'goldman_sachs',
    name: 'Goldman Sachs Bank USA',
    shortName: 'Goldman Sachs Bank',
    routingNumber: '121144994',
    swiftCode: 'GSNYUS33',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH', 'Private Client Clearing'],
  },
  {
    id: 'morgan_stanley',
    name: 'Morgan Stanley Private Bank, N.A.',
    shortName: 'Morgan Stanley Bank',
    routingNumber: '026013576',
    swiftCode: 'MSNYUS33',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH'],
  },
  {
    id: 'bny_mellon',
    name: 'The Bank of New York Mellon',
    shortName: 'BNY Mellon',
    routingNumber: '021000018',
    swiftCode: 'IRVTUS3N',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    supportedRails: ['Fedwire', 'FedACH', 'SWIFT Custody'],
  },

  // United Kingdom Institutions
  {
    id: 'barclays_uk',
    name: 'Barclays Bank UK PLC',
    shortName: 'Barclays Bank',
    routingNumber: '20-00-00',
    swiftCode: 'BARCGB22',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    supportedRails: ['CHAPS', 'Faster Payments', 'SWIFT International'],
  },
  {
    id: 'hsbc_uk',
    name: 'HSBC UK Bank plc',
    shortName: 'HSBC Bank',
    routingNumber: '40-05-15',
    swiftCode: 'HBUKGB41',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    supportedRails: ['CHAPS', 'Faster Payments', 'SWIFT International'],
  },
  {
    id: 'lloyds_uk',
    name: 'Lloyds Bank plc',
    shortName: 'Lloyds Bank',
    routingNumber: '30-90-89',
    swiftCode: 'LOYDGB2L',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    supportedRails: ['CHAPS', 'Faster Payments'],
  },

  // Canada Institutions
  {
    id: 'rbc_canada',
    name: 'Royal Bank of Canada',
    shortName: 'RBC Royal Bank',
    routingNumber: '00002-003',
    swiftCode: 'ROYCCAT2',
    country: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
    supportedRails: ['Lynx', 'ACSS', 'SWIFT International'],
  },
  {
    id: 'td_canada',
    name: 'Toronto-Dominion Bank',
    shortName: 'TD Canada Trust',
    routingNumber: '00004-004',
    swiftCode: 'TDOMCATT',
    country: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
    supportedRails: ['Lynx', 'ACSS', 'SWIFT International'],
  },

  // Switzerland & Europe Institutions
  {
    id: 'ubs_swiss',
    name: 'UBS Switzerland AG',
    shortName: 'UBS Bank',
    routingNumber: '00230',
    swiftCode: 'UBSWCHZH',
    country: 'Switzerland',
    countryCode: 'CH',
    currency: 'CHF',
    supportedRails: ['SIC', 'SEPA', 'SWIFT International'],
  },
  {
    id: 'deutsche_bank',
    name: 'Deutsche Bank AG',
    shortName: 'Deutsche Bank',
    routingNumber: '50070010',
    swiftCode: 'DEUTDEDD',
    country: 'Germany',
    countryCode: 'DE',
    currency: 'EUR',
    supportedRails: ['SEPA Instant', 'TARGET2', 'SWIFT International'],
  },
  {
    id: 'bnp_paribas',
    name: 'BNP Paribas S.A.',
    shortName: 'BNP Paribas',
    routingNumber: '30004',
    swiftCode: 'BNPAFRPP',
    country: 'France',
    countryCode: 'FR',
    currency: 'EUR',
    supportedRails: ['SEPA Instant', 'TARGET2', 'SWIFT International'],
  },

  // Asia-Pacific & Middle East
  {
    id: 'dbs_singapore',
    name: 'DBS Bank Ltd',
    shortName: 'DBS Bank',
    routingNumber: '7171-001',
    swiftCode: 'DBSSSGSG',
    country: 'Singapore',
    countryCode: 'SG',
    currency: 'SGD',
    supportedRails: ['FAST', 'MEPS+', 'SWIFT International'],
  },
  {
    id: 'emirates_nbd',
    name: 'Emirates NBD Bank PJSC',
    shortName: 'Emirates NBD',
    routingNumber: '026',
    swiftCode: 'EBILAEAD',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    currency: 'AED',
    supportedRails: ['UAEFTS', 'IPI', 'SWIFT International'],
  },
  {
    id: 'commbank_au',
    name: 'Commonwealth Bank of Australia',
    shortName: 'Commonwealth Bank',
    routingNumber: '062-000',
    swiftCode: 'CTBAAU2S',
    country: 'Australia',
    countryCode: 'AU',
    currency: 'AUD',
    supportedRails: ['NPP / Osko', 'BECS', 'SWIFT International'],
  },
];

// Authorized Directory of External Verified Recipient Accounts
const VERIFIED_INTERBANK_ACCOUNTS: VerifiedRecipientAccount[] = [
  // JPMorgan Chase Bank
  {
    accountNumber: '9843210091',
    recipientName: 'Lone Star Energy & Utilities LLC',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routingNumber: '111000614',
    swiftCode: 'CHASUS33',
    accountType: 'Corporate Commercial Checking',
    status: 'eligible',
  },
  {
    accountNumber: '4829104820',
    recipientName: 'Marcus Vance',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routingNumber: '111000614',
    swiftCode: 'CHASUS33',
    accountType: 'Personal Premier Checking',
    status: 'eligible',
  },
  {
    accountNumber: '2048192048',
    recipientName: 'Highland Park Holdings Ltd',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routingNumber: '111000614',
    swiftCode: 'CHASUS33',
    accountType: 'Private Wealth Management Account',
    status: 'eligible',
  },

  // Bank of America
  {
    accountNumber: '3820194021',
    recipientName: 'Sarah Jenkins',
    bankName: 'Bank of America, N.A.',
    routingNumber: '111000025',
    swiftCode: 'BOFAUS3N',
    accountType: 'Advantage Banking Checking',
    status: 'eligible',
  },
  {
    accountNumber: '5920194820',
    recipientName: 'Dallas Metro Logistics Inc',
    bankName: 'Bank of America, N.A.',
    routingNumber: '111000025',
    swiftCode: 'BOFAUS3N',
    accountType: 'Commercial Treasury Operating Account',
    status: 'eligible',
  },
  {
    accountNumber: '1928401928',
    recipientName: 'Robert E. Montgomery',
    bankName: 'Bank of America, N.A.',
    routingNumber: '111000025',
    swiftCode: 'BOFAUS3N',
    accountType: 'Private Client Account',
    status: 'eligible',
  },

  // Wells Fargo
  {
    accountNumber: '6019284019',
    recipientName: 'Elena Rostova',
    bankName: 'Wells Fargo Bank, N.A.',
    routingNumber: '111900659',
    swiftCode: 'WFBIUS6S',
    accountType: 'Prime Checking Account',
    status: 'eligible',
  },
  {
    accountNumber: '7829104928',
    recipientName: 'Preston Hollow Family Trust',
    bankName: 'Wells Fargo Bank, N.A.',
    routingNumber: '111900659',
    swiftCode: 'WFBIUS6S',
    accountType: 'Fiduciary & Estate Account',
    status: 'eligible',
  },
  {
    accountNumber: '3910294819',
    recipientName: 'Summit Ridge Properties LLC',
    bankName: 'Wells Fargo Bank, N.A.',
    routingNumber: '111900659',
    swiftCode: 'WFBIUS6S',
    accountType: 'Commercial Real Estate Escrow',
    status: 'eligible',
  },

  // Citibank
  {
    accountNumber: '8492019482',
    recipientName: 'David K. Sterling',
    bankName: 'Citibank, N.A.',
    routingNumber: '021000089',
    swiftCode: 'CITIUS33',
    accountType: 'Citi Priority Checking',
    status: 'eligible',
  },
  {
    accountNumber: '1948201948',
    recipientName: 'Continental Export Corp',
    bankName: 'Citibank, N.A.',
    routingNumber: '021000089',
    swiftCode: 'CITIUS33',
    accountType: 'International Trade Operating Account',
    status: 'eligible',
  },

  // PNC Bank
  {
    accountNumber: '5520194821',
    recipientName: 'Apex Real Estate Acquisitions',
    bankName: 'PNC Bank, N.A.',
    routingNumber: '043000096',
    swiftCode: 'PNCBUS33',
    accountType: 'Commercial Operating Account',
    status: 'eligible',
  },

  // Capital One
  {
    accountNumber: '7192048192',
    recipientName: 'Chloe Bennett',
    bankName: 'Capital One, N.A.',
    routingNumber: '051405515',
    swiftCode: 'HIBKUS44',
    accountType: '360 Checking Account',
    status: 'eligible',
  },

  // U.S. Bank
  {
    accountNumber: '8819204819',
    recipientName: 'Jordan Taylor',
    bankName: 'U.S. Bank National Association',
    routingNumber: '091000022',
    swiftCode: 'USBKUS44',
    accountType: 'Bank Smartly Checking',
    status: 'eligible',
  },

  // Truist
  {
    accountNumber: '4910294810',
    recipientName: 'Austin Tech Ventures LLC',
    bankName: 'Truist Bank',
    routingNumber: '061000104',
    swiftCode: 'SNTRUS3A',
    accountType: 'Commercial Checking',
    status: 'eligible',
  },

  // Goldman Sachs Bank
  {
    accountNumber: '9281049281',
    recipientName: 'Horizon Global Capital Partners',
    bankName: 'Goldman Sachs Bank USA',
    routingNumber: '121144994',
    swiftCode: 'GSNYUS33',
    accountType: 'Private Wealth Prime Custody',
    status: 'eligible',
  },

  // Morgan Stanley
  {
    accountNumber: '3049182049',
    recipientName: 'Victoria Hamilton-Cross',
    bankName: 'Morgan Stanley Private Bank, N.A.',
    routingNumber: '026013576',
    swiftCode: 'MSNYUS33',
    accountType: 'Private Client Reserve',
    status: 'eligible',
  },

  // Barclays Bank UK
  {
    accountNumber: '40192841',
    recipientName: 'Alistair Sterling',
    bankName: 'Barclays Bank UK PLC',
    routingNumber: '20-00-00',
    swiftCode: 'BARCGB22',
    accountType: 'Barclays Premier Current Account',
    status: 'eligible',
  },

  // HSBC UK
  {
    accountNumber: '81920482',
    recipientName: 'Evelyn St. Claire',
    bankName: 'HSBC UK Bank plc',
    routingNumber: '40-05-15',
    swiftCode: 'HBUKGB41',
    accountType: 'HSBC Premier Account',
    status: 'eligible',
  },

  // Royal Bank of Canada
  {
    accountNumber: '102948102',
    recipientName: 'Kensington Northern Advisory Corp',
    bankName: 'Royal Bank of Canada',
    routingNumber: '00002-003',
    swiftCode: 'ROYCCAT2',
    accountType: 'RBC Commercial Operating Account',
    status: 'eligible',
  },

  // UBS Switzerland
  {
    accountNumber: '9204810293',
    recipientName: 'Geneva Asset Management SA',
    bankName: 'UBS Switzerland AG',
    routingNumber: '00230',
    swiftCode: 'UBSWCHZH',
    accountType: 'International Wealth Reserve',
    status: 'eligible',
  },

  // Deutsche Bank
  {
    accountNumber: '5029104920',
    recipientName: 'Klaus Lindemann',
    bankName: 'Deutsche Bank AG',
    routingNumber: '50070010',
    swiftCode: 'DEUTDEDD',
    accountType: 'Private Banking Girokonto',
    status: 'eligible',
  },

  // DBS Bank Singapore
  {
    accountNumber: '0039102948',
    recipientName: 'Pacific Maritime Logistics Pte Ltd',
    bankName: 'DBS Bank Ltd',
    routingNumber: '7171-001',
    swiftCode: 'DBSSSGSG',
    accountType: 'Corporate Treasury Account',
    status: 'eligible',
  },

  // Emirates NBD
  {
    accountNumber: '1019284019',
    recipientName: 'Sheikh Tariq Al-Mansoor',
    bankName: 'Emirates NBD Bank PJSC',
    routingNumber: '026',
    swiftCode: 'EBILAEAD',
    accountType: 'Priority Banking Wealth Account',
    status: 'eligible',
  },
];

export class InterbankVerificationService {
  /**
   * Find institution by exact name, short name, or ID
   */
  public static findBank(identifier: string): BankInstitution | null {
    const clean = identifier.trim().toLowerCase();
    return (
      SUPPORTED_BANKS.find(
        (b) =>
          b.name.toLowerCase() === clean ||
          b.shortName.toLowerCase() === clean ||
          b.id.toLowerCase() === clean ||
          b.name.toLowerCase().includes(clean) ||
          clean.includes(b.shortName.toLowerCase())
      ) || null
    );
  }

  /**
   * Verify an account number against a specific bank (or resolve automatically if bankIdentifier is omitted)
   */
  public static verifyRecipient(
    bankIdentifier: string | undefined,
    accountNumber: string,
    senderUserId?: string
  ): {
    verified: boolean;
    error?: string;
    recipient?: VerifiedRecipientAccount;
    requiresBankSelection?: boolean;
    ambiguousBanks?: string[];
    source?: string;
  } {
    const cleanAccount = accountNumber.trim().replace(/\s+/g, '');
    if (!cleanAccount || cleanAccount.length < 6) {
      return {
        verified: false,
        error: 'Please enter a valid account number (minimum 6 digits).',
      };
    }

    if (!bankIdentifier || !bankIdentifier.trim()) {
      return this.resolveRecipient(cleanAccount, senderUserId);
    }

    const bank = this.findBank(bankIdentifier);
    if (!bank) {
      return {
        verified: false,
        error: `Financial institution "${bankIdentifier}" could not be recognized in the clearing directory.`,
      };
    }

    // 1. Check if recipient is at Aurelith Reserve (internal account discovery)
    if (bank.id === 'aurelith' || bank.name.includes('Aurelith')) {
      let internalMatch = DatabaseManager.findUserByAccountNumber(cleanAccount);
      if (!internalMatch) {
        internalMatch = DatabaseManager.findUserByClientId(cleanAccount);
      }

      if (internalMatch) {
        if (senderUserId && internalMatch.user.id === senderUserId) {
          return {
            verified: false,
            error:
              'The recipient account belongs to yourself. Use "Between My Accounts" for internal account transfers.',
          };
        }

        if (internalMatch.account.status !== 'active') {
          return {
            verified: false,
            error: 'The designated Aurelith Reserve recipient account is currently inactive.',
          };
        }

        return {
          verified: true,
          source: 'Aurelith Reserve Authorized Internal Ledger Directory',
          recipient: {
            accountNumber: internalMatch.account.accountNumber,
            recipientName: `${internalMatch.user.firstName} ${internalMatch.user.lastName}`,
            bankName: 'Aurelith Reserve',
            routingNumber: internalMatch.account.routingNumber || bank.routingNumber,
            swiftCode: internalMatch.account.swiftCode || bank.swiftCode,
            accountType: internalMatch.account.nickname || internalMatch.account.name,
            status: 'eligible',
          },
        };
      }

      // Check external/test table in case of mock Aurelith recipient
      const extMatch = VERIFIED_INTERBANK_ACCOUNTS.find(
        (a) =>
          a.accountNumber === cleanAccount &&
          (a.bankName.includes('Aurelith') || bank.id === 'aurelith')
      );
      if (extMatch) {
        return {
          verified: true,
          source: 'Aurelith Reserve Verified Account Directory',
          recipient: extMatch,
        };
      }

      return {
        verified: false,
        error: `No active Aurelith Reserve account found matching number "${cleanAccount}".`,
      };
    }

    // 2. Check Authorized Interbank Clearing Directory for external institutions
    const match = VERIFIED_INTERBANK_ACCOUNTS.find(
      (a) =>
        a.accountNumber === cleanAccount &&
        (a.bankName.toLowerCase() === bank.name.toLowerCase() ||
          a.bankName.toLowerCase().includes(bank.shortName.toLowerCase()) ||
          bank.name.toLowerCase().includes(a.bankName.toLowerCase()))
    );

    if (match) {
      if (match.status !== 'eligible') {
        return {
          verified: false,
          error: `Account ${cleanAccount} at ${bank.name} is not eligible to receive electronic wire or ACH transfers.`,
        };
      }

      return {
        verified: true,
        source: 'Authorized Interbank Clearing Directory (FedACH / Fedwire Verified)',
        recipient: {
          ...match,
          bankName: bank.name,
          routingNumber: bank.routingNumber,
          swiftCode: bank.swiftCode,
        },
      };
    }

    // Account not found in verified registry
    return {
      verified: false,
      error: `No verified account found matching "${cleanAccount}" at ${bank.name}. Please check the account number with the recipient.`,
    };
  }

  /**
   * Automatically resolve recipient details and receiving financial institution
   * purely from the account number against authoritative internal and interbank directories.
   */
  public static resolveRecipient(
    accountNumber: string,
    senderUserId?: string,
    preferredBankIdentifier?: string
  ): {
    verified: boolean;
    error?: string;
    recipient?: VerifiedRecipientAccount;
    requiresBankSelection?: boolean;
    ambiguousBanks?: string[];
    source?: string;
  } {
    const cleanAccount = accountNumber.trim().replace(/\s+/g, '');
    if (!cleanAccount || cleanAccount.length < 6) {
      return {
        verified: false,
        error: 'Please enter a valid recipient account number (minimum 6 digits).',
      };
    }

    if (preferredBankIdentifier) {
      return this.verifyRecipient(preferredBankIdentifier, cleanAccount, senderUserId);
    }

    // 1. Search Aurelith Reserve internal ledger
    let internalMatch = DatabaseManager.findUserByAccountNumber(cleanAccount);
    if (!internalMatch) {
      internalMatch = DatabaseManager.findUserByClientId(cleanAccount);
    }
    if (internalMatch) {
      if (senderUserId && internalMatch.user.id === senderUserId) {
        return {
          verified: false,
          error:
            'The recipient account belongs to yourself. Use "Between My Accounts" for internal account transfers.',
        };
      }

      if (internalMatch.account.status !== 'active') {
        return {
          verified: false,
          error: 'The designated Aurelith Reserve recipient account is currently inactive.',
        };
      }

      const aurelithBank = this.findBank('aurelith') || {
        name: 'Aurelith Reserve',
        routingNumber: '111301122',
        swiftCode: 'AURUS33D',
      };

      return {
        verified: true,
        source: 'Aurelith Reserve Authorized Internal Ledger Directory',
        recipient: {
          accountNumber: internalMatch.account.accountNumber,
          recipientName: `${internalMatch.user.firstName} ${internalMatch.user.lastName}`,
          bankName: 'Aurelith Reserve',
          routingNumber: internalMatch.account.routingNumber || aurelithBank.routingNumber,
          swiftCode: internalMatch.account.swiftCode || aurelithBank.swiftCode,
          accountType: internalMatch.account.nickname || internalMatch.account.name,
          status: 'eligible',
        },
      };
    }

    // 2. Search Authorized Interbank Clearing Directory
    const matches = VERIFIED_INTERBANK_ACCOUNTS.filter(
      (a) => a.accountNumber === cleanAccount
    );

    if (matches.length === 1) {
      const match = matches[0];
      const bank = this.findBank(match.bankName);

      if (match.status !== 'eligible') {
        return {
          verified: false,
          error: `Account ${cleanAccount} at ${match.bankName} is not eligible to receive electronic wire or ACH transfers.`,
        };
      }

      return {
        verified: true,
        source: 'Authorized Interbank Clearing Directory (FedACH / Fedwire Verified)',
        recipient: {
          ...match,
          bankName: bank ? bank.name : match.bankName,
          routingNumber: bank ? bank.routingNumber : match.routingNumber,
          swiftCode: bank ? bank.swiftCode : match.swiftCode,
        },
      };
    }

    if (matches.length > 1) {
      const bankNames = Array.from(new Set(matches.map((m) => m.bankName)));
      return {
        verified: false,
        requiresBankSelection: true,
        ambiguousBanks: bankNames,
        error: 'Multiple financial institutions share this account number format. Please select the receiving institution to confirm.',
      };
    }

    return {
      verified: false,
      error: `No verified account found matching "${cleanAccount}" in the authorized interbank clearing directory. Please verify the account number with the recipient.`,
    };
  }

  /**
   * Validate that all banking identifiers for a proposed transfer strictly match authoritative institution records
   */
  public static validateTransferIdentifiers(params: {
    bankName?: string;
    accountNumber: string;
    recipientName: string;
    routingNumber?: string;
    swiftCode?: string;
  }): { valid: boolean; error?: string; validatedRecipient?: VerifiedRecipientAccount } {
    const { bankName, accountNumber, recipientName, routingNumber, swiftCode } = params;

    const verification = bankName
      ? this.verifyRecipient(bankName, accountNumber)
      : this.resolveRecipient(accountNumber);

    if (!verification.verified || !verification.recipient) {
      return {
        valid: false,
        error:
          verification.error ||
          'Recipient account could not be verified with the selected financial institution.',
      };
    }

    const rec = verification.recipient;

    // Validate bank if supplied
    if (bankName) {
      const b1 = this.findBank(bankName);
      const b2 = this.findBank(rec.bankName);
      if (b1 && b2 && b1.id !== b2.id) {
        return {
          valid: false,
          error: `Institution mismatch: verified account belongs to "${rec.bankName}", but client specified "${bankName}".`,
        };
      }
    }

    // Validate recipient name matches verified record (case-insensitive substring/match)
    const normalizedExpected = rec.recipientName.trim().toLowerCase();
    const normalizedInput = recipientName.trim().toLowerCase();
    if (normalizedExpected !== normalizedInput) {
      return {
        valid: false,
        error: `Recipient name mismatch. Server verified name is "${rec.recipientName}". Client-provided name "${recipientName}" does not match.`,
      };
    }

    // Validate routing number if provided
    if (routingNumber) {
      const cleanRouting = routingNumber.trim();
      if (cleanRouting !== rec.routingNumber) {
        return {
          valid: false,
          error: `Routing number "${cleanRouting}" does not match authoritative routing number "${rec.routingNumber}" for ${rec.bankName}.`,
        };
      }
    }

    // Validate SWIFT/BIC code if provided
    if (swiftCode) {
      const cleanSwift = swiftCode.trim().toUpperCase();
      if (cleanSwift !== rec.swiftCode.toUpperCase()) {
        return {
          valid: false,
          error: `SWIFT/BIC code "${cleanSwift}" does not match official institution SWIFT identifier "${rec.swiftCode}" for ${rec.bankName}.`,
        };
      }
    }

    return {
      valid: true,
      validatedRecipient: rec,
    };
  }
}
