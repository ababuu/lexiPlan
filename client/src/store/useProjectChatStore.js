import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { chatApi } from "../lib/api";

const useProjectChatStore = create(
  persist(
    (set, get) => ({
      // Project-specific chat state
      projectMessages: {}, // { projectId: [...messages] }
      projectConversations: {}, // { projectId: [...conversations] }
      activeProjectConversations: {}, // { projectId: conversationId }
      isLoading: false,
      streamingMessage: "",
      isLoadingHistory: false,

      // Actions
      setIsLoading: (isLoading) => set({ isLoading }),
      setStreamingMessage: (streamingMessage) => set({ streamingMessage }),

      // Get messages for specific project
      getProjectMessages: (projectId) => {
        const { projectMessages } = get();
        return projectMessages[projectId] || [];
      },

      // Set messages for specific project
      setProjectMessages: (projectId, messages) =>
        set((state) => ({
          projectMessages: {
            ...state.projectMessages,
            [projectId]: messages,
          },
        })),

      // Add message to specific project
      addProjectMessage: (projectId, message) =>
        set((state) => ({
          projectMessages: {
            ...state.projectMessages,
            [projectId]: [...(state.projectMessages[projectId] || []), message],
          },
        })),

      // Clear chat for specific project
      clearProjectChat: (projectId) =>
        set((state) => ({
          projectMessages: {
            ...state.projectMessages,
            [projectId]: [],
          },
          activeProjectConversations: {
            ...state.activeProjectConversations,
            [projectId]: null,
          },
          streamingMessage: "",
        })),

      // Send message for specific project
      sendProjectMessage: async (content, projectId) => {
        const { projectMessages, activeProjectConversations } = get();
        const currentMessages = projectMessages[projectId] || [];
        const activeConversationId = activeProjectConversations[projectId];

        const userMessage = {
          id: Date.now(),
          role: "user",
          content,
          timestamp: new Date(),
        };

        // Add user message immediately
        set((state) => ({
          projectMessages: {
            ...state.projectMessages,
            [projectId]: [...currentMessages, userMessage],
          },
          isLoading: true,
          streamingMessage: "",
        }));

        const assistantMessageId = Date.now() + 1;
        let fullResponse = "";

        try {
          const result = await chatApi.sendMessage(
            content,
            activeConversationId,
            (chunk) => {
              if (chunk.content) {
                fullResponse += chunk.content;
                set({ streamingMessage: fullResponse });
              }
            },
            projectId // Pass projectId to mark as project-specific
          );

          // If we got a new conversation ID, set it as active for this project
          if (result?.newConversationId && !activeConversationId) {
            set((state) => ({
              activeProjectConversations: {
                ...state.activeProjectConversations,
                [projectId]: result.newConversationId,
              },
            }));
          }

          // Add complete assistant message
          const assistantMessage = {
            id: assistantMessageId,
            role: "assistant",
            content: fullResponse,
            timestamp: new Date(),
          };

          set((state) => ({
            projectMessages: {
              ...state.projectMessages,
              [projectId]: [
                ...(state.projectMessages[projectId] || []),
                assistantMessage,
              ],
            },
            isLoading: false,
            streamingMessage: "",
          }));

          // Refresh project history
          if (result?.newConversationId) {
            get().fetchProjectHistory(projectId);
          }
        } catch (error) {
          console.error("Project chat error:", error);

          const errorMessage = {
            id: assistantMessageId,
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
            isError: true,
          };

          set((state) => ({
            projectMessages: {
              ...state.projectMessages,
              [projectId]: [
                ...(state.projectMessages[projectId] || []),
                errorMessage,
              ],
            },
            isLoading: false,
            streamingMessage: "",
          }));
        }
      },

      // Fetch conversation history for specific project
      fetchProjectHistory: async (projectId) => {
        try {
          set({ isLoadingHistory: true });
          const response = await chatApi.getProjectHistory(projectId);

          set((state) => ({
            projectConversations: {
              ...state.projectConversations,
              [projectId]: response.data.conversations || [],
            },
            isLoadingHistory: false,
          }));
        } catch (error) {
          console.error("Error fetching project history:", error);
          set({ isLoadingHistory: false });
        }
      },

      // Load specific project conversation
      loadProjectConversation: async (projectId, conversationId) => {
        try {
          set({ isLoading: true });
          const response = await chatApi.getConversation(conversationId);
          const conversation = response.data.conversation;

          // Convert conversation messages to chat format
          const chatMessages = conversation.messages.map((msg, index) => ({
            id: `${conversationId}-${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));

          set((state) => ({
            projectMessages: {
              ...state.projectMessages,
              [projectId]: chatMessages,
            },
            activeProjectConversations: {
              ...state.activeProjectConversations,
              [projectId]: conversationId,
            },
            isLoading: false,
            streamingMessage: "",
          }));
        } catch (error) {
          console.error("Error loading project conversation:", error);
          set({ isLoading: false });
        }
      },

      // Start new chat for specific project
      startNewProjectChat: (projectId) =>
        set((state) => ({
          projectMessages: {
            ...state.projectMessages,
            [projectId]: [],
          },
          activeProjectConversations: {
            ...state.activeProjectConversations,
            [projectId]: null,
          },
          streamingMessage: "",
        })),
    }),
    {
      name: "project-chat-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist the essential data, not loading states
      partialize: (state) => ({
        projectMessages: state.projectMessages,
        projectConversations: state.projectConversations,
        activeProjectConversations: state.activeProjectConversations,
      }),
    }
  )
);

export default useProjectChatStore;
