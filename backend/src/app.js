import express from "express";
import helmet from "helmet";
import cors from "cors";
import config from "./config.js";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import storageRoutes from "./routes/storage.routes.js";
import filesRoutes from "./routes/files.routes.js";
import {
  unknownEndpoint,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(helmet());

// Only allow the frontend to call the API from a browser
app.use(cors({ origin: config.CORS_ORIGIN }));

// Parse JSON request bodies into req.body
app.use(express.json());

// Health check. Also checks that the API can reach the database.
app.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/files", filesRoutes);

// Important that this is at the end so that it only handles requests that did not match previous routes
app.use(unknownEndpoint);
// Important that this is at the end so that it handles errors from all routes
app.use(errorHandler);

export default app;
