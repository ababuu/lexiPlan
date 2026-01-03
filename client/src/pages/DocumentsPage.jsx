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
import UploadModal from "../components/UploadModal";
import { documentsApi, projectsApi } from "../lib/api";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedProject]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsApi.getDocuments(); // Get all documents
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by project
    if (selectedProject && selectedProject !== "all") {
      filtered = filtered.filter((doc) => doc.projectId === selectedProject);
    }

    setFilteredDocuments(filtered);
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProject("");
  };

  const handleUploadComplete = () => {
    loadDocuments(); // Refresh document list
    setUploadModalOpen(false);
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
      await documentsApi.deleteDocument(documentToDelete._id);
      await loadDocuments(); // Refresh the list
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
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
      await loadDocuments(); // Refresh the list
      setRenameDialogOpen(false);
      setDocumentToRename(null);
      setNewFileName("");
    } catch (error) {
      console.error("Failed to rename document:", error);
      alert("Failed to rename document");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Documents</h1>
          <p className="text-muted-foreground">
            Organization-wide document library
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">Search by name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label htmlFor="project">Filter by project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
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
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredDocuments.length} of {documents.length} documents
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedProject &&
              selectedProject !== "all" &&
              ` in ${getProjectName(selectedProject)}`}
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Loading documents...
                </p>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {documents.length === 0
                  ? "No documents yet"
                  : "No documents match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {documents.length === 0
                  ? "Upload your first document to get started"
                  : "Try adjusting your search terms or clearing the filters"}
              </p>
              {documents.length === 0 ? (
                <Button onClick={() => setUploadModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {document.filename}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getProjectName(document.projectId)}
                      </span>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default DocumentsPage;
