import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { logAction, targetExtractors } from "../middleware/auditLogger.js";
import {
  inviteUser,
  getTeamMembers,
  updateUserRole,
  removeTeamMember,
  getAuditLogs,
} from "../controllers/organizationController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/org/invite - Admin only can invite users
router.post(
  "/invite",
  authorize("admin"),
  logAction("INVITE_USER", targetExtractors.user),
  inviteUser
);

// GET /api/org/team - All authenticated users can view team
router.get("/team", getTeamMembers);

// PUT /api/org/team/:userId/role - Admin only can update roles
router.put(
  "/team/:userId/role",
  authorize("admin"),
  logAction("UPDATE_USER_ROLE", targetExtractors.user),
  updateUserRole
);

// DELETE /api/org/team/:userId - Admin only can remove members
router.delete(
  "/team/:userId",
  authorize("admin"),
  logAction("REMOVE_USER", targetExtractors.user),
  removeTeamMember
);

// GET /api/org/logs - Admin only can view audit logs
router.get("/logs", authorize("admin"), getAuditLogs);

export default router;
