-- LookPlog v3：好友生日、特殊活动、用户资料
-- 在 Supabase SQL Editor 中执行

-- 用户资料（含本人生日）
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birthday_month integer check (birthday_month between 1 and 12),
  birthday_day integer check (birthday_day between 1 and 31),
  birthday_is_lunar boolean not null default false,
  birthday_remind_days integer not null default 3 check (birthday_remind_days >= 0 and birthday_remind_days <= 30),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "profile_select_own"
  on public.user_profiles for select using (auth.uid() = user_id);
create policy "profile_insert_own"
  on public.user_profiles for insert with check (auth.uid() = user_id);
create policy "profile_update_own"
  on public.user_profiles for update using (auth.uid() = user_id);

-- 好友生日
create table if not exists public.friend_birthdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  month integer not null check (month between 1 and 12),
  day integer not null check (day between 1 and 31),
  is_lunar boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists friend_birthdays_user_id_idx on public.friend_birthdays (user_id);
alter table public.friend_birthdays enable row level security;

create policy "friend_birthday_select_own"
  on public.friend_birthdays for select using (auth.uid() = user_id);
create policy "friend_birthday_insert_own"
  on public.friend_birthdays for insert with check (auth.uid() = user_id);
create policy "friend_birthday_update_own"
  on public.friend_birthdays for update using (auth.uid() = user_id);
create policy "friend_birthday_delete_own"
  on public.friend_birthdays for delete using (auth.uid() = user_id);

-- 特殊活动
create table if not exists public.special_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  month integer not null check (month between 1 and 12),
  day integer not null check (day between 1 and 31),
  is_lunar boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists special_events_user_id_idx on public.special_events (user_id);
alter table public.special_events enable row level security;

create policy "special_event_select_own"
  on public.special_events for select using (auth.uid() = user_id);
create policy "special_event_insert_own"
  on public.special_events for insert with check (auth.uid() = user_id);
create policy "special_event_update_own"
  on public.special_events for update using (auth.uid() = user_id);
create policy "special_event_delete_own"
  on public.special_events for delete using (auth.uid() = user_id);
