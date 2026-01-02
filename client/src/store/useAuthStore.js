import { create } from "zustand";
import { authApi } from "../lib/api";
import useChatStore from "./useChatStore";

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  orgName: null,
  isAuthenticated: false,
  isInitializing: true,
  error: null,

  // Actions
  checkAuth: async () => {
    try {
      set({ isInitializing: true, error: null });

      const response = await authApi.checkAuth();
      const userData = response.data.user;

      set({
        user: userData,
        orgName: userData.orgName,
        isAuthenticated: true,
        isInitializing: false,
        error: null,
      });

      return userData;
    } catch (error) {
      console.log("Auth check failed:", error.response?.status);
      set({
        user: null,
        orgName: null,
        isAuthenticated: false,
        isInitializing: false,
        error: error.response?.status === 401 ? null : error.message,
      });
      return null;
    }
  },

  login: async (credentials) => {
    try {
      set({ error: null });

      const response = await authApi.login(credentials);
      const userData = response.data.user;

      // Check if this is a different organization from previous session
      const currentOrgName = get().orgName;
      const newOrgName = userData.orgName;

      set({
        user: userData,
        orgName: userData.orgName,
        isAuthenticated: true,
        error: null,
      });

      // Clear chat data if switching to different org
      if (currentOrgName && currentOrgName !== newOrgName) {
        const { clearChat, setConversations } = useChatStore.getState();
        clearChat();
        setConversations([]);
      }

      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    try {
      set({ error: null });

      const response = await authApi.register(userData);
      const user = response.data.user;

      set({
        user,
        orgName: user.orgName,
        isAuthenticated: true,
        error: null,
      });

      return user;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local state
      set({
        user: null,
        orgName: null,
        isAuthenticated: false,
        error: null,
      });

      // Clear chat store state to prevent cross-user data leakage
      const { clearChat, setConversations } = useChatStore.getState();
      clearChat();
      setConversations([]);
    }
  },

  clearError: () => set({ error: null }),

  // Computed getters
  getUser: () => get().user,
  getOrgName: () => get().orgName,
  isLoggedIn: () => get().isAuthenticated,
}));

export default useAuthStore;
