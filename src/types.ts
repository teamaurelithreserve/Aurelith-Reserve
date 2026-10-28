export interface NavItem {
  label: string;
  hasDropdown?: boolean;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export interface Article {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  readTime?: string;
  fullContent?: string;
}

export interface Testimonial {
  id: string;
  rating: number;
  name: string;
  review: string;
  location: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  hasLobby: boolean;
  hasDriveThru: boolean;
  hasATM: boolean;
}

export interface ServiceFeature {
  id: string;
  title: string;
  description: string;
  iconName: 'personal' | 'home' | 'commercial' | 'wealth';
  linkText: string;
  linkUrl: string;
}

export interface ResourceCard {
  id: string;
  title: string;
  description: string;
  iconName: 'calculator' | 'shield' | 'help';
  linkText: string;
  linkUrl: string;
}
