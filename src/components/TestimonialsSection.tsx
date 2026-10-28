import React from 'react';
import { testimonials } from '../data/mockData';
import { Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-[#FAFAFA] dark:bg-[#0B111E] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-[#1C2B4C] dark:text-white mb-8 text-center md:text-left">
          What our customers are saying
        </h2>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100 dark:border-slate-800/80 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5 Yellow Stars */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Customer Name */}
                <h3 className="text-lg font-bold text-[#1C2B4C] dark:text-white mb-3">
                  {item.name}
                </h3>

                {/* Customer Review Text */}
                <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                  {item.review}
                </p>
              </div>

              {/* Customer Location */}
              <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                {item.location}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
