import Document from "../models/Document.js";
import Conversation from "../models/Conversation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  try {
    const orgId = req.orgId;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Document Analytics
    const totalDocuments = await Document.countDocuments({ orgId });

    // Document status - using vectorized field to determine processing status
    const [readyDocs, processingDocs] = await Promise.all([
      Document.countDocuments({ orgId, vectorized: true }),
      Document.countDocuments({ orgId, vectorized: false }),
    ]);

    const documentsByStatus = {
      ready: readyDocs,
      processing: processingDocs,
      error: 0, // Add error field for UI compatibility
    };

    // 2. Project Analytics
    const projects = await Project.find({ orgId }).select(
      "title description status createdAt"
    );
    const totalProjects = projects.length;

    // Projects by status
    const projectsByStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    // Documents per project with actual project names

    const allDocuments = await Document.find({ orgId }).populate(
      "projectId",
      "title"
    );

    const documentsByProject = allDocuments.reduce((acc, doc) => {
      const projectName = doc.projectId?.title || "Unnamed Project";
      const existing = acc.find((item) => item.projectName === projectName);
      if (existing) {
        existing.documentCount += 1;
      } else {
        acc.push({
          _id: doc.projectId?._id || "unknown",
          projectName: projectName,
          documentCount: 1,
          vectorizedCount: doc.vectorized ? 1 : 0,
        });
      }
      return acc;
    }, []);

    // 3. Conversation Analytics
    const conversations = await Conversation.find({ orgId }).select(
      "title messages createdAt projectId updatedAt"
    );
    const totalConversations = conversations.length;

    // Total messages across all conversations
    const totalMessages = conversations.reduce(
      (total, conv) => total + conv.messages.length,
      0
    );

    const messagesByDayObj = {};

    allConversations.forEach((conv) => {
      conv.messages.forEach((msg) => {
        const msgDate = msg.timestamp || conv.createdAt;
        if (msgDate >= weekAgo) {
          const dateKey = msgDate.toISOString().split("T")[0];
          messagesByDayObj[dateKey] = (messagesByDayObj[dateKey] || 0) + 1;
        }
      });
    });

    const messagesByDay = Object.entries(messagesByDayObj)
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => a._id.localeCompare(b._id));

    // Conversations by project
    const conversationsByProject = await Conversation.aggregate([
      {
        $match: {
          orgId: orgId,
          projectId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $group: {
          _id: "$project._id",
          projectName: { $first: "$project.title" },
          conversationCount: { $sum: 1 },
          totalMessages: { $sum: { $size: "$messages" } },
        },
      },
      { $sort: { conversationCount: -1 } },
    ]);

    // 4. User Analytics
    const totalUsers = await User.countDocuments({ orgId });
    const usersByRole = await User.aggregate([
      { $match: { orgId: orgId } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Recent Activity - actual recent documents and conversations
    const recentDocuments = await Document.find({ orgId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("filename createdAt vectorized projectId")
      .populate("projectId", "title");

    const recentConversations = await Conversation.find({ orgId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("title updatedAt messages projectId")
      .populate("projectId", "title");

    // 6. Calculated insights from real data
    const avgMessagesPerConversation =
      totalConversations > 0
        ? Math.round(totalMessages / totalConversations)
        : 0;
    const avgDocumentsPerProject =
      totalProjects > 0 ? Math.round(totalDocuments / totalProjects) : 0;
    const processingRate =
      totalDocuments > 0 ? Math.round((readyDocs / totalDocuments) * 100) : 0;

    res.json({
      success: true,
      data: {
        // Document metrics
        totalDocuments,
        documentsByStatus,
        documentsByProject, // This should have projectName and documentCount
        recentDocuments,

        // Project metrics
        totalProjects,
        projectsByStatus,

        // Conversation metrics
        totalConversations,
        totalMessages,
        messagesByDay, // This should have _id (date) and count
        conversationsByProject,
        recentConversations,

        // User metrics
        totalUsers,
        usersByRole,

        // Calculated insights
        avgMessagesPerConversation,
        avgDocumentsPerProject,
        processingRate,

        // Metadata
        period: {
          start: weekAgo.toISOString(),
          end: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
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
