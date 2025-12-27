# Migration Plan: Monorepo Packages

This document outlines the steps to migrate the repository to a packages-based monorepo.

1. Goal
   - Create `packages/app`, `packages/legacy`, `packages/shared` and migrate code incrementally.

2. High-level steps
   - Scaffold packages (done).
   - Move files one package at a time and update imports.
   - Extract shared types and constants into `packages/shared`.
   - Add per-package `package.json` and `tsconfig.json`.
   - Add CI and EAS/dev-client as needed.

3. Notes
   - Temporary stubs live in root `components/` — keep a mapping file here before removal.
   - Keep `legacy` and `app-example` excluded from root `tsconfig.json` until migrated.

4. Quick commands
   - Start app (current setup):
     ```bash
     npm install
     npx expo start
     ```

5. Next manual steps
   - Move `app` into `packages/app` (or update imports to point to `app/`), then test start.
   - Move `legacy/ElaraFriendship` into `packages/legacy` when ready.
