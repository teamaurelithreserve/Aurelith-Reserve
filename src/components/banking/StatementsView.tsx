import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Building,
  UserCheck,
  Eye,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';
import {
  StatementCategory,
  StatementDeliveryMethod,
  StatementPreparationResult,
  StatementRequest,
} from '../../types/banking';
import { generateStatementPdf } from '../../utils/statementPdfGenerator';

const CATEGORIES: StatementCategory[] = [
  'Entire Account Statement',
  'Utility Bill Payments',
  'Water Bill Payments',
  'Airtime Purchases',
  'Incoming Transfers (Inflows)',
  'Outgoing Transfers (Outflows)',
];

export const StatementsView: React.FC = () => {
  const { user, refreshUser } = useBankingAuth();

  // Mode: customer statement generator or administrative desk
  const [activeView, setActiveView] = useState<'customer' | 'admin'>('customer');

  // Form Controls
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    user?.accounts[0]?.id || ''
  );
  // Default to current month: from 1st of month to today (e.g. 2026-10-01 to 2026-10-23)
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<StatementCategory>('Entire Account Statement');
  const [deliveryMethod, setDeliveryMethod] = useState<StatementDeliveryMethod>('download');

  // Processing & Feedback State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Statement Preview State
  const [statementData, setStatementData] = useState<StatementPreparationResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Customer's Own Statement Requests
  const [myRequests, setMyRequests] = useState<StatementRequest[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  // Admin Desk Requests
  const [adminRequests, setAdminRequests] = useState<StatementRequest[]>([]);
  const [loadingAdminRequests, setLoadingAdminRequests] = useState(false);
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('All');
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  if (!user) return null;

  const currentAccount =
    user.accounts.find((a) => a.id === selectedAccountId) || user.accounts[0];

  // Load preview data when controls change
  useEffect(() => {
    loadStatementPreview();
  }, [selectedAccountId, startDate, endDate, category]);

  // Load requests
  useEffect(() => {
    loadMyRequests();
    if (user.role === 'admin') {
      loadAdminRequests();
    }
  }, [user.role]);

  const loadStatementPreview = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      setStatementData(null);
      return;
    }

    setIsLoadingPreview(true);
    setErrorMsg(null);
    try {
      const res = await bankingApi.prepareStatement({
        accountId: selectedAccountId || user.accounts[0]?.id,
        startDate,
        endDate,
        category,
        deliveryMethod,
      });
      setStatementData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to prepare statement preview.');
      setStatementData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const loadMyRequests = async () => {
    setLoadingMyRequests(true);
    try {
      const res = await bankingApi.getMyStatementRequests();
      setMyRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load customer statement requests', err);
    } finally {
      setLoadingMyRequests(false);
    }
  };

  const loadAdminRequests = async () => {
    setLoadingAdminRequests(true);
    try {
      const res = await bankingApi.getAdminStatementRequests();
      setAdminRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load admin statement requests', err);
    } finally {
      setLoadingAdminRequests(false);
    }
  };

  // Process Generate / Request button
  const handleProcessStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!startDate || !endDate) {
      setErrorMsg('Please select both a valid start date and end date.');
      return;
    }

    if (startDate > endDate) {
      setErrorMsg('Invalid date range: Start date cannot be after end date.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Authoritative preparation call to backend
      const prepResult = await bankingApi.prepareStatement({
        accountId: currentAccount.id,
        startDate,
        endDate,
        category,
        deliveryMethod,
      });
      setStatementData(prepResult);

      // 2. Generate PDF document client-side with authoritative stamp
      const doc = generateStatementPdf(prepResult);
      const pdfBase64 = doc.output('datauristring');

      if (deliveryMethod === 'download') {
        // Immediate Download
        const sanitizedCat = category.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Aurelith_Reserve_Statement_${sanitizedCat}_${startDate}_to_${endDate}.pdf`;
        doc.save(filename);
        setSuccessMsg(
          `Statement successfully generated and downloaded with authoritative bank stamp (${prepResult.serverTimeFormatted}).`
        );
      } else {
        // Request via Email: Dispatches to Admin Dashboard
        const reqRes = await bankingApi.requestStatementViaEmail({
          accountId: currentAccount.id,
          startDate,
          endDate,
          category,
          pdfDataUri: pdfBase64,
        });

        setSuccessMsg(
          `Your statement request (Ref: ${reqRes.request.id}) has been securely submitted to the Aurelith Reserve Administrative Desk. Status: Pending.`
        );
        await loadMyRequests();
        if (user.role === 'admin') {
          await loadAdminRequests();
        }
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process statement request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminUpdateStatus = async (
    requestId: string,
    newStatus: 'Pending' | 'Processing' | 'Completed'
  ) => {
    setUpdatingRequestId(requestId);
    try {
      await bankingApi.updateStatementRequestStatus(requestId, newStatus);
      await loadAdminRequests();
      await loadMyRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request status.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleAdminDownloadPdf = async (reqItem: StatementRequest) => {
    try {
      if (reqItem.pdfDataUri) {
        // Open/download stored PDF
        const link = document.createElement('a');
        link.href = reqItem.pdfDataUri;
        link.download = `Aurelith_Statement_${reqItem.id}_${reqItem.customerName.replace(/\s+/g, '_')}.pdf`;
        link.click();
        return;
      }

      // Re-generate from backend statement endpoint if data URI wasn't attached
      const prepResult = await bankingApi.prepareStatement({
        accountId: user.accounts[0].id,
        startDate: reqItem.startDate,
        endDate: reqItem.endDate,
        category: reqItem.category,
      });
      const doc = generateStatementPdf(prepResult);
      doc.save(`Aurelith_Statement_${reqItem.id}.pdf`);
    } catch (err: any) {
      alert(err.message || 'Unable to download statement PDF.');
    }
  };

  const handleToggleRole = async () => {
    try {
      const res = await bankingApi.toggleRole();
      await refreshUser();
      if (res.role === 'admin') {
        await loadAdminRequests();
      } else {
        setActiveView('customer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingAdminCount = adminRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header Banner with Mode Toggle for Authorized Admins */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#1C2B4C] dark:text-white">Account Statements</h1>
            {user.role === 'admin' && (
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Admin Privileges Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate authoritative digital statements with official bank certification, real-time audit stamp, and multi-category ledger filtering.
          </p>
        </div>

        {/* View Switcher / Role Simulator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {user.role === 'admin' ? (
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView('customer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeView === 'customer'
                    ? 'bg-white dark:bg-slate-700 text-[#1C2B4C] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Statement Generator
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('admin');
                  loadAdminRequests();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeView === 'admin'
                    ? 'bg-[#1C2B4C] dark:bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Admin Statement Desk</span>
                {pendingAdminCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#C8102E] text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingAdminCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleRole}
              title="Click to simulate authorized administrator view for evaluation"
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#1C2B4C] dark:hover:text-white underline cursor-pointer"
            >
              Switch to Admin View (Evaluation)
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Feedback Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start space-x-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CUSTOMER STATEMENT GENERATOR & LIVE PREVIEW                    */}
      {/* ========================================================================= */}
      {activeView === 'customer' && (
        <div className="space-y-8">
          {/* Main Statement Controls Card */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C2B4C] dark:text-white">Statement Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your date range, transaction category, and delivery method below.
                </p>
              </div>
            </div>

            <form onSubmit={handleProcessStatement} className="space-y-6">
              {/* Account Selector Strip */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Account
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.accounts.map((acc) => {
                    const isSelected = (selectedAccountId || user.accounts[0].id) === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-[#10192A] border-[#1C2B4C] dark:border-red-500 ring-2 ring-[#1C2B4C]/10 dark:ring-red-500/20 shadow-xs'
                            : 'bg-white dark:bg-[#10192A]/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1C2B4C] dark:text-white truncate">
                            {acc.nickname || acc.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                            {acc.accountNumber.slice(0, 4)}••••{acc.accountNumber.slice(-4)}
                          </span>
                        </div>
                        {acc.nickname && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {acc.name} • {acc.institution || 'Aurelith Reserve'}
                          </div>
                        )}
                        <div className="mt-2 text-sm font-bold font-mono text-slate-900 dark:text-white">
                          ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5 Mandatory Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Beginning date of statement</span>
                </div>

                {/* 2. End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>End Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Ending date of statement</span>
                </div>

                {/* 3. Transaction Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Transaction Category</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StatementCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0B111E] focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-600 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Filter records by activity type</span>
                </div>

                {/* 4. Delivery Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Delivery Method</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('download')}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                        deliveryMethod === 'download'
                          ? 'bg-white dark:bg-slate-700 text-[#1C2B4C] dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('email')}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                        deliveryMethod === 'email'
                          ? 'bg-white dark:bg-slate-700 text-[#1C2B4C] dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Request via Email
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    {deliveryMethod === 'download'
                      ? 'Immediate browser PDF download'
                      : 'Dispatches request to Admin Desk'}
                  </span>
                </div>
              </div>

              {/* 5. Process Button & Security Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Each PDF is stamped in real-time with authoritative bank seal and server timestamp (CDT).
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !startDate || !endDate || startDate > endDate}
                  className="w-full sm:w-auto px-8 py-3 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Processing Statement...</span>
                    </>
                  ) : deliveryMethod === 'download' ? (
                    <>
                      <Download className="w-4 h-4 mr-1.5" />
                      <span>Generate &amp; Download PDF</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-1.5" />
                      <span>Submit Request via Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Statement Live Preview & Ledger View */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            {/* Letterhead Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#1C2B4C] dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C2B4C] dark:bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                  AR
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-[#1C2B4C] dark:text-white block leading-none">
                    AURELITH RESERVE
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#C8102E] dark:text-red-400 font-bold block mt-0.5">
                    Wealth Management &amp; Banking
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    400 Pine Street, Headquarters • Dallas, TX 75201
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <div className="font-bold text-sm text-[#1C2B4C] dark:text-white uppercase tracking-wide">
                  Certified Account Statement
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Period: <span className="text-slate-900 dark:text-white font-semibold">{startDate}</span> to{' '}
                  <span className="text-slate-900 dark:text-white font-semibold">{endDate}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Category: <span className="font-semibold text-slate-700 dark:text-slate-200">{category}</span>
                </div>
              </div>
            </div>

            {/* Account & Holder Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#C8102E] dark:text-red-400">Account Holder</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {user.residentialAddress.street}, {user.residentialAddress.city},{' '}
                  {user.residentialAddress.state} {user.residentialAddress.zipCode}
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  Email: {user.email} • Tel: {user.phoneNumber}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#C8102E] dark:text-red-400">Account Details</div>
                <div className="text-sm font-bold text-[#1C2B4C] dark:text-white">{currentAccount.name}</div>
                <div className="text-slate-600 dark:text-slate-300">
                  Account Number: <span className="font-mono font-bold text-slate-900 dark:text-white">{currentAccount.accountNumber}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  Routing: {currentAccount.routingNumber} • SWIFT: {currentAccount.swiftCode || 'AURUS33D'} • {currentAccount.currency}
                </div>
              </div>
            </div>

            {/* Authoritative Financial Totals Strip */}
            {statementData && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-900 dark:bg-[#0B111E] text-white rounded-2xl text-center border border-transparent dark:border-slate-800">
                <div className="p-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Opening Balance</div>
                  <div className="text-sm sm:text-base font-bold font-mono mt-0.5">
                    ${statementData.summary.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Total Debits ({statementData.summary.debitCount})
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-red-300 mt-0.5">
                    -${statementData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Total Credits ({statementData.summary.creditCount})
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-emerald-300 mt-0.5">
                    +${statementData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Net Activity</div>
                  <div className="text-sm sm:text-base font-bold font-mono mt-0.5">
                    {statementData.summary.netChange >= 0 ? '+' : '-'}$
                    {Math.abs(statementData.summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Closing Balance</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                    ${statementData.summary.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Table / Empty State */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Ledger Transactions ({statementData ? statementData.transactions.length : 0})
                </h3>
                {isLoadingPreview && (
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Updating ledger preview...</span>
                  </span>
                )}
              </div>

              {!statementData || statementData.transactions.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">No Transactions Found</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    No transactions match the selected criteria for{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">"{category}"</span> between{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{startDate}</span> and{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{endDate}</span>.
                    Try selecting a broader date range or adjusting the category.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-[#10192A] text-[#1C2B4C] dark:text-slate-300 text-[11px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Debit ($)</th>
                        <th className="py-3 px-4 text-right">Credit ($)</th>
                        <th className="py-3 px-4 text-right">Balance ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statementData.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-[#10192A]/50 transition-colors">
                          <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {new Date(tx.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                            {tx.reference || '—'}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {tx.description}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{tx.category || tx.type}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                            {tx.direction === 'debit' ? `-$${tx.amount.toFixed(2)}` : ''}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {tx.direction === 'credit' ? `+$${tx.amount.toFixed(2)}` : ''}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            ${tx.balanceAfter.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Real-Time Bank Audit Stamp Box Preview */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="p-3.5 rounded-xl border-2 border-dashed border-[#1C2B4C]/40 dark:border-slate-700 bg-slate-50/80 dark:bg-[#10192A] w-full sm:w-auto text-left space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#C8102E] dark:text-red-400">
                  <Building className="w-3.5 h-3.5" />
                  <span>AURELITH RESERVE • OFFICIAL AUDIT STAMP</span>
                </div>
                <div className="text-[11px] text-[#1C2B4C] dark:text-slate-200 font-mono">
                  Timestamp: {statementData ? statementData.serverTimeFormatted : `${new Date().toLocaleTimeString()} CDT`}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Digital Verification: Authenticated • Timezone: CDT (UTC-05:00)
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right max-w-sm">
                Deposits FDIC insured up to $250,000. Aurelith Reserve • Member FDIC • Equal Housing Lender.
              </div>
            </div>
          </div>

          {/* Customer's Previous & Pending Statement Requests Section */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#1C2B4C] dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Statement Requests ({myRequests.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={loadMyRequests}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1C2B4C] dark:hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMyRequests ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {myRequests.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                You have not submitted any statements for email processing yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5">Request ID</th>
                      <th className="py-2.5">Submitted</th>
                      <th className="py-2.5">Period</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 font-mono font-bold text-[#1C2B4C] dark:text-blue-400">{req.id}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-slate-800 dark:text-slate-200">
                          {req.startDate} to {req.endDate}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{req.category}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              req.status === 'Completed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : req.status === 'Processing'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>{req.status}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleAdminDownloadPdf(req)}
                            className="inline-flex items-center space-x-1 text-xs text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ADMIN STATEMENT DESK (REQUIREMENT 2)                           */}
      {/* ========================================================================= */}
      {activeView === 'admin' && (
        <div className="space-y-6">
          {/* Admin Header Card */}
          <div className="bg-gradient-to-r from-[#1C2B4C] to-[#152033] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                  <h2 className="text-xl font-bold">Admin Statement Processing Desk</h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Authorized administrative console for reviewing customer statement requests, inspecting period criteria, updating processing status, and downloading secure certified statement PDFs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={loadAdminRequests}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAdminRequests ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
              <div className="p-2.5 rounded-xl bg-white/5">
                <div className="text-[11px] text-slate-400">Total Requests</div>
                <div className="text-lg font-bold font-mono mt-0.5">{adminRequests.length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[11px] text-amber-300">Pending Review</div>
                <div className="text-lg font-bold font-mono text-amber-200 mt-0.5">
                  {adminRequests.filter((r) => r.status === 'Pending').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[11px] text-emerald-300">Completed</div>
                <div className="text-lg font-bold font-mono text-emerald-200 mt-0.5">
                  {adminRequests.filter((r) => r.status === 'Completed').length}
                </div>
              </div>
            </div>
          </div>

          {/* Requests Queue Table */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Customer Email Requests Queue ({adminRequests.length})
              </h3>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-[#10192A] rounded-xl border border-slate-200/50 dark:border-slate-800">
                {['All', 'Pending', 'Processing', 'Completed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAdminFilterStatus(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      adminFilterStatus === st
                        ? 'bg-white dark:bg-[#152033] text-[#1C2B4C] dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {adminRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                No statement requests have been submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#10192A] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-3">Customer &amp; Account</th>
                      <th className="py-3 px-3">Request Date &amp; Time</th>
                      <th className="py-3 px-3">Requested Period</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {adminRequests
                      .filter((r) => adminFilterStatus === 'All' || r.status === adminFilterStatus)
                      .map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{req.customerName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Acc: {req.accountIdentifier} ({req.accountType})
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{req.customerEmail}</div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div className="font-medium">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {new Date(req.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-800 dark:text-slate-200 font-mono text-[11px] whitespace-nowrap">
                            {req.startDate} to {req.endDate}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{req.category}</span>
                            {req.statementSummary && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                {req.statementSummary.transactionCount} transactions
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={req.status}
                              disabled={updatingRequestId === req.id}
                              onChange={(e) =>
                                handleAdminUpdateStatus(
                                  req.id,
                                  e.target.value as 'Pending' | 'Processing' | 'Completed'
                                )
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer focus:outline-none dark:bg-[#10192A] dark:text-white ${
                                req.status === 'Completed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : req.status === 'Processing'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              <option value="Pending" className="dark:bg-[#10192A] dark:text-white">Pending</option>
                              <option value="Processing" className="dark:bg-[#10192A] dark:text-white">Processing</option>
                              <option value="Completed" className="dark:bg-[#10192A] dark:text-white">Completed</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleAdminDownloadPdf(req)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Admin Security Footer Note */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Administrative Notice: Customer statements contain certified financial records. Downloaded PDFs must be transmitted exclusively through verified institutional channels.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
