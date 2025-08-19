# Repository Guidelines

## Scope & Goal
- Objective: migrate the beautiful UI from `ui-chatbot-template/` into the example app at `lms-chatbot-with-rag/example` without changing Convex agent logic. Use `chat-example.jpeg` as the visual target.
- Constraint: do not modify library logic under `lms-chatbot-with-rag/src` (e.g., `mapping.ts`, `validators.ts`, `shared.ts`, `component/*`). All work happens in the example UI.

## Project Structure & Module Organization
- Work here: `lms-chatbot-with-rag/example/`
  - Entry: `index.html` → `ui/main.tsx` (Vite + React Router).
  - Views: `ui/rag/*`, `ui/workflows/*`, `ui/files/*`, shared UI in `ui/components/*` and `ui/index.css`.
  - Backend (Convex): `example/convex/*` (do not change function contracts).
- Reference only: `ui-chatbot-template/` for UI patterns, Tailwind classes, and components. Do not modify or commit changes there.

## Build, Test, and Development Commands
- Run example: `cd lms-chatbot-with-rag/example && npm run dev` (starts Vite + Convex). From package root: `cd lms-chatbot-with-rag && npm run example`.
- Library build/tests (when needed): `cd lms-chatbot-with-rag && npm run build && npm test`.
- Lint example: `cd lms-chatbot-with-rag/example && npm run lint`.

## Coding Style & Naming Conventions
- TypeScript + React + Tailwind in the example; Prettier/ESLint configured. Follow existing Tailwind tokens in `ui/index.css` and `tailwind.config.js`.
- Naming: `kebab-case` files/dirs; `PascalCase` components; `camelCase` vars/functions.
- Prefer presentational components under `example/ui/components/` and keep imports from `@convex-dev/agent/react` unchanged.

## Testing Guidelines
- Unit (library): Vitest; keep tests near source (e.g., `mapping.test.ts`).
- Example verification: manual UI check. Ensure screens match `chat-example.jpeg`; include screenshots in PRs. Keep behavior identical (messages, actions, file uploads, RAG flows).

## UI Migration Rules
- Do not change imports or props from `@convex-dev/agent/react` and existing Convex endpoints.
- You may refactor JSX/layout/styles in `example/ui/**`; add small, co‑located components and Tailwind utilities as needed.
- If an adapter is necessary, wrap components locally instead of altering library code.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat(ui):`, `fix(ui):`).
- PRs: focused on `example/ui/**`; link issues, attach before/after screenshots, list any new components/utilities, and confirm lint/build pass.
