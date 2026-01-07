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

// 1. GLOBAL CORS (MUST BE FIRST)
const isDevelopment = process.env.NODE_ENV === "development";

const corsOptions = {
  origin: isDevelopment ? true : process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200, // Legacy browser support (IE11/SmartTVs)
};

// Apply CORS to every single request
app.use(cors(corsOptions));

// Explicitly handle Preflight (OPTIONS) for all routes
app.options("/*splat", cors(corsOptions));

// 2. STANDARD PARSERS
app.use(express.json());
app.use(cookieParser());

// 3. CSRF PROTECTION LOGIC
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Crucial for cross-site
  },
});

// CSRF Wrapper: Skip for OPTIONS and specific paths
app.use((req, res, next) => {
  // 1. Always skip CSRF for OPTIONS requests (Preflight)
  if (req.method === "OPTIONS") return next();

  // 2. Skip for these specific paths
  const csrfExemptPaths = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/me", // Added for initial auth check
    "/api/csrf-token",
  ];

  if (csrfExemptPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  return csrfProtection(req, res, next);
});

// CSRF Token Endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 4. DATABASE CONNECTION
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// 5. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/chat", protect, chatRoutes); // Added protect if chat needs auth
app.use("/api/analytics", protect, analyticsRoutes);
app.use("/api/org", protect, organizationRoutes);

// 6. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  // Handle CSRF errors specifically
  if (err.code === "EBADCSRFTOKEN") {
    return res
      .status(403)
      .json({ message: "Form tampered with / Invalid CSRF token" });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
