import AuditLog from "../models/AuditLog.js";

/**
 * Audit logging middleware factory
 * Creates middleware that logs actions after successful requests
 * @param {string} actionType - The type of action being performed
 * @param {Function|string} targetExtractor - Function to extract target info or static string
 * @returns {Function} Express middleware function
 */
export const logAction = (actionType, targetExtractor) => {
  return async (req, res, next) => {
    console.log(`[AUDIT] Interceptor attached for: ${actionType}`);

    // Store original res.json to intercept successful responses
    const originalJson = res.json;

    res.json = function (data) {
      // Only log if response is successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log asynchronously to avoid blocking response
        setImmediate(() => {
          logAuditAction(req, res, actionType, targetExtractor, data);
        });
      }

      // Call original json method - MUST be last
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Direct logging function for actions that don't go through middleware
 * @param {Object} logData - Audit log data
 */
export const logActionDirect = async (logData) => {
  try {
    await AuditLog.logAction(logData);
  } catch (error) {
    console.error("Direct audit logging failed:", error);
  }
};

/**
 * Internal function to perform the actual audit logging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} actionType - Type of action
 * @param {Function|string} targetExtractor - Target extractor function or string
 * @param {Object} responseData - Response data from the request
 */
async function logAuditAction(
  req,
  res,
  actionType,
  targetExtractor,
  responseData
) {
  try {
    if (!req.user || !req.user.orgId) {
      console.warn("Audit log skipped - missing user or orgId");
      return;
    }

    let target = "Unknown";
    let targetId = null;

    // Extract target information
    if (typeof targetExtractor === "function") {
      const result = targetExtractor(req, res, responseData);
      target = result.target || target;
      targetId = result.targetId || null;

      // Debug logging
      console.log(
        `[AUDIT DEBUG] ${actionType} - Target: "${target}", TargetId: "${targetId}"`
      );
    } else if (typeof targetExtractor === "string") {
      target = targetExtractor;
    } else if (req.body?.name) {
      target = req.body.name;
      targetId = responseData?.id || responseData?._id;
    } else if (req.params?.id) {
      target = `ID: ${req.params.id}`;
      targetId = req.params.id;
    }

    // Create audit log entry
    const auditData = {
      performer: req.userId || req.user.id || req.user._id,
      action: actionType,
      target,
      targetId,
      orgId: req.user.orgId,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
      },
    };

    await AuditLog.logAction(auditData);
    console.log(`[AUDIT SUCCESS] ${actionType} logged for: ${target}`);
  } catch (error) {
    console.error("Audit logging error:", error);
    // Don't throw error to prevent breaking the main application flow
  }
}

/**
 * Common target extractors for reuse
 */
export const targetExtractors = {
  // Extract document filename from request/response
  document: (req, res, responseData) => {
    // Try multiple possible locations for document info
    const filename =
      req.body?.filename ||
      responseData?.filename ||
      responseData?.data?.deletedDocument?.filename ||
      responseData?.data?.filename ||
      `Document ${req.params?.id || "Unknown"}`;

    const targetId =
      req.params?.id ||
      responseData?.id ||
      responseData?._id ||
      responseData?.data?.deletedDocument?.id;

    return {
      target: filename,
      targetId: targetId,
    };
  },

  // Extract project title from request/response
  project: (req, res, responseData) => {
    // Try multiple possible locations for project info
    const title =
      req.body?.title ||
      responseData?.title ||
      responseData?.projectTitle ||
      responseData?.data?.title ||
      `Project ${req.params?.id || "Unknown"}`;

    const targetId =
      req.params?.id ||
      responseData?.id ||
      responseData?._id ||
      responseData?.data?.id;

    return {
      target: title,
      targetId: targetId,
    };
  },

  // Extract user email from request/response
  user: (req, res, responseData) => ({
    target:
      req.body?.email ||
      responseData?.email ||
      `User ${req.params?.userId || "Unknown"}`,
    targetId: req.params?.userId || responseData?.id || responseData?._id,
  }),

  // Extract organization name
  organization: (req, res, responseData) => ({
    target:
      req.body?.name ||
      responseData?.name ||
      `Organization ${req.params?.id || "Unknown"}`,
    targetId: req.params?.id || responseData?.id || responseData?._id,
  }),

  // Generic ID-based extractor
  byId: (req, res, responseData) => ({
    target: `ID: ${
      req.params?.id || responseData?.id || responseData?._id || "Unknown"
    }`,
    targetId: req.params?.id || responseData?.id || responseData?._id,
  }),
};
