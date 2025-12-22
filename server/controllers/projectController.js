const Project = require("../models/Project");

// Create project (scoped to req.orgId)
const createProject = async (req, res, next) => {
  try {
    const { title, description, status, meta } = req.body;
    const orgId = req.orgId;
    if (!orgId)
      return res.status(400).json({ message: "Organization context missing" });

    const project = await Project.create({
      title,
      description,
      status,
      meta,
      orgId,
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// List projects for tenant
const getProjects = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const projects = await Project.find({ orgId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get single project scoped to org
const getProjectById = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const id = req.params.id;
    const project = await Project.findOne({ _id: id, orgId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Update project (scoped)
const updateProject = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const id = req.params.id;
    const updates = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: id, orgId },
      updates,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Delete project (scoped)
const deleteProject = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const id = req.params.id;
    const project = await Project.findOneAndDelete({ _id: id, orgId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
