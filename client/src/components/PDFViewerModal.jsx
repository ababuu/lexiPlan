import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/Button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";
import { documentsApi } from "../lib/api";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewerModal = ({ isOpen, onClose, documentId, documentName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  // Load PDF data when modal opens
  useEffect(() => {
    if (isOpen && documentId) {
      loadPdfData();
    } else {
      // Reset when modal closes
      setPdfData(null);
      setNumPages(null);
      setPageNumber(1);
      setScale(1.0);
      setLoading(true);
      setError(null);
    }
  }, [isOpen, documentId]);

  const loadPdfData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await documentsApi.getPdfDocument(documentId);

      // Create a Blob from the ArrayBuffer
      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfData(blob);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Failed to load PDF document");
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF document");
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-muted/30">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {documentName}
            </h2>
            {numPages && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Page {pageNumber} of {numPages}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          {loading && !error && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading PDF...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
              </div>
              <p className="text-sm sm:text-base text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}

          {pdfData && (
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error=""
              className="flex items-center justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              />
            </Document>
          )}
        </div>

        {/* Controls */}
        {!error && numPages && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-t bg-muted/30 gap-2">
            {/* Navigation Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className="h-8 sm:h-9"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className="h-8 sm:h-9"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 3.0}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewerModal;
