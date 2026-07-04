import { Router } from "express";
import { body } from "express-validator";
import { FeatureFlagController } from "../controllers/featureFlag.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { tenantIsolation, requireOrganization } from "../middleware/tenantIsolation";
import { validate } from "../middleware/validate";

const router = Router({ mergeParams: true });

// All flag routes require authentication + tenant isolation
router.use(authenticate, tenantIsolation, requireOrganization);

const createFlagValidation = [
  body("key")
    .trim()
    .notEmpty().withMessage("Flag key is required.")
    .isLength({ min: 2, max: 128 }).withMessage("Flag key must be 2–128 characters.")
    .matches(/^[a-z0-9_-]+$/).withMessage(
      "Flag key must be lowercase letters, numbers, hyphens, or underscores only."
    ),
  body("description").optional().isString(),
];

const updateFlagValidation = [
  body("key").optional().trim()
    .isLength({ min: 2, max: 128 })
    .matches(/^[a-z0-9_-]+$/),
  body("description").optional().isString(),
  body("enabled").optional().isIn(["true", "false"]).withMessage("Enabled must be 'true' or 'false'."),
];

router.get("/", FeatureFlagController.list);
router.get("/:flagId", FeatureFlagController.getOne);

router.post(
  "/",
  authorize("org_admin", "super_admin"),
  validate(createFlagValidation),
  FeatureFlagController.create
);

router.put(
  "/:flagId",
  authorize("org_admin", "super_admin"),
  validate(updateFlagValidation),
  FeatureFlagController.update
);

router.delete(
  "/:flagId",
  authorize("org_admin", "super_admin"),
  FeatureFlagController.remove
);

export default router;
