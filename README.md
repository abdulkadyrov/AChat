# AChat

A responsive family-messenger PWA built with React, TypeScript, Zustand, React Query and a Supabase-ready data layer.

## Implemented

- Chat list with local encrypted-preview search, unread states, skeletons, empty/error/offline states
- Responsive chat room with mobile and desktop split layouts
- Text, image, voice and file messages; replies; date dividers; delivery states
- Long-press, context-menu and keyboard message actions
- Copy, reply, forward, delete locally and delete for everyone with confirmation
- Image preview/fullscreen view, attachment picker and voice-recording preview
- Family member roles/statuses, member management and key-rotation warning
- Functional invite tokens, access codes, QR generation, sharing and code rotation
- Per-chat auto-delete periods: 24 hours, 7, 30 or 90 days
- Profile, account sessions, privacy, notification, chat, language and theme settings
- System/light/dark themes applied before the first React render
- PWA manifest, install icons, service worker precache and IndexedDB outbox foundation
- Supabase schema with RLS, authorization helpers, invite validation, indexes and Realtime publication

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Without Supabase environment variables, AChat runs through the local demo repository. Use **Open demo family** on the sign-in screen.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
```

Only a public/publishable frontend key belongs in `VITE_SUPABASE_KEY`. Never expose a `service_role` key in this application.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
# or all at once
npm run check
```

## Architecture

The repository uses feature-based layers:

```text
src/
  app/       application routing and global styles
  pages/     route-level screens
  widgets/   app shell and navigation
  features/  user actions and business flows
  entities/  chat and message presentation
  shared/    UI primitives, stores, repositories and utilities
supabase/    database schema and RLS policies
```

Server data belongs in React Query. Zustand stores session, UI preferences, selected chat and the offline/local queue state. Decrypted message bodies are not persisted to `localStorage`.

## Backend notes

`supabase/schema.sql` is a reviewed schema draft for a fresh Supabase project. Apply it through a migration workflow and run Supabase database advisors before production. A complete production E2EE rollout still requires audited multi-device key exchange, encrypted key backup and key rotation on membership changes; the current client provides the crypto and repository boundaries but is not a substitute for that protocol review.
