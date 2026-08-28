export interface ClothingRow {
  id: string
  user_id: string
  name: string
  image_url: string
  price: number
  wear_count: number
  category: string
  seasons: string[]
  temp_min: number | null
  temp_max: number | null
  value_meta: Record<string, unknown> | null
  created_at: string
}

export interface CreateClothingInput {
  name: string
  imageUrl: string
  price: number
  wearCount: number
  category: string
  seasons: string[]
  tempMin: number | null
  tempMax: number | null
}

export interface UpdateClothingInput {
  name: string
  imageUrl: string
  price: number
  wearCount: number
  category: string
  seasons: string[]
  tempMin: number | null
  tempMax: number | null
}

export interface OutfitLookRow {
  id: string
  user_id: string
  name: string
  image_url: string
  total_price: number
  items: unknown
  created_at: string
}

export interface CreateLookInput {
  name: string
  imageUrl: string
  totalPrice: number
  items: unknown
}
