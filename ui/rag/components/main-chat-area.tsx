import { Menu, Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, ConversationContent } from '@/components/conversation';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/prompt-input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../../components/theme-toggle';
import { ChatMessage } from './chat-message';

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

type PaginatedMessages = {
  results?: MessageWithContext[];
  status?: string;
  loadMore?: (numItems: number) => void;
};

type MainChatAreaProps = {
  listMessages: PaginatedMessages;
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

export function MainChatArea({
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

      {/* Chat Messages Area - Using AI Elements */}
      <Conversation className="mt-8">
        {listMessages.results && listMessages.results.length > 0 ? (
          <ConversationContent className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
            {listMessages.results.map((message) => (
              <ChatMessage
                expandedContexts={expandedContexts}
                key={message._id}
                message={message}
                toggleContextExpansion={toggleContextExpansion}
              />
            ))}
          </ConversationContent>
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
      </Conversation>

      {/* Chat Input Area - Using AI Elements */}
      <div className="border-gray-200 border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <PromptInput
            aria-label="Chat message form"
            onSubmit={(e) => {
              e.preventDefault();
              onSendClicked();
            }}
          >
            <PromptInputTextarea
              aria-describedby="chat-input-help"
              className="bg-gray-50 text-base text-gray-950 placeholder-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-300"
              id="chat-input"
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything from the lectures..."
              value={prompt}
            />
            <div className="sr-only" id="chat-input-help">
              Type your question or message here. The AI will respond using the
              context you've provided.
            </div>
            <PromptInputSubmit
              aria-label="Send message"
              disabled={!(prompt.trim() && threadId)}
            />
          </PromptInput>
        </div>
      </div>
    </main>
  );
}
