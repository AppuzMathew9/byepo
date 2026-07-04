import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

type Role = "super_admin" | "org_admin" | "user";

/**
 * Role-based authorization middleware factory.
 * Returns a middleware that restricts route access to specified roles only.
 *
 * Usage: router.get("/admin", authenticate, authorize("super_admin"), handler)
 *        router.get("/org",   authenticate, authorize("super_admin", "org_admin"), handler)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Guard: authenticate middleware must run first
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    // Check if the authenticated user's role is in the allowedRoles list
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};
