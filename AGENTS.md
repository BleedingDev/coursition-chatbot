# Repository Guidelines

## Project Structure & Module Organization
- Entry: `index.html` → `ui/main.tsx` (Vite + React Router).
- Views: `ui/rag/*`, `ui/workflows/*`, `ui/files/*`, shared UI in `ui/components/*` and `ui/index.css`.
- Backend (Convex): `example/convex/*` (do not change function contracts).

## Build, Test, and Development Commands
- Run project: `npm run dev`.
- Lint project: `npm run lint`.

## Coding Style & Naming Conventions
- TypeScript + React + Tailwind in the example; Prettier/ESLint configured. Follow existing Tailwind tokens in `ui/index.css` and `tailwind.config.js`.
- Naming: `kebab-case` files/dirs; `PascalCase` components; `camelCase` vars/functions.
- Prefer presentational components under `ui/components/`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat(ui):`, `fix(ui):`).
- PRs: focused on `example/ui/**`; link issues, attach before/after screenshots, list any new components/utilities, and confirm lint/build pass.
