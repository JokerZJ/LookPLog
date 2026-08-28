alter table public.user_profiles
  add column if not exists birthday_remind_days integer not null default 3
  check (birthday_remind_days >= 0 and birthday_remind_days <= 30);
