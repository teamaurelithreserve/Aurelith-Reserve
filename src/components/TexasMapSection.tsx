import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { texasBranches } from '../data/mockData';

interface TexasMapSectionProps {
  onFindLocation: () => void;
}

export const TexasMapSection: React.FC<TexasMapSectionProps> = ({ onFindLocation }) => {
  const [activePin, setActivePin] = useState<string | null>(null);

  // Approximate relative pin positions on Texas map SVG (percentages)
  const pinPositions = [
    { id: '1', top: '22%', left: '30%', city: 'Amarillo / Panhandle' },
    { id: '2', top: '35%', left: '38%', city: 'Lubbock' },
    { id: '3', top: '48%', left: '46%', city: 'Abilene' },
    { id: '4', top: '46%', left: '58%', city: 'Fort Worth' },
    { id: '5', top: '50%', left: '60%', city: 'Dallas Metro' },
    { id: '6', top: '52%', left: '55%', city: 'Weatherford' },
    { id: '7', top: '55%', left: '52%', city: 'Stephenville' },
    { id: '8', top: '58%', left: '53%', city: 'Glen Rose' },
    { id: '9', top: '60%', left: '48%', city: 'Rising Star' },
    { id: '10', top: '62%', left: '42%', city: 'San Angelo' },
    { id: '11', top: '68%', left: '58%', city: 'Austin' },
    { id: '12', top: '75%', left: '62%', city: 'San Antonio' },
    { id: '13', top: '72%', left: '76%', city: 'Houston / Gulf Coast' },
    { id: '14', top: '52%', left: '78%', city: 'Piney Woods / East TX' },
    { id: '15', top: '62%', left: '22%', city: 'El Paso / Franklin Mts' },
  ];

  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC] dark:bg-[#10192A] border-y border-gray-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Texas Map Graphic with Red Pins */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-[1.15/1] bg-white dark:bg-[#152033] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-center">
              
              {/* Texas SVG Map Outline */}
              <div className="relative w-full h-full flex items-center justify-center">
                <svg
                  viewBox="0 0 800 700"
                  className="w-full h-full text-slate-200 dark:text-slate-800 fill-slate-100 dark:fill-[#10192A] stroke-slate-300 dark:stroke-slate-700 stroke-[4]"
                >
                  {/* Detailed Texas State Path */}
                  <path d="M 210,50 L 360,50 L 360,250 L 610,250 L 620,290 L 680,310 L 710,340 L 730,420 L 690,460 L 650,470 L 620,530 L 590,560 L 520,620 L 460,650 L 420,620 L 390,580 L 350,540 L 320,520 L 290,480 L 260,450 L 220,410 L 190,390 L 140,380 L 80,380 L 40,360 L 20,340 L 180,340 L 210,250 Z" />
                </svg>

                {/* Pin Markers Clusters */}
                {pinPositions.map((pin) => (
                  <div
                    key={pin.id}
                    style={{ top: pin.top, left: pin.left }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
                    onMouseEnter={() => setActivePin(pin.id)}
                    onMouseLeave={() => setActivePin(null)}
                    onClick={onFindLocation}
                  >
                    <div className="relative flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#C8102E] fill-[#C8102E] drop-shadow-sm transform hover:scale-125 transition-transform" />
                      
                      {/* Active Tooltip */}
                      {activePin === pin.id && (
                        <div className="absolute bottom-full mb-2 whitespace-nowrap bg-[#1C2B4C] dark:bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg z-20 animate-fadeIn border border-transparent dark:border-slate-700">
                          {pin.city} Branch
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1C2B4C] dark:border-t-slate-900" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Badge Overlay: 79 Locations */}
                <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#10192A]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl shadow-xs border border-gray-200 dark:border-slate-700 flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C8102E] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#1C2B4C] dark:text-slate-200">79 Texas Branches</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Copywriting */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1C2B4C] dark:text-white leading-tight mb-3">
              Statewide strength. Hometown service.
            </h2>

            <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-200 mb-2.5">
              Because when your bank is part of your community, everything is better.
            </p>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-6">
              From the Panhandle to the Gulf Coast, from the Franklin Mountains to the Piney Woods, Aurelith Reserve has 79 branches across the great state of Texas for your convenience. Stop by and say "hi" at one of our locations.
            </p>

            <div className="flex justify-center sm:justify-start">
              <button
                onClick={onFindLocation}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold text-xs sm:text-sm rounded-full shadow-md transition-all duration-200 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-2" />
                Find a Location Near You
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
