import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
} from 'lucide-react';
import { BankTransaction } from '../../types/banking';

interface TransactionModalProps {
  transaction: BankTransaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.direction === 'credit';

  const copyRef = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
        {/* Top Header */}
        <div className="bg-[#1C2B4C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-xl font-bold">Transaction Receipt</h3>
        </div>

        {/* Amount & Status Badge */}
        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#10192A]">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
              isCredit
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-950/50 text-[#C8102E] dark:text-red-400'
            }`}
          >
            {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-[#1C2B4C] dark:text-white">
            {isCredit ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1">
            <span className="px-3 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
              Status: {transaction.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Detailed Metadata Fields */}
        <div className="p-6 space-y-3 text-xs text-slate-700 dark:text-slate-300 flex-1">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Transaction Reference:</span>
            <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900 dark:text-white">
              <span>{transaction.reference}</span>
              <button onClick={copyRef} className="p-1 hover:text-[#C8102E] dark:hover:text-red-400 cursor-pointer" title="Copy">
                {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Description:</span>
            <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">{transaction.description}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Category:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.category}</span>
          </div>

          {transaction.recipientName && (
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Beneficiary / Party:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{transaction.recipientName}</span>
            </div>
          )}

          {transaction.recipientAccount && (
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Beneficiary Account:</span>
              <span className="font-mono text-slate-900 dark:text-white">{transaction.recipientAccount}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Execution Date &amp; Time:</span>
            <span className="text-slate-800 dark:text-slate-200">{new Date(transaction.timestamp).toLocaleString()}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Processing Fee:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Free ($0.00)</span>
          </div>

          <div className="flex justify-between py-1 pt-2 font-bold text-sm">
            <span className="text-slate-800 dark:text-slate-200">Ledger Balance After:</span>
            <span className="font-mono text-[#1C2B4C] dark:text-blue-400">${transaction.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#10192A] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white dark:bg-[#152033] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
