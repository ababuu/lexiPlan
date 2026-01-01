import React, { useState, useRef } from "react";
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
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { documentsApi, projectsApi } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

const UploadZone = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const fileInputRef = useRef(null);

  // Load projects on component mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data);
      if (response.data.length > 0) {
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
      status: "pending", // pending, uploading, success, error
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

    // Upload files in parallel
    await Promise.all(pendingFiles.map(uploadFile));

    setUploading(false);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "success"));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
        <p className="text-muted-foreground">
          Upload PDF documents to add them to your knowledge base for AI
          analysis.
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Project</CardTitle>
          <CardDescription>
            Choose which project to associate these documents with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProjects ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
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
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Files to Upload</CardTitle>
              <CardDescription>
                {files.filter((f) => f.status === "pending").length} pending,{" "}
                {files.filter((f) => f.status === "success").length} completed
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                disabled={
                  files.filter((f) => f.status === "success").length === 0
                }
              >
                Clear Completed
              </Button>
              <Button
                onClick={handleUploadAll}
                disabled={
                  uploading ||
                  !selectedProject ||
                  files.filter((f) => f.status === "pending").length === 0
                }
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload All"
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {files.map((fileObj) => (
                  <motion.div
                    key={fileObj.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileObj.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileObj.size)}
                      </p>

                      {fileObj.status === "uploading" && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${fileObj.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {fileObj.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileObj.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {fileObj.status === "success" && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      {fileObj.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {fileObj.status === "uploading" && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileObj.id)}
                        disabled={fileObj.status === "uploading"}
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadZone;
