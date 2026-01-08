import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    content: String, // Raw text for backup
    size: { type: Number }, // File size in bytes (optional for backward compatibility)
    vectorized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for better query performance
documentSchema.index({ orgId: 1, projectId: 1 });
documentSchema.index({ orgId: 1, vectorized: 1 });
documentSchema.index({ orgId: 1, createdAt: -1 });

export default mongoose.model("Document", documentSchema);
