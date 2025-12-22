const express = require("express");
const router = express.Router();
const { requireActiveOrg } = require("../middleware/tenant");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// protect middleware is applied at app-level in index.js
// enforce tenant is active for these routes
router.use(requireActiveOrg);

router.route("/").get(getProjects).post(createProject);
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
