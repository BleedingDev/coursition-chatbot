import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

// Lightweight Markdown renderer styled with Tailwind Typography.
// Accepts `invert` to render readable text on dark backgrounds.

const baseComponents: Partial<Components> = {
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] dark:bg-slate-700/70"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-slate-100 text-sm"
        {...props}
      >
        <code>{children}</code>
      </pre>
    );
  },
};

type MarkdownProps = { children: string; invert?: boolean };

const NonMemoizedMarkdown = ({ children, invert }: MarkdownProps) => {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');
  const effectiveInvert = invert || isDark;
  const a = ({ children, ...props }: any) => (
    <a
      className={
        effectiveInvert
          ? 'text-indigo-200 underline-offset-4 hover:underline'
          : 'text-indigo-900 underline-offset-4 hover:underline'
      }
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
  const components: Partial<Components> = { ...baseComponents, a };

  return (
    <div
      className={
        `prose ${effectiveInvert ? 'prose-invert' : 'prose-slate'} max-w-none` +
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
