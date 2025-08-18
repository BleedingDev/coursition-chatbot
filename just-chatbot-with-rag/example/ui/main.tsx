import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import ChatBasic from "./chat/ChatBasic";
import ChatStreaming from "./chat/ChatStreaming";
import FilesImages from "./files/FilesImages";
import RateLimiting from "./rate_limiting/RateLimiting";
import { WeatherFashion } from "./workflows/WeatherFashion";
import RagBasic from "./rag/RagBasic";
import { useEffect } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
);

export function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        {/* Header removed per request */}
        <main className="flex-1 h-full overflow-scroll">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path=":threadId" element={<RagBasic />} />
            {/* Keep other examples reachable if directly navigated */}
            <Route path="/chat-basic" element={<ChatBasic />} />
            <Route path="/chat-streaming" element={<ChatStreaming />} />
            <Route path="/files-images" element={<FilesImages />} />
            <Route path="/rate-limiting" element={<RateLimiting />} />
            <Route path="/weather-fashion" element={<WeatherFashion />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const navigate = useNavigate();
  const createThread = useMutation(api.threads.createNewThread);
  const threads = usePaginatedQuery(api.threads.listThreads, {}, { initialNumItems: 1 });

  useEffect(() => {
    const active = (threads.results ?? []).filter((t) => t.status === "active");
    if (active.length > 0) {
      navigate(`/${active[0]._id}`, { replace: true });
      return;
    }
    // If no active thread yet and initial page loaded, create one
    if (threads.status !== "LoadingFirstPage") {
      void createThread({ title: "RAG Thread" }).then((id) => {
        navigate(`/${id}`, { replace: true });
      });
    }
  }, [threads.results, threads.status, navigate, createThread]);

  return null;
}
