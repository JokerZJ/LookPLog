import { supabase } from '../lib/supabase'
import type { FriendBirthday, SpecialEvent, UserProfile } from '../types/settings'
import type {
  CreateFriendBirthdayInput,
  CreateSpecialEventInput,
  FriendBirthdayRow,
  SpecialEventRow,
  UpdateUserProfileInput,
  UserProfileRow,
} from '../types/settings-database'

const defaultProfile: UserProfile = {
  birthdayMonth: null,
  birthdayDay: null,
  birthdayIsLunar: false,
  birthdayRemindDays: 3,
}

function mapFriend(row: FriendBirthdayRow): FriendBirthday {
  return {
    id: row.id,
    name: row.name,
    month: row.month,
    day: row.day,
    isLunar: row.is_lunar,
    createdAt: row.created_at,
  }
}

function mapEvent(row: SpecialEventRow): SpecialEvent {
  return {
    id: row.id,
    title: row.title,
    month: row.month,
    day: row.day,
    isLunar: row.is_lunar,
    note: row.note,
    createdAt: row.created_at,
  }
}

function mapProfile(row: UserProfileRow | null): UserProfile {
  if (!row) return defaultProfile
  return {
    birthdayMonth: row.birthday_month,
    birthdayDay: row.birthday_day,
    birthdayIsLunar: row.birthday_is_lunar,
    birthdayRemindDays: row.birthday_remind_days ?? 3,
  }
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return defaultProfile

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return mapProfile(data as UserProfileRow | null)
}

export async function upsertUserProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')

  const current = await fetchUserProfile()
  const payload = {
    user_id: user.id,
    birthday_month: input.birthdayMonth ?? current.birthdayMonth,
    birthday_day: input.birthdayDay ?? current.birthdayDay,
    birthday_is_lunar: input.birthdayIsLunar ?? current.birthdayIsLunar,
    birthday_remind_days: input.birthdayRemindDays ?? current.birthdayRemindDays,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(payload)
    .select()
    .single()

  if (error) throw error
  return mapProfile(data as UserProfileRow)
}

export async function fetchFriendBirthdays(): Promise<FriendBirthday[]> {
  const { data, error } = await supabase
    .from('friend_birthdays')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as FriendBirthdayRow[]).map(mapFriend)
}

export async function createFriendBirthday(input: CreateFriendBirthdayInput): Promise<FriendBirthday> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')

  const { data, error } = await supabase
    .from('friend_birthdays')
    .insert({
      user_id: user.id,
      name: input.name,
      month: input.month,
      day: input.day,
      is_lunar: input.isLunar,
    })
    .select()
    .single()

  if (error) throw error
  return mapFriend(data as FriendBirthdayRow)
}

export async function deleteFriendBirthday(id: string): Promise<void> {
  const { error } = await supabase.from('friend_birthdays').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSpecialEvents(): Promise<SpecialEvent[]> {
  const { data, error } = await supabase
    .from('special_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as SpecialEventRow[]).map(mapEvent)
}

export async function createSpecialEvent(input: CreateSpecialEventInput): Promise<SpecialEvent> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')

  const { data, error } = await supabase
    .from('special_events')
    .insert({
      user_id: user.id,
      title: input.title,
      month: input.month,
      day: input.day,
      is_lunar: input.isLunar,
      note: input.note ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return mapEvent(data as SpecialEventRow)
}

export async function deleteSpecialEvent(id: string): Promise<void> {
  const { error } = await supabase.from('special_events').delete().eq('id', id)
  if (error) throw error
}
