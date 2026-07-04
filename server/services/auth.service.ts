import { UserRepository } from "../repositories/user.repository";
import { OrganizationRepository } from "../repositories/organization.repository";
import { CryptoUtils } from "../utils/crypto";
import { JWTUtils } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { ENV } from "../config/env";

export interface RegisterPayload {
  orgName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Registers a new organization and its administrator user.
   */
  static async register(payload: RegisterPayload) {
    // 1. Guard: Check if organization already exists
    const existingOrg = await OrganizationRepository.findByName(payload.orgName);
    if (existingOrg) {
      throw new AppError("An organization with this name already exists.", 409);
    }

    // 2. Guard: Check if email already exists
    const existingUser = await UserRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
    }

    // 3. Create organization
    const org = await OrganizationRepository.create(payload.orgName);
    if (!org) {
      throw new AppError("Failed to create organization.", 500);
    }

    // 4. Hash password and persist admin user
    const passwordHash = await CryptoUtils.hashPassword(payload.password);
    const newUser = await UserRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: "org_admin",
      organizationId: org.id,
    });

    if (!newUser) {
      throw new AppError("Failed to create user account.", 500);
    }

    const token = await this._issueToken(newUser);
    return { user: this._sanitize(newUser), token };
  }

  /**
   * Authenticates user credentials (super_admin, org_admin, user).
   */
  static async login(payload: LoginPayload) {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@byepo.com";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdminPassword123!";

    // Support static Super Admin credentials
    if (payload.email === superAdminEmail && payload.password === superAdminPassword) {
      let superUser = await UserRepository.findByEmail(superAdminEmail);
      if (!superUser) {
        // Create super admin record on first login
        const dummyHash = await CryptoUtils.hashPassword(superAdminPassword);
        superUser = await UserRepository.create({
          name: "Super Admin",
          email: superAdminEmail,
          passwordHash: dummyHash,
          role: "super_admin",
          organizationId: null,
        });
      }
      if (!superUser) {
        throw new AppError("Failed to initialize super admin session.", 500);
      }
      const token = await this._issueToken(superUser);
      return { user: this._sanitize(superUser), token };
    }

    // Standard user/org_admin database validation
    const user = await UserRepository.findByEmail(payload.email);
    const GENERIC_ERROR = "Invalid email or password.";

    if (!user) {
      throw new AppError(GENERIC_ERROR, 401);
    }

    const isValid = await CryptoUtils.comparePassword(payload.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(GENERIC_ERROR, 401);
    }

    const token = await this._issueToken(user);
    return { user: this._sanitize(user), token };
  }

  /**
   * Retrieve the current authenticated user's database record.
   */
  static async getMe(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    return this._sanitize(user);
  }

  /**
   * Issues standard signed Access Token JWT.
   */
  private static async _issueToken(user: NonNullable<Awaited<ReturnType<typeof UserRepository.findById>>>) {
    return JWTUtils.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });
  }

  /**
   * Strips password hash before returning user details.
   */
  private static _sanitize(user: NonNullable<Awaited<ReturnType<typeof UserRepository.findById>>>) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
