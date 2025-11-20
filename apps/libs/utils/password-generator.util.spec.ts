import { PasswordGenerator } from './password-generator.util';

describe('PasswordGenerator', () => {
  describe('generate', () => {
    it('should generate password with minimum length of 12 characters', () => {
      const password = PasswordGenerator.generate(12);
      expect(password.length).toBe(12);
    });

    it('should generate password with default length of 16 characters', () => {
      const password = PasswordGenerator.generate();
      expect(password.length).toBe(16);
    });

    it('should throw error for password length less than 12', () => {
      expect(() => PasswordGenerator.generate(11)).toThrow(
        'Password length must be at least 12 characters'
      );
    });

    it('should contain at least one uppercase letter', () => {
      const password = PasswordGenerator.generate();
      expect(password).toMatch(/[A-Z]/);
    });

    it('should contain at least one lowercase letter', () => {
      const password = PasswordGenerator.generate();
      expect(password).toMatch(/[a-z]/);
    });

    it('should contain at least one digit', () => {
      const password = PasswordGenerator.generate();
      expect(password).toMatch(/\d/);
    });

    it('should contain at least one special character', () => {
      const password = PasswordGenerator.generate();
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/);
    });

    it('should generate unique passwords', () => {
      const passwords = new Set();
      for (let i = 0; i < 1000; i++) {
        passwords.add(PasswordGenerator.generate());
      }
      // All passwords should be unique
      expect(passwords.size).toBe(1000);
    });

    it('should have good entropy distribution', () => {
      const password = PasswordGenerator.generate(100);
      const charCounts: Record<string, number> = {};
      
      for (const char of password) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }

      // No character should appear more than 10 times in 100 chars (very unlikely with good randomness)
      const maxCount = Math.max(...Object.values(charCounts));
      expect(maxCount).toBeLessThan(10);
    });
  });

  describe('generateUserFriendly', () => {
    it('should generate password with minimum length of 12 characters', () => {
      const password = PasswordGenerator.generateUserFriendly(12);
      expect(password.length).toBe(12);
    });

    it('should generate password with default length of 14 characters', () => {
      const password = PasswordGenerator.generateUserFriendly();
      expect(password.length).toBe(14);
    });

    it('should not contain ambiguous characters (0, O, l, 1, I)', () => {
      const passwords = Array.from({ length: 100 }, () =>
        PasswordGenerator.generateUserFriendly()
      );
      
      for (const password of passwords) {
        expect(password).not.toMatch(/[0Ol1I]/);
      }
    });

    it('should contain required character types', () => {
      const password = PasswordGenerator.generateUserFriendly();
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/\d/); // digit
      expect(password).toMatch(/[!@#$%&*+\-=?]/); // special
    });

    it('should throw error for password length less than 12', () => {
      expect(() => PasswordGenerator.generateUserFriendly(11)).toThrow(
        'Password length must be at least 12 characters'
      );
    });
  });

  describe('generateTemporary', () => {
    it('should generate 12 character password', () => {
      const password = PasswordGenerator.generateTemporary();
      expect(password.length).toBe(12);
    });

    it('should generate user-friendly password without ambiguous characters', () => {
      const passwords = Array.from({ length: 50 }, () =>
        PasswordGenerator.generateTemporary()
      );
      
      for (const password of passwords) {
        expect(password).not.toMatch(/[0Ol1I]/);
      }
    });

    it('should be secure (contain all required character types)', () => {
      const password = PasswordGenerator.generateTemporary();
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[!@#$%&*+\-=?]/);
    });
  });

  describe('validateStrength', () => {
    it('should validate strong password as valid', () => {
      const password = 'SecureP@ssw0rd123!';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 12 characters', () => {
      const password = 'Short1!Aa';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 12 characters long'
      );
    });

    it('should reject password without uppercase letter', () => {
      const password = 'lowercase123!@#';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without lowercase letter', () => {
      const password = 'UPPERCASE123!@#';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject password without digit', () => {
      const password = 'NoDigitsHere!@#';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one digit'
      );
    });

    it('should reject password without special character', () => {
      const password = 'NoSpecialChar123';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should return all validation errors', () => {
      const password = 'weak';
      const result = PasswordGenerator.validateStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateToken', () => {
    it('should generate token with default 64 hex characters (32 bytes)', () => {
      const token = PasswordGenerator.generateToken();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate token with custom length', () => {
      const token = PasswordGenerator.generateToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 1000; i++) {
        tokens.add(PasswordGenerator.generateToken());
      }
      expect(tokens.size).toBe(1000);
    });

    it('should only contain hexadecimal characters', () => {
      const token = PasswordGenerator.generateToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('Security Properties', () => {
    it('should pass all generated passwords through strength validation', () => {
      for (let i = 0; i < 100; i++) {
        const password = PasswordGenerator.generate();
        const validation = PasswordGenerator.validateStrength(password);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should pass all user-friendly passwords through strength validation', () => {
      for (let i = 0; i < 100; i++) {
        const password = PasswordGenerator.generateUserFriendly();
        const validation = PasswordGenerator.validateStrength(password);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should have sufficient entropy (no patterns)', () => {
      const password1 = PasswordGenerator.generate(20);
      const password2 = PasswordGenerator.generate(20);
      
      // Calculate Hamming distance (should be high for random passwords)
      let differences = 0;
      for (let i = 0; i < Math.min(password1.length, password2.length); i++) {
        if (password1[i] !== password2[i]) differences++;
      }
      
      // At least 90% of characters should be different
      expect(differences).toBeGreaterThan(18);
    });
  });
});
