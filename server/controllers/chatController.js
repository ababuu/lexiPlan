import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getContextualAnswer } from "../services/aiService.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";
import { HumanMessage, AIMessage, SystemMessage } from "langchain";

export const chatWithDocuments = async (req, res) => {
  const { message, conversationId, projectId } = req.body;
  const orgId = req.orgId;
  const userId = req.userId;

  try {
    // 1. Get relevant context from documents (with optional project filter)
    const context = await getContextualAnswer(message, orgId, projectId);

    // 2. Fetch conversation history for context (if existing conversation)
    let conversationHistory = [];
    if (conversationId) {
      try {
        const existingConversation = await Conversation.findOne({
          _id: conversationId,
          orgId: orgId,
        }).select("messages");

        if (existingConversation && existingConversation.messages.length > 0) {
          // Get last 5 messages for context
          const recentMessages = existingConversation.messages.slice(-5);
          // Map stored roles to LangChain message class instances
          conversationHistory = recentMessages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          );
        }
      } catch (error) {
        console.error("Error fetching conversation history:", error);
        // Continue without history if fetch fails
      }
    }

    // 3. Initialize Gemini LLM (streaming)
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      streaming: true,
    });

    // 4. Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 5. If new conversation, send conversation ID as first chunk
    let newConversationId = null;
    if (!conversationId) {
      // Pre-create conversation to get ID
      const title =
        message.length > 50 ? message.substring(0, 47) + "..." : message;
      const newConversation = new Conversation({
        title,
        user: userId,
        orgId: orgId,
        projectId: projectId || null, // Store project association
        messages: [], // We'll add messages after streaming
      });
      await newConversation.save();
      newConversationId = newConversation._id.toString();

      // Send conversation ID as first chunk
      res.write(
        `data: ${JSON.stringify({
          type: "conversation_id",
          conversationId: newConversationId,
        })}\n\n`
      );
    }

    // 6. System prompt with retrieved context
    const systemPrompt = projectId
      ? `
        You are a helpful assistant for a specific project within an organization.
        Use the provided context from project documents to answer the user's question.
        Focus on information relevant to this particular project.
        If the answer is not in the context, say you don't know.

        Project Context:
        ${context}
        `
      : `
        You are a helpful assistant for an organization.
        Use the provided context to answer the user's question.
        If the answer is not in the context, say you don't know.

        Context:
        ${context}
        `;

    // 6. Build message history for Gemini using LangChain message classes
    const messages = [
      new SystemMessage(systemPrompt),
      ...conversationHistory, // Array of HumanMessage/AIMessage instances
      new HumanMessage(message),
    ];

    // 7. Stream response and collect full response
    const stream = await model.stream(messages);

    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk?.content) {
        fullResponse += chunk.content;
        // Send as object with content property for client compatibility
        res.write(
          `data: ${JSON.stringify({
            type: "content",
            content: chunk.content,
          })}\n\n`
        );
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

    // 8. Save conversation after streaming completes
    const finalConversationId = conversationId || newConversationId;
    await saveConversation(
      userId,
      orgId,
      message,
      fullResponse,
      finalConversationId
    );
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).write(
      `data: ${JSON.stringify({
        type: "error",
        error: "AI failed to respond",
      })}\n\n`
    );
    res.end();
  }
};

// Helper function to save conversation
const saveConversation = async (
  userId,
  orgId,
  userMessage,
  aiResponse,
  conversationId
) => {
  try {
    let conversation;

    if (conversationId) {
      // Find existing conversation (either pre-created or truly existing)
      conversation = await Conversation.findOne({
        _id: conversationId,
        orgId: orgId,
      });

      if (conversation) {
        // Add messages to existing conversation
        conversation.messages.push(
          { role: "user", content: userMessage },
          { role: "assistant", content: aiResponse }
        );
        await conversation.save();
      } else {
        console.error(`Conversation ${conversationId} not found`);
        return;
      }
    } else {
      // This shouldn't happen with the new flow, but keep as fallback
      const title =
        userMessage.length > 50
          ? userMessage.substring(0, 47) + "..."
          : userMessage;

      conversation = new Conversation({
        title,
        user: userId,
        orgId: orgId,
        messages: [
          { role: "user", content: userMessage },
          { role: "assistant", content: aiResponse },
        ],
      });

      await conversation.save();
    }

    console.log("Conversation saved:", conversation._id);
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
};

// Get chat history for user's organization (excluding project-specific conversations)
export const getChatHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      orgId: req.orgId,
      $or: [
        { projectId: { $exists: false } }, // Legacy conversations without projectId field
        { projectId: null }, // New conversations with explicit null projectId
      ],
    })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt messages")
      .lean();

    // Add message count and last message preview
    const enrichedConversations = conversations.map((conv) => ({
      ...conv,
      messageCount: conv.messages.length,
      lastMessage:
        conv.messages[conv.messages.length - 1]?.content.substring(0, 100) +
          "..." || "",
    }));

    res.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

// Get chat history for specific project
export const getProjectChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const conversations = await Conversation.find({
      orgId: req.orgId,
      projectId: projectId, // Only get project-specific conversations
    })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt messages projectId")
      .lean();

    // Add message count and last message preview
    const enrichedConversations = conversations.map((conv) => ({
      ...conv,
      messageCount: conv.messages.length,
      lastMessage:
        conv.messages[conv.messages.length - 1]?.content.substring(0, 100) +
          "..." || "",
    }));

    res.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error("Error fetching project chat history:", error);
    res.status(500).json({ message: "Failed to fetch project chat history" });
  }
};

// Get specific conversation
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      orgId: req.orgId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      orgId: req.orgId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
