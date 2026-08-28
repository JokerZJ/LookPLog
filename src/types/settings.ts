/** 生日历法 */
export type CalendarType = 'solar' | 'lunar'

/** 好友生日 */
export interface FriendBirthday {
  id: string
  name: string
  month: number
  day: number
  isLunar: boolean
  createdAt: string
}

/** 特殊活动 */
export interface SpecialEvent {
  id: string
  title: string
  month: number
  day: number
  isLunar: boolean
  note: string | null
  createdAt: string
}

/** 用户个人设置 */
export interface UserProfile {
  birthdayMonth: number | null
  birthdayDay: number | null
  birthdayIsLunar: boolean
  birthdayRemindDays: number
}

/** 首页提醒项 */
export interface TodayReminder {
  id: string
  type: 'birthday' | 'event'
  title: string
  subtitle?: string
  daysUntil?: number
}

/** 生日列表展示项 */
export interface BirthdayListItem {
  id: string
  name: string
  month: number
  day: number
  isLunar: boolean
  isSelf: boolean
}

export const CALENDAR_TYPE_LABELS: Record<CalendarType, string> = {
  solar: '阳历',
  lunar: '农历',
}
