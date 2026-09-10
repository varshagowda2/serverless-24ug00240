/**
 * Data Sanitization Module
 * Implements server-side sanitization rules to ensure zero executable HTML/JS
 * reaches the database while preserving legitimate text and formatting.
 */

export interface RawUserInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

export interface SanitizedUserInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Core generic sanitizer function
 * Sanitizes an unknown input into a safe, normalized string.
 */
export function sanitizeInput(input: unknown, maxLength: number = 2000): string {
  if (input === null || input === undefined) {
    return '';
  }

  // Convert non-string primitives (numbers, booleans) to string safely
  let str = typeof input === 'string' ? input : String(input);

  // 1. Remove dangerous control characters (ASCII 0-8, 11-12, 14-31, 127, and NULL byte \0)
  // Preserves \t (9), \n (10), \r (13) if needed, but null bytes and ascii 0-8/14-31 are removed.
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Remove script tags and their contents completely (<script...>...</script>)
  str = str.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');

  // 3. Remove style tags and their contents completely (<style...>...</style>)
  str = str.replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '');

  // 4. Strip all remaining HTML tags (<...>) and replace with space to preserve word boundary
  str = str.replace(/<[^>]*>/g, ' ');

  // 5. Neutralize dangerous event handlers / JS URLs if any leaked as text fragments
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/data\s*:\s*text\/html/gi, '');
  str = str.replace(/on\w+\s*=/gi, '');

  // 6. Normalize excessive whitespace (multiple spaces/tabs to a single space)
  str = str.replace(/[ \t]+/g, ' ');
  // Normalize multiple newlines (max 2 consecutive newlines)
  str = str.replace(/\n{3,}/g, '\n\n');

  // 7. Trim leading and trailing whitespace
  str = str.trim();

  // 8. Enforce maximum input length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

/**
 * Field-specific Sanitizer for Name
 * Enforces letters, spaces, hyphens, apostrophes, max 100 chars.
 */
export function sanitizeName(rawName: unknown): string {
  const sanitized = sanitizeInput(rawName, 100);
  // Remove numbers or uncommon symbols from names while retaining letters (unicode friendly), spaces, hyphens, apostrophes, periods
  return sanitized.replace(/[^\p{L}\p{M}\s\-'.]/gu, '');
}

/**
 * Field-specific Sanitizer for Email
 * Lowercase, trimmed, strip HTML/scripts, max 254 chars.
 */
export function sanitizeEmail(rawEmail: unknown): string {
  const sanitized = sanitizeInput(rawEmail, 254);
  // Trim spaces and convert to lowercase
  return sanitized.replace(/\s+/g, '').toLowerCase();
}

/**
 * Field-specific Sanitizer for Phone
 * Preserves digits, leading +, hyphens, spaces, parentheses, max 30 chars.
 */
export function sanitizePhone(rawPhone: unknown): string {
  const sanitized = sanitizeInput(rawPhone, 30);
  // Keep only +, digits, hyphens, spaces, and parentheses
  let cleaned = sanitized.replace(/[^\d+\-\s()]/g, '');
  // Ensure '+' only appears at the very beginning
  const hasLeadingPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\+/g, '');
  if (hasLeadingPlus) {
    cleaned = '+' + cleaned;
  }
  return cleaned.trim();
}

/**
 * Field-specific Sanitizer for Message
 * Strips HTML, neutralizes XSS payloads, preserves normal text & punctuation, max 2000 chars.
 */
export function sanitizeMessage(rawMessage: unknown): string {
  return sanitizeInput(rawMessage, 2000);
}

/**
 * Sanitizes all input fields for submission
 */
export function sanitizeAllInputs(input: RawUserInput): SanitizedUserInput {
  return {
    name: sanitizeName(input.name),
    email: sanitizeEmail(input.email),
    phone: sanitizePhone(input.phone),
    message: sanitizeMessage(input.message),
  };
}
