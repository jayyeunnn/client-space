-- ClientSpace RLS Policies
-- Jalankan setelah schema.sql

-- ============================================================
-- PROFILES
-- ============================================================
create policy "profiles: freelancer baca milik sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: freelancer update milik sendiri"
  on public.profiles for update
  using (auth.uid() = id);


-- ============================================================
-- PROJECTS
-- ============================================================
create policy "projects: freelancer baca milik sendiri"
  on public.projects for select
  using (auth.uid() = freelancer_id);

create policy "projects: freelancer buat project baru"
  on public.projects for insert
  with check (auth.uid() = freelancer_id);

create policy "projects: freelancer update milik sendiri"
  on public.projects for update
  using (auth.uid() = freelancer_id);

create policy "projects: freelancer hapus milik sendiri"
  on public.projects for delete
  using (auth.uid() = freelancer_id);


-- ============================================================
-- MILESTONES
-- ============================================================
create policy "milestones: freelancer baca dari project milik sendiri"
  on public.milestones for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = milestones.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "milestones: freelancer tambah ke project milik sendiri"
  on public.milestones for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = milestones.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "milestones: freelancer update dari project milik sendiri"
  on public.milestones for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = milestones.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "milestones: freelancer hapus dari project milik sendiri"
  on public.milestones for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = milestones.project_id
        and projects.freelancer_id = auth.uid()
    )
  );


-- ============================================================
-- FILES
-- ============================================================
create policy "files: freelancer baca dari project milik sendiri"
  on public.files for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = files.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "files: freelancer tambah ke project milik sendiri"
  on public.files for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = files.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "files: freelancer hapus dari project milik sendiri"
  on public.files for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = files.project_id
        and projects.freelancer_id = auth.uid()
    )
  );


-- ============================================================
-- INVOICES
-- ============================================================
create policy "invoices: freelancer baca dari project milik sendiri"
  on public.invoices for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = invoices.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "invoices: freelancer buat invoice di project milik sendiri"
  on public.invoices for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = invoices.project_id
        and projects.freelancer_id = auth.uid()
    )
  );

create policy "invoices: freelancer update invoice di project milik sendiri"
  on public.invoices for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = invoices.project_id
        and projects.freelancer_id = auth.uid()
    )
  );


-- ============================================================
-- STORAGE: project-files bucket
-- ============================================================

-- Freelancer upload file ke folder milik sendiri
create policy "storage: freelancer upload file"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Freelancer baca file milik sendiri
create policy "storage: freelancer baca file milik sendiri"
  on storage.objects for select
  using (
    bucket_id = 'project-files'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Freelancer hapus file milik sendiri
create policy "storage: freelancer hapus file milik sendiri"
  on storage.objects for delete
  using (
    bucket_id = 'project-files'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Catatan: Portal klien membaca file via signed URL yang di-generate server-side
-- menggunakan service role key. Tidak perlu RLS policy public untuk storage.
