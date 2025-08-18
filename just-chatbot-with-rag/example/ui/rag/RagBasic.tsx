import { useAction, useMutation, usePaginatedQuery } from "convex/react";
import {
  optimisticallySendMessage,
  useSmoothText,
  useThreadMessages,
} from "@convex-dev/agent/react";
import { api } from "../../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { EntryId } from "@convex-dev/rag";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Check, X, PanelRight } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { SidebarProvider, Sidebar, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { useNavigate, useParams } from "react-router-dom";

function RagBasicUI() {
  const params = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [selectedEntry, setSelectedEntry] = useState<EntryId | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>(params.threadId);
  const createThread = useMutation(api.threads.createNewThread);
  useEffect(() => {
    if (threadId) return;
    void createThread({ title: "RAG Thread" }).then((id) => {
      setThreadId(id);
      navigate(`/rag-basic/${id}`, { replace: true });
    });
  }, [createThread, threadId, navigate]);

  // Error state
  const [error, setError] = useState<Error | undefined>(undefined);

  // Context form state
  const [addContextForm, setAddContextForm] = useState({
    key: "",
    text: "",
  });
  const [isAddingContext, setIsAddingContext] = useState(false);

  // Chat state
  const [prompt, setPrompt] = useState("");
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(
    new Set(),
  );

  // Actions and queries
  const addContext = useAction(api.rag.ragAsPrompt.addContext);
  const sendMessage = useMutation(
    api.rag.ragAsPrompt.askQuestion,
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.rag.utils.listMessagesWithContext),
  );
  const listMessages = useThreadMessages(
    api.rag.utils.listMessagesWithContext,
    threadId ? { threadId } : "skip",
    { initialNumItems: 10, stream: true },
  );
  const globalDocuments = usePaginatedQuery(
    api.rag.utils.listEntries,
    {},
    { initialNumItems: 10 },
  );
  const documentChunks = usePaginatedQuery(
    api.rag.utils.listChunks,
    selectedEntry ? { entryId: selectedEntry } : "skip",
    { initialNumItems: 10 },
  );
  const threads = usePaginatedQuery(api.threads.listThreads, {}, { initialNumItems: 30 });
  const activeThreads = (threads.results ?? []).filter((t) => t.status === "active");
  const renameThreadMutation = useMutation(api.threads.renameThread);
  const archiveThreadMutation = useMutation(api.threads.archiveThread);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [showContextPanel, setShowContextPanel] = useState<boolean>(true);

  // Handle adding context
  const handleAddContext = useCallback(async () => {
    if (!addContextForm.key.trim() || !addContextForm.text.trim()) return;

    setIsAddingContext(true);
    try {
      await addContext({
        title: addContextForm.key.trim(),
        text: addContextForm.text.trim(),
      });
      setAddContextForm({ key: "", text: "" });
    } catch (error) {
      console.error("Error adding context:", error);
    } finally {
      setIsAddingContext(false);
    }
  }, [addContext, addContextForm]);

  // Handle sending message
  const onSendClicked = useCallback(() => {
    if (!prompt.trim()) return;

    if (!threadId) {
      toast({
        title: "Thread ID is not set",
        description: "Please create a thread first",
      });
      return;
    }
    setPrompt("");
    sendMessage({
      threadId,
      prompt: prompt.trim(),
    }).catch((error) => {
      setError(error);
      console.error("Error sending message:", error);
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
    <div className="h-full flex flex-col">
      <div className="relative h-full flex flex-row bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex-1 min-h-0">
        <SidebarRail />
        {/* Sidebar - Chat History */}
        <Sidebar>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-sm flex flex-col shadow-lg z-40">
            <div className="p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Chat History</h2>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  void createThread({ title: "New Chat" }).then((id) => {
                    setThreadId(id);
                    try {
                      (window as any).history.pushState(null, "", `/rag-basic/${id}`);
                    } catch {}
                  });
                }}
                aria-label="New Chat"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Chat</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ul className="p-2 space-y-1">
                {activeThreads.map((t) => (
                  <li key={t._id}>
                    <div
                      className={
                        "group w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm transition " +
                        (threadId === t._id
                          ? "bg-slate-100 text-slate-900"
                          : "bg-white hover:bg-slate-50 text-slate-800")
                      }
                    >
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => {
                          setThreadId(t._id);
                          navigate(`/rag-basic/${t._id}`);
                        }}
                        title={t.title || "Untitled"}
                      >
                        {editingId === t._id ? (
                          <div className="flex items-center gap-2">
                            <Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="h-8" />
                            <Button
                              size="sm"
                              onClick={() => {
                                const title = editingTitle.trim();
                                if (!title) return setEditingId(null);
                                void renameThreadMutation({ threadId: t._id, title }).then(() => setEditingId(null));
                              }}
                              aria-label="Save"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} aria-label="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="truncate font-medium">{t.title || "Untitled"}</div>
                            {t.summary && <div className="truncate text-xs text-slate-500">{t.summary}</div>}
                          </>
                        )}
                      </button>
                      {editingId !== t._id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(t._id);
                              setEditingTitle(t.title || "");
                            }}
                            aria-label="Rename"
                            title="Rename"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              void archiveThreadMutation({ threadId: t._id }).then(() => {
                                if (threadId === t._id) {
                                  setThreadId(undefined);
                                  try {
                                    (window as any).history.replaceState(null, "", "/rag-basic");
                                  } catch {}
                                }
                              });
                            }}
                            aria-label="Delete"
                            title="Delete"
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
                    <div className="text-xs text-slate-500 px-3 py-2">No chats yet</div>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </Sidebar>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 h-full min-h-0">
          <Card className="w-full max-w-2xl h-full min-h-0 flex flex-col justify-end">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-sm">R</div>
                <span className="flex-1">RAG Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 h-full min-h-0 justify-end">
              {listMessages.results && listMessages.results.length > 0 && (
                <div className="flex flex-col gap-4 overflow-y-auto mb-2 flex-1 min-h-0 pr-2">
                  {listMessages.results.map(
                    (message) =>
                      message.text && (
                        <div key={message._id} className="space-y-2">
                          {/* Message */}
                          <div className={`flex items-end gap-2 ${message.message?.role === "user" ? "justify-end" : "justify-start"}`}>
                            {message.message?.role !== "user" && (
                              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold shadow-sm">AI</div>
                            )}
                            <div className={`rounded-2xl px-4 py-2 max-w-lg whitespace-pre-wrap shadow ${message.message?.role === "user" ? "bg-indigo-900 text-white" : "bg-slate-50 text-slate-900"}`}>
                              <MessageText text={message.text} streaming={message.streaming} invert={message.message?.role === "user"} />
                            </div>
                            {message.message?.role === "user" && (
                              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">U</div>
                            )}
                          </div>

                          {/* Context Section (expandable) - shown after user message */}
                          {message.contextUsed && message.message?.role === "user" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg">
                              <button
                                onClick={() => toggleContextExpansion(message._id)}
                                className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-t-lg flex items-center justify-between"
                              >
                                <span>
                                  Context Used ({message.contextUsed.results.length} results)
                                </span>
                                <span className="text-slate-400">{expandedContexts.has(message._id) ? "−" : "+"}</span>
                              </button>
                              {expandedContexts.has(message._id) && (
                                <div className="px-4 pb-4 space-y-2">
                                  {message.contextUsed.results.map((result, index) => (
                                    <div key={index} className="bg-white border border-slate-200 rounded p-3 shadow-sm">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs font-medium text-slate-600">
                                          Entry:{" "}
                                          {message.contextUsed!.entries.find((e) => e.entryId === result.entryId)?.key || "Unknown"}
                                        </div>
                                        <div className="text-xs text-slate-500">Score: {result.score.toFixed(3)} | Order: {result.order}</div>
                                      </div>
                                      <div className="text-sm text-slate-800 space-y-1">
                                        {result.content.map((content, contentIndex) => (
                                          <div key={contentIndex}>{content.text}</div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ),
                  )}
                </div>
              )}
              <form
                className="flex gap-2 items-center pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSendClicked();
                }}
              >
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask using the added context…"
                  className="flex-1"
                />
                <Button type="submit" disabled={!prompt.trim() || !threadId}>Send</Button>
                <Button
                  variant="secondary"
                  title="Start over"
                  onClick={() => {
                    void createThread({ title: "RAG Thread" }).then((id) => {
                      setThreadId(id);
                      try {
                        (window as any).history.pushState(null, "", `/rag-basic/${id}`);
                      } catch {}
                    });
                  }}
                >
                  Start over
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Middle Panel - Entry Chunks */}
        {selectedEntry && (
          <div className="fixed inset-y-0 left-[16rem] right-[20rem] bg-white/80 backdrop-blur-sm flex flex-col shadow-lg z-30">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Entry Chunks</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Close chunks panel"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {globalDocuments.results?.find((e) => e.entryId === selectedEntry)?.key || "Selected entry"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {documentChunks.results && documentChunks.results.length > 0 ? (
                <div className="p-4 space-y-3">
                  {documentChunks.results.map((chunk) => (
                    <div key={selectedEntry + "-chunk-" + chunk.order} className="space-y-2">
                      <div className="text-sm font-medium text-slate-500">Chunk {chunk.order}</div>
                      <div className="bg-slate-50 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-slate-800 leading-relaxed">{chunk.text}</div>
                      </div>
                    </div>
                  ))}
                  {documentChunks.status === "CanLoadMore" && (
                    <button
                      onClick={() => documentChunks.loadMore(10)}
                      className="w-full py-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      Load More Chunks
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-500">
                    {documentChunks.status === "LoadingFirstPage" ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
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
          <div className="fixed inset-y-0 right-0 w-80 bg-white/80 backdrop-blur-sm flex flex-col shadow-lg z-40">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Context</h2>
            </div>
            <div className="px-4 space-y-3 w-full">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <Input value={addContextForm.key} onChange={(e) => setAddContextForm((prev) => ({ ...prev, key: e.target.value }))} placeholder="Enter context title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
                <Textarea value={addContextForm.text} onChange={(e) => setAddContextForm((prev) => ({ ...prev, text: e.target.value }))} rows={4} placeholder="Enter context body" />
              </div>
              <Button onClick={() => void handleAddContext()} disabled={isAddingContext || !addContextForm.key.trim() || !addContextForm.text.trim()} className="w-full">
                {isAddingContext ? "Adding..." : "Add Context"}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4">
                <h3 className="mb-3 font-medium text-slate-900">Context Entries</h3>
                <div className="space-y-2">
                  {globalDocuments.results?.map((entry) => (
                    <div
                      key={entry.entryId}
                      className={`p-3 rounded-md transition-colors cursor-pointer shadow-sm ${selectedEntry === entry.entryId ? "bg-indigo-50" : "bg-slate-50 hover:bg-slate-100"}`}
                      onClick={() => setSelectedEntry(entry.entryId)}
                    >
                      <div className="text-sm font-medium text-slate-900 truncate">{entry.title || entry.key}</div>
                      <div className="text-xs text-slate-500 mt-1">Status: {entry.status}</div>
                    </div>
                  ))}
                  {globalDocuments.results?.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">No context entries yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => setShowContextPanel((v) => !v)}
            aria-label={showContextPanel ? "Hide context panel" : "Show context panel"}
            className={`pointer-events-auto fixed ${showContextPanel ? "right-[21rem]" : "right-3"} top-3 z-[60] shadow`}
            title={showContextPanel ? "Hide context" : "Show context"}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error && <div className="text-red-500 text-center">{error.message}</div>}
    </div>
  );
}

function MessageText({ text, streaming, invert }: { text: string; streaming?: boolean; invert?: boolean }) {
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
