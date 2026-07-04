import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { ENV } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";
import { FeatureFlagController } from "./controllers/featureFlag.controller";

// Route modules
import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import featureFlagRoutes from "./routes/featureFlag.routes";
import userRoutes from "./routes/user.routes";

const app: Express = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: ENV.NODE_ENV === "production"
      ? process.env.CLIENT_ORIGIN ?? "*"
      : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP. Please try again in 15 minutes.",
});
app.use("/api", globalLimiter);

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Org Admin: Feature flag CRUD & User management ──────────────────────────
// Mount BEFORE /api/organizations so sub-paths aren't intercepted
app.use("/api/orgs/:orgId/flags", featureFlagRoutes);
app.use("/api/orgs/:orgId/users", userRoutes);

// ─── Super Admin: Organization management ─────────────────────────────────────
app.use("/api/organizations", organizationRoutes);

// ─── End User: Feature flag check ─────────────────────────────────────────────
app.post("/api/feature/check", authenticate, FeatureFlagController.check);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
