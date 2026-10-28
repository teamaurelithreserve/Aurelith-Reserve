import React from 'react';
import { resourceCards } from '../data/mockData';
import { Calculator, ShieldAlert, HelpCircle, ChevronRight } from 'lucide-react';

interface ResourcesSectionProps {
  onOpenCalculators: () => void;
  onOpenFraudModal: () => void;
  onOpenHelpCenter: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  onOpenCalculators,
  onOpenFraudModal,
  onOpenHelpCenter,
}) => {
  const getResourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculator':
        return <Calculator className="w-5 h-5 text-[#1C2B4C] dark:text-sky-300" />;
      case 'shield':
        return <ShieldAlert className="w-5 h-5 text-[#1C2B4C] dark:text-sky-300" />;
      case 'help':
        return <HelpCircle className="w-5 h-5 text-[#1C2B4C] dark:text-sky-300" />;
      default:
        return <HelpCircle className="w-5 h-5 text-[#1C2B4C] dark:text-sky-300" />;
    }
  };

  const handleCardClick = (id: string) => {
    if (id === 'loan-calculators') onOpenCalculators();
    else if (id === 'fraud-articles') onOpenFraudModal();
    else onOpenHelpCenter();
  };

  return (
    <section className="py-12 md:py-16 bg-[#BEE0F8] dark:bg-[#0E1726] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1C2B4C] dark:text-white mb-8">
          Resources
        </h2>

        {/* 3 Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {resourceCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start border border-white/60 dark:border-slate-800/80 group cursor-pointer"
            >
              {/* Icon Circle */}
              <div className="w-10 h-10 rounded-full bg-[#D8E8F5] dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-[#BFE0F7] dark:group-hover:bg-slate-700 transition-colors">
                {getResourceIcon(card.iconName)}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#1C2B4C] dark:text-white mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-8 flex-1 font-normal">
                {card.description}
              </p>

              {/* Link */}
              <div className="inline-flex items-center text-xs font-bold text-[#1C2B4C] dark:text-sky-400 group-hover:text-[#C8102E] dark:group-hover:text-red-400 transition-colors mt-auto">
                <span>{card.linkText}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
