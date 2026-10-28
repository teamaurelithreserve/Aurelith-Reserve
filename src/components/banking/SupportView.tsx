import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';

export const SupportView: React.FC = () => {
  const { user, refreshUser } = useBankingAuth();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Wire & Transfer Assistance');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; subject: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'When do outbound wire and ACH transfers settle?',
      a: 'Internal transfers between Aurelith Reserve accounts settle in real-time. Aurelith P2P client-to-client transfers are immediate. External ACH transfers typically settle within 1 business day, and domestic federal wires submitted prior to 4:00 PM CT settle the same day.',
    },
    {
      q: 'How do I freeze or replace a lost or stolen card?',
      a: 'Navigate to "Cards Management" in your navigation menu. You can instantly toggle the lock/freeze switch to block all authorizations in real-time, or select "Request Replacement Card" to generate an updated digital credential immediately.',
    },
    {
      q: 'What are my daily spending and transfer limits?',
      a: 'Standard Premier Checking accounts feature a $3,000.00 daily POS debit limit and $1,000.00 daily ATM cash withdrawal limit. Custom daily spending limits can be adjusted directly from your Cards tab or through your private wealth advisor.',
    },
    {
      q: 'Are deposits held at Aurelith Reserve FDIC insured?',
      a: 'Yes. All deposit accounts at Aurelith Reserve are FDIC insured up to $250,000 per depositor, for each account ownership category, backed by the full faith and credit of the United States Government.',
    },
    {
      q: 'How do I report suspicious activity or unauthorized transactions?',
      a: 'If you suspect fraud, lock your card immediately in the Cards tab and contact the Aurelith Reserve 24/7 Security Operations Center at 855-660-5862 or submit an expedited security ticket below.',
    },
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await bankingApi.submitTicket({ subject, category, message });
      await refreshUser();
      setSubmittedTicket({ id: res.user?.notifications[0]?.id || 'TKT-8921', subject });
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit support request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Concierge Banner */}
      <div className="bg-gradient-to-r from-[#1C2B4C] via-[#24355D] to-[#1C2B4C] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Client Wealth Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">How may we assist you today?</h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Our relationship bankers and technical support specialists are available 24 hours a day, 7 days a week to ensure your banking operations proceed seamlessly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/15">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300">Client Concierge</p>
                <p className="text-sm font-bold text-white">855-660-5862</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300">Direct Inquiries</p>
                <p className="text-sm font-bold text-white">concierge@aurelithreserve.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300">Operating Hours</p>
                <p className="text-sm font-bold text-white">24/7 / 365 Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-24 w-80 h-80 rounded-full bg-red-500/10 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Ticket Submission (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#152033] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#C8102E] dark:text-red-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Open a Secure In-App Ticket</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmit an encrypted inquiry directly to your account relationship team
                </p>
              </div>
            </div>

            {submittedTicket && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-bold">Your support ticket has been registered!</p>
                  <p className="text-xs mt-1">
                    Reference Ticket: <span className="font-mono font-semibold">{submittedTicket.id}</span>. A banking representative has received your dispatch regarding "{submittedTicket.subject}" and an in-app notification will update you upon review.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Category <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] font-medium"
                  >
                    <option value="Wire & Transfer Assistance">Wire & Transfer Assistance</option>
                    <option value="Debit Card Dispute or Lock">Debit Card Dispute or Lock</option>
                    <option value="Account Verification & KYC">Account Verification & KYC</option>
                    <option value="Loan & Credit Facility Inquiry">Loan & Credit Facility Inquiry</option>
                    <option value="Bill Payment Issue">Bill Payment Issue</option>
                    <option value="General Relationship Banking">General Relationship Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Short Summary <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Inbound international wire confirmation"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Details <span className="text-[#C8102E]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Provide transaction references, account numbers, or details regarding your request..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#10192A] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] font-normal"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> End-to-end encrypted dispatch
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Send Secure Message'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white dark:bg-[#152033] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Frequently Asked Banking Questions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Quick answers to common banking procedures</p>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-150"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left px-4 py-3.5 bg-slate-50/50 dark:bg-[#10192A]/50 hover:bg-slate-50 dark:hover:bg-[#10192A] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 pr-2">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 bg-white dark:bg-[#10192A] text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Branch & Executive Contacts */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#152033] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Regional Centers</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Corporate & wealth offices</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Dallas Wealth & Financial Center</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 pl-5">1700 Pacific Avenue, Suite 2200, Dallas, TX 75201</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 pl-5">Phone: (214) 555-0100</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Abilene Operations & Trust Division</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 pl-5">400 Pine Street, Abilene, TX 79601</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 pl-5">Phone: (325) 555-0199</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#10192A] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Fort Worth Commercial Banking</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 pl-5">500 Main Street, Fort Worth, TX 76102</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 pl-5">Phone: (817) 555-0155</p>
              </div>
            </div>
          </div>

          {/* Emergency card freeze shortcut */}
          <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/60 rounded-2xl p-6 text-xs text-red-950 dark:text-red-200">
            <div className="flex items-center space-x-2 text-[#C8102E] dark:text-red-400 font-bold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Emergency Fraud Reporting</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              If your card or credentials have been compromised, contact our 24/7 emergency response team immediately or lock your debit card in the Cards tab.
            </p>
            <div className="font-mono text-base font-extrabold text-[#C8102E] dark:text-red-400">
              855-660-5862
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Available 24 hours daily, including bank holidays.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
