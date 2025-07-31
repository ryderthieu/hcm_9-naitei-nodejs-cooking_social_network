export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 6;
  private static readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  /**
   * Validate password strength
   * Requirements:
   * - At least 6 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (@$!%*?&)
   */
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < this.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push(
        'Password must contain at least one special character (@$!%*?&)',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static calculatePasswordScore(password: string): number {
    if (!password) return 0;

    let score = 0;

    score += Math.min(password.length * 4, 25);

    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[@$!%*?&]/.test(password)) score += 15;

    const specialCount = (password.match(/[@$!%*?&]/g) || []).length;
    score += Math.min(specialCount * 5, 15);

    return Math.min(score, 100);
  }

  static getPasswordStrengthLabel(score: number): string {
    if (score < 30) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  }
}
