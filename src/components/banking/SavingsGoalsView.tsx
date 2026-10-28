import React, { useState } from 'react';
import {
  PiggyBank,
  PlusCircle,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankSavingsGoal } from '../../types/banking';
import { bankingApi } from '../../services/bankingApi';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';

export const SavingsGoalsView: React.FC = () => {
  const { user, refreshUser, reloadTransactions } = useBankingAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState<BankSavingsGoal | null>(null);

  // New Goal Form
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('10000');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [goalCategory, setGoalCategory] = useState('General');
  const [initialFund, setInitialFund] = useState('500');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('250');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) return null;

  const checkingAcc = user.accounts[0];

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    const numInitial = parseFloat(initialFund) || 0;
    if (numInitial > 0) {
      if (numInitial > checkingAcc.availableBalance) {
        alert(`Insufficient funds in checking account ($${checkingAcc.availableBalance.toFixed(2)} available).`);
        return;
      }
      const checkingTier = getAccountTier(checkingAcc.name);
      if (checkingTier?.minBalance !== undefined && (checkingAcc.balance - numInitial) < checkingTier.minBalance) {
        alert(
          `Savings deposit rejected. This funding would leave ${checkingAcc.name} below its required Minimum balance of ${formatCurrency(checkingTier.minBalance)}.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      await bankingApi.createSavingsGoal({
        name: goalName.trim(),
        targetAmount: parseFloat(targetAmount) || 5000,
        targetDate,
        category: goalCategory,
        initialContribution: numInitial,
      });

      setShowCreateModal(false);
      setGoalName('');
      setSuccessMsg('Savings goal established successfully!');
      await refreshUser();
      await reloadTransactions();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositToGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDepositModal) return;

    const numAmount = parseFloat(depositAmount);
    if (!numAmount || numAmount <= 0) return;

    if (numAmount > checkingAcc.availableBalance) {
      alert('Insufficient funds in checking account.');
      return;
    }

    const checkingTier = getAccountTier(checkingAcc.name);
    if (checkingTier?.minBalance !== undefined && (checkingAcc.balance - numAmount) < checkingTier.minBalance) {
      alert(
        `Savings deposit rejected. This deposit would leave ${checkingAcc.name} below its required Minimum balance of ${formatCurrency(checkingTier.minBalance)}.`
      );
      return;
    }

    setLoading(true);

    try {
      await bankingApi.contributeToGoal(showDepositModal.id, numAmount);
      setShowDepositModal(null);
      setDepositAmount('250');
      setSuccessMsg(`Deposited $${numAmount.toFixed(2)} to ${showDepositModal.name}!`);
      await refreshUser();
      await reloadTransactions();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalTarget = user.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = user.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Savings Goals &amp; Vaults</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automate your wealth accumulation, track specific target milestones, and earn 4.85% APY on reserve savings.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Progress Card */}
      <div className="bg-[#1C2B4C] dark:bg-[#152033] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border border-transparent dark:border-slate-800">
        <div>
          <div className="text-xs uppercase font-bold text-slate-300 dark:text-slate-400 tracking-wider mb-1">
            Total Goal Milestones
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight my-1">
            ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-300 dark:text-slate-400">
            Targeting ${totalTarget.toLocaleString()} across {user.savingsGoals.length} goals
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-200">
            <span>Overall Progress</span>
            <span className="font-mono text-emerald-400 font-bold">{overallPercentage}%</span>
          </div>
          <div className="h-3 bg-white/10 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user.savingsGoals.map((goal) => {
          const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white mt-1">{goal.name}</h3>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#C8102E] dark:text-red-400">{percent}%</span>
                </div>

                <div className="my-3 space-y-1">
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1C2B4C] dark:bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono">Target: ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Target Date: {goal.targetDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Yield: 4.85% APY</span>
                <button
                  onClick={() => setShowDepositModal(goal)}
                  className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE GOAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white">Create New Savings Goal</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Define a personal milestone and track automatic contributions from your everyday checking account.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin Downtown Condo Downpayment"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Initial Deposit from Checking ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialFund}
                  onChange={(e) => setInitialFund(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-[#1C2B4C] dark:text-white">Deposit to {showDepositModal.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Transfer funds from your checking account into this savings goal.
            </p>

            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
