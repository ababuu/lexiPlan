import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse"; // Correct named import for ESM v2
import { processDocument } from "../services/vectorService.js";
import {
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";
import Document from "../models/Document.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/documents - Get documents with optional project filter
router.get("/", getDocuments);

// GET /api/documents/:id - Get specific document
router.get("/:id", getDocumentById);

// PUT /api/documents/:id - Update document
router.put("/:id", updateDocument);

// DELETE /api/documents/:id - Delete document
router.delete("/:id", deleteDocument);

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. Initialize the Parser with the buffer
    const parser = new PDFParse({ data: req.file.buffer });

    // 2. Extract the text
    const result = await parser.getText();

    // 3. Always destroy the parser instance to free up memory (Senior requirement)
    await parser.destroy();

    // 4. Save metadata
    const newDoc = await Document.create({
      filename: req.file.originalname,
      orgId: req.orgId,
      projectId,
      content: result.text,
      vectorized: false,
    });

    // 5. Background vectorization
    processDocument(result.text, newDoc._id, req.orgId, projectId)
      .then(async () => {
        newDoc.vectorized = true;
        await newDoc.save();
        console.log(`✅ Vectorization complete: ${newDoc.filename}`);
      })
      .catch((err) => console.error("❌ Background Error:", err));

    res.status(202).json({
      message: "Document uploaded and processing started",
      docId: newDoc._id,
    });
  } catch (err) {
    console.error("PDF Parsing Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
