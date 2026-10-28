import React, { useState } from 'react';
import {
  Landmark,
  Calculator,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  Calendar,
  Check,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankLoan } from '../../types/banking';
import { bankingApi } from '../../services/bankingApi';

export const LoansView: React.FC = () => {
  const { user, refreshUser, reloadTransactions } = useBankingAuth();

  const [loanType, setLoanType] = useState('Personal Loan');
  const [requestedAmount, setRequestedAmount] = useState('10000');
  const [termMonths, setTermMonths] = useState('36');
  const [purpose, setPurpose] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Employed Full-Time');
  const [annualIncome, setAnnualIncome] = useState('85000');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'apply' | 'active'>('apply');

  if (!user) return null;

  const rateMap: Record<string, number> = {
    'Personal Loan': 6.49,
    'Auto Loan': 5.49,
    'Home Mortgage': 5.99,
    'Small Business Capital': 7.25,
  };

  const currentRate = rateMap[loanType] || 6.49;
  const numAmount = parseFloat(requestedAmount) || 10000;
  const numTerm = parseInt(termMonths, 10) || 36;
  const monthlyRate = currentRate / 100 / 12;
  const estimatedMonthly =
    (numAmount * (monthlyRate * Math.pow(1 + monthlyRate, numTerm))) /
    (Math.pow(1 + monthlyRate, numTerm) - 1);

  const totalRepayment = estimatedMonthly * numTerm;
  const totalInterest = totalRepayment - numAmount;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (numAmount < 1000) {
      setErrorMsg('Minimum loan application amount is $1,000.00.');
      return;
    }

    setLoading(true);

    try {
      const res = await bankingApi.applyLoan({
        type: loanType,
        requestedAmount: numAmount,
        termMonths: numTerm,
        purpose: purpose.trim() || `${loanType} financing`,
        employmentStatus,
        annualIncome: parseFloat(annualIncome) || 50000,
      });

      setSuccessMsg(res.message);
      await refreshUser();
      await reloadTransactions();
      setActiveTab('active');
    } catch (err: any) {
      setErrorMsg(err.message || 'Loan application could not be processed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Loans &amp; Financing Solutions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Competitive Texas rates for personal needs, automotive, residential mortgages, and business expansion.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold border border-transparent dark:border-slate-750">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Apply &amp; Calculator
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Active Loans ({user.loans.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-red-900 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'apply' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white mb-4">Loan Application Form</h2>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Product Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Financing Product
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(rateMap).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLoanType(type)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        loanType === type
                          ? 'border-[#1C2B4C] dark:border-red-500 bg-slate-50 dark:bg-[#10192A] ring-1 ring-[#1C2B4C] dark:ring-red-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10192A]/50 hover:bg-slate-50 dark:hover:bg-[#10192A]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1C2B4C] dark:text-white">{type}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{rateMap[type]}% APR</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Slider & Input */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  <span>Requested Loan Amount ($)</span>
                  <span className="text-[#1C2B4C] dark:text-white font-mono text-base font-extrabold">
                    ${numAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="w-full accent-[#C8102E] cursor-pointer"
                />
              </div>

              {/* Term Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Repayment Term
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '12 Mo (1 Yr)', val: '12' },
                    { label: '24 Mo (2 Yrs)', val: '24' },
                    { label: '36 Mo (3 Yrs)', val: '36' },
                    { label: '60 Mo (5 Yrs)', val: '60' },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setTermMonths(t.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        termMonths === t.val
                          ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white border-[#1C2B4C] dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Intended Loan Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home Improvement, Equipment, Debt Consolidation"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-medium focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
              </div>

              {/* Employment & Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Employment Status
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-semibold focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none"
                  >
                    <option value="Employed Full-Time">Employed Full-Time</option>
                    <option value="Self-Employed">Self-Employed / Business Owner</option>
                    <option value="Retired">Retired / Pension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Annual Gross Income ($)
                  </label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-mono focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Underwriting Application...</span>
                    </>
                  ) : (
                    <span>Submit Loan Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Real-Time Repayment Estimate Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#BCE0F5] dark:bg-[#152033] text-[#1C2B4C] dark:text-white rounded-3xl p-6 sm:p-7 border border-sky-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-[#C8102E] dark:text-red-400" />
                <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">Estimated Repayment</h3>
              </div>

              <div className="p-4 bg-white/80 dark:bg-[#10192A] rounded-2xl border border-sky-100 dark:border-slate-700 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
                  Estimated Monthly Payment
                </div>
                <div className="text-3xl font-extrabold text-[#C8102E] dark:text-red-400 font-mono my-1">
                  ${estimatedMonthly.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Fixed rate for {numTerm} months</div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-bold font-mono">{currentRate}% APR</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Principal:</span>
                  <span className="font-bold font-mono">${numAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Interest Payable:</span>
                  <span className="font-bold font-mono">${Math.round(totalInterest).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-sky-300/60 dark:border-slate-700 font-bold text-[#1C2B4C] dark:text-white">
                  <span>Total Estimated Repayment:</span>
                  <span className="font-mono">${Math.round(totalRepayment).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal pt-2 border-t border-sky-200 dark:border-slate-700">
                Decisioning occurs through automated underwriting rules. In this demonstration environment, qualified applications disburse directly to your Aurelith checking account.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE LOANS LIST */
        <div className="space-y-4">
          {user.loans.length === 0 ? (
            <div className="bg-white dark:bg-[#152033] rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-slate-200/80 dark:border-slate-800">
              <Landmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No Active Loan Accounts</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Use the "Apply &amp; Calculator" tab to simulate a personal, auto, or mortgage application.
              </p>
              <button
                onClick={() => setActiveTab('apply')}
                className="mt-3 px-5 py-2 bg-[#1C2B4C] dark:bg-slate-700 text-white text-xs font-bold rounded-full hover:bg-[#152033] dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          ) : (
            user.loans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                      {loan.status === 'approved' ? 'Active & Approved' : 'Under Review'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">ID: {loan.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1C2B4C] dark:text-white">{loan.type}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Purpose: <span className="text-slate-800 dark:text-slate-200 font-medium">{loan.purpose}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
                    <div>Rate: <span className="font-bold text-slate-900 dark:text-white">{loan.interestRate}% APR</span></div>
                    <div>Term: <span className="font-bold text-slate-900 dark:text-white">{loan.termMonths} Months</span></div>
                    <div>Monthly Due: <span className="font-bold text-[#C8102E] dark:text-red-400">${loan.monthlyPayment.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#10192A] p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-right shrink-0">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">Outstanding Balance</div>
                  <div className="text-2xl font-extrabold text-[#1C2B4C] dark:text-white font-mono my-0.5">
                    ${loan.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    Originally Approved: ${loan.approvedAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
