import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

type MarkdownProps = { children: string; invert?: boolean };

const NonMemoizedMarkdown = ({ children, invert }: MarkdownProps) => {
  const effectiveInvert = Boolean(invert);
  const a = ({ children: aChildren, ...props }: React.ComponentProps<'a'>) => (
    // biome-ignore lint/nursery/useAnchorHref: Problem with react-markdown types.
    <a
      className={
        effectiveInvert
          ? 'text-indigo-200 underline-offset-4 hover:underline'
          : 'text-indigo-900 underline-offset-4 hover:underline dark:text-indigo-200'
      }
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {aChildren}
    </a>
  );
  const components: Partial<Components> = { a };

  const proseMode = effectiveInvert
    ? 'prose-invert'
    : 'prose-slate dark:prose-invert';

  return (
    <div
      className={
        `prose ${proseMode} max-w-none` +
        [
          // Tighten vertical rhythm
          'prose-p:my-1 prose-p:leading-relaxed',
          'prose-headings:my-1',
          'prose-li:my-0 prose-ol:my-1 prose-ul:my-1',
          'prose-pre:my-2',
          'prose-code:my-0',
          'prose-blockquote:my-2',
          'prose-hr:my-2',
          'prose-img:my-2',
          // Remove outer margins within chat bubbles
          'first:prose-p:mt-0 last:prose-p:mb-0',
          'first:prose-ul:mt-0 last:prose-ul:mb-0',
          'first:prose-ol:mt-0 last:prose-ol:mb-0',
          'first:prose-pre:mt-0 last:prose-pre:mb-0',
          'first:prose-blockquote:mt-0 last:prose-blockquote:mb-0',
          'first:prose-headings:mt-0 last:prose-headings:mb-0',
        ].join(' ')
      }
    >
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prev, next) => prev.children === next.children && prev.invert === next.invert
);
