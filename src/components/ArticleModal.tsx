import React from 'react';
import { X, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Article } from '../types';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="relative h-64 w-full bg-slate-900">
          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="bg-[#C8102E] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
              {article.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-2 leading-snug">
              {article.title}
            </h2>
            <div className="flex items-center space-x-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{article.date}</span>
              <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{article.readTime || '4 min read'}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">
          <p className="font-semibold text-slate-900 dark:text-white text-base">
            {article.excerpt}
          </p>

          <p>
            {article.fullContent || 'Aurelith Reserve Wealth Management provides tailored financial strategies designed to meet your specific goals and safeguard your legacy. Contact our experienced wealth advisors today to learn more about our complete solutions.'}
          </p>

          <div className="bg-[#BEE0F8] dark:bg-[#101b2d] p-6 rounded-2xl text-[#1C2B4C] dark:text-slate-100 mt-6 border border-transparent dark:border-slate-800">
            <h4 className="font-bold text-base mb-2 text-[#1C2B4C] dark:text-white">Speak with an Aurelith Reserve Wealth Advisor</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
              Schedule a personalized consultation with our team to discuss your financial roadmap.
            </p>
            <button
              onClick={() => { alert('Thank you! A Wealth Advisor will contact you shortly.'); onClose(); }}
              className="px-6 py-2.5 bg-[#1C2B4C] dark:bg-[#C8102E] hover:bg-[#152033] dark:hover:bg-[#A00B22] text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              Request Consultation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
