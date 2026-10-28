import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Check,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';

export const NotificationsView: React.FC = () => {
  const { user, refreshUser } = useBankingAuth();
  const [filterType, setFilterType] = useState<string>('all');

  if (!user) return null;

  const handleMarkAllRead = async () => {
    try {
      await bankingApi.markAllNotificationsRead();
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await bankingApi.markNotificationRead(id);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = user.notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const unreadCount = user.notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Notification Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time security updates, transaction confirmations, and loan decision notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#152033] border border-slate-200/50 dark:border-slate-800 rounded-2xl w-fit text-xs font-bold">
        {[
          { id: 'all', label: `All (${user.notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'transaction', label: 'Transactions' },
          { id: 'security', label: 'Security Alerts' },
          { id: 'loan', label: 'Loans' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 space-y-2 border border-slate-200/80 dark:border-slate-800">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-[1.5]" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notifications in this filter</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">You are all caught up on account and security alerts.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkOneRead(n.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start space-x-4 ${
                n.read
                  ? 'bg-white dark:bg-[#152033] border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-red-50/40 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/60 text-slate-900 dark:text-white shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === 'security'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                    : n.type === 'loan'
                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {n.type === 'security' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : n.type === 'loan' ? (
                  <Landmark className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-[#1C2B4C] dark:text-white flex items-center space-x-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
