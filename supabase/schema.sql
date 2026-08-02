create extension if not exists "pgcrypto";

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  avatar_url text,
  phone text not null default '',
  about text not null default '' check (char_length(about) <= 140),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  owner_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (family_id, user_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  type text not null check (type in ('direct', 'group')),
  title text not null check (char_length(title) between 1 and 100),
  owner_id uuid not null references public.users(id) on delete cascade,
  target_phone text,
  allowed_phones text[] not null default '{}',
  member_limit integer check (member_limit is null or member_limit between 1 and 50),
  message_ttl text not null default '7d' check (message_ttl in ('off', '24h', '7d', '30d', '90d')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_members (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (chat_id, user_id)
);

create table if not exists public.chat_invites (
  id uuid primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  kind text not null check (kind in ('direct', 'group')),
  created_by uuid not null references public.users(id) on delete cascade,
  access_code text not null unique check (access_code ~ '^[A-Z2-9]{6}$'),
  chat_secret text not null default '',
  allowed_phones text[] not null default '{}',
  allowed_phone text,
  max_participants integer not null default 1 check (max_participants between 1 and 50),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '24 hours'),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  type text not null check (type in ('text', 'voice', 'image', 'file', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  reply_to uuid references public.messages(id) on delete set null,
  media_path text
);

create index if not exists chat_members_user_id_idx on public.chat_members (user_id, chat_id);
create index if not exists family_members_user_id_idx on public.family_members (user_id, family_id);
create index if not exists chats_family_id_created_at_idx on public.chats (family_id, created_at desc);
create index if not exists messages_chat_id_created_at_idx on public.messages (chat_id, created_at desc);
create index if not exists messages_expires_at_idx on public.messages (expires_at) where expires_at is not null;
create index if not exists chat_invites_active_code_idx on public.chat_invites (access_code) where is_active = true;

create or replace function private.is_chat_member(p_chat_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.chat_members
      where chat_id = p_chat_id and user_id = (select auth.uid())
    );
$$;

create or replace function private.is_chat_owner(p_chat_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.chats
      where id = p_chat_id and owner_id = (select auth.uid())
    );
$$;

create or replace function private.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.family_members
      where family_id = p_family_id and user_id = (select auth.uid())
    );
$$;

create or replace function private.is_family_owner(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.families
      where id = p_family_id and owner_id = (select auth.uid())
    );
$$;

create or replace function private.shares_chat(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.chat_members mine
      join public.chat_members theirs on theirs.chat_id = mine.chat_id
      where mine.user_id = (select auth.uid()) and theirs.user_id = p_user_id
    );
$$;

revoke all on function private.is_chat_member(uuid) from public, anon;
revoke all on function private.is_chat_owner(uuid) from public, anon;
revoke all on function private.is_family_member(uuid) from public, anon;
revoke all on function private.is_family_owner(uuid) from public, anon;
revoke all on function private.shares_chat(uuid) from public, anon;
grant execute on function private.is_chat_member(uuid) to authenticated;
grant execute on function private.is_chat_owner(uuid) to authenticated;
grant execute on function private.is_family_member(uuid) to authenticated;
grant execute on function private.is_family_owner(uuid) to authenticated;
grant execute on function private.shares_chat(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_invites enable row level security;
alter table public.messages enable row level security;

drop policy if exists "users can read visible profiles" on public.users;
create policy "users can read visible profiles" on public.users for select to authenticated
using ((select auth.uid()) = id or private.shares_chat(id));
drop policy if exists "users can create own profile" on public.users;
create policy "users can create own profile" on public.users for insert to authenticated
with check ((select auth.uid()) = id);
drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile" on public.users for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "members can read families" on public.families;
create policy "members can read families" on public.families for select to authenticated
using (private.is_family_member(id));
drop policy if exists "users can create families" on public.families;
create policy "users can create families" on public.families for insert to authenticated
with check (owner_id = (select auth.uid()));
drop policy if exists "owners can update families" on public.families;
create policy "owners can update families" on public.families for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "owners can delete families" on public.families;
create policy "owners can delete families" on public.families for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "members can read family memberships" on public.family_members;
create policy "members can read family memberships" on public.family_members for select to authenticated
using (private.is_family_member(family_id));
drop policy if exists "owners can add family memberships" on public.family_members;
create policy "owners can add family memberships" on public.family_members for insert to authenticated
with check (private.is_family_owner(family_id));
drop policy if exists "owners can update family memberships" on public.family_members;
create policy "owners can update family memberships" on public.family_members for update to authenticated
using (private.is_family_owner(family_id)) with check (private.is_family_owner(family_id));
drop policy if exists "members can leave or owners can remove" on public.family_members;
create policy "members can leave or owners can remove" on public.family_members for delete to authenticated
using (user_id = (select auth.uid()) or private.is_family_owner(family_id));

drop policy if exists "members can read chats" on public.chats;
create policy "members can read chats" on public.chats for select to authenticated
using (private.is_chat_member(id));
drop policy if exists "owners can create chats" on public.chats;
create policy "owners can create chats" on public.chats for insert to authenticated
with check (owner_id = (select auth.uid()));
drop policy if exists "owners can update chats" on public.chats;
create policy "owners can update chats" on public.chats for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "owners can delete chats" on public.chats;
create policy "owners can delete chats" on public.chats for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "members can read memberships" on public.chat_members;
create policy "members can read memberships" on public.chat_members for select to authenticated
using (private.is_chat_member(chat_id));
drop policy if exists "owners can create memberships" on public.chat_members;
create policy "owners can create memberships" on public.chat_members for insert to authenticated
with check (private.is_chat_owner(chat_id));
drop policy if exists "members can leave or owners can remove chat memberships" on public.chat_members;
create policy "members can leave or owners can remove chat memberships" on public.chat_members for delete to authenticated
using (user_id = (select auth.uid()) or private.is_chat_owner(chat_id));

drop policy if exists "members can read invites" on public.chat_invites;
create policy "members can read invites" on public.chat_invites for select to authenticated
using (private.is_chat_member(chat_id));
drop policy if exists "owners can create invites" on public.chat_invites;
create policy "owners can create invites" on public.chat_invites for insert to authenticated
with check (created_by = (select auth.uid()) and private.is_chat_owner(chat_id));
drop policy if exists "owners can update invites" on public.chat_invites;
create policy "owners can update invites" on public.chat_invites for update to authenticated
using (private.is_chat_owner(chat_id)) with check (private.is_chat_owner(chat_id));
drop policy if exists "owners can delete invites" on public.chat_invites;
create policy "owners can delete invites" on public.chat_invites for delete to authenticated
using (private.is_chat_owner(chat_id));

drop policy if exists "members can read messages" on public.messages;
create policy "members can read messages" on public.messages for select to authenticated
using (private.is_chat_member(chat_id));
drop policy if exists "members can insert messages" on public.messages;
create policy "members can insert messages" on public.messages for insert to authenticated
with check (sender_id = (select auth.uid()) and private.is_chat_member(chat_id));
drop policy if exists "senders can delete own messages" on public.messages;
create policy "senders can delete own messages" on public.messages for delete to authenticated
using (sender_id = (select auth.uid()) and private.is_chat_member(chat_id));

grant usage on schema public to authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.families, public.family_members to authenticated;
grant select, insert, update, delete on public.chats, public.chat_members, public.chat_invites, public.messages to authenticated;

create or replace function public.consume_chat_invite_by_code(p_access_code text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.chat_invites;
  v_chat public.chats;
  v_member_count integer;
  v_profile_phone text;
  v_requested_phone text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select regexp_replace(coalesce(phone, ''), '\D', '', 'g') into v_profile_phone
  from public.users where id = (select auth.uid());
  v_requested_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  if v_profile_phone = '' or v_profile_phone <> v_requested_phone then
    raise exception 'Phone does not match the authenticated profile';
  end if;

  select * into v_invite from public.chat_invites
  where upper(access_code) = upper(trim(p_access_code))
    and is_active = true and expires_at > timezone('utc', now())
  for update;
  if not found then raise exception 'Code not found, inactive, or expired'; end if;
  if not (v_profile_phone = any(v_invite.allowed_phones)) then
    raise exception 'This code is not allowed for this phone number';
  end if;

  select * into v_chat from public.chats where id = v_invite.chat_id;
  if exists (select 1 from public.chat_members where chat_id = v_invite.chat_id and user_id = (select auth.uid())) then
    raise exception 'This user is already a member of the chat';
  end if;
  select count(*) into v_member_count from public.chat_members where chat_id = v_invite.chat_id;
  if v_member_count >= v_invite.max_participants + 1 then raise exception 'Group participant limit reached'; end if;

  insert into public.chat_members (chat_id, user_id) values (v_invite.chat_id, (select auth.uid()));
  update public.chat_invites
  set used_count = used_count + 1,
      is_active = (used_count + 1) < max_participants
  where id = v_invite.id;

  return jsonb_build_object('chat', row_to_json(v_chat), 'chat_secret', v_invite.chat_secret);
end;
$$;

revoke all on function public.consume_chat_invite_by_code(text, text) from public, anon;
grant execute on function public.consume_chat_invite_by_code(text, text) to authenticated;

drop function if exists public.delete_expired_messages();
create or replace function private.delete_expired_messages()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted bigint;
begin
  delete from public.messages where expires_at is not null and expires_at < timezone('utc', now());
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;
revoke all on function private.delete_expired_messages() from public, anon, authenticated;
grant execute on function private.delete_expired_messages() to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
