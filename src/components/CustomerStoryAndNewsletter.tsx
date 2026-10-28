import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CustomerStoryAndNewsletterProps {
  onSeeStory: () => void;
}

export const CustomerStoryAndNewsletter: React.FC<CustomerStoryAndNewsletterProps> = ({
  onSeeStory,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-[#F3F5F8] dark:bg-[#0E1726] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left Card: Customer Story (Nancy Nicholson) */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1C2B4C] dark:text-white leading-snug mb-6 sm:mb-8 font-sans">
                "Aurelith Reserve has been our bank for over 30 years..."
              </h2>

              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Profile Photo - Rounded Square */}
                <div className="w-32 h-36 sm:w-36 sm:h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-xs border border-gray-100 dark:border-slate-700 bg-gray-100 dark:bg-slate-800">
                  <img
                    src="https://i.imgur.com/zJBKH9j.jpg"
                    alt="Nancy Nicholson"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://i.imgur.com/zJBKH9j.png";
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Quote details + Button */}
                <div className="flex flex-col justify-between space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                    "... So, really, when it came time to look at the process to buy this building and all, we didn't even consider anybody else."
                  </p>
                  
                  <div className="text-[#1C2B4C] dark:text-white pt-1">
                    <div className="font-bold text-sm sm:text-base leading-snug">
                      Nancy Nicholson
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-400">
                      Co-Owner, Bucketheads
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onSeeStory}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold text-xs sm:text-sm rounded-full shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-98"
                    >
                      See Nancy's Story
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Newsletter Subscription */}
          <div className="relative bg-[#1C2B4C] dark:bg-[#121c2f] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-md overflow-hidden flex flex-col justify-between min-h-[380px] border border-transparent dark:border-slate-800">
            {/* Background ambient image overlay */}
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none flex justify-end">
              <img
                src="https://i.imgur.com/WXuwwzj.png"
                alt="Chris Montoya"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://i.imgur.com/WXuwwzj.jpg") {
                    target.src = "https://i.imgur.com/WXuwwzj.jpg";
                  }
                }}
                className="w-full h-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C2B4C] dark:from-[#121c2f] via-[#1C2B4C]/90 dark:via-[#121c2f]/90 to-transparent" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight mb-3 font-sans">
                Never miss a thing
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6 max-w-lg font-normal">
                Sign up to receive a monthly market update email, courtesy of Chris Montoya of Aurelith Reserve Wealth Management.
              </p>

              {subscribed ? (
                <div className="bg-emerald-950/80 border border-emerald-500/40 p-5 rounded-xl text-center space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-base text-white">Thank you for subscribing!</div>
                  <div className="text-xs text-slate-300">You'll receive monthly market updates directly in your inbox.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs border border-transparent dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs border border-transparent dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs border border-transparent dark:border-slate-700"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-98"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
