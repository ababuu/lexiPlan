import express from "express";
import { getMetrics } from "../controllers/metricsController.js";

const router = express.Router();

// Lightweight metrics endpoint (not mounted by default)
router.get("/", getMetrics);

export default router;
