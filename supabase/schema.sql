create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  phone text not null default '',
  about text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group')),
  title text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  target_phone text,
  allowed_phones text[] not null default '{}',
  member_limit integer,
  message_ttl text not null default '7d' check (message_ttl in ('off', '24h', '7d', '30d')),
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
  access_code text not null unique,
  chat_secret text not null default '',
  allowed_phones text[] not null default '{}',
  allowed_phone text,
  max_participants integer not null default 1,
  used_count integer not null default 0,
  is_active boolean not null default true,
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
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_invites enable row level security;
alter table public.messages enable row level security;

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "users can upsert own profile" on public.users;
create policy "users can upsert own profile"
on public.users
for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile"
on public.users
for update
using (auth.uid() = id);

drop policy if exists "members can read chats" on public.chats;
create policy "members can read chats"
on public.chats
for select
using (
  exists (
    select 1
    from public.chat_members cm
    where cm.chat_id = chats.id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "owners can create chats" on public.chats;
create policy "owners can create chats"
on public.chats
for insert
with check (owner_id = auth.uid());

drop policy if exists "owners can update chats" on public.chats;
create policy "owners can update chats"
on public.chats
for update
using (owner_id = auth.uid());

drop policy if exists "owners can delete chats" on public.chats;
create policy "owners can delete chats"
on public.chats
for delete
using (owner_id = auth.uid());

drop policy if exists "members can read memberships" on public.chat_members;
create policy "members can read memberships"
on public.chat_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.chat_members cm
    where cm.chat_id = chat_members.chat_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "owners can create memberships" on public.chat_members;
create policy "owners can create memberships"
on public.chat_members
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.chats c
    where c.id = chat_members.chat_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "members can read invites" on public.chat_invites;
create policy "members can read invites"
on public.chat_invites
for select
using (
  exists (
    select 1
    from public.chats c
    join public.chat_members cm on cm.chat_id = c.id
    where c.id = chat_invites.chat_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "owners can create invites" on public.chat_invites;
create policy "owners can create invites"
on public.chat_invites
for insert
with check (created_by = auth.uid());

drop policy if exists "owners can update invites" on public.chat_invites;
create policy "owners can update invites"
on public.chat_invites
for update
using (
  exists (
    select 1
    from public.chats c
    where c.id = chat_invites.chat_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "members can read messages" on public.messages;
create policy "members can read messages"
on public.messages
for select
using (
  exists (
    select 1
    from public.chat_members cm
    where cm.chat_id = messages.chat_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "members can insert messages" on public.messages;
create policy "members can insert messages"
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.chat_members cm
    where cm.chat_id = messages.chat_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "senders can delete own messages" on public.messages;
create policy "senders can delete own messages"
on public.messages
for delete
using (sender_id = auth.uid());

create or replace function public.consume_chat_invite_by_code(
  p_access_code text,
  p_phone text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.chat_invites;
  v_chat public.chats;
  v_member_count integer;
  v_normalized_phone text;
begin
  v_normalized_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  select * into v_invite
  from public.chat_invites
  where upper(access_code) = upper(p_access_code)
    and is_active = true;

  if not found then
    raise exception 'Code not found or inactive';
  end if;

  select * into v_chat
  from public.chats
  where id = v_invite.chat_id;

  if not (v_normalized_phone = any(v_invite.allowed_phones)) then
    raise exception 'This code is not allowed for this phone number';
  end if;

  select count(*) into v_member_count
  from public.chat_members
  where chat_id = v_invite.chat_id;

  if exists (
    select 1
    from public.chat_members cm
    join public.users u on u.id = cm.user_id
    where cm.chat_id = v_invite.chat_id
      and regexp_replace(coalesce(u.phone, ''), '\D', '', 'g') = v_normalized_phone
  ) then
    raise exception 'This phone number is already used in the chat';
  end if;

  if v_member_count - 1 >= v_invite.max_participants then
    raise exception 'Group participant limit reached';
  end if;

  insert into public.chat_members (chat_id, user_id)
  values (v_invite.chat_id, auth.uid())
  on conflict do nothing;

  update public.chat_invites
  set used_count = used_count + 1,
      is_active = case when v_member_count >= v_invite.max_participants then false else is_active end
  where id = v_invite.id;
  return jsonb_build_object(
    'chat', row_to_json(v_chat),
    'chat_secret', v_invite.chat_secret
  );
end;
$$;

create or replace function public.delete_expired_messages()
returns void
language sql
security definer
as $$
  delete from public.messages
  where expires_at is not null
    and expires_at < timezone('utc', now());
$$;
