import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  /**
   * POST /api/auth/signup
   * Registers a new organization and its administrator user in one step.
   * Body: { orgName, name, email, password }
   */
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgName, name, email, password } = req.body;
      const result = await AuthService.register({
        orgName,
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "Organization and admin account registered successfully.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT token and user profile.
   * Body: { email, password }
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   * Clears the user session. Since we use Bearer tokens on the client,
   * this is a success response for client to clear local storage.
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  }

  /**
   * GET /api/auth/me
   * Returns current authenticated user profile.
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: "Unauthenticated" } });
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}
