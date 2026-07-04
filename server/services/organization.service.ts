import { OrganizationRepository } from "../repositories/organization.repository";
import { AppError } from "../utils/appError";

export class OrganizationService {
  static async create(name: string) {
    const existing = await OrganizationRepository.findByName(name);
    if (existing) {
      throw new AppError("An organization with this name already exists.", 409);
    }
    return OrganizationRepository.create(name);
  }

  static async listAll() {
    return OrganizationRepository.listAll();
  }

  static async getById(id: number) {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new AppError("Organization not found.", 404);
    }
    return org;
  }
}
