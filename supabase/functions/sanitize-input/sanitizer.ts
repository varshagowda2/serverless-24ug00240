/**
 * Edge Function Sanitizer Module (Deno compatible)
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

export function sanitizeInput(input: unknown, maxLength: number = 2000): string {
  if (input === null || input === undefined) {
    return '';
  }

  let str = typeof input === 'string' ? input : String(input);

  // 1. Remove dangerous control characters (ASCII 0-8, 11-12, 14-31, 127, null bytes)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Remove script tags and script contents completely (<script...>...</script>)
  str = str.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');

  // 3. Remove style tags and their contents completely (<style...>...</style>)
  str = str.replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '');

  // 4. Strip all remaining HTML tags
  str = str.replace(/<[^>]*>/g, ' ');

  // 5. Neutralize dangerous event handlers / JS URLs
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/data\s*:\s*text\/html/gi, '');
  str = str.replace(/on\w+\s*=/gi, '');

  // 6. Normalize excessive whitespace
  str = str.replace(/[ \t]+/g, ' ');
  str = str.replace(/\n{3,}/g, '\n\n');

  // 7. Trim whitespace
  str = str.trim();

  // 8. Enforce maximum input length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

export function sanitizeName(rawName: unknown): string {
  const sanitized = sanitizeInput(rawName, 100);
  return sanitized.replace(/[^\p{L}\p{M}\s\-'.]/gu, '');
}

export function sanitizeEmail(rawEmail: unknown): string {
  const sanitized = sanitizeInput(rawEmail, 254);
  return sanitized.replace(/\s+/g, '').toLowerCase();
}

export function sanitizePhone(rawPhone: unknown): string {
  const sanitized = sanitizeInput(rawPhone, 30);
  let cleaned = sanitized.replace(/[^\d+\-\s()]/g, '');
  const hasLeadingPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\+/g, '');
  if (hasLeadingPlus) {
    cleaned = '+' + cleaned;
  }
  return cleaned.trim();
}

export function sanitizeMessage(rawMessage: unknown): string {
  return sanitizeInput(rawMessage, 2000);
}

export function sanitizeAllInputs(input: RawUserInput): SanitizedUserInput {
  return {
    name: sanitizeName(input.name),
    email: sanitizeEmail(input.email),
    phone: sanitizePhone(input.phone),
    message: sanitizeMessage(input.message),
  };
}
