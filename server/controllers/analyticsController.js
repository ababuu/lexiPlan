import {
  getAnalyticsSnapshot,
  ensureAnalytics,
} from "../services/analyticsService.js";

export const getAnalytics = async (req, res) => {
  try {
    const orgId = req.orgId;
    // Ensure a snapshot exists (idempotent)
    await ensureAnalytics(orgId);
    const snapshot = await getAnalyticsSnapshot(orgId);

    // Normalize project and message aggregates to avoid zeroed charts when counts exist
    const normalizedProjects = (snapshot.documentsByProject || []).map((p) => {
      const obj = p.toObject?.() || p;
      const docCount = Number(obj.documentCount) || 0;
      const vecCount = Number(obj.vectorizedCount) || 0;
      return {
        ...obj,
        documentCount: docCount === 0 && vecCount > 0 ? vecCount : docCount,
        vectorizedCount: vecCount,
      };
    });

    const normalizedMessagesByDay = (() => {
      const items = (snapshot.messagesByDay || []).map((d) => ({
        ...(d.toObject?.() || d),
        count: Number(d.count) || 0,
      }));
      const hasNonZero = items.some((d) => d.count > 0);
      if (hasNonZero) return items;

      const fallbackCount = (snapshot.recentConversations || []).reduce(
        (sum, conv) => sum + (Number(conv.messagesCount) || 0),
        0
      );
      const total = fallbackCount || snapshot.totalMessages || 0;
      if (!total) return items;

      const todayStr = new Date().toISOString().slice(0, 10);
      return [{ _id: todayStr, count: total }];
    })();

    // Map recentConversations to include messages array for UI compatibility
    const recentConversations = (snapshot.recentConversations || []).map(
      (conv) => ({
        ...(conv.toObject?.() || conv),
        messages: Array(conv.messagesCount || 0).fill(null),
      })
    );

    res.json({
      success: true,
      data: {
        totalDocuments: snapshot.totalDocuments || 0,
        totalMessages: snapshot.totalMessages || 0,
        totalConversations: snapshot.totalConversations || 0,
        totalProjects: snapshot.totalProjects || 0,
        totalUsers: snapshot.totalUsers || 0,
        documentsByStatus: snapshot.documentsByStatus || {
          ready: 0,
          processing: 0,
          error: 0,
        },
        documentsByProject: normalizedProjects,
        messagesByDay: normalizedMessagesByDay,
        recentDocuments: snapshot.recentDocuments || [],
        recentConversations,
        avgMessagesPerConversation: snapshot.avgMessagesPerConversation || 0,
        avgDocumentsPerProject: snapshot.avgDocumentsPerProject || 0,
        processingRate: snapshot.processingRate || 0,
        lastUpdated: snapshot.lastUpdated || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
};
