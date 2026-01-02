import Project from "../models/Project.js";
import Document from "../models/Document.js";
import { deleteProjectVectors } from "../services/vectorService.js";

// Create project (scoped to req.orgId)
export const createProject = async (req, res, next) => {
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
export const getProjects = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const projects = await Project.find({ orgId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get single project scoped to org
export const getProjectById = async (req, res, next) => {
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
export const updateProject = async (req, res, next) => {
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

// Delete project (scoped) with cascade delete of documents and vectors
export const deleteProject = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    const id = req.params.id;

    // First, find the project to ensure it exists and belongs to the org
    const project = await Project.findOne({ _id: id, orgId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Delete all vectors associated with this project's documents
    let vectorsDeleted = 0;
    try {
      vectorsDeleted = await deleteProjectVectors(id, orgId);
    } catch (vectorError) {
      console.error("Failed to delete project vectors:", vectorError);
      // Continue with document and project deletion even if vector deletion fails
    }

    // Delete all documents associated with this project
    const documentDeleteResult = await Document.deleteMany({
      projectId: id,
      orgId,
    });

    // Delete the project itself
    await Project.findOneAndDelete({ _id: id, orgId });

    res.json({
      message: "Project, documents, and vectors deleted successfully",
      documentsDeleted: documentDeleteResult.deletedCount,
      vectorsDeleted,
      projectTitle: project.title,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
