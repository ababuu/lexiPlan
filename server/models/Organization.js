const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ["free", "pro", "basic"], default: "basic" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

orgSchema.index({ name: 1 });

module.exports = mongoose.model("Organization", orgSchema);
