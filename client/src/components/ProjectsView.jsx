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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/AlertDialog";
import { FolderOpen, Plus, Edit, Trash2 } from "lucide-react";
import { projectsApi } from "../lib/api";
import { NotViewer } from "./HasAccess";

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

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsApi.createProject(newProject);
      setNewProject({ title: "", description: "", status: "todo" });
      setShowCreateForm(false);
      loadProjects();
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

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation(); // Prevent card click
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
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
      <div className="p-6 space-y-6">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-5 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Projects Grid Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-muted-foreground">
            Organize your documents and AI interactions by project
          </p>
        </div>
        <NotViewer>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </NotViewer>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create New Project</CardTitle>
            <CardDescription>
              Set up a new project to organize your documents and conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <Button type="submit">Create Project</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Your Projects ({projects.length})
            </h2>
            <div className="text-sm text-muted-foreground">
              Click on a project to view details
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                onClick={() => handleProjectClick(project._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold truncate">
                        {project.title}
                      </CardTitle>
                    </div>
                    <NotViewer>
                      <div
                        className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteClick(e, project)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </NotViewer>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {project.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "active"
                          ? "bg-primary/20 text-primary"
                          : project.status === "completed"
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-6">
              <FolderOpen className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first project to start organizing your documents and
              AI conversations. Projects help you keep everything organized and
              easily accessible.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title}"? This
              action cannot be undone and will also delete all associated
              documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsView;
