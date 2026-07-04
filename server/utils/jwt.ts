import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../config/env";

export interface JWTPayload {
  userId: number;
  email: string;
  role: "super_admin" | "org_admin" | "user";
  organizationId: number | null;
}

export class JWTUtils {
  private static readonly SECRET = new TextEncoder().encode(ENV.JWT_SECRET);

  /**
   * Generates a signed Access Token JWT.
   */
  static async signAccessToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ENV.JWT_EXPIRES_IN)
      .sign(this.SECRET);
  }

  /**
   * Generates a signed Refresh Token JWT.
   */
  static async signRefreshToken(payload: { userId: number }): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ENV.JWT_REFRESH_EXPIRES_IN)
      .sign(this.SECRET);
  }

  /**
   * Verifies the authenticity and expiration of a JWT.
   */
  static async verifyToken<T>(token: string): Promise<T> {
    const { payload } = await jwtVerify(token, this.SECRET);
    return payload as unknown as T;
  }
}
