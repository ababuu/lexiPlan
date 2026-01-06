import useAuthStore from "../store/useAuthStore";

/**
 * Permission-based UI component
 * @param {Object} props
 * @param {Array<string>} props.roles - Array of roles that can access the content
 * @param {React.ReactNode} props.children - Content to render if user has access
 * @param {React.ReactNode} props.fallback - Optional content to render if user lacks access
 * @returns {React.ReactNode} The children or fallback content
 */
const HasAccess = ({ roles, children, fallback = null }) => {
  const { user } = useAuthStore();

  // If no user or no role specified, deny access
  if (!user || !user.role) {
    return fallback;
  }

  // If no roles specified, allow access (backward compatibility)
  if (!roles || roles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (roles.includes(user.role)) {
    return children;
  }

  return fallback;
};

// Convenience wrapper components
export const AdminOnly = ({ children, fallback = null }) => (
  <HasAccess roles={["admin"]} fallback={fallback}>
    {children}
  </HasAccess>
);

export const MemberOrAdmin = ({ children, fallback = null }) => (
  <HasAccess roles={["admin", "member"]} fallback={fallback}>
    {children}
  </HasAccess>
);

export const NotViewer = ({ children, fallback = null }) => (
  <HasAccess roles={["admin", "member"]} fallback={fallback}>
    {children}
  </HasAccess>
);

export default HasAccess;
