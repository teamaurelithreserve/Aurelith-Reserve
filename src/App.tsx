import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PersonalizedService } from './components/PersonalizedService';
import { TexasMapSection } from './components/TexasMapSection';
import { MobileAppSection } from './components/MobileAppSection';
import { ArticlesSection } from './components/ArticlesSection';
import { ResourcesSection } from './components/ResourcesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CustomerStoryAndNewsletter } from './components/CustomerStoryAndNewsletter';
import { ScamAlertBanner } from './components/ScamAlertBanner';
import { Footer } from './components/Footer';
import { ContactPage } from './components/ContactPage';
import { OpenAccountPage } from './components/OpenAccountPage';
import { LoginModal } from './components/LoginModal';
import { CalculatorModal } from './components/CalculatorModal';
import { LocationSearchModal } from './components/LocationSearchModal';
import { ArticleModal } from './components/ArticleModal';
import { Article } from './types';

// Banking & Auth
import { useBankingAuth } from './context/BankingAuthContext';
import { SignInPage } from './components/auth/SignInPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { BankingLayout, BankingTab } from './components/banking/BankingLayout';
import { BankingHomeScreen } from './components/banking/BankingHomeScreen';
import { BankingOverview } from './components/banking/BankingOverview';
import { AccountsView } from './components/banking/AccountsView';
import { TransfersView } from './components/banking/TransfersView';
import { BillsAndPaymentsView } from './components/banking/BillsAndPaymentsView';
import { CardsView } from './components/banking/CardsView';
import { LoansView } from './components/banking/LoansView';
import { SavingsGoalsView } from './components/banking/SavingsGoalsView';
import { TransactionsView } from './components/banking/TransactionsView';
import { StatementsView } from './components/banking/StatementsView';
import { NotificationsView } from './components/banking/NotificationsView';
import { ProfileSettingsView } from './components/banking/ProfileSettingsView';
import { SettingsView } from './components/banking/SettingsView';
import { SupportView } from './components/banking/SupportView';
import { TransactionModal } from './components/banking/TransactionModal';
import { PostLoginPinSetupManager } from './components/banking/PostLoginPinSetupManager';
import { BankTransaction } from './types/banking';

import { FooterContentPage } from './components/footer/FooterContentPage';
import { FOOTER_PAGES } from './data/footerContent';

type PageType = 'home' | 'contact' | 'open-account' | 'sign-in' | 'register' | 'banking' | 'footer-page';

