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
import TableSkeleton from "../components/ui/TableSkeleton";
import { Skeleton } from "../components/ui/Skeleton";
import { documentsApi, projectsApi } from "../lib/api";
import UploadModal from "../components/UploadModal";
import ProjectChatWidget from "../components/ProjectChatWidget";
import useDocumentStore from "../store/useDocumentStore";
import { useToast, showToast } from "../hooks/useToast";

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

  // Show loading state for project details
  if (projectLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableSkeleton
              rows={5}
              columns={4}
              headerTitles={["Document", "Status", "Size", "Date"]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-md font-medium text-primary cursor-pointer hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {project?.title || "Project Documents"}
          </h1>
          <p className="text-muted-foreground">
            {project?.description ||
              `Managing documents for project ${projectId}`}
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents in this Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="p-4">
              <TableSkeleton
                rows={5}
                columns={4}
                headerTitles={["File Name", "Status", "Size", "Uploaded"]}
              />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started with this project
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {document.filename}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(document.vectorized)}
                          <span className="text-sm">
                            {getStatusText(document.vectorized)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(document.size)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination for project documents */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({totalCount} documents)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
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
    </div>
  );
};

export default ProjectDetailPage;
