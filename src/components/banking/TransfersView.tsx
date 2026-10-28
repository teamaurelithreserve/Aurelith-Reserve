import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Search,
  Loader2,
  Users,
  Wallet,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import {
  TransferReceipt,
  BankBeneficiary,
  BankInstitution,
  VerifiedRecipientAccount,
} from '../../types/banking';
import { bankingApi } from '../../services/bankingApi';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';
import confetti from 'canvas-confetti';

interface TransfersViewProps {
  onSuccessReturn?: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onSuccessReturn }) => {
  const { user, refreshUser, reloadTransactions } = useBankingAuth();

  const [transferType, setTransferType] = useState<'internal' | 'other_aurelith' | 'external'>('external');
  const [sourceAccountId, setSourceAccountId] = useState(user?.accounts[0]?.id || '');

  // Supported Institutions
  const [supportedBanks, setSupportedBanks] = useState<BankInstitution[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  // Recipient Account & Automatic Verification State
  const [accountNumber, setAccountNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Discovered Recipient (found by verification service, awaiting sender selection)
  const [discoveredRecipient, setDiscoveredRecipient] = useState<VerifiedRecipientAccount | null>(null);

  // Confirmed Recipient Details (after sender confirms / selects)
  const [verifiedRecipient, setVerifiedRecipient] = useState<VerifiedRecipientAccount | null>(null);
  const [isRecipientConfirmed, setIsRecipientConfirmed] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [wasBankAutoSelected, setWasBankAutoSelected] = useState(false);

  // Field 3: Bank Name
  const [selectedBank, setSelectedBank] = useState<BankInstitution | null>(null);
  const [verificationSource, setVerificationSource] = useState('');
  const [requiresBankSelection, setRequiresBankSelection] = useState(false);
  const [ambiguousBanks, setAmbiguousBanks] = useState<string[]>([]);

  // Field 4: Routing Number
  const [routingNumber, setRoutingNumber] = useState('');

  // Field 5: SWIFT/BIC Code
  const [swiftCode, setSwiftCode] = useState('');

  // Field 6: Transfer Amount
  const [amount, setAmount] = useState('');

  // Field 7: Payment Reference
  const [paymentReference, setPaymentReference] = useState('');

  // Additional options
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [beneficiaryNickname, setBeneficiaryNickname] = useState('');

  // Internal & P2P simple transfer state
  const [internalTargetAccount, setInternalTargetAccount] = useState('');
  const [p2pAccountNumber, setP2pAccountNumber] = useState('');
  const [p2pRecipientName, setP2pRecipientName] = useState('');
  const [p2pVerified, setP2pVerified] = useState(false);

  // Flow states
  const [isReviewing, setIsReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [transferPaymentPin, setTransferPaymentPin] = useState('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bankDropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch supported banks on mount
  useEffect(() => {
    let isMounted = true;
    bankingApi
      .getSupportedBanks()
      .then((res) => {
        if (isMounted && res.banks) {
          setSupportedBanks(res.banks);
        }
      })
      .catch((err) => {
        console.error('Failed to load banks directory:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click to close bank dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const sourceAccount = user.accounts.find((a) => a.id === sourceAccountId) || user.accounts[0];

  // Automatic Recipient Verification with debounce
  // Resolves recipient from account number and optional bank identifier
  const triggerRecipientVerification = async (accToVerify: string, bankNameToVerify?: string) => {
    const cleanAcc = accToVerify.trim().replace(/\s+/g, '');
    if (!cleanAcc || cleanAcc.length < 6) {
      setDiscoveredRecipient(null);
      setVerifiedRecipient(null);
      setIsRecipientConfirmed(false);
      setRecipientName('');
      if (wasBankAutoSelected) {
        setSelectedBank(null);
        setRoutingNumber('');
        setSwiftCode('');
        setWasBankAutoSelected(false);
      }
      setRequiresBankSelection(false);
      setVerificationError('');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setRequiresBankSelection(false);
    setAmbiguousBanks([]);

    try {
      const res = await bankingApi.verifyRecipient({
        bankName: bankNameToVerify || selectedBank?.name,
        accountNumber: cleanAcc,
      });

      if (res.verified && res.recipient) {
        setDiscoveredRecipient(res.recipient);
        setVerificationSource(res.source || 'Authorized Interbank Clearing Directory (FedACH / Fedwire Verified)');
        setVerificationError('');
        setRequiresBankSelection(false);
      } else if (res.requiresBankSelection) {
        setDiscoveredRecipient(null);
        setVerifiedRecipient(null);
        setIsRecipientConfirmed(false);
        setRecipientName('');
        setRequiresBankSelection(true);
        setAmbiguousBanks(res.ambiguousBanks || []);
        setVerificationError(
          res.error ||
            'Multiple institutions match this account format. Please choose the receiving bank from the Bank Name dropdown below.'
        );
      } else {
        setDiscoveredRecipient(null);
        setVerifiedRecipient(null);
        setIsRecipientConfirmed(false);
        setRecipientName('');
        setRequiresBankSelection(false);
        setVerificationError(
          res.error ||
            `No verified recipient account found matching "${cleanAcc}" in the authorized interbank directory. Please verify the account number.`
        );
      }
    } catch (err: any) {
      setDiscoveredRecipient(null);
      setVerifiedRecipient(null);
      setIsRecipientConfirmed(false);
      setRecipientName('');
      setRequiresBankSelection(false);
      setVerificationError(err.message || 'Interbank verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Account Number change with debounce (automatically triggers verification)
  const handleAccountNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setAccountNumber(clean);
    setDiscoveredRecipient(null);
    setVerifiedRecipient(null);
    setIsRecipientConfirmed(false);
    setRecipientName('');
    if (wasBankAutoSelected) {
      setSelectedBank(null);
      setRoutingNumber('');
      setSwiftCode('');
      setWasBankAutoSelected(false);
    }
    setRequiresBankSelection(false);
    setVerificationError('');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (clean.length >= 6) {
      debounceTimerRef.current = setTimeout(() => {
        triggerRecipientVerification(clean, selectedBank?.name);
      }, 400);
    }
  };

  // Sender clicks or selects the verified recipient to confirm intended destination
  const handleSelectDiscoveredRecipient = (recipient: VerifiedRecipientAccount) => {
    setVerifiedRecipient(recipient);
    setIsRecipientConfirmed(true);
    setRecipientName(recipient.recipientName);
    setVerificationError('');

    // Automatically find and select the bank in supportedBanks:
    const matched = supportedBanks.find(
      (b) =>
        b.name.toLowerCase() === recipient.bankName.toLowerCase() ||
        b.shortName.toLowerCase() === recipient.bankName.toLowerCase() ||
        recipient.bankName.toLowerCase().includes(b.shortName.toLowerCase()) ||
        b.name.toLowerCase().includes(recipient.bankName.toLowerCase())
    );

    if (matched) {
      setSelectedBank(matched);
      setRoutingNumber(recipient.routingNumber || matched.routingNumber);
      setSwiftCode(recipient.swiftCode || matched.swiftCode);
    } else {
      const autoInst: BankInstitution = {
        id: 'inst_' + recipient.accountNumber,
        name: recipient.bankName,
        shortName: recipient.bankName,
        routingNumber: recipient.routingNumber,
        swiftCode: recipient.swiftCode,
        country: 'United States',
        countryCode: 'US',
        currency: 'USD',
        supportedRails: ['Fedwire', 'FedACH'],
      };
      setSelectedBank(autoInst);
      setRoutingNumber(recipient.routingNumber);
      setSwiftCode(recipient.swiftCode);
    }
    setWasBankAutoSelected(true);
  };

  const handleClearRecipient = () => {
    setDiscoveredRecipient(null);
    setVerifiedRecipient(null);
    setIsRecipientConfirmed(false);
    setRecipientName('');
    if (wasBankAutoSelected) {
      setSelectedBank(null);
      setRoutingNumber('');
      setSwiftCode('');
      setWasBankAutoSelected(false);
    }
    setVerificationError('');
  };

  // Handle Bank Selection (always available manually from the dropdown)
  const handleSelectBank = (bank: BankInstitution) => {
    setSelectedBank(bank);
    setRoutingNumber(bank.routingNumber);
    setSwiftCode(bank.swiftCode);
    setIsBankDropdownOpen(false);
    setBankSearch('');
    setRequiresBankSelection(false);
    setWasBankAutoSelected(false);
    setVerificationError('');

    // If an account number has already been entered, re-verify with this chosen bank
    if (accountNumber.length >= 6) {
      triggerRecipientVerification(accountNumber, bank.name);
    }
  };

  const handleSelectBeneficiary = (b: BankBeneficiary) => {
    setTransferType('external');
    setAccountNumber(b.accountNumber);
    setRoutingNumber(b.routingNumber || '');
    setVerificationError('');
    setIsVerifying(true);
    triggerRecipientVerification(b.accountNumber, b.bankName);
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a transfer amount greater than $0.00.');
      return;
    }

    if (numAmount > 25000) {
      setErrorMessage('Transfer amount exceeds maximum daily limit of $25,000.00.');
      return;
    }

    if (numAmount > sourceAccount.availableBalance) {
      setErrorMessage(
        `Insufficient available funds. Current balance in ${sourceAccount.name} is $${sourceAccount.availableBalance.toFixed(2)}.`
      );
      return;
    }

    // Balance Range Constraint Validations
    const sourceTier = getAccountTier(sourceAccount.name);
    if (sourceTier?.minBalance !== undefined && (sourceAccount.balance - numAmount) < sourceTier.minBalance) {
      setErrorMessage(
        `Transfer rejected. This transaction would leave ${sourceAccount.name} below its required Minimum balance of ${formatCurrency(sourceTier.minBalance)}.`
      );
      return;
    }

    if (transferType === 'internal') {
      const targetAcc = user.accounts.find((a) => a.accountNumber === internalTargetAccount);
      if (targetAcc) {
        const targetTier = getAccountTier(targetAcc.name);
        if (targetTier?.maxBalance !== undefined && (targetAcc.balance + numAmount) > targetTier.maxBalance) {
          setErrorMessage(
            `Transfer rejected. This transaction would cause ${targetAcc.name} to exceed its Maximum balance limit of ${formatCurrency(targetTier.maxBalance)}.`
          );
          return;
        }
      }
    }

    if (transferType === 'external') {
      if (!accountNumber || accountNumber.length < 6) {
        setErrorMessage('Please enter a valid recipient account number.');
        return;
      }
      if (!verifiedRecipient) {
        setErrorMessage('Recipient account has not been verified. Please enter a valid account number from the authorized directory.');
        return;
      }
      if (!selectedBank) {
        setErrorMessage('Recipient financial institution could not be determined.');
        return;
      }
      if (!routingNumber.trim()) {
        setErrorMessage('Routing number is required for interbank wire settlement.');
        return;
      }
      if (!swiftCode.trim()) {
        setErrorMessage('SWIFT/BIC code is required for bank transfer verification.');
        return;
      }
    } else if (transferType === 'internal') {
      if (!internalTargetAccount) {
        setErrorMessage('Please select a destination account.');
        return;
      }
    } else if (transferType === 'other_aurelith') {
      if (!p2pAccountNumber.trim()) {
        setErrorMessage('Please provide the recipient Aurelith Reserve account number.');
        return;
      }
    }

    setIsReviewing(true);
  };

  const handleExecuteTransfer = async () => {
    setErrorMessage('');

    if (user?.hasPaymentPin && !transferPaymentPin.trim()) {
      setErrorMessage('Please enter your 4-6 digit Payment Authorization PIN to authorize this transfer.');
      return;
    }

    setLoading(true);

    try {
      let targetAccountNum = accountNumber;
      let targetRouting = routingNumber;
      let targetSwift = swiftCode;
      let targetRecipientName = verifiedRecipient?.recipientName || '';
      let targetBankName = selectedBank?.name || 'External Bank';

      if (transferType === 'internal') {
        targetAccountNum = internalTargetAccount;
        targetRouting = '111301122';
        targetSwift = 'AURUS33D';
        targetRecipientName = `${user.firstName} ${user.lastName}`;
        targetBankName = 'Aurelith Reserve';
      } else if (transferType === 'other_aurelith') {
        targetAccountNum = p2pAccountNumber;
        targetRouting = '111301122';
        targetSwift = 'AURUS33D';
        targetRecipientName = p2pRecipientName || 'Aurelith Client';
        targetBankName = 'Aurelith Reserve';
      }

      const res = await bankingApi.transferMoney({
        sourceAccountId: sourceAccount.id,
        destinationType: transferType,
        destinationAccountNumber: targetAccountNum.trim(),
        destinationRoutingNumber: targetRouting.trim(),
        swiftCode: targetSwift.trim(),
        recipientName: targetRecipientName.trim(),
        bankName: targetBankName,
        amount: parseFloat(amount),
        note: paymentReference.trim(),
        paymentReference: paymentReference.trim(),
        saveBeneficiary: transferType === 'external' ? saveBeneficiary : false,
        nickname: beneficiaryNickname.trim() || undefined,
        paymentPin: user?.hasPaymentPin ? transferPaymentPin.trim() : undefined,
      });

      setReceipt(res.receipt);
      setIsReviewing(false);
      await refreshUser();
      await reloadTransactions();

      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReceipt(null);
    setIsReviewing(false);
    setAmount('');
    setPaymentReference('');
    setAccountNumber('');
    setSelectedBank(null);
    setRoutingNumber('');
    setSwiftCode('');
    setVerifiedRecipient(null);
    setRequiresBankSelection(false);
    setAmbiguousBanks([]);
    setVerificationError('');
    setSaveBeneficiary(false);
    setBeneficiaryNickname('');
    setTransferPaymentPin('');
  };

  const copyRefToClipboard = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Mask account helper
  const maskAccount = (acc: string) => {
    if (!acc) return '';
    if (acc.length <= 4) return `•••• ${acc}`;
    return `•••• •••• ${acc.slice(-4)}`;
  };

  // Filter banks for searchable selector
  const filteredBanks = supportedBanks.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
      (b.country && b.country.toLowerCase().includes(bankSearch.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Secure Bank Transfer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Transfer funds with automated interbank recipient verification, instant book transfers, or domestic Fedwire/FedACH rails.
        </p>
      </div>

      {receipt ? (
        /* SUCCESS RECEIPT VIEW */
        <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
              Transfer Settled &amp; Completed
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1C2B4C] dark:text-white font-mono my-2">
              ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Funds debited from {receipt.sourceAccountName} and disbursed via authoritative banking clearing channels.
            </p>
          </div>

          {/* Receipt Breakdown Table */}
          <div className="bg-slate-50 dark:bg-[#10192A] rounded-2xl p-4 text-xs space-y-2.5 text-left border border-slate-200/70 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Reference Number:</span>
              <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                <span>{receipt.reference}</span>
                <button
                  onClick={() => copyRefToClipboard(receipt.reference)}
                  className="p-1 hover:text-[#C8102E] dark:hover:text-red-400 cursor-pointer"
                  title="Copy reference"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Funding Account:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {receipt.sourceAccountName} (•••• {receipt.sourceAccountNumber.slice(-4)})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient Bank:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.recipientBank || 'Aurelith Reserve'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Verified Recipient:</span>
              <span className="font-bold text-[#1C2B4C] dark:text-white">{receipt.recipientName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient Account:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {maskAccount(receipt.recipientAccountNumber)}
              </span>
            </div>

            {receipt.routingNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Routing Number:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{receipt.routingNumber}</span>
              </div>
            )}

            {receipt.swiftCode && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">SWIFT / BIC Code:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{receipt.swiftCode}</span>
              </div>
            )}

            {receipt.paymentReference && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payment Reference:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 italic">{receipt.paymentReference}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transfer Fee:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Free ($0.00)</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Settlement Time:</span>
              <span className="text-slate-700 dark:text-slate-300">{new Date(receipt.timestamp).toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300 font-bold">New Available Balance:</span>
              <span className="font-mono font-bold text-[#1C2B4C] dark:text-white">
                ${receipt.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 py-3 px-5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#C8102E] dark:hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-md transition-colors cursor-pointer"
            >
              Make Another Transfer
            </button>
            {onSuccessReturn && (
              <button
                onClick={onSuccessReturn}
                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-full transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : isReviewing ? (
        /* TRANSFER REVIEW & CONFIRMATION STEP */
        <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md max-w-xl mx-auto space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">Review Transfer Authorization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please verify recipient credentials and debit parameters before final transmission.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#10192A] rounded-2xl space-y-3 text-xs border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transfer Type:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {transferType === 'internal'
                  ? 'Between My Aurelith Accounts'
                  : transferType === 'other_aurelith'
                  ? 'Aurelith Reserve Client (P2P)'
                  : 'Interbank Other Bank (Wire / FedACH)'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">From Funding Account:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {sourceAccount.name} (•••• {sourceAccount.accountNumber.slice(-4)})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient Bank:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {transferType === 'external' ? selectedBank?.name : 'Aurelith Reserve'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Verified Recipient Name:</span>
              <span className="font-bold text-[#1C2B4C] dark:text-white flex items-center space-x-1">
                <span>{verifiedRecipient?.recipientName || (transferType === 'internal' ? `${user.firstName} ${user.lastName}` : p2pRecipientName || 'Aurelith Client')}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient Account Number:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {maskAccount(
                  transferType === 'external'
                    ? accountNumber
                    : transferType === 'internal'
                    ? internalTargetAccount
                    : p2pAccountNumber
                )}
              </span>
            </div>

            {transferType === 'external' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Verified Routing Number:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{routingNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">SWIFT / BIC Identifier:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{swiftCode}</span>
                </div>
              </>
            )}

            {paymentReference && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payment Reference:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 italic">"{paymentReference}"</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Transfer Amount:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Wire / Transfer Fee:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">$0.00 (Waived)</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
              <span className="font-bold text-[#1C2B4C] dark:text-white">Total Debit Amount:</span>
              <span className="font-extrabold text-[#C8102E] dark:text-red-400 font-mono">
                ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {user?.hasPaymentPin && (
            <div className="p-4 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-[#1C2B4C] dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>Payment Authorization PIN <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Security Protected</span>
              </label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Enter 4-6 digit PIN"
                value={transferPaymentPin}
                onChange={(e) => {
                  setTransferPaymentPin(e.target.value.replace(/[^0-9]/g, ''));
                  setErrorMessage('');
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#152033] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                Enter your configured PIN to electronically authorize and sign this transfer.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              Modify Details
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleExecuteTransfer}
              className="flex-1 py-3 px-4 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs rounded-full shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span>Authorizing Wire...</span>
                </>
              ) : (
                <span>Confirm &amp; Execute Transfer</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* MAIN TRANSFER FORM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Transfer Type Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-[#10192A] rounded-2xl mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTransferType('external');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                  transferType === 'external'
                    ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Other Bank</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferType('internal');
                  setErrorMessage('');
                  const target = user.accounts.find((a) => a.id !== sourceAccountId);
                  if (target) {
                    setInternalTargetAccount(target.accountNumber);
                  }
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                  transferType === 'internal'
                    ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Between Accounts</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferType('other_aurelith');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                  transferType === 'other_aurelith'
                    ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Aurelith Client</span>
              </button>
            </div>

            {/* Source Account Selector */}
            <div className="mb-6 p-4 bg-slate-50/70 dark:bg-[#10192A] border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Funding Account (Debit Source)
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#152033] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
              >
                {user.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nickname ? `${acc.nickname} (${acc.name})` : acc.name} ({acc.accountNumber}) — Available: ${acc.availableBalance.toFixed(2)}
                  </option>
                ))}
              </select>

              {(() => {
                const tier = getAccountTier(sourceAccount.name);
                if (!tier || (tier.minBalance === undefined && tier.maxBalance === undefined)) return null;
                return (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Product Limits ({tier.name}):
                    </span>
                    <div className="flex items-center space-x-3">
                      {tier.minBalance !== undefined && (
                        <span>
                          Minimum balance: <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">{formatCurrency(tier.minBalance)}</span>
                        </span>
                      )}
                      {tier.maxBalance !== undefined && (
                        <span>
                          Maximum balance: <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">{formatCurrency(tier.maxBalance)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ==================================================== */}
            {/* OTHER BANK / INTERBANK TRANSFER FORM                 */}
            {/* Field Order: 1. Account Number, 2. Recipient Name, 3. Bank Name */}
            {transferType === 'external' && (
              <form onSubmit={handleReview} className="space-y-5">
                {/* 1. Recipient Account Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      1. Recipient Account Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Authoritative Directory Lookup
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="Enter recipient account number (e.g. 9843210091, 3820194021)"
                      value={accountNumber}
                      onChange={(e) => handleAccountNumberChange(e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] ${
                        isVerifying ? 'pr-10' : ''
                      }`}
                    />
                    {isVerifying && (
                      <div className="absolute right-3.5 top-3.5 flex items-center pointer-events-none">
                        <Loader2 className="w-4 h-4 text-[#1C2B4C] dark:text-slate-300 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {isVerifying && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 animate-fadeIn">
                      <Loader2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 animate-spin shrink-0" />
                      <span>Resolving recipient &amp; receiving institution through authoritative directory...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {verificationError && !isVerifying && (
                    <div className="mt-2.5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center space-x-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{verificationError}</span>
                    </div>
                  )}
                </div>

                {/* 2. Recipient Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      2. Recipient Name <span className="text-red-500">*</span>
                    </label>
                    {isRecipientConfirmed && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Account Holder</span>
                      </span>
                    )}
                  </div>

                  {/* State A: Recipient selected and confirmed */}
                  {isRecipientConfirmed && verifiedRecipient ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {verifiedRecipient.recipientName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {verifiedRecipient.accountType || 'Verified Account'} • Verified via {verificationSource}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearRecipient}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline cursor-pointer shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : discoveredRecipient ? (
                    /* State B: Verified recipient match discovered, clickable to select & populate bank */
                    <div className="space-y-2 animate-fadeIn">
                      <div
                        onClick={() => handleSelectDiscoveredRecipient(discoveredRecipient)}
                        className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 hover:border-emerald-600 dark:border-emerald-500 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {discoveredRecipient.recipientName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shrink-0">
                                Verified Match
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                              Bank: {discoveredRecipient.bankName} • Account: {discoveredRecipient.accountNumber}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDiscoveredRecipient(discoveredRecipient);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors shrink-0 ml-2 group-hover:scale-105 active:scale-95 flex items-center space-x-1"
                        >
                          <span>Select Recipient</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Click <span className="font-semibold text-emerald-700 dark:text-emerald-400">Select Recipient</span> to confirm destination and auto-fill the verified bank name.
                      </p>
                    </div>
                  ) : (
                    /* State C: Empty initial state */
                    <div>
                      <input
                        type="text"
                        readOnly
                        disabled
                        placeholder="Automatically retrieved once account number is entered"
                        value=""
                        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#10192A]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Bank Name (Restored Complete Bank Selection List) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      3. Bank Name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {wasBankAutoSelected ? 'Auto-Selected from Verified Recipient' : 'All Supported Financial Institutions'}
                    </span>
                  </div>

                  <div className="relative" ref={bankDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border rounded-xl text-left flex items-center justify-between cursor-pointer transition-colors ${
                        selectedBank
                          ? 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold'
                          : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          {selectedBank ? selectedBank.name : 'Select Bank'}
                        </span>
                        {wasBankAutoSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                            Auto-Selected
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold ml-2">▾</span>
                    </button>

                    {isBankDropdownOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-[#152033] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 max-h-64 overflow-y-auto animate-fadeIn">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search supported bank by name..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="w-full px-3 py-1.5 pl-8 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1C2B4C] dark:focus:ring-slate-500"
                            autoFocus
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                        <div className="space-y-1">
                          {filteredBanks.map((bank) => {
                            const isCurrent = selectedBank?.id === bank.id;
                            return (
                              <div
                                key={bank.id}
                                onClick={() => handleSelectBank(bank)}
                                className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                  isCurrent
                                    ? 'bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-white font-bold'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold">{bank.name}</div>
                                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {bank.country} • ABA: {bank.routingNumber} • SWIFT: {bank.swiftCode}
                                  </div>
                                </div>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                              </div>
                            );
                          })}
                          {filteredBanks.length === 0 && (
                            <div className="py-3 text-center text-xs text-slate-400">
                              No banks match "{bankSearch}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 & 5. Routing Number & SWIFT/BIC Code (Authoritative & Verified) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                      Routing Transit Number (ABA)
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="e.g. 111000614"
                      value={routingNumber}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#10192A]/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                      SWIFT / BIC Wire Code
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="e.g. CHASUS33"
                      value={swiftCode}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#10192A]/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* 6. Transfer Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Transfer Amount ($ USD) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Available: ${sourceAccount.availableBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="25000"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-[#1C2B4C] dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                    />
                  </div>
                </div>

                {/* 7. Payment Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Payment Reference <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Invoice #4081, Real Estate Escrow"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>

                {/* 8. Save Beneficiary Option */}
                <div className="pt-1 bg-slate-50 dark:bg-[#10192A] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <label className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveBeneficiary}
                      onChange={(e) => setSaveBeneficiary(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#C8102E] focus:ring-[#C8102E]"
                    />
                    <span>Save verified recipient to my trusted address book for future 1-click transfers</span>
                  </label>
                  {saveBeneficiary && (
                    <input
                      type="text"
                      placeholder="Custom Nickname (e.g. Utility Account, Supplier)"
                      value={beneficiaryNickname}
                      onChange={(e) => setBeneficiaryNickname(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 bg-white dark:bg-[#152033] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* 9. Review & Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!verifiedRecipient || !isRecipientConfirmed || !selectedBank}
                    className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Review Transfer Authorization</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {(!verifiedRecipient || !isRecipientConfirmed || !selectedBank) && (
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      {!accountNumber
                        ? 'Enter a recipient account number above to retrieve verified recipient details.'
                        : !isRecipientConfirmed
                        ? 'Click "Select Recipient" on the verified match to confirm the recipient and auto-fill the bank.'
                        : !selectedBank
                        ? 'Please select the destination bank.'
                        : ''}
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* INTERNAL TRANSFER BETWEEN ACCOUNTS */}
            {transferType === 'internal' && (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Destination Account
                  </label>
                  <select
                    value={internalTargetAccount}
                    onChange={(e) => setInternalTargetAccount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  >
                    <option value="">Select destination account</option>
                    {user.accounts
                      .filter((a) => a.id !== sourceAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.accountNumber}>
                          {acc.nickname ? `${acc.nickname} (${acc.name})` : acc.name} ({acc.accountNumber}) — Current: ${acc.balance.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Transfer Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-[#1C2B4C] dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Memo / Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rebalance liquid reserves, savings deposit"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer"
                  >
                    Review Internal Transfer &gt;
                  </button>
                </div>
              </form>
            )}

            {/* AURELITH P2P CLIENT TRANSFER */}
            {transferType === 'other_aurelith' && (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Aurelith Account Number or Client ID (e.g. AR-XXXXXX)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter 10-digit account number or Client ID (AR-XXXXXX)"
                      value={p2pAccountNumber}
                      onChange={async (e) => {
                        const val = e.target.value.trim();
                        setP2pAccountNumber(val);
                        const isAccNum = /^\d{10}$/.test(val);
                        const isClientId = /^AR-[A-Za-z0-9]{6}$/i.test(val);
                        if (isAccNum || isClientId) {
                          try {
                            const res = await bankingApi.verifyRecipient({
                              bankName: 'Aurelith Reserve',
                              accountNumber: val,
                            });
                            if (res.verified && res.recipient) {
                              setP2pRecipientName(res.recipient.recipientName);
                              setP2pVerified(true);
                            } else {
                              setP2pVerified(false);
                            }
                          } catch {
                            setP2pVerified(false);
                          }
                        } else {
                          setP2pVerified(false);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                    />
                  </div>
                  {p2pVerified && p2pRecipientName && (
                    <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified Client: {p2pRecipientName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Transfer Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-[#1C2B4C] dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Payment Reference / Narration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner split, Consulting fee"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer"
                  >
                    Review Client Transfer &gt;
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Col: Verified Beneficiary (when verified & selected) and Saved Beneficiaries */}
          <div className="space-y-6">
            {/* Verified Beneficiary Card - ONLY displayed when recipient has actually been verified and selected */}
            {verifiedRecipient && isRecipientConfirmed && (
              <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs space-y-4 animate-fadeIn">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Verified Beneficiary</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Recipient Name</span>
                    <span className="font-bold text-[#1C2B4C] dark:text-white text-right">{verifiedRecipient.recipientName}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Bank</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {selectedBank?.shortName || verifiedRecipient.bankName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Account Number</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskAccount(accountNumber)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Routing Number</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{routingNumber}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">SWIFT/BIC Code</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{swiftCode}</span>
                  </div>

                  {verifiedRecipient.accountType && (
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Account Type</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{verifiedRecipient.accountType}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified interbank recipient record</span>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Beneficiaries Card */}
            <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#1C2B4C] dark:text-white" />
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Saved Beneficiaries</h3>
              </div>

              {user.beneficiaries.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  No saved recipients yet. When you transfer funds, you can check "Save as trusted beneficiary".
                </div>
              ) : (
                <div className="space-y-2">
                  {user.beneficiaries.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBeneficiary(b)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 cursor-pointer transition-all hover:border-[#1C2B4C] dark:hover:border-slate-600 flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#C8102E] dark:group-hover:text-red-400">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {b.bankName} • {b.accountNumber}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
