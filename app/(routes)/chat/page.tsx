"use client";

import { useState, useRef, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Send, User, Bot, Trash2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

const schema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

type FormSchema = z.infer<typeof schema>;

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function ChatPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
    },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant powered by Google Gemini. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [form.watch("message")]);

  const onSubmit = async (data: FormSchema) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: data.message,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      const res = await fetch("/api/openai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: data.message,
          conversationId: "default-chat" 
        }),
      });
        if (res.status === 403) {
        // Redirect to /pricing if user is unauthorized
        window.location.href = "/pricing";
        return;
      }
      const json = await res.json();
      
      if (!res.ok) throw new Error(json?.error || "Chat failed");

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: json.message,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your AI assistant powered by Google Gemini. How can I help you today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (form.formState.isValid && !isLoading) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  // Markdown components configuration
  const markdownComponents = {
    p: ({children}: any) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({children}: any) => <strong className="font-bold">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
    ul: ({children}: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
    ol: ({children}: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
    li: ({children}: any) => <li>{children}</li>,
    code: ({children, className}: any) => (
      <code className={`bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono ${className || ''}`}>
        {children}
      </code>
    ),
    pre: ({children}: any) => (
      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-3 text-sm">
        {children}
      </pre>
    ),
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-600">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-gray-300" />,
    a: ({href, children}: any) => (
      <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    h1: ({children}: any) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-lg font-bold mt-3 mb-1">{children}</h3>,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold ">
                Gemini AI Chat
              </h1>
              <p className="mt-2 ">
                Chat with Google's Gemini AI. Ask questions, get help, or just have a conversation.
              </p>
            </div>
            
            <button
              onClick={clearChat}
              disabled={messages.length <= 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat container - spans 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-inner overflow-hidden flex flex-col h-[600px]">
                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-6 ${index === messages.length - 1 ? 'pb-2' : ''}`}
                    >
                      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`flex-1 ${message.role === "user" ? "max-w-[85%]" : "max-w-[85%]"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-700">
                              {message.role === "user" ? "You" : "Gemini AI"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          
                          <div className={`relative group rounded-2xl p-4 ${
                            message.role === "user" 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                              : "bg-gray-50 text-gray-800"
                          }`}>
                            {message.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown components={markdownComponents}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}
                            
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className={`absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                message.role === "user" 
                                  ? "bg-white/20 hover:bg-white/30" 
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {message.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="max-w-[85%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-700">Gemini AI</span>
                        </div>
                        <div className="bg-gray-50 text-gray-800 rounded-2xl p-4">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <div className="border-t border-gray-200 p-4 sm:p-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                      <Textarea
                        {...form.register("message")}
                        ref={(e) => {
                          form.register("message").ref(e);
                          textareaRef.current = e;
                        }}
                        placeholder="Type your message here..."
                        onKeyDown={handleKeyDown}
                        rows={2}
                        className="w-full pr-12 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-2xl min-h-[60px] max-h-[200px]"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={!form.formState.isValid || isLoading}
                        className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="text-xs text-gray-500">
                        {form.watch("message").length > 0 && (
                          <span className={form.watch("message").length > 1800 ? "text-amber-600" : ""}>
                            {form.watch("message").length}/2000 characters
                          </span>
                        )}
                        {form.formState.errors.message && (
                          <span className="text-red-500 ml-2">
                            {form.formState.errors.message.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
                          Powered by Gemini 2.5 Flash
                        </span>
                        <span>Press Enter to send, Shift+Enter for new line</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-inner">
                <h3 className="font-semibold text-gray-900 mb-4">Chat Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Messages in chat</p>
                    <p className="text-2xl font-bold text-gray-900">{messages.length - 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AI Model</p>
                    <p className="font-medium text-gray-900">Gemini 2.5 Flash</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="font-medium text-green-600">Ready to chat</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-inner">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Suggestions</h3>
                <div className="space-y-3">
                  {[
                    "Explain quantum computing in simple terms",
                    "Help me plan a 3-day trip to Tokyo",
                    "Write a Python function to sort a list",
                    "What are the benefits of exercise?",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        form.setValue("message", suggestion);
                        textareaRef.current?.focus();
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3">Tips for Better Responses</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Be specific with your questions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Ask follow-up questions for clarity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Use Shift+Enter for multi-line messages
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Copy responses with the copy button
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}