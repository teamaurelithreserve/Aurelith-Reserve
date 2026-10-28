export type IdentityDocumentType =
  | 'Social Security Number (SSN)'
  | "Driver's License"
  | 'State Identification Card'
  | 'Passport / Consular ID'
  | 'Other Official Government ID';

export interface IdentityValidationResult {
  isValid: boolean;
  error?: string;
  hint?: string;
  cleanValue: string;
}

/**
 * Known U.S. State Driver's License and State ID configurations
 */
export const US_STATE_DL_RULES: Record<string, { max: number; min: number; desc: string; pattern?: RegExp }> = {
  TX: { min: 7, max: 8, desc: 'Texas: 7 to 8 digits' },
  CA: { min: 8, max: 8, desc: 'California: 1 letter followed by 7 digits', pattern: /^[A-Z][0-9]{7}$/ },
  FL: { min: 13, max: 13, desc: 'Florida: 1 letter followed by 12 digits', pattern: /^[A-Z][0-9]{12}$/ },
  NY: { min: 8, max: 9, desc: 'New York: 8 or 9 alphanumeric characters' },
  IL: { min: 11, max: 12, desc: 'Illinois: 1 letter followed by 11 or 12 digits' },
  PA: { min: 8, max: 8, desc: 'Pennsylvania: 8 digits', pattern: /^[0-9]{8}$/ },
  OH: { min: 8, max: 9, desc: 'Ohio: 2 letters followed by 6 digits, or 8 digits' },
  GA: { min: 7, max: 9, desc: 'Georgia: 7 to 9 digits', pattern: /^[0-9]{7,9}$/ },
  NC: { min: 1, max: 12, desc: 'North Carolina: 1 to 12 digits' },
  MI: { min: 13, max: 13, desc: 'Michigan: 1 letter followed by 12 digits' },
  NJ: { min: 15, max: 15, desc: 'New Jersey: 1 letter followed by 14 digits' },
  VA: { min: 9, max: 9, desc: 'Virginia: 9 digits or 1 letter followed by 8 digits' },
  WA: { min: 12, max: 12, desc: 'Washington: 12 alphanumeric characters' },
  MA: { min: 9, max: 9, desc: 'Massachusetts: 1 letter followed by 8 digits, or 9 digits' },
  AZ: { min: 9, max: 9, desc: 'Arizona: 1 letter followed by 8 digits, or 9 digits' },
  CO: { min: 9, max: 9, desc: 'Colorado: 9 digits', pattern: /^[0-9]{9}$/ },
};

/**
 * Standard passport length specifications by issuing country code
 */
export const COUNTRY_PASSPORT_RULES: Record<string, { min: number; max: number; desc: string }> = {
  US: { min: 9, max: 9, desc: 'U.S. Passport: 9 characters (digits or 1 letter + 8 digits)' },
  GB: { min: 9, max: 9, desc: 'U.K. Passport: 9 digits' },
  CA: { min: 8, max: 8, desc: 'Canadian Passport: 8 alphanumeric characters' },
  AU: { min: 8, max: 8, desc: 'Australian Passport: 8 alphanumeric characters' },
  DE: { min: 9, max: 10, desc: 'German Passport: 9 to 10 alphanumeric characters' },
  FR: { min: 9, max: 9, desc: 'French Passport: 9 alphanumeric characters' },
  IT: { min: 9, max: 9, desc: 'Italian Passport: 9 alphanumeric characters' },
  ES: { min: 9, max: 9, desc: 'Spanish Passport: 9 alphanumeric characters' },
  IN: { min: 8, max: 8, desc: 'Indian Passport: 8 alphanumeric characters' },
  BR: { min: 8, max: 8, desc: 'Brazilian Passport: 8 alphanumeric characters' },
  MX: { min: 8, max: 9, desc: 'Mexican Passport: 8 to 9 alphanumeric characters' },
  SD: { min: 8, max: 9, desc: 'Sudanese Passport: 8 to 9 alphanumeric characters' },
  AE: { min: 8, max: 9, desc: 'U.A.E. Passport: 8 to 9 alphanumeric characters' },
  SA: { min: 8, max: 9, desc: 'Saudi Passport: 8 to 9 alphanumeric characters' },
  JP: { min: 9, max: 9, desc: 'Japanese Passport: 2 letters followed by 7 digits' },
  CN: { min: 8, max: 9, desc: 'Chinese Passport: 8 to 9 alphanumeric characters' },
};

