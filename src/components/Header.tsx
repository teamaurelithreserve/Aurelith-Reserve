import React, { useState, useRef, useEffect } from 'react';
import { Search, Lock, ChevronDown, ChevronRight, Menu, X, Mail, Copy, User } from 'lucide-react';
import { useBankingAuth } from '../context/BankingAuthContext';
import { BrandLogo } from './common/BrandLogo';
import { UserAvatar } from './common/UserAvatar';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenLocations: () => void;
  onOpenContact: () => void;
  onOpenOpenAccount?: () => void;
  onNavigateHome?: () => void;
  loginOpen?: boolean;
  setLoginOpen?: (open: boolean) => void;
  onOpenSignIn?: () => void;
  onOpenRegister?: () => void;
  onNavigateBanking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogin,
  onOpenLocations,
  onOpenContact,
  onOpenOpenAccount,
  onNavigateHome,
  loginOpen: externalLoginOpen,
  setLoginOpen: externalSetLoginOpen,
  onOpenSignIn,
  onOpenRegister,
  onNavigateBanking,
}) => {
  const { user } = useBankingAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [activeSubSubDropdown, setActiveSubSubDropdown] = useState<string | null>(null);
  
  // Local login dropdown state if not controlled externally
  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const isLoginOpen = externalLoginOpen !== undefined ? externalLoginOpen : internalLoginOpen;

  const toggleLogin = () => {
    onOpenLogin();
  };

  const closeLogin = () => {
    if (externalSetLoginOpen) {
      externalSetLoginOpen(false);
    } else {
      setInternalLoginOpen(false);
    }
  };

  // Login form state inside popover
  const [loginType, setLoginType] = useState('Online Banking');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Click outside to close login dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        closeLogin();
      }
    };
    if (isLoginOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLoginOpen]);

  // Click outside to close nav dropdowns
  useEffect(() => {
    const handleClickOutsideNav = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeAllNav();
      }
    };
    if (activeDropdown || activeSubDropdown || activeSubSubDropdown) {
      document.addEventListener('mousedown', handleClickOutsideNav);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideNav);
    };
  }, [activeDropdown, activeSubDropdown, activeSubSubDropdown]);

  const toggleDropdown = (menu: string) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
      setActiveSubSubDropdown(null);
    } else {
      setActiveDropdown(menu);
      setActiveSubDropdown(null);
      setActiveSubSubDropdown(null);
    }
  };

  const toggleSubDropdown = (sub: string) => {
    if (activeSubDropdown === sub) {
      setActiveSubDropdown(null);
      setActiveSubSubDropdown(null);
    } else {
      setActiveSubDropdown(sub);
      setActiveSubSubDropdown(null);
    }
  };

  const toggleSubSubDropdown = (subSub: string) => {
    if (activeSubSubDropdown === subSub) {
      setActiveSubSubDropdown(null);
    } else {
      setActiveSubSubDropdown(subSub);
    }
  };

  const closeAllNav = () => {
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setActiveSubSubDropdown(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging into ${loginType}...`);
    closeLogin();
  };

  return (
    <header className="w-full bg-white dark:bg-[#0B111E] border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 shadow-2xs transition-colors duration-200">
      {/* Search Bar Slide Down */}
      {searchOpen && (
        <div className="bg-slate-900 text-white py-3 px-4 transition-all duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search Aurelith Reserve (e.g. CD rates, routing number, mortgages)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-full text-sm border border-slate-700 focus:outline-none focus:border-red-500"
                autoFocus
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-slate-400 hover:text-white text-sm font-medium px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 relative">
        {/* Mobile Top Navigation Bar: NO Logo, NO App Name. Clean compact row of functional controls */}
        <div className="flex lg:hidden items-center justify-end h-14 w-full gap-2 sm:gap-2.5 relative">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 min-h-[36px] min-w-[36px] flex items-center justify-center bg-[#BEE0F8] hover:bg-[#A6D6F7] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-[#1C2B4C] dark:text-slate-200 stroke-[2.5]" />
          </button>

          {/* Account Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenOpenAccount) {
                onOpenOpenAccount();
              } else if (onOpenRegister) {
                onOpenRegister();
              }
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[36px] bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs sm:text-sm font-bold rounded-full transition-all duration-150 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center whitespace-nowrap shrink-0"
            aria-label="Open an Account"
          >
            Account
          </button>

          {/* Login / Banking Button */}
          <button
            type="button"
            onClick={() => {
              if (user && onNavigateBanking) {
                onNavigateBanking();
              } else if (onOpenSignIn) {
                onOpenSignIn();
              } else {
                toggleLogin();
              }
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[36px] bg-[#202B48] hover:bg-[#18223B] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-full flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            aria-label={user ? 'Banking Dashboard' : 'Customer Login'}
          >
            {user ? (
              <>
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size="xs"
                  className="ring-1 ring-white/30"
                />
                <span>Banking</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                <span>Login</span>
              </>
            )}
          </button>

          {/* Hamburger Menu Icon (3 horizontal stripes) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#1C2B4C] dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors active:scale-95 shrink-0"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#1C2B4C] dark:text-slate-200 stroke-[2.2]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1C2B4C] dark:text-slate-200 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Desktop Navigation Bar: Extreme Left Logo + Center Nav Links + Extreme Right Controls */}
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center w-full h-16 relative">
          {/* 1. Extreme Left: Aurelith Reserve Logo (Application name removed from desktop top nav) */}
          <div className="flex items-center justify-start shrink-0">
            <a
              href="#"
              onClick={(e) => {
                if (onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              className="flex items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] rounded-md transition-opacity hover:opacity-90"
              aria-label="Aurelith Reserve Home"
            >
              <BrandLogo
                showText={false}
                imgClassName="h-8 xl:h-9 w-auto object-contain"
              />
            </a>
          </div>

          {/* 2. Center: Navigation Items (Personal, Business, Wealth Management, About Us, Locations) */}
          <div className="flex items-center justify-center min-w-0 px-3 xl:px-6">
            <nav
              ref={navRef}
              className="flex items-center gap-4 xl:gap-7 2xl:gap-9 text-[#1C2B4C] dark:text-slate-200 font-semibold text-[13.5px] xl:text-[15px] whitespace-nowrap"
            >
            
            {/* Personal Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('personal')}
                className={`flex items-center gap-1.5 py-2 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer select-none whitespace-nowrap ${activeDropdown === 'personal' ? 'text-[#C8102E] dark:text-red-400' : ''}`}
              >
                <span>Personal</span>
                <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-[#1C2B4C] dark:text-slate-300 transition-transform duration-200 ${activeDropdown === 'personal' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'personal' && (
                <div className="absolute top-full left-0 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                  
                  {/* Banking */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('p-banking')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'p-banking' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Banking</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'p-banking' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'p-banking' && (
                      <div className="absolute top-0 left-full ml-1 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        
                        {/* Checking */}
                        <div>
                          <button
                            onClick={() => toggleSubSubDropdown('p-banking-checking')}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubSubDropdown === 'p-banking-checking' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                          >
                            <span>Checking</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeSubSubDropdown === 'p-banking-checking' ? 'rotate-180' : ''}`} />
                          </button>
                          {activeSubSubDropdown === 'p-banking-checking' && (
                            <div className="bg-white/5 py-1 space-y-0.5 text-xs text-white animate-fadeIn rounded-lg my-1">
                              <button
                                onClick={() => {
                                  closeAllNav();
                                  if (onOpenOpenAccount) onOpenOpenAccount();
                                }}
                                className="w-full text-left block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors cursor-pointer"
                              >
                                Open an Account
                              </button>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Compare Accounts</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Youth Checking Account</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Direct Deposit Switch</a>
                            </div>
                          )}
                        </div>

                        {/* Savings */}
                        <div>
                          <button
                            onClick={() => toggleSubSubDropdown('p-banking-savings')}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubSubDropdown === 'p-banking-savings' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                          >
                            <span>Savings</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeSubSubDropdown === 'p-banking-savings' ? 'rotate-180' : ''}`} />
                          </button>
                          {activeSubSubDropdown === 'p-banking-savings' && (
                            <div className="bg-white/5 py-1 space-y-0.5 text-xs text-white animate-fadeIn rounded-lg my-1">
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Savings Accounts</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Certificates of Deposit (CDs)</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">IRAs</a>
                            </div>
                          )}
                        </div>

                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Online & Mobile Banking</a>
                      </div>
                    )}
                  </div>

                  {/* Borrowing */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('p-borrowing')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'p-borrowing' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Borrowing</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'p-borrowing' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'p-borrowing' && (
                      <div className="absolute top-0 left-full ml-1 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Auto Loans</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Recreational Loans</a>
                        
                        {/* Home Loans */}
                        <div>
                          <button
                            onClick={() => toggleSubSubDropdown('p-borrowing-homeloans')}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubSubDropdown === 'p-borrowing-homeloans' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                          >
                            <span>Home Loans</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeSubSubDropdown === 'p-borrowing-homeloans' ? 'rotate-180' : ''}`} />
                          </button>
                          {activeSubSubDropdown === 'p-borrowing-homeloans' && (
                            <div className="bg-white/5 py-1 space-y-0.5 text-xs text-white animate-fadeIn rounded-lg my-1">
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Mortgage Loans</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Find a Mortgage Lender</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Affordable Loan & Community Investment Grant Programs</a>
                              <a href="#personal" onClick={closeAllNav} className="block px-6 py-1.5 rounded-md text-white/90 hover:bg-white hover:text-[#253353] transition-colors">Home Equity Loans & Lines of Credit</a>
                            </div>
                          )}
                        </div>

                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Personal Loans & Lines of Credit</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Credit Cards</a>
                      </div>
                    )}
                  </div>

                  {/* Solutions */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('p-solutions')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'p-solutions' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Solutions</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'p-solutions' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'p-solutions' && (
                      <div className="absolute top-0 left-full ml-1 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Online & Mobile Banking</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Investment Advisors</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Wealth Management</a>
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('p-resources')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'p-resources' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Resources</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'p-resources' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'p-resources' && (
                      <div className="absolute top-0 left-full ml-1 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Consumer Fraud Prevention Hub</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Articles & Financial Education</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Loan Calculators</a>
                        <a href="#personal" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Make a Loan Payment</a>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Business Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('business')}
                className={`flex items-center gap-1.5 py-2 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer select-none whitespace-nowrap ${activeDropdown === 'business' ? 'text-[#C8102E] dark:text-red-400' : ''}`}
              >
                <span>Business</span>
                <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-[#1C2B4C] dark:text-slate-300 transition-transform duration-200 ${activeDropdown === 'business' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'business' && (
                <div className="absolute top-full left-0 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                  
                  {/* Business Banking */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('b-banking')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'b-banking' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Business Banking</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'b-banking' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'b-banking' && (
                      <div className="absolute top-0 left-full ml-1 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Checking</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Savings</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Business Online Banking</a>
                      </div>
                    )}
                  </div>

                  {/* Business Borrowing */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('b-borrowing')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'b-borrowing' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Business Borrowing</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'b-borrowing' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'b-borrowing' && (
                      <div className="absolute top-0 left-full ml-1 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Business Loans</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Business Credit Cards</a>
                      </div>
                    )}
                  </div>

                  {/* Solutions */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('b-solutions')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'b-solutions' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Solutions</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'b-solutions' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'b-solutions' && (
                      <div className="absolute top-0 left-full ml-1 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Treasury Management</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Merchant Services</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Payment Manager</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Business Online Banking</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Retail Finance Program</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Employee Benefits</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Aurelith Reserve @ Work</a>
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('b-resources')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'b-resources' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Resources</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'b-resources' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'b-resources' && (
                      <div className="absolute top-0 left-full ml-1 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Articles & Financial Education</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Small Business Toolkit</a>
                        <a href="#business" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Business Fraud Prevention Hub</a>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Wealth Management Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('wealth')}
                className={`flex items-center gap-1.5 py-2 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer select-none whitespace-nowrap ${activeDropdown === 'wealth' ? 'text-[#C8102E] dark:text-red-400' : ''}`}
              >
                <span>Wealth Management</span>
                <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-[#1C2B4C] dark:text-slate-300 transition-transform duration-200 ${activeDropdown === 'wealth' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'wealth' && (
                <div className="absolute top-full left-0 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                  <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">About Us</a>
                  <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Our History</a>
                  
                  {/* Our Services */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('w-services')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'w-services' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Our Services</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'w-services' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'w-services' && (
                      <div className="absolute top-0 left-full ml-1 w-64 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Investment Management</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Trust Management</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Estate Management</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Oil & Gas Lease Management</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Real Estate & Property Management</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Employee Benefits</a>
                      </div>
                    )}
                  </div>

                  <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Our Markets</a>
                  <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Meet the Team</a>
                  
                  {/* Resources & Insights */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('w-resources')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'w-resources' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Resources & Insights</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'w-resources' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'w-resources' && (
                      <div className="absolute top-0 left-full ml-1 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Market Updates</a>
                        <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Articles & Financial Education</a>
                      </div>
                    )}
                  </div>

                  <a href="#wealth" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Client Login</a>
                </div>
              )}
            </div>

            {/* About Us Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('about')}
                className={`flex items-center gap-1.5 py-2 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer select-none whitespace-nowrap ${activeDropdown === 'about' ? 'text-[#C8102E] dark:text-red-400' : ''}`}
              >
                <span>About Us</span>
                <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 text-[#1C2B4C] dark:text-slate-300 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 w-60 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                  
                  {/* Why Aurelith Reserve */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('a-why')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'a-why' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Why Aurelith Reserve</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'a-why' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'a-why' && (
                      <div className="absolute top-0 left-full ml-1 w-56 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Our History</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Our Culture</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Our Commitment</a>
                      </div>
                    )}
                  </div>

                  {/* Our Company */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSubDropdown('a-company')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-lg transition-colors text-left ${activeSubDropdown === 'a-company' ? 'bg-white text-[#253353]' : 'text-white/90 hover:bg-white hover:text-[#253353]'}`}
                    >
                      <span>Our Company</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSubDropdown === 'a-company' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeSubDropdown === 'a-company' && (
                      <div className="absolute top-0 left-full ml-1 w-56 bg-[#253353] shadow-2xl rounded-xl border border-[#34466f] p-1.5 z-50 animate-fadeIn text-white space-y-0.5">
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Leadership</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Careers</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Bank Regions</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Locations</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">CRA Public File</a>
                        <a href="#about" onClick={closeAllNav} className="block px-3.5 py-2 text-sm text-white/90 hover:bg-white hover:text-[#253353] rounded-lg transition-colors font-medium">Investor Relations</a>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Locations */}
            <button
              type="button"
              onClick={onOpenLocations}
              className="py-2 hover:text-[#C8102E] dark:hover:text-red-400 transition-colors font-semibold cursor-pointer select-none whitespace-nowrap"
            >
              Locations
            </button>
          </nav>
          </div>

          {/* 3. Extreme Right Action Controls: Account, Login, Contact, Search */}
          <div className="flex items-center justify-end gap-2 xl:gap-2.5 shrink-0">
            {/* Open Account / Dashboard Button */}
            {user ? (
              <button
                type="button"
                onClick={onNavigateBanking}
                className="inline-flex items-center justify-center px-3 py-1.5 xl:px-4 xl:py-2 bg-gradient-to-r from-[#1C2B4C] to-[#2B3E68] hover:from-[#152033] hover:to-[#202E4E] text-white text-xs xl:text-sm font-bold rounded-full transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md gap-1.5 whitespace-nowrap active:scale-95 shrink-0"
              >
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size="xs"
                  className="ring-1 ring-white/30 shrink-0"
                />
                <span className="hidden xl:inline">{user.firstName} (Dashboard)</span>
                <span className="xl:hidden">Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenRegister || onOpenOpenAccount}
                  className="inline-flex items-center justify-center px-3 py-1.5 xl:px-4 xl:py-2 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs xl:text-sm font-bold rounded-full transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md whitespace-nowrap active:scale-95 shrink-0"
                >
                  <span className="hidden xl:inline">Open an Account</span>
                  <span className="xl:hidden">Open Account</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSignIn || toggleLogin}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 xl:px-3.5 xl:py-2 bg-[#202B48] hover:bg-[#182239] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs xl:text-sm font-semibold rounded-full transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md whitespace-nowrap gap-1 active:scale-95 shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Login</span>
                </button>
              </>
            )}

            {/* Contact Us */}
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex items-center justify-center px-2.5 py-1.5 xl:px-3.5 xl:py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-slate-200 text-xs xl:text-sm font-semibold rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap gap-1 shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-[#1C2B4C] dark:text-slate-200 shrink-0" />
              <span className="hidden xl:inline">Contact</span>
            </button>

            {/* Search Button (Final control on extreme right) */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center bg-[#BEE0F8] hover:bg-[#A6D6F7] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#1C2B4C] dark:text-slate-200 stroke-[2.5] shrink-0" />
            </button>
          </div>
        </div>


      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#10192A] border-b border-gray-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {/* Personal */}
          <div className="border-b border-gray-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => toggleDropdown('mobile-personal')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-[#1C2B4C] dark:text-slate-200"
            >
              <span>Personal</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-personal' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'mobile-personal' && (
              <div className="bg-[#253353] rounded-xl my-1.5 py-2 text-white shadow-inner space-y-1">
                {/* Banking */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-p-banking')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Banking</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-p-banking' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-p-banking' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <div>
                        <button
                          onClick={() => toggleSubSubDropdown('mb-p-banking-checking')}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-white/90 font-medium"
                        >
                          <span>Checking</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSubSubDropdown === 'mb-p-banking-checking' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeSubSubDropdown === 'mb-p-banking-checking' && (
                          <div className="pl-5 py-1 space-y-1 text-white/80">
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                if (onOpenOpenAccount) onOpenOpenAccount();
                              }}
                              className="w-full text-left block py-1 cursor-pointer"
                            >
                              Open an Account
                            </button>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Compare Accounts</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Youth Checking Account</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Direct Deposit Switch</a>
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => toggleSubSubDropdown('mb-p-banking-savings')}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-white/90 font-medium"
                        >
                          <span>Savings</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSubSubDropdown === 'mb-p-banking-savings' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeSubSubDropdown === 'mb-p-banking-savings' && (
                          <div className="pl-5 py-1 space-y-1 text-white/80">
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Savings Accounts</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Certificates of Deposit (CDs)</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">IRAs</a>
                          </div>
                        )}
                      </div>

                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Online & Mobile Banking</a>
                    </div>
                  )}
                </div>

                {/* Borrowing */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-p-borrowing')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Borrowing</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-p-borrowing' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-p-borrowing' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Auto Loans</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Recreational Loans</a>
                      <div>
                        <button
                          onClick={() => toggleSubSubDropdown('mb-p-borrowing-homeloans')}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-white/90 font-medium"
                        >
                          <span>Home Loans</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSubSubDropdown === 'mb-p-borrowing-homeloans' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeSubSubDropdown === 'mb-p-borrowing-homeloans' && (
                          <div className="pl-5 py-1 space-y-1 text-white/80">
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Mortgage Loans</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Find a Mortgage Lender</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Affordable Loan & Community Investment Grant Programs</a>
                            <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block py-1">Home Equity Loans & Lines of Credit</a>
                          </div>
                        )}
                      </div>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Personal Loans & Lines of Credit</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Credit Cards</a>
                    </div>
                  )}
                </div>

                {/* Solutions */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-p-solutions')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Solutions</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-p-solutions' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-p-solutions' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Online & Mobile Banking</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Investment Advisors</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Wealth Management</a>
                    </div>
                  )}
                </div>

                {/* Resources */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-p-resources')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Resources</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-p-resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-p-resources' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Consumer Fraud Prevention Hub</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Articles & Financial Education</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Loan Calculators</a>
                      <a href="#personal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Make a Loan Payment</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Business */}
          <div className="border-b border-gray-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => toggleDropdown('mobile-business')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-[#1C2B4C] dark:text-slate-200"
            >
              <span>Business</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-business' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'mobile-business' && (
              <div className="bg-[#253353] rounded-xl my-1.5 py-2 text-white shadow-inner space-y-1">
                {/* Business Banking */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-b-banking')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Business Banking</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-b-banking' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-b-banking' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Checking</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Savings</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Business Online Banking</a>
                    </div>
                  )}
                </div>

                {/* Business Borrowing */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-b-borrowing')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Business Borrowing</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-b-borrowing' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-b-borrowing' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Business Loans</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Business Credit Cards</a>
                    </div>
                  )}
                </div>

                {/* Solutions */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-b-solutions')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Solutions</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-b-solutions' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-b-solutions' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Treasury Management</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Merchant Services</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Payment Manager</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Business Online Banking</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Retail Finance Program</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Employee Benefits</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Aurelith Reserve @ Work</a>
                    </div>
                  )}
                </div>

                {/* Resources */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-b-resources')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Resources</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-b-resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-b-resources' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Articles & Financial Education</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Small Business Toolkit</a>
                      <a href="#business" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Business Fraud Prevention Hub</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wealth Management */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleDropdown('mobile-wealth')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-[#1C2B4C]"
            >
              <span>Wealth Management</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-wealth' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'mobile-wealth' && (
              <div className="bg-[#253353] rounded-xl my-1.5 py-2 text-white shadow-inner space-y-1">
                <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/10">About Us</a>
                <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/10">Our History</a>
                
                {/* Our Services */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-w-services')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Our Services</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-w-services' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-w-services' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Investment Management</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Trust Management</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Estate Management</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Oil & Gas Lease Management</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Real Estate & Property Management</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Employee Benefits</a>
                    </div>
                  )}
                </div>

                <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/10">Our Markets</a>
                <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/10">Meet the Team</a>
                
                {/* Resources & Insights */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-w-resources')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Resources & Insights</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-w-resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-w-resources' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Market Updates</a>
                      <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Articles & Financial Education</a>
                    </div>
                  )}
                </div>

                <a href="#wealth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-white hover:bg-white/10">Client Login</a>
              </div>
            )}
          </div>

          {/* About Us */}
          {/* About Us */}
          <div className="border-b border-gray-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => toggleDropdown('mobile-about')}
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-[#1C2B4C] dark:text-slate-200"
            >
              <span>About Us</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-about' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'mobile-about' && (
              <div className="bg-[#253353] rounded-xl my-1.5 py-2 text-white shadow-inner space-y-1">
                {/* Why Aurelith Reserve */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-a-why')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Why Aurelith Reserve</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-a-why' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-a-why' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Our History</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Our Culture</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Our Commitment</a>
                    </div>
                  )}
                </div>

                {/* Our Company */}
                <div>
                  <button
                    onClick={() => toggleSubDropdown('mb-a-company')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white/10"
                  >
                    <span>Our Company</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSubDropdown === 'mb-a-company' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSubDropdown === 'mb-a-company' && (
                    <div className="bg-white/10 mx-2 rounded-lg py-1 space-y-1 text-xs">
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Leadership</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Careers</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90 font-medium">Bank Regions</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Locations</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">CRA Public File</a>
                      <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-white/90">Investor Relations</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenLocations(); }}
            className="block w-full text-left py-2 text-base font-semibold text-[#1C2B4C] dark:text-slate-200 border-b border-gray-100 dark:border-slate-800"
          >
            Locations
          </button>
          <div className="pt-2 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateBanking) onNavigateBanking();
                }}
                className="w-full py-2.5 bg-[#1C2B4C] dark:bg-slate-800 text-white font-semibold rounded-full text-center flex items-center justify-center space-x-2"
              >
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size="xs"
                  className="ring-1 ring-white/30"
                />
                <span>Go to Banking Dashboard ({user.firstName})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenRegister) onOpenRegister();
                    else if (onOpenOpenAccount) onOpenOpenAccount();
                  }}
                  className="w-full py-2.5 bg-[#C8102E] text-white font-semibold rounded-full text-center cursor-pointer"
                >
                  Open an Account
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenSignIn) onOpenSignIn();
                    else toggleLogin();
                  }}
                  className="w-full py-2.5 bg-[#202B48] dark:bg-slate-800 text-white font-semibold rounded-full text-center flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Customer Sign In</span>
                </button>
              </>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-slate-200 font-semibold rounded-full text-center cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

