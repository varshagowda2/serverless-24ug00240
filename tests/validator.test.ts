import { describe, it, expect } from 'vitest';
import { validateUserInput } from '../src/lib/validation';

describe('Validator Module Unit Tests', () => {
  it('returns valid=true and sanitizedData for clean valid input', () => {
    const input = {
      name: 'Gagan Gowda',
      email: 'gagan@example.com',
      phone: '+91 98765-43210',
      message: 'This is a valid test message for the system.'
    };

    const result = validateUserInput(input);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.sanitizedData).toEqual({
      name: 'Gagan Gowda',
      email: 'gagan@example.com',
      phone: '+91 98765-43210',
      message: 'This is a valid test message for the system.'
    });
  });

  it('sanitizes input and validates successfully for HTML payload containing valid text', () => {
    const input = {
      name: "<b>Gagan</b>",
      email: " GAGAN@EXAMPLE.COM ",
      phone: "+91 9876543210",
      message: "<p>Hello World! This is a clean message.</p>"
    };

    const result = validateUserInput(input);

    expect(result.valid).toBe(true);
    expect(result.sanitizedData).toEqual({
      name: 'Gagan',
      email: 'gagan@example.com',
      phone: '+91 9876543210',
      message: 'Hello World! This is a clean message.'
    });
  });

  it('rejects empty input fields', () => {
    const input = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };

    const result = validateUserInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.phone).toBeDefined();
    expect(result.errors.message).toBeDefined();
  });

  it('rejects null and undefined inputs', () => {
    const result = validateUserInput({});

    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(4);
  });

  it('rejects invalid email formats', () => {
    const invalidEmails = [
      'plainaddress',
      '@no-user.com',
      'user@',
      'user@.com',
      'user@domain..com'
    ];

    for (const email of invalidEmails) {
      const result = validateUserInput({
        name: 'Gagan',
        email,
        phone: '+1234567890',
        message: 'Valid message content'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Please provide a valid email address (e.g., user@example.com)');
    }
  });

  it('rejects phone numbers with too few digits', () => {
    const result = validateUserInput({
      name: 'Gagan',
      email: 'gagan@example.com',
      phone: '123',
      message: 'Valid message'
    });

    expect(result.valid).toBe(false);
    expect(result.errors.phone).toBe('Phone number must contain at least 7 digits');
  });

  it('rejects messages that are too short', () => {
    const result = validateUserInput({
      name: 'Gagan',
      email: 'gagan@example.com',
      phone: '+1234567890',
      message: 'Hi'
    });

    expect(result.valid).toBe(false);
    expect(result.errors.message).toBe('Message must be at least 5 characters long');
  });

  it('sanitizes XSS payload to clean text and passes if message text length is valid', () => {
    const input = {
      name: "<script>alert('x')</script> Gagan",
      email: "GAGAN@EXAMPLE.COM",
      phone: "+91 98765-43210",
      message: "<h1>Hello</h1><script>alert('XSS')</script> Welcome to security test."
    };

    const result = validateUserInput(input);

    expect(result.valid).toBe(true);
    expect(result.sanitizedData.name).toBe('Gagan');
    expect(result.sanitizedData.email).toBe('gagan@example.com');
    expect(result.sanitizedData.message).toBe('Hello Welcome to security test.');
  });
});
