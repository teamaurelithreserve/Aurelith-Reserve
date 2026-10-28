import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building,
  HelpCircle,
  Share2
} from 'lucide-react';
import { FOOTER_PAGES, FooterPageData } from '../../data/footerContent';

interface FooterContentPageProps {
  pageId: string;
  onNavigateHome: () => void;
  onNavigatePage: (pageId: string) => void;
  onOpenAccount: () => void;
  onOpenSignIn: () => void;
  onOpenLocations: () => void;
  onOpenContact: () => void;
  onOpenCalculator?: () => void;
}

export const FooterContentPage: React.FC<FooterContentPageProps> = ({
  pageId,
  onNavigateHome,
  onNavigatePage,
  onOpenAccount,
  onOpenSignIn,
  onOpenLocations,
  onOpenContact,
  onOpenCalculator,
}) => {
  const pageData: FooterPageData = FOOTER_PAGES[pageId] || FOOTER_PAGES['who-we-are'];

  // State for Accessibility Issue Form
  const [accessForm, setAccessForm] = useState({
    fullName: '',
    email: '',
    pageUrl: '',
    issueCategory: 'Screen Reader',
    assistiveTech: 'VoiceOver / iOS',
    description: '',
  });
  const [accessErrors, setAccessErrors] = useState<Record<string, string>>({});
  const [accessSubmitted, setAccessSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!accessForm.fullName.trim()) errors.fullName = 'Please enter your full name.';
    if (!accessForm.email.trim() || !accessForm.email.includes('@')) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!accessForm.description.trim() || accessForm.description.trim().length < 10) {
      errors.description = 'Please describe the barrier encountered (at least 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setAccessErrors(errors);
      return;
    }

    setAccessErrors({});
    setAccessSubmitted(true);
  };

  const handleCtaAction = (action?: string) => {
    switch (action) {
      case 'open-account':
        onOpenAccount();
        break;
      case 'sign-in':
        onOpenSignIn();
        break;
      case 'locations':
        onOpenLocations();
        break;
      case 'calculator':
        if (onOpenCalculator) onOpenCalculator();
        else onOpenContact();
        break;
      case 'contact':
      default:
        onOpenContact();
        break;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#070B14] min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-white dark:bg-[#0D1424] border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#1C2B4C] dark:hover:text-white font-medium flex items-center transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{pageData.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#C8102E] font-semibold truncate max-w-[200px] sm:max-w-none">
              {pageData.title}
            </span>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Page Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-white rounded font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="bg-gradient-to-b from-[#1C2B4C] to-[#142038] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-red-600/20 text-red-300 border border-red-500/30">
              {pageData.badge || pageData.category}
            </span>
            <span className="flex items-center space-x-1 text-slate-300 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{pageData.effectiveDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            {pageData.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-200 font-light max-w-3xl leading-relaxed">
            {pageData.subtitle}
          </p>

          {/* Quick Action in Header */}
          {pageData.primaryCta && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleCtaAction(pageData.primaryCta?.action)}
                className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-lg font-semibold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <span>{pageData.primaryCta.label}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenContact}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg font-medium text-sm transition-colors flex items-center space-x-1.5"
              >
                <Phone className="w-4 h-4 text-slate-300" />
                <span>Speak with a Banker</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Column (Span 8) */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Executive Summary Card */}
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-[#1C2B4C] dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-[#C8102E]" />
                <span>Overview & Purpose</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {pageData.summary}
              </p>
            </div>

            {/* Sections */}
            {pageData.sections.map((section, idx) => (
              <section
                key={idx}
                className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-4"
              >
                <h2 className="text-xl font-bold text-[#1C2B4C] dark:text-white tracking-tight flex items-center space-x-2">
                  <span className="w-1.5 h-5 bg-[#C8102E] rounded-full inline-block mr-1"></span>
                  {section.title}
                </h2>

                <div className="space-y-3.5 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* List items if present */}
                {section.listItems && section.listItems.length > 0 && (
                  <ul className="space-y-2.5 pt-1">
                    {section.listItems.map((item, lIdx) => (
                      <li key={lIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#C8102E] dark:text-red-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Callout box if present */}
                {section.callout && (
                  <div
                    className={`mt-4 rounded-lg p-4 border text-xs sm:text-sm leading-relaxed ${
                      section.callout.type === 'regulatory'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                        : section.callout.type === 'highlight'
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 text-blue-950 dark:text-blue-200'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {section.callout.title && (
                      <div className="font-bold flex items-center space-x-1.5 mb-1 text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{section.callout.title}</span>
                      </div>
                    )}
                    <p>{section.callout.text}</p>
                  </div>
                )}
              </section>
            ))}

            {/* Special Interactive Section: Report an Accessibility Issue Form */}
            {pageId === 'accessibility' && (
              <section className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-[#C8102E]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2B4C] dark:text-white">
                      Accessibility Issue Submission Form
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Our Accessibility Coordinator will review this report within 1 business day.
                    </p>
                  </div>
                </div>

                {accessSubmitted ? (
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Report Submitted Successfully (Ticket #ACC-{Math.floor(100000 + Math.random() * 900000)})</span>
                    </div>
                    <p className="text-xs">
                      Thank you for bringing this issue to our attention. A confirmation email has been dispatched to <strong>{accessForm.email}</strong>. Our engineering and digital inclusion team will remediate the issue promptly.
                    </p>
                    <button
                      onClick={() => {
                        setAccessSubmitted(false);
                        setAccessForm({
                          fullName: '',
                          email: '',
                          pageUrl: '',
                          issueCategory: 'Screen Reader',
                          assistiveTech: 'VoiceOver / iOS',
                          description: '',
                        });
                      }}
                      className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline hover:no-underline"
                    >
                      Submit another report
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAccessSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accessForm.fullName}
                          onChange={(e) => setAccessForm({ ...accessForm, fullName: e.target.value })}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                        />
                        {accessErrors.fullName && (
                          <p className="text-red-500 text-[11px] mt-1">{accessErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={accessForm.email}
                          onChange={(e) => setAccessForm({ ...accessForm, email: e.target.value })}
                          placeholder="e.g. e.vance@example.com"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                        />
                        {accessErrors.email && (
                          <p className="text-red-500 text-[11px] mt-1">{accessErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Issue Category
                        </label>
                        <select
                          value={accessForm.issueCategory}
                          onChange={(e) => setAccessForm({ ...accessForm, issueCategory: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                        >
                          <option value="Screen Reader">Screen Reader / VoiceOver / JAWS</option>
                          <option value="Keyboard Navigation">Keyboard Navigation / Tab Focus</option>
                          <option value="Visual & Contrast">Color Contrast / Text Scaling</option>
                          <option value="Forms & Verification">Form Inputs / Security Verification</option>
                          <option value="Document Access">PDF / Document Accessibility</option>
                          <option value="Other Barrier">Other Physical / Digital Barrier</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Assistive Technology Used
                        </label>
                        <select
                          value={accessForm.assistiveTech}
                          onChange={(e) => setAccessForm({ ...accessForm, assistiveTech: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                        >
                          <option value="VoiceOver / iOS">Apple VoiceOver (macOS / iOS)</option>
                          <option value="NVDA / Windows">NVDA (Windows)</option>
                          <option value="JAWS / Windows">JAWS (Windows)</option>
                          <option value="TalkBack / Android">TalkBack (Android)</option>
                          <option value="Keyboard Only">Keyboard-Only Navigation</option>
                          <option value="Zoom / Magnifier">Screen Magnifier</option>
                          <option value="Other">Other Device or Software</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Page URL or Section Where Issue Occurred
                      </label>
                      <input
                        type="text"
                        value={accessForm.pageUrl}
                        onChange={(e) => setAccessForm({ ...accessForm, pageUrl: e.target.value })}
                        placeholder="e.g. /sign-in or Online Transfer Form"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Detailed Description of Barrier <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={accessForm.description}
                        onChange={(e) => setAccessForm({ ...accessForm, description: e.target.value })}
                        placeholder="Please describe what you were trying to accomplish and what unexpected behavior or inaccessible element you encountered..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                      />
                      {accessErrors.description && (
                        <p className="text-red-500 text-[11px] mt-1">{accessErrors.description}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-md font-semibold text-xs tracking-wider uppercase transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Accessibility Report</span>
                    </button>
                  </form>
                )}
              </section>
            )}

            {/* Special Interactive Section for Bank Regions & Locations */}
            {(pageId === 'bank-regions' || pageId === 'locations') && (
              <section className="bg-gradient-to-br from-[#1C2B4C] to-[#0E1726] text-white rounded-xl p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <span>Locate an Aurelith Reserve Center</span>
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg">
                      Search by ZIP code, city, or current geolocation to find full-service private banking suites, drive-thru commercial tellers, and 24/7 smart ATMs.
                    </p>
                  </div>
                  <button
                    onClick={onOpenLocations}
                    className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-lg font-semibold text-xs tracking-wider uppercase shadow-md transition-all whitespace-nowrap self-start sm:self-auto"
                  >
                    Open Branch Locator
                  </button>
                </div>
              </section>
            )}

            {/* Special Section for Make a Loan Payment */}
            {pageId === 'payment' && (
              <section className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#1C2B4C] dark:text-white">
                  Expedited Digital Payment Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Existing Aurelith Reserve borrowers can sign in directly to schedule one-time payments, configure autopay, or view loan payoff statements with no transaction surcharge.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={onOpenSignIn}
                    className="px-4 py-2 bg-[#C8102E] hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-sm transition-colors"
                  >
                    Sign In to Pay Loan
                  </button>
                  <button
                    onClick={onOpenContact}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs rounded-md transition-colors"
                  >
                    Loan Servicing Inquiries
                  </button>
                </div>
              </section>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-[#C8102E] dark:hover:text-red-400 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home Page</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Back to Top ↑
              </button>
            </div>
          </article>

          {/* Sidebar / Quick Navigation (Span 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Quick Action Card */}
            <div className="bg-[#1C2B4C] text-white rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-sm tracking-tight">Aurelith Reserve Concierge</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Have questions regarding {pageData.title.toLowerCase()} or wish to discuss bespoke liquidity structures with a Private Reserve Managing Director?
              </p>
              
              <div className="pt-1 space-y-2 text-xs">
                <a
                  href="tel:8556605862"
                  className="flex items-center space-x-2 text-slate-200 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-semibold">855-660-5862 (Toll Free)</span>
                </a>
                <div className="flex items-center space-x-2 text-slate-200">
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>support@aurelithreserve.com</span>
                </div>
              </div>

              <button
                onClick={onOpenContact}
                className="w-full py-2 bg-[#C8102E] hover:bg-red-700 text-white rounded-md font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Request Consultation
              </button>
            </div>

            {/* Related Pages Widget */}
            {pageData.relatedPages && pageData.relatedPages.length > 0 && (
              <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Related Destinations
                </h3>
                <ul className="space-y-2 text-xs">
                  {pageData.relatedPages.map((rel, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          onNavigatePage(rel.pageId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-left font-medium text-[#1C2B4C] dark:text-blue-400 hover:text-[#C8102E] dark:hover:text-red-400 hover:underline flex items-center justify-between w-full group py-1"
                      >
                        <span className="truncate pr-2">{rel.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Depository Disclosures Box */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Institutional Notice
              </div>
              <p>
                Aurelith Reserve Member FDIC. Equal Housing Lender. Fiduciary advisory services are conducted through registered advisory affiliates.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span>Routing: 111301122</span>
                <span>SWIFT: FITEUS41</span>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
};
