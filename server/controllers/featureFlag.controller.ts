import { Request, Response, NextFunction } from "express";
import { FeatureFlagService } from "../services/featureFlag.service";

export class FeatureFlagController {
  /**
   * GET /api/organizations/:orgId/flags
   * Lists all feature flags for the organization.
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flags = await FeatureFlagService.listByOrg(Number(req.params.orgId));
      res.status(200).json({ success: true, data: flags });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/organizations/:orgId/flags/:flagId
   */
  static async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flag = await FeatureFlagService.getById(
        Number(req.params.flagId),
        Number(req.params.orgId)
      );
      res.status(200).json({ success: true, data: flag });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/organizations/:orgId/flags
   * Creates a new feature flag.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flag = await FeatureFlagService.create({
        organizationId: Number(req.params.orgId),
        key: req.body.key,
        description: req.body.description,
      });
      res.status(201).json({ success: true, data: flag });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/organizations/:orgId/flags/:flagId
   * Updates flag properties (key, description, enabled).
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flag = await FeatureFlagService.update(
        Number(req.params.flagId),
        Number(req.params.orgId),
        {
          key: req.body.key,
          description: req.body.description,
          enabled: req.body.enabled,
        }
      );
      res.status(200).json({ success: true, data: flag });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/organizations/:orgId/flags/:flagId
   * Deletes a feature flag.
   */
  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flag = await FeatureFlagService.delete(
        Number(req.params.flagId),
        Number(req.params.orgId)
      );
      res.status(200).json({ success: true, message: "Flag deleted successfully.", data: flag });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/feature/check
   * Evaluates if a feature flag is enabled for the caller's organization.
   * Body: { key }
   */
  static async check(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.body;
      if (!req.user || !req.user.organizationId) {
        res.status(403).json({ success: false, error: { message: "Access denied. No organization assigned." } });
        return;
      }
      const result = await FeatureFlagService.checkFeature(key, req.user.organizationId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
