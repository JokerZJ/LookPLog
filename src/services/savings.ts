import { supabase } from '../lib/supabase'
import type { SavingsTier, SavingsValueConfig } from '../types/savings'
import { DEFAULT_SAVINGS_CONFIG } from '../types/savings'

interface SavingsConfigRow {
  user_id: string
  reference_cost_per_wear: number
  extra_wear_savings: number
  tiers: Array<{ key: string; label: string; max_cost_per_wear: number }>
  display: Record<string, unknown>
}

function mapTiers(raw: SavingsConfigRow['tiers']): SavingsTier[] {
  return raw.map((t) => ({
    key: t.key as SavingsTier['key'],
    label: t.label,
    maxCostPerWear: Number(t.max_cost_per_wear),
  }))
}

function mapRow(row: SavingsConfigRow): SavingsValueConfig {
  return {
    referenceCostPerWear: Number(row.reference_cost_per_wear),
    extraWearSavings: Number(row.extra_wear_savings),
    tiers: mapTiers(row.tiers),
    display: row.display ?? {},
  }
}

export async function fetchSavingsConfig(): Promise<SavingsValueConfig> {
  const { data, error } = await supabase.from('savings_value_config').select('*').maybeSingle()

  if (error) {
    if (error.code === 'PGRST116' || error.code === '42P01') {
      return DEFAULT_SAVINGS_CONFIG
    }
    throw error
  }

  if (!data) return DEFAULT_SAVINGS_CONFIG
  return mapRow(data as SavingsConfigRow)
}

export async function upsertSavingsConfig(config: SavingsValueConfig): Promise<SavingsValueConfig> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')

  const payload = {
    user_id: user.id,
    reference_cost_per_wear: config.referenceCostPerWear,
    extra_wear_savings: config.extraWearSavings,
    tiers: config.tiers.map((t) => ({
      key: t.key,
      label: t.label,
      max_cost_per_wear: t.maxCostPerWear,
    })),
    display: config.display,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('savings_value_config')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return mapRow(data as SavingsConfigRow)
}
