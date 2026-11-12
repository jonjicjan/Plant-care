# 🌿 Plant Care Reminder

A plant care companion that tells you which of your plants needs attention today, and remembers what you actually did.

Live app: **https://the-plant-care.base44.app**

---

## Overview

Plant Care Reminder replaces the guesswork and the sticky notes. You add your plants, give each one a care rhythm (water every 7 days, feed every 30, and so on), and the app calculates every due date from then on.

Each day it surfaces what is due across four places — the dashboard, a reminder bell in the header, the reminders page, and a daily email that arrives at the time you choose, in your timezone. Marking a task done records it in a permanent care journal and instantly schedules the next occurrence.

## Features

### Plant collection
- Add plants with a name, one of 9 categories (indoor foliage, tropical, succulent, cactus, fern, flowering, herb, trailing, other), a photo, and free-form care notes.
- Photo-card collection view showing each plant's next care status at a glance.
- Per-plant detail page combining its profile, its schedules, and its own care history.
- Edit and delete, with photos stored privately and served only to their owner.

### Care schedules
- Five care types: watering, fertilizing, pruning, repotting, maintenance.
- Intervals from 1 to 365 days, with the first due date calculated automatically.
- Pause and resume any schedule without deleting it; deleting a schedule keeps its history intact.

### Reminders
- Tasks automatically grouped into **Overdue**, **Due today**, and **Upcoming**.
- Complete care inline in one tap.
- Three independent notification channels:
  - **In-app** — a bell in the header counting care that is overdue or due today.
  - **Browser** — native notifications while the app is open in a tab.
  - **Email** — the only channel that reaches you when the app is closed.
- A single daily reminder time and timezone, applied across all channels, with a test-notification button and one-click "turn off all reminders".

### Care history
- A timeline journal of every completed task, newest first, filterable by plant and by care type.

### Dashboard
- Greeting and collection counts, today's and overdue tasks, upcoming reminders, recent care activity, recently added plants, and a care tip.

### Account
- Email/password and Google sign-in.
- Profile page with account details and collection statistics.

## How it works

```
Add a plant  →  Set a care schedule  →  App calculates the due date
                                              ↓
        Dashboard · Bell · Reminders page · Daily email  (at your chosen time, your timezone)
                                              ↓
                     Mark done  →  Care log written  →  Next due date advanced
```

Two server-side functions keep the logic authoritative:

| Function | Responsibility |
|---|---|
| `completeCareTask` | Records the care log, advances `nextDueAt` by the interval, and rejects duplicate submissions for the same due date. |
| `sendCareReminders` | Runs hourly. Selects users whose local reminder time has arrived, builds a per-user/per-day de-duplication key, sends at most one email per day listing completed vs. pending care, then prunes old dispatch records. |

The reminder workflow (`Care reminder emails`) is scheduled hourly and runs unattended. A `ReminderDispatch` record is written before each send, so a retry or overlapping run can never produce a duplicate email.

## Architecture

| Layer | Technology |
|---|---|
| UI | React 18 + Vite (JavaScript) |
| Styling | Tailwind CSS with design tokens, Radix UI / shadcn-ui primitives |
| Routing | React Router (protected routes for signed-in pages) |
| Icons & type | Lucide icons; Manrope (headings), Inter (body) |
| Data | Serverless entity database with server-side filtering, sorting and counts |
| Business logic | TypeScript backend functions (Deno runtime) |
| Automation | Scheduled workflow → backend function |
| Email | MJML template compiled to inbox-safe HTML |
| Auth | Managed authentication (email/password + Google OAuth) |
| Storage | Private object storage with signed, time-limited URLs |
| Security | Row-level security policies on every entity |

### Data model

| Entity | Purpose |
|---|---|
| `Plant` | The plant itself — name, type, photo, notes, date added. |
| `CareSchedule` | Recurring care for a plant — care type, interval, next due date, reminder time, enabled/active flags. |
| `CareLog` | An immutable record of completed care, including the due date it resolved. |
| `ReminderDispatch` | De-duplication ledger for sent email reminders. |

All entities are scoped by row-level security: every read, create and update is restricted to the record's owner.

## Design

A dark botanical theme — deep forest backgrounds, soft green accents, high-quality botanical photography — with rounded cards and generous spacing. Fully responsive: sidebar navigation on desktop, bottom tab bar on mobile with safe-area handling.

Theme values live in `src/index.css` as CSS custom properties and are mapped to Tailwind classes in `tailwind.config.js`, so a rebrand is a one-file change.

## Project structure

```
base44/
  entities/      Entity schemas and access rules
  functions/     completeCareTask, sendCareReminders
  workflows/     Care reminder emails (hourly schedule)
  emails/        CareReminderEmail template (MJML)
src/
  pages/         Dashboard, MyPlants, PlantForm, PlantDetails, CareSchedules,
                 Reminders, CareHistory, NotificationSettings, Profile, auth pages
  components/    Cards, rows, dialogs, settings modules, layout and navigation
  hooks/         useCareData, useCompleteTask, useNotificationPrefs, useCareOverview
  lib/           Plant care utilities, notification logic, reminder timing, auth
```

## Run locally

Prerequisites: Node.js, the Base44 CLI, and [Deno](https://docs.deno.com/runtime/getting_started/installation/).

```bash
git clone <repository-url>
cd <project-directory>
npm install
npm install -g base44@latest

base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + frontend together
```

Open the frontend URL printed by `base44 dev` (typically `http://localhost:5173`).

Notes:

- Every fresh clone needs `base44 link`. It writes `base44/.app.jsonc`, which is deliberately gitignored.
- Use `base44 dev` rather than `npm run dev` — it runs the frontend *and* the local backend. Running Vite alone leaves every `/api` call without a backend.
- Entity data under `base44 dev` is in-memory and is wiped on restart. Core integrations and OAuth are forwarded to the deployed app.

### Frontend only, against the live backend

```bash
base44 dev --remote
```

⚠️ In this mode writes go to production data.

## Deploy

This repository syncs with Base44 through git. Push your changes, then publish from the Base44 dashboard (`base44 dashboard open`). Avoid `base44 deploy`, which ships the local tree directly and bypasses the sync.

## Documentation

- GitHub sync: https://docs.base44.com/developers/app-code/local-development/github
- Local development: https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview
- CLI reference: https://docs.base44.com/developers/references/cli/commands/introduction
