import {
  optimisticallySendMessage,
  useSmoothText,
  useThreadMessages,
} from '@convex-dev/agent/react';
import type { EntryId } from '@convex-dev/rag';
import { useAction, useMutation, usePaginatedQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Markdown } from '../components/markdown';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Sidebar, SidebarProvider } from '../components/ui/sidebar';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../hooks/use-toast';
import { api } from '../../convex/_generated/api';

import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiCheck, 
  FiSend, 
  FiZap, 
  FiMenu, 
  FiSidebar,
  FiUser,
  FiCpu,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiRotateCcw,
  FiShare2,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle,
  FiFileText,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';

type ThreadItem = {
  _id: string;
  title?: string;
  summary?: string;
  status: string;
  _creationTime: number;
  userId?: string;
};

type MessageWithContext = {
  _id: string;
  role?: string;
  content?: string;
  text?: string;
  streaming?: boolean;
  contextUsed?: Array<{
    key?: string;
    text?: string;
  }> | null;
  agentName?: string;
  status?: string;
  _creationTime?: number;
  order?: number;
  stepOrder?: number;
  embeddingId?: string;
  finishReason?: string;
  model?: string;
  provider?: string;
  message?: any;
};

type ChatSidebarProps = {
  activeThreads: ThreadItem[];
  threadId?: string;
  editingId: string | null;
  editingTitle: string;
  setEditingId: (id: string | null) => void;
  setEditingTitle: (title: string) => void;
  setThreadId: (id: string | undefined) => void;
  createThread: (params: { title: string }) => Promise<string>;
  renameThreadMutation: (params: {
    threadId: string;
    title: string;
  }) => Promise<string>;
  archiveThreadMutation: (params: { threadId: string }) => Promise<null>;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
};

