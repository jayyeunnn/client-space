-- ClientSpace Database Schema
-- Jalankan di Supabase SQL Editor

-- Enable pgcrypto untuk gen_random_uuid()
create extension if not exists "pgcrypto";


-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  business_name text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;


-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  client_name   text not null,
  client_email  text,
  status        text not null default 'active'
                  check (status in ('active', 'completed', 'on_hold')),
  portal_token  uuid unique not null default gen_random_uuid(),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.projects enable row level security;


-- ============================================================
-- MILESTONES
-- ============================================================
create table if not exists public.milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'pending'
                check (status in ('pending', 'in_progress', 'done', 'approved')),
  due_date    date,
  sort_order  int not null default 0,
  created_at  timestamptz default now() not null
);

alter table public.milestones enable row level security;


-- ============================================================
-- FILES
-- ============================================================
create table if not exists public.files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  file_name    text not null,
  file_path    text not null,
  file_size    bigint,
  uploaded_at  timestamptz default now() not null
);

alter table public.files enable row level security;


-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid unique not null references public.projects(id) on delete cascade,
  invoice_number text unique not null,
  items          jsonb not null default '[]'::jsonb,
  subtotal       numeric(12,2) not null default 0,
  tax_rate       numeric(5,2) not null default 0,
  total          numeric(12,2) not null default 0,
  due_date       date,
  notes          text,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

alter table public.invoices enable row level security;


-- ============================================================
-- TRIGGER: updated_at otomatis untuk projects dan invoices
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();


-- ============================================================
-- TRIGGER: projects.updated_at ikut update saat milestone/file berubah
-- ============================================================
create or replace function public.touch_project_updated_at()
returns trigger as $$
begin
  update public.projects
  set updated_at = now()
  where id = coalesce(new.project_id, old.project_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger milestones_touch_project
  after insert or update or delete on public.milestones
  for each row execute function public.touch_project_updated_at();

create trigger files_touch_project
  after insert or update or delete on public.files
  for each row execute function public.touch_project_updated_at();


-- ============================================================
-- TRIGGER: auto-create profile saat user baru register
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'business_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;
