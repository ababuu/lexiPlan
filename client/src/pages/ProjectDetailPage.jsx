import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  Plus,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/AlertDialog";
import { Input } from "../components/ui/Input";
import TableSkeleton from "../components/ui/TableSkeleton";
import { Skeleton } from "../components/ui/Skeleton";
import { documentsApi, projectsApi } from "../lib/api";
import UploadModal from "../components/UploadModal";
import ProjectChatWidget from "../components/ProjectChatWidget";
import useDocumentStore from "../store/useDocumentStore";
import { useToast, showToast } from "../hooks/useToast";
import { NotViewer } from "../components/HasAccess";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Project state
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);

  // Document store for this specific project
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    loadDocuments,
    nextPage,
    previousPage,
    deleteDocument: storeDeleteDocument,
  } = useDocumentStore();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Document action states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProjectData();
    // Load documents for this specific project
    loadDocuments({ projectId, page: 1 });
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setProjectLoading(true);
      const response = await projectsApi.getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to load project:", error);
      showToast.error("Error", "Failed to load project details");
    } finally {
      setProjectLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getStatusIcon = (vectorized) => {
    if (vectorized === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (vectorized === false) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (vectorized) => {
    if (vectorized === true) return "Ready";
    if (vectorized === false) return "Processing";
    return "Error";
  };

  const handleUploadComplete = async () => {
    // Refresh documents for this project
    await loadDocuments({ projectId });
    setIsUploadModalOpen(false);
    showToast.success("Success", "Document uploaded successfully");
  };

  // Document action handlers
  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      setActionLoading(true);
      await storeDeleteDocument(documentToDelete._id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      showToast.success(
        "Success",
        `Document "${documentToDelete.filename}" deleted successfully`
      );
      // Refresh documents after deletion
      await loadDocuments({ projectId });
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast.error("Error", "Failed to delete document. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameClick = (document) => {
    setDocumentToRename(document);
    setNewFileName(document.filename);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!documentToRename || !newFileName.trim()) return;

    try {
      setActionLoading(true);
      await documentsApi.updateDocument(documentToRename._id, {
        filename: newFileName.trim(),
      });
      setRenameDialogOpen(false);
      setDocumentToRename(null);
      setNewFileName("");
      showToast.success("Success", "Document renamed successfully");
      // Refresh documents after rename
      await loadDocuments({ projectId });
    } catch (error) {
      console.error("Error renaming document:", error);
      showToast.error("Error", "Failed to rename document. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading state for project details
  if (projectLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24 sm:w-32" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="space-y-2">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-4 w-64 sm:w-96" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        <TableSkeleton
          rows={3}
          columns={4}
          headerTitles={["Document", "Status", "Size", "Date"]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm sm:text-base font-medium text-primary cursor-pointer hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Projects</span>
          <span className="sm:hidden">Back</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {project?.title || "Project Documents"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
            {project?.description ||
              `Managing documents for project ${projectId}`}
          </p>
        </div>
        <NotViewer>
          <Button
            className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </NotViewer>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Documents in this Project
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {documentsLoading ? (
            <div className="p-2 sm:p-4">
              <TableSkeleton
                rows={5}
                columns={4}
                headerTitles={["File Name", "Status", "Size", "Uploaded"]}
              />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">
                No documents yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                Upload your first document to get started with this project
              </p>
              <NotViewer>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </NotViewer>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">
                        File Name
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                        Size
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                        Uploaded
                      </TableHead>
                      <NotViewer>
                        <TableHead className="w-[50px] text-xs sm:text-sm">
                          Actions
                        </TableHead>
                      </NotViewer>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => (
                      <TableRow key={document._id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {document.filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(document.vectorized)}
                            <span className="text-xs sm:text-sm">
                              {getStatusText(document.vectorized)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          {formatFileSize(document.size)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </TableCell>
                        <NotViewer>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRenameClick(document)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(document)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </NotViewer>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for project documents */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Page {currentPage} of {totalPages} ({totalCount} documents)
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                      className="text-xs sm:text-sm"
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        preselectedProjectId={projectId}
      />

      {/* Project Chat Widget */}
      <ProjectChatWidget />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.filename}"?
              This action cannot be undone and will remove all associated vector
              data.
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

      {/* Rename Dialog */}
      <AlertDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Document</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for "{documentToRename?.filename}":
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new filename..."
              className="w-full"
              disabled={actionLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRenameDialogOpen(false);
                setNewFileName("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameConfirm}
              disabled={actionLoading || !newFileName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {actionLoading ? "Renaming..." : "Rename"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailPage;
