import {
  optimisticallySendMessage,
  useThreadMessages,
} from '@convex-dev/agent/react';
import type { EntryId } from '@convex-dev/rag';
import { useAction, useMutation, usePaginatedQuery } from 'convex/react';
import {
  ChevronDown,
  ChevronLeft,
  Copy,
  Cross,
  Edit,
  Mail,
  Menu,
  Plus,
  RotateCcw,
  Send,
  Share,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Action, Actions } from '@/components/actions';
import { Message, MessageContent } from '@/components/message';
import { Response } from '@/components/response';
import { api } from '../../convex/_generated/api';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SidebarProvider } from '../components/ui/sidebar';
import { toast } from '../hooks/use-toast';

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
    key: string;
    text: string;
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
  message?: unknown;
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
}: ChatSidebarProps) {
  if (!showLeftSidebar) {
    return null;
  }

  return (
    <aside
      aria-label="Chat sidebar"
      className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-gray-200/50 border-r bg-white/95 shadow-xl backdrop-blur-md lg:relative lg:z-auto dark:border-gray-700/50 dark:bg-gray-900/95"
    >
      <div className="flex items-center justify-between border-gray-200/50 border-b p-4 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-gray-600 to-gray-700 font-bold text-white shadow-lg"
          >
            <Mail className="size-4" />
          </div>
          <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
            Chats
          </h2>
        </div>
      </div>

      <div className="border-gray-200/50 border-b p-4 dark:border-gray-700/50">
        <Button
          aria-label="Create new chat"
          className="w-full"
          colorScheme="primary"
          onClick={() => createThread({ title: 'New Chat' })}
        >
          <Plus aria-hidden="true" className="mr-2 size-4" />
          New Chat
        </Button>
      </div>

      <nav aria-label="Chat threads" className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {activeThreads.map((thread) => (
            <button
              aria-label={`Select chat: ${thread.title || 'Untitled Chat'}`}
              aria-pressed={threadId === thread._id}
              className={`group relative cursor-pointer rounded-lg p-3 transition-colors ${
                threadId === thread._id
                  ? 'border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                  : 'border border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-900'
              }`}
              key={thread._id}
              onClick={() => setThreadId(thread._id)}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  {editingId === thread._id ? (
                    <Input
                      aria-label="Edit chat title"
                      autoFocus
                      className="w-full border-gray-400 text-sm focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 dark:border-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"
                      onBlur={() => {
                        if (editingTitle.trim()) {
                          renameThreadMutation({
                            threadId: thread._id,
                            title: editingTitle.trim(),
                          });
                        }
                        setEditingId(null);
                        setEditingTitle('');
                      }}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingTitle.trim()) {
                            renameThreadMutation({
                              threadId: thread._id,
                              title: editingTitle.trim(),
                            });
                          }
                          setEditingId(null);
                          setEditingTitle('');
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingTitle('');
                        }
                      }}
                      value={editingTitle}
                    />
                  ) : (
                    <div className="truncate font-medium text-gray-900 text-sm dark:text-gray-100">
                      {thread.title || 'Untitled Chat'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    aria-label={`Edit title of chat: ${thread.title || 'Untitled Chat'}`}
                    className="flex size-6 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(thread._id);
                      setEditingTitle(thread.title || '');
                    }}
                    type="button"
                  >
                    <Edit aria-hidden="true" className="size-3" />
                  </button>
                  <button
                    aria-label={`Archive chat: ${thread.title || 'Untitled Chat'}`}
                    className="flex size-6 cursor-pointer items-center justify-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveThreadMutation({ threadId: thread._id });
                    }}
                    type="button"
                  >
                    <Trash aria-hidden="true" className="size-3" />
                  </button>
                </div>
              </div>
            </button>
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

  // Simple role-based message distinction
  const isUser = (message.message as { role?: string })?.role === 'user';

  const hasContext = message.contextUsed && message.contextUsed.length > 0;

  // Add safety check for message content
  if (!messageText) {
    return null;
  }

  return (
    <div className="group relative">
      <Message from={isUser ? 'user' : 'assistant'}>
        <MessageContent>
          <Response>{messageText}</Response>

          {/* Context Information */}
          {hasContext && message.contextUsed && (
            <div className="mt-3">
              <Button
                aria-expanded={expandedContexts.has(message._id)}
                aria-label={`${expandedContexts.has(message._id) ? 'Hide' : 'Show'} context used in this message`}
                className="flex items-center gap-2 font-medium text-gray-600 text-xs hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => toggleContextExpansion(message._id)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Zap aria-hidden="true" className="size-3" />
                Context Used ({message.contextUsed.length})
                <span
                  aria-hidden="true"
                  className={`transition-transform ${expandedContexts.has(message._id) ? 'rotate-180' : ''}`}
                >
                  <ChevronDown className="size-3" />
                </span>
              </Button>

              {expandedContexts.has(message._id) && (
                <section
                  aria-label="Context details"
                  className="mt-3 space-y-2"
                >
                  {message.contextUsed.map((context, index) => (
                    <ContextResult
                      context={context}
                      isUser={isUser}
                      key={`${context.key}-${index}`}
                    />
                  ))}
                </section>
              )}
            </div>
          )}

          {/* Message Timestamp */}
          <div className="mt-3 text-gray-500 text-xs dark:text-gray-400">
            {new Date(message._creationTime || Date.now()).toLocaleTimeString()}
          </div>
        </MessageContent>
      </Message>

      {/* Floating Message Actions */}
      <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-lg border border-gray-200 bg-white/90 p-1 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
          <Actions>
            <Action
              onClick={() => {
                navigator.clipboard.writeText(messageText || '');
                toast({
                  title: 'Copied!',
                  description: 'Message copied to clipboard',
                });
              }}
              tooltip="Copy message"
            >
              <Copy className="size-3" />
            </Action>

            {!isUser && (
              <>
                <Action
                  onClick={() => {
                    toast({
                      title: 'Liked!',
                      description: 'Message marked as helpful',
                    });
                  }}
                  tooltip="Like message"
                >
                  <ThumbsUp className="size-3" />
                </Action>

                <Action
                  onClick={() => {
                    toast({
                      title: 'Disliked',
                      description: 'Message marked as unhelpful',
                    });
                  }}
                  tooltip="Dislike message"
                >
                  <ThumbsDown className="size-3" />
                </Action>

                <Action
                  onClick={() => {
                    toast({
                      title: 'Regenerating...',
                      description: 'Generating new response',
                    });
                  }}
                  tooltip="Regenerate response"
                >
                  <RotateCcw className="size-3" />
                </Action>
              </>
            )}

            <Action
              onClick={() => {
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
              tooltip="Share message"
            >
              <Share className="size-3" />
            </Action>
          </Actions>
        </div>
      </div>
    </div>
  );
}

function ContextResult({
  context,
  isUser,
}: {
  context: { key: string; text: string };
  isUser: boolean;
}) {
  return (
    <section
      aria-label="Context information"
      className={`rounded-lg border p-3 ${
        isUser
          ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
      }`}
    >
      <div
        className={`mb-1 font-medium text-xs ${
          isUser
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {context.key || 'Context'}
      </div>
      <div
        className={`text-xs leading-relaxed ${
          isUser
            ? 'text-gray-600 dark:text-gray-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {context.text}
      </div>
    </section>
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
  showLeftSidebar,
  setShowLeftSidebar,
}: MainChatAreaProps) {
  const navigate = useNavigate();

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Title - Accessibility H1 */}
      <h1 className="sr-only">
        RAG Chat - AI-Powered Contextual Conversations
      </h1>

      {/* Mobile Header */}
      <header className="flex items-center justify-between border-gray-200/50 border-b bg-white/95 p-4 shadow-xs backdrop-blur-md lg:hidden dark:border-gray-700/50 dark:bg-gray-900/95">
        <div className="flex items-center gap-3">
          <Button
            aria-label={
              showLeftSidebar ? 'Hide left sidebar' : 'Show left sidebar'
            }
            className={`z-100 rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-purple-100 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:border-purple-400 dark:hover:bg-purple-900/20 dark:hover:shadow-purple-900/20 ${
              showLeftSidebar
                ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-500 dark:bg-purple-800 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => {
              setShowLeftSidebar(!showLeftSidebar);
            }}
            size="icon"
            title={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            variant="ghost"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <ThemeToggle />
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-900 text-lg dark:text-gray-100">
            RAG Chat
          </span>
        </div>
      </header>

      {/* Chat Messages Area - Mobile First */}
      <div className="mt-8 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        {listMessages.results && listMessages.results.length > 0 ? (
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
            {listMessages.results.map((message) => (
              <ChatMessage
                expandedContexts={expandedContexts}
                key={message._id}
                message={message}
                toggleContextExpansion={toggleContextExpansion}
              />
            ))}
          </div>
        ) : (
          <section
            aria-label="Empty chat state"
            className="flex h-full items-center justify-center px-4"
          >
            <div className="text-center">
              <div
                aria-hidden="true"
                className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 shadow-lg sm:size-20 dark:from-gray-800 dark:to-gray-700"
              >
                <Star className="size-8 text-gray-600 sm:size-10 dark:text-gray-400" />
              </div>
              <h2 className="mb-2 font-semibold text-gray-900 text-lg sm:text-xl dark:text-gray-100">
                Start a conversation
              </h2>
              <p className="mx-auto mb-4 max-w-sm text-gray-700 text-sm sm:text-base dark:text-gray-300">
                Ask questions and get AI-powered responses using your context
              </p>
              <Button
                aria-label="Start a new chat conversation"
                className="h-auto px-6 py-3 font-medium text-base"
                colorScheme="success"
                onClick={() => {
                  if (!threadId) {
                    createThread({ title: 'New Chat' }).then((id) => {
                      setThreadId(id);
                      navigate(`/${id}`);
                    });
                  }
                }}
              >
                <Plus aria-hidden="true" className="mr-2 size-4" />
                Start New Chat
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Chat Input Area - Minimal Design */}
      <div className="border-gray-200 border-t bg-white p-2 px-0 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <form
            aria-label="Chat message form"
            className="flex items-center gap-0"
            onSubmit={(e) => {
              e.preventDefault();
              onSendClicked();
            }}
          >
            <div className="flex-1">
              <label className="sr-only" htmlFor="chat-input">
                Type your message here
              </label>
              <Input
                aria-describedby="chat-input-help"
                className="h-12 w-full rounded-r-none rounded-l-md border-0 bg-gray-50 text-base text-gray-950 placeholder-gray-700 ring-0 focus:border-0 focus:ring-0 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-300"
                id="chat-input"
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything from the lectures..."
                value={prompt}
              />
              <div className="sr-only" id="chat-input-help">
                Type your question or message here. The AI will respond using
                the context you've provided.
              </div>
            </div>
            <Button
              aria-label="Send message"
              className="h-12 rounded-r-md rounded-l-none border-l-0 px-6 shadow-none"
              colorScheme="info"
              disabled={!(prompt.trim() && threadId)}
              type="submit"
            >
              <Send aria-hidden="true" className="size-4" />
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
    <aside
      aria-label="Entry chunks panel"
      className="fixed inset-y-0 right-80 left-64 z-30 hidden flex-col border-gray-200/50 border-l bg-white/95 shadow-xl backdrop-blur-md xl:flex dark:border-gray-700/50 dark:bg-gray-900/95"
    >
      <div className="border-gray-200/50 border-b p-4 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
            Entry Chunks
          </h2>
          <Button
            aria-label="Close entry chunks panel"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSelectedEntry(null)}
            size="icon"
            title="Close chunks panel"
            type="button"
            variant="ghost"
          >
            <Cross aria-hidden="true" className="size-4" />
          </Button>
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
                <div className="rounded-lg bg-gray-50 p-4 shadow-xs dark:bg-gray-800">
                  <div className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">
                    {chunk.text}
                  </div>
                </div>
              </div>
            ))}
            {documentChunks.status === 'CanLoadMore' && (
              <Button
                aria-label="Load more document chunks"
                className="w-full"
                onClick={() => documentChunks.loadMore(10)}
                size="lg"
                type="button"
                variant="outline"
              >
                Load More Chunks
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-600 dark:text-gray-300">
              {documentChunks.status === 'LoadingFirstPage' ? (
                <>
                  <div
                    aria-hidden
                    className="mx-auto mb-2 size-8 animate-spin rounded-full border-gray-500 border-b-2"
                  />
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
    <section
      aria-label="Add new context form"
      className="border-gray-200/50 border-b p-4 dark:border-gray-700/50"
    >
      <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
        Add New Context
      </h3>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddContext();
        }}
      >
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
            htmlFor="context-key"
          >
            Key
          </label>
          <Input
            aria-describedby="context-key-help"
            className="w-full border-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 dark:border-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"
            id="context-key"
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, key: e.target.value }))
            }
            placeholder="Enter context key..."
            value={addContextForm.key}
          />
          <div className="sr-only" id="context-key-help">
            Enter a descriptive key for your context entry
          </div>
        </div>
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
            htmlFor="context-text"
          >
            Text
          </label>
          <textarea
            aria-describedby="context-text-help"
            className="h-24 w-full resize-none rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 text-sm placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"
            id="context-text"
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter context text..."
            value={addContextForm.text}
          />
          <div className="sr-only" id="context-text-help">
            Enter the context information that the AI will use to answer
            questions
          </div>
        </div>
        <Button
          aria-label={
            isAddingContext ? 'Adding context...' : 'Add context entry'
          }
          className="w-full"
          colorScheme="purple"
          disabled={
            !(addContextForm.key.trim() && addContextForm.text.trim()) ||
            isAddingContext
          }
          type="submit"
        >
          {isAddingContext ? (
            <>
              <div
                aria-hidden
                className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
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
  return (
    <>
      {/* Collapsed State - Arrow Toggle */}
      {!showContextPanel && (
        <div className="-translate-y-1/2 fixed z-40 lg:absolute lg:top-3 lg:right-0">
          <Button
            aria-label="Open context panel"
            className="rounded-b-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-green-100 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:border-green-400 dark:hover:bg-green-900/20 dark:hover:shadow-green-900/20"
            onClick={() => setShowContextPanel(true)}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="size-4 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      )}

      {/* Expanded State */}
      {showContextPanel && (
        <aside
          aria-label="Context panel"
          className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-gray-200/50 border-l bg-white/95 shadow-xl backdrop-blur-md lg:relative lg:z-auto dark:border-gray-700/50 dark:bg-gray-900/95"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between border-gray-200/50 border-b p-4 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
              Add Context
            </h2>
            <Button
              aria-label="Close context panel"
              className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowContextPanel(false)}
              size="sm"
              variant="ghost"
            >
              <Cross className="size-4 text-gray-700 dark:text-gray-300" />
            </Button>
          </div>

          {/* Content */}
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
                  <Button
                    aria-label={`Select context entry: ${entry.title || entry.key}`}
                    aria-pressed={selectedEntry === entry.entryId}
                    className={`w-full cursor-pointer rounded-md p-3 text-left shadow-xs transition-colors ${
                      selectedEntry === entry.entryId
                        ? 'border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                        : 'border border-transparent bg-gray-50 hover:border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                    }`}
                    key={entry.entryId}
                    onClick={() => setSelectedEntry(entry.entryId)}
                    type="button"
                    variant="ghost"
                  >
                    <div className="truncate font-medium text-gray-900 text-sm dark:text-gray-100">
                      {entry.title || entry.key}
                    </div>
                    <div className="mt-1 text-gray-600 text-xs dark:text-gray-300">
                      Status: {entry.status}
                    </div>
                  </Button>
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
      )}
    </>
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
      return;
    }
    createThread({ title: 'RAG Thread' })
      .then((id) => {
        setThreadId(id);
        navigate(`/${id}`, { replace: true });
      })
      .catch((err) => {
        console.error('Failed to create thread:', err);
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
  const [showContextPanel, setShowContextPanel] = useState<boolean>(false); // Start collapsed, controlled by arrow toggle
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true); // Start open on desktop

  // Auto-collapse context panel on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        setShowContextPanel(false);
        setShowLeftSidebar(false); // Also collapse left sidebar on mobile
      } else {
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

  const listMessages = useThreadMessages(
    api.rag.utils.listMessagesWithContext,
    threadId ? { threadId } : 'skip',
    { initialNumItems: 10, stream: true }
  );

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

  const activeThreads = (threads.results ?? []).filter(
    (t) => t.status === 'active'
  );

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
    } catch (err) {
      console.error('Failed to add context:', err);
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
    if (!(prompt.trim() && threadId)) {
      return;
    }
    try {
      await sendMessage({
        threadId,
        prompt: prompt.trim(),
      });
      setPrompt('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err as Error);
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
    <main
      aria-label="RAG Chat Application"
      className="flex h-svh w-full flex-col"
    >
      <div className="relative flex h-full min-h-0 flex-1 flex-row bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <ChatSidebar
          activeThreads={activeThreads}
          archiveThreadMutation={archiveThreadMutation}
          createThread={createThread}
          editingId={editingId}
          editingTitle={editingTitle}
          renameThreadMutation={renameThreadMutation}
          setEditingId={setEditingId}
          setEditingTitle={setEditingTitle}
          setShowLeftSidebar={setShowLeftSidebar}
          setThreadId={setThreadId}
          showLeftSidebar={showLeftSidebar}
          threadId={threadId}
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
          setShowContextPanel={setShowContextPanel}
          setShowLeftSidebar={setShowLeftSidebar}
          setThreadId={setThreadId}
          showContextPanel={showContextPanel}
          showLeftSidebar={showLeftSidebar}
          threadId={threadId}
          toggleContextExpansion={toggleContextExpansion}
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
          setShowContextPanel={setShowContextPanel}
          showContextPanel={showContextPanel}
        />

        <div
          aria-label="Main controls"
          className={`fixed top-3 z-60 hidden items-center gap-2 lg:flex ${showLeftSidebar ? 'left-72' : 'left-8'} ${showContextPanel ? 'right-84' : 'right-auto'}`}
          role="toolbar"
        >
          <Button
            aria-label={
              showLeftSidebar ? 'Hide left sidebar' : 'Show left sidebar'
            }
            className="rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-purple-100 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:border-purple-400 dark:hover:bg-purple-900/20 dark:hover:shadow-purple-900/20"
            onClick={() => {
              setShowLeftSidebar(!showLeftSidebar);
            }}
            size="icon"
            title={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            type="button"
            variant="ghost"
          >
            <Menu
              aria-hidden="true"
              className="size-4 text-gray-700 dark:text-gray-300"
            />
          </Button>

          <ThemeToggle />
        </div>
      </div>
      {error && (
        <div
          aria-live="polite"
          className="p-4 text-center text-red-600 dark:text-red-400"
          role="alert"
        >
          {error.message}
        </div>
      )}
    </main>
  );
}

export default function RagBasicPage() {
  return (
    <SidebarProvider>
      <RagBasicUI />
    </SidebarProvider>
  );
}
