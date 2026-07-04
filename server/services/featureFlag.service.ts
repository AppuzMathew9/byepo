import { FeatureFlagRepository } from "../repositories/featureFlag.repository";
import { AppError } from "../utils/appError";

export interface CreateFlagPayload {
  organizationId: number;
  key: string;
  description?: string;
}

export interface UpdateFlagPayload {
  key?: string;
  description?: string;
  enabled?: "true" | "false";
}

export class FeatureFlagService {
  static async listByOrg(organizationId: number) {
    return FeatureFlagRepository.listByOrg(organizationId);
  }

  static async getById(flagId: number, organizationId: number) {
    const flag = await FeatureFlagRepository.findById(flagId);
    if (!flag || flag.organizationId !== organizationId) {
      throw new AppError("Feature flag not found.", 404);
    }
    return flag;
  }

  static async create(payload: CreateFlagPayload) {
    const existing = await FeatureFlagRepository.findByKeyAndOrg(
      payload.organizationId,
      payload.key
    );
    if (existing) {
      throw new AppError(
        `A feature flag with key "${payload.key}" already exists in this organization.`,
        409
      );
    }

    const flag = await FeatureFlagRepository.create({
      organizationId: payload.organizationId,
      key: payload.key,
      description: payload.description,
    });

    if (!flag) throw new AppError("Failed to create feature flag.", 500);
    return flag;
  }

  static async update(
    flagId: number,
    organizationId: number,
    payload: UpdateFlagPayload
  ) {
    const flag = await this.getById(flagId, organizationId);
    
    // Check if new key collides with an existing flag
    if (payload.key && payload.key !== flag.key) {
      const existing = await FeatureFlagRepository.findByKeyAndOrg(organizationId, payload.key);
      if (existing) {
        throw new AppError(`A feature flag with key "${payload.key}" already exists.`, 409);
      }
    }

    return FeatureFlagRepository.update(flagId, payload);
  }

  static async toggle(
    flagId: number,
    organizationId: number,
    enabled: "true" | "false"
  ) {
    await this.getById(flagId, organizationId);
    return FeatureFlagRepository.update(flagId, { enabled });
  }

  static async delete(flagId: number, organizationId: number) {
    const flag = await this.getById(flagId, organizationId);
    await FeatureFlagRepository.delete(flagId);
    return flag;
  }

  static async checkFeature(key: string, organizationId: number) {
    const flag = await FeatureFlagRepository.findByKeyAndOrg(organizationId, key);
    if (!flag) {
      return { key, enabled: false, found: false };
    }
    return {
      key: flag.key,
      enabled: flag.enabled === "true",
      found: true,
    };
  }
}
