# CyaThere

Find a time that works for everyone. CyaThere is a lightweight, no-signup group availability scheduling app — create a room, share the link, and let everyone mark when they're free.

**Live demo:** https://eltonlee.github.io/CyaThere/

## Features

- **No accounts needed** — just enter your name and start selecting
- **Real-time collaboration** — see everyone's availability instantly via Supabase Realtime
- **Drag-to-select** — click and drag across the grid to mark your free time
- **Heatmap overview** — see the best times at a glance with color-coded counts
- **Shareable links** — one-click copy to invite others

## Tech Stack

- **Frontend:** React 19 + Vite
- **Routing:** React Router v7
- **Database:** Supabase (PostgreSQL + Realtime)
- **Deployment:** GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The app requires a Supabase project with two tables:

```sql
create table rooms (
  id          text        primary key,
  name        text        not null,
  time_start  numeric     not null default 6,
  time_end    numeric     not null default 30,
  created_at  timestamptz not null default now()
);

create table availability (
  id          uuid        primary key default gen_random_uuid(),
  room_id     text        not null references rooms(id) on delete cascade,
  participant text        not null,
  slots       jsonb       not null default '{}',
  updated_at  timestamptz not null default now(),
  unique(room_id, participant)
);
```

Row Level Security (RLS) policies are required — see `schema.sql` in the repo for the full setup.

## Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages. Every push to `main` triggers a build and deploy.

To set up:
1. Go to **Settings → Pages** in your GitHub repo
2. Set **Source** to **GitHub Actions**
3. The `deploy.yml` workflow handles the rest

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── AvailabilityGrid.jsx   # Drag-to-select time grid
│   ├── CalendarPicker.jsx     # Date selection calendar
│   ├── GroupOverview.jsx      # Heatmap + best times
│   └── ShareLink.jsx          # Copy-to-clipboard share
├── context/           # React context providers
├── hooks/             # Custom hooks (useRoom, useAvailability)
├── lib/               # Utilities (slots, supabase client)
└── pages/             # Route pages (Home, Room)
```
