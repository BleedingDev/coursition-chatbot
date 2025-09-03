import {
  Copy,
  RotateCcw,
  Share,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Action, Actions } from '@/components/actions';
import { Message, MessageContent } from '@/components/message';
import { Response } from '@/components/response';
import { Sources, SourcesContent, SourcesTrigger } from '@/components/sources';
import { ContextResult } from './context-result';

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

type ChatMessageProps = {
  message: MessageWithContext;
  expandedContexts: Set<string>;
  toggleContextExpansion: (messageId: string) => void;
};

export function ChatMessage({
  message,
  expandedContexts,
  toggleContextExpansion,
}: ChatMessageProps) {
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
              <Sources>
                <SourcesTrigger
                  aria-expanded={expandedContexts.has(message._id)}
                  aria-label={`${expandedContexts.has(message._id) ? 'Hide' : 'Show'} context used in this message`}
                  count={message.contextUsed.length}
                  onClick={() => toggleContextExpansion(message._id)}
                >
                  <Zap aria-hidden="true" className="size-3" />
                  Context Used ({message.contextUsed.length})
                </SourcesTrigger>

                {expandedContexts.has(message._id) && (
                  <SourcesContent>
                    {message.contextUsed.map((context, index) => (
                      <ContextResult
                        context={context}
                        isUser={isUser}
                        key={`${context.key}-${index}`}
                      />
                    ))}
                  </SourcesContent>
                )}
              </Sources>
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
                toast.success('Message copied to clipboard');
              }}
              tooltip="Copy message"
            >
              <Copy className="size-3" />
            </Action>

            {!isUser && (
              <>
                <Action
                  onClick={() => {
                    toast.success('Message marked as helpful');
                  }}
                  tooltip="Like message"
                >
                  <ThumbsUp className="size-3" />
                </Action>

                <Action
                  onClick={() => {
                    toast.error('Message marked as unhelpful');
                  }}
                  tooltip="Dislike message"
                >
                  <ThumbsDown className="size-3" />
                </Action>

                <Action
                  onClick={() => {
                    toast.info('Generating new response');
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
                  toast.success('Message copied to clipboard');
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
