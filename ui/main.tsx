import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { api } from '../convex/_generated/api';
import RagBasic from './rag/rag-basic';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);

export function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col">
        {/* Header removed per request */}
        <main className="h-full flex-1 overflow-scroll">
          <Routes>
            <Route element={<RootRedirect />} path="/" />
            <Route element={<RagBasic />} path=":threadId" />
          </Routes>
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const navigate = useNavigate();
  const createThread = useMutation(api.threads.createNewThread);
  const threads = usePaginatedQuery(
    api.threads.listThreads,
    {},
    { initialNumItems: 1 }
  );

  useEffect(() => {
    const active = (threads.results ?? []).filter((t) => t.status === 'active');
    if (active.length > 0) {
      navigate(`/${active[0]._id}`, { replace: true });
      return;
    }
    // If no active thread yet and initial page loaded, create one
    if (threads.status !== 'LoadingFirstPage') {
      createThread({ title: 'RAG Thread' })
        .then((id) => {
          navigate(`/${id}`, { replace: true });
        })
        .catch(() => {
          console.error('Error creating thread');
        });
    }
  }, [threads.results, threads.status, navigate, createThread]);

  // Show loading state while checking threads
  if (threads.status === 'LoadingFirstPage') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 shadow-lg dark:from-gray-800 dark:to-gray-700">
            <div className="size-8 animate-spin rounded-full border-gray-400 border-t-transparent border-b-2" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
