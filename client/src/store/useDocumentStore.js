import { create } from "zustand";
import { documentsApi } from "../lib/api";

const useDocumentStore = create((set, get) => ({
  // State
  documents: [],
  loading: false,
  error: null,

  // Pagination state
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  limit: 10,
  hasNextPage: false,
  hasPreviousPage: false,

  // Filters
  searchTerm: "",
  selectedProject: "",

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDocuments: (documents) => set({ documents }),

  // Pagination actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalCount: (totalCount) => set({ totalCount }),

  // Filter actions
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),

  // Load documents with pagination
  loadDocuments: async (options = {}) => {
    const state = get();
    const {
      page = state.currentPage,
      limit = state.limit,
      projectId = null,
      search = state.searchTerm,
    } = options;

    try {
      set({ loading: true, error: null });

      const params = {
        page,
        limit,
        ...(projectId && { projectId }),
        ...(search && { search }),
      };

      const response = await documentsApi.getDocuments(null, params);

      // Handle the API response structure - check for nested data
      let documents, pagination;

      if (response.data.data) {
        // New API structure: { success: true, data: { documents: [...], pagination: {...} } }
        documents = response.data.data.documents;
        pagination = response.data.data.pagination;
      } else if (response.data.documents) {
        // Fallback structure: { documents: [...], pagination: {...} }
        documents = response.data.documents;
        pagination = response.data.pagination;
      } else {
        // Legacy structure
        documents = response.data || [];
        pagination = {};
      }

      set({
        documents: documents || [],
        currentPage: pagination?.currentPage || page,
        totalPages: pagination?.totalPages || 1,
        totalCount: pagination?.totalCount || documents?.length || 0,
        hasNextPage: pagination?.hasNextPage || false,
        hasPreviousPage: pagination?.hasPreviousPage || false,
        loading: false,
      });

      return response;
    } catch (error) {
      console.error("Failed to load documents:", error);
      set({
        error: error.message || "Failed to load documents",
        loading: false,
      });
      throw error;
    }
  },

  // Navigate to next page
  nextPage: async () => {
    const { currentPage, hasNextPage, loadDocuments } = get();
    if (hasNextPage) {
      await loadDocuments({ page: currentPage + 1 });
    }
  },

  // Navigate to previous page
  previousPage: async () => {
    const { currentPage, hasPreviousPage, loadDocuments } = get();
    if (hasPreviousPage && currentPage > 1) {
      await loadDocuments({ page: currentPage - 1 });
    }
  },

  // Go to specific page
  goToPage: async (page) => {
    const { totalPages, loadDocuments } = get();
    if (page >= 1 && page <= totalPages) {
      await loadDocuments({ page });
    }
  },

  // Delete document and refresh current page
  deleteDocument: async (documentId) => {
    try {
      await documentsApi.deleteDocument(documentId);

      // Reload current page
      const { loadDocuments, currentPage } = get();
      await loadDocuments({ page: currentPage });

      return true;
    } catch (error) {
      console.error("Failed to delete document:", error);
      set({ error: error.message || "Failed to delete document" });
      throw error;
    }
  },

  // Update document and refresh
  updateDocument: async (documentId, updates) => {
    try {
      await documentsApi.updateDocument(documentId, updates);

      // Reload current page
      const { loadDocuments, currentPage } = get();
      await loadDocuments({ page: currentPage });

      return true;
    } catch (error) {
      console.error("Failed to update document:", error);
      set({ error: error.message || "Failed to update document" });
      throw error;
    }
  },

  // Clear all filters and reset to page 1
  clearFilters: async () => {
    set({
      searchTerm: "",
      selectedProject: "",
      currentPage: 1,
    });

    const { loadDocuments } = get();
    await loadDocuments({ page: 1, search: "" });
  },

  // Apply filters and reset to page 1
  applyFilters: async (filters = {}) => {
    const { searchTerm, selectedProject } = filters;

    set({
      ...(searchTerm !== undefined && { searchTerm }),
      ...(selectedProject !== undefined && { selectedProject }),
      currentPage: 1,
    });

    const state = get();
    await state.loadDocuments({
      page: 1,
      search: state.searchTerm,
      projectId: state.selectedProject || null,
    });
  },

  // Reset store to initial state
  reset: () =>
    set({
      documents: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      searchTerm: "",
      selectedProject: "",
    }),
}));

export default useDocumentStore;
