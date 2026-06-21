# AChat

MVP scaffold for a family messenger with:

- React 18 + TypeScript + Vite
- TailwindCSS
- Zustand + React Query
- Supabase-ready client setup
- PWA manifest and offline queue foundation
- AES-256-GCM crypto utilities

## Structure

```text
src/
  app/
  pages/
  features/
  entities/
  shared/
  widgets/
supabase/
```

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
```

If these values are left empty, the app now falls back to local-only mode instead of crashing on startup. For realtime Supabase features on GitHub Pages, add both variables in the build environment used by your deployment workflow.

## Included MVP pieces

- Chat list, chat room, family page, settings page
- Zustand stores for auth/chat/messages/ui
- Offline queue and message cache via IndexedDB
- Supabase schema draft with RLS and TTL cleanup function
- Unit tests for crypto helpers

## Notes

- Current UI uses demo data so the app can be reviewed before backend wiring.
- Real E2EE message send/receive flow still needs key exchange and Supabase persistence integration.
