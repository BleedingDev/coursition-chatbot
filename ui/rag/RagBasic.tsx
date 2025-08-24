import {
  optimisticallySendMessage,
  useSmoothText,
  useThreadMessages,
} from '@convex-dev/agent/react';
import type { EntryId } from '@convex-dev/rag';
import { useAction, useMutation, usePaginatedQuery } from 'convex/react';
import { Check, Edit2, PanelRight, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Markdown } from '@/components/markdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { api } from '../../convex/_generated/api';

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
    void createThread({ title: 'RAG Thread' }).then((id) => {
      setThreadId(id);
      navigate(`/${id}`, { replace: true });
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
  const [showContextPanel, setShowContextPanel] = useState<boolean>(true);

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
    } catch (contextError) {
      console.error('Error adding context:', contextError);
    } finally {
      setIsAddingContext(false);
    }
  }, [addContext, addContextForm]);

  // Handle sending message
  const onSendClicked = useCallback(() => {
    if (!prompt.trim()) {
      return;
    }

    if (!threadId) {
      toast({
        title: 'Thread ID is not set',
        description: 'Please create a thread first',
      });
      return;
    }
    setPrompt('');
    sendMessage({
      threadId,
      prompt: prompt.trim(),
    }).catch((sendError) => {
      setError(sendError);
      setPrompt(prompt);
    });
  }, [sendMessage, threadId, prompt]);

  // Toggle context expansion
  const toggleContextExpansion = useCallback((messageId: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-full min-h-0 flex-1 flex-row bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <SidebarRail />
        {/* Sidebar - Chat History */}
        <Sidebar>
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900 text-sm dark:text-slate-100">
                  Chat History
                </h2>
              </div>
              <Button
                aria-label="New Chat"
                onClick={() => {
                  void createThread({ title: 'New Chat' }).then((id) => {
                    setThreadId(id);
                    try {
                      (window as any).history.pushState(null, '', `/${id}`);
                    } catch {}
                  });
                }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Chat</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ul className="space-y-1 p-2">
                {activeThreads.map((t) => (
                  <li key={t._id}>
                    <div
                      className={
                        'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition' +
                        (threadId === t._id
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                          : 'bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800')
                      }
                    >
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          setThreadId(t._id);
                          navigate(`/${t._id}`);
                        }}
                        title={t.title || 'Untitled'}
                      >
                        {editingId === t._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              className="h-8"
                              onChange={(e) => setEditingTitle(e.target.value)}
                              value={editingTitle}
                            />
                            <Button
                              aria-label="Save"
                              onClick={() => {
                                const title = editingTitle.trim();
                                if (!title) {
                                  return setEditingId(null);
                                }
                                void renameThreadMutation({
                                  threadId: t._id,
                                  title,
                                }).then(() => setEditingId(null));
                              }}
                              size="sm"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              aria-label="Cancel"
                              onClick={() => setEditingId(null)}
                              size="sm"
                              variant="secondary"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="truncate font-medium">
                              {t.title || 'Untitled'}
                            </div>
                            {t.summary && (
                              <div className="truncate text-slate-500 text-xs dark:text-slate-400">
                                {t.summary}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                      {editingId !== t._id && (
                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <Button
                            aria-label="Rename"
                            onClick={() => {
                              setEditingId(t._id);
                              setEditingTitle(t.title || '');
                            }}
                            size="sm"
                            title="Rename"
                            variant="secondary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label="Delete"
                            onClick={() => {
                              void archiveThreadMutation({
                                threadId: t._id,
                              }).then(() => {
                                if (threadId === t._id) {
                                  setThreadId(undefined);
                                  try {
                                    (window as any).history.replaceState(
                                      null,
                                      '',
                                      '/'
                                    );
                                  } catch {}
                                }
                              });
                            }}
                            size="sm"
                            title="Delete"
                            variant="secondary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                {activeThreads.length === 0 && (
                  <li>
                    <div className="px-3 py-2 text-slate-500 text-xs dark:text-slate-400">
                      No chats yet
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </Sidebar>

        {/* Main Chat Area */}
        <main className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8">
          <Card className="flex h-full min-h-0 w-full max-w-2xl flex-col justify-end">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white shadow-sm">
                  R
                </div>
                <span className="flex-1">RAG Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-full min-h-0 flex-col justify-end gap-3">
              {listMessages.results && listMessages.results.length > 0 && (
                <div className="mb-2 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
                  {listMessages.results.map(
                    (message) =>
                      message.text && (
                        <div className="space-y-2" key={message._id}>
                          {/* Message */}
                          <div
                            className={`flex items-end gap-2 ${message.message?.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.message?.role !== 'user' && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 text-xs shadow-sm dark:bg-slate-700 dark:text-slate-200">
                                AI
                              </div>
                            )}
                            <div
                              className={`max-w-lg rounded-2xl px-4 py-2 shadow ${message.message?.role === 'user' ? 'bg-indigo-900 text-white' : 'bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100'}`}
                            >
                              <MessageText
                                invert={message.message?.role === 'user'}
                                streaming={message.streaming}
                                text={message.text}
                              />
                            </div>
                            {message.message?.role === 'user' && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white text-xs shadow-sm">
                                U
                              </div>
                            )}
                          </div>

                          {/* Context Section (expandable) - shown after user message */}
                          {message.contextUsed &&
                            message.message?.role === 'user' && (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                <button
                                  className="flex w-full items-center justify-between rounded-t-lg px-4 py-2 text-left font-medium text-slate-700 text-sm hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                  onClick={() =>
                                    toggleContextExpansion(message._id)
                                  }
                                >
                                  <span>
                                    Context Used (
                                    {message.contextUsed.results.length}{' '}
                                    results)
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    {expandedContexts.has(message._id)
                                      ? '−'
                                      : '+'}
                                  </span>
                                </button>
                                {expandedContexts.has(message._id) && (
                                  <div className="space-y-2 px-4 pb-4">
                                    {message.contextUsed.results.map(
                                      (result, index) => (
                                        <div
                                          className="rounded border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                                          key={index}
                                        >
                                          <div className="mb-2 flex items-center justify-between">
                                            <div className="font-medium text-slate-600 text-xs dark:text-slate-400">
                                              Entry:{' '}
                                              {message.contextUsed?.entries.find(
                                                (e) =>
                                                  e.entryId === result.entryId
                                              )?.key || 'Unknown'}
                                            </div>
                                            <div className="text-slate-500 text-xs dark:text-slate-400">
                                              Score: {result.score.toFixed(3)} |
                                              Order: {result.order}
                                            </div>
                                          </div>
                                          <div className="space-y-1 text-slate-800 text-sm dark:text-slate-200">
                                            {result.content.map(
                                              (content, contentIndex) => (
                                                <div key={contentIndex}>
                                                  {content.text}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )
                  )}
                </div>
              )}
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
                  Send
                </Button>
                <Button
                  onClick={() => {
                    void createThread({ title: 'RAG Thread' }).then((id) => {
                      setThreadId(id);
                      try {
                        (window as any).history.pushState(null, '', `/${id}`);
                      } catch {}
                    });
                  }}
                  title="Start over"
                  variant="secondary"
                >
                  Start over
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Middle Panel - Entry Chunks */}
        {selectedEntry && (
          <div className="fixed inset-y-0 right-[20rem] left-[16rem] z-30 flex flex-col bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Entry Chunks
                </h2>
                <button
                  className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  onClick={() => setSelectedEntry(null)}
                  title="Close chunks panel"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-slate-600 text-sm dark:text-slate-400">
                {globalDocuments.results?.find(
                  (e) => e.entryId === selectedEntry
                )?.key || 'Selected entry'}
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
                      <div className="font-medium text-slate-500 text-sm dark:text-slate-400">
                        Chunk {chunk.order}
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4 shadow-sm dark:bg-slate-800">
                        <div className="text-slate-800 text-sm leading-relaxed dark:text-slate-200">
                          {chunk.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {documentChunks.status === 'CanLoadMore' && (
                    <button
                      className="w-full rounded-lg border border-blue-200 py-3 font-medium text-blue-600 text-sm transition hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                      onClick={() => documentChunks.loadMore(10)}
                    >
                      Load More Chunks
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    {documentChunks.status === 'LoadingFirstPage' ? (
                      <>
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-indigo-400 border-b-2" />
                        <p>Loading chunks...</p>
                      </>
                    ) : (
                      <p>No chunks found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Add Context */}
        {showContextPanel && (
          <div className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
            <div className="flex items-center justify-between p-4">
              <h2 className="mb-4 font-semibold text-lg text-slate-900 dark:text-slate-100">
                Add Context
              </h2>
            </div>
            <div className="w-full space-y-3 px-4">
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                  Title
                </label>
                <Input
                  onChange={(e) =>
                    setAddContextForm((prev) => ({
                      ...prev,
                      key: e.target.value,
                    }))
                  }
                  placeholder="Enter context title"
                  value={addContextForm.key}
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm dark:text-slate-300">
                  Text
                </label>
                <Textarea
                  onChange={(e) =>
                    setAddContextForm((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  placeholder="Enter context body"
                  rows={4}
                  value={addContextForm.text}
                />
              </div>
              <Button
                className="w-full"
                disabled={
                  isAddingContext ||
                  !addContextForm.key.trim() ||
                  !addContextForm.text.trim()
                }
                onClick={() => void handleAddContext()}
              >
                {isAddingContext ? 'Adding...' : 'Add Context'}
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
                  Context Entries
                </h3>
                <div className="space-y-2">
                  {globalDocuments.results?.map((entry) => (
                    <div
                      className={`cursor-pointer rounded-md p-3 shadow-sm transition-colors ${selectedEntry === entry.entryId ? 'bg-indigo-50 dark:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'}`}
                      key={entry.entryId}
                      onClick={() => setSelectedEntry(entry.entryId)}
                    >
                      <div className="truncate font-medium text-slate-900 text-sm dark:text-slate-100">
                        {entry.title || entry.key}
                      </div>
                      <div className="mt-1 text-slate-500 text-xs dark:text-slate-400">
                        Status: {entry.status}
                      </div>
                    </div>
                  ))}
                  {globalDocuments.results?.length === 0 && (
                    <div className="py-4 text-center text-slate-500 text-sm dark:text-slate-400">
                      No context entries yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none">
          <Button
            aria-label={
              showContextPanel ? 'Hide context panel' : 'Show context panel'
            }
            className={`pointer-events-auto fixed ${showContextPanel ? 'right-[21rem]' : 'right-3'} top-3 z-[60] shadow`}
            onClick={() => setShowContextPanel((v) => !v)}
            size="icon"
            title={showContextPanel ? 'Hide context' : 'Show context'}
            type="button"
            variant="secondary"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="pointer-events-none">
          <ThemeToggle className="fixed top-3 right-16 z-[60] shadow" />
        </div>
      </div>
      {error && <div className="text-center text-red-500">{error.message}</div>}
    </div>
  );
}

function MessageText({
  text,
  streaming,
  invert,
}: {
  text: string;
  streaming?: boolean;
  invert?: boolean;
}) {
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
