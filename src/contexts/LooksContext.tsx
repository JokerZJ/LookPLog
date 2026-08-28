import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Look } from '../types'
import type { CreateLookInput } from '../types/database'
import { createOutfitLook, fetchOutfitLooks } from '../services/clothing'
import { useAuth } from './AuthContext'

interface LooksContextValue {
  looks: Look[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addLook: (input: CreateLookInput) => Promise<Look>
}

const LooksContext = createContext<LooksContextValue | null>(null)

export function LooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [looks, setLooks] = useState<Look[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setLooks([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOutfitLooks()
      setLooks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载穿搭失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addLook = useCallback(async (input: CreateLookInput) => {
    const created = await createOutfitLook(input)
    setLooks((prev) => [created, ...prev])
    return created
  }, [])

  const value = useMemo(
    () => ({ looks, loading, error, refetch, addLook }),
    [looks, loading, error, refetch, addLook],
  )

  return <LooksContext.Provider value={value}>{children}</LooksContext.Provider>
}

export function useLooks() {
  const ctx = useContext(LooksContext)
  if (!ctx) throw new Error('useLooks must be used within LooksProvider')
  return ctx
}
