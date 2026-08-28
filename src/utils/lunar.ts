import { Solar } from 'lunar-javascript'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getTodayInfo(date = new Date()) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: WEEKDAYS[date.getDay()],
    lunarText: `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    lunarFull: lunar.toString(),
  }
}

/** 判断月日是否匹配（支持农历/阳历） */
export function isDateMatch(
  month: number,
  day: number,
  isLunar: boolean,
  date = new Date(),
): boolean {
  return getDaysUntilDate(month, day, isLunar, date) === 0
}

/** 距离下一次该月日还有多少天（0 = 今天） */
export function getDaysUntilDate(
  month: number,
  day: number,
  isLunar: boolean,
  from = new Date(),
): number {
  const start = startOfDay(from)

  if (!isLunar) {
    const year = start.getFullYear()
    let target = new Date(year, month - 1, day)
    if (target < start) {
      target = new Date(year + 1, month - 1, day)
    }
    return Math.round((target.getTime() - start.getTime()) / 86400000)
  }

  for (let i = 0; i <= 366; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const lunar = Solar.fromDate(d).getLunar()
    if (Math.abs(lunar.getMonth()) === month && lunar.getDay() === day) {
      return i
    }
  }
  return -1
}
