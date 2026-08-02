# AGENTS.md

## Commands
- `npm run dev` — dev server on port 3000.
- `npm run lint` — **the typecheck** (`tsc --noEmit`). There is no `typecheck` script.
- `npm run build` — production build. There is **no test suite**; CI (`.github/workflows/ci.yml`) runs lint + `npm audit` + build only.
- `npm run seed`, `npm run setup:buckets` — tsx scripts in `scripts/`. Prefer `supabase db push` over the legacy `scripts/apply-*.ts` helpers, which execute raw SQL via the service-role key and bypass migration tracking.

## Supabase CLI — there is NO local stack
- The repo is linked to the **live remote project** `pkdzxqsplfeobhflgmyu`. There is no `supabase/config.toml`, so `supabase start` is not a thing here — `supabase db push` writes straight to the live DB.
- Apply migrations: `supabase db push --include-all` (interactive Y prompt). Status: `supabase migration list`.
- Raw SQL: pipe into `supabase db query --linked` (e.g. `"...sql..." | supabase db query --linked`). The subcommand is `db query` — **`supabase db execute` does not exist** in the installed CLI.
- Deploy edge functions (`supabase/functions/`): `supabase functions deploy <name>`. Edge-function secrets live in the Dashboard, not in `.env`.

## Anonymous-access security model — do not break
This is the core of the recent work; a lot of history lives here. See `src/lib/db.ts`:
- `ADMIN_ONLY_TABLES = {bookings, messages, invoices, clientaccounts}`: anonymous sessions must **never** run `select('*')` on these. RLS has no public read policy, and since 025/027 revoked the anon table grants it now surfaces as HTTP 401 (not an empty list). `getCollectionWithFallback` returns local fallbacks for anon instead of firing the SELECT.
- `ANON_INSERT_TABLES = {messages, bookings}`: anonymous INSERT is allowed only on these, and the payload is rebuilt from a per-table column allow-list (`BOOKING_ANON_INSERT_COLUMNS`, 17 columns) that mirrors the DB column grants (021 bookings; 018 messages = 7 columns). Keep the frontend list and the DB `GRANT INSERT (...)` in sync — they are intentionally duplicated.
- Rule: **gate the frontend before revoking any anon grant.** The anonymous booking/contact forms break with 401/42501 if reads or trigger internals touch a revoked table.
- Rate-limit triggers (`enforce_bookings_rate_limit`, `enforce_messages_rate_limit`, migration 028) are `SECURITY DEFINER` with `SET search_path = public, pg_temp` and gate on `auth.role() = 'anon'`. Do **not** switch that back to `current_user = 'anon'`: inside a definer function `current_user` is the owner (postgres), so the limit would silently stop firing.

## Migrations
- The chain is intentionally non-contiguous: **001–009, then 011–028** (010 was renumbered into 024 and 026). Do not recreate a 010.
- Migrations must be idempotent: `DROP POLICY IF EXISTS` / `DROP TRIGGER IF EXISTS` before each CREATE (learned pushing 014/015 onto an already-lived DB).
- If a migration was already applied remotely, renaming/rewriting the file requires `supabase migration repair --status <applied|reverted> <version> --linked`.
- Never commit `supabase/.temp/` (CLI cache; gitignored).

## Frontend
- React 19 + Vite 6 + Tailwind 4 + Motion. Entry: `src/main.tsx` → `src/App.tsx`; all data flows through `src/lib/db.ts`.
- User-facing strings are inline trilingual: `t(es, en, pt)` — add all three variants for any new string.
- The app is localStorage-first with Supabase sync (works fully offline/demo). Leftover legacy key prefixes survive: `aorea_*`, `aurea_*` in localStorage.

## Env / offline mode
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Without them the app boots in offline/demo mode with a no-op Supabase client and mock data (`src/lib/supabase.ts`); `ensureActiveSession()` returns true there.
- `.env*` is gitignored except `.env.example`; `SUPABASE_SERVICE_ROLE_KEY` is local-only (never frontend, never committed).
