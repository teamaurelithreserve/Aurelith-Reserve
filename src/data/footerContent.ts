export interface FooterPageSection {
  title: string;
  content: string[];
  listItems?: string[];
  callout?: {
    type: 'info' | 'regulatory' | 'highlight';
    title?: string;
    text: string;
  };
}

export interface FooterPageData {
  id: string;
  title: string;
  subtitle: string;
  category: 'Company' | 'Banking & Lending' | 'Wealth Management' | 'Legal, Privacy & Accessibility' | 'Resources & Support';
  effectiveDate: string;
  badge?: string;
  summary: string;
  sections: FooterPageSection[];
  relatedPages: { title: string; pageId: string }[];
  primaryCta?: {
    label: string;
    action: 'open-account' | 'contact' | 'locations' | 'sign-in' | 'calculator';
  };
}

export const FOOTER_PAGES: Record<string, FooterPageData> = {
  // ================= COMPANY =================
  'bank-regions': {
    id: 'bank-regions',
    title: 'Bank Regions & Regional Footprint',
    subtitle: 'Strategic presence across high-growth corridors, commercial centers, and energy basins.',
    category: 'Company',
    effectiveDate: 'First Quarter 2026',
    badge: 'Regional Network',
    summary: 'Aurelith Reserve operates premier regional banking divisions throughout Texas and surrounding commercial corridors. Our decentralized regional model combines institutional capital strength with locally empowered executive leadership.',
    sections: [
      {
        title: 'Decentralized Regional Decision-Making',
        content: [
          'Unlike national mega-banks where credit decisions are outsourced to remote underwriting committees, Aurelith Reserve empowers Regional Presidents and local credit executives with direct lending authority.',
          'Each regional office operates with a dedicated team of commercial underwriters, private bankers, and treasury management consultants who live and work within the communities they serve.',
        ],
        callout: {
          type: 'highlight',
          title: 'Direct Access Principle',
          text: 'Our clients maintain direct mobile and direct-line access to their Regional Managing Director and Senior Credit Officer.'
        }
      },
      {
        title: 'Core Regional Divisions',
        content: [
          'Our branch and private office network is strategically positioned across key economic hubs:',
        ],
        listItems: [
          'Greater Houston & Gulf Coast: Focused on energy transition, international maritime trade, healthcare infrastructure, and private family offices.',
          'Dallas-Fort Worth Metroplex: Specializing in corporate logistics, commercial real estate development, private equity sponsor banking, and tech enterprise solutions.',
          'Austin & Central Texas Innovation Corridor: Tailored treasury, venture debt, and founder wealth management for high-growth technology and consumer enterprises.',
          'San Antonio & South Texas Gateway: Serving regional manufacturing, defense contractors, agribusiness, and cross-border commercial relationships.',
          'West Texas Permian Basin (Midland / Odessa): Dedicated energy finance, mineral rights escrow, equipment financing, and multigenerational ranch holdings.'
        ]
      },
      {
        title: 'Capital Deployment & Community Reinvestment',
        content: [
          'We reinvest deposits back into the localized economies where they originate. Through targeted commercial real estate loans, municipal bond underwriting, and small-business credit programs, our regional presence fosters durable economic resilience.',
        ]
      }
    ],
    relatedPages: [
      { title: 'Locations & Private Banking Offices', pageId: 'locations' },
      { title: 'Who We Are', pageId: 'who-we-are' },
      { title: 'Business Banking', pageId: 'business-banking' }
    ],
    primaryCta: { label: 'Find a Regional Office', action: 'locations' }
  },

  'careers': {
    id: 'careers',
    title: 'Careers & Professional Opportunities',
    subtitle: 'Join an elite community of private bankers, credit officers, and financial technologists.',
    category: 'Company',
    effectiveDate: 'Active Postings 2026',
    badge: 'Talent & Culture',
    summary: 'At Aurelith Reserve, we cultivate an entrepreneurial culture rooted in fiduciary integrity, intellectual rigor, and bespoke client service. We attract professionals committed to elevating modern relationship banking.',
    sections: [
      {
        title: 'The Aurelith Culture',
        content: [
          'We view banking as a long-term partnership rather than transactional volume. Our professionals are evaluated on client retention, portfolio credit quality, and service excellence rather than arbitrary cross-selling quotas.',
          'We foster a collaborative, merit-based environment where agile decision-making, direct communication, and mutual accountability define daily operations.'
        ],
        callout: {
          type: 'info',
          title: 'Fiduciary Stewardship',
          text: 'Every team member undergoes rigorous compliance and ethics training, ensuring our fiduciary responsibility to our clients remains paramount.'
        }
      },
      {
        title: 'Practice Areas & Functional Disciplines',
        content: [
          'We periodically recruit seasoned specialists across the following key banking practices:',
        ],
        listItems: [
          'Private Banking & Wealth Advisory: Managing portfolios for high-net-worth individuals, business founders, and private family trusts.',
          'Commercial & Industrial (C&I) Lending: Structuring tailored revolving credit lines, term loans, and acquisition financing.',
          'Treasury Management & Payments: Engineering liquidity architectures and automated clearing house solutions for mid-market enterprises.',
          'Trust Administration & Estate Management: Administering fiduciary trusts, probate settlement, and multi-generational wealth transfers.',
          'Cybersecurity & Financial Technology: Building resilient, zero-trust cloud infrastructure and real-time ledger verification systems.'
        ]
      },
      {
        title: 'Comprehensive Benefits & Total Rewards',
        content: [
          'Aurelith Reserve provides a comprehensive benefits program designed to support our colleagues’ health, financial wellness, and long-term security:',
        ],
        listItems: [
          'Competitive Base Compensation plus performance-driven annual incentive rewards.',
          'Premier Tier Medical, Dental, and Vision coverage with 100% employer-funded preventative care.',
          '401(k) Retirement Savings Plan with immediate vesting and competitive dollar-for-dollar company match.',
          'Professional development stipends, CFP / CFA / CTP credential sponsorship, and ongoing executive leadership education.',
          'Generous paid time off, parental leave, and designated community service volunteer days.'
        ]
      },
      {
        title: 'Inquiries & Application Route',
        content: [
          'To explore current opportunities or submit a confidential resume for prospective consideration, prospective candidates may contact our human resources team at careers@aurelithreserve.com.',
          'Aurelith Reserve is an Equal Opportunity Employer. All qualified applicants receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or protected veteran status.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Who We Are', pageId: 'who-we-are' },
      { title: 'Employee Benefits Services', pageId: 'employee-benefits' },
      { title: 'Report an Accessibility Issue', pageId: 'accessibility' }
    ],
    primaryCta: { label: 'Contact Human Resources', action: 'contact' }
  },

  'investor-relations': {
    id: 'investor-relations',
    title: 'Investor Relations & Governance',
    subtitle: 'Prudent balance sheet management, disciplined capital allocation, and transparent reporting.',
    category: 'Company',
    effectiveDate: 'Fiscal Year 2026',
    badge: 'Capital Strength',
    summary: 'Aurelith Reserve maintains conservative capital ratios, rigorous risk-management controls, and high asset quality. Our financial architecture is designed to withstand diverse macroeconomic cycles while supporting client growth.',
    sections: [
      {
        title: 'Capital Adequacy & Asset Quality',
        content: [
          'Aurelith Reserve is capitalized well in excess of regulatory "Well-Capitalized" guidelines established by federal and state banking authorities.',
          'Our balance sheet is anchored by high-quality liquid assets (HQLA), short-duration U.S. Treasuries, and senior secured loans collateralized by prime commercial and residential properties.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Regulatory Capital Framework',
          text: 'We maintain Common Equity Tier 1 (CET1) and Total Risk-Based Capital ratios significantly higher than minimum statutory benchmarks.'
        }
      },
      {
        title: 'Governance & Fiduciary Oversight',
        content: [
          'Our Board of Directors comprises independent leaders in commerce, legal affairs, financial audit, and energy infrastructure.',
          'Committees for Audit, Enterprise Risk Management, Asset-Liability Management (ALCO), and Executive Compensation meet quarterly to evaluate credit metrics, interest rate exposure, and technological resilience.'
        ]
      },
      {
        title: 'Financial Reports & Filing Disclosures',
        content: [
          'Official regulatory reports, including quarterly Call Reports filed with the Federal Financial Institutions Examination Council (FFIEC) and Federal Deposit Insurance Corporation (FDIC), are publicly accessible through regulatory databases.',
          'Shareholder materials, annual auditing statements, and fiduciary reviews are distributed directly to registered shareholders and verified stakeholders upon written request.'
        ]
      },
      {
        title: 'Investor Contact & Official Inquiries',
        content: [
          'Institutional analysts, accredited stakeholders, and rating agency representatives may contact the Office of the Corporate Secretary and Investor Relations at investor.relations@aurelithreserve.com.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Summary Annual Report (SAR)', pageId: 'sar' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Who We Are', pageId: 'who-we-are' }
    ],
    primaryCta: { label: 'Contact Investor Relations', action: 'contact' }
  },

  'locations': {
    id: 'locations',
    title: 'Branch & Private Banking Office Network',
    subtitle: 'Comprehensive regional presence across Texas commercial corridors and financial districts.',
    category: 'Company',
    effectiveDate: 'Updated 2026',
    badge: 'Full Service Network',
    summary: 'Experience private banking lounges, commercial lending centers, drive-thru lanes, and 24/7 ATM access across our Texas footprint. Schedule an in-person appointment or locate your nearest banking center.',
    sections: [
      {
        title: 'Private Banking Lounges & Full-Service Centers',
        content: [
          'Aurelith Reserve facilities are designed for privacy, convenience, and efficiency. Each branch features confidential meeting suites where clients can confer with private bankers, trust officers, and mortgage specialists in complete discretion.',
          'Our premier financial centers offer extended drive-thru commercial lanes, high-capacity night depository vaults, and safe deposit storage boxes for precious assets.'
        ]
      },
      {
        title: 'Key Banking Locations',
        content: [
          'Find full service branches across our primary metropolitan areas:',
        ],
        listItems: [
          'Downtown Houston Flagship: 1000 Louisiana St, Suite 4200, Houston, TX 77002 — Lobby, Drive-Thru, Private Reserve Vault & Wealth Management Suite.',
          'Dallas Uptown Financial Center: 2100 McKinney Ave, Suite 1400, Dallas, TX 75201 — Commercial Underwriting, Executive Banking, 24/7 Smart ATM.',
          'Austin Downtown Tech & Reserve Office: 501 Congress Ave, Suite 800, Austin, TX 78701 — Venture & Founder Banking, Notary Services, Advisory Lounges.',
          'San Antonio River Walk Banking Center: 300 Convent St, Suite 1200, San Antonio, TX 78205 — Business Lending, Multilingual Private Bankers, Depository Vault.',
          'Fort Worth Cultural District: 777 Taylor St, Suite 300, Fort Worth, TX 76102 — Commercial Real Estate Financing, Agribusiness Credit Division.',
          'Midland Permian Basin Center: 400 W Illinois Ave, Suite 900, Midland, TX 79701 — Oil & Gas Escrow, Equipment Leasing, Mineral Rights Trust Group.'
        ]
      },
      {
        title: 'Surcharge-Free ATM Access',
        content: [
          'In addition to Aurelith Reserve proprietary deposit-taking ATMs, clients enjoy fee-free access to thousands of network partner ATMs across the United States.',
          'Aurelith Reserve Premier Checking and Wealth Management clients receive automatic out-of-network ATM surcharge reimbursements nationwide.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Bank Regions', pageId: 'bank-regions' },
      { title: 'Online & Mobile Banking', pageId: 'mobile-banking' },
      { title: 'Contact & Customer Support', pageId: 'contact' }
    ],
    primaryCta: { label: 'Search All Locations', action: 'locations' }
  },

  'who-we-are': {
    id: 'who-we-are',
    title: 'Who We Are — Heritage & Philosophy',
    subtitle: 'Private reserve banking built on generational trust, prudent stewardship, and direct relationships.',
    category: 'Company',
    effectiveDate: 'Established Tradition',
    badge: 'Our Heritage',
    summary: 'Aurelith Reserve is an independent commercial and private wealth institution dedicated to empowering enterprises, families, and high-net-worth custodians. We merge the timeless discretion of traditional private banking with cutting-edge digital execution.',
    sections: [
      {
        title: 'Our Guiding Philosophy',
        content: [
          'In an era characterized by algorithmic impersonality and branch closures, Aurelith Reserve remains steadfast in our commitment to personal relationship banking.',
          'We believe that meaningful financial stewardship requires knowing our clients by name, understanding the unique nuances of their balance sheets, and standing shoulder-to-shoulder with them through every economic cycle.'
        ],
        callout: {
          type: 'highlight',
          title: 'The Reserve Standard',
          text: 'We do not sell pre-packaged financial products. Every loan structure, deposit solution, and wealth strategy is customized to the specific liquidity profile of the client.'
        }
      },
      {
        title: 'Our Core Pillars',
        content: [
          'Four unwavering commitments anchor our daily conduct:',
        ],
        listItems: [
          'Fiduciary Responsibility: We hold ourselves to the highest legal and ethical standards, safeguarding client assets with conservative risk underwriting.',
          'Direct Human Access: Our clients have direct access to experienced decision-makers without endless phone trees or automated routing.',
          'Technological Precision: Modern digital interfaces, biometric authentication, and enterprise-grade encryption safeguard every transaction.',
          'Community Rootedness: We reinvest capital locally, supporting domestic enterprise, regional infrastructure, and generational family legacies.'
        ]
      },
      {
        title: 'Independent Institutional Strength',
        content: [
          'As a privately held institution with strong capital buffers, Aurelith Reserve is not beholden to short-term Wall Street quarterly earnings pressures. This structural independence allows us to take multi-decade perspectives in our client partnerships.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Bank Regions', pageId: 'bank-regions' },
      { title: 'Careers', pageId: 'careers' },
      { title: 'Investor Relations', pageId: 'investor-relations' }
    ],
    primaryCta: { label: 'Open an Account Today', action: 'open-account' }
  },

  // ================= BANKING & LENDING =================
  'personal-banking': {
    id: 'personal-banking',
    title: 'Personal Banking & Depository Services',
    subtitle: 'Sophisticated liquidity management, premium checking accounts, and high-yield reserve deposits.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Service Guide',
    badge: 'Personal Liquidity',
    summary: 'Elevate your daily banking with high-tier interest accounts, complimentary wire transfers, contactless metal debit cards, and seamless digital access designed for discerning individuals.',
    sections: [
      {
        title: 'Premier Personal Accounts',
        content: [
          'Aurelith Reserve personal accounts are engineered to optimize liquidity while providing frictionless worldwide payment access:',
        ],
        listItems: [
          'Premier Checking: Unlimited domestic transactions, complete ATM fee reimbursements worldwide, waived inbound wire fees, and concierge customer service.',
          'High-Yield Reserve Savings: Maximize cash reserves with institutional interest yields, daily compounding, and automated recurring transfers.',
          'Fixed-Term Certificates of Deposit (CDs): Lock in competitive fixed yields with flexible maturities ranging from 30 days to 5 years, protected by FDIC insurance up to statutory limits.',
          'Health Savings Accounts (HSA): Triple tax-advantaged accounts for qualified medical expenses with built-in investment sweep options.'
        ]
      },
      {
        title: 'Premium Client Privileges',
        content: [
          'Holders of Aurelith Reserve accounts enjoy privileged benefits including complimentary safe deposit box leasing, notary public verification, personalized cashier checks, and priority private banking advisory consultations.'
        ],
        callout: {
          type: 'info',
          title: 'FDIC Deposit Insurance',
          text: 'Deposits are insured up to $250,000 per depositor for each ownership category through the Federal Deposit Insurance Corporation.'
        }
      },
      {
        title: 'Digital & Physical Integration',
        content: [
          'Manage your personal accounts 24/7 through our web portal or mobile application. Deposit checks remotely, set up custom push fraud alerts, and link external brokerage accounts in a unified interface.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Personal Borrowing & Custom Credit', pageId: 'personal-borrowing' },
      { title: 'Online & Mobile Banking', pageId: 'mobile-banking' },
      { title: 'Home Loans & Mortgage Solutions', pageId: 'home-loans' }
    ],
    primaryCta: { label: 'Explore Account Options', action: 'open-account' }
  },

  'personal-borrowing': {
    id: 'personal-borrowing',
    title: 'Personal Borrowing & Custom Credit Lines',
    subtitle: 'Liquidity solutions structured against investment portfolios, real estate, and prime assets.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Credit Guidelines',
    badge: 'Tailored Lending',
    summary: 'Access tailored credit facilities, unsecured personal loans, and securities-backed lines of credit (SBLOC) designed to provide rapid liquidity without liquidating long-term investments.',
    sections: [
      {
        title: 'Bespoke Credit Facilities',
        content: [
          'Whether financing an unexpected family opportunity, acquiring high-value tangible assets, or consolidating existing liabilities, Aurelith Reserve structures competitive borrowing solutions:',
        ],
        listItems: [
          'Securities-Backed Lines of Credit (SBLOC): Leverage non-retirement eligible securities portfolios to unlock flexible, low-rate revolving credit without triggering capital gains taxes.',
          'Custom Unsecured Signature Loans: Fixed-rate term financing with expedited underwriting for established private banking clients.',
          'Luxury Asset & Bridge Financing: Short-term bridge facilities for residential acquisitions, fine art, or specialized collateral.',
          'Personal Lines of Credit: Pre-approved revolving reserves linked directly to your primary checking account for overdraft protection and instantaneous liquidity.'
        ]
      },
      {
        title: 'Underwriting & Relationship Pricing',
        content: [
          'Our credit officers evaluate personal credit holistically, considering overall liquid net worth, cash flow stability, and broader institutional relationships to offer preferential margin discounts.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Personal Banking', pageId: 'personal-banking' },
      { title: 'Home Loans', pageId: 'home-loans' },
      { title: 'Investment Management', pageId: 'investment-management' }
    ],
    primaryCta: { label: 'Consult a Lending Specialist', action: 'contact' }
  },

  'business-banking': {
    id: 'business-banking',
    title: 'Business Banking & Commercial Accounts',
    subtitle: 'Enterprise operating accounts, multi-entity treasury setups, and commercial depository services.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Enterprise Guide',
    badge: 'Commercial Grade',
    summary: 'Aurelith Reserve provides business checking, interest-bearing escrow, and multi-user administrative accounts tailored for privately held businesses, corporations, partnerships, and professional practices.',
    sections: [
      {
        title: 'Commercial Operating Accounts',
        content: [
          'Operating accounts engineered to handle high transaction volumes with comprehensive earnings credit allowances (ECA) to offset banking service fees:',
        ],
        listItems: [
          'Commercial Analysis Checking: Designed for mid-market operating entities with complex payables, multi-location deposits, and high transaction volume.',
          'Business Reserve Savings & Escrow: Segregate operating cash, client funds, tax reserves, and retention deposits with automated interest distribution.',
          'IOLTA & Professional Trust Accounts: Specialized compliant trust accounting for legal practices, real estate brokers, and title companies with statutory interest remissions.',
          'Multi-Entity Organizational Access: Single master dashboard to administer parent entities, subsidiaries, and special purpose vehicles (SPVs).'
        ]
      },
      {
        title: 'Enterprise Fraud Protection',
        content: [
          'Safeguard corporate disbursements with Positive Pay for check and ACH debits, automated dual authorization workflows, and real-time wire confirmation calls.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Commercial Security Standards',
          text: 'Dual-control protocols allow CFOs and Controllers to require separate input and release authorizations on all outbound transfers.'
        }
      }
    ],
    relatedPages: [
      { title: 'Business Borrowing', pageId: 'business-borrowing' },
      { title: 'Business Solutions', pageId: 'business-solutions' },
      { title: 'Employee Benefits', pageId: 'employee-benefits' }
    ],
    primaryCta: { label: 'Open a Business Account', action: 'open-account' }
  },

  'business-borrowing': {
    id: 'business-borrowing',
    title: 'Business Borrowing & Commercial Credit',
    subtitle: 'Working capital lines, commercial real estate loans, equipment financing, and syndicated facilities.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Commercial Lending',
    badge: 'Capital Solutions',
    summary: 'Empower your company’s expansion with customized commercial debt facilities structured by seasoned regional underwriters with direct local approval authority.',
    sections: [
      {
        title: 'Commercial Lending Solutions',
        content: [
          'We partner with operating companies across diverse sectors including energy, manufacturing, healthcare, technology, and real estate development:',
        ],
        listItems: [
          'Revolving Working Capital Lines: Flexible credit tied to accounts receivable and inventory to smooth out cyclical cash flow requirements.',
          'Commercial Real Estate (CRE) Financing: Acquisition, refinancing, and construction term loans for owner-occupied industrial, office, retail, and multifamily assets.',
          'Equipment & Fleet Leasing: Preserve capital reserves with structured lease financing and capital expenditure term loans.',
          'Mergers & Acquisition (M&A) Debt: Senior secured term facilities structured to facilitate management buyouts, partner buy-ins, and strategic acquisitions.'
        ]
      },
      {
        title: 'Agile Credit Committee Process',
        content: [
          'Our streamlined local credit approval workflow enables rapid term sheet issuance and expedited loan documentation, ensuring your enterprise never misses a critical market opportunity.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Business Banking', pageId: 'business-banking' },
      { title: 'Business Solutions', pageId: 'business-solutions' },
      { title: 'Real Estate & Property Management', pageId: 'real-estate' }
    ],
    primaryCta: { label: 'Request Loan Discussion', action: 'contact' }
  },

  'business-solutions': {
    id: 'business-solutions',
    title: 'Business Solutions & Treasury Management',
    subtitle: 'Cash management automation, automated clearing house (ACH), integrated merchant acquiring, and liquidity sweeps.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Treasury Guide',
    badge: 'Treasury Suite',
    summary: 'Optimize working capital velocity, mitigate operational friction, and secure enterprise payments with Aurelith Reserve’s comprehensive Treasury Solutions platform.',
    sections: [
      {
        title: 'Receivables & Collections Automation',
        content: [
          'Accelerate the conversion of billings into collected funds through advanced receivable architectures:',
        ],
        listItems: [
          'Wholesale & Healthcare Lockbox: Expedited processing of check payments with automated remittance data transmission to your ERP.',
          'Remote Deposit Capture (RDC): High-speed desktop check scanners for high-volume back-office deposit processing.',
          'Next-Day Merchant Acquiring: Integrated card processing with transparent interchange-plus pricing and point-of-sale hardware integration.'
        ]
      },
      {
        title: 'Payables & Disbursement Optimization',
        content: [
          'Modernize vendor and payroll disbursements while extending days payable outstanding (DPO):',
        ],
        listItems: [
          'Direct ACH Origination: Batch processing of vendor payables, employee direct deposits, and dividend payments.',
          'Commercial Purchasing & Virtual Cards: Earn rebates on routine operating expenditures while enforcing spend limits per employee.',
          'Domestic & International Wires: Same-day real-time gross settlement via Fedwire and SWIFT with automated FX conversion.'
        ]
      },
      {
        title: 'Automated Liquidity Sweeps',
        content: [
          'Maximize interest income on idle cash through Zero Balance Accounts (ZBA) and automated overnight sweeps into insured interest-bearing reserve accounts or repo sweep facilities.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Business Banking', pageId: 'business-banking' },
      { title: 'Business Borrowing', pageId: 'business-borrowing' },
      { title: 'Online & Mobile Banking', pageId: 'mobile-banking' }
    ],
    primaryCta: { label: 'Consult Treasury Team', action: 'contact' }
  },

  'home-loans': {
    id: 'home-loans',
    title: 'Home Loans & Private Mortgage Solutions',
    subtitle: 'Jumbo mortgages, bespoke construction-to-permanent loans, and portfolio residential financing.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Mortgage Guide',
    badge: 'Residential Lending',
    summary: 'Aurelith Reserve provides customized residential financing for premier homes, luxury condominiums, ranches, and estates. We specialize in complex financial profiles and portfolio underwriting.',
    sections: [
      {
        title: 'Private Mortgage Programs',
        content: [
          'Traditional retail lenders often struggle with business owners, partners, and high-net-worth borrowers who have non-standard income documentation. Aurelith Reserve evaluates full balance sheet strength:',
        ],
        listItems: [
          'Custom Jumbo Mortgages: Competitive fixed and adjustable-rate loans for luxury properties exceeding conforming loan limits, with generous loan-to-value allowances.',
          'Construction-to-Permanent Financing: Single-closing loan structures that convert smoothly from builder disbursements to a long-term mortgage upon certificate of occupancy.',
          'Second Home & Ranch Financing: Specialized acreage underwriting for recreational ranches, family compounds, and vacation estates.',
          'Bridge & Cross-Collateralization: Purchase your next residence before selling your current property without contingency delays.'
        ]
      },
      {
        title: 'Relationship Rate Reductions',
        content: [
          'Clients who maintain eligible depository or investment balances at Aurelith Reserve qualify for tiered interest rate discounts and origination credit waivers on their residential mortgages.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Equal Housing Lender',
          text: 'We are committed to fair lending practices. All loan applications are evaluated under strict non-discriminatory guidelines in compliance with the Fair Housing Act and Equal Credit Opportunity Act.'
        }
      }
    ],
    relatedPages: [
      { title: 'Personal Banking', pageId: 'personal-banking' },
      { title: 'Real Estate & Property Management', pageId: 'real-estate' },
      { title: 'Personal Borrowing', pageId: 'personal-borrowing' }
    ],
    primaryCta: { label: 'Explore Mortgage Calculators', action: 'calculator' }
  },

  'investment-advisors': {
    id: 'investment-advisors',
    title: 'Investment Advisors & Private Wealth Consulting',
    subtitle: 'Fiduciary portfolio guidance, tax-aware wealth structuring, and customized family office services.',
    category: 'Banking & Lending',
    effectiveDate: '2026 Wealth Advisory',
    badge: 'Advisory Excellence',
    summary: 'Partner with seasoned Chartered Financial Analysts (CFA) and Certified Financial Planners (CFP) dedicated to aligning your balance sheet with your family’s generational aspirations.',
    sections: [
      {
        title: 'Fiduciary Wealth Philosophy',
        content: [
          'Our wealth advisors operate under a strict fiduciary standard, placing your interests ahead of all else. We do not manufacture proprietary investment products or accept third-party distribution kickbacks.',
          'Every investment policy statement (IPS) is tailored to your unique risk tolerance, liquidity timelines, tax bracket, and ESG or ethical preferences.'
        ]
      },
      {
        title: 'Comprehensive Advisory Disciplines',
        content: [
          'Our advisory engagement integrates every dimension of your balance sheet:',
        ],
        listItems: [
          'Discretionary Asset Management: Dynamic asset allocation across global equities, investment-grade fixed income, real assets, and private markets.',
          'Tax-Efficient Wealth Harvesting: Systematic tax-loss harvesting, asset location optimization, and charitable gift fund structuring.',
          'Executive Concentrated Equity Solutions: Hedging strategies, 10b5-1 trading plans, and cashless option exercise programs.',
          'Multi-Generational Family Governance: Family wealth education, mission statement drafting, and wealth transfer stewardship.'
        ]
      },
      {
        title: 'Regulatory Disclaimers',
        content: [
          'Investment and insurance products are not deposits, are not FDIC insured, are not insured by any federal government agency, are not guaranteed by the bank, and may lose value.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Investment Management', pageId: 'investment-management' },
      { title: 'Trust Management', pageId: 'trust-management' },
      { title: 'Estate Management', pageId: 'estate-management' }
    ],
    primaryCta: { label: 'Schedule an Advisory Consultation', action: 'contact' }
  },

  'mobile-banking': {
    id: 'mobile-banking',
    title: 'Online & Mobile Banking Platform',
    subtitle: 'Next-generation digital financial controls, biometric access, real-time alerts, and instant transfers.',
    category: 'Banking & Lending',
    effectiveDate: 'v4.8 Release 2026',
    badge: 'Digital Banking',
    summary: 'Experience seamless control over all your accounts with Aurelith Reserve Online & Mobile Banking. Designed for speed, security, and intuitive financial oversight across desktop, tablet, and smartphone.',
    sections: [
      {
        title: 'Platform Capabilities',
        content: [
          'Manage your complete banking lifecycle from anywhere with institutional-grade functionality:',
        ],
        listItems: [
          'Real-Time Balance & Transaction Monitoring: Instant visibility across all checking, savings, loan, and credit card accounts.',
          'Internal & External Account Transfers: Move funds instantaneously between your accounts or initiate ACH transfers to external financial institutions.',
          'Remote Mobile Check Deposit: Securely deposit checks with immediate image validation and accelerated clearing.',
          'Bill Pay & Recurring Automated Disbursements: Schedule one-time or recurring payments to utilities, vendors, and service providers.',
          'Card Management & Instant Freeze: Instantly lock cards, adjust transaction limits, or report lost or stolen cards with a single tap.'
        ]
      },
      {
        title: 'Security & Biometric Architecture',
        content: [
          'Our digital portal employs TLS 1.3 encryption, multi-factor hardware key authentication, and continuous behavioral anomaly detection to protect against unauthorized access.',
          'Aurelith Reserve will never contact you by phone, email, or text to request your password, one-time passcode, or security PIN.'
        ],
        callout: {
          type: 'info',
          title: 'Direct Sign-In Portal',
          text: 'Already registered for digital access? Sign in directly through our encrypted portal to access your statements and transaction history.'
        }
      }
    ],
    relatedPages: [
      { title: 'Personal Banking', pageId: 'personal-banking' },
      { title: 'Business Solutions', pageId: 'business-solutions' },
      { title: 'Privacy Policy', pageId: 'privacy' }
    ],
    primaryCta: { label: 'Sign In to Banking Portal', action: 'sign-in' }
  },

  // ================= WEALTH MANAGEMENT =================
  'employee-benefits': {
    id: 'employee-benefits',
    title: 'Employee Benefits & Corporate Retirement Plans',
    subtitle: 'Institutional 401(k) plan design, executive deferred compensation, and fiduciary compliance.',
    category: 'Wealth Management',
    effectiveDate: '2026 Plan Year',
    badge: 'Retirement Advisory',
    summary: 'Attract and retain executive talent with customized qualified retirement plans, Non-Qualified Deferred Compensation (NQDC), and turnkey corporate benefit consulting.',
    sections: [
      {
        title: 'Corporate Retirement Architecture',
        content: [
          'We partner with business owners, CFOs, and plan sponsors to design, implement, and monitor employer-sponsored retirement programs:',
        ],
        listItems: [
          'Qualified 401(k) & Profit-Sharing Plans: Modern open-architecture investment lineups, automated payroll integration, and competitive administrative pricing.',
          'Defined Benefit & Cash Balance Plans: Maximize tax-deductible contributions for high-earning business owners and professional partners.',
          'Non-Qualified Deferred Compensation (NQDC): Tailored executive retention plans that allow key officers to defer compensation beyond 401(k) statutory caps.',
          'Key Person & Corporate Life Insurance: Protect company continuity against the unexpected loss of essential executives and founders.'
        ]
      },
      {
        title: 'Fiduciary Protection for Plan Sponsors',
        content: [
          'Aurelith Reserve acts as an ERISA 3(21) or 3(38) investment fiduciary, assuming documented legal responsibility for the selection and ongoing surveillance of plan investment options, protecting company directors from fiduciary exposure.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Business Banking', pageId: 'business-banking' },
      { title: 'Investment Management', pageId: 'investment-management' },
      { title: 'Transparency in Coverage', pageId: 'transparency' }
    ],
    primaryCta: { label: 'Request Plan Sponsor Review', action: 'contact' }
  },

  'estate-management': {
    id: 'estate-management',
    title: 'Estate Management & Settlement Services',
    subtitle: 'Professional executor services, probate administration, asset valuation, and legacy preservation.',
    category: 'Wealth Management',
    effectiveDate: '2026 Estate Services',
    badge: 'Legacy Settlement',
    summary: 'Navigating estate administration demands professional rigor, fiduciary impartiality, and deep technical acumen. Aurelith Reserve acts as corporate executor, co-executor, and agent for fiduciary.',
    sections: [
      {
        title: 'Comprehensive Estate Settlement',
        content: [
          'Administering a complex estate requires coordinating legal, tax, appraisal, and accounting requirements across jurisdictions:',
        ],
        listItems: [
          'Corporate Executor & Administrator: Managing probate court filings, marshaling assets, satisfying legitimate debts, and executing testamentary distributions.',
          'Agent for Named Individual Executor: Providing administrative, accounting, and tax support to family members serving as executors.',
          'Valuation & Disposition of Complex Assets: Appraising private business interests, real estate holdings, mineral leases, and valuable collections.',
          'Estate Tax Preparation & Audit Representation: Preparing IRS Form 706 and coordinating with legal counsel to optimize marital and charitable deductions.'
        ]
      },
      {
        title: 'Impartiality & Family Harmony',
        content: [
          'Appointing a corporate fiduciary eliminates emotional friction among beneficiaries, ensuring that testamentary wishes are executed strictly in accordance with legal governing instruments.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Trust Management', pageId: 'trust-management' },
      { title: 'Real Estate & Property Management', pageId: 'real-estate' },
      { title: 'Oil & Gas Lease Management', pageId: 'oil-gas' }
    ],
    primaryCta: { label: 'Consult Estate Officers', action: 'contact' }
  },

  'investment-management': {
    id: 'investment-management',
    title: 'Investment Management & Asset Allocation',
    subtitle: 'Institutional portfolio construction, disciplined risk budgeting, and open-architecture access.',
    category: 'Wealth Management',
    effectiveDate: '2026 Portfolio Strategy',
    badge: 'Portfolio Strategy',
    summary: 'Our investment team delivers disciplined, evidence-based asset management designed to preserve real purchasing power and compound generational wealth across diverse economic cycles.',
    sections: [
      {
        title: 'Investment Philosophy & Discipline',
        content: [
          'We construct institutional-caliber portfolios grounded in academic modern portfolio theory, factor investing, and rigorous risk attribution.',
          'Rather than chasing short-term market hype, we emphasize strategic asset allocation, broad global diversification, low internal friction, and tactical opportunistic rebalancing.'
        ]
      },
      {
        title: 'Asset Classes & Portfolio Solutions',
        content: [
          'We curate portfolios utilizing high-conviction building blocks tailored to client liquidity parameters:',
        ],
        listItems: [
          'Global Equities: Core large-cap value and growth, international developed markets, and selective emerging market exposure.',
          'Fixed Income & Municipal Debt: Customized separately managed accounts (SMAs) of individual investment-grade bonds to deliver predictable tax-advantaged cash flows.',
          'Real Assets & Commodities: Treasury Inflation-Protected Securities (TIPS), infrastructure allocations, and natural resource equities for inflation mitigation.',
          'Alternative Investments: Qualified purchasers gain access to private credit, real estate syndications, and private equity funds.'
        ]
      },
      {
        title: 'Risk Management Architecture',
        content: [
          'Our Investment Committee monitors portfolio factor sensitivities, duration exposure, and liquidity stresses continuously using institutional stress-testing analytics.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Mandatory Disclosure',
          text: 'Investments are subject to market risks, including the possible loss of principal. Past performance is no guarantee of future results.'
        }
      }
    ],
    relatedPages: [
      { title: 'Investment Advisors', pageId: 'investment-advisors' },
      { title: 'Trust Management', pageId: 'trust-management' },
      { title: 'Estate Management', pageId: 'estate-management' }
    ],
    primaryCta: { label: 'Review Your Portfolio with Us', action: 'contact' }
  },

  'oil-gas': {
    id: 'oil-gas',
    title: 'Oil & Gas Lease Management & Mineral Rights',
    subtitle: 'Specialized fiduciary management for mineral, royalty, and working interest owners throughout North America.',
    category: 'Wealth Management',
    effectiveDate: '2026 Energy Advisory',
    badge: 'Energy Trust Asset Group',
    summary: 'Aurelith Reserve manages mineral, royalty, and non-operated working interests held within trusts, estates, and private partnerships. Our energy specialists maximize revenue while ensuring contract compliance.',
    sections: [
      {
        title: 'Specialized Mineral Stewardship',
        content: [
          'Managing oil, gas, and mineral interests requires specialized engineering, legal, and accounting competencies. Our dedicated Energy Asset Management team has managed basins across Texas, Oklahoma, New Mexico, and Louisiana for decades.',
          'We safeguard client interests by actively monitoring operator activity, tracking drilling permits, and negotiating lease terms that maximize bonus, royalty, and environmental protections.'
        ]
      },
      {
        title: 'Core Energy Asset Services',
        content: [
          'Our turnkey administration relieves families and trusts of onerous day-to-day burdens:',
        ],
        listItems: [
          'Lease Negotiation & Environmental Covenants: Securing maximum royalty percentages, Pugh clauses, shut-in restrictions, and environmental remediation warranties.',
          'Division Order & Title Review: Verifying net revenue interest (NRI) and decimal calculations before executing division orders.',
          'Comprehensive Revenue Audit & Collection: Reconciling monthly production volumes against state regulatory reports to identify uncollected royalties and unauthorized deductions.',
          'Ad Valorem & Severance Tax Management: Filing accurate rendition statements with county appraisal districts to prevent over-assessments.',
          'Litigation & Settlement Escrows: Holding disputed royalty proceeds in secure, interest-bearing escrow pending title curative resolution.'
        ]
      },
      {
        title: 'Basin Intelligence',
        content: [
          'With active monitoring of the Permian Basin (Midland and Delaware), Eagle Ford, Haynesville, and Barnett shales, our specialists provide real-time market valuations and asset sale advisory.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Trust Management', pageId: 'trust-management' },
      { title: 'Real Estate & Property Management', pageId: 'real-estate' },
      { title: 'Estate Management', pageId: 'estate-management' }
    ],
    primaryCta: { label: 'Connect with Energy Trust Team', action: 'contact' }
  },

  'real-estate': {
    id: 'real-estate',
    title: 'Real Estate & Property Management',
    subtitle: 'Fiduciary property oversight, commercial lease administration, acquisition advisory, and trust real estate holdings.',
    category: 'Wealth Management',
    effectiveDate: '2026 Property Advisory',
    badge: 'Real Estate Fiduciary',
    summary: 'Aurelith Reserve provides comprehensive oversight of real estate assets held in fiduciary accounts, trusts, and family partnerships, ensuring optimal maintenance, tenant leasing, and capital appreciation.',
    sections: [
      {
        title: 'Institutional Property Oversight',
        content: [
          'Real estate often represents the largest and most complex illiquid portion of a family trust or estate portfolio. Our licensed property executives oversee residential, commercial, industrial, and agricultural holdings with institutional discipline.',
          'We maintain independent property evaluations, competitive lease structures, and comprehensive hazard/liability insurance coverage across all managed assets.'
        ]
      },
      {
        title: 'Management & Transactional Capabilities',
        content: [
          'Our property specialists handle all aspects of property stewardship:',
        ],
        listItems: [
          'Commercial & Residential Lease Administration: Marketing vacancies, vetting creditworthy tenants, drafting lease agreements, and enforcing timely collections.',
          'Physical Inspections & Capital Project Oversight: Conducting periodic structural surveys, bidding out capital improvements, and overseeing vendor repairs.',
          'Property Tax Appeals & Representation: Auditing municipal property tax assessments and filing appeals to lower tax liabilities.',
          'Acquisition & Disposition Execution: Engaging leading commercial brokers, vetting purchase offers, and conducting environmental due diligence.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Home Loans & Mortgages', pageId: 'home-loans' },
      { title: 'Trust Management', pageId: 'trust-management' },
      { title: 'Oil & Gas Lease Management', pageId: 'oil-gas' }
    ],
    primaryCta: { label: 'Inquire About Real Estate Services', action: 'contact' }
  },

  'trust-management': {
    id: 'trust-management',
    title: 'Trust Management & Corporate Fiduciary Services',
    subtitle: 'Independent corporate trustee, trust administration, charitable foundations, and family legacy stewardship.',
    category: 'Wealth Management',
    effectiveDate: '2026 Trust Charter',
    badge: 'Trustee Services',
    summary: 'Aurelith Reserve serves as corporate trustee, successor trustee, and co-trustee for revocable, irrevocable, dynasty, and charitable trusts. We ensure your legacy is faithfully administered across generations.',
    sections: [
      {
        title: 'The Advantage of a Corporate Trustee',
        content: [
          'Naming an individual family member as trustee frequently leads to emotional conflict, unintentional breaches of fiduciary duty, and premature depletion of trust capital.',
          'As an institution with continuous corporate existence, Aurelith Reserve provides uninterrupted stewardship, professional investment expertise, and strict impartiality according to the trust agreement.'
        ],
        callout: {
          type: 'highlight',
          title: 'Perpetual Continuity',
          text: 'Unlike individual trustees who may relocate, fall ill, or pass away, a corporate trustee ensures decades of seamless administration without legal disruption.'
        }
      },
      {
        title: 'Trust Structures We Administer',
        content: [
          'Our trust officers administer a comprehensive spectrum of estate planning vehicles:',
        ],
        listItems: [
          'Revocable Living Trusts: Providing incapacity protection during your lifetime and private, probate-free distribution upon death.',
          'Irrevocable Dynasty Trusts: Shielding family wealth from estate transfer taxes, creditors, and legal claims for multiple generations.',
          'Charitable Remainder & Lead Trusts (CRT / CLT): Achieving philanthropic goals while capturing substantial income and estate tax deductions.',
          'Special Needs Trusts (SNT): Safeguarding financial security for family members with disabilities without jeopardizing means-tested public benefits.',
          'Directed & Delegated Trusts: Collaborating seamlessly with outside financial advisors and family investment committees.'
        ]
      },
      {
        title: 'Fiduciary Accounting & Beneficiary Support',
        content: [
          'Beneficiaries receive clear, transparent monthly fiduciary accounting statements, timely principal and income distributions, and compassionate personal service.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Estate Management', pageId: 'estate-management' },
      { title: 'Investment Management', pageId: 'investment-management' },
      { title: 'Oil & Gas Lease Management', pageId: 'oil-gas' }
    ],
    primaryCta: { label: 'Consult a Senior Trust Officer', action: 'contact' }
  },

  // ================= LEGAL, PRIVACY & ACCESSIBILITY =================
  'policies': {
    id: 'policies',
    title: 'Policies & Regulatory Disclosures',
    subtitle: 'Official catalog of governing regulations, deposit disclosures, funds availability, and account rules.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'January 2026 Edition',
    badge: 'Regulatory Index',
    summary: 'Aurelith Reserve operates under strict federal and state banking standards. Review our core account disclosures, funds availability policies, electronic transfer rules, and statutory consumer protections.',
    sections: [
      {
        title: 'Master Disclosure Index',
        content: [
          'The following regulatory disclosures govern your accounts and banking transactions at Aurelith Reserve. These policies are incorporated into your Master Account Agreement:',
        ],
        listItems: [
          'Regulation E (Electronic Fund Transfers): Details consumer rights and liabilities regarding debit card transactions, automated clearing house (ACH) payments, ATM withdrawals, and error resolution timelines.',
          'Regulation CC (Expedited Funds Availability Act): Outlines when funds deposited via check, wire, or electronic transfer become available for withdrawal.',
          'Regulation DD (Truth in Savings Act): Discloses annual percentage yields (APY), interest calculation methodologies, compounding frequencies, and minimum opening balance thresholds.',
          'Regulation B (Equal Credit Opportunity Act): Prohibits discrimination in credit transactions based on race, color, religion, national origin, sex, marital status, age, or public assistance status.',
          'Unlawful Internet Gambling Enforcement Act (UIGEA) Notice: Notice prohibiting restricted transactions from being processed through business accounts.',
          'USA PATRIOT Act Customer Identification Program (CIP): Federal law requires all financial institutions to obtain, verify, and record identity verification information before opening accounts.'
        ]
      },
      {
        title: 'Funds Availability Summary (Reg CC)',
        content: [
          'Electronic direct deposits and cash deposits made at our tellers are available on the day of deposit.',
          'Generally, funds from U.S. Treasury, state, and local government checks, as well as cashier’s checks, are available on the first business day following the banking day of deposit.',
          'Longer hold periods may apply in cases of checks totaling over $5,525, accounts opened less than 30 days, re-deposited checks, or where reasonable cause exists to doubt collectibility.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Error Resolution Procedure',
          text: 'If you notice an error or question an electronic transfer on your statement, you must notify us within 60 days after the statement was sent. Contact our operations team immediately at 855-660-5862.'
        }
      },
      {
        title: 'Overdraft & Fee Schedules',
        content: [
          'We believe in fee transparency. Our current Schedule of Fees is provided at account opening and remains accessible at all times through your online banking profile or at any regional banking center.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Privacy Policy', pageId: 'privacy' },
      { title: 'Terms of Use', pageId: 'terms' },
      { title: 'Transparency in Coverage', pageId: 'transparency' }
    ],
    primaryCta: { label: 'Contact Compliance Department', action: 'contact' }
  },

  'privacy': {
    id: 'privacy',
    title: 'Privacy Policy & Data Protection',
    subtitle: 'Transparent notice on how personal and financial information is collected, safeguarded, shared, and managed.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'Updated January 1, 2026',
    badge: 'GLBA Compliant',
    summary: 'Aurelith Reserve respects your privacy and is committed to protecting your non-public personal information (NPI). This notice describes our data handling practices under the Gramm-Leach-Bliley Act (GLBA) and applicable consumer privacy frameworks.',
    sections: [
      {
        title: 'Information We Collect',
        content: [
          'To provide financial services, process transactions, and satisfy federal anti-money laundering regulations, we collect information from several sources:',
        ],
        listItems: [
          'Direct Application Information: Names, residential addresses, social security numbers, taxpayer identification numbers, government-issued photo IDs, dates of birth, employment details, and income figures.',
          'Transaction & Account History: Account balances, payment histories, wire transfer instructions, debit card usage, and credit performance with us.',
          'Third-Party Verification Information: Credit reports from consumer reporting agencies to evaluate creditworthiness, as well as fraud mitigation registries.',
          'Digital & Technical Data: IP addresses, device identifiers, browser types, operating systems, session duration, and cookie identifiers collected when you interact with our website or digital banking application.'
        ]
      },
      {
        title: 'How We Use & Protect Your Information',
        content: [
          'We use your information strictly for legitimate banking operations, including authenticating your identity, executing your transactions, managing loans, preventing fraudulent activity, and complying with statutory audit requirements.',
          'We maintain physical, electronic, and procedural safeguards that comply with federal standards to protect your personal information against unauthorized access, destruction, or interception.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Zero Third-Party Marketing Sales',
          text: 'Aurelith Reserve does not sell, rent, or trade your personal information to third-party telemarketers, data brokers, or marketing aggregators. Ever.'
        }
      },
      {
        title: 'When Information Is Shared',
        content: [
          'We share personal information only as permitted or required by law:',
        ],
        listItems: [
          'With service providers who perform core operations on our behalf (e.g., check clearing processors, core banking software hosts, statement printers, card embossing networks) under strict confidentiality agreements.',
          'With consumer reporting agencies in accordance with the Fair Credit Reporting Act (FCRA).',
          'In response to lawful court subpoenas, regulatory audits by the FDIC or state banking authorities, or to report suspected financial crimes.'
        ]
      },
      {
        title: 'Your Privacy Rights & Opt-Out Choices',
        content: [
          'Under federal law, you have the right to limit the sharing of information about your creditworthiness among affiliates for their everyday business purposes.',
          'You may also opt out of direct marketing communications at any time by updating your preferences in your online banking profile or submitting a written privacy inquiry to privacy@aurelithreserve.com.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Terms of Use', pageId: 'terms' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Report an Accessibility Issue', pageId: 'accessibility' }
    ],
    primaryCta: { label: 'Submit Privacy Inquiry', action: 'contact' }
  },

  'terms': {
    id: 'terms',
    title: 'Terms of Use & Website Agreement',
    subtitle: 'Rules, permitted uses, intellectual property rights, and legal terms governing access to Aurelith Reserve digital platforms.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'Effective January 2026',
    badge: 'Legal Agreement',
    summary: 'Please review these Terms of Use carefully before using the Aurelith Reserve website, mobile application, or digital banking services. By accessing or using our platforms, you agree to be bound by these provisions.',
    sections: [
      {
        title: 'Acceptance of Terms & Permitted Use',
        content: [
          'These Terms of Use constitute a legally binding agreement between you and Aurelith Reserve. You are granted a limited, revocable, non-exclusive license to access public informational materials and authorized private banking portals for your personal or authorized enterprise financial management.',
          'You agree not to use the platforms for any unlawful purpose, including attempting to reverse engineer systems, scrape proprietary data, inject malicious code, or bypass multi-factor authentication controls.'
        ]
      },
      {
        title: 'Account Security & Credential Responsibilities',
        content: [
          'You are responsible for maintaining the strict confidentiality of your username, password, biometric tokens, and two-factor verification codes.',
          'You agree to notify Aurelith Reserve immediately if you suspect any unauthorized access to your account or compromise of your login credentials.'
        ],
        callout: {
          type: 'regulatory',
          title: 'Account Responsibility',
          text: 'Transactions conducted using verified authentication credentials are presumed authorized under applicable federal electronic banking regulations.'
        }
      },
      {
        title: 'Intellectual Property Rights',
        content: [
          'All trademarks, logos, service marks, graphics, page headers, custom code, and text displayed on this website are the proprietary property of Aurelith Reserve or its licensors.',
          'Nothing contained herein shall be construed as granting any license or right to use any trademark without prior written permission from Aurelith Reserve.'
        ]
      },
      {
        title: 'Disclaimer of Warranties & Limitation of Liability',
        content: [
          'While we endeavor to provide accurate and uninterrupted service, our digital platforms and content are provided on an "as is" and "as available" basis without warranties of any kind.',
          'To the fullest extent permitted by applicable law, Aurelith Reserve shall not be liable for direct, indirect, incidental, special, or consequential damages resulting from platform downtime, communication network failures, or reliance on published content.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Privacy Policy', pageId: 'privacy' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Summary Annual Report (SAR)', pageId: 'sar' }
    ],
    primaryCta: { label: 'Read Policies & Disclosures', action: 'contact' }
  },

  'transparency': {
    id: 'transparency',
    title: 'Transparency in Coverage Disclosures',
    subtitle: 'Fulfilling statutory disclosure requirements under the Federal Transparency in Coverage Final Rule.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'Enacted Under Federal Rule',
    badge: 'Statutory Notice',
    summary: 'Under the federal Transparency in Coverage Final Rule issued by the U.S. Department of Health and Human Services, Department of Labor, and Department of the Treasury, health plans are required to publish public machine-readable files.',
    sections: [
      {
        title: 'Purpose of Transparency in Coverage',
        content: [
          'The Transparency in Coverage regulation requires health plans and health insurance issuers to make public machine-readable files containing in-depth pricing data for covered items and services.',
          'These files are designed to promote healthcare cost transparency, enabling researchers, regulators, and consumers to compare negotiated rates and out-of-network allowed amounts across healthcare providers.'
        ]
      },
      {
        title: 'Employee Benefit Plan Disclosure',
        content: [
          'For the Aurelith Reserve Comprehensive Health & Welfare Plan, machine-readable files containing in-network negotiated rates and historical out-of-network allowed amounts are generated and maintained directly by our third-party plan administrators.',
          'These files are formatted in strict accordance with CMS technical specifications (JSON format) and are updated on a monthly basis.'
        ],
        callout: {
          type: 'info',
          title: 'Machine-Readable File Notice',
          text: 'These files are technical data sets intended for data analysts and software developers. They are not designed as individual patient cost calculators or policy documentation.'
        }
      },
      {
        title: 'Accessing Administrator Files',
        content: [
          'To view the published machine-readable files for Aurelith Reserve employee group medical coverage, plan participants and members of the public may request specific administrator URI links by contacting our Benefits Compliance office at benefits.transparency@aurelithreserve.com.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Employee Benefits', pageId: 'employee-benefits' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Careers', pageId: 'careers' }
    ],
    primaryCta: { label: 'Contact Benefits Compliance', action: 'contact' }
  },

  'sar': {
    id: 'sar',
    title: 'Summary Annual Report (SAR)',
    subtitle: 'Official summary disclosures for employee welfare benefit plans under ERISA requirements.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'Plan Year Ending Dec 31, 2025',
    badge: 'ERISA Compliance',
    summary: 'This Summary Annual Report provides plan participants and beneficiaries with an annual financial summary of the Aurelith Reserve Welfare Benefit Plan, in compliance with the Employee Retirement Income Security Act of 1974 (ERISA).',
    sections: [
      {
        title: 'Overview & Statutory Purpose',
        content: [
          'Under ERISA § 104(b)(3), sponsors of employee welfare benefit plans are required to furnish participants with a summary of the financial information reported on the annual Form 5500 filed with the U.S. Department of Labor.',
          'This report informs plan participants about the financial condition of the plan, insurance premiums paid, claims settled, and administrative expenses incurred during the reporting cycle.'
        ]
      },
      {
        title: 'Insurance & Claims Summary',
        content: [
          'The Aurelith Reserve Employee Welfare Plan provides medical, prescription drug, dental, vision, life, and disability benefits to eligible active employees and their dependents.',
          'Benefits are funded through a combination of employer contributions and participant pre-tax payroll salary deductions, held under custodial trust arrangements or paid directly to licensed insurance carriers under group policies.'
        ]
      },
      {
        title: 'Participant Rights & Document Requests',
        content: [
          'Plan participants have the right to receive a copy of the full Form 5500 Annual Return/Report upon written request to the Plan Administrator.',
          'You also have the right to examine the annual report at the main office of the Plan Administrator during normal business hours or to obtain copies from the Employee Benefits Security Administration (EBSA), U.S. Department of Labor.'
        ],
        callout: {
          type: 'info',
          title: 'Plan Administrator Contact',
          text: 'Requests for full Form 5500 copies may be directed to: Aurelith Reserve Plan Administrator, Office of Human Capital & Fiduciary Compliance, 1000 Louisiana St, Suite 4200, Houston, TX 77002.'
        }
      }
    ],
    relatedPages: [
      { title: 'Transparency in Coverage', pageId: 'transparency' },
      { title: 'Employee Benefits', pageId: 'employee-benefits' },
      { title: 'Investor Relations', pageId: 'investor-relations' }
    ],
    primaryCta: { label: 'Request Official Documents', action: 'contact' }
  },

  'accessibility': {
    id: 'accessibility',
    title: 'Report an Accessibility Issue',
    subtitle: 'Our commitment to digital inclusion, WCAG 2.1 AA conformance, and prompt accessibility assistance.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: 'Active Accessibility Portal',
    badge: 'Digital Inclusion',
    summary: 'Aurelith Reserve is committed to ensuring that our digital platforms and banking services are fully accessible to individuals with disabilities. We continually enhance user experience according to Web Content Accessibility Guidelines (WCAG 2.1 Level AA).',
    sections: [
      {
        title: 'Our Accessibility Commitment',
        content: [
          'We believe in equitable banking access for all individuals. Our digital design and engineering teams follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as our baseline standard.',
          'Our platform is designed with semantic HTML structures, high-contrast color pairings, keyboard navigation compatibility, aria-labels for assistive screen readers, and scalable typographic hierarchies.'
        ]
      },
      {
        title: 'Assistive Banking Services',
        content: [
          'In addition to digital optimizations, Aurelith Reserve provides multi-channel accessibility accommodations:',
        ],
        listItems: [
          'Telecommunications Relay Service (TRS): We accept calls from TRS providers for deaf or hard-of-hearing clients.',
          'Alternative Statement Formats: Account statements and disclosures are available upon request in large print or accessible electronic formats.',
          'Audio-Enabled ATMs: All proprietary Aurelith Reserve ATMs are equipped with headphone jacks and tactile braille keypads.'
        ]
      },
      {
        title: 'Submit an Accessibility Inquiry or Report a Problem',
        content: [
          'If you encounter an accessibility barrier or experience difficulty using any portion of our website or mobile application, please submit the report below. Our dedicated accessibility compliance coordinator will review your ticket and assist you directly.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Privacy Policy', pageId: 'privacy' },
      { title: 'Terms of Use', pageId: 'terms' },
      { title: 'Contact & Support', pageId: 'contact' }
    ],
    primaryCta: { label: 'Submit Issue Below', action: 'contact' }
  },

  // ================= SUPPORT & SUPPLEMENTARY =================
  'payment': {
    id: 'payment',
    title: 'Make a Loan Payment',
    subtitle: 'Secure payment options for commercial term loans, residential mortgages, and personal credit lines.',
    category: 'Resources & Support',
    effectiveDate: '2026 Payment Hub',
    badge: 'Loan Servicing',
    summary: 'Quickly and securely schedule a payment toward your Aurelith Reserve mortgage, commercial credit line, or personal term loan using our automated payment gateway.',
    sections: [
      {
        title: 'Convenient Payment Methods',
        content: [
          'We offer several flexible methods to keep your loan accounts in good standing:',
        ],
        listItems: [
          'Direct Online Banking Transfer: Move funds instantly from an Aurelith Reserve checking or savings account with no fee.',
          'External Bank ACH Debit: Link any external U.S. checking account to make one-time payments or establish recurring automatic monthly debits.',
          'Wire Transfer: Send same-day Fedwire funds using our official loan servicing routing and SWIFT identifiers.',
          'By Mail or In-Branch: Deposit checks at any regional banking center or mail payments with your loan coupon voucher.'
        ]
      },
      {
        title: 'Loan Servicing Routing Details',
        content: [
          'When remitting payment via external bill pay or wire transfer, include your 10-digit loan account number in the memo field.',
          'Routing Number: 111301122 | SWIFT Code: FITEUS41'
        ]
      }
    ],
    relatedPages: [
      { title: 'Online & Mobile Banking', pageId: 'mobile-banking' },
      { title: 'Home Loans', pageId: 'home-loans' },
      { title: 'Business Borrowing', pageId: 'business-borrowing' }
    ],
    primaryCta: { label: 'Sign In to Pay Online', action: 'sign-in' }
  },

  'terms-conditions': {
    id: 'terms-conditions',
    title: 'Terms and Conditions',
    subtitle: 'General depository agreements, fee schedules, electronic authorizations, and governing rules.',
    category: 'Legal, Privacy & Accessibility',
    effectiveDate: '2026 Edition',
    badge: 'Account Conditions',
    summary: 'Comprehensive terms and conditions governing checking, savings, certificate of deposit, and digital banking accounts established with Aurelith Reserve.',
    sections: [
      {
        title: 'Master Depository Terms',
        content: [
          'When you open an account with Aurelith Reserve, you agree to the rules and regulations established in our Master Account Agreement.',
          'These terms specify minimum opening deposit requirements, interest calculation formulas, joint tenancy survivorship rules, and authorized signer protocols.'
        ]
      },
      {
        title: 'Amendments & Fee Revisions',
        content: [
          'Aurelith Reserve reserves the right to amend account terms, interest yields, and service fee schedules in accordance with applicable state and federal statutory advance notice periods.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Terms of Use', pageId: 'terms' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Privacy Policy', pageId: 'privacy' }
    ],
    primaryCta: { label: 'View All Policies', action: 'contact' }
  },

  'sitemap': {
    id: 'sitemap',
    title: 'Sitemap & Directory',
    subtitle: 'Complete navigational directory of Aurelith Reserve personal, business, wealth, and legal resources.',
    category: 'Resources & Support',
    effectiveDate: 'Full Site Index 2026',
    badge: 'Directory',
    summary: 'Quickly find any page, product, advisory discipline, or regulatory filing across the Aurelith Reserve digital ecosystem.',
    sections: [
      {
        title: 'Company & Regional Leadership',
        content: [
          'Explore institutional information, regional offices, and corporate leadership:',
        ],
        listItems: [
          'Bank Regions — Regional divisions, credit authorities, and footprint overview.',
          'Careers — Professional opportunities, culture, and benefits.',
          'Investor Relations — Financial health, capital adequacy, and governance.',
          'Locations — Branch addresses, drive-thru lanes, and ATM network.',
          'Who We Are — Heritage, mission, and private reserve philosophy.'
        ]
      },
      {
        title: 'Banking & Lending Services',
        content: [
          'Explore accounts, borrowing options, and digital access:',
        ],
        listItems: [
          'Open an Account — Premier onboarding and account selection.',
          'Personal Banking — Checking, high-yield savings, CDs, and liquidity.',
          'Personal Borrowing — SBLOC, signature loans, and custom credit.',
          'Business Banking — Commercial operating accounts and IOLTA.',
          'Business Borrowing — Working capital, equipment, and CRE financing.',
          'Business Solutions — Treasury management, lockbox, and merchant acquiring.',
          'Home Loans — Jumbo mortgages, construction, and estate financing.',
          'Investment Advisors — Fiduciary wealth guidance and family office planning.',
          'Online & Mobile Banking — Biometric access, remote deposit, and digital transfers.'
        ]
      },
      {
        title: 'Wealth Management & Fiduciary Trust',
        content: [
          'Institutional wealth and asset management disciplines:',
        ],
        listItems: [
          'Employee Benefits — Corporate retirement plans and 401(k) fiduciary.',
          'Estate Management — Executor services, probate, and tax filings.',
          'Investment Management — Portfolio strategy, asset allocation, and SMAs.',
          'Oil & Gas Lease Management — Mineral rights, division orders, and energy trust.',
          'Real Estate & Property Management — Commercial leases and physical oversight.',
          'Trust Management — Corporate trustee, dynasty trusts, and charitable trusts.'
        ]
      },
      {
        title: 'Legal, Disclosures & Accessibility',
        content: [
          'Statutory compliance and consumer protection disclosures:',
        ],
        listItems: [
          'Policies & Disclosures — Regulation E, CC, DD, and fee index.',
          'Privacy Policy — Data handling, GLBA protections, and opt-outs.',
          'Terms of Use — Website access, credentials, and legal terms.',
          'Transparency in Coverage — Machine-readable health files.',
          'Summary Annual Report (SAR) — ERISA welfare benefit plan summary.',
          'Report an Accessibility Issue — WCAG assistance and reporting form.'
        ]
      }
    ],
    relatedPages: [
      { title: 'Who We Are', pageId: 'who-we-are' },
      { title: 'Policies & Disclosures', pageId: 'policies' },
      { title: 'Locations', pageId: 'locations' }
    ],
    primaryCta: { label: 'Return to Home Page', action: 'contact' }
  }
};
