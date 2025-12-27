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
    vectorized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
