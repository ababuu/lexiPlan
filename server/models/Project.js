import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done", "blocked"],
      default: "todo",
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    meta: { type: Object },
  },
  { timestamps: true }
);

projectSchema.index({ orgId: 1, title: 1 }, { unique: true });
export default mongoose.model("Project", projectSchema);
