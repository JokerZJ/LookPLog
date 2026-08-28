import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FriendBirthday, SpecialEvent, UserProfile } from '../types/settings'
import type { CreateFriendBirthdayInput, CreateSpecialEventInput, UpdateUserProfileInput } from '../types/settings-database'
import {
  createFriendBirthday,
  createSpecialEvent,
  deleteFriendBirthday,
  deleteSpecialEvent,
  fetchFriendBirthdays,
  fetchSpecialEvents,
  fetchUserProfile,
  upsertUserProfile,
} from '../services/settings'
import { useAuth } from './AuthContext'

interface SettingsContextValue {
  profile: UserProfile
  friends: FriendBirthday[]
  events: SpecialEvent[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (input: UpdateUserProfileInput) => Promise<void>
  addFriend: (input: CreateFriendBirthdayInput) => Promise<void>
  removeFriend: (id: string) => Promise<void>
  addEvent: (input: CreateSpecialEventInput) => Promise<void>
  removeEvent: (id: string) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    birthdayMonth: null,
    birthdayDay: null,
    birthdayIsLunar: false,
    birthdayRemindDays: 3,
  })
  const [friends, setFriends] = useState<FriendBirthday[]>([])
  const [events, setEvents] = useState<SpecialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile({ birthdayMonth: null, birthdayDay: null, birthdayIsLunar: false, birthdayRemindDays: 3 })
      setFriends([])
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [p, f, e] = await Promise.all([
        fetchUserProfile(),
        fetchFriendBirthdays(),
        fetchSpecialEvents(),
      ])
      setProfile(p)
      setFriends(f)
      setEvents(e)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设置失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  const updateProfile = useCallback(async (input: UpdateUserProfileInput) => {
    const updated = await upsertUserProfile(input)
    setProfile(updated)
  }, [])

  const addFriend = useCallback(async (input: CreateFriendBirthdayInput) => {
    const created = await createFriendBirthday(input)
    setFriends((prev) => [created, ...prev])
  }, [])

  const removeFriend = useCallback(async (id: string) => {
    await deleteFriendBirthday(id)
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const addEvent = useCallback(async (input: CreateSpecialEventInput) => {
    const created = await createSpecialEvent(input)
    setEvents((prev) => [created, ...prev])
  }, [])

  const removeEvent = useCallback(async (id: string) => {
    await deleteSpecialEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      profile,
      friends,
      events,
      loading,
      error,
      refetch,
      updateProfile,
      addFriend,
      removeFriend,
      addEvent,
      removeEvent,
    }),
    [
      profile,
      friends,
      events,
      loading,
      error,
      refetch,
      updateProfile,
      addFriend,
      removeFriend,
      addEvent,
      removeEvent,
    ],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
