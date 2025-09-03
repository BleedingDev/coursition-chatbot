import type { EntryId } from '@convex-dev/rag';
import { Cross } from 'lucide-react';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';

type DocumentEntry = {
  entryId: EntryId;
  title?: string;
  key: string;
  status: string;
};

type DocumentChunk = {
  order: number;
  text: string;
};

type PaginatedDocuments = {
  results?: DocumentEntry[];
  status?: string;
  loadMore?: (numItems: number) => void;
};

type PaginatedChunks = {
  results?: DocumentChunk[];
  status?: string;
  loadMore?: (numItems: number) => void;
};

type EntryChunksPanelProps = {
  selectedEntry: EntryId | null;
  setSelectedEntry: (entryId: EntryId | null) => void;
  globalDocuments: PaginatedDocuments;
  documentChunks: PaginatedChunks;
};

export function EntryChunksPanel({
  selectedEntry,
  setSelectedEntry,
  globalDocuments,
  documentChunks,
}: EntryChunksPanelProps) {
  if (!selectedEntry) {
    return null;
  }

  return (
    <aside
      aria-label="Entry chunks panel"
      className="fixed inset-y-0 right-80 left-64 z-30 hidden flex-col border-gray-200/50 border-l bg-white/95 shadow-xl backdrop-blur-md xl:flex dark:border-gray-700/50 dark:bg-gray-900/95"
    >
      <div className="border-gray-200/50 border-b p-4 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
            Entry Chunks
          </h2>
          <Button
            aria-label="Close entry chunks panel"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSelectedEntry(null)}
            size="icon"
            title="Close chunks panel"
            type="button"
            variant="ghost"
          >
            <Cross aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <p className="mt-1 text-gray-700 text-sm dark:text-gray-300">
          {globalDocuments.results?.find((e) => e.entryId === selectedEntry)
            ?.key || 'Selected entry'}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {documentChunks.results && documentChunks.results.length > 0 ? (
          <div className="space-y-3 p-4">
            {documentChunks.results.map((chunk) => (
              <div
                className="space-y-2"
                key={`${selectedEntry}-chunk-${chunk.order}`}
              >
                <div className="font-medium text-gray-600 text-sm dark:text-gray-300">
                  Chunk {chunk.order}
                </div>
                <div className="rounded-lg bg-gray-50 p-4 shadow-xs dark:bg-gray-800">
                  <div className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">
                    {chunk.text}
                  </div>
                </div>
              </div>
            ))}
            {documentChunks.status === 'CanLoadMore' && (
              <Button
                aria-label="Load more document chunks"
                className="w-full"
                onClick={() => documentChunks.loadMore(10)}
                size="lg"
                type="button"
                variant="outline"
              >
                Load More Chunks
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-600 dark:text-gray-300">
              {documentChunks.status === 'LoadingFirstPage' ? (
                <>
                  <Loader className="mx-auto mb-2" size={32} />
                  <p>Loading chunks...</p>
                </>
              ) : (
                <p>No chunks found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
