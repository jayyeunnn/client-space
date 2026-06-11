# ClientSpace

**One link. Full clarity.**

A freelancer client portal — give clients a single link to track project progress, milestones, file deliverables, and invoices. No signup required on the client side.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

---

## Overview

ClientSpace is a production-ready freelancer client portal. Freelancers manage projects, milestones, files, and invoices from a clean dashboard. Each project gets a shareable magic link — clients open it without logging in and see exactly what they need.

---

## Features

- **Dashboard** — project list, stats row (active, overdue, revenue), recent activity feed
- **Project Management** — create/edit projects with client info and status tracking
- **Milestones** — add, update status, set due dates, track overdue items
- **File Deliverables** — upload files to Supabase Storage, list with signed download URLs
- **Invoice Builder** — line items, subtotal, tax rate, auto-total, due date
- **PDF Export** — download invoice as PDF via `@react-pdf/renderer`
- **Client Portal** — public SSR page at `/portal/[token]`, no auth required
- **Magic Link Sharing** — one-click copy portal link with visual feedback
- **Authentication** — email/password login via Supabase Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (signed URLs) |
| PDF | @react-pdf/renderer |
| Animation | Anime.js + GSAP |
| Notifications | Sonner |
| Testing | Vitest + Testing Library + Playwright |
| Deploy | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/Jayyy7777/clientspace.git
cd clientspace
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  business_name text,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  freelancer_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  client_name text,
  client_email text,
  status text default 'active',
  portal_token uuid default gen_random_uuid() unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Milestones
create table milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending',
  due_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Files
create table files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  uploaded_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade unique,
  invoice_number text unique,
  items jsonb default '[]',
  subtotal numeric default 0,
  tax_rate numeric default 0,
  total numeric default 0,
  due_date date,
  notes text
);
```

Enable Row Level Security and create policies so freelancers can only access their own data, and the portal token allows public read access.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Dashboard shell + sidebar
│   │   ├── dashboard/      # Main dashboard
│   │   └── projects/
│   │       ├── new/        # Create project
│   │       └── [id]/       # Project detail (Milestones | Files | Invoice)
│   ├── portal/
│   │   └── [token]/        # Client portal (public SSR)
│   └── api/
│       ├── projects/       # CRUD projects
│       ├── milestones/     # CRUD milestones
│       ├── files/          # Upload & delete
│       ├── invoice/        # Create/update invoice
│       └── portal/[token]/ # Public portal data + PDF
├── components/
│   ├── dashboard/          # Freelancer UI components
│   ├── portal/             # Client portal UI components
│   └── ui/                 # Shared reusable components
├── lib/
│   ├── supabase.ts         # Supabase client (client + server)
│   ├── pdf.tsx             # Invoice PDF template
│   └── utils.ts            # Helper functions
├── types/
│   └── index.ts            # TypeScript types
└── hooks/
    ├── useProject.ts
    └── useInvoice.ts
```

---

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

---

## License

MIT
