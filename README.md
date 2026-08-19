# Seemroute

Passenger transportation management platform for NEMT / passenger-transport operators — an
admin/dispatch console plus a mobile-first driver app, in one Next.js codebase. No backend
database: all data lives in the browser, so the app deploys to Vercel with zero configuration.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + hand-rolled shadcn/ui-style components (Radix primitives underneath)
- **Zustand** (with the `persist` middleware) as the entire data layer — every module's data is
  held in one client-side store and mirrored to `localStorage`
- **@ducanh2912/next-pwa** for the installable, offline-first PWA shell
- **next-themes** for light/dark mode (persisted, respects system preference)
- **recharts** for dashboard charts

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000 (or the next free port)
```

That's it — there's no database to migrate or seed. The first time the app loads in a browser it
generates a full set of realistic demo data (drivers, vehicles, trips, invoices, payroll, billing)
and writes it to `localStorage`; every reload after that reads the same persisted data back.

### Demo accounts

Every seeded user's password is `password123`.

| Role   | Email                     | Notes                                    |
| ------ | ------------------------- | ------------------------------------------ |
| Admin  | `admin@seemroute.com`     | Full access to the dispatch console       |
| Driver | `marcus@seemroute.com`    | One of 6 seeded drivers — try any of them |

Other seeded drivers: `priya@`, `diego@`, `hannah@`, `tyrell@`, `sofia@` — all `@seemroute.com`.

### Resetting demo data

The seed only runs once per browser (when `localStorage` is empty). To start over — e.g. after
making a bunch of demo edits — open dev tools → Application → Local Storage → delete the
`seemroute-data` key, then reload.

## Deploying to Vercel

There's nothing to configure — no environment variables, no database provisioning:

1. Push this repo to GitHub.
2. Import it in Vercel ("Add New Project" → select the repo).
3. Click Deploy. Vercel auto-detects Next.js; the default build command (`next build`) is all
   that's needed.

Because every user's data lives only in their own browser, everyone who opens the deployed URL
gets their own independent, freshly-seeded copy of the demo — nothing is shared between visitors,
and refreshing on a different device won't show the same state.

## What's in the demo

The store seeds every module so nothing is empty on first run (`src/lib/seed-data.ts`):

- **Dashboard** — role-aware KPIs (today's trips, active vehicles, drivers on shift, weekly
  revenue, upcoming payroll) plus a 7-day trips/revenue chart and a 30-day trip-status breakdown.
- **Dispatch** — a live Kanban-style board of today's trips across
  Requested → Assigned → En Route → Completed → Cancelled, with driver/vehicle assignment.
- **Trips** — full CRUD with search and status filtering.
- **Calendar** — month/week views of scheduled trips and driver shifts.
- **Vehicles** — fleet roster with capacity, maintenance status, and CRUD.
- **Drivers** — roster with license info, vehicle assignment, and a detail page showing trip
  history, shift schedule, and payroll history per driver.
- **Invoicing** — generate invoices from one or more completed trips per client, with line items
  and a draft → sent → paid status flow.
- **Payroll** — generate a pay-period run that calculates gross pay per driver from completed
  trips and worked shift hours; mark runs as processed.
- **Billing** — per-client running balance and ledger (charges, payments, adjustments), with the
  ability to record manual entries.
- **Driver app** (`/driver`) — mobile-first, installable, offline-first. See below.

Two roles are enforced client-side: **Admin** gets the full console under `/admin`; **Driver** is
restricted to `/driver` and only ever sees their own trips and schedule
(`src/components/auth-guard.tsx`). This is demo-grade auth — credentials and session state live in
the browser store, not behind a real server, so treat it as a UX gate rather than a security
boundary.

## How data + offline work

- **Single source of truth**: `src/store/app-store.ts` is a Zustand store holding every entity
  (users, drivers, vehicles, trips, clients, invoices, billing records, payroll) plus the current
  session. Every "CRUD" action in the admin console and driver app — assigning a trip, generating
  an invoice, marking a driver's trip complete — is a synchronous store mutation.
- **Persistence**: Zustand's `persist` middleware mirrors the store to `localStorage` under the key
  `seemroute-data` on every change. No network round-trip is ever involved, so the app is
  offline-capable by construction — there's no "sync queue" because there's nothing to sync to.
- **Hydration safety**: `src/components/store-gate.tsx` gates all rendering behind a hydration
  check so the server-rendered shell and the client's first paint always match, then swaps in the
  persisted (or freshly-seeded) data once the browser is ready — avoiding React hydration
  mismatches from `localStorage`-sourced state.
- **Cross-tab sync**: opening the admin console and the driver app in two tabs of the *same*
  browser stays in sync — a `storage` event listener re-reads `localStorage` whenever another tab
  writes to it (e.g. a driver marking a trip complete updates the dispatch board in the admin tab).
- **PWA shell**: `@ducanh2912/next-pwa` generates a service worker at build time (disabled in `next
  dev`) that caches the app shell (JS/CSS/HTML), so once a user has loaded the app it continues to
  work with no connection at all.
- **Known limitation**: because storage is per-browser, two different devices (e.g. an admin's
  laptop and a driver's phone) will not see each other's data. For a live demo, open the admin
  console and driver app in separate tabs of the same browser to see the two roles interact.

## Project structure

```
src/lib/types.ts             Shared TypeScript types for every entity (Trip, Vehicle, Driver, ...)
src/lib/seed-data.ts          Generates the realistic, cross-linked demo dataset on first load
src/store/app-store.ts        The entire data layer — state + every CRUD action, persisted to localStorage
src/components/store-gate.tsx Hydration guard so SSR and first client paint always match
src/components/auth-guard.tsx Client-side role-based route protection (replaces server middleware)
src/app/admin/...             Admin console pages, one per module
src/app/driver/...            Driver app pages
src/components/ui/            Hand-rolled shadcn/ui-style primitives (Radix-based)
src/components/admin/         Admin feature components (tables, dialogs, charts)
src/components/driver/        Driver app shell and trip cards
```
