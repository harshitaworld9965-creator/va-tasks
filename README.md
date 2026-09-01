# Tasks — shared VA task & reminder tracker

Vite + React + Tailwind v4 + Supabase. Same stack as Daily Ledger.

## How it behaves

- **Days** — week strip at the top; tap a day to see its tasks. A teal dot = open tasks, a marigold dot = unfinished tasks from a past day.
- **Months** — every task that wasn't finished on its day, grouped by month (newest first). The task also stays on its original day in Days. Marking it done anywhere clears it from both.
- **Unscheduled** — tasks with no day. Day and reminder time are both optional.
- Two accounts, one shared list. Changes sync live between both of you (Supabase Realtime).
- "Overdue" is computed as `due_date < today AND done = false` — nothing runs in the background, nothing can drift.

## Run locally (no hosted Supabase needed)

Needs Docker Desktop running.

```bash
npm install
npx supabase init        # once — creates supabase/config.toml next to the migrations folder
npx supabase start       # boots Postgres + Auth + Studio in Docker; applies supabase/migrations/*.sql
```

Copy the printed **API URL** and **anon key** into `.env`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase start>
```

Then `npm run dev`. Studio (table editor) is at http://127.0.0.1:54323.

Local Auth: email confirmation is off by default, so "Create account" signs you straight in. Create one account for you and one for the person you assist.

Useful: `npx supabase db reset` re-applies migrations from scratch. `npx supabase stop` shuts it down.

## Go live (so the other person can use it)

Local Supabase is only reachable on your machine. To host:

1. Open the Daily Ledger Supabase project → SQL editor → paste and run `supabase/migrations/0001_va_tasks.sql`. Tables are prefixed `va_` so nothing collides with `todos` / `eaten_*`.
2. Authentication → Providers → make sure Email is enabled. (Optionally turn off "Confirm email" so sign-up is instant.)
3. Database → Replication → enable Realtime for `va_tasks` (needed for live sync).
4. Point `.env` / Vercel env vars at that project's URL + anon key. Deploy to Vercel as usual.

## Reminders — next step

Right now reminders are visible in-app (time shown on the task). To actually get notified, add a scheduled Edge Function that runs every 5 min, selects tasks where `due_date = today AND reminder_time` just passed, and emails both of you via Resend. Ask me when you're ready and I'll wire it up.

## Recurring tasks — reserved

`va_tasks.recurrence` exists but is unused. When you decide you need it, it's a small change: on marking a recurring task done, insert a copy with the next date.
