import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  Smartphone,
  CreditCard,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Building,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankTransaction } from '../../types/banking';
import { BankingTab } from './BankingLayout';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';

interface BankingOverviewProps {
  onSelectTab: (tab: BankingTab) => void;
  onOpenTransactionDetails: (tx: BankTransaction) => void;
}

export const BankingOverview: React.FC<BankingOverviewProps> = ({
  onSelectTab,
  onOpenTransactionDetails,
}) => {
  const { user, showBalances, toggleShowBalances, transactions } = useBankingAuth();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [txSearch, setTxSearch] = useState('');

  if (!user) return null;

  const checkingAcc = user.accounts.find((a) => a.type === 'checking') || user.accounts[0];
  const savingsAcc = user.accounts.find((a) => a.type === 'savings') || user.accounts[1];
  const totalBalance = user.accounts.reduce((sum, a) => sum + a.balance, 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. TOP NAVIGATION / HEADER FOR DETAILED OVERVIEW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={() => onSelectTab('home')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C2B4C] dark:text-white">
            Detailed Account Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full financial portfolio, checking and savings breakdown, routing coordinates, and account services.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectTab('statements')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Account Statements</span>
          </button>
          <button
            onClick={() => onSelectTab('transfers')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-white" />
            <span>Transfer Funds</span>
          </button>
        </div>
      </div>

      {/* 2. WIRE & DIRECT DEPOSIT COORDINATES BANNER */}
      <div className="bg-[#1C2B4C] dark:bg-[#10192A] text-white rounded-3xl p-5 sm:p-6 shadow-xs border border-transparent dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400 mb-3">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Aurelith Reserve Clearing &amp; Direct Deposit Information</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Bank Name</div>
              <div className="font-bold text-white text-sm">Aurelith Reserve</div>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/20 rounded-md">
              Member FDIC
            </span>
          </div>

          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Routing / ABA</div>
              <div className="font-mono font-bold text-white text-sm">111301122</div>
            </div>
            <button
              onClick={() => copyToClipboard('111301122', 'routing')}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title="Copy Routing Number"
            >
              {copiedItem === 'routing' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">SWIFT / BIC</div>
              <div className="font-mono font-bold text-white text-sm">AURUS33D</div>
            </div>
            <button
              onClick={() => copyToClipboard('AURUS33D', 'swift')}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title="Copy SWIFT Code"
            >
              {copiedItem === 'swift' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY ACCOUNTS BALANCES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Checking Account Card */}
        {checkingAcc && (
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative group hover:border-[#1C2B4C] dark:hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {checkingAcc.type.toUpperCase()} ACCOUNT
                </span>
                <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                  {checkingAcc.nickname || checkingAcc.name}
                </h3>
                {checkingAcc.nickname && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {checkingAcc.name} • {checkingAcc.institution || 'Aurelith Reserve'}
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Acct: {checkingAcc.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(checkingAcc.accountNumber, 'checking')}
                    className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedItem === 'checking' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available Balance</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B4C] dark:text-white font-mono tracking-tight">
                {showBalances
                  ? `$${checkingAcc.availableBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`
                  : '••••••••'}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                Current Ledger Balance:{' '}
                {showBalances
                  ? `$${checkingAcc.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`
                  : '••••••••'}
              </div>
            </div>

            {(() => {
              const tier = getAccountTier(checkingAcc.name);
              if (!tier || (tier.minBalance === undefined && tier.maxBalance === undefined)) return null;

              return (
                <div className="my-2.5 p-3 bg-slate-50 dark:bg-[#10192A] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{tier.name} Policy Limits</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                    {tier.minBalance !== undefined && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Minimum balance: </span>
                        <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">
                          {formatCurrency(tier.minBalance)}
                        </span>
                      </div>
                    )}
                    {tier.maxBalance !== undefined && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Maximum balance: </span>
                        <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">
                          {formatCurrency(tier.maxBalance)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectTab('transfers')}
                className="text-xs font-bold text-[#C8102E] dark:text-red-400 hover:underline inline-flex items-center cursor-pointer"
              >
                <span>Transfer Money</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
              <button
                onClick={() => onSelectTab('accounts')}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Details &gt;
              </button>
            </div>
          </div>
        )}

        {/* Savings Account Card */}
        {savingsAcc && (
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative group hover:border-[#1C2B4C] dark:hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  RESERVE HIGH-YIELD SAVINGS
                </span>
                <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                  {savingsAcc.nickname || savingsAcc.name}
                </h3>
                {savingsAcc.nickname && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {savingsAcc.name} • {savingsAcc.institution || 'Aurelith Reserve'}
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Acct: {savingsAcc.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(savingsAcc.accountNumber, 'savings')}
                    className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedItem === 'savings' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-200 dark:border-amber-800">
                4.85% APY
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available Balance</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B4C] dark:text-white font-mono tracking-tight">
                {showBalances
                  ? `$${savingsAcc.availableBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`
                  : '••••••••'}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>
                  {savingsAcc.balance > 0
                    ? `Earned $${((savingsAcc.balance * 0.0485) / 12).toFixed(2)} in accrued yield this month`
                    : 'Earn up to 4.85% APY on funded deposits'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectTab('savings')}
                className="text-xs font-bold text-[#1C2B4C] dark:text-slate-200 hover:underline inline-flex items-center cursor-pointer"
              >
                <span>Savings Goals</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
              <button
                onClick={() => onSelectTab('transfers')}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Deposit &gt;
              </button>
            </div>
          </div>
        )}

        {/* Total Net Worth / Consolidated Card */}
        <div className="bg-[#1C2B4C] dark:bg-[#10192A] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-transparent dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400">
                Consolidated Liquidity
              </span>
              <button
                onClick={toggleShowBalances}
                className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                title={showBalances ? 'Hide balances' : 'Show balances'}
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight my-3">
              {showBalances
                ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '••••••••'}
            </div>
            <div className="space-y-1 text-xs text-slate-300 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Checking Balance:</span>
                <span className="font-mono text-white">
                  {showBalances
                    ? `$${checkingAcc.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`
                    : '••••'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reserve Savings:</span>
                <span className="font-mono text-white">
                  {showBalances
                    ? `$${savingsAcc.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`
                    : '••••'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-semibold">FDIC Insured to $250,000</span>
            <button
              onClick={() => onSelectTab('statements')}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              Statement
            </button>
          </div>
        </div>
      </div>

      {/* 4. FUNCTIONAL QUICK ACTION SHORTCUTS */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Quick Banking Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => onSelectTab('transfers')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1C2B4C] dark:text-blue-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Transfer</span>
          </button>

          <button
            onClick={() => onSelectTab('bills')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Pay Bills</span>
          </button>

          <button
            onClick={() => onSelectTab('bills')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Airtime &amp; Data</span>
          </button>

          <button
            onClick={() => onSelectTab('cards')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Cards</span>
          </button>

          <button
            onClick={() => onSelectTab('loans')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Loans</span>
          </button>

          <button
            onClick={() => onSelectTab('savings')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Savings Goals</span>
          </button>

          <button
            onClick={() => onSelectTab('statements')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Statements</span>
          </button>

          <button
            onClick={() => onSelectTab('support')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">Support</span>
          </button>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY LEDGER */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C2B4C] dark:text-white">Recent Activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time ledger entries for your accounts</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#10192A] focus:outline-none focus:ring-1 focus:ring-[#1C2B4C] dark:focus:ring-slate-500"
              />
            </div>
            <button
              onClick={() => onSelectTab('transactions')}
              className="text-xs font-bold text-[#1C2B4C] dark:text-red-400 hover:text-[#C8102E] dark:hover:text-red-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              View Full History &gt;
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions found</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perform a transfer or bill payment to record your first transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 hidden sm:table-cell">Category</th>
                  <th className="pb-3 hidden md:table-cell">Reference</th>
                  <th className="pb-3">Date &amp; Time</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.slice(0, 8).map((tx) => {
                  const isCredit = tx.direction === 'credit';
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onOpenTransactionDetails(tx)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pl-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-950/60 text-[#C8102E] dark:text-red-400'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#C8102E] dark:group-hover:text-red-400 transition-colors">
                        <div>{tx.description}</div>
                        <div className="text-[10px] text-slate-400 font-normal sm:hidden">
                          {tx.category}
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400 dark:text-slate-500 hidden md:table-cell">
                        {tx.reference}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                          {new Date(tx.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 font-mono font-bold whitespace-nowrap">
                        <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                          {isCredit ? '+' : '-'}$
                          {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
