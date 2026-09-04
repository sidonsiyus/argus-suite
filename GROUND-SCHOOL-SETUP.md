# Ground School — setup (Supabase)

The notes library (`/ground-school`) and admin panel (`/ground-school/admin`) run on a free
Supabase project. Anyone can **read** notes; only you, signed in, can **add/upload/delete**.
There are no secrets in the code — the only keys are the *public* anon key, and Row-Level
Security (RLS) enforces the rules.

One-time setup, ~10 minutes:

## 1. Create the project
- Go to https://supabase.com → **New project** (free tier). Pick a name and a DB password.

## 2. Create the tables + security
Open **SQL Editor → New query**, paste this, and **Run**:

```sql
-- Tables ---------------------------------------------------------------
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  filename text not null,
  path text not null,
  size bigint,
  created_at timestamptz not null default now()
);

-- Row-Level Security ---------------------------------------------------
alter table public.subjects enable row level security;
alter table public.notes    enable row level security;

-- Anyone can read
create policy "subjects_read" on public.subjects for select using (true);
create policy "notes_read"    on public.notes    for select using (true);

-- Only signed-in users (you) can write
create policy "subjects_write" on public.subjects for all to authenticated using (true) with check (true);
create policy "notes_write"    on public.notes    for all to authenticated using (true) with check (true);
```

## 3. Create the file bucket
- **Storage → New bucket** → name it exactly **`notes`** → toggle **Public** on → Create.
- Then **SQL Editor**, run this so uploads/deletes require sign-in (reads stay public):

```sql
create policy "notes_obj_read"   on storage.objects for select using (bucket_id = 'notes');
create policy "notes_obj_insert" on storage.objects for insert to authenticated with check (bucket_id = 'notes');
create policy "notes_obj_update" on storage.objects for update to authenticated using (bucket_id = 'notes');
create policy "notes_obj_delete" on storage.objects for delete to authenticated using (bucket_id = 'notes');
```

## 4. Create your instructor login
- **Authentication → Users → Add user** → your email + a password (this is what you'll type
  in the admin panel).
- **Authentication → Providers → Email**: turn **"Allow new users to sign up" OFF** so only you exist.

## 5. Plug the keys into the site
- **Project Settings → API** → copy the **Project URL** and the **anon public** key.
- Copy `.env.local.example` to `.env.local` and paste them in:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- Restart the dev server (`npm run dev`). On your host (Netlify/Vercel), add the same two
  env vars in the project settings.

## Done
- Students: **/ground-school** → pick a subject → open/download notes.
- You: **/ground-school/admin** → sign in → add subjects, upload notes, delete.

Allowed uploads are capped by Supabase's per-file limit (default 50 MB; raise it in
Storage settings if needed). Accepted types in the picker: pdf, ppt(x), doc(x), xls(x)/csv,
images, zip — widen the `accept` list in `app/ground-school/admin/page.js` if you want more.
