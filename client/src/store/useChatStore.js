import { create } from "zustand";
import { chatApi } from "../lib/api";

const useChatStore = create((set, get) => ({
  // Chat state
  messages: [],
  isLoading: false,
  streamingMessage: "",

  // Conversation state
  conversations: [],
  activeConversationId: null,
  isLoadingHistory: false,

  // Actions
  setMessages: (messages) => set({ messages }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setStreamingMessage: (streamingMessage) => set({ streamingMessage }),
  setConversations: (conversations) => set({ conversations }),

  // Add message to current conversation
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // Clear current chat
  clearChat: () =>
    set({
      messages: [],
      streamingMessage: "",
      activeConversationId: null,
    }),

  // Send message with optional conversation context and project context
  sendMessage: async (content, conversationId = null, projectId = null) => {
    const { messages, activeConversationId } = get();
    const finalConversationId = conversationId || activeConversationId;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add user message immediately
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      streamingMessage: "",
    }));

    const assistantMessageId = Date.now() + 1;
    let fullResponse = "";

    try {
      const result = await chatApi.sendMessage(
        content,
        finalConversationId,
        (chunk) => {
          if (chunk.content) {
            fullResponse += chunk.content;
            set({ streamingMessage: fullResponse });
          }
        },
        projectId, // Pass projectId to the API
      );

      // If we got a new conversation ID, set it as active
      if (result?.newConversationId && !finalConversationId) {
        set({ activeConversationId: result.newConversationId });
      }

      // Add complete assistant message
      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        streamingMessage: "",
      }));

      // Refresh history if this was a new conversation
      if (result?.newConversationId) {
        get().fetchHistory();
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Use the error message from the server if available
      const errorContent =
        error?.message || "Sorry, I encountered an error. Please try again.";

      const errorMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
        streamingMessage: "",
      }));
    }
  },

  // Fetch conversation history
  fetchHistory: async () => {
    try {
      set({ isLoadingHistory: true });
      const response = await chatApi.getHistory();
      set({
        conversations: response.data.conversations,
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      set({ isLoadingHistory: false });
    }
  },

  // Load specific conversation
  loadConversation: async (conversationId) => {
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

      set({
        messages: chatMessages,
        activeConversationId: conversationId,
        isLoading: false,
        streamingMessage: "",
      });
    } catch (error) {
      console.error("Error loading conversation:", error);
      set({ isLoading: false });
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      await chatApi.deleteConversation(conversationId);

      // Remove from local state
      set((state) => ({
        conversations: state.conversations.filter(
          (c) => c._id !== conversationId,
        ),
        // Clear chat if we're deleting the active conversation
        ...(state.activeConversationId === conversationId && {
          messages: [],
          activeConversationId: null,
          streamingMessage: "",
        }),
      }));
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },

  // Start new conversation
  startNewChat: () =>
    set({
      messages: [],
      activeConversationId: null,
      streamingMessage: "",
    }),
}));

export default useChatStore;
