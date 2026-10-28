import React, { useState } from 'react';
import { Facebook, Instagram, Youtube, Linkedin, Copy, Check } from 'lucide-react';
import { BrandLogo } from './common/BrandLogo';

interface FooterProps {
  onOpenContact?: () => void;
  onOpenLocations?: () => void;
  onOpenHelpCenter?: () => void;
  onOpenOpenAccount?: () => void;
  onNavigateFooterPage?: (pageId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLocations,
  onOpenHelpCenter,
  onOpenOpenAccount,
  onNavigateFooterPage,
}) => {
  const [copiedRouting, setCopiedRouting] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    if (onNavigateFooterPage) {
      onNavigateFooterPage(pageId);
    }
  };

  const copyToClipboard = (text: string, type: 'routing' | 'swift') => {
    navigator.clipboard.writeText(text);
    if (type === 'routing') {
      setCopiedRouting(true);
      setTimeout(() => setCopiedRouting(false), 2000);
    } else {
      setCopiedSwift(true);
      setTimeout(() => setCopiedSwift(false), 2000);
    }
  };

  return (
    <footer className="bg-[#21304D] dark:bg-[#070B14] text-white pt-10 pb-8 border-t border-[#2d3f63] dark:border-slate-800 text-xs select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-12 items-start">
          
          {/* Leftmost Brand & FDIC Column (Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[280px]">
            {/* Top Red Mark Emblem & Brand */}
            <div className="pt-1">
              <BrandLogo
                showText
                subtext="Wealth Management"
                variant="auto"
                textClassName="font-extrabold text-base tracking-tight text-white font-sans"
                subtextClassName="text-[9px] uppercase tracking-widest text-slate-300 font-medium"
                imgClassName="h-9 w-auto object-contain"
              />
            </div>

            {/* Bottom Equal Housing Lender + FDIC */}
            <div className="flex items-center space-x-3 text-white mt-auto pt-8">
              {/* Equal Housing Lender Icon */}
              <div className="flex items-center space-x-1.5">
                <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 12h2v2h-2v-2zm0-4h2v2h-2v-2z" />
                </svg>
                <div className="text-[8px] font-bold leading-tight tracking-tight uppercase">
                  EQUAL HOUSING<br />LENDER
                </div>
              </div>

              {/* FDIC text logo */}
              <div className="text-xl font-black tracking-wider text-white pl-1 border-l border-slate-500/50">
                FDIC
              </div>
            </div>
          </div>

          {/* Navigation Columns (Span 6) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[12.5px]">
            
            {/* Column 1: Company */}
            <div>
              <h3 className="text-sm font-normal text-slate-300 mb-3.5">
                Company
              </h3>
              <ul className="space-y-2 text-slate-100 font-normal">
                <li><a href="#bank-regions" onClick={(e) => handleLinkClick(e, 'bank-regions')} className="hover:underline">Bank Regions</a></li>
                <li><a href="#careers" onClick={(e) => handleLinkClick(e, 'careers')} className="hover:underline">Careers</a></li>
                <li><a href="#investor-relations" onClick={(e) => handleLinkClick(e, 'investor-relations')} className="hover:underline">Investor Relations</a></li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenLocations) onOpenLocations();
                      else if (onNavigateFooterPage) onNavigateFooterPage('locations');
                    }}
                    className="hover:underline text-left cursor-pointer"
                  >
                    Locations
                  </button>
                </li>
                <li><a href="#who-we-are" onClick={(e) => handleLinkClick(e, 'who-we-are')} className="hover:underline">Who We Are</a></li>
              </ul>
            </div>

            {/* Column 2: Banking & Lending */}
            <div>
              <h3 className="text-sm font-normal text-slate-300 mb-3.5">
                Banking & Lending
              </h3>
              <ul className="space-y-2 text-slate-100 font-normal">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenOpenAccount) onOpenOpenAccount();
                      else if (onNavigateFooterPage) onNavigateFooterPage('personal-banking');
                    }}
                    className="hover:underline text-left cursor-pointer"
                  >
                    Open an Account
                  </button>
                </li>
                <li><a href="#business-banking" onClick={(e) => handleLinkClick(e, 'business-banking')} className="hover:underline">Business Banking</a></li>
                <li><a href="#business-borrowing" onClick={(e) => handleLinkClick(e, 'business-borrowing')} className="hover:underline">Business Borrowing</a></li>
                <li><a href="#business-solutions" onClick={(e) => handleLinkClick(e, 'business-solutions')} className="hover:underline">Business Solutions</a></li>
                <li><a href="#home-loans" onClick={(e) => handleLinkClick(e, 'home-loans')} className="hover:underline">Home Loans</a></li>
                <li><a href="#investment-advisors" onClick={(e) => handleLinkClick(e, 'investment-advisors')} className="hover:underline">Investment Advisors</a></li>
                <li><a href="#mobile-banking" onClick={(e) => handleLinkClick(e, 'mobile-banking')} className="hover:underline">Online & Mobile Banking</a></li>
                <li><a href="#personal-banking" onClick={(e) => handleLinkClick(e, 'personal-banking')} className="hover:underline">Personal Banking</a></li>
                <li><a href="#personal-borrowing" onClick={(e) => handleLinkClick(e, 'personal-borrowing')} className="hover:underline">Personal Borrowing</a></li>
              </ul>
            </div>

            {/* Column 3: Wealth Management */}
            <div>
              <h3 className="text-sm font-normal text-slate-300 mb-3.5">
                Wealth Management
              </h3>
              <ul className="space-y-2 text-slate-100 font-normal">
                <li><a href="#employee-benefits" onClick={(e) => handleLinkClick(e, 'employee-benefits')} className="hover:underline">Employee Benefits</a></li>
                <li><a href="#estate-management" onClick={(e) => handleLinkClick(e, 'estate-management')} className="hover:underline">Estate Management</a></li>
                <li><a href="#investment-management" onClick={(e) => handleLinkClick(e, 'investment-management')} className="hover:underline">Investment Management</a></li>
                <li><a href="#oil-gas" onClick={(e) => handleLinkClick(e, 'oil-gas')} className="hover:underline">Oil & Gas Lease Management</a></li>
                <li><a href="#real-estate" onClick={(e) => handleLinkClick(e, 'real-estate')} className="hover:underline">Real Estate & Property Management</a></li>
                <li><a href="#trust-management" onClick={(e) => handleLinkClick(e, 'trust-management')} className="hover:underline">Trust Management</a></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h3 className="text-sm font-normal text-slate-300 mb-3.5">
                Legal
              </h3>
              <ul className="space-y-2 text-slate-100 font-normal">
                <li><a href="#policies" onClick={(e) => handleLinkClick(e, 'policies')} className="hover:underline">Policies & Disclosures</a></li>
                <li><a href="#privacy" onClick={(e) => handleLinkClick(e, 'privacy')} className="hover:underline">Privacy Policy</a></li>
                <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')} className="hover:underline">Terms of Use</a></li>
                <li><a href="#transparency" onClick={(e) => handleLinkClick(e, 'transparency')} className="hover:underline">Transparency in Coverage</a></li>
                <li><a href="#sar" onClick={(e) => handleLinkClick(e, 'sar')} className="hover:underline">Summary Annual Report (SAR)</a></li>
                <li><a href="#accessibility" onClick={(e) => handleLinkClick(e, 'accessibility')} className="hover:underline">Report an Accessibility Issue</a></li>
              </ul>
            </div>

          </div>

          {/* Right Card: Resources & Support (Span 4) */}
          <div className="lg:col-span-4 bg-[#C2E2FA] dark:bg-[#152033] text-[#1C2B4C] dark:text-slate-100 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1C2B4C] dark:text-white mb-3">
                Resources & Support
              </h3>

              <ul className="space-y-1.5 mb-5 text-[12px] font-normal text-slate-800 dark:text-slate-300">
                <li>
                  <button onClick={onOpenHelpCenter} className="hover:underline text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <a href="#payment" onClick={(e) => handleLinkClick(e, 'payment')} className="hover:underline">
                    Make a Loan Payment
                  </a>
                </li>
              </ul>

              <div className="space-y-2.5 text-[11px] mb-5">
                <div>
                  <div className="text-gray-700 dark:text-slate-400 font-normal">Contact Us</div>
                  <a href="tel:8556605862" className="font-semibold text-[#1C2B4C] dark:text-blue-400 text-[12px] hover:underline">
                    855-660-5862
                  </a>
                </div>

                {/* Routing Number with Copy Icon */}
                <div
                  onClick={() => copyToClipboard('111301122', 'routing')}
                  className="flex items-start space-x-2 group cursor-pointer"
                >
                  <div className="mt-0.5 text-[#1C2B4C] dark:text-slate-300">
                    {copiedRouting ? <Check className="w-3.5 h-3.5 text-green-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-gray-800 dark:text-slate-300 font-normal text-[11px]">
                      Aurelith Reserve
                    </div>
                    <div className="text-gray-800 dark:text-slate-300 font-normal text-[11px]">
                      Routing Number: <span className="font-semibold text-[#1C2B4C] dark:text-white">111301122</span>
                    </div>
                  </div>
                </div>

                {/* SWIFT / BIC with Copy Icon */}
                <div
                  onClick={() => copyToClipboard('FITEUS41', 'swift')}
                  className="flex items-start space-x-2 group cursor-pointer"
                >
                  <div className="mt-0.5 text-[#1C2B4C] dark:text-slate-300">
                    {copiedSwift ? <Check className="w-3.5 h-3.5 text-green-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-gray-800 dark:text-slate-300 font-normal text-[11px]">
                      Aurelith Reserve Non-Connected
                    </div>
                    <div className="text-gray-800 dark:text-slate-300 font-normal text-[11px]">
                      SWIFT/BIC: <span className="font-semibold text-[#1C2B4C] dark:text-white">FITEUS41</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center space-x-4 pt-2 text-[#1C2B4C] dark:text-slate-300">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" title="Facebook">
                <Facebook className="w-4 h-4 fill-current stroke-none" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" title="LinkedIn">
                <Linkedin className="w-4 h-4 fill-current stroke-none" />
              </a>
            </div>
          </div>

        </div>

        {/* Investment Disclaimers Box */}
        <div className="border border-slate-300/60 rounded-md py-2.5 px-6 text-center text-[11px] text-slate-100 max-w-4xl mx-auto my-8 font-normal">
          <div className="font-semibold mb-1">
            Investment and Insurance Products Are:
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-slate-200">
            <span>• Not a Deposit</span>
            <span>• Not FDIC Insured</span>
            <span>• Not Insured by Any Federal Government Agency</span>
            <span>• Not Guaranteed by The Bank</span>
            <span>• May Lose Value</span>
          </div>
        </div>

        {/* Bottom Copyright & Links */}
        <div className="text-center text-[11px] text-slate-200 space-y-1 font-normal pt-2">
          <div>
            Copyright © 2026, Aurelith Reserve All Rights Reserved.{' '}
            <a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')} className="underline hover:text-white">Terms of Use</a> |{' '}
            <a href="#terms-conditions" onClick={(e) => handleLinkClick(e, 'terms-conditions')} className="underline hover:text-white">Terms and Conditions</a> |{' '}
            <a href="#privacy" onClick={(e) => handleLinkClick(e, 'privacy')} className="underline hover:text-white">Privacy Policy</a> |{' '}
            <a href="#sitemap" onClick={(e) => handleLinkClick(e, 'sitemap')} className="underline hover:text-white">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
