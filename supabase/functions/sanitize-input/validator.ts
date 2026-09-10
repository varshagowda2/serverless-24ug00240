import {
  RawUserInput,
  SanitizedUserInput,
  sanitizeAllInputs,
} from './sanitizer.ts';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: SanitizedUserInput;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export function validateUserInput(rawInput: RawUserInput): ValidationResult {
  const sanitizedData = sanitizeAllInputs(rawInput);
  const errors: Record<string, string> = {};

  // 1. Validate Name
  if (!sanitizedData.name) {
    errors.name = 'Full Name is required';
  } else if (sanitizedData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (sanitizedData.name.length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  }

  // 2. Validate Email
  if (!sanitizedData.email) {
    errors.email = 'Email address is required';
  } else if (sanitizedData.email.length > 254) {
    errors.email = 'Email cannot exceed 254 characters';
  } else if (!EMAIL_REGEX.test(sanitizedData.email)) {
    errors.email = 'Please provide a valid email address (e.g., user@example.com)';
  }

  // 3. Validate Phone Number
  const digitsOnly = sanitizedData.phone.replace(/\D/g, '');
  if (!sanitizedData.phone) {
    errors.phone = 'Phone number is required';
  } else if (digitsOnly.length < 7) {
    errors.phone = 'Phone number must contain at least 7 digits';
  } else if (digitsOnly.length > 15) {
    errors.phone = 'Phone number cannot exceed 15 digits';
  } else if (!/^(\+)?[\d\s\-()]+$/.test(sanitizedData.phone)) {
    errors.phone = 'Phone number contains invalid characters';
  }

  // 4. Validate Message
  if (!sanitizedData.message) {
    errors.message = 'Message is required';
  } else if (sanitizedData.message.length < 5) {
    errors.message = 'Message must be at least 5 characters long';
  } else if (sanitizedData.message.length > 2000) {
    errors.message = 'Message cannot exceed 2000 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}