export default function App() {
  const { user } = useBankingAuth();

  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [currentBankingTab, setCurrentBankingTab] = useState<BankingTab>('home');
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>('Premier Checking');

  const [loginOpen, setLoginOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeFooterPageId, setActiveFooterPageId] = useState<string>('who-we-are');

  // Synchronize URL pathname & hash with application views (on initial mount, popstate, and hashchange)
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const hash = window.location.hash.replace('#', '').toLowerCase();

      // 1. Check footer pages via hash or path (e.g. /who-we-are or #who-we-are)
      const cleanPathId = pathname.replace(/^\//, '');
      if (hash && FOOTER_PAGES[hash]) {
        setActiveFooterPageId(hash);
        setCurrentPage('footer-page');
        return;
      }
      if (cleanPathId && FOOTER_PAGES[cleanPathId]) {
        setActiveFooterPageId(cleanPathId);
        setCurrentPage('footer-page');
        return;
      }

      // 2. Check primary application routes
      if (pathname === '/sign-in' || pathname === '/login') {
        setCurrentPage('sign-in');
      } else if (pathname === '/register' || pathname === '/signup') {
        setCurrentPage('register');
      } else if (pathname === '/open-account' || pathname === '/accounts/open') {
        setCurrentPage('open-account');
      } else if (pathname === '/contact' || pathname === '/support') {
        setCurrentPage('contact');
      } else if (pathname.startsWith('/banking') || pathname.startsWith('/dashboard')) {
        // Parse banking sub-tab if specified (e.g. /banking/transfers)
        const parts = pathname.split('/').filter(Boolean);
        const subTab = parts[1] as BankingTab;
        const validTabs: BankingTab[] = [
          'home', 'overview', 'accounts', 'transfers', 'bills', 'cards',
          'loans', 'savings', 'transactions', 'statements', 'notifications',
          'profile', 'settings', 'support'
        ];
        if (subTab && validTabs.includes(subTab)) {
          setCurrentBankingTab(subTab);
        }
        setCurrentPage('banking');
      } else {
        // Default to home for '/' or unrecognized paths
        setCurrentPage('home');
      }
    };

    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  // If user signs out while on banking dashboard, return smoothly to home
  useEffect(() => {
    if (!user && currentPage === 'banking') {
      setCurrentPage('home');
      try {
        if (window.location.pathname.startsWith('/banking')) {
          window.history.pushState(null, '', '/');
        }
      } catch {}
    }
  }, [user, currentPage]);

  const handleNavigateHome = () => {
    setCurrentPage('home');
    try {
      if (window.location.pathname !== '/' || window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFooterPage = (pageId: string) => {
    setActiveFooterPageId(pageId);
    setCurrentPage('footer-page');
    try {
      window.history.pushState(null, '', `/#${pageId}`);
    } catch {
      window.location.hash = pageId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactClick = () => {
    setCurrentPage('contact');
    try {
      window.history.pushState(null, '', '/contact');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAccountOnline = () => {
    setCurrentPage('open-account');
    try {
      window.history.pushState(null, '', '/open-account');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRegister = (accountType?: string) => {
    if (accountType) {
      setSelectedAccountType(accountType);
    }
    setCurrentPage('register');
    try {
      window.history.pushState(null, '', '/register');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSignIn = () => {
    setCurrentPage('sign-in');
    try {
      window.history.pushState(null, '', '/sign-in');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBanking = (tab: BankingTab = 'home') => {
    setCurrentBankingTab(tab);
    setCurrentPage('banking');
    try {
      window.history.pushState(null, '', tab === 'home' ? '/banking' : `/banking/${tab}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'home-loans') {
      setCalculatorOpen(true);
    } else {
      alert(`Learn more about Aurelith Reserve ${serviceId.replace('-', ' ')} options.`);
    }
  };

  const handleNancyStory = () => {
    alert('Nancy Nicholson has trusted Aurelith Reserve for over 30 years for commercial loans and business growth in Texas.');
  };

  // 1. BANKING DASHBOARD ROUTE
  if (currentPage === 'banking' && user) {
    return (
      <>
        <BankingLayout
          currentTab={currentBankingTab}
          onSelectTab={setCurrentBankingTab}
          onNavigateHome={handleNavigateHome}
        >
          {currentBankingTab === 'home' && (
            <BankingHomeScreen
              onSelectTab={setCurrentBankingTab}
              onOpenTransactionDetails={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentBankingTab === 'overview' && (
            <BankingOverview
              onSelectTab={setCurrentBankingTab}
              onOpenTransactionDetails={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentBankingTab === 'accounts' && (
            <AccountsView onSelectTab={setCurrentBankingTab} />
          )}

          {currentBankingTab === 'transfers' && (
            <TransfersView onSuccessReturn={() => setCurrentBankingTab('home')} />
          )}

          {currentBankingTab === 'bills' && <BillsAndPaymentsView />}

          {currentBankingTab === 'cards' && <CardsView />}

          {currentBankingTab === 'loans' && <LoansView />}

          {currentBankingTab === 'savings' && <SavingsGoalsView />}

          {currentBankingTab === 'transactions' && (
            <TransactionsView
              onOpenDetails={(tx) => setSelectedTransaction(tx)}
              onSelectTab={setCurrentBankingTab}
              onOpenStatements={() => setCurrentBankingTab('statements')}
            />
          )}

          {currentBankingTab === 'statements' && <StatementsView />}

          {currentBankingTab === 'notifications' && <NotificationsView />}

          {currentBankingTab === 'profile' && (
            <ProfileSettingsView onNavigateSupport={() => setCurrentBankingTab('support')} />
          )}

          {currentBankingTab === 'settings' && <SettingsView />}

          {currentBankingTab === 'support' && <SupportView />}
        </BankingLayout>

        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />

        <PostLoginPinSetupManager />
      </>
    );
  }

  // 2. SIGN IN ROUTE
  if (currentPage === 'sign-in') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B111E] flex flex-col font-sans transition-colors duration-150">
        <SignInPage
          onSuccess={() => handleNavigateBanking('home')}
          onNavigateRegister={handleOpenAccountOnline}
          onNavigateHome={handleNavigateHome}
        />
      </div>
    );
  }

  // 3. REGISTRATION ROUTE
  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B111E] flex flex-col font-sans transition-colors duration-150">
        <RegisterPage
          initialAccountType={selectedAccountType}
          onNavigateAccountSelection={handleOpenAccountOnline}
          onSuccess={() => handleNavigateBanking('home')}
          onNavigateSignIn={handleOpenSignIn}
          onNavigateHome={handleNavigateHome}
        />
      </div>
    );
  }

  // 4. PUBLIC PAGES (HOME, CONTACT, OPEN-ACCOUNT)
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-red-100 selection:text-red-900 transition-colors duration-150">
      {/* Navigation Header */}
      <Header
        onOpenLogin={() => setLoginOpen(true)}
        onOpenLocations={() => setLocationsOpen(true)}
        onOpenContact={handleContactClick}
        onOpenOpenAccount={handleOpenAccountOnline}
        onNavigateHome={handleNavigateHome}
        onOpenSignIn={handleOpenSignIn}
        onOpenRegister={handleOpenAccountOnline}
        onNavigateBanking={() => handleNavigateBanking('home')}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'contact' ? (
          <ContactPage
            onNavigateHome={handleNavigateHome}
            onOpenLocations={() => setLocationsOpen(true)}
            onOpenHelpCenter={() => alert('Opening Help Center topics...')}
          />
        ) : currentPage === 'open-account' ? (
          <OpenAccountPage
            selectedAccountType={selectedAccountType}
            onNavigateHome={handleNavigateHome}
            onOpenLogin={() => setLoginOpen(true)}
            onStartRegistration={(accType) => handleOpenRegister(accType)}
          />
        ) : currentPage === 'footer-page' ? (
          <FooterContentPage
            pageId={activeFooterPageId}
            onNavigateHome={handleNavigateHome}
            onNavigatePage={handleNavigateFooterPage}
            onOpenAccount={handleOpenAccountOnline}
            onOpenSignIn={handleOpenSignIn}
            onOpenLocations={() => setLocationsOpen(true)}
            onOpenContact={handleContactClick}
            onOpenCalculator={() => setCalculatorOpen(true)}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              onLearnMore={() => alert('Explore Aurelith Reserve Wealth Management services.')}
              onOpenLocations={() => setLocationsOpen(true)}
              onOpenCalculator={() => setCalculatorOpen(true)}
            />

            {/* Section 2: Personal Service & Tools */}
            <PersonalizedService
              onOpenAccount={handleOpenAccountOnline}
              onServiceClick={handleServiceClick}
            />

            {/* Section 3: Texas Statewide Strength Map */}
            <TexasMapSection onFindLocation={() => setLocationsOpen(true)} />

            {/* Section 4: Mobile App */}
            <MobileAppSection />

            {/* Section 5: Articles */}
            <ArticlesSection onSelectArticle={(article) => setSelectedArticle(article)} />

            {/* Section 6: Resources */}
            <ResourcesSection
              onOpenCalculators={() => setCalculatorOpen(true)}
              onOpenFraudModal={() =>
                alert(
                  'Fraud Prevention Tip: Aurelith Reserve will never ask for your password or PIN over phone or text.'
                )
              }
              onOpenHelpCenter={handleContactClick}
            />

            {/* Section 7: Customer Testimonials */}
            <TestimonialsSection />

            {/* Section 8: Nancy Story + Newsletter Form */}
            <CustomerStoryAndNewsletter onSeeStory={handleNancyStory} />

            {/* Section 9: Scam Alert Banner */}
            <ScamAlertBanner
              onGetHelp={() =>
                alert('Report fraud immediately to abuse@aurelithreserve.com or call 855-660-5862.')
              }
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenContact={handleContactClick}
        onOpenLocations={() => setLocationsOpen(true)}
        onOpenHelpCenter={handleContactClick}
        onOpenOpenAccount={handleOpenAccountOnline}
        onNavigateFooterPage={handleNavigateFooterPage}
      />

      {/* Interactive Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onNavigateBanking={() => handleNavigateBanking('home')}
        onNavigateRegister={handleOpenAccountOnline}
        onNavigateSignIn={handleOpenSignIn}
      />
      <CalculatorModal isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
      <LocationSearchModal isOpen={locationsOpen} onClose={() => setLocationsOpen(false)} />
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
