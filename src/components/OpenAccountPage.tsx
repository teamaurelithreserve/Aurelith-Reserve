import React from 'react';
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { ACCOUNT_TIERS, formatCurrency } from '../data/accountTiers';

interface OpenAccountPageProps {
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  onStartRegistration?: (accountType: string) => void;
  selectedAccountType?: string;
}

export const OpenAccountPage: React.FC<OpenAccountPageProps> = ({
  onNavigateHome,
  onOpenLogin,
  onStartRegistration,
  selectedAccountType = 'Premier Checking',
}) => {
  const handleOpenAccountClick = (accountType: string = 'Premier Checking') => {
    if (onStartRegistration) {
      onStartRegistration(accountType);
    } else {
      onOpenLogin();
    }
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B111E] min-h-screen pb-16 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[240px] sm:h-[280px] md:h-[320px] overflow-hidden bg-[#162544]">
        <img
          src="https://i.imgur.com/H4mLpie.jpg"
          alt="Choose Your Account"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://i.imgur.com/H4mLpie.png') {
              target.src = 'https://i.imgur.com/H4mLpie.png';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14233F] via-[#14233F]/80 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
            <span>Step 1 of 2</span>
            <span>•</span>
            <span>Account Selection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Choose Your Account
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 font-normal max-w-2xl leading-relaxed">
            Because flexibility is important in finances. Compare our six accounts below and select the one that suits your needs to begin your registration.
          </p>
        </div>
      </section>

      {/* 2. BREADCRUMBS & RETURN NAVIGATION */}
      <div className="bg-white dark:bg-[#152033] border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center text-[#1C2B4C] dark:text-slate-300 hover:text-[#C8102E] dark:hover:text-red-400 font-medium transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </button>
            <span>&gt;</span>
            <span>Personal Banking</span>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Choose Your Account</span>
          </div>
          <span className="text-[11px] font-semibold text-[#1C2B4C] dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            6 Account Types Available
          </span>
        </div>
      </div>

      {/* 3. ACCOUNT CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B4C] dark:text-white">
            Select Your Preferred Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            Tap or click any card below to select your account type and continue directly to your application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {ACCOUNT_TIERS.map((tier) => {
            const isSelected =
              selectedAccountType === tier.id ||
              selectedAccountType === tier.name ||
              tier.aliases.some((a) => a.toLowerCase() === (selectedAccountType || '').toLowerCase());

            return (
              <div
                key={tier.id}
                onClick={() => handleOpenAccountClick(tier.name)}
                className={`bg-white dark:bg-[#152033] rounded-2xl shadow-sm border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? 'border-[#C8102E] ring-2 ring-[#C8102E]/25 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-[#C8102E]/60 dark:hover:border-red-500/60 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="bg-[#202B48] dark:bg-[#0F172A] text-white py-3.5 px-4 text-center font-bold text-lg sm:text-xl flex items-center justify-center space-x-2">
                    <span>{tier.name}</span>
                    {tier.badge && (
                      <span className="text-[11px] font-normal text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 sm:p-7 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
                      {tier.tagline}
                    </p>

                    {/* Balance Range Specifications */}
                    {(tier.minBalance !== undefined || tier.maxBalance !== undefined) && (
                      <div className="mb-5 p-3.5 bg-slate-50 dark:bg-[#10192A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-1.5 shadow-2xs">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          Balance Range
                        </div>
                        {tier.minBalance !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Minimum balance:</span>
                            <span className="font-bold text-[#1C2B4C] dark:text-white font-mono text-xs sm:text-sm">
                              {formatCurrency(tier.minBalance)}
                            </span>
                          </div>
                        )}
                        {tier.maxBalance !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Maximum balance:</span>
                            <span className="font-bold text-[#1C2B4C] dark:text-white font-mono text-xs sm:text-sm">
                              {formatCurrency(tier.maxBalance)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="font-semibold text-slate-900 dark:text-white mb-2.5">Key Benefits:</p>
                    <ul className="space-y-2 mb-6">
                      {tier.keyBenefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#C8102E] dark:text-red-400 font-bold text-sm leading-none mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-0 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAccountClick(tier.name);
                    }}
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold rounded-full text-xs sm:text-sm transition-all shadow-xs cursor-pointer group-hover:bg-[#A00B22]"
                  >
                    Select Account &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. SPECIAL PROGRAM NOTES */}
        <div className="mt-12 text-left max-w-3xl mx-auto px-4 text-slate-700 dark:text-slate-400 text-[11px] sm:text-xs leading-snug space-y-1.5 font-normal">
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1.5">Special Program Notes:</p>
          <p>
            *The descriptions herein are summaries only and do not include all terms, conditions and exclusions of the benefits described. Please refer to the actual Guide to Benefits and/or insurance documents for complete details of coverage and exclusions. Coverage is provided through the company named in the Guide to Benefit or on the certificate of insurance.
          </p>
          <p>
            **Health Discount Savings is NOT insurance. Registration/activation is required.
          </p>
          <p>
            ***Rates subject to change without notice.
          </p>
        </div>
      </section>
    </div>
  );
};
