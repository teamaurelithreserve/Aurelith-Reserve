import {
  Metadata,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  AsYouType,
  CountryCode,
} from 'libphonenumber-js';

const metadata = new Metadata();

export interface CountryNumberingInfo {
  min: number;
  max: number;
  possibleLengths: number[];
}

/**
 * Returns the exact national phone number length limits for a given ISO country code
 */
export function getCountryNumberingLimits(isoCode: string): CountryNumberingInfo {
  try {
    metadata.selectNumberingPlan(isoCode as CountryCode);
    const lengths: number[] =
      (metadata as any).numberingPlan?.possibleLengths() ||
      ((metadata as any).possibleLengths ? (metadata as any).possibleLengths() : [10]);
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    return { min, max, possibleLengths: lengths };
  } catch {
    return { min: 6, max: 15, possibleLengths: [] };
  }
}

/**
 * Sanitizes and enforces maximum digit restrictions for the selected country,
 * preventing excess digits from being typed or pasted while formatting in real time.
 */
export function cleanAndLimitPhoneDigits(
  rawInput: string,
  dialCode: string,
  isoCode: string
): { digits: string; formatted: string; maxAllowed: number } {
  const limits = getCountryNumberingLimits(isoCode);
  const cleanDial = dialCode.replace(/[^0-9]/g, '');
  let digits = rawInput.replace(/[^0-9]/g, '');

  // If user pasted with country calling code (e.g. +1 214... or 1214...)
  if (cleanDial && digits.startsWith(cleanDial) && digits.length > limits.max) {
    digits = digits.slice(cleanDial.length);
  }

  // Account for countries with an optional leading domestic trunk 0 (e.g. UK 07xxx, FR 06xxx)
  const maxAllowed = digits.startsWith('0') ? limits.max + 1 : limits.max;
  const truncated = digits.slice(0, maxAllowed);

  // Format dynamically as the user types using AsYouType
  const formatter = new AsYouType(isoCode as CountryCode);
  const formatted = formatter.input(truncated);

  return { digits: truncated, formatted, maxAllowed };
}

export interface PhoneValidationResult {
  isValid: boolean;
  isPossible: boolean;
  e164: string;
  error?: string;
  hint?: string;
}

/**
 * Comprehensive country-specific phone number validation using libphonenumber-js
 */
export function validateCountryPhoneNumber(
  phoneNumber: string,
  dialCode: string,
  isoCode: string,
  countryName: string = isoCode
): PhoneValidationResult {
  const digits = phoneNumber.replace(/[^0-9]/g, '');

  if (!digits) {
    return {
      isValid: false,
      isPossible: false,
      e164: '',
      error: 'Please enter a telephone number.',
    };
  }

  // Validate length against country rules
  const lengthStatus = validatePhoneNumberLength(digits, isoCode as CountryCode);
  const limits = getCountryNumberingLimits(isoCode);

  if (lengthStatus === 'TOO_SHORT') {
    const minNeeded = limits.min;
    return {
      isValid: false,
      isPossible: false,
      e164: '',
      error: `Phone number is incomplete for ${countryName}. Minimum ${minNeeded} digits required.`,
    };
  }

  if (lengthStatus === 'TOO_LONG') {
    return {
      isValid: false,
      isPossible: false,
      e164: '',
      error: `Phone number exceeds maximum length allowed for ${countryName}.`,
    };
  }

  // Parse directly with country context
  const parsed = parsePhoneNumberFromString(phoneNumber, isoCode as CountryCode);
  if (parsed && parsed.isValid()) {
    return {
      isValid: true,
      isPossible: true,
      e164: parsed.format('E.164'),
      hint: `Valid ${countryName} number (${parsed.format('E.164')})`,
    };
  }

  // Try parsing with country dial code combined
  const combined = (dialCode.startsWith('+') ? dialCode : `+${dialCode}`) + digits;
  const parsedCombined = parsePhoneNumberFromString(combined);
  if (parsedCombined && parsedCombined.isValid()) {
    return {
      isValid: true,
      isPossible: true,
      e164: parsedCombined.format('E.164'),
      hint: `Valid ${countryName} number (${parsedCombined.format('E.164')})`,
    };
  }

  // If number length is within possible lengths, allow if structurally possible
  if (limits.possibleLengths.includes(digits.length) || (digits.startsWith('0') && limits.possibleLengths.includes(digits.length - 1))) {
    const normDial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
    return {
      isValid: true,
      isPossible: true,
      e164: `${normDial}${digits.startsWith('0') ? digits.slice(1) : digits}`,
      hint: `Valid ${countryName} number format`,
    };
  }

  return {
    isValid: false,
    isPossible: false,
    e164: '',
    error: `Please enter a valid phone number format for ${countryName}.`,
  };
}
