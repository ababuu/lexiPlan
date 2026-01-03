import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All analytics routes require authentication and organization context
router.use(protect);

// GET /api/analytics - Get organization analytics
router.get("/", getAnalytics);

export default router;
