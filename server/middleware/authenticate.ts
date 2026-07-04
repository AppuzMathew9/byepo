import { Request, Response, NextFunction } from "express";
import { JWTUtils, JWTPayload } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { UserRepository } from "../repositories/user.repository";

// Extend Express Request interface to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: "super_admin" | "org_admin" | "user";
        organizationId: number | null;
      };
    }
  }
}

/**
 * Verifies the JWT Access Token from the Authorization header.
 * Attaches the decoded user object to req.user.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("Authentication required. No token provided.", 401)
      );
    }

    // 2. Extract and verify the token
    const token = authHeader.split(" ")[1];
    const decoded = await JWTUtils.verifyToken<JWTPayload>(token);

    // 3. Check if the user still exists in the database
    // This prevents deleted users from using stale tokens
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 4. Attach decoded user to the request
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.role as "super_admin" | "org_admin" | "user",
      organizationId: user.organizationId ?? null,
    };

    next();
  } catch (err: any) {
    if (err.code === "ERR_JWT_EXPIRED") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid or malformed token. Access denied.", 401));
  }
};
