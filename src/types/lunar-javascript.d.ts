declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar
    getLunar(): Lunar
  }

  export class Lunar {
    getMonth(): number
    getDay(): number
    getMonthInChinese(): string
    getDayInChinese(): string
    toString(): string
  }
}
