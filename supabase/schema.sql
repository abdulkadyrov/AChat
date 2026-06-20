create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (family_id, user_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  type text not null check (type in ('family', 'direct')),
  title text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  type text not null check (type in ('text', 'voice', 'image', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  reply_to uuid references public.messages(id) on delete set null,
  media_path text
);

alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "users can read own profile"
on public.users
for select
using (auth.uid() = id);

create policy "family members can read family"
on public.families
for select
using (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = families.id
      and fm.user_id = auth.uid()
  )
);

create policy "family owner can update family"
on public.families
for update
using (owner_id = auth.uid());

create policy "family members can read members"
on public.family_members
for select
using (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = family_members.family_id
      and fm.user_id = auth.uid()
  )
);

create policy "family owner can manage members"
on public.family_members
for all
using (
  exists (
    select 1
    from public.families f
    where f.id = family_members.family_id
      and f.owner_id = auth.uid()
  )
);

create policy "family members can read chats"
on public.chats
for select
using (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = chats.family_id
      and fm.user_id = auth.uid()
  )
);

create policy "family members can read messages in family chats"
on public.messages
for select
using (
  exists (
    select 1
    from public.chats c
    join public.family_members fm on fm.family_id = c.family_id
    where c.id = messages.chat_id
      and fm.user_id = auth.uid()
  )
);

create policy "family members can insert messages in family chats"
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.chats c
    join public.family_members fm on fm.family_id = c.family_id
    where c.id = messages.chat_id
      and fm.user_id = auth.uid()
  )
);

create or replace function public.delete_expired_messages()
returns void
language sql
security definer
as $$
  delete from public.messages
  where expires_at is not null
    and expires_at < timezone('utc', now());
$$;

comment on function public.delete_expired_messages is
'Call from pg_cron or Supabase scheduled job to remove expired ciphertext rows.';
