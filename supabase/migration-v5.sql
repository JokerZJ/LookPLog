-- LookPlog v5：省钱价值配置表 + 单品价值扩展字段
-- 在 Supabase SQL Editor 中执行

-- 省钱价值配置（每用户一份，阈值与参考单价可扩展）
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

-- 单品价值扩展元数据（缓存省钱快照，便于后续扩展展示字段）
alter table public.clothing_items
  add column if not exists value_meta jsonb not null default '{}';
