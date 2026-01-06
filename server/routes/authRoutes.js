import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  acceptInvite,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { logActionDirect } from "../middleware/auditLogger.js";

const router = express.Router();

// Delegate auth logic to controller for better separation of concerns
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.post("/accept-invite", acceptInvite);

export default router;
