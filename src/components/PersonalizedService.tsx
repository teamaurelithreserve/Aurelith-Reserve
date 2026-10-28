import React from 'react';
import { serviceFeatures } from '../data/mockData';
import { ChevronRight } from 'lucide-react';

interface PersonalizedServiceProps {
  onOpenAccount: () => void;
  onServiceClick: (serviceId: string) => void;
}

// Custom 1:1 SVG Icon Components matching the requested photos
const PersonalBankingIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7 text-[#1C2B4C]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* Tail */}
    <path
      d="M 32 50 C 25 50 21 44 24 41 C 27 38 31 43 28 47 C 27 49 29 52 33 53"
      fill="none"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    {/* Body, Ear, Snout, Legs, with evenodd cutouts for Coin Slot and Eye */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 32 54 C 32 40 43 32 58 32 C 63 32 68 33 72 36 L 79 25 C 80 24 82 25 82 27 L 80 39 C 84 42 86 47 86 53 L 95 53 C 97 53 98 55 98 57 L 98 63 C 98 65 97 66 95 66 L 86 66 C 84 72 79 77 72 79 L 72 87 C 72 89 70 90 68 90 L 59 90 C 56 90 55 89 55 87 L 55 80 C 53 80 50 80 47 80 L 47 87 C 47 89 45 90 43 90 L 34 90 C 32 90 31 89 31 87 L 31 76 C 28 73 26 69 25 65 C 30 65 32 60 32 54 Z
         M 44 37 H 60 V 41 H 44 Z
         M 68 47 A 3.5 3.5 0 1 0 75 47 A 3.5 3.5 0 1 0 68 47 Z"
    />
  </svg>
);

const HomeLoansIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7 text-[#1C2B4C]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* Chimney */}
    <rect x="62" y="27" width="9" height="18" rx="1" />
    <rect x="60" y="24" width="13" height="4" rx="1" />
    {/* House Structure with Door & Window Cutouts */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 50 19 L 14 48 C 12.5 49.2 13.5 51.5 15.5 51.5 L 22 51.5 L 22 85 C 22 87 24 88 26 88 L 74 88 C 76 88 78 87 78 85 L 78 51.5 L 84.5 51.5 C 86.5 51.5 87.5 49.2 86 48 Z
         M 33 55 H 48 V 88 H 33 Z
         M 54 55 H 69 V 70 H 54 Z"
    />
  </svg>
);

const CommercialBankingIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7 text-[#1C2B4C]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* Pediment with Circle Cutout */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 50 20 L 15 40 H 85 Z
         M 45.5 32 A 4.5 4.5 0 1 0 54.5 32 A 4.5 4.5 0 1 0 45.5 32 Z"
    />
    {/* Architrave */}
    <rect x="18" y="42" width="64" height="6" rx="1" />
    {/* 3 Columns */}
    <rect x="25" y="50" width="11" height="25" rx="1" />
    <rect x="44.5" y="50" width="11" height="25" rx="1" />
    <rect x="64" y="50" width="11" height="25" rx="1" />
    {/* Base Steps */}
    <rect x="20" y="77" width="60" height="4" rx="1" />
    <rect x="16" y="82" width="68" height="4" rx="1" />
    <rect x="12" y="87" width="76" height="4" rx="1" />
  </svg>
);

const WealthManagementIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7 text-[#1C2B4C]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* Vertical Bar Chart */}
    <rect x="24" y="58" width="8.5" height="24" rx="1" />
    <rect x="36.5" y="47" width="8.5" height="35" rx="1" />
    <rect x="49" y="54" width="8.5" height="28" rx="1" />
    <rect x="61.5" y="41" width="8.5" height="41" rx="1" />
    <rect x="74" y="34" width="8.5" height="48" rx="1" />
    {/* Baseline */}
    <rect x="18" y="84" width="64" height="4" rx="1" />
    {/* Upward Line Graph with Arrowhead */}
    <path
      d="M 20 52 L 36 34 L 51 46 L 76 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 60 23 H 78 V 41"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PersonalizedService: React.FC<PersonalizedServiceProps> = ({
  onOpenAccount,
  onServiceClick,
}) => {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'personal':
        return <PersonalBankingIcon className="w-7 h-7 text-[#1C2B4C] dark:text-slate-200" />;
      case 'home':
        return <HomeLoansIcon className="w-7 h-7 text-[#1C2B4C] dark:text-slate-200" />;
      case 'commercial':
        return <CommercialBankingIcon className="w-7 h-7 text-[#1C2B4C] dark:text-slate-200" />;
      case 'wealth':
        return <WealthManagementIcon className="w-7 h-7 text-[#1C2B4C] dark:text-slate-200" />;
      default:
        return <PersonalBankingIcon className="w-7 h-7 text-[#1C2B4C] dark:text-slate-200" />;
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#0B111E] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Portrait Photo with Rounded Corners */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md lg:max-w-none h-[360px] sm:h-[420px] lg:h-full rounded-[24px] overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800">
              <img
                src="https://i.imgur.com/rbNuyua.jpg"
                alt="Personal Banking Advisor"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.imgur.com/rbNuyua.png";
                }}
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: Content + 2x2 Services Grid */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1C2B4C] dark:text-white leading-tight tracking-tight mb-3">
              Service that feels personal. Tools that feel effortless.
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
              Enjoy the convenience of best-in-class digital tools combined with a team that knows you by name. From everyday banking to home loans, commercial banking, and wealth management, we provide comprehensive solutions tailored to your needs.
            </p>

            {/* 2x2 Grid of Services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {serviceFeatures.map((service) => (
                <div key={service.id} className="flex flex-col items-start group">
                  {/* Icon Circle */}
                  <div className="w-12 h-12 rounded-full bg-[#BCE0FD] dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#A8D7FD] dark:group-hover:bg-slate-700 transition-colors shrink-0">
                    {getServiceIcon(service.iconName)}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1C2B4C] dark:text-white mb-1.5">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-slate-400 leading-normal mb-2.5">
                    {service.description}
                  </p>

                  {/* Link with chevron */}
                  <button
                    onClick={() => onServiceClick(service.id)}
                    className="inline-flex items-center text-xs font-bold text-[#1C2B4C] dark:text-slate-200 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors group/link cursor-pointer"
                  >
                    <span>{service.linkText}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom CTA Button */}
            <div className="flex justify-center sm:justify-start">
              <button
                onClick={onOpenAccount}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-full shadow-md transition-all duration-200 cursor-pointer"
              >
                Open an Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
