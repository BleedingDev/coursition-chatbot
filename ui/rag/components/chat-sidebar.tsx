import { Edit, Mail, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ThreadItem = {
  _id: string;
  title?: string;
  summary?: string;
  status: string;
  _creationTime: number;
  userId?: string;
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

export function ChatSidebar({
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
  return (
    <aside
      aria-label="Chat sidebar"
      className={`fixed left-0 z-40 flex w-64 flex-col border-gray-200/50 border-r bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out dark:border-gray-700/50 dark:bg-gray-900/95 ${
        showLeftSidebar 
          ? 'translate-x-0 top-16 bottom-0 pt-6 opacity-100 h-[calc(100vh-4rem)]' 
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >

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
        <div className="space-y-1">
          {activeThreads.map((thread) => (
            <button
              aria-label={`Select chat: ${thread.title || 'Untitled Chat'}`}
              aria-pressed={threadId === thread._id}
              className={`group relative w-full cursor-pointer rounded-none p-4 transition-colors ${
                threadId === thread._id
                  ? 'border-r-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-r-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'
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
