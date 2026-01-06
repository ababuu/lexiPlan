import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated (should be called after protect middleware)
      if (!req.user || !req.userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      // Get user's role from database to ensure it's current
      const user = await User.findById(req.userId).select("role orgId");
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${allowedRoles.join(
            " or "
          )}. Current role: ${user.role}`,
        });
      }

      // Attach user's role to request for use in controllers
      req.user.role = user.role;
      req.user.orgId = user.orgId;

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      return res.status(500).json({
        message: "Server error during authorization",
      });
    }
  };
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {...string} roles - Roles to check against
 * @returns {boolean} True if user has any of the specified roles
 */
export const hasRole = (user, ...roles) => {
  return user && user.role && roles.includes(user.role);
};

/**
 * Check if user is admin
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, "admin");
};

/**
 * Check if user can modify content (admin or member)
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user can modify content
 */
export const canModify = (user) => {
  return hasRole(user, "admin", "member");
};
