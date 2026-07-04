import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";

const router = Router();

const signupValidation = [
  body("orgName")
    .trim()
    .notEmpty().withMessage("Organization name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Organization name must be between 2 and 100 characters."),
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("A valid email address is required.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("A valid email address is required.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required."),
];

router.post("/signup", validate(signupValidation), AuthController.signup);
router.post("/login", validate(loginValidation), AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
