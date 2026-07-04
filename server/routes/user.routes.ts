import { Router } from "express";
import { body } from "express-validator";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { validate } from "../middleware/validate";

const router = Router({ mergeParams: true });

const createUserValidation = [
  body("name").trim().optional(),
  body("email").trim().isEmail().withMessage("A valid email address is required."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

router.use(authenticate, tenantIsolation, authorize("org_admin"));

router.post("/", validate(createUserValidation), UserController.createUser);
router.get("/", UserController.listUsers);

export default router;
