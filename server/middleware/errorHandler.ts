import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError";

/**
 * Express global error handling middleware.
 * Catches all errors thrown from controllers and formats the response.
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : "error";
  const message = err.message || "Internal server error";

  // Log programmer/system errors for observability (e.g. database timeouts, syntax errors)
  if (!(err instanceof AppError)) {
    console.error("💥 ERROR (Non-operational):", err);
  }

  res.status(statusCode).json({
    success: false,
    status,
    error: {
      message,
      // Hide stack trace in production to prevent source path leakage
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
};
