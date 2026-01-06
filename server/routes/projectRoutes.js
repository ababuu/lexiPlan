import express from "express";
import { requireActiveOrg } from "../middleware/tenant.js";
import { logAction, targetExtractors } from "../middleware/auditLogger.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

// protect middleware is applied at app-level in index.js
// enforce tenant is active for these routes
router.use(requireActiveOrg);

router
  .route("/")
  .get(getProjects)
  .post(logAction("CREATE_PROJECT", targetExtractors.project), createProject);
router
  .route("/:id")
  .get(getProjectById)
  .put(logAction("UPDATE_PROJECT", targetExtractors.project), updateProject)
  .delete(logAction("DELETE_PROJECT", targetExtractors.project), deleteProject);

export default router;
