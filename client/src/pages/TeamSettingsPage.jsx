import React, { useState, useEffect } from "react";
import {
  Plus,
  UserPlus,
  Shield,
  Users,
  Trash2,
  Edit,
  Activity,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { ScrollArea } from "../components/ui/ScrollArea";
import TableSkeleton from "../components/ui/TableSkeleton";
import { Skeleton } from "../components/ui/Skeleton";
import { organizationApi } from "../lib/api";
import { useToast } from "../hooks/useToast";
import useAuthStore from "../store/useAuthStore";
import HasAccess, { AdminOnly } from "../components/HasAccess";

const TeamSettingsPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member",
  });
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Format date for better display
  const formatActivityDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Less than 1 minute ago
    if (diffMins < 1) {
      return "Just now";
    }

    // Less than 60 minutes ago
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than 24 hours ago
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    // Same year - don't show year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Different year - show full date
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getTeamMembers();
      setTeamMembers(response.data.data);
    } catch (error) {
      toast.error({ description: "Failed to fetch team members" });
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await organizationApi.getAuditLogs();
      setAuditLogs(response.data.data || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch audit logs";
      toast.error({ description: message });
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch logs when switching to activity tab
  useEffect(() => {
    if (activeTab === "activity" && user?.role === "admin") {
      fetchAuditLogs();
    }
  }, [activeTab, user?.role]);

  // Handle invite user
  const handleInviteUser = async (e) => {
    e.preventDefault();

    if (!inviteForm.email.trim()) {
      toast.error({ description: "Email is required" });
      return;
    }

    try {
      setInviteLoading(true);
      const response = await organizationApi.inviteUser(inviteForm);

      // Store invite link for success modal
      setInviteLink(response.data.inviteLink);

      // Close invite dialog and show success modal
      handleCloseDialog();
      setSuccessModalOpen(true);

      // Refresh team members list
      await fetchTeamMembers();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to invite user";
      toast.error({ description: message });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setInviteDialogOpen(false);
    setInviteForm({ email: "", role: "member" });
  };

  // Copy invite link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success({ description: "Invite link copied to clipboard!" });
    } catch (error) {
      toast.error({ description: "Failed to copy link" });
    }
  };

  // Open invite link in new tab
  const handleOpenInNewTab = async () => {
    try {
      // Logout current admin before opening invite link
      const { logout } = useAuthStore.getState();
      await logout();

      // Open invite link in new tab
      window.open(inviteLink, "_blank");

      // Redirect current tab to login
      window.location.href = "/login";
    } catch (error) {
      toast.error({ description: "Failed to logout" });
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await organizationApi.updateUserRole(userId, { role: newRole });
      toast.success({ description: "Role updated successfully" });
      await fetchTeamMembers(); // Refresh list
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update role";
      toast.error({ description: message });
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId, userEmail) => {
    if (
      !confirm(`Are you sure you want to remove ${userEmail} from the team?`)
    ) {
      return;
    }

    try {
      await organizationApi.removeTeamMember(userId);
      toast.success({ description: "Team member removed successfully" });
      await fetchTeamMembers(); // Refresh list
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove team member";
      toast.error({ description: message });
    }
  };

  // Get role badge variant and icon
  const getRoleBadge = (role) => {
    const config = {
      admin: {
        variant: "default",
        icon: Shield,
        color: "bg-primary text-primary-foreground",
      },
      member: {
        variant: "secondary",
        icon: Users,
        color: "bg-secondary text-secondary-foreground",
      },
      viewer: {
        variant: "outline",
        icon: Users,
        color: "bg-muted text-muted-foreground",
      },
    };

    const { variant, icon: Icon, color } = config[role] || config.member;

    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  // Get status badge for admin team management
  const getStatusBadge = (status) => {
    const config = {
      active: {
        color: "bg-mantis/10 text-mantis border-mantis/20 hover:bg-mantis/10", // Use theme Mantis green
        text: "Active",
      },
      pending: {
        color: "bg-amazon/10 text-amazon border-amazon/20 hover:bg-amazon/10", // Use theme Amazon color
        text: "Pending",
      },
      suspended: {
        color:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10", // Use theme destructive
        text: "Suspended",
      },
    };

    const { color, text } = config[status] || config.active;

    return (
      <Badge variant="outline" className={`text-xs ${color}`}>
        {text}
      </Badge>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Team Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's team members and their permissions
          </p>
        </div>

        <AdminOnly>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Admins can manage team and settings, Members can edit
                    content, Viewers can only view
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? "Inviting..." : "Send Invite"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Success Modal */}
          <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Invitation Created Successfully
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  In a production environment, an email is sent to the user. For
                  this demo, please copy the link below to test the onboarding
                  flow.
                </p>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invite Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSuccessModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={handleOpenInNewTab} className="gap-2">
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </AdminOnly>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0 mb-6">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <AdminOnly>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </TabsTrigger>
          </AdminOnly>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
                <Badge variant="secondary" className="ml-2">
                  {teamMembers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : teamMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {member.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {member.email}
                            {(member._id === user?._id ||
                              member._id === user?.id) && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-primary hover:normal-case text-white"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-max">
                            {getRoleBadge(member.role)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-max">
                            {getStatusBadge(member.status || "active")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <AdminOnly>
                            <div className="flex items-center gap-2 justify-end">
                              <Select
                                value={member.role}
                                onValueChange={(newRole) =>
                                  handleRoleUpdate(member._id, newRole)
                                }
                                disabled={
                                  member._id === user?._id ||
                                  member._id === user?.id
                                }
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>

                              {member._id !== user?._id &&
                                member._id !== user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveMember(
                                        member._id,
                                        member.email
                                      )
                                    }
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          </AdminOnly>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <AdminOnly>
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                  <Badge variant="secondary" className="ml-2">
                    {auditLogs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96 overflow-hidden px-6">
                {logsLoading ? (
                  <div className="space-y-4 flex-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : auditLogs.length > 0 ? (
                  <ScrollArea className="h-full">
                    <div className="space-y-3 pr-4">
                      {auditLogs.map((log) => (
                        <div
                          key={log._id}
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-mantis/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-4 w-4 text-mantis" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-semibold text-mantis capitalize">
                                  {log.performer?.email?.split("@")[0] ||
                                    "Unknown"}
                                </span>
                                <span className="text-foreground ml-1">
                                  {log.displayText ||
                                    log.action.replace(/_/g, " ").toLowerCase()}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatActivityDate(
                                  log.timestamp || log.createdAt
                                )}
                              </div>
                            </div>
                            {log.target && (
                              <div
                                className="text-sm text-muted-foreground mt-1 truncate"
                                title={log.target}
                              >
                                <span className="font-medium">Target:</span>{" "}
                                {log.target}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No recent activity</p>
                    <p className="text-sm mt-2 max-w-md">
                      Team actions like document uploads, project changes, and
                      user management will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </AdminOnly>
      </Tabs>
    </div>
  );
};

export default TeamSettingsPage;