/**
 * Formats an input value according to the document type and restricts invalid characters/lengths
 */
export function formatIdentityInput(
  rawInput: string,
  idType: string,
  state?: string,
  countryIso?: string
): string {
  if (idType.includes('SSN') || idType.includes('Social Security')) {
    // Only digits, strictly maximum 9 digits
    const digits = rawInput.replace(/[^0-9]/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  if (idType.includes("Driver's License") || idType.includes('State Identification')) {
    // Uppercase alphanumeric and hyphens
    const cleanState = (state || '').trim().toUpperCase();
    const stateRule = US_STATE_DL_RULES[cleanState];
    const maxChars = stateRule ? stateRule.max : 16;
    const cleaned = rawInput.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    return cleaned.slice(0, maxChars);
  }

  if (idType.includes('Passport')) {
    // Uppercase alphanumeric (no symbols)
    const cleanCountry = (countryIso || 'US').trim().toUpperCase();
    const countryRule = COUNTRY_PASSPORT_RULES[cleanCountry];
    const maxChars = countryRule ? countryRule.max : 12; // ICAO Doc 9303 standard: 6-12 chars
    const cleaned = rawInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return cleaned.slice(0, maxChars);
  }

  // Other official government ID: alphanumeric, up to 20 chars
  return rawInput.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 20);
}

/**
 * Returns input placeholder based on document type and jurisdiction
 */
export function getIdentityPlaceholder(
  idType: string,
  state?: string,
  countryIso?: string
): string {
  if (idType.includes('SSN') || idType.includes('Social Security')) {
    return 'XXX-XX-XXXX (9 digits)';
  }

  if (idType.includes("Driver's License")) {
    const cleanState = (state || '').trim().toUpperCase();
    const rule = US_STATE_DL_RULES[cleanState];
    if (rule) {
      return `${rule.desc}`;
    }
    return "Enter driver's license number";
  }

  if (idType.includes('State Identification')) {
    const cleanState = (state || '').trim().toUpperCase();
    const rule = US_STATE_DL_RULES[cleanState];
    if (rule) {
      return `State ID (${rule.desc})`;
    }
    return 'Enter state identification card number';
  }

  if (idType.includes('Passport')) {
    const cleanCountry = (countryIso || 'US').trim().toUpperCase();
    const rule = COUNTRY_PASSPORT_RULES[cleanCountry];
    if (rule) {
      return `${rule.desc}`;
    }
    return 'Passport number (alphanumeric, 6–12 chars)';
  }

  return 'Official identification number';
}

/**
 * Validates the complete identity document input according to document-specific rules
 */
export function validateIdentityDocument(
  value: string,
  idType: string,
  state?: string,
  countryIso?: string
): IdentityValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      isValid: false,
      cleanValue: '',
      error: 'Please enter your identification document number.',
    };
  }

  // A. SOCIAL SECURITY NUMBER (SSN)
  if (idType.includes('SSN') || idType.includes('Social Security')) {
    const digits = trimmed.replace(/[^0-9]/g, '');

    if (digits.length !== 9) {
      return {
        isValid: false,
        cleanValue: digits,
        error: `Social Security Number must be exactly 9 numeric digits (entered ${digits.length}/9).`,
      };
    }

    // Check invalid SSA ranges (000-xx-xxxx, 666-xx-xxxx, 900-999-xx-xxxx, xx-00-xxxx, xxxx-xx-0000)
    const area = digits.slice(0, 3);
    const group = digits.slice(3, 5);
    const serial = digits.slice(5, 9);

    if (area === '000' || area === '666' || parseInt(area, 10) >= 900) {
      return {
        isValid: false,
        cleanValue: digits,
        error: 'Please enter a valid Social Security Number.',
      };
    }

    if (group === '00' || serial === '0000') {
      return {
        isValid: false,
        cleanValue: digits,
        error: 'Please enter a valid Social Security Number.',
      };
    }

    const formatted = `${area}-${group}-${serial}`;
    return {
      isValid: true,
      cleanValue: formatted,
      hint: 'Valid 9-digit Social Security Number',
    };
  }

  // B. DRIVER'S LICENSE
  if (idType.includes("Driver's License")) {
    const cleanAlnum = trimmed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanState = (state || '').trim().toUpperCase();
    const stateRule = US_STATE_DL_RULES[cleanState];

    if (cleanAlnum.length < 5) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: "Driver's License number is incomplete (minimum 5 characters).",
      };
    }

    if (stateRule) {
      if (cleanAlnum.length < stateRule.min || cleanAlnum.length > stateRule.max) {
        return {
          isValid: false,
          cleanValue: cleanAlnum,
          error: `Driver's License for ${cleanState} must be between ${stateRule.min} and ${stateRule.max} characters.`,
        };
      }
      if (stateRule.pattern && !stateRule.pattern.test(cleanAlnum)) {
        return {
          isValid: false,
          cleanValue: cleanAlnum,
          error: `Invalid Driver's License format for ${cleanState}. Expected: ${stateRule.desc}.`,
        };
      }
    } else if (cleanAlnum.length > 18) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: "Driver's License number exceeds maximum length.",
      };
    }

    return {
      isValid: true,
      cleanValue: cleanAlnum,
      hint: stateRule ? `Valid ${cleanState} Driver's License` : "Valid Driver's License format",
    };
  }

  // C. STATE IDENTIFICATION CARD
  if (idType.includes('State Identification')) {
    const cleanAlnum = trimmed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanState = (state || '').trim().toUpperCase();
    const stateRule = US_STATE_DL_RULES[cleanState];

    if (cleanAlnum.length < 5) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: 'State ID card number is incomplete (minimum 5 characters).',
      };
    }

    if (stateRule && (cleanAlnum.length < stateRule.min || cleanAlnum.length > stateRule.max)) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: `State ID for ${cleanState} must be between ${stateRule.min} and ${stateRule.max} characters.`,
      };
    }

    if (cleanAlnum.length > 18) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: 'State ID card number exceeds maximum length.',
      };
    }

    return {
      isValid: true,
      cleanValue: cleanAlnum,
      hint: cleanState ? `Valid ${cleanState} State ID format` : 'Valid State ID format',
    };
  }

  // D. PASSPORT / CONSULAR ID
  if (idType.includes('Passport')) {
    const cleanAlnum = trimmed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanCountry = (countryIso || 'US').trim().toUpperCase();
    const countryRule = COUNTRY_PASSPORT_RULES[cleanCountry];

    if (cleanAlnum.length < 6) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: 'Passport number must be at least 6 alphanumeric characters.',
      };
    }

    if (countryRule) {
      if (cleanAlnum.length < countryRule.min || cleanAlnum.length > countryRule.max) {
        return {
          isValid: false,
          cleanValue: cleanAlnum,
          error: `Passport number for ${cleanCountry} must be ${countryRule.min === countryRule.max ? countryRule.max : `${countryRule.min} to ${countryRule.max}`} characters.`,
        };
      }
    } else if (cleanAlnum.length > 15) {
      return {
        isValid: false,
        cleanValue: cleanAlnum,
        error: 'Passport number exceeds maximum length (15 characters per ICAO 9303).',
      };
    }

    return {
      isValid: true,
      cleanValue: cleanAlnum,
      hint: countryRule ? `Valid ${cleanCountry} Passport format` : 'Valid Passport format',
    };
  }

  // E. OTHER OFFICIAL GOVERNMENT ID
  const cleanAlnum = trimmed.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
  if (cleanAlnum.length < 4 || cleanAlnum.length > 20) {
    return {
      isValid: false,
      cleanValue: cleanAlnum,
      error: 'Official ID number must be between 4 and 20 alphanumeric characters.',
    };
  }

  return {
    isValid: true,
    cleanValue: cleanAlnum,
    hint: 'Valid identification number format',
  };
}
