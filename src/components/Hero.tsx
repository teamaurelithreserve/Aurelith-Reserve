import React, { useState, useEffect } from 'react';

interface HeroProps {
  onLearnMore?: () => void;
  onOpenLocations?: () => void;
  onOpenCalculator?: () => void;
}

interface SlideButton {
  label: string;
  action: 'learnMore' | 'locations' | 'smallBusiness' | 'cds' | 'apply';
  variant: 'primary' | 'secondary';
}

interface Slide {
  id: number;
  imageUrl: string;
  mobileImageUrl: string;
  mobileImageFallbackUrl: string;
  fallbackUrl: string;
  title: string;
  paragraphs: string[];
  buttons: SlideButton[];
}

const slides: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://i.imgur.com/Dfe956u.jpg',
    mobileImageUrl: 'https://i.imgur.com/PjmCbqK.png',
    mobileImageFallbackUrl: 'https://i.imgur.com/PjmCbqK.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000',
    title: 'Introducing Aurelith Reserve Wealth Management',
    paragraphs: [
      'Aurelith Reserve Trust is now Aurelith Reserve Wealth Management.',
      'This clarification reflects what we have always been: a full-service wealth partner capable of meeting clients at every stage of life, with the same people, the same values, and the same commitment to Texas communities that has defined us since 1927.'
    ],
    buttons: [
      { label: 'Learn More', action: 'learnMore', variant: 'primary' }
    ]
  },
  {
    id: 2,
    imageUrl: 'https://i.imgur.com/ho8n7MZ.jpg',
    mobileImageUrl: 'https://i.imgur.com/gYc3u94.png',
    mobileImageFallbackUrl: 'https://i.imgur.com/gYc3u94.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2000',
    title: 'Start the job. Switch the deposit.',
    paragraphs: [
      'Set up your direct deposit in minutes using 1Click — right from your phone or computer. No paperwork, no delays, just faster access to your money.'
    ],
    buttons: [
      { label: 'Learn More', action: 'learnMore', variant: 'primary' }
    ]
  },
  {
    id: 3,
    imageUrl: 'https://i.imgur.com/Je5ZyiY.jpg',
    mobileImageUrl: 'https://i.imgur.com/gBVszpg.png',
    mobileImageFallbackUrl: 'https://i.imgur.com/gBVszpg.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000',
    title: 'Small business banking built for speed',
    paragraphs: [
      'Accept payments with Tap2Pay, manage multiple invoices, and access funding through Autobooks Capital, all inside digital banking.'
    ],
    buttons: [
      { label: 'Explore Small Business Solutions', action: 'smallBusiness', variant: 'primary' }
    ]
  },
  {
    id: 4,
    imageUrl: 'https://i.imgur.com/JclHSl5.jpg',
    mobileImageUrl: 'https://i.imgur.com/pyWG7tR.png',
    mobileImageFallbackUrl: 'https://i.imgur.com/pyWG7tR.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=2000',
    title: 'Grow your savings with confidence',
    paragraphs: [
      "Certificates of Deposit offer a dependable way to grow your savings while planning for what's ahead. Stop by your local Aurelith Reserve location to get started."
    ],
    buttons: [
      { label: 'Learn More About CDs', action: 'cds', variant: 'primary' },
      { label: 'Find a Location', action: 'locations', variant: 'secondary' }
    ]
  },
  {
    id: 5,
    imageUrl: 'https://i.imgur.com/GoPtZZP.jpg',
    mobileImageUrl: 'https://i.imgur.com/ZjjXjwZ.png',
    mobileImageFallbackUrl: 'https://i.imgur.com/ZjjXjwZ.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000',
    title: 'Where financing meets fun',
    paragraphs: [
      'Turn your weekend plans into long-term memories with our flexible recreational loans.'
    ],
    buttons: [
      { label: 'Apply Today!', action: 'apply', variant: 'primary' }
    ]
  }
];

// Append slide 0 to the end for seamless infinite leftward loop
const extendedSlides = [...slides, slides[0]];

