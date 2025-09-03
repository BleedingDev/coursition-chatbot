type ContextResultProps = {
  context: { key: string; text: string };
  isUser: boolean;
};

export function ContextResult({ context, isUser }: ContextResultProps) {
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
