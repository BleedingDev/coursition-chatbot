import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AddContextFormProps = {
  addContextForm: { key: string; text: string };
  setAddContextForm: React.Dispatch<
    React.SetStateAction<{ key: string; text: string }>
  >;
  handleAddContext: () => Promise<void>;
  isAddingContext: boolean;
};

export function AddContextForm({
  addContextForm,
  setAddContextForm,
  handleAddContext,
  isAddingContext,
}: AddContextFormProps) {
  return (
    <section
      aria-label="Add new context form"
      className="border-gray-200/50 border-b p-4 dark:border-gray-700/50"
    >
      <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
        Add New Context
      </h3>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddContext();
        }}
      >
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
            htmlFor="context-key"
          >
            Key
          </label>
          <Input
            aria-describedby="context-key-help"
            className="w-full border-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 dark:border-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"
            id="context-key"
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, key: e.target.value }))
            }
            placeholder="Enter context key..."
            value={addContextForm.key}
          />
          <div className="sr-only" id="context-key-help">
            Enter a descriptive key for your context entry
          </div>
        </div>
        <div>
          <label
            className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
            htmlFor="context-text"
          >
            Text
          </label>
          <textarea
            aria-describedby="context-text-help"
            className="h-24 w-full resize-none rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 text-sm placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"
            id="context-text"
            onChange={(e) =>
              setAddContextForm((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter context text..."
            value={addContextForm.text}
          />
          <div className="sr-only" id="context-text-help">
            Enter the context information that the AI will use to answer
            questions
          </div>
        </div>
        <Button
          aria-label={
            isAddingContext ? 'Adding context...' : 'Add context entry'
          }
          className="w-full"
          colorScheme="purple"
          disabled={
            !(addContextForm.key.trim() && addContextForm.text.trim()) ||
            isAddingContext
          }
          type="submit"
        >
          {isAddingContext ? (
            <>
              <Loader className="mr-2" size={16} />
              Adding...
            </>
          ) : (
            'Add Context'
          )}
        </Button>
      </form>
    </section>
  );
}
