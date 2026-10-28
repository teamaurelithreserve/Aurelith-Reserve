export interface CountryCallingCode {
  name: string;
  dialCode: string;
  isoCode: string;
  flag: string;
  placeholder?: string;
}

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  { name: 'United States', dialCode: '+1', isoCode: 'US', flag: '🇺🇸', placeholder: '(214) 555-0189' },
  { name: 'United Kingdom', dialCode: '+44', isoCode: 'GB', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'Canada', dialCode: '+1', isoCode: 'CA', flag: '🇨🇦', placeholder: '(416) 555-0192' },
  { name: 'Australia', dialCode: '+61', isoCode: 'AU', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Germany', dialCode: '+49', isoCode: 'DE', flag: '🇩🇪', placeholder: '151 23456789' },
  { name: 'France', dialCode: '+33', isoCode: 'FR', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'Switzerland', dialCode: '+41', isoCode: 'CH', flag: '🇨🇭', placeholder: '79 123 45 67' },
  { name: 'Singapore', dialCode: '+65', isoCode: 'SG', flag: '🇸🇬', placeholder: '8123 4567' },
  { name: 'United Arab Emirates', dialCode: '+971', isoCode: 'AE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: 'Japan', dialCode: '+81', isoCode: 'JP', flag: '🇯🇵', placeholder: '90-1234-5678' },
  { name: 'Hong Kong', dialCode: '+852', isoCode: 'HK', flag: '🇭🇰', placeholder: '9123 4567' },
  { name: 'Netherlands', dialCode: '+31', isoCode: 'NL', flag: '🇳🇱', placeholder: '6 12345678' },
  { name: 'Spain', dialCode: '+34', isoCode: 'ES', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: 'Italy', dialCode: '+39', isoCode: 'IT', flag: '🇮🇹', placeholder: '320 123 4567' },
  { name: 'Ireland', dialCode: '+353', isoCode: 'IE', flag: '🇮🇪', placeholder: '87 123 4567' },
  { name: 'Sweden', dialCode: '+46', isoCode: 'SE', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { name: 'Norway', dialCode: '+47', isoCode: 'NO', flag: '🇳🇴', placeholder: '912 34 567' },
  { name: 'Denmark', dialCode: '+45', isoCode: 'DK', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { name: 'Finland', dialCode: '+358', isoCode: 'FI', flag: '🇫🇮', placeholder: '40 1234567' },
  { name: 'Belgium', dialCode: '+32', isoCode: 'BE', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { name: 'Austria', dialCode: '+43', isoCode: 'AT', flag: '🇦🇹', placeholder: '664 1234567' },
  { name: 'New Zealand', dialCode: '+64', isoCode: 'NZ', flag: '🇳🇿', placeholder: '21 123 4567' },
  { name: 'South Africa', dialCode: '+27', isoCode: 'ZA', flag: '🇿🇦', placeholder: '82 123 4567' },
  { name: 'Sudan', dialCode: '+249', isoCode: 'SD', flag: '🇸🇩', placeholder: '91 234 5678' },
  { name: 'Saudi Arabia', dialCode: '+966', isoCode: 'SA', flag: '🇸🇦', placeholder: '50 123 4567' },
  { name: 'Qatar', dialCode: '+974', isoCode: 'QA', flag: '🇶🇦', placeholder: '3312 3456' },
  { name: 'Kuwait', dialCode: '+965', isoCode: 'KW', flag: '🇰🇼', placeholder: '9123 4567' },
  { name: 'Bahrain', dialCode: '+973', isoCode: 'BH', flag: '🇧🇭', placeholder: '3612 3456' },
  { name: 'Oman', dialCode: '+968', isoCode: 'OM', flag: '🇴🇲', placeholder: '9123 4567' },
  { name: 'Israel', dialCode: '+972', isoCode: 'IL', flag: '🇮🇱', placeholder: '50-123-4567' },
  { name: 'India', dialCode: '+91', isoCode: 'IN', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'Brazil', dialCode: '+55', isoCode: 'BR', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { name: 'Mexico', dialCode: '+52', isoCode: 'MX', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: 'Argentina', dialCode: '+54', isoCode: 'AR', flag: '🇦🇷', placeholder: '9 11 1234-5678' },
  { name: 'Chile', dialCode: '+56', isoCode: 'CL', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { name: 'Colombia', dialCode: '+57', isoCode: 'CO', flag: '🇨🇴', placeholder: '300 1234567' },
  { name: 'Nigeria', dialCode: '+234', isoCode: 'NG', flag: '🇳🇬', placeholder: '803 123 4567' },
  { name: 'Ghana', dialCode: '+233', isoCode: 'GH', flag: '🇬🇭', placeholder: '24 123 4567' },
  { name: 'Kenya', dialCode: '+254', isoCode: 'KE', flag: '🇰🇪', placeholder: '712 345678' },
  { name: 'Egypt', dialCode: '+20', isoCode: 'EG', flag: '🇪🇬', placeholder: '100 123 4567' },
  { name: 'Morocco', dialCode: '+212', isoCode: 'MA', flag: '🇲🇦', placeholder: '612-345678' },
  { name: 'Turkey', dialCode: '+90', isoCode: 'TR', flag: '🇹🇷', placeholder: '532 123 4567' },
  { name: 'Greece', dialCode: '+30', isoCode: 'GR', flag: '🇬🇷', placeholder: '691 234 5678' },
  { name: 'Portugal', dialCode: '+351', isoCode: 'PT', flag: '🇵🇹', placeholder: '912 345 678' },
  { name: 'Poland', dialCode: '+48', isoCode: 'PL', flag: '🇵🇱', placeholder: '512 345 678' },
  { name: 'Czech Republic', dialCode: '+420', isoCode: 'CZ', flag: '🇨🇿', placeholder: '601 123 456' },
  { name: 'Hungary', dialCode: '+36', isoCode: 'HU', flag: '🇭🇺', placeholder: '20 123 4567' },
  { name: 'Romania', dialCode: '+40', isoCode: 'RO', flag: '🇷🇴', placeholder: '712 345 678' },
  { name: 'Luxembourg', dialCode: '+352', isoCode: 'LU', flag: '🇱🇺', placeholder: '621 123 456' },
  { name: 'Monaco', dialCode: '+377', isoCode: 'MC', flag: '🇲🇨', placeholder: '6 12 34 56 78' },
  { name: 'Liechtenstein', dialCode: '+423', isoCode: 'LI', flag: '🇱🇮', placeholder: '660 1234' },
  { name: 'Iceland', dialCode: '+354', isoCode: 'IS', flag: '🇮🇸', placeholder: '612 3456' },
  { name: 'Cyprus', dialCode: '+357', isoCode: 'CY', flag: '🇨🇾', placeholder: '96 123456' },
  { name: 'Malta', dialCode: '+356', isoCode: 'MT', flag: '🇲🇹', placeholder: '9912 3456' },
  { name: 'South Korea', dialCode: '+82', isoCode: 'KR', flag: '🇰🇷', placeholder: '10-1234-5678' },
  { name: 'Taiwan', dialCode: '+886', isoCode: 'TW', flag: '🇹🇼', placeholder: '912 345 678' },
  { name: 'Malaysia', dialCode: '+60', isoCode: 'MY', flag: '🇲🇾', placeholder: '12-345 6789' },
  { name: 'Indonesia', dialCode: '+62', isoCode: 'ID', flag: '🇮🇩', placeholder: '812-3456-7890' },
  { name: 'Thailand', dialCode: '+66', isoCode: 'TH', flag: '🇹🇭', placeholder: '81 234 5678' },
  { name: 'Vietnam', dialCode: '+84', isoCode: 'VN', flag: '🇻🇳', placeholder: '91 234 56 78' },
  { name: 'Philippines', dialCode: '+63', isoCode: 'PH', flag: '🇵🇭', placeholder: '917 123 4567' },
  { name: 'Pakistan', dialCode: '+92', isoCode: 'PK', flag: '🇵🇰', placeholder: '300 1234567' },
  { name: 'Bangladesh', dialCode: '+880', isoCode: 'BD', flag: '🇧🇩', placeholder: '1712-345678' },
  { name: 'Cayman Islands', dialCode: '+1-345', isoCode: 'KY', flag: '🇰🇾', placeholder: '916-1234' },
  { name: 'Bermuda', dialCode: '+1-441', isoCode: 'BM', flag: '🇧🇲', placeholder: '292-1234' },
  { name: 'Bahamas', dialCode: '+1-242', isoCode: 'BS', flag: '🇧🇸', placeholder: '359-1234' },
  { name: 'British Virgin Islands', dialCode: '+1-284', isoCode: 'VG', flag: '🇻🇬', placeholder: '494-1234' },
  { name: 'Panama', dialCode: '+507', isoCode: 'PA', flag: '🇵🇦', placeholder: '6123-4567' },
  { name: 'Costa Rica', dialCode: '+506', isoCode: 'CR', flag: '🇨🇷', placeholder: '8312 3456' },
  { name: 'Peru', dialCode: '+51', isoCode: 'PE', flag: '🇵🇪', placeholder: '912 345 678' },
  { name: 'Uruguay', dialCode: '+598', isoCode: 'UY', flag: '🇺🇾', placeholder: '99 123 456' },
  { name: 'Ecuador', dialCode: '+593', isoCode: 'EC', flag: '🇪🇨', placeholder: '99 123 4567' },
  { name: 'Dominican Republic', dialCode: '+1-809', isoCode: 'DO', flag: '🇩🇴', placeholder: '234-5678' },
  { name: 'Puerto Rico', dialCode: '+1-787', isoCode: 'PR', flag: '🇵🇷', placeholder: '787-1234' },
  { name: 'Jamaica', dialCode: '+1-876', isoCode: 'JM', flag: '🇯🇲', placeholder: '555-1234' },
  { name: 'Barbados', dialCode: '+1-246', isoCode: 'BB', flag: '🇧🇧', placeholder: '230-1234' },
  { name: 'Trinidad and Tobago', dialCode: '+1-868', isoCode: 'TT', flag: '🇹🇹', placeholder: '290-1234' },
  { name: 'Croatia', dialCode: '+385', isoCode: 'HR', flag: '🇭🇷', placeholder: '91 234 5678' },
  { name: 'Slovakia', dialCode: '+421', isoCode: 'SK', flag: '🇸🇰', placeholder: '912 345 678' },
  { name: 'Slovenia', dialCode: '+386', isoCode: 'SI', flag: '🇸🇮', placeholder: '41 234 567' },
  { name: 'Bulgaria', dialCode: '+359', isoCode: 'BG', flag: '🇧🇬', placeholder: '87 123 4567' },
  { name: 'Estonia', dialCode: '+372', isoCode: 'EE', flag: '🇪🇪', placeholder: '512 3456' },
  { name: 'Latvia', dialCode: '+371', isoCode: 'LV', flag: '🇱🇻', placeholder: '21 234 567' },
  { name: 'Lithuania', dialCode: '+370', isoCode: 'LT', flag: '🇱🇹', placeholder: '612 34567' },
  { name: 'Serbia', dialCode: '+381', isoCode: 'RS', flag: '🇷🇸', placeholder: '60 1234567' },
  { name: 'Ukraine', dialCode: '+380', isoCode: 'UA', flag: '🇺🇦', placeholder: '50 123 4567' },
  { name: 'Kazakhstan', dialCode: '+7', isoCode: 'KZ', flag: '🇰🇿', placeholder: '701 123 4567' },
  { name: 'Uzbekistan', dialCode: '+998', isoCode: 'UZ', flag: '🇺🇿', placeholder: '90 123 45 67' },
  { name: 'Jordan', dialCode: '+962', isoCode: 'JO', flag: '🇯🇴', placeholder: '7 9123 4567' },
  { name: 'Lebanon', dialCode: '+961', isoCode: 'LB', flag: '🇱🇧', placeholder: '3 123456' },
  { name: 'Tunisia', dialCode: '+216', isoCode: 'TN', flag: '🇹🇳', placeholder: '20 123 456' },
  { name: 'Algeria', dialCode: '+213', isoCode: 'DZ', flag: '🇩🇿', placeholder: '551 23 45 67' },
  { name: 'Senegal', dialCode: '+221', isoCode: 'SN', flag: '🇸🇳', placeholder: '77 123 45 67' },
  { name: 'Ivory Coast', dialCode: '+225', isoCode: 'CI', flag: '🇨🇮', placeholder: '07 12 34 56 78' },
  { name: 'Rwanda', dialCode: '+250', isoCode: 'RW', flag: '🇷🇼', placeholder: '788 123 456' },
  { name: 'Uganda', dialCode: '+256', isoCode: 'UG', flag: '🇺🇬', placeholder: '772 123456' },
  { name: 'Tanzania', dialCode: '+255', isoCode: 'TZ', flag: '🇹🇿', placeholder: '712 345 678' },
  { name: 'Mauritius', dialCode: '+230', isoCode: 'MU', flag: '🇲🇺', placeholder: '5251 2345' },
  { name: 'Sri Lanka', dialCode: '+94', isoCode: 'LK', flag: '🇱🇰', placeholder: '71 234 5678' },
  { name: 'Nepal', dialCode: '+977', isoCode: 'NP', flag: '🇳🇵', placeholder: '984-1234567' },
];

/**
 * Standardizes a phone number into strict E.164 international format
 */
export function formatToE164(dialCode: string, rawNumber: string): string {
  // Strip non-digits except leading +
  const cleanDial = dialCode.replace(/[^0-9+]/g, '');
  const cleanDigits = rawNumber.replace(/[^0-9]/g, '');

  if (!cleanDigits) return '';

  // If rawNumber already includes dial code
  if (rawNumber.startsWith('+')) {
    return `+${cleanDigits}`;
  }

  // If dialCode has +, combine cleanly
  const normalizedDial = cleanDial.startsWith('+') ? cleanDial : `+${cleanDial}`;
  return `${normalizedDial}${cleanDigits}`;
}