function ChatSidebar({
  activeThreads,
  archiveThreadMutation,
  createThread,
  editingId,
  editingTitle,
  renameThreadMutation,
  setEditingId,
  setEditingTitle,
  setThreadId,
  threadId,
  showLeftSidebar,
  setShowLeftSidebar,
}: ChatSidebarProps) {
  if (!showLeftSidebar) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 lg:relative lg:z-auto" aria-label="Chat sidebar">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center font-bold shadow-lg" aria-hidden="true">
            <FiMessageCircle className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Chats</h2>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <Button
          onClick={() => createThread({ title: 'New Chat' })}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg"
          aria-label="Create new chat"
        >
          <FiPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          New Chat
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Chat threads">
        <div className="p-4 space-y-2">
          {activeThreads.map((thread) => (
            <div
              className={`group relative cursor-pointer rounded-lg p-3 transition-colors ${
                threadId === thread._id
                  ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
              key={thread._id}
              onClick={() => setThreadId(thread._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setThreadId(thread._id);
                }
              }}
              aria-label={`Select chat: ${thread.title || 'Untitled Chat'}`}
              aria-pressed={threadId === thread._id}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingId === thread._id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        if (editingTitle.trim()) {
                          renameThreadMutation({ threadId: thread._id, title: editingTitle.trim() });
                        }
                        setEditingId(null);
                        setEditingTitle('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingTitle.trim()) {
                            renameThreadMutation({ threadId: thread._id, title: editingTitle.trim() });
                          }
                          setEditingId(null);
                          setEditingTitle('');
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingTitle('');
                        }
                      }}
                      className="w-full text-sm border-gray-400 dark:border-gray-500 focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-600/20 dark:focus:ring-gray-400/20"
                      autoFocus
                      aria-label="Edit chat title"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {thread.title || 'Untitled Chat'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(thread._id);
                      setEditingTitle(thread.title || '');
                    }}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={`Edit title of chat: ${thread.title || 'Untitled Chat'}`}
                  >
                    <FiEdit2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveThreadMutation({ threadId: thread._id });
                    }}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-300"
                    aria-label={`Archive chat: ${thread.title || 'Untitled Chat'}`}
                  >
                    <FiTrash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {activeThreads.length === 0 && (
            <div className="py-4 text-center text-gray-600 text-sm dark:text-gray-300">
              No chats yet
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

function ChatMessage({
  message,
  expandedContexts,
  toggleContextExpansion,
}: {
  message: MessageWithContext;
  expandedContexts: Set<string>;
  toggleContextExpansion: (messageId: string) => void;
}) {
  // Use text field if content doesn't exist
  const messageText = message.content || message.text;
  
  // Improved message distinction logic for Convex Agent system
  // The issue: In this system, ALL messages have agentName, so we need a different approach
  // We'll use a combination of factors to determine message type
  const isUser = message.message?.role === 'user';
  
  const hasContext = message.contextUsed && message.contextUsed.length > 0;

  // Add safety check for message content
  if (!messageText) {
    return null;
  }

  return (
    <article className={`group flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`} aria-label={`${isUser ? 'User' : 'AI'} message`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-gray-500 to-gray-600 ring-2 ring-gray-200 dark:ring-gray-800' 
            : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-200 dark:ring-gray-800'
        }`} aria-hidden="true">
          {isUser ? <FiUser className="h-5 w-5" /> : <FiCpu className="h-5 w-5" />}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative rounded-2xl px-5 py-4 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-200 dark:shadow-gray-800 ring-2 ring-gray-300 dark:ring-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/10 border-2 border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-100 dark:shadow-gray-900/20 ring-2 ring-gray-300 dark:ring-gray-700'
        }`}>
          {/* Message Header */}
          <div className={`flex items-center gap-2 mb-2 ${
            isUser ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wide">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {!isUser && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-label="AI is online" />
                <span className="text-xs">Online</span>
              </div>
            )}
          </div>
          
          {/* Message Content */}
          <div className={`${isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
            <MessageText 
              text={messageText} 
              streaming={message.streaming}
              invert={isUser}
            />
          </div>
          
          {/* AI Elements Actions - Show on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(messageText || '');
                  toast({
                    title: 'Copied!',
                    description: 'Message copied to clipboard',
                  });
                }}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy message"
                aria-label="Copy message to clipboard"
              >
                <FiCopy className="w-3.5 h-3.5" />
              </button>
              
              {!isUser && (
                <>
                  <button
                    onClick={() => {
                      toast({
                        title: 'Liked!',
                        description: 'Message marked as helpful',
                      });
                    }}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Like message"
                    aria-label="Mark message as helpful"
                  >
                    <FiThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      toast({
                        title: 'Disliked',
                        description: 'Message marked as unhelpful',
                      });
                    }}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Dislike message"
                    aria-label="Mark message as unhelpful"
                  >
                    <FiThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      // Retry functionality - could regenerate AI response
                      toast({
                        title: 'Retry',
                        description: 'Regenerating response...',
                      });
                    }}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Retry response"
                    aria-label="Regenerate AI response"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />

                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: 'Chat Message',
                      text: messageText || '',
                    });
                  } else {
                    navigator.clipboard.writeText(messageText || '');
                    toast({
                      title: 'Shared!',
                      description: 'Message copied to clipboard',
                    });
                  }
                }}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                title="Share message"
                aria-label="Share message"
              >
                <FiShare2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Context Information */}
          {hasContext && message.contextUsed && (
            <div className={`mt-4 pt-3 border-t ${
              isUser 
                ? 'border-gray-400/30' 
                : 'border-gray-200 dark:border-gray-600'
            }`}>
              <button
                onClick={() => toggleContextExpansion(message._id)}
                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                  isUser 
                    ? 'text-gray-100 hover:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-label={`${expandedContexts.has(message._id) ? 'Hide' : 'Show'} context used in this message`}
                aria-expanded={expandedContexts.has(message._id)}
              >
                <FiZap className="h-3 w-3" aria-hidden="true" />
                Context Used ({message.contextUsed.length})
                <span className={`transition-transform ${expandedContexts.has(message._id) ? 'rotate-180' : ''}`} aria-hidden="true">
                  <FiChevronDown className="h-3 w-3" />
                </span>
              </button>
              
              {expandedContexts.has(message._id) && (
                <div className="mt-3 space-y-2" role="region" aria-label="Context details">
                  {message.contextUsed.map((context, index) => (
                    <ContextResult key={index} context={context} isUser={isUser} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Message Timestamp */}
          <div className={`text-xs mt-3 ${
            isUser ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {new Date(message._creationTime || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </article>
  );
}

function ContextResult({ context, isUser }: { context: any; isUser: boolean }) {
  return (
    <div className={`rounded-lg p-3 border ${
      isUser 
        ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700' 
        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
    }`} role="region" aria-label="Context information">
      <div className={`text-xs font-medium mb-1 ${
        isUser 
          ? 'text-gray-700 dark:text-gray-300' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {context.key || 'Context'}
      </div>
      <div className={`text-xs leading-relaxed ${
        isUser 
          ? 'text-gray-600 dark:text-gray-400' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        {context.text}
      </div>
    </div>
  );
}

type ChatInputProps = {
  prompt: string;
  threadId?: string;
  setPrompt: (prompt: string) => void;
  onSendClicked: () => void;
  createThread: (params: { title: string }) => Promise<string>;
  setThreadId: (id: string) => void;
};

function ChatInput({
  prompt,
  threadId,
  setPrompt,
  onSendClicked,
  createThread,
  setThreadId,
}: ChatInputProps) {
  const navigate = useNavigate();
  return (
    <form
      className="flex items-center gap-2 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSendClicked();
      }}
    >
      <Input
        className="flex-1"
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask using the added context…"
        value={prompt}
      />
      <Button disabled={!(prompt.trim() && threadId)} type="submit">
        <FiSend />
      </Button>
      <Button
        onClick={() => {
          createThread({ title: 'RAG Thread' }).then((id) => {
            setThreadId(id);
            navigate(`/${id}`);
          });
        }}
        title="Start over"
        type="button"
        variant="secondary"
      >
        Start over
      </Button>
    </form>
  );
}

type MainChatAreaProps = {
  listMessages: { results?: MessageWithContext[] };
  expandedContexts: Set<string>;
  toggleContextExpansion: (messageId: string) => void;
  prompt: string;
  threadId?: string;
  setPrompt: (prompt: string) => void;
  onSendClicked: () => void;
  createThread: (params: { title: string }) => Promise<string>;
  setThreadId: (id: string) => void;
  showContextPanel: boolean;
  setShowContextPanel: (show: boolean) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
};

function MainChatArea({
  listMessages,
  expandedContexts,
  toggleContextExpansion,
  prompt,
  threadId,
  setPrompt,
  onSendClicked,
  createThread,
  setThreadId,
  showContextPanel,
  setShowContextPanel,
  showLeftSidebar,
  setShowLeftSidebar,
}: MainChatAreaProps) {
  const navigate = useNavigate();

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Title - Accessibility H1 */}
      <h1 className="sr-only">RAG Chat - AI-Powered Contextual Conversations</h1>
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Mobile toggle left sidebar, current state:', showLeftSidebar);
              setShowLeftSidebar(!showLeftSidebar);
            }}
            className={`p-2 transition-colors ${
              showLeftSidebar 
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            aria-label={showLeftSidebar ? 'Hide left sidebar' : 'Show left sidebar'}
          >
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">RAG Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContextPanel(!showContextPanel)}
            className={`p-2 transition-colors ${
              showContextPanel 
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={showContextPanel ? 'Hide context panel' : 'Show context panel'}
            aria-label={showContextPanel ? 'Hide context panel' : 'Show context panel'}
          >
            <FiSidebar className="h-5 w-5" aria-hidden="true" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Messages Area - Mobile First */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        {listMessages.results && listMessages.results.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {listMessages.results.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                expandedContexts={expandedContexts}
                toggleContextExpansion={toggleContextExpansion}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full px-4" role="region" aria-label="Empty chat state">
            <div className="text-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mx-auto mb-4 flex items-center justify-center shadow-lg" aria-hidden="true">
                <FiStar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base max-w-sm mx-auto">
                Ask questions and get AI-powered responses using your context
              </p>
              <Button
                onClick={() => {
                  if (!threadId) {
                    createThread({ title: 'New Chat' }).then((id) => {
                      setThreadId(id);
                      navigate(`/${id}`);
                    });
                  }
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg px-6 py-3 h-auto text-base font-medium"
                aria-label="Start a new chat conversation"
              >
                <FiPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Area - Minimal Design */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <form
            className="flex items-center gap-0"
            onSubmit={(e) => {
              e.preventDefault();
              onSendClicked();
            }}
            aria-label="Chat message form"
          >
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">
                Type your message here
              </label>
              <Input
                className="w-full border-0 focus:ring-0 focus:border-0 rounded-l-xl h-12 text-base bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                id="chat-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything from the lectures..."
                aria-describedby="chat-input-help"
              />
              <div id="chat-input-help" className="sr-only">
                Type your question or message here. The AI will respond using the context you've provided.
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!prompt.trim() || !threadId}
              className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 h-12 rounded-r-xl border-l-0 shadow-none"
              aria-label="Send message"
            >
              <FiSend className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

type EntryChunksPanelProps = {
  selectedEntry: EntryId | null;
  setSelectedEntry: (entryId: EntryId | null) => void;
  globalDocuments: {
    results?: Array<{ entryId: EntryId; key?: string }>;
  };
  documentChunks: {
    results?: Array<{ order: number; text: string }>;
    status: string;
    loadMore: (count: number) => void;
  };
};

function EntryChunksPanel({
  selectedEntry,
  setSelectedEntry,
  globalDocuments,
  documentChunks,
}: EntryChunksPanelProps) {
  if (!selectedEntry) {
    return null;
  }

  return (
    <aside className="hidden xl:flex fixed inset-y-0 right-[20rem] left-[16rem] z-30 flex-col bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md border-l border-gray-200/50 dark:border-gray-700/50" aria-label="Entry chunks panel">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Entry Chunks
          </h2>
          <button
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSelectedEntry(null)}
            title="Close chunks panel"
            type="button"
            aria-label="Close entry chunks panel"
          >
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-gray-700 text-sm dark:text-gray-300">
          {globalDocuments.results?.find((e) => e.entryId === selectedEntry)
            ?.key || 'Selected entry'}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {documentChunks.results && documentChunks.results.length > 0 ? (
          <div className="space-y-3 p-4">
            {documentChunks.results.map((chunk) => (
              <div
                className="space-y-2"
                key={`${selectedEntry}-chunk-${chunk.order}`}
              >
                <div className="font-medium text-gray-600 text-sm dark:text-gray-300">
                  Chunk {chunk.order}
                </div>
                <div className="rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-gray-800">
                  <div className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">
                    {chunk.text}
                  </div>
                </div>
              </div>
            ))}
            {documentChunks.status === 'CanLoadMore' && (
              <button
                className="w-full rounded-lg border border-gray-400 py-3 font-medium text-gray-700 text-sm transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                onClick={() => documentChunks.loadMore(10)}
                type="button"
                aria-label="Load more document chunks"
              >
                Load More Chunks
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-600 dark:text-gray-300">
              {documentChunks.status === 'LoadingFirstPage' ? (
                <>
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-gray-500 border-b-2" aria-label="Loading chunks" />
                  <p>Loading chunks...</p>
                </>
              ) : (
                <p>No chunks found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function AddContextForm({
  addContextForm,
  setAddContextForm,
  handleAddContext,
  isAddingContext,
}: {
  addContextForm: { key: string; text: string };
  setAddContextForm: React.Dispatch<
    React.SetStateAction<{ key: string; text: string }>
  >;
  handleAddContext: () => Promise<void>;
  isAddingContext: boolean;
}) {
  return (
    <section className="border-b border-gray-200/50 dark:border-gray-700/50 p-4" aria-label="Add new context form">
      <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
        Add New Context
      </h3>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleAddContext(); }}>
        <div>
          <label htmlFor="context-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key
          </label>
          <Input
            id="context-key"
            value={addContextForm.key}
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, key: e.target.value }))
            }
            placeholder="Enter context key..."
            className="w-full border-gray-400 dark:border-gray-500 focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-600/20 dark:focus:ring-gray-400/20"
            aria-describedby="context-key-help"
          />
          <div id="context-key-help" className="sr-only">
            Enter a descriptive key for your context entry
          </div>
        </div>
        <div>
          <label htmlFor="context-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text
          </label>
          <textarea
            id="context-text"
            value={addContextForm.text}
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter context text..."
            className="w-full h-24 resize-none rounded-md border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-600/20 dark:focus:ring-gray-400/20"
            aria-describedby="context-text-help"
          />
          <div id="context-text-help" className="sr-only">
            Enter the context information that the AI will use to answer questions
          </div>
        </div>
        <Button
          type="submit"
          disabled={!addContextForm.key.trim() || !addContextForm.text.trim() || isAddingContext}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
          aria-label={isAddingContext ? "Adding context..." : "Add context entry"}
        >
          {isAddingContext ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-label="Loading" />
              Adding...
            </>
          ) : (
            'Add Context'
          )}
        </Button>
      </form>
    </section>
  );
}

type ContextPanelProps = {
  showContextPanel: boolean;
  setShowContextPanel: (show: boolean) => void;
  addContextForm: { key: string; text: string };
  setAddContextForm: React.Dispatch<
    React.SetStateAction<{ key: string; text: string }>
  >;
  isAddingContext: boolean;
  handleAddContext: () => Promise<void>;
  globalDocuments: {
    results?: Array<{
      entryId: EntryId;
      key?: string;
      title?: string;
      status?: string;
    }>;
  };
  selectedEntry: EntryId | null;
  setSelectedEntry: (entryId: EntryId | null) => void;
};

function ContextPanel({
  showContextPanel,
  setShowContextPanel,
  addContextForm,
  setAddContextForm,
  isAddingContext,
  handleAddContext,
  globalDocuments,
  selectedEntry,
  setSelectedEntry,
}: ContextPanelProps) {
  if (!showContextPanel) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md border-l border-gray-200/50 dark:border-gray-700/50 lg:relative lg:z-auto" aria-label="Context panel">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Add Context
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowContextPanel(false)}
          className="lg:hidden p-2"
          aria-label="Close context panel"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <AddContextForm
        addContextForm={addContextForm}
        handleAddContext={handleAddContext}
        isAddingContext={isAddingContext}
        setAddContextForm={setAddContextForm}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
            Context Entries
          </h3>
          <div className="space-y-2">
            {globalDocuments.results?.map((entry) => (
              <button
                className={`cursor-pointer rounded-md p-3 shadow-sm transition-colors w-full text-left ${
                  selectedEntry === entry.entryId 
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600' 
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                key={entry.entryId}
                onClick={() => setSelectedEntry(entry.entryId)}
                type="button"
                aria-label={`Select context entry: ${entry.title || entry.key}`}
                aria-pressed={selectedEntry === entry.entryId}
              >
                <div className="truncate font-medium text-gray-900 text-sm dark:text-gray-100">
                  {entry.title || entry.key}
                </div>
                <div className="mt-1 text-gray-600 text-xs dark:text-gray-300">
                  Status: {entry.status}
                </div>
              </button>
            ))}
            {globalDocuments.results?.length === 0 && (
              <div className="py-4 text-center text-gray-600 text-sm dark:text-gray-300">
                No context entries yet
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function RagBasicUI() {
  const params = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<EntryId | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>(params.threadId);
  const createThread = useMutation(api.threads.createNewThread);

  useEffect(() => {
    if (threadId) {
      console.log('Thread already exists:', threadId);
      return;
    }
    console.log('Creating new thread...');
    createThread({ title: 'RAG Thread' }).then((id) => {
      console.log('New thread created:', id);
      setThreadId(id);
      navigate(`/${id}`, { replace: true });
    }).catch((error) => {
      console.error('Failed to create thread:', error);
    });
  }, [createThread, threadId, navigate]);

  // Error state
  const [error, setError] = useState<Error | undefined>(undefined);

  // Context form state
  const [addContextForm, setAddContextForm] = useState({
    key: '',
    text: '',
  });
  const [isAddingContext, setIsAddingContext] = useState(false);

  // Chat state
  const [prompt, setPrompt] = useState('');
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(
    new Set()
  );
  const [showContextPanel, setShowContextPanel] = useState<boolean>(false); // Start collapsed on mobile
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true); // Start open on desktop

  // Auto-collapse context panel on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        console.log('Resize: Mobile detected, collapsing panels');
        setShowContextPanel(false);
        setShowLeftSidebar(false); // Also collapse left sidebar on mobile
      } else {
        console.log('Resize: Desktop detected, expanding panels');
        setShowContextPanel(true);
        setShowLeftSidebar(true); // Show both panels on desktop
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actions and queries
  const addContext = useAction(api.rag.ragAsPrompt.addContext);
  const sendMessage = useMutation(
    api.rag.ragAsPrompt.askQuestion
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.rag.utils.listMessagesWithContext)
  );
  
  // Debug threadId
  console.log('Current threadId:', threadId);
  
  const listMessages = useThreadMessages(
    api.rag.utils.listMessagesWithContext,
    threadId ? { threadId } : 'skip',
    { initialNumItems: 10, stream: true }
  );
  
  // Debug listMessages
  console.log('listMessages status:', listMessages.status);
  console.log('listMessages results:', listMessages.results);
  const globalDocuments = usePaginatedQuery(
    api.rag.utils.listEntries,
    {},
    { initialNumItems: 10 }
  );
  const documentChunks = usePaginatedQuery(
    api.rag.utils.listChunks,
    selectedEntry ? { entryId: selectedEntry } : 'skip',
    { initialNumItems: 10 }
  );
  const threads = usePaginatedQuery(
    api.threads.listThreads,
    {},
    { initialNumItems: 30 }
  );
  
  // Debug threads
  console.log('Threads status:', threads.status);
  console.log('Threads results:', threads.results);
  console.log('Active threads count:', threads.results?.length || 0);

  const activeThreads = (threads.results ?? []).filter(
    (t) => t.status === 'active'
  );
  
  console.log('Filtered active threads:', activeThreads);
  const renameThreadMutation = useMutation(api.threads.renameThread);
  const archiveThreadMutation = useMutation(api.threads.archiveThread);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Handle adding context
  const handleAddContext = useCallback(async () => {
    if (!(addContextForm.key.trim() && addContextForm.text.trim())) {
      return;
    }
    setIsAddingContext(true);
    try {
      await addContext({
        title: addContextForm.key.trim(),
        text: addContextForm.text.trim(),
      });
      setAddContextForm({ key: '', text: '' });
      toast({
        title: 'Context added',
        description: 'Your context has been added successfully.',
      });
    } catch (error) {
      console.error('Failed to add context:', error);
      toast({
        title: 'Error',
        description: 'Failed to add context. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingContext(false);
    }
  }, [addContext, addContextForm]);

  // Handle sending messages
  const onSendClicked = useCallback(async () => {
    if (!prompt.trim() || !threadId) {
      console.log('Cannot send message - prompt:', prompt.trim(), 'threadId:', threadId);
      return;
    }
    console.log('Sending message:', prompt.trim(), 'to thread:', threadId);
    try {
      await sendMessage({
        threadId,
        prompt: prompt.trim(),
      });
      console.log('Message sent successfully');
      setPrompt('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error as Error);
    }
  }, [prompt, threadId, sendMessage]);

  // Toggle context expansion
  const toggleContextExpansion = useCallback((messageId: string) => {
    setExpandedContexts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="flex h-full flex-col" role="main" aria-label="RAG Chat Application">
      <div className="relative flex h-full min-h-0 flex-1 flex-row bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <ChatSidebar
          activeThreads={activeThreads}
          archiveThreadMutation={archiveThreadMutation}
          createThread={createThread}
          editingId={editingId}
          editingTitle={editingTitle}
          renameThreadMutation={renameThreadMutation}
          setEditingId={setEditingId}
          setEditingTitle={setEditingTitle}
          setThreadId={setThreadId}
          threadId={threadId}
          showLeftSidebar={showLeftSidebar}
          setShowLeftSidebar={setShowLeftSidebar}
        />

        <MainChatArea
          createThread={createThread}
          expandedContexts={expandedContexts}
          listMessages={
            listMessages as unknown as MainChatAreaProps['listMessages']
          }
          onSendClicked={onSendClicked}
          prompt={prompt}
          setPrompt={setPrompt}
          setThreadId={setThreadId}
          threadId={threadId}
          toggleContextExpansion={toggleContextExpansion}
          showContextPanel={showContextPanel}
          setShowContextPanel={setShowContextPanel}
          showLeftSidebar={showLeftSidebar}
          setShowLeftSidebar={setShowLeftSidebar}
        />

        <EntryChunksPanel
          documentChunks={
            documentChunks as unknown as EntryChunksPanelProps['documentChunks']
          }
          globalDocuments={
            globalDocuments as unknown as EntryChunksPanelProps['globalDocuments']
          }
          selectedEntry={selectedEntry}
          setSelectedEntry={setSelectedEntry}
        />

        <ContextPanel
          addContextForm={addContextForm}
          globalDocuments={
            globalDocuments as unknown as ContextPanelProps['globalDocuments']
          }
          handleAddContext={handleAddContext}
          isAddingContext={isAddingContext}
          selectedEntry={selectedEntry}
          setAddContextForm={setAddContextForm}
          setSelectedEntry={setSelectedEntry}
          showContextPanel={showContextPanel}
          setShowContextPanel={setShowContextPanel}
        />

        <div
          className={`fixed top-3 z-[60] flex items-center gap-2 ${showContextPanel ? 'right-[21rem]' : 'right-3'}`}
          role="toolbar"
          aria-label="Main controls"
        >
          <Button
            aria-label={
              showLeftSidebar ? 'Hide left sidebar' : 'Show left sidebar'
            }
            className="shadow"
            onClick={() => {
              console.log('Toggling left sidebar, current state:', showLeftSidebar);
              setShowLeftSidebar(!showLeftSidebar);
            }}
            size="icon"
            title={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            type="button"
            variant="secondary"
          >
            <FiMenu className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label={
              showContextPanel ? 'Hide context panel' : 'Show context panel'
            }
            className="shadow"
            onClick={() => setShowContextPanel(!showContextPanel)}
            size="icon"
            title={showContextPanel ? 'Hide context' : 'Show context'}
            type="button"
            variant="secondary"
          >
            <FiSidebar className="h-4 w-4" aria-hidden="true" />
          </Button>
          <ThemeToggle className="shadow" />
        </div>
      </div>
      {error && (
        <div className="text-center text-red-600 dark:text-red-400 p-4" role="alert" aria-live="polite">
          {error.message}
        </div>
      )}
    </div>
  );
}

function MessageText({
  text,
  streaming,
  invert,
}: {
  text?: string;
  streaming?: boolean;
  invert?: boolean;
}) {
  // Add safety check for text
  if (!text) {
    return <div className="text-gray-400 dark:text-gray-500 italic">No content</div>;
  }
  
  const [smoothText] = useSmoothText(text, { startStreaming: streaming });
  return <Markdown invert={invert}>{smoothText}</Markdown>;
}

export default function RagBasicPage() {
  return (
    <SidebarProvider>
      <RagBasicUI />
    </SidebarProvider>
  );
}
