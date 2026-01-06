import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import { protect } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

const app = express();

// 1. Global Middleware
// Allow credentials for cookie-based auth. In production, set explicit origin.
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json()); // Essential for parsing AI/PDF JSON data

// CSRF protection using double-submit cookie pattern.
// csurf will store the secret in a cookie and expose req.csrfToken().
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

// Apply CSRF protection but skip it for auth endpoints that need to be
// callable before a CSRF token exists (register/login/logout).
app.use((req, res, next) => {
  const csrfExemptPaths = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/me",
    "/api/auth/logout",
    "/api/auth/accept-invite",
  ];

  if (csrfExemptPaths.includes(req.path)) return next();
  return csrfProtection(req, res, next);
});

// Endpoint to fetch CSRF token for single-page apps. Client should call this
// and then include the token in `X-CSRF-Token` header for state-changing requests.
app.get("/api/csrf-token", (req, res) => {
  try {
    res.json({ csrfToken: req.csrfToken() });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate CSRF token" });
  }
});

// 2. Database Connection with Retry Logic (Critical for Docker)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    setTimeout(connectDB, 5000); // Retry after 5s if Mongo isn't up yet
  }
};
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/org", organizationRoutes);

// 4. Global Error Handler (The Senior Touch)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
