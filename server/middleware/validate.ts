import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

/**
 * Validation Middleware Factory.
 *
 * Accepts an array of express-validator ValidationChain rules,
 * runs them, and short-circuits the request with a 422 error if any fail.
 *
 * Usage:
 *   router.post("/login",
 *     validate([
 *       body("email").isEmail().normalizeEmail(),
 *       body("password").isLength({ min: 8 })
 *     ]),
 *     authController.login
 *   )
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations in parallel for performance
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({
        success: false,
        status: "fail",
        error: {
          message: "Validation failed. Please check the fields below.",
          details: errors.array().map((e) => ({
            field: e.type === "field" ? e.path : undefined,
            message: e.msg,
          })),
        },
      });
      return;
    }

    next();
  };
};
