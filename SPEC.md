# SPEC — "In the Black" (One Login mini-app)

## Context

- **App Name**: In the Black
- **Core Concept**: Radically simple cash-flow tracker for tradies on job sites.
- **UX Goal**: Single-handed mobile use. Understandable in under 30 seconds with zero onboarding.
- **Rules**: Exactly one post-login screen, no unnecessary sub-pages or bloated settings.

## What to build (Idea)

A live "One Login" mini-app:

- One login (Google OAuth via Supabase — see Auth below)
- After login, exactly **one screen**:
  - "This month: $ in / $ out / profit" as big numbers
  - The profit number is **green** if positive (in the black), **red** if
    negative (in the red)
  - A **"Job done"** button: enter customer, job, price → adds to money in,
    updates the screen **instantly** (no refresh)
  - A **"+Expense"** button: enter amount → adds to money out, same
    instant-update behavior
- Deployed live on Vercel
- Must feel **polished, premium, and phone-first** — simple ≠ plain

## Tech Stack

- **Next.js 16 (App Router)**: Modern React 19 SSR and server/client separation.
- **Supabase**:
  - **Auth**: Google OAuth.
  - **RLS**: Enforcing row-level security (`auth.uid() = user_id`) at the database engine level.
  - **Realtime**: WebSockets listening to Postgres Write-Ahead Logs (WAL) for instant UI updates without polling or reloads.
- **Tailwind CSS v4**: Mobile-first touch targets and responsive typography.
- **Vercel**: Edge deployment and production CI/CD.

## Data Schema

```
jobs
- id (uuid, pk)
- user_id (uuid, fk -> auth.users)
- customer_name (text)
- job_name (text)
- price (numeric)
- created_at (timestamptz, default now())

expenses
- id (uuid, pk)
- user_id (uuid, fk -> auth.users)
- amount (numeric)
- created_at (timestamptz, default now())
```

- "$ in" = sum of `jobs.price` where `created_at` is in the current calendar
  month, filtered by `user_id`
- "$ out" = sum of `expenses.amount`, same filter
- "profit" = in − out
- Row Level Security: each user can only read/write their own rows
  (`user_id = auth.uid()`)

## Explicit guardrails — read before adding anything

- **Do not add features beyond what's specified above.** No settings page,
  no history/list view, no expense categories, no dark mode toggle, no
  onboarding tour, no signup flow beyond Google OAuth. If you think something
  is missing, ask — don't add it silently.
- The "+Expense" button is intentionally as bare-bones as "Job done": one
  field (amount), nothing else. Do not add categories, receipts, or notes.
- Prefer deleting/simplifying over adding, whenever there's a choice.

## Implementation Tracker

    - [x] Next.js + Supabase scaffold, RLS, and baseline Vercel deploy.
    - [x] Google OAuth integration & session verification.
    - [x] Summary screen wired to live Supabase data.
    - [ ] "Job done" and "+Expense" flows with Supabase Realtime.
    - [ ] UI/UX mobile polish.
    - [ ] Mobile testing on real mobile devices.

## Definition of done

- Live Vercel URL, tested on a real phone
- A brand-new user can log in with Google and, with zero prior explanation,
  understand the screen and log a job within 30 seconds
- Profit number is unmistakably green or red depending on sign
- Numbers update instantly after "Job done" or "+Expense" with no page
  reload
