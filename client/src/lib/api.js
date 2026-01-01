import axios from "axios";

// Create Axios instance with credentials support for HttpOnly cookies
const api = axios.create({
  baseURL: "/api", // Use relative path - Vite proxy will forward to localhost:5000/api
  withCredentials: true, // Essential for HttpOnly cookie authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add CSRF token to state-changing requests
api.interceptors.request.use(async (config) => {
  // Skip CSRF token for GET requests and auth endpoints
  if (
    config.method === "get" ||
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/logout")
  ) {
    return config;
  }

  try {
    // Fetch CSRF token if needed
    const csrfResponse = await axios.get(
      "http://localhost:5000/api/csrf-token",
      {
        withCredentials: true,
      }
    );

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
};

// Chat API method using native fetch for SSE streaming
export const chatApi = {
  sendMessage: async (message, onChunk) => {
    // First get CSRF token
    const csrfResponse = await fetch("/api/csrf-token", {
      credentials: "include",
    });
    const { csrfToken } = await csrfResponse.json();

    const response = await fetch("/api/chat", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
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
};

export default api;
