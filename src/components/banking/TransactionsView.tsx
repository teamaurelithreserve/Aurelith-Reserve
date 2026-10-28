import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankTransaction } from '../../types/banking';
import { BankingTab } from './BankingLayout';

interface TransactionsViewProps {
  onOpenDetails: (tx: BankTransaction) => void;
  onSelectTab?: (tab: BankingTab) => void;
  onOpenStatements?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenDetails,
  onSelectTab,
  onOpenStatements,
}) => {
  const { transactions } = useBankingAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high'>('newest');

  // Categories present in transactions
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const filtered = transactions
    .filter((t) => {
      if (directionFilter !== 'all' && t.direction !== directionFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          (t.recipientName && t.recipientName.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'amount_high') return b.amount - a.amount;
      return 0;
    });

  const exportCSV = () => {
    const headers = ['Reference,Date,Type,Category,Description,Amount,Direction,Status,BalanceAfter\n'];
    const rows = filtered.map(
      (t) =>
        `"${t.reference}","${t.timestamp}","${t.type}","${t.category}","${t.description.replace(/"/g, '""')}","${t.amount}","${t.direction}","${t.status}","${t.balanceAfter}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aurelith_Reserve_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGoToStatements = () => {
    if (onOpenStatements) {
      onOpenStatements();
    } else if (onSelectTab) {
      onSelectTab('statements');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('home')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors mb-2 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#1C2B4C] dark:text-white">Transaction Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time audit log of all debits, deposits, transfers, utility charges, and disbursements.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Dedicated Account Statement Action */}
          <button
            onClick={handleGoToStatements}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Account Statement</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Card */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search description, reference, or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* Direction Switcher Pills */}
        <div className="flex gap-2 text-xs font-bold pt-1">
          <button
            onClick={() => setDirectionFilter('all')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              directionFilter === 'all'
                ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Activity ({transactions.length})
          </button>

          <button
            onClick={() => setDirectionFilter('credit')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              directionFilter === 'credit'
                ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Deposits &amp; Credits
          </button>

          <button
            onClick={() => setDirectionFilter('debit')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              directionFilter === 'debit'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Withdrawals &amp; Debits
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <div className="text-sm font-semibold">No transactions match your query</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 hidden sm:table-cell">Category</th>
                  <th className="pb-3 hidden md:table-cell">Reference</th>
                  <th className="pb-3">Date &amp; Time</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((tx) => {
                  const isCredit = tx.direction === 'credit';
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onOpenDetails(tx)}
                      className="hover:bg-slate-50 dark:hover:bg-[#10192A] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pl-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/60 text-[#C8102E] dark:text-red-400'
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
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal sm:hidden">{tx.category}</div>
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
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 font-mono font-bold whitespace-nowrap">
                        <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                          {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
