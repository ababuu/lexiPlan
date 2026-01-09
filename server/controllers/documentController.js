import Document from "../models/Document.js";
import Project from "../models/Project.js";
import {
  deleteDocumentVectors,
  processDocument,
} from "../services/vectorService.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { PDFParse } from "pdf-parse";
import AuditLog from "../models/AuditLog.js";
import {
  recordDocument,
  markDocumentVectorized,
} from "../services/analyticsService.js";

// GET /api/documents - Get documents for organization with pagination and filtering
export const getDocuments = asyncHandler(async (req, res) => {
  const orgId = req.orgId; // From auth middleware
  const {
    projectId,
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: "Organization ID is required",
    });
  }

  // Build query object
  const query = { orgId };

  // Add projectId filter if provided
  if (projectId && projectId !== "all") {
    query.projectId = projectId;
  }

  // Add search filter
  if (search) {
    query.filename = { $regex: search, $options: "i" };
  }

  // Add status filter
  if (status) {
    if (status === "ready") query.vectorized = true;
    else if (status === "processing") query.vectorized = false;
    else if (status === "error") query.vectorized = null;
  }

  // Calculate pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query with pagination
  const [documents, totalCount] = await Promise.all([
    Document.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("projectId", "title description")
      .select(
        "filename orgId projectId content vectorized createdAt updatedAt size"
      ),
    Document.countDocuments(query),
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPreviousPage = pageNum > 1;

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPreviousPage,
      },
    },
    filter: { projectId, search, status },
  });
});

// GET /api/documents/:id - Get specific document
export const getDocumentById = asyncHandler(async (req, res) => {
  const orgId = req.orgId;
  const { id } = req.params;

  const document = await Document.findOne({
    _id: id,
    orgId,
  }).populate("projectId", "title description");

  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document not found",
    });
  }

  res.json({
    success: true,
    data: {
      document,
    },
  });
});

// GET /api/documents/:id/pdf - Get PDF file
export const deleteDocument = asyncHandler(async (req, res) => {
  const orgId = req.orgId;
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
    data: {
      deletedDocument: {
        id: document._id,
        filename: document.filename,
      },
      vectorsDeleted,
    },
  });
});

// PUT /api/documents/:id - Update document
export const updateDocument = asyncHandler(async (req, res) => {
  const orgId = req.orgId;
  const { id } = req.params;
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({
      success: false,
      message: "Filename is required",
    });
  }

  // Find and update the document
  const document = await Document.findOneAndUpdate(
    { _id: id, orgId },
    {
      filename: filename.trim(),
      updatedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document not found",
    });
  }

  res.json({
    success: true,
    message: "Document updated successfully",
    data: {
      document: {
        id: document._id,
        filename: document.filename,
        updatedAt: document.updatedAt,
      },
    },
  });
});

// POST /api/documents/upload - Upload and process document
export const uploadDocument = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const orgId = req.orgId;
  const userId = req.userId;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size exceeds 2MB limit",
    });
  }

  // 1. Initialize the Parser with the buffer
  const parser = new PDFParse({ data: req.file.buffer });

  // 2. Extract the text
  const result = await parser.getText();

  // 3. Always destroy the parser instance to free up memory
  await parser.destroy();

  // 4. Save metadata
  const projectName = projectId
    ? (await Project.findById(projectId).select("title"))?.title
    : null;

  const newDoc = await Document.create({
    filename: req.file.originalname,
    orgId: orgId,
    projectId,
    content: result.text,
    size: req.file.size,
    vectorized: false,
  });

  // 4b. Update analytics snapshot (initially not vectorized)
  await recordDocument({
    orgId,
    filename: newDoc.filename,
    vectorized: false,
    projectId,
    projectName,
  });

  // 5. Background vectorization
  processDocument(result.text, newDoc._id, orgId, projectId)
    .then(async () => {
      newDoc.vectorized = true;
      await newDoc.save();
      await markDocumentVectorized({ orgId, projectId, projectName });
    })
    .catch((err) => console.error("❌ Background Error:", err));

  // 6. Log the document upload action
  const auditData = {
    performer: userId,
    action: "UPLOAD_DOCUMENT",
    target: req.file.originalname,
    targetId: newDoc._id,
    orgId: orgId,
    metadata: {
      method: "POST",
      path: "/upload",
      statusCode: 202,
      projectId: projectId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
  };

  AuditLog.logAction(auditData).catch((err) =>
    console.error("Audit logging failed for document upload:", err)
  );

  res.status(202).json({
    success: true,
    message: "Document uploaded and processing started",
    data: {
      docId: newDoc._id,
      filename: newDoc.filename,
    },
  });
});
