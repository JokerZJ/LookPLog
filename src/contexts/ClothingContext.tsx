import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ClothingItem } from '../types'
import type { CreateClothingInput, UpdateClothingInput } from '../types/database'
import type { SavingsValueConfig } from '../types/savings'
import { DEFAULT_SAVINGS_CONFIG } from '../types/savings'
import {
  createClothingItem,
  deleteClothingItem,
  fetchClothingItems,
  incrementWearCount,
  updateClothingItem,
} from '../services/clothing'
import { fetchSavingsConfig, upsertSavingsConfig } from '../services/savings'
import { useAuth } from './AuthContext'

interface ClothingContextValue {
  items: ClothingItem[]
  savingsConfig: SavingsValueConfig
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addItem: (input: CreateClothingInput) => Promise<ClothingItem>
  updateItem: (id: string, input: UpdateClothingInput) => Promise<ClothingItem>
  wearOnce: (id: string) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateSavingsConfig: (config: SavingsValueConfig) => Promise<SavingsValueConfig>
}

const ClothingContext = createContext<ClothingContextValue | null>(null)

export function ClothingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<ClothingItem[]>([])
  const [savingsConfig, setSavingsConfig] = useState<SavingsValueConfig>(DEFAULT_SAVINGS_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setItems([])
      setSavingsConfig(DEFAULT_SAVINGS_CONFIG)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [data, config] = await Promise.all([fetchClothingItems(), fetchSavingsConfig()])
      setItems(data)
      setSavingsConfig(config)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载衣橱失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addItem = useCallback(
    async (input: CreateClothingInput) => {
      const created = await createClothingItem(input, savingsConfig)
      setItems((prev) => [created, ...prev])
      return created
    },
    [savingsConfig],
  )

  const updateItem = useCallback(
    async (id: string, input: UpdateClothingInput) => {
      const updated = await updateClothingItem(id, input, savingsConfig)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    [savingsConfig],
  )

  const wearOnce = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id)
      if (!target) return
      const updated = await incrementWearCount(id, target.wearCount, target.price, savingsConfig)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
    },
    [items, savingsConfig],
  )

  const removeItem = useCallback(async (id: string) => {
    await deleteClothingItem(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateSavingsConfig = useCallback(async (config: SavingsValueConfig) => {
    const saved = await upsertSavingsConfig(config)
    setSavingsConfig(saved)
    return saved
  }, [])

  const value = useMemo(
    () => ({
      items,
      savingsConfig,
      loading,
      error,
      refetch,
      addItem,
      updateItem,
      wearOnce,
      removeItem,
      updateSavingsConfig,
    }),
    [items, savingsConfig, loading, error, refetch, addItem, updateItem, wearOnce, removeItem, updateSavingsConfig],
  )

  return <ClothingContext.Provider value={value}>{children}</ClothingContext.Provider>
}

export function useClothing() {
  const ctx = useContext(ClothingContext)
  if (!ctx) throw new Error('useClothing must be used within ClothingProvider')
  return ctx
}
