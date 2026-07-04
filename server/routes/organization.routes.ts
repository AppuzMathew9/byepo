import { Router } from "express";
import { body } from "express-validator";
import { OrganizationController } from "../controllers/organization.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";

const router = Router();

const createOrgValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Organization name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Organization name must be between 2 and 100 characters."),
];

// Only super_admin can create/list orgs directly
router.post("/", authenticate, authorize("super_admin"), validate(createOrgValidation), OrganizationController.create);
router.get("/", authenticate, authorize("super_admin"), OrganizationController.list);
router.get("/:id", authenticate, authorize("super_admin"), OrganizationController.getOne);

export default router;
