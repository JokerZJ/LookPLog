export interface FriendBirthdayRow {
  id: string
  user_id: string
  name: string
  month: number
  day: number
  is_lunar: boolean
  created_at: string
}

export interface SpecialEventRow {
  id: string
  user_id: string
  title: string
  month: number
  day: number
  is_lunar: boolean
  note: string | null
  created_at: string
}

export interface UserProfileRow {
  user_id: string
  birthday_month: number | null
  birthday_day: number | null
  birthday_is_lunar: boolean
  birthday_remind_days: number
  updated_at: string
}

export interface CreateFriendBirthdayInput {
  name: string
  month: number
  day: number
  isLunar: boolean
}

export interface CreateSpecialEventInput {
  title: string
  month: number
  day: number
  isLunar: boolean
  note?: string
}

export interface UpdateUserProfileInput {
  birthdayMonth?: number | null
  birthdayDay?: number | null
  birthdayIsLunar?: boolean
  birthdayRemindDays?: number
}
