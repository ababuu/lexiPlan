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

    // Documents per project using aggregation (much faster)
    const documentsByProject = await Document.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: "$projectId",
          documentCount: { $sum: 1 },
          vectorizedCount: {
            $sum: { $cond: [{ $eq: ["$vectorized", true] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          projectName: { $ifNull: ["$project.title", "Unnamed Project"] },
          documentCount: 1,
          vectorizedCount: 1,
        },
      },
      { $sort: { documentCount: -1 } },
    ]);

    // 3. Conversation Analytics - optimized with aggregation
    const [conversationStats, messagesByDay, conversationsByProject] =
      await Promise.all([
        // Get total conversations and messages count
        Conversation.aggregate([
          { $match: { orgId } },
          {
            $group: {
              _id: null,
              totalConversations: { $sum: 1 },
              totalMessages: { $sum: { $size: "$messages" } },
            },
          },
        ]),

        // Messages by day (last 7 days)
        Conversation.aggregate([
          { $match: { orgId } },
          { $unwind: "$messages" },
          {
            $match: {
              "messages.timestamp": { $gte: weekAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$messages.timestamp",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Conversations by project
        Conversation.aggregate([
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
        ]),
      ]);

    const totalConversations = conversationStats[0]?.totalConversations || 0;
    const totalMessages = conversationStats[0]?.totalMessages || 0;

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
