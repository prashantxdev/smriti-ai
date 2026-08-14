# Smriti AI — Memory Companion

"AI That Remembers What Matters." A warm, accessible memory companion for people with memory difficulties and their caregivers, with vision, semantic memory search, and a conversational assistant.

Given the size of the spec, this ships in phases. Each phase leaves a working, demo-able app.

## Phase 1 — Brand, design system, public site

- Design system in `src/styles.css`: navy `#172554`, indigo `#4F46E5`, purple `#7C3AED`, soft blue `#38BDF8`, teal `#14B8A6`, background `#F8FAFC`, plus the dark theme (`#0F172A` / `#1E293B` / `#818CF8` / `#2DD4BF`). Rounded cards, soft shadows, generous spacing, no generic-chatbot look.
- Uploaded logo wired in as a CDN asset (header, footer, auth, About).
- Landing page at `/` with hero, the SEE → UNDERSTAND → REMEMBER → CONNECT loop, an animated "person recognized" visual, feature sections, accessibility/privacy sections, footer with tagline and disclaimer.
- `/about`, `/privacy`, `/terms`, each with its own SEO metadata.
- Light/dark mode toggle, accessibility toggles (large text, high contrast) persisted locally.

## Phase 2 — Backend, auth, onboarding

- Enable Lovable Cloud (database, auth, storage, secrets).
- Tables: `profiles`, `user_roles` (separate roles table), `people`, `memories`, `memory_people`, `places`, `objects`, `conversations`, `messages`, `caregivers`, `caregiver_permissions`, `notifications`, `memory_embeddings` (pgvector).
- Row-level security everywhere: an owner sees only their own rows; a caregiver sees a patient's rows only through an accepted link plus the matching granted permission, checked by a security-definer function.
- Auth at `/auth`: email/password plus Google, forgot password and `/reset-password`, sign-out, profile auto-created on signup.
- Onboarding flow (5 steps, optional steps skippable).
- Seeded demo data for the signed-in user — Rahul/Anita/Rajesh, five memories, four objects, four places — clearly flagged as demo and removable in Settings.

## Phase 3 — App shell and core surfaces

- App shell under an authenticated layout: desktop sidebar, mobile bottom nav (Home, Memories, Camera, Ask, Profile), header with notifications badge and profile menu.
- Dashboard: greeting, four action cards, stats (memories, people, places, conversations), Today's Memories, Recent People, Recent Conversations, Important Memories, Caregiver Updates.
- Memories: list/grid, filters by type and importance, create/edit/delete with image upload, memory detail with related people/objects, search bar.
- People, Places, Objects: cards, detail views, full create/edit/delete with photos.
- Reusable components as listed in the spec (MemoryCard, PersonCard, StatsCard, EmptyState, ErrorState, LoadingState, VoiceButton, etc.), each with beautiful empty and error states.

## Phase 4 — AI layer

- Modular service layer `src/services/ai/` (`llm`, `vision`, `embeddings`, `speech`, `memory`) with a provider-agnostic interface, so a different provider or Qdrant can be swapped in later.
- Real AI runs through Lovable AI on the server; keys never touch the browser. A Demo Mode fallback returns realistic canned results so nothing crashes when AI is unavailable.
- Memory write path: memory saved → text representation → embedding → stored for semantic search.
- Ask path: question → query embedding → semantic search over memories/people → context → LLM answer.
- AI Companion page: warm chat UI, text/voice/image input, streaming answers, conversation history saved per thread.
- Vision page "See With Smriti": camera preview, capture, upload, modes for person/object/scene, result card with confidence, relationship, related memory, and low-confidence handling with Add Person / Try Again.
- Voice: speech-to-text input and text-to-speech playback with play/pause.

## Phase 5 — Caregivers, notifications, settings

- Caregiver invite flow and a caregiver dashboard: patient overview, recent activity, important memories, people, places, alerts, memory management.
- Granular permissions (view/add/edit/delete memories, manage people, view activity) enforced in the database, not just the UI.
- Notifications with badges and a notifications page.
- Settings: account, privacy, caregivers, notifications, accessibility, AI preferences (including the Demo/Production toggle), voice, appearance, security; export data, delete memories, delete account.
- Human-centered charts on the caregiver dashboard (memory activity, conversation frequency, categories).

## Technical notes

- Stack is the project's existing TanStack Start + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Lucide setup. All server work uses server functions; no separate edge functions.
- Embeddings stored in a pgvector column with an HNSW index; search runs through a database function so a swap to Qdrant is a service-layer change only.
- Every AI/data call has loading, success, error and retry states; the disclaimer that Smriti AI is assistive, not medical, appears in the footer, About, Privacy and Settings.
- No medical diagnosis features. The name "Masthishq" appears nowhere.
