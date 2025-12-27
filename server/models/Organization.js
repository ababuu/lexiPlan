import mongoose from "mongoose";

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ["free", "pro", "basic"], default: "basic" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

orgSchema.index({ name: 1 });

export default mongoose.model("Organization", orgSchema);
