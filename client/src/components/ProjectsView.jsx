import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import CardSkeleton from "./ui/CardSkeleton";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import { FolderOpen, Plus, Edit, Trash2, Filter, Search } from "lucide-react";
import { projectsApi } from "../lib/api";
import { NotViewer } from "./HasAccess";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/Select";

const ProjectsView = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "todo",
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    status: "todo",
  });

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "blocked", label: "Blocked" },
  ];

  const statusStyles = {
    "in-progress": "bg-amber-100 text-amber-700",
    todo: "bg-muted text-muted-foreground",
    done: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (filters = {}) => {
    const params = {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status && filters.status !== "all"
        ? { status: filters.status }
        : {}),
    };
    try {
      setLoading(true);
      const response = await projectsApi.getProjects(params);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = (statusValue = selectedStatus, term = searchTerm) =>
    loadProjects({ search: term.trim(), status: statusValue });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsApi.createProject(newProject);
      setNewProject({ title: "", description: "", status: "todo" });
      setShowCreateForm(false);
      refreshProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refreshProjects();
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    refreshProjects(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    loadProjects();
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation(); // Prevent card click
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setEditProject({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "todo",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!projectToEdit) return;
    try {
      setActionLoading(true);
      await projectsApi.updateProject(projectToEdit._id, editProject);
      await refreshProjects();
      setEditDialogOpen(false);
      setProjectToEdit(null);
    } catch (error) {
      console.error("Failed to update project:", error);
      alert(error?.response?.data?.message || "Failed to update project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setActionLoading(true);
      const response = await projectsApi.deleteProject(projectToDelete._id);
      const data = response.data;

      // Show success message with details
      if (data.documentsDeleted > 0) {
        alert(
          `Project "${data.projectTitle}" deleted successfully along with ${data.documentsDeleted} associated document(s).`
        );
      } else {
        alert(`Project "${data.projectTitle}" deleted successfully.`);
      }

      await loadProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header Section Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="space-y-2">
            <div className="h-7 sm:h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 sm:h-5 w-64 sm:w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-full sm:w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Projects Grid Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="h-6 sm:h-7 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton
                key={i}
                headerHeight="h-6"
                contentRows={4}
                className="min-h-[200px]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organize your documents and AI interactions by project
          </p>
        </div>
        <NotViewer>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </NotViewer>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filter Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="project-search" className="text-sm">
                Search by name
              </Label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="project-search"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </form>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="project-status" className="text-sm">
                Filter by status
              </Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="space-y-2 flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full text-sm sm:text-base"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
            Showing {projects.length} project{projects.length === 1 ? "" : "s"}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedStatus !== "all" && ` with status ${selectedStatus}`}
          </div>
        </CardContent>
      </Card>

      {/* Create Project Form */}
      {showCreateForm && (
        <Card className="shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              Create New Project
            </CardTitle>
            <CardDescription className="text-sm">
              Set up a new project to organize your documents and conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter project title..."
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your project..."
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) =>
                    setNewProject((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 sm:gap-0 pt-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Create Project
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Your Projects ({projects.length})
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Click on a project to view details
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                onClick={() => handleProjectClick(project._id)}
              >
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base sm:text-lg font-semibold truncate">
                        {project.title}
                      </CardTitle>
                    </div>
                    <NotViewer>
                      <div
                        className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={(e) => handleEditClick(e, project)}
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteClick(e, project)}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </NotViewer>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                    {project.description || "No description provided"}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium w-fit ${
                        statusStyles[project.status] ||
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4 sm:px-6">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-full mb-4 sm:mb-6">
              <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
              No projects yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
              Create your first project to start organizing your documents and
              AI conversations. Projects help you keep everything organized and
              easily accessible.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update the project details.
            </p>
          </DialogHeader>

          <div className="space-y-3 px-1 sm:px-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={editProject.title}
                onChange={(e) =>
                  setEditProject((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Project title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Input
                value={editProject.description}
                onChange={(e) =>
                  setEditProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={editProject.status}
                onValueChange={(value) =>
                  setEditProject((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Are you sure you want to delete "{projectToDelete?.title}"? This
              action cannot be undone and will also delete all associated
              documents.
            </p>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsView;
