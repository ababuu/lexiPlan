import User from "../models/User.js";
import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @desc    Invite a user to organization
 * @route   POST /api/org/invite
 * @access  Private (Admin only)
 */
export const inviteUser = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const inviterOrgId = req.user.orgId;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, member, or viewer",
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      // Check if they're already in this organization
      if (existingUser.orgId.toString() === inviterOrgId.toString()) {
        return res.status(400).json({
          message: "User is already a member of this organization",
        });
      } else {
        return res.status(400).json({
          message: "User already exists in another organization",
        });
      }
    }

    // Get organization info
    const organization = await Organization.findById(inviterOrgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Generate secure invite token with JWT
    const invitePayload = {
      email: email.toLowerCase().trim(),
      orgId: inviterOrgId,
      role: role,
    };

    const inviteToken = jwt.sign(invitePayload, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    // Create new user with pending status (no password yet)
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      orgId: inviterOrgId,
      orgName: organization.name,
      role: role,
      status: "pending", // Invited users start as pending until they accept invite
    });

    // Generate invite link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/accept-invite?token=${inviteToken}`;

    // Return invite token and link for demo purposes
    res.status(201).json({
      message: "User invited successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        orgId: newUser.orgId,
        orgName: newUser.orgName,
        createdAt: newUser.createdAt,
      },
      inviteToken: inviteToken,
      inviteLink: inviteLink,
    });
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ message: "Server error while inviting user" });
  }
};

/**
 * @desc    Get all team members in organization
 * @route   GET /api/org/team
 * @access  Private
 */
export const getTeamMembers = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const teamMembers = await User.find({ orgId })
      .select("-password")
      .sort({ role: 1, createdAt: 1 });

    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching team members" });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/org/team/:userId/role
 * @access  Private (Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminOrgId = req.user.orgId;

    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, member, or viewer",
      });
    }

    // Find user and check they're in same organization
    const user = await User.findOne({ _id: userId, orgId: adminOrgId });

    if (!user) {
      return res.status(404).json({
        message: "User not found in your organization",
      });
    }

    // Prevent admin from demoting themselves if they're the only admin
    if (user._id.toString() === req.userId.toString() && role !== "admin") {
      const adminCount = await User.countDocuments({
        orgId: adminOrgId,
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message:
            "Cannot change role. Organization must have at least one admin",
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error while updating user role" });
  }
};

/**
 * @desc    Remove team member
 * @route   DELETE /api/org/team/:userId
 * @access  Private (Admin only)
 */
export const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminOrgId = req.user.orgId;

    // Find user and check they're in same organization
    const user = await User.findOne({ _id: userId, orgId: adminOrgId });

    if (!user) {
      return res.status(404).json({
        message: "User not found in your organization",
      });
    }

    // Prevent admin from removing themselves if they're the only admin
    if (user._id.toString() === req.userId.toString()) {
      const adminCount = await User.countDocuments({
        orgId: adminOrgId,
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message:
            "Cannot remove yourself. Organization must have at least one admin",
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Remove team member error:", error);
    res
      .status(500)
      .json({ message: "Server error while removing team member" });
  }
};

/**
 * @desc    Get organization audit logs
 * @route   GET /api/org/logs
 * @access  Private (Admin only)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get audit logs for the organization
    const logs = await AuditLog.find({ orgId })
      .populate("performer", "email")
      .sort({ timestamp: -1 }) // Use timestamp field that exists in DB
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await AuditLog.countDocuments({ orgId });

    // Format logs for frontend
    const formattedLogs = logs.map((log) => ({
      _id: log._id,
      action: log.action,
      performer: {
        _id: log.performer?._id,
        email: log.performer?.email,
      },
      target: log.target,
      targetId: log.targetId,
      metadata: log.metadata,
      timestamp: log.timestamp, // Use the actual timestamp field
      createdAt: log.timestamp, // Provide for backward compatibility
      displayText: log.getDisplayText(),
      formattedDate: log.timestamp
        ? log.timestamp.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Unknown date",
    }));

    res.json({
      success: true,
      data: formattedLogs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: logs.length,
        totalLogs: total,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error while fetching audit logs" });
  }
};
