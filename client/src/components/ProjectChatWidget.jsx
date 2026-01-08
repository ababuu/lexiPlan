import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { ScrollArea } from "./ui/ScrollArea";
import useProjectChatStore from "../store/useProjectChatStore";

// Lazy load ReactMarkdown (heavy dependency)
const ReactMarkdown = lazy(() => import("react-markdown"));

const ProjectChatWidget = () => {
  const { projectId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const messagesEndRef = useRef(null);

  const {
    getProjectMessages,
    setProjectMessages,
    isLoading,
    streamingMessage,
    sendProjectMessage,
    clearProjectChat,
    fetchProjectHistory,
    loadProjectConversation,
  } = useProjectChatStore();

  // Get messages for current project
  const messages = getProjectMessages(projectId);

  // Load project history when widget opens for the first time
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectHistory(projectId);
    }
  }, [isOpen, projectId, fetchProjectHistory]);

  // Clear chat when switching projects
  useEffect(() => {
    if (currentProjectId !== projectId) {
      clearProjectChat(projectId);
      setCurrentProjectId(projectId);
    }
  }, [projectId, currentProjectId, clearProjectChat]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");

    try {
      // Send message with project context using project-specific store
      await sendProjectMessage(messageContent, projectId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]"
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#70c171] hover:bg-[#5fa85f] text-white shadow-lg border-0 p-0 cursor-pointer flex items-center justify-center relative"
          style={{ backgroundColor: "#70c171", pointerEvents: "auto" }}
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] h-[500px] sm:h-[550px]"
          >
            <Card className="h-full flex flex-col shadow-2xl overflow-hidden">
              {/* Header */}
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6 border-b bg-gradient-to-r from-[#70c171]/10 to-[#70c171]/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#70c171]" />
                    <span className="hidden xs:inline">
                      Project AI Assistant
                    </span>
                    <span className="xs:hidden">AI Assistant</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-primary"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                {projectId && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Project ID: {projectId.slice(-8)}
                  </p>
                )}
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-6 sm:py-8">
                          <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[#70c171]" />
                          <p className="text-xs sm:text-sm">
                            Ask me anything about this project!
                          </p>
                          <p className="text-[10px] sm:text-xs mt-1">
                            I can help you with documents, analysis, and
                            insights.
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 sm:gap-3 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#70c171]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-[#70c171]" />
                              </div>
                            )}

                            <div
                              className={`max-w-[75%] sm:max-w-[280px] rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 border border-primary/10"
                              }`}
                            >
                              <div className="prose prose-xs sm:prose-sm max-w-none">
                                <Suspense
                                  fallback={
                                    <div className="animate-pulse text-xs">
                                      Loading...
                                    </div>
                                  }
                                >
                                  <ReactMarkdown>
                                    {message.content}
                                  </ReactMarkdown>
                                </Suspense>
                              </div>
                              <p
                                className={`text-[9px] sm:text-xs mt-1 ${
                                  message.role === "user"
                                    ? "text-white/70"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatTimestamp(message.timestamp)}
                              </p>
                            </div>

                            {message.role === "user" && (
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        ))
                      )}

                      {/* Streaming message */}
                      {streamingMessage && (
                        <div className="flex gap-2 sm:gap-3 justify-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#70c171]/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-[#70c171]" />
                          </div>
                          <div className="max-w-[75%] sm:max-w-[280px] rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 bg-primary/10">
                            <p className="text-xs sm:text-sm whitespace-pre-wrap">
                              {streamingMessage}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex gap-1">
                                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#70c171] rounded-full animate-bounce" />
                                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#70c171] rounded-full animate-bounce delay-100" />
                                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#70c171] rounded-full animate-bounce delay-200" />
                              </div>
                              <span className="text-[9px] sm:text-xs text-gray-500 ml-1">
                                typing...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Loading indicator */}
                      {isLoading && !streamingMessage && (
                        <div className="flex gap-2 sm:gap-3 justify-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#70c171]/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-[#70c171]" />
                          </div>
                          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 rounded-lg">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#70c171] rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#70c171] rounded-full animate-bounce delay-100" />
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#70c171] rounded-full animate-bounce delay-200" />
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Area - Fixed at bottom - Fixed at bottom */}
                <div className="border-t p-3 sm:p-4 flex-shrink-0 bg-background/95">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about this project..."
                      disabled={isLoading}
                      className="flex-1 text-xs sm:text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="sm"
                      className="bg-[#70c171] hover:bg-[#5fa85f] text-white px-2 sm:px-3"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-2">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectChatWidget;
