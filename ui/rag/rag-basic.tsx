import {
  optimisticallySendMessage,
  useThreadMessages,
} from '@convex-dev/agent/react';
import type { EntryId } from '@convex-dev/rag';
import { useAction, useMutation, usePaginatedQuery } from 'convex/react';
import { Menu } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../convex/_generated/api';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { SidebarProvider } from '../components/ui/sidebar';
import { ChatSidebar } from './components/chat-sidebar';
import { ContextPanel } from './components/context-panel';
import { EntryChunksPanel } from './components/entry-chunks-panel';
import { MainChatArea } from './components/main-chat-area';

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
      toast.success('Your context has been added successfully');
    } catch (err) {
      console.error('Failed to add context:', err);
      toast.error('Failed to add context. Please try again.');
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
          listMessages={listMessages}
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
          documentChunks={documentChunks}
          globalDocuments={globalDocuments}
          selectedEntry={selectedEntry}
          setSelectedEntry={setSelectedEntry}
        />

        <ContextPanel
          addContextForm={addContextForm}
          globalDocuments={globalDocuments}
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
