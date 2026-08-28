import type { FriendBirthday, SpecialEvent, TodayReminder, UserProfile } from '../types/settings'
import { getDaysUntilDate, isDateMatch } from './lunar'

function pushBirthdayReminder(
  reminders: TodayReminder[],
  id: string,
  name: string,
  daysUntil: number,
  isLunar: boolean,
  advanceDays: number,
) {
  const calendarLabel = isLunar ? '农历' : '阳历'

  if (daysUntil === 0) {
    reminders.push({
      id,
      type: 'birthday',
      title: name === '你' ? '今天是你的生日' : `今天是 ${name} 的生日`,
      subtitle: calendarLabel,
      daysUntil: 0,
    })
    return
  }

  if (daysUntil > 0 && daysUntil <= advanceDays) {
    reminders.push({
      id: `${id}-advance`,
      type: 'birthday',
      title: `${daysUntil} 天后是 ${name === '你' ? '你的' : `${name} 的`}生日`,
      subtitle: calendarLabel,
      daysUntil,
    })
  }
}

export function getTodayReminders(
  profile: UserProfile,
  friends: FriendBirthday[],
  events: SpecialEvent[],
  date = new Date(),
): TodayReminder[] {
  const reminders: TodayReminder[] = []
  const advanceDays = profile.birthdayRemindDays

  if (profile.birthdayMonth != null && profile.birthdayDay != null) {
    const daysUntil = getDaysUntilDate(
      profile.birthdayMonth,
      profile.birthdayDay,
      profile.birthdayIsLunar,
      date,
    )
    if (daysUntil >= 0) {
      pushBirthdayReminder(
        reminders,
        'self-birthday',
        '你',
        daysUntil,
        profile.birthdayIsLunar,
        advanceDays,
      )
    }
  }

  for (const friend of friends) {
    const daysUntil = getDaysUntilDate(friend.month, friend.day, friend.isLunar, date)
    if (daysUntil >= 0) {
      pushBirthdayReminder(
        reminders,
        `friend-${friend.id}`,
        friend.name,
        daysUntil,
        friend.isLunar,
        advanceDays,
      )
    }
  }

  for (const event of events) {
    if (isDateMatch(event.month, event.day, event.isLunar, date)) {
      reminders.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        subtitle: event.isLunar
          ? `农历 ${event.month} 月 ${event.day} 日`
          : event.note ?? '特殊活动',
        daysUntil: 0,
      })
    }
  }

  return reminders.sort((a, b) => {
    const da = a.daysUntil ?? 999
    const db = b.daysUntil ?? 999
    if (da !== db) return da - db
    if (a.type === 'birthday' && b.type !== 'birthday') return -1
    if (a.type !== 'birthday' && b.type === 'birthday') return 1
    return 0
  })
}
