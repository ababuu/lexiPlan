import React, { useState, useEffect } from "react";
import {
  Upload,
  Search,
  FileText,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
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
import TableSkeleton from "../components/ui/TableSkeleton";
import UploadModal from "../components/UploadModal";
import PDFViewerModal from "../components/PDFViewerModal";
import { documentsApi, projectsApi } from "../lib/api";
import useDocumentStore from "../store/useDocumentStore";
import { useToast, showToast } from "../hooks/useToast";
import { NotViewer } from "../components/HasAccess";

const DocumentsPage = () => {
  const { toast } = useToast();
  const {
    // Document state
    documents,
    loading,
    error,

    // Pagination state
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,

    // Filter state
    searchTerm,
    selectedProject,

    // Actions
    loadDocuments,
    nextPage,
    previousPage,
    deleteDocument: storeDeleteDocument,
    updateDocument: storeUpdateDocument,
    setSearchTerm,
    setSelectedProject,
    applyFilters,
    clearFilters,
  } = useDocumentStore();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // PDF Viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Document action states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      showToast.error("Error", "Failed to load projects");
    } finally {
      setProjectsLoading(false);
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

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project?.title || "Unknown Project";
  };

  // Filter handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value === "all" ? "" : value);
    applyFilters({ selectedProject: value === "all" ? "" : value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ searchTerm });
  };

  const handleUploadComplete = async () => {
    await loadDocuments(); // Refresh document list
    setUploadModalOpen(false);
    showToast.success("Success", "Document uploaded successfully");
  };

  // PDF Viewer handlers
  const handleOpenPdf = (document) => {
    setSelectedDocument(document);
    setPdfViewerOpen(true);
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
      await storeUpdateDocument(documentToRename._id, {
        filename: newFileName.trim(),
      });
      setRenameDialogOpen(false);
      setDocumentToRename(null);
      setNewFileName("");
      showToast.success("Success", "Document renamed successfully");
    } catch (error) {
      console.error("Error renaming document:", error);
      showToast.error("Error", "Failed to rename document. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">All Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organization-wide document library
          </p>
        </div>
        <NotViewer>
          <Button
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </NotViewer>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">
                Search by name
              </Label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </form>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label htmlFor="project" className="text-sm">
                Filter by project
              </Label>
              <Select
                value={selectedProject || "all"}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading projects...
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))
                  )}
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
            Showing {documents.length} of {totalCount} documents
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedProject && ` in ${getProjectName(selectedProject)}`}
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      {loading ? (
        <TableSkeleton
          rows={10}
          columns={6}
          headerTitles={[
            "File Name",
            "Project",
            "Status",
            "Size",
            "Uploaded",
            "Actions",
          ]}
        />
      ) : (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Document Library
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {documents.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  {totalCount === 0
                    ? "No documents yet"
                    : "No documents match your filters"}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                  {totalCount === 0
                    ? "Upload your first document to get started"
                    : "Try adjusting your search terms or clearing the filters"}
                </p>
                {totalCount === 0 ? (
                  <NotViewer>
                    <Button
                      onClick={() => setUploadModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </NotViewer>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                )}
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
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                          Project
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                          Size
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm hidden xl:table-cell">
                          Uploaded
                        </TableHead>
                        <TableHead className="w-[50px] text-xs sm:text-sm">
                          Actions
                        </TableHead>
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
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                            <span className="truncate block max-w-[150px]">
                              {document.projectId?.title || "Unknown Project"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(document.vectorized)}
                              <span className="text-xs sm:text-sm">
                                {getStatusText(document.vectorized)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                            {formatFileSize(document.size)}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-muted-foreground hidden xl:table-cell">
                            {new Date(document.createdAt).toLocaleDateString()}
                          </TableCell>
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
                                  onClick={() => handleOpenPdf(document)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRenameClick(document)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <NotViewer>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(document)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </NotViewer>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Page {currentPage} of {totalPages} ({totalCount} total
                      documents)
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
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

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

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        documentId={selectedDocument?._id}
        documentName={selectedDocument?.filename}
      />
    </div>
  );
};

export default DocumentsPage;
