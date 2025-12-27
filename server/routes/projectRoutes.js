import express from "express";
import { requireActiveOrg } from "../middleware/tenant.js";
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

router.route("/").get(getProjects).post(createProject);
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

export default router;
