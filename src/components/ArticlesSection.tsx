import React, { useState } from 'react';
import { articles } from '../data/mockData';
import { Article } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ArticlesSectionProps {
  onSelectArticle: (article: Article) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ onSelectArticle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch and Drag swipe state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1));
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX;
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const minSwipeDistance = 40;

    if (dragOffset < -minSwipeDistance) {
      handleNext();
    } else if (dragOffset > minSwipeDistance) {
      handlePrev();
    }
    setDragOffset(0);
  };

  return (
    <section className="py-12 md:py-16 bg-[#F3F5F8] dark:bg-[#0B111E] select-none overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title + Red Navigation Buttons */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C2B4C] dark:text-white font-serif tracking-tight">
            Our Latest Articles
          </h2>

          {/* Red Circle Arrow Navigation Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handlePrev}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C8102E] hover:bg-[#A00B22] text-white flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer active:scale-95"
              aria-label="Previous Articles"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C8102E] hover:bg-[#A00B22] text-white flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer active:scale-95"
              aria-label="Next Articles"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Carousel Window */}
        <div 
          className="overflow-hidden w-full cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => {
            if (isDragging) handleDragEnd();
          }}
        >
          <div 
            className={`flex w-full ${
              isDragging ? 'transition-none' : 'transition-transform duration-500 ease-in-out'
            } gap-6 lg:gap-8 [--cols:1] md:[--cols:2] lg:[--cols:3] [--gap:24px] lg:[--gap:32px]`}
            style={{
              transform: isDragging
                ? `translateX(calc(-${currentIndex} * (100% + var(--gap)) / var(--cols) + ${dragOffset}px))`
                : `translateX(calc(-${currentIndex} * (100% + var(--gap)) / var(--cols)))`
            }}
          >
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  if (Math.abs(dragOffset) < 10) {
                    onSelectArticle(article);
                  }
                }}
                className="w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-64px)/3)] flex-shrink-0 bg-[#202C48] dark:bg-[#152033] rounded-[22px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer border border-[#202C48] dark:border-slate-800 h-[450px] sm:h-[470px]"
              >
                {/* Card Image Area with Top Right White Badge & Bottom Gradient Fading (Crops out baked-in bottom text from image assets) */}
                <div className="relative h-[210px] sm:h-[225px] w-full overflow-hidden bg-[#202C48] dark:bg-[#152033]">
                  <img
                    src={article.imageUrl}
                    alt={article.imageAlt}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith('.png')) {
                        target.src = target.src.replace('.png', '.jpg');
                      } else if (target.src.endsWith('.jpg')) {
                        target.src = target.src.replace('.jpg', '');
                      }
                    }}
                    className="w-full h-full object-cover object-top pointer-events-none group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Dark Navy Gradient Overlay smoothly fading photo into card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202C48] dark:from-[#152033] via-[#202C48]/40 dark:via-[#152033]/40 to-transparent pointer-events-none" />
                </div>

                {/* Card Body Content (Dark Navy `#202C48` or `#152033`) */}
                <div className="px-6 pb-6 pt-4 flex-1 flex flex-col justify-between text-white bg-[#202C48] dark:bg-[#152033] relative z-10">
                  <div>
                    {/* Article Date */}
                    <div className="text-[11px] font-normal text-slate-300 mb-1.5">
                      {article.date}
                    </div>

                    {/* Article Title */}
                    <h3 className="text-base sm:text-lg font-bold leading-snug text-white mb-2 group-hover:text-red-300 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="inline-flex items-center text-xs font-bold text-white group-hover:text-red-300 transition-colors mt-3">
                    <span>Read More</span>
                    <span className="ml-1 text-xs font-semibold">&gt;</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slider Pagination Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentIndex(0)}
            className={`transition-all duration-300 cursor-pointer ${
              currentIndex === 0
                ? 'w-7 h-2 bg-[#202C48] dark:bg-slate-300 rounded-full'
                : 'w-2.5 h-2.5 border-[1.5px] border-[#202C48] dark:border-slate-500 rounded-full bg-transparent hover:bg-[#202C48]/20'
            }`}
            aria-label="Go to position 1"
          />
          <button
            onClick={() => setCurrentIndex(1)}
            className={`transition-all duration-300 cursor-pointer ${
              currentIndex > 0
                ? 'w-7 h-2 bg-[#202C48] dark:bg-slate-300 rounded-full'
                : 'w-2.5 h-2.5 border-[1.5px] border-[#202C48] dark:border-slate-500 rounded-full bg-transparent hover:bg-[#202C48]/20'
            }`}
            aria-label="Go to position 2"
          />
        </div>

      </div>
    </section>
  );
};


