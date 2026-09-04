-- ==============================================================================
-- Bhio Supabase Schema & Migration
-- ==============================================================================

-- 1. Create profiles table (if starting fresh)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '',
  headline text not null default '',
  occupation text not null default '',
  tagline text not null default '',
  bio text not null default '',
  about_me text not null default '',
  interests text not null default '',
  location text not null default '',
  page_title text not null default '',
  cta_enabled boolean not null default true,
  cta_title text not null default 'Let''s Connect',
  cta_desc text not null default '',
  cta_button_text text not null default 'Send a message',
  cta_button_url text not null default '',
  visibility boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Safe Migration for existing databases (adds new columns if not yet present)
alter table public.profiles add column if not exists headline text not null default '';
alter table public.profiles add column if not exists occupation text not null default '';
alter table public.profiles add column if not exists tagline text not null default '';
alter table public.profiles add column if not exists about_me text not null default '';
alter table public.profiles add column if not exists interests text not null default '';
alter table public.profiles add column if not exists cta_enabled boolean not null default true;
alter table public.profiles add column if not exists cta_title text not null default 'Let''s Connect';
alter table public.profiles add column if not exists cta_desc text not null default '';
alter table public.profiles add column if not exists cta_button_text text not null default 'Send a message';
alter table public.profiles add column if not exists cta_button_url text not null default '';
alter table public.profiles add column if not exists visibility boolean not null default true;
alter table public.profiles add column if not exists settings jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 3. Indexes for high performance queries
create index if not exists idx_profiles_username_visibility 
  on public.profiles(username) 
  where visibility = true;

-- 4. Automatic updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 6. RLS Policies on profiles table
-- Optimized with (select auth.uid()) so Postgres evaluates the auth UID once per statement
drop policy if exists "Public profiles are viewable when visible" on public.profiles;
create policy "Public profiles are viewable when visible"
  on public.profiles for select
  using (visibility = true or (select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- 7. Grant Data API (PostgREST) Permissions
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- 8. Trigger to automatically provision profile row on auth sign-up
create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    case
      when nullif(new.raw_user_meta_data ->> 'username', '') is not null
        and not exists (
          select 1 from public.profiles
          where username = lower(new.raw_user_meta_data ->> 'username')
        ) then lower(new.raw_user_meta_data ->> 'username')
      else 'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
    end,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();

-- 9. Storage Bucket for Profile & Link Images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-images', 'profile-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

-- 10. Storage RLS Policies
drop policy if exists "Users can upload their own profile images" on storage.objects;
create policy "Users can upload their own profile images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Profile images are publicly readable" on storage.objects;
create policy "Profile images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'profile-images');

drop policy if exists "Users can update their own profile images" on storage.objects;
create policy "Users can update their own profile images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete their own profile images" on storage.objects;
create policy "Users can delete their own profile images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = (select auth.uid())::text);