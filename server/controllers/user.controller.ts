import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/appError";

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = Number(req.params.orgId);
      const { name, email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required.", 400);
      }

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new AppError("User with this email already exists.", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await UserRepository.create({
        name,
        email,
        passwordHash: hashedPassword,
        role: "user",
        organizationId: orgId,
      });

      if (!newUser) {
        throw new AppError("Failed to create user.", 500);
      }

      const { passwordHash: _, ...sanitizedUser } = newUser;

      res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: sanitizedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = Number(req.params.orgId);
      const usersList = await UserRepository.listByOrg(orgId);

      // Sanitize password hashes
      const sanitizedUsers = usersList.map((u: any) => {
        const { passwordHash, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });

      res.status(200).json({
        success: true,
        data: sanitizedUsers,
      });
    } catch (err) {
      next(err);
    }
  }
}
