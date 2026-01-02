import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { Upload, FileText, Check, AlertCircle, Loader2, X } from "lucide-react";
import { documentsApi, projectsApi } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

const UploadModal = ({
  isOpen,
  onClose,
  preselectedProjectId = null,
  onUploadComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    preselectedProjectId || ""
  );
  const [loadingProjects, setLoadingProjects] = useState(false);
  const fileInputRef = useRef(null);

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      setSelectedProject(preselectedProjectId || "");
      setFiles([]);
    }
  }, [isOpen, preselectedProjectId]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data);
      if (!preselectedProjectId && response.data.length > 0) {
        setSelectedProject(response.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf");

    const fileObjects = pdfFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
      error: null,
    }));

    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append("file", fileObj.file);
    if (selectedProject) {
      formData.append("projectId", selectedProject);
    }

    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "uploading", progress: 50 } : f
        )
      );

      const response = await documentsApi.uploadDocument(formData);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                status: "success",
                progress: 100,
                docId: response.data.docId,
              }
            : f
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error.response?.data?.message || "Upload failed",
              }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    if (!selectedProject) {
      alert("Please select a project first");
      return;
    }

    setUploading(true);
    const pendingFiles = files.filter((f) => f.status === "pending");
    await Promise.all(pendingFiles.map(uploadFile));
    setUploading(false);

    // Call callback to refresh parent component
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClose = () => {
    setFiles([]);
    setSelectedProject(preselectedProjectId || "");
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "uploading":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Upload Documents</h2>
            <p className="text-sm text-muted-foreground">
              Upload PDF documents to add them to your knowledge base
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-auto">
          {/* Project Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Project</Label>
            {loadingProjects ? (
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading projects...</span>
              </div>
            ) : (
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={!!preselectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {preselectedProjectId && (
              <p className="text-xs text-muted-foreground">
                Documents will be uploaded to the selected project
              </p>
            )}
          </div>

          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="font-medium">
                Drop PDF files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF files up to 10MB each
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Files ({files.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                          {file.error && (
                            <span className="text-red-500 ml-2">
                              • {file.error}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {file.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && `${files.length} file(s) selected`}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadAll}
              disabled={uploading || files.length === 0 || !selectedProject}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} File(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
