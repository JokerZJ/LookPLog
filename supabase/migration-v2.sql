-- 已有项目升级脚本（在 schema.sql 之后若已建过旧表，执行此文件）

-- 扩展品类约束
alter table public.clothing_items drop constraint if exists clothing_items_category_check;
alter table public.clothing_items add constraint clothing_items_category_check
  check (category in ('top', 'bottom', 'outerwear', 'dress'));

-- 新增推荐穿着温度
alter table public.clothing_items add column if not exists temp_min integer;
alter table public.clothing_items add column if not exists temp_max integer;

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

drop policy if exists "outfit_select_own" on public.outfit_looks;
drop policy if exists "outfit_insert_own" on public.outfit_looks;
drop policy if exists "outfit_update_own" on public.outfit_looks;
drop policy if exists "outfit_delete_own" on public.outfit_looks;

create policy "outfit_select_own"
  on public.outfit_looks for select using (auth.uid() = user_id);
create policy "outfit_insert_own"
  on public.outfit_looks for insert with check (auth.uid() = user_id);
create policy "outfit_update_own"
  on public.outfit_looks for update using (auth.uid() = user_id);
create policy "outfit_delete_own"
  on public.outfit_looks for delete using (auth.uid() = user_id);

-- 穿搭截图存储桶
insert into storage.buckets (id, name, public)
values ('outfit-images', 'outfit-images', true)
on conflict (id) do nothing;

drop policy if exists "outfit_images_select" on storage.objects;
drop policy if exists "outfit_images_insert" on storage.objects;
drop policy if exists "outfit_images_update" on storage.objects;
drop policy if exists "outfit_images_delete" on storage.objects;

create policy "outfit_images_select"
  on storage.objects for select using (bucket_id = 'outfit-images');
create policy "outfit_images_insert"
  on storage.objects for insert with check (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "outfit_images_update"
  on storage.objects for update using (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "outfit_images_delete"
  on storage.objects for delete using (
    bucket_id = 'outfit-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
