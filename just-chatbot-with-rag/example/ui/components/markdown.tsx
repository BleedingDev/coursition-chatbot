import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

// Lightweight Markdown renderer styled with Tailwind Typography.
// Accepts `invert` to render readable text on dark backgrounds.

const baseComponents: Partial<Components> = {
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code className="rounded bg-slate-100 dark:bg-slate-700/70 px-1 py-0.5 text-[0.9em]" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-950 text-slate-100 p-3 text-sm" {...props}>
        <code>{children}</code>
      </pre>
    );
  },
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 my-2 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>{children}</ol>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>{children}</strong>
  ),
};

type MarkdownProps = { children: string; invert?: boolean };

const NonMemoizedMarkdown = ({ children, invert }: MarkdownProps) => {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const effectiveInvert = invert || isDark;
  const a = ({ children, ...props }: any) => (
    <a
      className={effectiveInvert ? "text-indigo-200 underline-offset-4 hover:underline" : "text-indigo-900 underline-offset-4 hover:underline"}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
  const components: Partial<Components> = { ...baseComponents, a };

  return (
    <div className={`prose ${effectiveInvert ? "prose-invert" : "prose-slate"} prose-p:my-2 prose-pre:my-2 max-w-none`}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(NonMemoizedMarkdown, (prev, next) => prev.children === next.children && prev.invert === next.invert);