export const Hero: React.FC<HeroProps> = ({ onLearnMore, onOpenLocations, onOpenCalculator }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [mobileImgSources, setMobileImgSources] = useState<Record<number, string>>({});

  // Manual scroll / drag state for mobile & desktop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Auto-slide left every 7 seconds (7000ms)
  useEffect(() => {
    if (isPaused || isDragging) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 7000);

    return () => clearInterval(timer);
  }, [isPaused, isDragging]);

  // Handle seamless infinite loop reset when transition ends on clone slide
  const handleTransitionEnd = () => {
    if (currentIndex >= slides.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    } else if (currentIndex < 0) {
      setIsTransitioning(false);
      setCurrentIndex(slides.length - 1);
    }
  };

  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'locations':
        if (onOpenLocations) onOpenLocations();
        else alert('Locating Aurelith Reserve branches in Texas...');
        break;
      case 'cds':
        alert('Explore Aurelith Reserve CD interest rates and deposit options.');
        break;
      case 'smallBusiness':
        alert('Discover Aurelith Reserve Commercial Banking and Small Business solutions.');
        break;
      case 'apply':
        if (onOpenCalculator) onOpenCalculator();
        else alert('Starting your Aurelith Reserve Home Loan Application...');
        break;
      case 'learnMore':
      default:
        if (onLearnMore) onLearnMore();
        else alert('Learn more about Aurelith Reserve Wealth Management.');
        break;
    }
  };

  const handleImageError = (slideId: number) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }));
  };

  const getMobileImgSrc = (slide: Slide) => {
    return mobileImgSources[slide.id] || slide.mobileImageUrl;
  };

  const handleMobileImageError = (slide: Slide) => {
    setMobileImgSources((prev) => {
      const current = prev[slide.id] || slide.mobileImageUrl;
      if (current.endsWith('.png')) {
        return { ...prev, [slide.id]: slide.mobileImageFallbackUrl };
      }
      if (current === slide.mobileImageFallbackUrl) {
        return { ...prev, [slide.id]: slide.imageUrl };
      }
      return { ...prev, [slide.id]: slide.fallbackUrl };
    });
  };

  // Drag / Swipe handlers for both desktop mouse and mobile touch
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
    setIsPaused(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX;
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
    const minSwipeDistance = 40;

    if (dragOffset < -minSwipeDistance) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (dragOffset > minSwipeDistance) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
    }
    setDragOffset(0);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#1C2B4C] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (isDragging) handleDragEnd();
        setIsPaused(false);
      }}
    >
      {/* DESKTOP CAROUSEL VIEW (only visible on lg screens) */}
      <div
        className="hidden lg:block relative min-h-[440px] lg:min-h-[480px] cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
      >
        <div
          className={`flex w-full h-full ${
            isTransitioning && !isDragging ? 'transition-transform duration-700 ease-in-out' : 'transition-none'
          }`}
          style={{
            transform: isDragging
              ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
              : `translateX(-${currentIndex * 100}%)`
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, idx) => {
            const isError = imageErrors[slide.id];
            const imgSrc = isError ? slide.fallbackUrl : slide.imageUrl;

            return (
              <div
                key={`desktop-${slide.id}-${idx}`}
                className="relative min-w-full flex-shrink-0 min-h-[440px] lg:min-h-[480px] flex flex-col justify-end"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-white dark:bg-[#0B111E]">
                  <img
                    src={imgSrc}
                    alt={`Hero slide ${slide.id}`}
                    onError={() => handleImageError(slide.id)}
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </div>

                {/* Desktop Buttons Overlay */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-12 lg:pb-16 w-full">
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {slide.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleButtonClick(btn.action)}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 ${
                          btn.variant === 'primary'
                            ? 'bg-[#C8102E] hover:bg-[#A00B22] text-white border border-transparent'
                            : 'bg-[#1C2B4C] hover:bg-[#152033] text-white border border-transparent shadow-sm'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE HERO CAROUSEL VIEW (Visible on screens < lg) */}
      <div
        className="block lg:hidden relative w-full overflow-hidden bg-[#1C2B4C] select-none text-white cursor-grab active:cursor-grabbing"
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
      >
        <div
          className={`flex w-full ${
            isTransitioning && !isDragging ? 'transition-transform duration-500 ease-in-out' : 'transition-none'
          }`}
          style={{
            transform: isDragging
              ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
              : `translateX(-${currentIndex * 100}%)`
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, idx) => {
            const imgSrc = getMobileImgSrc(slide);

            return (
              <div
                key={`mobile-${slide.id}-${idx}`}
                className="w-full min-w-full max-w-full flex-shrink-0 flex-grow-0 flex flex-col bg-[#1C2B4C] text-white"
              >
                {/* Image Banner Container - Full Bleed Cover with Smooth Bottom Gradient */}
                <div className="relative w-full h-[250px] sm:h-[310px] bg-[#1C2B4C] overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={slide.title}
                    onError={() => handleMobileImageError(slide)}
                    className="w-full h-full object-cover object-top pointer-events-none"
                  />
                  {/* Smooth Gradient Overlay fading image into dark navy background */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1C2B4C] via-[#1C2B4C]/80 to-transparent pointer-events-none" />
                </div>

                {/* Content Container - Exact visual layout, fonts, and spacing */}
                <div className="relative z-10 px-6 sm:px-8 -mt-10 pb-6 sm:pb-8 bg-[#1C2B4C] flex flex-col space-y-4 text-left">
                  <div className="space-y-3">
                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-[1.15]">
                      {slide.title}
                    </h2>

                    {/* Paragraph Writeups */}
                    <div className="space-y-2 text-slate-100 text-sm sm:text-base font-normal leading-relaxed">
                      {slide.paragraphs.map((pText, pIdx) => (
                        <p key={pIdx}>{pText}</p>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-3">
                    {slide.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleButtonClick(btn.action)}
                        className={`w-full py-3.5 sm:py-4 px-6 rounded-full font-medium text-center text-sm sm:text-base transition-all duration-150 cursor-pointer shadow-md active:scale-98 ${
                          btn.variant === 'primary'
                            ? 'bg-[#C8102E] hover:bg-[#A00B22] text-white'
                            : 'bg-transparent border border-white hover:bg-white/10 text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

