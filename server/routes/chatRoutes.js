import express from "express";
import { protect } from "../middleware/auth.js";
import {
  chatWithDocuments,
  getChatHistory,
  getProjectChatHistory,
  getConversation,
  deleteConversation,
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication and tenant isolation
router.use(protect);

// Chat streaming endpoint
router.post("/", chatWithDocuments);

// Chat history management
router.get("/history", getChatHistory);
router.get("/history/project/:projectId", getProjectChatHistory);
router.get("/:id", getConversation);
router.delete("/:id", deleteConversation);

export default router;
