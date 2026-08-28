import { supabase } from '../lib/supabase'

import type { ClothingItem, ClothingCategory, Season, Look, FittingItemTransform } from '../types'

import type { ClothingRow, CreateClothingInput, CreateLookInput, OutfitLookRow, UpdateClothingInput } from '../types/database'

import type { ClothingValueMeta, SavingsValueConfig } from '../types/savings'

import { DEFAULT_SAVINGS_CONFIG } from '../types/savings'

import { buildClothingValueMeta } from '../utils/savings'



function mapRow(row: ClothingRow): ClothingItem {

  return {

    id: row.id,

    name: row.name,

    imageUrl: row.image_url,

    price: Number(row.price),

    wearCount: row.wear_count,

    category: row.category as ClothingCategory,

    seasons: row.seasons as Season[],

    tempMin: row.temp_min,

    tempMax: row.temp_max,

    valueMeta: row.value_meta ?? {},

    createdAt: row.created_at,

  }

}



function buildValueMetaPayload(

  price: number,

  wearCount: number,

  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,

): ClothingValueMeta {

  return buildClothingValueMeta(price, wearCount, config)

}



function mapLookRow(row: OutfitLookRow): Look {

  return {

    id: row.id,

    name: row.name,

    imageUrl: row.image_url,

    totalPrice: Number(row.total_price),

    items: row.items as FittingItemTransform[],

    createdAt: row.created_at,

  }

}



export async function fetchClothingItems(): Promise<ClothingItem[]> {

  const { data, error } = await supabase

    .from('clothing_items')

    .select('*')

    .order('created_at', { ascending: false })



  if (error) throw error

  return (data as ClothingRow[]).map(mapRow)

}



export async function createClothingItem(

  input: CreateClothingInput,

  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,

): Promise<ClothingItem> {

  const {

    data: { user },

  } = await supabase.auth.getUser()

  if (!user) throw new Error('未登录')



  const valueMeta = buildValueMetaPayload(input.price, input.wearCount, config)



  const { data, error } = await supabase

    .from('clothing_items')

    .insert({

      user_id: user.id,

      name: input.name,

      image_url: input.imageUrl,

      price: input.price,

      wear_count: input.wearCount,

      category: input.category,

      seasons: input.seasons,

      temp_min: input.tempMin,

      temp_max: input.tempMax,

      value_meta: valueMeta,

    })

    .select()

    .single()



  if (error) throw error

  return mapRow(data as ClothingRow)

}



export async function updateClothingItem(

  id: string,

  input: UpdateClothingInput,

  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,

): Promise<ClothingItem> {

  const valueMeta = buildValueMetaPayload(input.price, input.wearCount, config)



  const { data, error } = await supabase

    .from('clothing_items')

    .update({

      name: input.name,

      image_url: input.imageUrl,

      price: input.price,

      wear_count: input.wearCount,

      category: input.category,

      seasons: input.seasons,

      temp_min: input.tempMin,

      temp_max: input.tempMax,

      value_meta: valueMeta,

    })

    .eq('id', id)

    .select()

    .single()



  if (error) throw error

  return mapRow(data as ClothingRow)

}



export async function incrementWearCount(

  id: string,

  currentCount: number,

  price: number,

  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,

): Promise<ClothingItem> {

  const newCount = currentCount + 1

  const valueMeta = buildValueMetaPayload(price, newCount, config)



  const { data, error } = await supabase

    .from('clothing_items')

    .update({

      wear_count: newCount,

      value_meta: valueMeta,

    })

    .eq('id', id)

    .select()

    .single()



  if (error) throw error

  return mapRow(data as ClothingRow)

}



export async function deleteClothingItem(id: string): Promise<void> {

  const { error } = await supabase.from('clothing_items').delete().eq('id', id)

  if (error) throw error

}



export async function uploadClothingImage(file: File, userId: string): Promise<string> {

  const ext = file.name.split('.').pop() ?? 'jpg'

  const path = `${userId}/${crypto.randomUUID()}.${ext}`



  const { error: uploadError } = await supabase.storage

    .from('clothing-images')

    .upload(path, file, { cacheControl: '3600', upsert: false })



  if (uploadError) throw uploadError



  const { data } = supabase.storage.from('clothing-images').getPublicUrl(path)

  return data.publicUrl

}



export async function uploadOutfitImage(blob: Blob, userId: string): Promise<string> {

  const path = `${userId}/${crypto.randomUUID()}.png`



  const { error: uploadError } = await supabase.storage

    .from('outfit-images')

    .upload(path, blob, { cacheControl: '3600', contentType: 'image/png', upsert: false })



  if (uploadError) throw uploadError



  const { data } = supabase.storage.from('outfit-images').getPublicUrl(path)

  return data.publicUrl

}



export async function fetchOutfitLooks(): Promise<Look[]> {

  const { data, error } = await supabase

    .from('outfit_looks')

    .select('*')

    .order('created_at', { ascending: false })



  if (error) throw error

  return (data as OutfitLookRow[]).map(mapLookRow)

}



export async function createOutfitLook(input: CreateLookInput): Promise<Look> {

  const {

    data: { user },

  } = await supabase.auth.getUser()

  if (!user) throw new Error('未登录')



  const { data, error } = await supabase

    .from('outfit_looks')

    .insert({

      user_id: user.id,

      name: input.name,

      image_url: input.imageUrl,

      total_price: input.totalPrice,

      items: input.items,

    })

    .select()

    .single()



  if (error) throw error

  return mapLookRow(data as OutfitLookRow)

}

