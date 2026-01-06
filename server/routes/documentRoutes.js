import express from "express";
import multer from "multer";
import { logAction, targetExtractors } from "../middleware/auditLogger.js";
import {
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
  uploadDocument,
} from "../controllers/documentController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/documents - Get documents with optional project filter
router.get("/", getDocuments);

// GET /api/documents/:id - Get specific document
router.get("/:id", getDocumentById);

// PUT /api/documents/:id - Update document
router.put(
  "/:id",
  logAction("UPDATE_DOCUMENT", targetExtractors.document),
  updateDocument
);

// DELETE /api/documents/:id - Delete document
router.delete(
  "/:id",
  logAction("DELETE_DOCUMENT", targetExtractors.document),
  deleteDocument
);

// POST /api/documents/upload - Upload document
router.post("/upload", upload.single("file"), uploadDocument);

export default router;
