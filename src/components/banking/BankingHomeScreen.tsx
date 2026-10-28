import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  User,
  LogOut,
  FileText,
  HelpCircle,
  Receipt,
  PiggyBank,
  Landmark,
  Smartphone,
  Tv,
  PlusCircle,
  Copy,
  Check,
  X,
  Building,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankTransaction } from '../../types/banking';
import { BankingTab } from './BankingLayout';
import { bankingApi } from '../../services/bankingApi';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';
import { UserAvatar } from '../common/UserAvatar';

interface BankingHomeScreenProps {
  onSelectTab: (tab: BankingTab) => void;
  onOpenTransactionDetails: (tx: BankTransaction) => void;
}

export const BankingHomeScreen: React.FC<BankingHomeScreenProps> = ({
  onSelectTab,
  onOpenTransactionDetails,
}) => {
  const { user, logout, showBalances, toggleShowBalances, transactions, refreshUser } =
    useBankingAuth();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);

  // Add Money copy feedback
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  if (!user) return null;

  // Primary account (checking or primary reserve account)
  const primaryAccount =
    user.accounts.find((a) => a.type === 'checking') || user.accounts[0];
  const primaryBalance = primaryAccount ? primaryAccount.availableBalance : 0;

  // Single latest genuine transaction
  const latestTx = transactions && transactions.length > 0 ? transactions[0] : null;

  const unreadNotifs = user.notifications ? user.notifications.filter((n) => !n.read) : [];

  const handleMarkAllRead = async () => {
    try {
      await bankingApi.markAllNotificationsRead();
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  // Time-of-day greeting
  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  // Copy all account details for Add Money
  const handleCopyAllAccountDetails = async () => {
    setCopyError(null);
    try {
      const details = [
        `Bank Name: Aurelith Reserve`,
        `Account Name: ${user.firstName} ${user.lastName}`,
        `Account Number: ${primaryAccount.accountNumber}`,
        primaryAccount.routingNumber ? `Routing Number: ${primaryAccount.routingNumber}` : null,
        primaryAccount.swiftCode ? `SWIFT/BIC Code: ${primaryAccount.swiftCode}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      await navigator.clipboard.writeText(details);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error('Failed to copy account details', err);
      setCopyError('Unable to copy details to clipboard.');
    }
  };

  const handleCopyField = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Field copy failed', err);
    }
  };

  // Filter recent transactions for the dedicated Recent Activity modal (e.g. today's transactions or latest entries)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactions = transactions.filter(
    (t) => new Date(t.timestamp).toISOString().slice(0, 10) === todayStr
  );
  // Show today's transactions if any, otherwise the 10 most recent transactions
  const conciseRecentTransactions =
    todayTransactions.length > 0 ? todayTransactions : transactions.slice(0, 10);

  const renderNotificationsDropdown = () => (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setNotifDropdownOpen(false)}
      />
      <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fadeIn text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            Notifications ({unreadNotifs.length} new)
          </span>
          {unreadNotifs.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#C8102E] dark:text-red-400 hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto space-y-2">
          {user.notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500">No notifications yet.</div>
          ) : (
            user.notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`p-2.5 rounded-xl transition-colors ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    : 'bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-slate-900 dark:text-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-bold text-[#1C2B4C] dark:text-slate-100">{n.title}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">{n.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 text-center">
          <button
            onClick={() => {
              onSelectTab('notifications');
              setNotifDropdownOpen(false);
            }}
            className="text-[#1C2B4C] dark:text-red-400 font-bold text-xs hover:underline cursor-pointer"
          >
            View all in Notification Center &gt;
          </button>
        </div>
      </div>
    </>
  );

  const renderUserDropdown = () => (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setUserDropdownOpen(false)}
      />
      <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn text-xs">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={user.avatarUrl}
            size="md"
            shape="circle"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email}</div>
            <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 truncate">{user.phoneNumber}</div>
          </div>
        </div>
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              onSelectTab('profile');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Profile &amp; Security</span>
          </button>
          <button
            onClick={() => {
              onSelectTab('statements');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Account Statements</span>
          </button>
          <button
            onClick={() => {
              onSelectTab('support');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Help &amp; Support</span>
          </button>
        </div>
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
      {/* 1. COMPACT HOME SCREEN HEADER ROW */}
      <div className="flex items-center justify-between gap-3 py-1">
        {/* Left: Small personalized greeting */}
        <div className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white tracking-tight truncate">
          {getGreeting(user.firstName)}
        </div>

        {/* Right: Notifications and User Profile Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer relative active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C8102E] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotifs.length}
                </span>
              )}
            </button>
            {notifDropdownOpen && renderNotificationsDropdown()}
          </div>

          {/* User's Profile Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all overflow-hidden"
              aria-label="User Profile"
            >
              <UserAvatar
                firstName={user.firstName}
                lastName={user.lastName}
                avatarUrl={user.avatarUrl}
                size="md"
                shape="circle"
              />
            </button>
            {userDropdownOpen && renderUserDropdown()}
          </div>
        </div>
      </div>

      {/* 2. REFINED TWO-LAYER BALANCE CARD */}
      <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* UPPER LAYER: Lighter brand tint, Available label, responsive balance, eye toggle, and History action */}
        <div className="bg-[#F0F4F9] dark:bg-[#152033] p-5 sm:p-6 border-b border-[#1C2B4C]/10 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {/* Subtle Title Case 'Available' Label with Account Nickname */}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 tracking-normal block mb-1">
                {primaryAccount.nickname ? (
                  <span className="inline-flex items-center space-x-1.5 flex-wrap">
                    <span className="font-bold text-[#1C2B4C] dark:text-white">{primaryAccount.nickname}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({primaryAccount.name})</span>
                    <span>• Available</span>
                  </span>
                ) : (
                  `${primaryAccount.name} • Available Balance`
                )}
              </span>

              {/* Responsive Balance Amount with Eye Toggle */}
              <div className="flex items-center space-x-2.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B4C] dark:text-white font-mono tabular-nums tracking-tight truncate">
                  {showBalances
                    ? `$${primaryBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '••••••••'}
                </div>
                <button
                  onClick={toggleShowBalances}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1C2B4C] dark:hover:text-white rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  aria-label={showBalances ? 'Hide balance' : 'Show balance'}
                  title={showBalances ? 'Hide balance' : 'Show balance'}
                >
                  {showBalances ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* History Action beside the balance (Navigates to Full Transaction History & Statements) */}
            <button
              onClick={() => onSelectTab('transactions')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-[#1C2B4C] dark:text-white hover:text-[#C8102E] dark:hover:text-red-400 transition-all cursor-pointer shadow-2xs border border-slate-200/80 dark:border-slate-700 shrink-0 group active:scale-95"
            >
              <span>History</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* LOWER LAYER: Darker primary brand color (#1C2B4C) with Latest Transaction & View All History */}
        <div className="bg-[#1C2B4C] dark:bg-[#10192A] text-white p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-300 dark:text-slate-400 uppercase tracking-wider">
              Latest Activity
            </span>
            {/* View All History Action: Exclusively opens concise recent-transactions-only view */}
            <button
              onClick={() => setShowRecentModal(true)}
              className="text-xs font-bold text-red-300 dark:text-red-400 hover:text-white transition-colors cursor-pointer"
            >
              View All History &gt;
            </button>
          </div>

          {latestTx ? (
            <div
              onClick={() => setShowRecentModal(true)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group -mx-1"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    latestTx.direction === 'credit'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {latestTx.direction === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-200 transition-colors truncate">
                    {latestTx.description}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(latestTx.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <div
                  className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                    latestTx.direction === 'credit' ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {showBalances
                    ? `${latestTx.direction === 'credit' ? '+' : '-'}$${latestTx.amount.toLocaleString(
                        'en-US',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : '••••••••'}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    latestTx.direction === 'credit' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {latestTx.direction === 'credit' ? 'Credit' : 'Debit'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-xs text-slate-400">
              No recent transactions recorded.
            </div>
          )}
        </div>
      </div>

      {/* 3. QUICK-ACTION ICONS: 1. Add Money, 2. Send, 3. Pay, 4. Loan, 5. Save, 6. Airtime, 7. TV */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 pt-1">
        {/* Action 1: Add Money (Functional Feature) */}
        <button
          onClick={() => setIsAddMoneyOpen(true)}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#C8102E] dark:text-red-400 group-hover:bg-[#C8102E] group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#C8102E] dark:group-hover:text-red-400 transition-colors text-center whitespace-nowrap">
            Add Money
          </span>
        </button>

        {/* Action 2: Send (Connected to authoritative money transfer workflow) */}
        <button
          onClick={() => onSelectTab('transfers')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            Send
          </span>
        </button>

        {/* Action 3: Pay */}
        <button
          onClick={() => onSelectTab('bills')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            Pay
          </span>
        </button>

        {/* Action 4: Loan */}
        <button
          onClick={() => onSelectTab('loans')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            Loan
          </span>
        </button>

        {/* Action 5: Save */}
        <button
          onClick={() => onSelectTab('savings')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <PiggyBank className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            Save
          </span>
        </button>

        {/* Action 6: Airtime */}
        <button
          onClick={() => onSelectTab('bills')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            Airtime
          </span>
        </button>

        {/* Action 7: TV */}
        <button
          onClick={() => onSelectTab('bills')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#1C2B4C] dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-[#1C2B4C] dark:group-hover:bg-slate-700 group-hover:text-white text-[#1C2B4C] dark:text-slate-200 flex items-center justify-center mb-1.5 transition-colors">
            <Tv className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C2B4C] dark:group-hover:text-white transition-colors text-center whitespace-nowrap">
            TV
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. FUNCTIONAL ADD MONEY MODAL INTERFACE                                   */}
      {/* ========================================================================= */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="bg-[#1C2B4C] dark:bg-[#10192A] text-white p-5 sm:p-6 relative">
              <button
                onClick={() => {
                  setIsAddMoneyOpen(false);
                  setCopiedAll(false);
                  setCopyError(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Receive Funds</span>
              </div>
              <h3 className="text-xl font-bold">Add Money to Account</h3>
              <p className="text-xs text-slate-300 dark:text-slate-400 mt-1">
                Share these verified credentials to receive incoming wires, ACH deposits, or internal transfers.
              </p>
            </div>

            {/* Account Details Body */}
            <div className="p-5 sm:p-6 space-y-3.5 text-xs">
              {/* Status / Success notification */}
              {copiedAll && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl font-semibold flex items-center space-x-2 text-xs animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Account details copied to clipboard.</span>
                </div>
              )}

              {copyError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl font-semibold text-xs animate-fadeIn">
                  {copyError}
                </div>
              )}

              {/* Bank Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                    Bank Name
                  </span>
                  <span className="font-bold text-[#1C2B4C] dark:text-white text-sm">Aurelith Reserve</span>
                </div>
                <button
                  onClick={() => handleCopyField('Aurelith Reserve', 'bank')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Copy Bank Name"
                >
                  {copiedField === 'bank' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                    Account Name
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleCopyField(`${user.firstName} ${user.lastName}`, 'name')
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Copy Account Name"
                >
                  {copiedField === 'name' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-wide">
                    {primaryAccount.accountNumber}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyField(primaryAccount.accountNumber, 'account')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Copy Account Number"
                >
                  {copiedField === 'account' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Routing Number */}
              {primaryAccount.routingNumber && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                      Routing Number (ABA)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {primaryAccount.routingNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyField(primaryAccount.routingNumber, 'routing')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Copy Routing Number"
                  >
                    {copiedField === 'routing' ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* SWIFT / BIC Code */}
              {primaryAccount.swiftCode && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                      SWIFT / BIC Code
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {primaryAccount.swiftCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyField(primaryAccount.swiftCode!, 'swift')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Copy SWIFT Code"
                  >
                    {copiedField === 'swift' ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Account Product Balance Range Limits */}
              {(() => {
                const tier = getAccountTier(primaryAccount.name);
                if (!tier || (tier.minBalance === undefined && tier.maxBalance === undefined)) return null;

                return (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{tier.name} Product Limits</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      {tier.minBalance !== undefined && (
                        <span>
                          <span className="text-slate-400">Minimum balance: </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(tier.minBalance)}</span>
                        </span>
                      )}
                      {tier.maxBalance !== undefined && (
                        <span>
                          <span className="text-slate-400">Maximum balance: </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(tier.maxBalance)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Prominent Copy Account Details Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyAllAccountDetails}
                  className="w-full py-3 px-4 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#C8102E] dark:hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Account Details</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-1 leading-normal">
                Transfers received via Fedwire or domestic ACH are credited automatically in real time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DEDICATED RECENT-TRANSACTIONS-ONLY VIEW MODAL                          */}
      {/* (Exclusively recent activity, NO statement controls or PDF buttons)      */}
      {/* ========================================================================= */}
      {showRecentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-[#10192A]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1C2B4C] dark:bg-slate-800 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">Recent Transactions</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {todayTransactions.length > 0
                      ? "Today's ledger activity"
                      : 'Recent activity on your account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Concise Transaction List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1">
              {conciseRecentTransactions.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No recent transactions recorded today.
                </div>
              ) : (
                conciseRecentTransactions.map((tx) => {
                  const isCredit = tx.direction === 'credit';
                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        onOpenTransactionDetails(tx);
                        setShowRecentModal(false);
                      }}
                      className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-50 dark:bg-red-950/60 text-[#C8102E] dark:text-red-400'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#C8102E] dark:group-hover:text-red-400 transition-colors truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(tx.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            •{' '}
                            {new Date(tx.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-3 shrink-0">
                        <div
                          className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider ${
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-[#10192A] border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowRecentModal(false)}
                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
