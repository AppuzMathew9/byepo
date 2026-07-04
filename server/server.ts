import { createServer } from "http";
import app from "./app";
import { ENV } from "./config/env";
import { getDb } from "./config/db";
import { setupVite, serveStatic } from "./utils/vite";
import net from "net";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  try {
    // 1. Verify database is reachable before accepting traffic
    console.log("⏳ Connecting to database...");
    await getDb();
    console.log("✅ Database connected successfully.");

    // 2. Create HTTP server wrapping Express app
    const httpServer = createServer(app);

    // 3. Integrate frontend (Vite in dev, static files in prod)
    if (ENV.NODE_ENV === "development") {
      console.log("🛠️  Setting up Vite development middleware...");
      await setupVite(app, httpServer);
    } else {
      console.log("📦 Serving production static assets...");
      serveStatic(app);
    }

    // 4. Find available port and listen
    const preferredPort = Number(ENV.PORT);
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      console.log(`⚠️  Port ${preferredPort} is busy, using port ${port} instead`);
    }

    const serverInstance = httpServer.listen(port, () => {
      console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on http://localhost:${port}/`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
    });

    // 5. Graceful shutdown handlers
    const shutdown = (signal: string) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      serverInstance.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });

      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout.");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason: unknown) => {
      console.error("💥 Unhandled Promise Rejection:", reason);
      serverInstance.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err: Error) => {
      console.error("💥 Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
