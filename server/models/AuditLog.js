import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    performer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Document actions
        "CREATE_DOCUMENT",
        "DELETE_DOCUMENT",
        "UPDATE_DOCUMENT",
        "UPLOAD_DOCUMENT",

        // Project actions
        "CREATE_PROJECT",
        "DELETE_PROJECT",
        "UPDATE_PROJECT",

        // User/Team actions
        "INVITE_USER",
        "REMOVE_USER",
        "UPDATE_USER_ROLE",
        "CREATE_USER",
        "ACCEPT_INVITE",

        // Organization actions
        "CREATE_ORGANIZATION",
        "UPDATE_ORGANIZATION",

        // Authentication actions
        "USER_LOGIN",
        "USER_LOGOUT",
        "USER_REGISTER",

        // Chat actions
        "CREATE_CONVERSATION",
        "DELETE_CONVERSATION",
      ],
      index: true,
    },
    target: {
      type: String,
      required: true,
      maxLength: 500,
    },
    targetId: {
      type: String,
      maxLength: 100,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
    collection: "auditlogs",
  }
);

// Compound index for efficient queries
auditLogSchema.index({ orgId: 1, timestamp: -1 });
auditLogSchema.index({ performer: 1, timestamp: -1 });

// Static method for logging actions
auditLogSchema.statics.logAction = async function (logData) {
  try {
    const auditLog = new this(logData);
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error("Audit logging failed:", error);
    // Don't throw error to prevent breaking the main request
    return null;
  }
};

// Instance method for formatted display
auditLogSchema.methods.getDisplayText = function () {
  const actionMap = {
    CREATE_DOCUMENT: "created document",
    DELETE_DOCUMENT: "deleted document",
    UPDATE_DOCUMENT: "updated document",
    UPLOAD_DOCUMENT: "uploaded document",
    CREATE_PROJECT: "created project",
    DELETE_PROJECT: "deleted project",
    UPDATE_PROJECT: "updated project",
    INVITE_USER: "invited user",
    REMOVE_USER: "removed user",
    UPDATE_USER_ROLE: "updated user role",
    CREATE_USER: "registered user",
    CREATE_ORGANIZATION: "created organization",
    UPDATE_ORGANIZATION: "updated organization",
    USER_LOGIN: "logged in",
    USER_LOGOUT: "logged out",
    USER_REGISTER: "registered account",
    CREATE_CONVERSATION: "started conversation",
    DELETE_CONVERSATION: "deleted conversation",
  };

  const actionText =
    actionMap[this.action] || this.action.toLowerCase().replace(/_/g, " ");
  return `${actionText}`;
};

export default mongoose.model("AuditLog", auditLogSchema);
