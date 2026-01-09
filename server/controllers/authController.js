import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { logActionDirect } from "../middleware/auditLogger.js";
import { recordUser } from "../services/analyticsService.js";

const cookieOptions = (req) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

export const register = async (req, res, next) => {
  try {
    const { email, password, orgName } = req.body;

    // Validate input
    if (!email || !password || !orgName) {
      return res.status(400).json({
        message: "Email, password, and organization name are required",
      });
    }

    // Check if organization with the same name already exists
    const existingOrg = await Organization.findOne({ name: orgName });
    if (existingOrg) {
      return res.status(409).json({
        message:
          "An organization with this name already exists. If you are part of this organization, please contact your administrator for an invitation.",
      });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new organization and first admin user
    const org = await Organization.create({ name: orgName });
    const user = await User.create({
      email,
      password,
      orgId: org._id,
      orgName: org.name,
      role: "admin",
      status: "active",
    });

    // Log organization creation
    logActionDirect({
      performer: user._id,
      action: "CREATE_ORGANIZATION",
      target: orgName,
      targetId: org._id,
      orgId: org._id,
      metadata: {
        method: "POST",
        path: "/auth/register",
        statusCode: 201,
        isFirstAdmin: true,
      },
    });

    // Update analytics snapshot
    await recordUser({ orgId: org._id });

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions(req));
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        orgName: user.orgName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Account not found" });

    // Check if user is pending (hasn't accepted invite yet)
    if (user.status === "pending" || !user.password) {
      return res.status(403).json({
        message:
          "Please accept your invitation and set a password before logging in",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions(req));
    res.json({
      user: {
        id: user._id,
        email: user.email,
        orgName: user.orgName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // Because 'protect' middleware already ran, req.user or req.userId is available
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        orgName: user.orgName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions(req));
  res.json({ message: "Logged out" });
};

/**
 * @desc    Accept invite and set password
 * @route   POST /api/auth/accept-invite
 * @access  Public (with valid invite token)
 */
export const acceptInvite = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired invite token",
      });
    }

    const { email, orgId, role } = decoded;

    // Find the user by email and orgId
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      orgId: orgId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or invite invalid",
      });
    }

    // Check if user already accepted the invite
    if (user.status === "active" && user.password) {
      return res.status(400).json({
        message: "Invite already accepted. Please login instead.",
      });
    }

    // Update user with hashed password and active status
    user.password = password; // Will be hashed by pre-save middleware
    user.status = "active";
    await user.save();

    // Log the accept invite action
    logActionDirect({
      performer: user._id,
      action: "ACCEPT_INVITE",
      target: user.email,
      targetId: user._id,
      orgId: user.orgId,
      metadata: {
        method: "POST",
        path: "/auth/accept-invite",
        statusCode: 200,
        role: user.role,
      },
    });

    // Generate auth token for immediate login
    const authToken = generateToken(user);
    res.cookie("token", authToken, cookieOptions(req));

    res.status(200).json({
      message: "Invite accepted successfully",
      user: {
        id: user._id,
        email: user.email,
        orgName: user.orgName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    next(error);
  }
};

export default { register, login, logout, getMe, acceptInvite };
