import React, { useState } from 'react';

interface ScamAlertBannerProps {
  onGetHelp?: () => void;
}

export const ScamAlertBanner: React.FC<ScamAlertBannerProps> = ({ onGetHelp }) => {
  const [imgSrc, setImgSrc] = useState('https://i.imgur.com/xP7uhxb.png');

  const handleImgError = () => {
    if (imgSrc === 'https://i.imgur.com/xP7uhxb.png') {
      setImgSrc('https://i.imgur.com/xP7uhxb.jpg');
    } else if (imgSrc === 'https://i.imgur.com/xP7uhxb.jpg') {
      setImgSrc('https://imgur.com/xP7uhxb.png');
    }
  };

  return (
    <section className="w-full bg-[#02050e] relative overflow-hidden text-white py-10 sm:py-12 lg:py-14">
      {/* Background Graphic Image Overlay */}
      <div className="absolute inset-0 z-0 flex justify-end overflow-hidden pointer-events-none">
        <img
          src={imgSrc}
          alt="Security background"
          onError={handleImgError}
          className="h-full w-full sm:w-auto object-cover object-right opacity-90 min-w-[50%]"
        />
      </div>

      {/* Subtle Gradient overlay on left to guarantee text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#02050e] via-[#02050e]/95 sm:via-[#02050e]/80 to-transparent pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl text-left space-y-3 sm:space-y-4">
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Did you fall victim to a scam?
          </h2>

          {/* Body Description */}
          <p className="text-slate-200 text-sm sm:text-base lg:text-[15.5px] leading-relaxed font-normal max-w-xl">
            If you've been a victim of fraud, contact us at{' '}
            <a
              href="mailto:abuse@aurelithreserve.com"
              className="underline font-medium text-white hover:text-red-400 transition-colors"
            >
              abuse@aurelithreserve.com
            </a>{' '}
            or visit our Fraud Prevention Hub for resources on how to keep yourself safe from fraud.
          </p>

          {/* Action Button */}
          <div className="pt-2 sm:pt-3">
            <button
              onClick={onGetHelp}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white hover:bg-slate-100 text-[#02050e] font-semibold text-sm rounded-full shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              Get Help Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


