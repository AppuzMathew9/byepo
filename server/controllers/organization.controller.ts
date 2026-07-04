import { Request, Response, NextFunction } from "express";
import { OrganizationService } from "../services/organization.service";

export class OrganizationController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      const org = await OrganizationService.create(name);
      res.status(201).json({
        success: true,
        message: "Organization created successfully.",
        data: org,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await OrganizationService.listAll();
      res.status(200).json({
        success: true,
        data: orgs,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await OrganizationService.getById(Number(req.params.id));
      res.status(200).json({
        success: true,
        data: org,
      });
    } catch (err) {
      next(err);
    }
  }
}
