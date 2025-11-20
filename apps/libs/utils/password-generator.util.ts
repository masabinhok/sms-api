import * as crypto from 'crypto';

/**
 * Secure password generator utility
 * Generates cryptographically secure random passwords
 */
export class PasswordGenerator {
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly DIGITS = '0123456789';
  private static readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * Generates a secure random password with the following requirements:
   * - Minimum 12 characters (configurable)
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 2 digits
   * - At least 1 special character
   * - Uses cryptographically secure random number generation
   * 
   * @param length - Password length (minimum 12, default 16)
   * @returns Secure random password
   */
  static generate(length: number = 16): string {
    if (length < 12) {
      throw new Error('Password length must be at least 12 characters');
    }

    // Ensure password contains at least one of each required character type
    const requiredChars = [
      this.getSecureRandomChar(this.UPPERCASE),
      this.getSecureRandomChar(this.LOWERCASE),
      this.getSecureRandomChar(this.DIGITS),
      this.getSecureRandomChar(this.DIGITS),
      this.getSecureRandomChar(this.SPECIAL_CHARS),
    ];

    // Fill remaining length with random characters from all sets
    const allChars = this.UPPERCASE + this.LOWERCASE + this.DIGITS + this.SPECIAL_CHARS;
    const remainingLength = length - requiredChars.length;
    
    const randomChars = Array.from(
      { length: remainingLength },
      () => this.getSecureRandomChar(allChars)
    );

    // Combine and shuffle
    const passwordChars = [...requiredChars, ...randomChars];
    return this.shuffleArray(passwordChars).join('');
  }

  /**
   * Generates a user-friendly password (easier to type/remember)
   * - Excludes ambiguous characters (0, O, l, 1, I)
   * - Minimum 12 characters
   * - Still cryptographically secure
   * 
   * @param length - Password length (minimum 12, default 14)
   * @returns User-friendly secure password
   */
  static generateUserFriendly(length: number = 14): string {
    if (length < 12) {
      throw new Error('Password length must be at least 12 characters');
    }

    // Remove ambiguous characters
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Removed l, o
    const digits = '23456789'; // Removed 0, 1
    const specialChars = '!@#$%&*+-=?'; // Limited special chars

    const requiredChars = [
      this.getSecureRandomChar(uppercase),
      this.getSecureRandomChar(lowercase),
      this.getSecureRandomChar(digits),
      this.getSecureRandomChar(digits),
      this.getSecureRandomChar(specialChars),
    ];

    const allChars = uppercase + lowercase + digits + specialChars;
    const remainingLength = length - requiredChars.length;
    
    const randomChars = Array.from(
      { length: remainingLength },
      () => this.getSecureRandomChar(allChars)
    );

    const passwordChars = [...requiredChars, ...randomChars];
    return this.shuffleArray(passwordChars).join('');
  }

  /**
   * Generates a temporary password for account recovery
   * - 12 characters
   * - User-friendly (no ambiguous characters)
   * 
   * @returns Temporary password
   */
  static generateTemporary(): string {
    return this.generateUserFriendly(12);
  }

  /**
   * Gets a cryptographically secure random character from a charset
   */
  private static getSecureRandomChar(charset: string): string {
    const randomIndex = crypto.randomInt(0, charset.length);
    return charset[randomIndex];
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm with crypto.randomInt
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validates password strength
   * Returns true if password meets security requirements
   */
  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generates a secure random token for email verification, password reset, etc.
   * @param length - Token length in bytes (default 32)
   * @returns Hex-encoded token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
