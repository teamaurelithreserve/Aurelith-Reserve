import { Article, Testimonial, BranchLocation, ServiceFeature, ResourceCard } from '../types';

export const serviceFeatures: ServiceFeature[] = [
  {
    id: 'personal-banking',
    title: 'Personal Banking',
    description: 'Simplify your everyday banking with innovative tools, excellent service, and options built around you.',
    iconName: 'personal',
    linkText: 'Learn More',
    linkUrl: '#personal'
  },
  {
    id: 'home-loans',
    title: 'Home Loans',
    description: 'Find the right home loan with flexible options, competitive rates, and personal service you can trust.',
    iconName: 'home',
    linkText: 'Learn More',
    linkUrl: '#home-loans'
  },
  {
    id: 'commercial-banking',
    title: 'Commercial Banking',
    description: 'Your big ideas deserve a strong partner. Our commercial banking services are designed to help businesses of all sizes thrive.',
    iconName: 'commercial',
    linkText: 'Learn More',
    linkUrl: '#commercial'
  },
  {
    id: 'wealth-management',
    title: 'Wealth Management',
    description: 'Building a strong financial future starts with a partner you know and trust. Our comprehensive wealth management services help you protect what matters most.',
    iconName: 'wealth',
    linkText: 'Learn More',
    linkUrl: '#wealth'
  }
];

export const articles: Article[] = [
  {
    id: '1',
    category: 'WEALTH MANAGEMENT',
    date: '05/22/2026',
    title: 'Financial Tools for Those with Disabilities: ABLE Accounts and Special Needs Trusts',
    excerpt: 'This article explores two key financial tools designed to support individuals with disabilities (ABLE accounts and Special Needs Trusts (SNTs)), highlighting how each can help...',
    imageUrl: 'https://i.imgur.com/u6qPlkr.png',
    imageAlt: 'Financial Tools for Those with Disabilities',
    readTime: '4 min read',
    fullContent: 'ABLE (Achieving a Better Life Experience) accounts and Special Needs Trusts are designed to help individuals with disabilities build savings without forfeiting government benefits like Medicaid or Supplemental Security Income (SSI).'
  },
  {
    id: '2',
    category: 'WEALTH MANAGEMENT',
    date: '04/24/2026',
    title: 'Retirement Planning',
    excerpt: 'Retirement planning involves key decisions that impact financial security and peace of mind. Knowing when to start Social Security benefits can significantly affect your monthly...',
    imageUrl: 'https://i.imgur.com/TwVTSPL.png',
    imageAlt: 'Retirement Planning',
    readTime: '6 min read',
    fullContent: 'A comprehensive retirement strategy balances income sources—including Social Security, pensions, 401(k) plans, and private investments—against anticipated healthcare and lifestyle costs.'
  },
  {
    id: '3',
    category: 'WEALTH MANAGEMENT',
    date: '04/24/2026',
    title: 'Financial Planning Across Generations: Strategies for Every Life Stage',
    excerpt: 'Effective generational wealth and trust management go beyond financial planning; it requires a holistic, values-driven approach that integrates family governance, education, and...',
    imageUrl: 'https://i.imgur.com/NEJQgRC.png',
    imageAlt: 'Financial Planning Across Generations',
    readTime: '5 min read',
    fullContent: 'Preserving wealth across generations requires intentional trust administration, tax mitigation, estate structuring, and open family communication.'
  },
  {
    id: '4',
    category: 'WEALTH MANAGEMENT',
    date: '03/15/2026',
    title: 'Estate & Trust Administration: Protecting Your Family Legacy',
    excerpt: 'Navigating estate planning and wealth distribution requires strategic tax planning, asset protection, and clear governance to safeguard future generations...',
    imageUrl: 'https://i.imgur.com/MAl8pb1.png',
    imageAlt: 'Estate & Trust Administration',
    readTime: '5 min read',
    fullContent: 'Preserving wealth across generations requires intentional trust administration, tax mitigation, estate structuring, and open family communication.'
  }
];

export const resourceCards: ResourceCard[] = [
  {
    id: 'loan-calculators',
    title: 'Loan Calculators',
    description: 'Make informed lending decisions! Our loan calculators make it easy to estimate monthly payments so you can plan with confidence.',
    iconName: 'calculator',
    linkText: 'Visit Calculators',
    linkUrl: '#calculators'
  },
  {
    id: 'fraud-articles',
    title: 'Fraud Prevention Articles',
    description: 'Protect yourself and your loved ones! Learning how to spot a scam is essential to keeping your accounts and information secure.',
    iconName: 'shield',
    linkText: 'Learn More',
    linkUrl: '#fraud-prevention'
  },
  {
    id: 'help-center',
    title: 'Help Center',
    description: 'Need additional help? Visit our Help Center for support with everyday banking.',
    iconName: 'help',
    linkText: 'Contact Us',
    linkUrl: '#contact'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    rating: 5,
    name: 'Donna K',
    review: 'Have used this bank for 35 yrs and we are happy! no problems / kind, professional & friendly service!! 😁',
    location: 'Abilene customer'
  },
  {
    id: '2',
    rating: 5,
    name: 'Deb P',
    review: 'Nice quiet bank, very clean and friendly people. I came here yesterday to get a document notarized. As a non-customer, I paid $5 which is very reasonable. I appreciated the friendliness.',
    location: 'Rising Star customer'
  },
  {
    id: '3',
    rating: 5,
    name: 'Jessica S',
    review: 'I had an issue with my zip code being wrong on my debit card and krista at glen rose location was able to get me all fixed and on the way in less than 5 minutes',
    location: 'Glen Rose customer'
  }
];

export const texasBranches: BranchLocation[] = [
  {
    id: 'abilene-main',
    name: 'Abilene Main Branch',
    address: '400 Pine St',
    city: 'Abilene',
    zip: '79601',
    phone: '(325) 627-7200',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    lat: 32.4487,
    lng: -99.7331,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'fort-worth',
    name: 'Fort Worth City Center',
    address: '1000 Forest Park Blvd',
    city: 'Fort Worth',
    zip: '76102',
    phone: '(817) 502-1000',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    lat: 32.7555,
    lng: -97.3308,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'glen-rose',
    name: 'Glen Rose Location',
    address: '201 SW Big Bend Trail',
    city: 'Glen Rose',
    zip: '76043',
    phone: '(254) 897-2211',
    hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
    lat: 32.2351,
    lng: -97.7553,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'rising-star',
    name: 'Rising Star Branch',
    address: '118 N College St',
    city: 'Rising Star',
    zip: '76471',
    phone: '(254) 643-2611',
    hours: 'Mon-Fri: 9:00 AM - 3:00 PM',
    lat: 32.0971,
    lng: -98.9664,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'san-angelo',
    name: 'San Angelo Main',
    address: '301 W Beauregard Ave',
    city: 'San Angelo',
    zip: '76903',
    phone: '(325) 659-8000',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    lat: 31.4638,
    lng: -100.4370,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'stephville',
    name: 'Stephenville Financial Center',
    address: '2201 W Washington St',
    city: 'Stephenville',
    zip: '76401',
    phone: '(254) 965-8500',
    hours: 'Mon-Fri: 8:30 AM - 5:00 PM',
    lat: 32.2207,
    lng: -98.2023,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  },
  {
    id: 'weatherford',
    name: 'Weatherford Regional Office',
    address: '101 N Main St',
    city: 'Weatherford',
    zip: '76086',
    phone: '(817) 598-2500',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    lat: 32.7593,
    lng: -97.7972,
    hasLobby: true,
    hasDriveThru: true,
    hasATM: true
  }
];
