/**
 * Jalanidhi – Shared validation helpers
 * ─────────────────────────────────────
 * Provides reusable input-filter functions (to restrict keystrokes in onChange)
 * and format-validation functions (to show error messages).
 *
 * IMPORTANT: No optional chaining (?.) – explicit && null checks only.
 */

// ── Input Filters (use inside onChange to restrict what the user can type) ────

/** Allow only digits (0-9). Use for pincode, mobile, OTP, account number, ward, etc. */
export const filterDigitsOnly = (value: string): string =>
  value.replace(/[^0-9]/g, '');

/** Allow only digits and hyphens (e.g. RR numbers like RR-2026-004587) */
export const filterAlphanumericDash = (value: string): string =>
  value.replace(/[^a-zA-Z0-9-]/g, '');

/** Allow letters, spaces, and dots only (names) */
export const filterAlphaOnly = (value: string): string =>
  value.replace(/[^a-zA-Z\s.]/g, '');

/** Allow alphanumeric only (PAN, GST, IFSC base) */
export const filterAlphanumeric = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '');

/** Allow alphanumeric and common address chars (slash, hash, comma, dot, hyphen, space) */
export const filterAddress = (value: string): string =>
  value.replace(/[^a-zA-Z0-9\s/,.#()\-]/g, '');

/** Allow email characters */
export const filterEmail = (value: string): string =>
  value.replace(/[^a-zA-Z0-9@.+_\-]/g, '');

/** Allow decimal numbers (e.g. amounts: 123.45) */
export const filterDecimal = (value: string): string => {
  // Remove everything that is not digit or dot
  let filtered = value.replace(/[^0-9.]/g, '');
  // Ensure only one dot
  const parts = filtered.split('.');
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }
  return filtered;
};


// ── Format Validators (return error message string or empty string) ──────────

/** Validate Indian mobile number: starts with 6-9, exactly 10 digits */
export const validateMobile = (value: string): string => {
  if (!value || !value.trim()) return 'Mobile number is required';
  if (!/^\d{10}$/.test(value)) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]/.test(value)) return 'Mobile number must start with 6, 7, 8, or 9';
  return '';
};

/** Validate Indian pincode: exactly 6 digits, cannot start with 0 */
export const validatePincode = (value: string): string => {
  if (!value || !value.trim()) return 'Pincode is required';
  if (!/^\d{6}$/.test(value)) return 'Pincode must be exactly 6 digits';
  if (/^0/.test(value)) return 'Pincode cannot start with 0';
  return '';
};

/** Validate email format */
export const validateEmail = (value: string): string => {
  if (!value || !value.trim()) return ''; // email is often optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  return '';
};

/** Validate Aadhaar number: exactly 12 digits */
export const validateAadhaar = (value: string): string => {
  if (!value || !value.trim()) return 'Aadhaar number is required';
  if (!/^\d{12}$/.test(value)) return 'Aadhaar number must be exactly 12 digits';
  return '';
};

/** Validate PAN: AAAAA9999A format */
export const validatePAN = (value: string): string => {
  if (!value || !value.trim()) return 'PAN number is required';
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase())) return 'Enter a valid PAN (e.g. ABCDE1234F)';
  return '';
};

/** Validate GST: 15 char alphanumeric */
export const validateGST = (value: string): string => {
  if (!value || !value.trim()) return 'GST number is required';
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(value.toUpperCase())) {
    return 'Enter a valid 15-character GSTIN';
  }
  return '';
};

/** Validate IFSC Code: 4 alpha + 0 + 6 alphanumeric */
export const validateIFSC = (value: string): string => {
  if (!value || !value.trim()) return 'IFSC code is required';
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) {
    return 'Enter a valid IFSC code (e.g. SBIN0001234)';
  }
  return '';
};

/** Validate bank account number: 9-18 digits */
export const validateAccountNumber = (value: string): string => {
  if (!value || !value.trim()) return 'Account number is required';
  if (!/^\d{9,18}$/.test(value)) return 'Account number must be 9 to 18 digits';
  return '';
};

/** Validate OTP: exactly 6 digits */
export const validateOTP = (value: string): string => {
  if (!value || !value.trim()) return 'OTP is required';
  if (!/^\d{6}$/.test(value)) return 'OTP must be exactly 6 digits';
  return '';
};

/** Validate required text field (non-empty after trim) */
export const validateRequired = (value: string, fieldName: string): string => {
  if (!value || !value.trim()) return fieldName + ' is required';
  return '';
};

/** Validate minimum length */
export const validateMinLength = (value: string, min: number, fieldName: string): string => {
  if (!value || value.trim().length < min) return fieldName + ' must be at least ' + min + ' characters';
  return '';
};

/** Validate ward number: 1-3 digits */
export const validateWardNumber = (value: string): string => {
  if (!value || !value.trim()) return 'Ward number is required';
  if (!/^\d{1,3}$/.test(value)) return 'Ward number must be 1 to 3 digits';
  return '';
};