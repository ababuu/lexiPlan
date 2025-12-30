import express from "express";
import { chatWithDocuments } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST /api/chat
// Protected by JWT to ensure we have the orgId for RAG filtering
router.post("/", protect, chatWithDocuments);

export default router;
