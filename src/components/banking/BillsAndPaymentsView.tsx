import React, { useState } from 'react';
import {
  Receipt,
  Smartphone,
  Zap,
  Wifi,
  Droplet,
  Tv,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';
import { getAccountTier, formatCurrency } from '../../data/accountTiers';
import confetti from 'canvas-confetti';

export const BillsAndPaymentsView: React.FC = () => {
  const { user, refreshUser, reloadTransactions, transactions } = useBankingAuth();

  const [activeTab, setActiveTab] = useState<'bills' | 'telecom'>('bills');

  // Bill Pay Form state
  const [billerCategory, setBillerCategory] = useState('Electricity');
  const [providerName, setProviderName] = useState('Lone Star Electric');
  const [billerAccountNumber, setBillerAccountNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState('');
  const [billReceipt, setBillReceipt] = useState<any | null>(null);

  // Airtime / Mobile Data state
  const [telecomType, setTelecomType] = useState<'airtime' | 'data'>('airtime');
  const [telecomProvider, setTelecomProvider] = useState('AT&T Mobility');
  const [targetPhone, setTargetPhone] = useState(user?.phoneNumber || '');
  const [telecomAmount, setTelecomAmount] = useState('25');
  const [selectedDataPlan, setSelectedDataPlan] = useState('15GB High-Speed 5G');
  const [telecomLoading, setTelecomLoading] = useState(false);
  const [telecomError, setTelecomError] = useState('');
  const [telecomReceipt, setTelecomReceipt] = useState<any | null>(null);

  if (!user) return null;

  const checkingAcc = user.accounts[0];

  const billerPresets: Record<string, string[]> = {
    Electricity: ['Lone Star Electric', 'TXU Energy', 'Reliant Power', 'Austin Energy'],
    Water: ['Municipal Water District', 'City Utilities Dept', 'Aqua Texas'],
    Internet: ['AT&T Fiber', 'Spectrum Internet', 'Xfinity Comcast', 'Google Fiber'],
    Cable: ['DirectTV Stream', 'Spectrum Cable', 'DISH Network'],
  };

  const handleBillerCategoryChange = (cat: string) => {
    setBillerCategory(cat);
    const options = billerPresets[cat] || ['Custom Biller'];
    setProviderName(options[0]);
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillError('');

    const numAmount = parseFloat(billAmount);
    if (!numAmount || numAmount <= 0) {
      setBillError('Please enter a valid bill amount.');
      return;
    }

    if (numAmount > checkingAcc.availableBalance) {
      setBillError(`Insufficient funds in checking account ($${checkingAcc.availableBalance.toFixed(2)} available).`);
      return;
    }

    const checkingTier = getAccountTier(checkingAcc.name);
    if (checkingTier?.minBalance !== undefined && (checkingAcc.balance - numAmount) < checkingTier.minBalance) {
      setBillError(
        `Bill payment rejected. This payment would leave ${checkingAcc.name} below its required Minimum balance of ${formatCurrency(checkingTier.minBalance)}.`
      );
      return;
    }

    setBillLoading(true);

    try {
      const res = await bankingApi.payBill({
        sourceAccountId: checkingAcc.id,
        btype: billerCategory,
        provider: providerName,
        accountNumber: billerAccountNumber.trim() || 'N/A',
        amount: numAmount,
      });

      setBillReceipt(res.receipt);
      setBillAmount('');
      setBillerAccountNumber('');
      await refreshUser();
      await reloadTransactions();

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setBillError(err.message || 'Bill payment failed.');
    } finally {
      setBillLoading(false);
    }
  };

  const handleBuyTelecom = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelecomError('');

    const numAmount = parseFloat(telecomAmount);
    if (!numAmount || numAmount <= 0) {
      setTelecomError('Please enter or select a valid amount.');
      return;
    }

    if (numAmount > checkingAcc.availableBalance) {
      setTelecomError(`Insufficient funds in checking account.`);
      return;
    }

    const checkingTier = getAccountTier(checkingAcc.name);
    if (checkingTier?.minBalance !== undefined && (checkingAcc.balance - numAmount) < checkingTier.minBalance) {
      setTelecomError(
        `Purchase rejected. This transaction would leave ${checkingAcc.name} below its required Minimum balance of ${formatCurrency(checkingTier.minBalance)}.`
      );
      return;
    }

    if (!targetPhone.trim() || targetPhone.length < 7) {
      setTelecomError('Please enter a valid mobile number.');
      return;
    }

    setTelecomLoading(true);

    try {
      const res = await bankingApi.buyAirtimeData({
        type: telecomType,
        provider: telecomProvider,
        phoneNumber: targetPhone.trim(),
        amount: numAmount,
        dataPlan: telecomType === 'data' ? selectedDataPlan : undefined,
      });

      setTelecomReceipt(res.receipt);
      await refreshUser();
      await reloadTransactions();

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setTelecomError(err.message || 'Recharge failed.');
    } finally {
      setTelecomLoading(false);
    }
  };

  // Recent bill transactions
  const billHistory = transactions.filter(
    (t) => t.type === 'bill_payment' || t.type === 'airtime' || t.type === 'data'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Bills &amp; Utility Payments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pay registered utilities, municipal bills, cable, internet, and purchase direct mobile airtime &amp; data bundles.
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className="flex space-x-2 p-1.5 bg-slate-100 dark:bg-[#10192A] rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('bills');
            setBillReceipt(null);
          }}
          className={`px-5 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'bills' ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Pay Utility &amp; Bills</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('telecom');
            setTelecomReceipt(null);
          }}
          className={`px-5 py-2 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'telecom' ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Airtime &amp; Mobile Data</span>
        </button>
      </div>

      {/* VIEW 1: BILL PAY */}
      {activeTab === 'bills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white mb-4">Pay a Bill</h2>

            {billError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{billError}</span>
              </div>
            )}

            {billReceipt ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-300">Bill Payment Dispatched!</h3>
                <div className="text-2xl font-extrabold text-[#1C2B4C] dark:text-white font-mono">
                  ${billReceipt.amount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Paid to: <span className="font-bold">{billReceipt.provider}</span></div>
                  <div>Account: <span className="font-mono">{billReceipt.accountNumber}</span></div>
                  <div>Reference: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{billReceipt.reference}</span></div>
                </div>
                <button
                  onClick={() => setBillReceipt(null)}
                  className="mt-3 px-6 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#C8102E] dark:hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Pay Another Bill
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayBill} className="space-y-4">
                {/* Category Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                    Service Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Electricity', icon: Zap },
                      { id: 'Water', icon: Droplet },
                      { id: 'Internet', icon: Wifi },
                      { id: 'Cable', icon: Tv },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSel = billerCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleBillerCategoryChange(cat.id)}
                          className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#1C2B4C] dark:bg-red-600 text-white border-[#1C2B4C] dark:border-red-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Provider Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Select Utility Provider
                  </label>
                  <select
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  >
                    {(billerPresets[billerCategory] || []).map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account / Meter Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Biller Account Number / Customer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX-9843210-A"
                    value={billerAccountNumber}
                    onChange={(e) => setBillerAccountNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Amount to Pay ($ USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      required
                      placeholder="0.00"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-[#1C2B4C] dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={billLoading}
                    className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {billLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <span>Pay Bill Immediately</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Side: Saved Billers Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Bill Pay Guarantee</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Payments processed through Aurelith Reserve are covered by our On-Time Payment Guarantee. Electronic confirmations are transmitted instantly to registered utility networks.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-[#10192A] rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>Funding Account: <span className="font-bold text-[#1C2B4C] dark:text-white">Premier Checking</span></div>
                <div>Available Balance: <span className="font-mono font-bold text-slate-900 dark:text-white">${checkingAcc.availableBalance.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AIRTIME & MOBILE DATA */}
      {activeTab === 'telecom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white mb-4">Airtime &amp; Mobile Data Purchase</h2>

            {telecomError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{telecomError}</span>
              </div>
            )}

            {telecomReceipt ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-300">Recharge Successful!</h3>
                <div className="text-2xl font-extrabold text-[#1C2B4C] dark:text-white font-mono">
                  ${telecomReceipt.amount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Provider: <span className="font-bold">{telecomReceipt.provider}</span></div>
                  <div>Phone: <span className="font-mono">{telecomReceipt.phoneNumber}</span></div>
                  <div>Reference: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{telecomReceipt.reference}</span></div>
                </div>
                <button
                  onClick={() => setTelecomReceipt(null)}
                  className="mt-3 px-6 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#C8102E] dark:hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Purchase Another Recharge
                </button>
              </div>
            ) : (
              <form onSubmit={handleBuyTelecom} className="space-y-4">
                {/* Telecom Type Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTelecomType('airtime')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      telecomType === 'airtime'
                        ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white border-[#1C2B4C] dark:border-slate-700'
                        : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Airtime Minutes Top-Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setTelecomType('data')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      telecomType === 'data'
                        ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white border-[#1C2B4C] dark:border-slate-700'
                        : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Mobile Data Bundle
                  </button>
                </div>

                {/* Carrier Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Select Network Carrier
                  </label>
                  <select
                    value={telecomProvider}
                    onChange={(e) => setTelecomProvider(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  >
                    <option value="AT&T Mobility">AT&amp;T Mobility</option>
                    <option value="Verizon Wireless">Verizon Wireless</option>
                    <option value="T-Mobile USA">T-Mobile USA</option>
                    <option value="Mint Mobile">Mint Mobile</option>
                    <option value="Cricket Wireless">Cricket Wireless</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Target Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (214) 555-0199"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#152033] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C]"
                  />
                </div>

                {/* Amount / Plan */}
                {telecomType === 'data' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                      Choose 5G Data Bundle
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { plan: '5GB 5G Data', cost: '15' },
                        { plan: '15GB High-Speed 5G', cost: '25' },
                        { plan: 'Unlimited Ultra 5G', cost: '45' },
                      ].map((item) => (
                        <button
                          key={item.plan}
                          type="button"
                          onClick={() => {
                            setSelectedDataPlan(item.plan);
                            setTelecomAmount(item.cost);
                          }}
                          className={`p-3 rounded-2xl border text-xs text-center transition-all cursor-pointer ${
                            selectedDataPlan === item.plan
                              ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white border-[#1C2B4C] dark:border-slate-700 shadow-xs'
                              : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="font-bold">{item.plan}</div>
                          <div className="text-sm font-mono font-extrabold mt-1">${item.cost}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                      Airtime Amount ($ USD)
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {['10', '25', '50', '100'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTelecomAmount(preset)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            telecomAmount === preset
                              ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white border-[#1C2B4C] dark:border-slate-700'
                              : 'bg-slate-50 dark:bg-[#10192A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={telecomLoading}
                    className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {telecomLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Recharge...</span>
                      </>
                    ) : (
                      <span>Instant Recharge (${telecomAmount})</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Instant Top-Up</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Airtime recharges and high-speed data bundles are dispatched in under 10 seconds directly to the carrier subscriber.
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero transaction processing fees</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY TABLE */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-3">Recent Utility &amp; Telecom Payments</h3>
        {billHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">No utility bill or telecom records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.description}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{item.category}</td>
                    <td className="py-2.5 font-mono text-slate-400 dark:text-slate-500 text-[11px]">{item.reference}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      -${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
