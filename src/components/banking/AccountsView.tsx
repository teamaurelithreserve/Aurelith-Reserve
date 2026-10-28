import React, { useState } from 'react';
import {
  Wallet,
  Copy,
  Check,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Info,
  Tag,
  Edit2,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankingTab } from './BankingLayout';
import { bankingApi } from '../../services/bankingApi';
import { BankAccount } from '../../types/banking';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';

interface AccountsViewProps {
  onSelectTab: (tab: BankingTab) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onSelectTab }) => {
  const { user, showBalances, refreshUser } = useBankingAuth();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Nickname Quick Editor Modal State
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openNicknameModal = (acc: BankAccount) => {
    setEditingAccount(acc);
    setNicknameInput(acc.nickname || '');
    setModalFeedback(null);
  };

  const closeNicknameModal = () => {
    setEditingAccount(null);
    setNicknameInput('');
    setModalFeedback(null);
  };

  const handleSaveModalNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setIsSavingNickname(true);
    setModalFeedback(null);
    try {
      const res = await bankingApi.customizeAccount(editingAccount.id, {
        nickname: nicknameInput.trim(),
      });
      await refreshUser();
      setModalFeedback({ type: 'success', text: res.message || 'Display name updated.' });
      setTimeout(() => {
        closeNicknameModal();
      }, 1400);
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: err.message || 'Failed to update nickname.' });
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleResetModalNickname = async () => {
    if (!editingAccount) return;
    setIsSavingNickname(true);
    setModalFeedback(null);
    try {
      await bankingApi.customizeAccount(editingAccount.id, { nickname: '' });
      await refreshUser();
      setModalFeedback({ type: 'success', text: 'Display name reset to default.' });
      setTimeout(() => {
        closeNicknameModal();
      }, 1400);
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: err.message || 'Failed to reset nickname.' });
    } finally {
      setIsSavingNickname(false);
    }
  };

  if (!user) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const totalLiquidity = user.accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Accounts &amp; Liquidity Portfolio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of your checking, high-yield reserve savings, wire routing, and FDIC insurance coverage.
          </p>
        </div>
        <button
          onClick={() => onSelectTab('statements')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Download Statements</span>
        </button>
      </div>

      {/* Wire & Direct Deposit Coordinates Banner */}
      <div className="bg-[#1C2B4C] dark:bg-[#10192A] text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-transparent dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400 mb-3">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Aurelith Reserve Wire &amp; Direct Deposit Coordinates</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Bank Name</div>
              <div className="font-bold text-white text-sm">Aurelith Reserve</div>
            </div>
          </div>

          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ABA / Routing Number</div>
              <div className="font-mono font-bold text-white text-sm">111301122</div>
            </div>
            <button
              onClick={() => copyToClipboard('111301122', 'routing')}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title="Copy Routing"
            >
              {copiedItem === 'routing' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-white/10 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">SWIFT / BIC Wire Code</div>
              <div className="font-mono font-bold text-white text-sm">AURUS33D</div>
            </div>
            <button
              onClick={() => copyToClipboard('AURUS33D', 'swift')}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title="Copy SWIFT"
            >
              {copiedItem === 'swift' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Account Cards Detailed Breakdown */}
      <div className="space-y-4">
        {user.accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-white flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                      {acc.nickname || acc.name}
                    </h3>
                    {acc.nickname && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Custom Label
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>{acc.name}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {acc.institution || 'Aurelith Reserve'}
                    </span>
                    <span>•</span>
                    <span>Account: {acc.accountNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openNicknameModal(acc)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                  title="Customize Account Display Name"
                >
                  <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{acc.nickname ? 'Edit Name' : 'Customize Name'}</span>
                </button>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                  {acc.status === 'active' ? 'Operational & Verified' : 'Frozen'}
                </span>
                <button
                  onClick={() => copyToClipboard(acc.accountNumber, acc.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedItem === acc.id ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-[#10192A] rounded-2xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Available to Spend</div>
                <div className="text-2xl font-extrabold text-[#1C2B4C] dark:text-white font-mono mt-1">
                  {showBalances ? `$${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#10192A] rounded-2xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Ledger Balance</div>
                <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200 font-mono mt-1">
                  {showBalances ? `$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#10192A] rounded-2xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Annual Percentage Yield (APY)</div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {acc.type === 'savings' ? '4.85%' : '0.25%'}
                </div>
              </div>
            </div>

            {/* Applicable Account Balance Limits */}
            {(() => {
              const tier = getAccountTier(acc.name);
              if (!tier || (tier.minBalance === undefined && tier.maxBalance === undefined)) return null;

              return (
                <div className="p-3.5 bg-slate-50 dark:bg-[#10192A] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Account Tier Policy: <span className="font-bold text-[#1C2B4C] dark:text-white">{tier.name}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {tier.minBalance !== undefined && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Minimum balance:</span>
                        <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">
                          {formatCurrency(tier.minBalance)}
                        </span>
                      </div>
                    )}
                    {tier.maxBalance !== undefined && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Maximum balance:</span>
                        <span className="font-bold font-mono text-[#1C2B4C] dark:text-white">
                          {formatCurrency(tier.maxBalance)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Opened on {new Date(acc.createdAt).toLocaleDateString()} • Currency: USD • Bank: {acc.institution || 'Aurelith Reserve'}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectTab('transfers')}
                  className="px-4 py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Transfer Funds
                </button>
                <button
                  onClick={() => onSelectTab('statements')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Statements
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK NICKNAME CUSTOMIZATION MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-white flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">Customize Account Display Name</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Personalize how this account is labeled.</p>
                </div>
              </div>
              <button
                onClick={closeNicknameModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {modalFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{modalFeedback.text}</span>
              </div>
            )}

            {/* Read-Only Legal Credentials Banner */}
            <div className="p-3 bg-slate-50 dark:bg-[#10192A] rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Legal Account Holder</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Depository Institution</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{editingAccount.institution || 'Aurelith Reserve'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Type &amp; Number</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{editingAccount.name} • {editingAccount.accountNumber}</span>
              </div>
            </div>

            <form onSubmit={handleSaveModalNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Display Nickname
                </label>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="e.g. Personal Checking, Everyday Account, Business Funds"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Convenient label for personal organization.</span>
                  <span>{nicknameInput.length}/40</span>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Suggested:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Personal Checking', 'Everyday Account', 'Business Funds', 'Vault Reserve'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNicknameInput(sug)}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingNickname}
                  className="flex-1 py-2.5 px-4 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSavingNickname ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Name</span>
                  )}
                </button>

                {editingAccount.nickname && (
                  <button
                    type="button"
                    onClick={handleResetModalNickname}
                    disabled={isSavingNickname}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeNicknameModal}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full cursor-pointer"
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
