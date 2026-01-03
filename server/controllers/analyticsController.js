import Document from "../models/Document.js";
import Conversation from "../models/Conversation.js";
import Project from "../models/Project.js";

export const getAnalytics = async (req, res) => {
  try {
    const orgId = req.orgId;

    // 1. Total document count
    const totalDocuments = await Document.countDocuments({ orgId });

    // 2. Document status breakdown
    const [readyDocs, processingDocs, errorDocs] = await Promise.all([
      Document.countDocuments({ orgId, vectorized: true }),
      Document.countDocuments({ orgId, vectorized: false }),
      Document.countDocuments({ orgId, vectorized: { $exists: false } }),
    ]);

    const documentsByStatus = {
      ready: readyDocs,
      processing: processingDocs,
      error: errorDocs,
    };

    // 3. Weekly message breakdown (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const messagesByDay = await Conversation.aggregate([
      {
        $match: {
          orgId: orgId,
          createdAt: { $gte: weekAgo },
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $match: {
          "messages.role": "user", // Only count user messages
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
      {
        $sort: { _id: 1 },
      },
    ]);

    // 4. Documents per project
    const documentsByProject = await Document.aggregate([
      {
        $match: { orgId: orgId },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $group: {
          _id: "$project._id",
          projectName: { $first: "$project.title" },
          documentCount: { $sum: 1 },
        },
      },
      {
        $sort: { documentCount: -1 },
      },
    ]);

    // 5. Total messages sent
    const totalMessages = await Conversation.aggregate([
      {
        $match: { orgId: orgId },
      },
      {
        $unwind: "$messages",
      },
      {
        $match: {
          "messages.role": "user",
        },
      },
      {
        $count: "total",
      },
    ]);

    const totalMessageCount = totalMessages[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalDocuments,
        documentsByStatus,
        messagesByDay,
        documentsByProject,
        totalMessages: totalMessageCount,
        period: {
          start: weekAgo.toISOString(),
          end: new Date().toISOString(),
        },
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
