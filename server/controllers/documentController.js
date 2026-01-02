import Document from "../models/Document.js";
import { deleteDocumentVectors } from "../services/vectorService.js";
// GET /api/documents - Get documents for organization with optional project filter
export const getDocuments = async (req, res) => {
  try {
    const { orgId } = req.user; // Required from authenticated user
    const { projectId } = req.query; // Optional filter parameter

    if (!orgId) {
      return res.status(400).json({
        message: "Organization ID is required",
      });
    }

    // Build query object
    const query = { orgId };

    // Add projectId filter if provided
    if (projectId) {
      query.projectId = projectId;
    }

    // Fetch documents with optional project filter
    const documents = await Document.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .populate("projectId", "name description") // Populate project details
      .select(
        "filename orgId projectId content vectorized createdAt updatedAt"
      );

    res.json({
      success: true,
      count: documents.length,
      documents,
      filter: projectId ? { projectId } : { orgId },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

// GET /api/documents/:id - Get specific document
export const getDocumentById = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      orgId,
    }).populate("projectId", "name description");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
};

// DELETE /api/documents/:id - Delete document with vectors
export const deleteDocument = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    // First, find the document to ensure it exists and belongs to the org
    const document = await Document.findOne({
      _id: id,
      orgId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete associated vectors first
    let vectorsDeleted = 0;
    try {
      vectorsDeleted = await deleteDocumentVectors(id, orgId);
    } catch (vectorError) {
      console.error("Failed to delete vectors:", vectorError);
      // Continue with document deletion even if vector deletion fails
    }

    // Delete the document
    await Document.findOneAndDelete({ _id: id, orgId });

    res.json({
      success: true,
      message: "Document and associated vectors deleted successfully",
      deletedDocument: {
        id: document._id,
        filename: document.filename,
      },
      vectorsDeleted,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};
