import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ScrollArea } from "./ui/ScrollArea";
import { Send, Bot, User, Plus, Trash2, MessageSquare } from "lucide-react";
import useChatStore from "../store/useChatStore";

const ChatWindow = () => {
  const {
    messages,
    isLoading,
    streamingMessage,
    activeConversationId,
    conversations,
    isLoadingHistory,
    sendMessage,
    fetchHistory,
    loadConversation,
    deleteConversation,
    startNewChat,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Add welcome message if no messages exist
  const displayMessages =
    messages.length === 0
      ? [
          {
            id: "welcome",
            role: "assistant",
            content:
              "Hello! I'm your AI assistant. I can help you analyze documents, answer questions, and provide insights based on your uploaded content. How can I assist you today?",
            timestamp: new Date(),
            isEmpty: true,
          },
        ]
      : messages;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput("");

    await sendMessage(messageContent);
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="h-full flex flex-col bg-background border-primary/20 overflow-hidden shadow-xs">
      {/* Chat Header - Fixed */}
      <div className="bg-primary/5 border-b border-primary/20 p-4 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">LexiPlan AI</h2>
        </div>
        {activeConversationId && (
          <p className="text-xs text-muted-foreground mt-1">
            Conversation ID: {activeConversationId.slice(-8)}
          </p>
        )}
      </div>

      {/* Main Content Area - Fixed Height */}
      <div className="flex-1 flex min-h-0">
        {/* Chat History Sidebar - Fixed */}
        <div className="w-64 bg-background border-r border-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border flex-shrink-0">
            <Button
              onClick={handleNewChat}
              className="w-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:text-primary font-medium flex items-center justify-center gap-2 transition-all duration-200 text-sm py-2"
            >
              <Plus className="w-3 h-3" />
              New chat
            </Button>
          </div>

          <div className="px-3 py-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-tight uppercase">
              Chat History
            </h3>
          </div>

          <ScrollArea className="flex-1 px-2 pb-3">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-6">
                <div className="text-muted-foreground text-xs animate-pulse">
                  Loading...
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4">
                <div className="p-3 rounded-md bg-muted/30 border border-dashed border-border/50 text-center">
                  <MessageSquare className="w-4 h-4 mx-auto mb-1 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">
                    No conversations
                  </p>
                  <p className="text-xs text-primary mt-0.5">Start chatting!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`group relative p-2 rounded-md cursor-pointer transition-all duration-200 border overflow-hidden ${
                      activeConversationId === conv._id
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 pr-6">
                      <MessageSquare
                        className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                          activeConversationId === conv._id
                            ? "text-primary"
                            : "text-muted-foreground/70"
                        }`}
                      />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p
                          className={`text-xs font-medium truncate leading-tight ${
                            activeConversationId === conv._id
                              ? "text-primary"
                              : "text-foreground/80"
                          }`}
                        >
                          {conv.title || "Untitled"}
                        </p>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            activeConversationId === conv._id
                              ? "text-primary/60"
                              : "text-muted-foreground/80"
                          }`}
                        >
                          {conv.messageCount
                            ? `${conv.messageCount} msgs • `
                            : ""}
                          {new Date(conv.updatedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv._id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Area - Only messages scroll */}
        <div className="flex-1 flex flex-col bg-background min-w-0 relative">
          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Welcome to Deep Forest AI
                    </h3>
                    <p className="text-muted-foreground">
                      I can help you analyze documents, answer questions, and
                      provide insights.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {displayMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="group"
                        >
                          {message.role === "user" ? (
                            <div className="flex gap-4 justify-end">
                              <div className="max-w-2xl">
                                <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm">
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-right">
                                  {formatTime(new Date(message.timestamp))}
                                </p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                                <Bot className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 max-w-2xl">
                                <div className="bg-muted/50 border border-primary/10 rounded-2xl px-4 py-3">
                                  <div className="prose prose-sm max-w-none text-foreground">
                                    <ReactMarkdown>
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatTime(new Date(message.timestamp))}
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Streaming Message */}
                    {streamingMessage && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 max-w-2xl">
                          <div className="bg-muted/50 border border-primary/10 rounded-2xl px-4 py-3">
                            <div className="prose prose-sm max-w-none text-foreground">
                              <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              AI is typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading indicator */}
                    {isLoading && !streamingMessage && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 border border-primary/10 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Fixed at bottom of messages area */}
          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg flex-shrink-0">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Deep Forest AI..."
                  disabled={isLoading}
                  className="w-full pr-12 py-3 rounded-xl border-primary/20 bg-background/90 focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground shadow-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-8 w-8 p-0 shadow-sm transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Deep Forest AI can make mistakes. Consider checking important
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;
