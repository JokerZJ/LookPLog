-- LookPlog 数据库初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 服装单品表
create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  image_url text not null,
  price numeric(10, 2) not null default 0,
  wear_count integer not null default 0,
  category text not null check (category in ('top', 'bottom', 'outerwear', 'dress')),
  seasons text[] not null default '{}',
  temp_min integer,
  temp_max integer,
  value_meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists clothing_items_user_id_idx on public.clothing_items (user_id);

alter table public.clothing_items enable row level security;

create policy "clothing_select_own"
  on public.clothing_items for select
  using (auth.uid() = user_id);

create policy "clothing_insert_own"
  on public.clothing_items for insert
  with check (auth.uid() = user_id);

create policy "clothing_update_own"
  on public.clothing_items for update
  using (auth.uid() = user_id);

create policy "clothing_delete_own"
  on public.clothing_items for delete
  using (auth.uid() = user_id);

-- 省钱价值配置（每用户一份）
create table if not exists public.savings_value_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reference_cost_per_wear numeric(10, 2) not null default 20,
  extra_wear_savings numeric(10, 2) not null default 20,
  tiers jsonb not null default '[
    {"key": "break_even", "label": "回本", "max_cost_per_wear": 20},
    {"key": "net_gain", "label": "净赚", "max_cost_per_wear": 5},
    {"key": "great_gain", "label": "血赚", "max_cost_per_wear": 1}
  ]'::jsonb,
  display jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.savings_value_config enable row level security;

create policy "savings_config_select_own"
  on public.savings_value_config for select using (auth.uid() = user_id);
create policy "savings_config_insert_own"
  on public.savings_value_config for insert with check (auth.uid() = user_id);
create policy "savings_config_update_own"
  on public.savings_value_config for update using (auth.uid() = user_id);

-- 穿搭案例表
create table if not exists public.outfit_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  image_url text not null,
  total_price numeric(10, 2) not null default 0,
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists outfit_looks_user_id_idx on public.outfit_looks (user_id);

alter table public.outfit_looks enable row level security;

create policy "outfit_select_own"
  on public.outfit_looks for select
  using (auth.uid() = user_id);

create policy "outfit_insert_own"
  on public.outfit_looks for insert
  with check (auth.uid() = user_id);

create policy "outfit_update_own"
  on public.outfit_looks for update
  using (auth.uid() = user_id);

create policy "outfit_delete_own"
  on public.outfit_looks for delete
  using (auth.uid() = user_id);

-- 服装图片存储桶
insert into storage.buckets (id, name, public)
values ('clothing-images', 'clothing-images', true)
on conflict (id) do nothing;

create policy "clothing_images_select"
  on storage.objects for select
  using (bucket_id = 'clothing-images');

create policy "clothing_images_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'clothing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "clothing_images_update"
  on storage.objects for update
  using (
    bucket_id = 'clothing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "clothing_images_delete"
  on storage.objects for delete
  using (
    bucket_id = 'clothing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 穿搭截图存储桶
insert into storage.buckets (id, name, public)
values ('outfit-images', 'outfit-images', true)
on conflict (id) do nothing;

create policy "outfit_images_select"
  on storage.objects for select
  using (bucket_id = 'outfit-images');

create policy "outfit_images_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "outfit_images_update"
  on storage.objects for update
  using (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "outfit_images_delete"
  on storage.objects for delete
  using (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
