import axios from "axios";

// Resolve API base URL from environment variables and ensure it includes '/api'
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_SERVER_BASE_URL ||
  "";
const API_BASE_URL = RAW_API_BASE
  ? RAW_API_BASE.replace(/\/$/, "").endsWith("/api")
    ? RAW_API_BASE.replace(/\/$/, "")
    : RAW_API_BASE.replace(/\/$/, "") + "/api"
  : "/api";

// Optional explicit server base (without '/api') for cases where you need it
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "";

// Create Axios instance with credentials support for HttpOnly cookies
const api = axios.create({
  baseURL: API_BASE_URL, // Absolute URL (e.g. https://api.example.com/api) or relative '/api'
  withCredentials: true, // Essential for HttpOnly cookie authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Helpful debug: show resolved API base URL in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("Resolved API_BASE_URL:", API_BASE_URL);
}

// Request interceptor to add CSRF token to state-changing requests
api.interceptors.request.use(async (config) => {
  // Skip CSRF token for GET requests and auth endpoints
  if (
    config.method === "get" ||
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/logout") ||
    config.url?.includes("/auth/accept-invite")
  ) {
    return config;
  }

  try {
    // Fetch CSRF token if needed
    const csrfUrl = API_BASE_URL.startsWith("http")
      ? `${API_BASE_URL}/csrf-token`
      : `${SERVER_BASE_URL}/api/csrf-token`;

    const csrfResponse = await axios.get(csrfUrl, {
      withCredentials: true,
    });

    config.headers["X-CSRF-Token"] = csrfResponse.data.csrfToken;
  } catch (error) {
    console.warn("Failed to fetch CSRF token:", error);
  }

  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the auth store and components handle 401 errors appropriately
    // Don't auto-redirect as it can cause infinite loops
    return Promise.reject(error);
  }
);

// Auth API methods
export const authApi = {
  checkAuth: () => api.get("/auth/me"),
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  acceptInvite: (data) => api.post("/auth/accept-invite", data),
};

// Projects API methods
export const projectsApi = {
  getProjects: () => api.get("/projects"),
  createProject: (projectData) => api.post("/projects", projectData),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Documents API methods
export const documentsApi = {
  uploadDocument: (formData) =>
    api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getDocuments: (projectId, additionalParams = {}) => {
    const params = {
      ...(projectId && { projectId }),
      ...additionalParams,
    };
    return api.get("/documents", { params });
  },
  getDocumentById: (id) => api.get(`/documents/${id}`),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
};

// Chat API method using native fetch for SSE streaming
export const chatApi = {
  sendMessage: async (message, conversationId, onChunk, projectId = null) => {
    // First get CSRF token
    const csrfUrl = API_BASE_URL.startsWith("http")
      ? `${API_BASE_URL}/csrf-token`
      : "/api/csrf-token";

    const csrfResponse = await fetch(csrfUrl, {
      credentials: "include",
    });
    const { csrfToken } = await csrfResponse.json();

    const chatUrl = API_BASE_URL.startsWith("http")
      ? `${API_BASE_URL}/chat`
      : "/api/chat";

    const response = await fetch(chatUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        message,
        ...(conversationId && { conversationId }),
        ...(projectId && { projectId }),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let newConversationId = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Return the new conversation ID if one was created
              return { newConversationId };
            }

            try {
              const parsed = JSON.parse(data);

              // Handle different message types
              if (parsed.type === "conversation_id") {
                newConversationId = parsed.conversationId;
              } else if (parsed.type === "content") {
                onChunk(parsed);
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              } else if (parsed.content) {
                // Backward compatibility for old format
                onChunk(parsed);
              }
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Chat history management
  getHistory: () => api.get("/chat/history"),
  getProjectHistory: (projectId) =>
    api.get(`/chat/history/project/${projectId}`),
  getConversation: (id) => api.get(`/chat/${id}`),
  deleteConversation: (id) => api.delete(`/chat/${id}`),
};

// Analytics API
export const analyticsApi = {
  getAnalytics: () => api.get("/analytics"),
};

// Organization/Team API
export const organizationApi = {
  inviteUser: (data) => api.post("/org/invite", data),
  getTeamMembers: () => api.get("/org/team"),
  updateUserRole: (userId, data) => api.put(`/org/team/${userId}/role`, data),
  removeTeamMember: (userId) => api.delete(`/org/team/${userId}`),
  getAuditLogs: (params = {}) => api.get("/org/logs", { params }),
};

export default api;
