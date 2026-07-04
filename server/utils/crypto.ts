import bcrypt from "bcryptjs";

export class CryptoUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hashes a plain text password using bcrypt.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compares a plain text password against a stored hash.
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
