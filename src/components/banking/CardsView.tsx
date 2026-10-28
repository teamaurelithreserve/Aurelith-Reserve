import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  Unlock,
  Sliders,
  Shield,
  Wifi,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { BankCard } from '../../types/banking';
import { bankingApi } from '../../services/bankingApi';

export const CardsView: React.FC = () => {
  const { user, refreshUser, transactions } = useBankingAuth();

  const [selectedCardId, setSelectedCardId] = useState(user?.cards[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardType, setNewCardType] = useState<'debit_virtual' | 'debit_physical'>('debit_virtual');

  if (!user) return null;

  const selectedCard = user.cards.find((c) => c.id === selectedCardId) || user.cards[0];

  const handleToggleFreeze = async () => {
    if (!selectedCard) return;
    setLoading(true);
    try {
      const res = await bankingApi.toggleCardFreeze(selectedCard.id);
      setSuccessMsg(res.message);
      await refreshUser();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update card status.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = async (daily: number) => {
    if (!selectedCard) return;
    try {
      await bankingApi.updateCardLimits({
        cardId: selectedCard.id,
        dailyLimit: daily,
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnline = async () => {
    if (!selectedCard) return;
    try {
      await bankingApi.updateCardLimits({
        cardId: selectedCard.id,
        onlinePurchasesEnabled: !selectedCard.onlinePurchasesEnabled,
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleContactless = async () => {
    if (!selectedCard) return;
    try {
      await bankingApi.updateCardLimits({
        cardId: selectedCard.id,
        contactlessEnabled: !selectedCard.contactlessEnabled,
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestNewCard = async () => {
    setLoading(true);
    try {
      const res = await bankingApi.requestReplacementCard(newCardType);
      setShowNewCardModal(false);
      setSuccessMsg(res.message);
      await refreshUser();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to issue card.');
    } finally {
      setLoading(false);
    }
  };

  const cardPurchases = transactions.filter((t) => t.type === 'card_purchase');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2B4C] dark:text-white">Cards Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control your Aurelith Reserve physical and virtual debit cards, toggle instant security freezes, and adjust daily spending caps.
          </p>
        </div>
        <button
          onClick={() => setShowNewCardModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-[#C8102E] dark:hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Card</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Card Graphic + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Card Representation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Selector Pills */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#10192A] rounded-xl text-xs font-bold">
            {user.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  selectedCard?.id === card.id
                    ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {card.cardType === 'debit_virtual' ? 'Virtual Card' : 'Physical Card'} (••{card.last4})
              </button>
            ))}
          </div>

          {/* Premium Card Graphic */}
          {selectedCard && (
            <div
              className={`relative rounded-3xl p-6 sm:p-7 text-white shadow-xl aspect-[1.58/1] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                selectedCard.status === 'frozen'
                  ? 'bg-slate-700 opacity-90 grayscale-[40%]'
                  : selectedCard.cardType === 'debit_virtual'
                  ? 'bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#334155] border border-slate-600/50'
                  : 'bg-gradient-to-tr from-[#8B0018] via-[#A00B22] to-[#C8102E] border border-red-400/40'
              }`}
            >
              {/* Frozen Overlay Badge */}
              {selectedCard.status === 'frozen' && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center border border-red-500/40">
                    <Lock className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="font-extrabold text-sm uppercase tracking-wider text-red-200">Card Locked / Frozen</span>
                  <span className="text-[11px] text-slate-300">All transactions blocked</span>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-0">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-7 text-[#C8102E] shrink-0" viewBox="0 0 40 56" fill="currentColor">
                    <path d="M0 0H22L12 56H0V0Z" />
                  </svg>
                  <span className="font-extrabold text-sm tracking-widest uppercase font-sans">
                    AURELITH RESERVE
                  </span>
                </div>
                <Wifi className="w-5 h-5 opacity-80" />
              </div>

              {/* Chip & Masked Number */}
              <div className="my-auto pt-2">
                <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-300/80 mb-3 shadow-xs" />
                <div className="font-mono text-base sm:text-lg tracking-[0.25em] text-slate-100 font-semibold drop-shadow-sm">
                  {selectedCard.cardMaskedNumber}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-end justify-between text-xs relative z-0">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">Cardholder</div>
                  <div className="font-bold tracking-wide uppercase">{selectedCard.cardHolderName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">Expires</div>
                  <div className="font-mono font-bold">
                    {selectedCard.expiryMonth}/{selectedCard.expiryYear}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
            For security, CVV and PIN are never exposed in plaintext.
          </div>
        </div>

        {/* Right Column: Controls, Limit Sliders & Security Toggles (7 cols) */}
        {selectedCard && (
          <div className="lg:col-span-7 bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            {/* Freeze Button Hero Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white">Card Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCard.status === 'active'
                    ? 'Card is active for in-store and online purchases.'
                    : 'Card is frozen. No transactions will be permitted.'}
                </p>
              </div>

              <button
                onClick={handleToggleFreeze}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedCard.status === 'active'
                    ? 'bg-red-50 dark:bg-red-950/40 text-[#C8102E] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                }`}
              >
                {selectedCard.status === 'active' ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Freeze Card</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unfreeze Card</span>
                  </>
                )}
              </button>
            </div>

            {/* Daily Limit Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Daily Spending Cap</span>
                <span className="text-[#1C2B4C] dark:text-white font-mono text-sm">${selectedCard.dailyLimit.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={selectedCard.dailyLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full accent-[#C8102E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                <span>$500</span>
                <span>$5,000</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Permissions</h4>

              {/* Online Purchases */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Online &amp; E-Commerce Purchases</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Allow internet and in-app checkout</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    selectedCard.onlinePurchasesEnabled ? 'bg-[#1C2B4C] dark:bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      selectedCard.onlinePurchasesEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Contactless */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#10192A] border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Contactless &amp; NFC Payments</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Tap-to-pay at physical retail terminals</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleContactless}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    selectedCard.contactlessEnabled ? 'bg-[#1C2B4C] dark:bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      selectedCard.contactlessEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD TRANSACTIONS LEDGER */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-3">Card Purchase Ledger</h3>
        {cardPurchases.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">No card retail transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="pb-2">Merchant</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cardPurchases.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{tx.category}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      -${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE NEW CARD MODAL */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white">Issue New Debit Card</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select card type to generate a new debit card linked to your primary Aurelith Premier Checking account.
            </p>

            <div className="space-y-3">
              <label
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  newCardType === 'debit_virtual' ? 'border-[#1C2B4C] dark:border-red-500 bg-slate-50 dark:bg-[#10192A] ring-1 ring-[#1C2B4C] dark:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="cType"
                  checked={newCardType === 'debit_virtual'}
                  onChange={() => setNewCardType('debit_virtual')}
                  className="text-[#C8102E] focus:ring-[#C8102E]"
                />
                <div>
                  <div className="text-xs font-bold text-[#1C2B4C] dark:text-white">Instant Virtual Debit Card</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Available instantly for online purchases and mobile wallet.</div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  newCardType === 'debit_physical' ? 'border-[#1C2B4C] dark:border-red-500 bg-slate-50 dark:bg-[#10192A] ring-1 ring-[#1C2B4C] dark:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="cType"
                  checked={newCardType === 'debit_physical'}
                  onChange={() => setNewCardType('debit_physical')}
                  className="text-[#C8102E] focus:ring-[#C8102E]"
                />
                <div>
                  <div className="text-xs font-bold text-[#1C2B4C] dark:text-white">Physical Contactless Card</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Shipped to your registered Texas residential address.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowNewCardModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleRequestNewCard}
                className="px-5 py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Activating...' : 'Activate Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
