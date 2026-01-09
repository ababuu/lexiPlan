import mongoose from "mongoose";

const DocumentByProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
      sparse: true,
    },
    projectName: { type: String, default: "Unassigned" },
    documentCount: { type: Number, default: 0 },
    vectorizedCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const MessageByDaySchema = new mongoose.Schema(
  {
    _id: { type: String }, // YYYY-MM-DD
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const RecentDocumentSchema = new mongoose.Schema(
  {
    filename: String,
    vectorized: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
      sparse: true,
    },
    projectName: { type: String, default: "Unassigned" },
  },
  { _id: false }
);

const RecentConversationSchema = new mongoose.Schema(
  {
    title: String,
    messagesCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
      sparse: true,
    },
    projectName: { type: String, default: "Unassigned" },
  },
  { _id: false }
);

const AnalyticsSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      unique: true,
      index: true,
      required: true,
    },

    // Totals
    totalDocuments: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalConversations: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },

    // Status breakdowns
    documentsByStatus: {
      ready: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      error: { type: Number, default: 0 },
    },

    documentsByProject: [DocumentByProjectSchema],
    messagesByDay: [MessageByDaySchema],

    recentDocuments: [RecentDocumentSchema],
    recentConversations: [RecentConversationSchema],

    // Derived metrics
    avgMessagesPerConversation: { type: Number, default: 0 },
    avgDocumentsPerProject: { type: Number, default: 0 },
    processingRate: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Analytics = mongoose.model("Analytics", AnalyticsSchema);
export default Analytics;
