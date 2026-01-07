import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: false,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
conversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
conversationSchema.index({ orgId: 1, projectId: 1 });
conversationSchema.index({ orgId: 1, updatedAt: -1 });
conversationSchema.index({ orgId: 1, createdAt: -1 });
conversationSchema.index({ "messages.timestamp": 1 });

export default mongoose.model("Conversation", conversationSchema);
