import type { EntryId } from '@convex-dev/rag';
import { ChevronLeft, Cross } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddContextForm } from './add-context-form';

type DocumentEntry = {
  entryId: EntryId;
  title?: string;
  key: string;
  status: string;
};

type PaginatedDocuments = {
  results?: DocumentEntry[];
  status?: string;
  loadMore?: (numItems: number) => void;
};

type ContextPanelProps = {
  showContextPanel: boolean;
  setShowContextPanel: (show: boolean) => void;
  addContextForm: { key: string; text: string };
  setAddContextForm: React.Dispatch<
    React.SetStateAction<{ key: string; text: string }>
  >;
  isAddingContext: boolean;
  handleAddContext: () => Promise<void>;
  globalDocuments: PaginatedDocuments;
  selectedEntry: EntryId | null;
  setSelectedEntry: (entryId: EntryId | null) => void;
};

export function ContextPanel({
  showContextPanel,
  setShowContextPanel,
  addContextForm,
  setAddContextForm,
  isAddingContext,
  handleAddContext,
  globalDocuments,
  selectedEntry,
  setSelectedEntry,
}: ContextPanelProps) {
  return (
    <>
      {/* Collapsed State - Arrow Toggle */}
      {!showContextPanel && (
        <div className="-translate-y-1/2 fixed z-40 lg:absolute lg:top-3 lg:right-0">
          <Button
            aria-label="Open context panel"
            className="rounded-b-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-green-100 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:border-green-400 dark:hover:bg-green-900/20 dark:hover:shadow-green-900/20"
            onClick={() => setShowContextPanel(true)}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="size-4 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      )}

      {/* Expanded State */}
      {showContextPanel && (
        <aside
          aria-label="Context panel"
          className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-gray-200/50 border-l bg-white/95 shadow-xl backdrop-blur-md lg:relative lg:z-auto dark:border-gray-700/50 dark:bg-gray-900/95"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between border-gray-200/50 border-b p-4 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
              Add Context
            </h2>
            <Button
              aria-label="Close context panel"
              className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowContextPanel(false)}
              size="sm"
              variant="ghost"
            >
              <Cross className="size-4 text-gray-700 dark:text-gray-300" />
            </Button>
          </div>

          {/* Content */}
          <AddContextForm
            addContextForm={addContextForm}
            handleAddContext={handleAddContext}
            isAddingContext={isAddingContext}
            setAddContextForm={setAddContextForm}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                Context Entries
              </h3>
              <div className="space-y-2">
                {globalDocuments.results?.map((entry) => (
                  <Button
                    aria-label={`Select context entry: ${entry.title || entry.key}`}
                    aria-pressed={selectedEntry === entry.entryId}
                    className={`w-full cursor-pointer rounded-md p-3 text-left shadow-xs transition-colors ${
                      selectedEntry === entry.entryId
                        ? 'border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                        : 'border border-transparent bg-gray-50 hover:border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                    }`}
                    key={entry.entryId}
                    onClick={() => setSelectedEntry(entry.entryId)}
                    type="button"
                    variant="ghost"
                  >
                    <div className="truncate font-medium text-gray-900 text-sm dark:text-gray-100">
                      {entry.title || entry.key}
                    </div>
                    <div className="mt-1 text-gray-600 text-xs dark:text-gray-300">
                      Status: {entry.status}
                    </div>
                  </Button>
                ))}
                {globalDocuments.results?.length === 0 && (
                  <div className="py-4 text-center text-gray-600 text-sm dark:text-gray-300">
                    No context entries yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
