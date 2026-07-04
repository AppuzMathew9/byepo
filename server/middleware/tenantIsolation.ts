import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

/**
 * Multi-Tenant Isolation Middleware.
 *
 * For routes with an :orgId URL parameter, this middleware enforces that:
 *   - The authenticated user's organizationId matches the requested :orgId
 *   - OR the user has the super_admin role (bypass allowed)
 *
 * This prevents an org_admin or user in Org A from accessing Org B's resources
 * by manually crafting a request with a different :orgId.
 *
 * Usage: router.use("/org/:orgId", authenticate, tenantIsolation)
 */
export const tenantIsolation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Guard: authenticate middleware must run first
  if (!req.user) {
    return next(new AppError("Authentication required.", 401));
  }

  // Super Admins can access any organization
  if (req.user.role === "super_admin") {
    return next();
  }

  const requestedOrgId = Number(req.params.orgId);

  // Reject requests without a numeric orgId parameter
  if (isNaN(requestedOrgId)) {
    return next(new AppError("Invalid organization identifier.", 400));
  }

  // Reject if the user is trying to access a different org's data
  if (req.user.organizationId !== requestedOrgId) {
    return next(
      new AppError(
        "Access denied. You are not authorized to access this organization's resources.",
        403
      )
    );
  }

  next();
};

/**
 * Organization Assignment Guard.
 *
 * Ensures that the authenticated user is assigned to an organization before
 * accessing any org-scoped endpoints. Prevents unassigned users from operating.
 */
export const requireOrganization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError("Authentication required.", 401));
  }

  if (req.user.organizationId === null) {
    return next(
      new AppError(
        "You are not assigned to any organization. Contact a Super Admin.",
        403
      )
    );
  }

  next();
};
