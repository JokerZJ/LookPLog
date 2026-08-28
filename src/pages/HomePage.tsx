import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Cake, CloudSun, Sparkles, Thermometer } from 'lucide-react'
import { useClothing } from '../contexts/ClothingContext'
import { useSettings } from '../contexts/SettingsContext'
import { CATEGORY_LABELS } from '../types'
import { getTodayInfo } from '../utils/lunar'
import { recommendOutfit } from '../utils/recommend'
import { getTodayReminders } from '../utils/reminders'
import { fetchTodayWeather, getWeatherLabel, type WeatherInfo } from '../utils/weather'

export function HomePage() {
  const { items, loading } = useClothing()
  const { profile, friends, events, loading: settingsLoading } = useSettings()
  const today = useMemo(() => getTodayInfo(), [])
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    fetchTodayWeather()
      .then(setWeather)
      .finally(() => setWeatherLoading(false))
  }, [])

  const reminders = useMemo(
    () => getTodayReminders(profile, friends, events),
    [profile, friends, events],
  )

  const recommended = useMemo(() => {
    if (weather == null) return []
    return recommendOutfit(items, weather.temperature)
  }, [items, weather])

  return (
    <div className="px-4 pt-4 pb-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-neutral-400">LOOKPLOG</p>
          <h1 className="text-xl font-semibold text-neutral-900">今日</h1>
        </div>
        <Link
          to="/settings"
          className="text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
        >
          设置
        </Link>
      </header>

      {/* 日期与天气 */}
      <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-4xl font-light tracking-tight text-neutral-900">{today.day}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {today.year} 年 {today.month} 月 · 星期{today.weekday}
            </p>
            <p className="mt-2 text-lg font-semibold text-neutral-900">{today.lunarText}</p>
          </div>
          <div className="shrink-0 text-right">
            {weatherLoading ? (
              <p className="text-xs text-neutral-400">获取天气中…</p>
            ) : weather ? (
              <>
                <div className="flex items-center justify-end gap-1 text-neutral-900">
                  <Thermometer size={16} />
                  <span className="text-2xl font-medium">{weather.temperature}°C</span>
                </div>
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-neutral-500">
                  <CloudSun size={12} />
                  {getWeatherLabel(weather.weatherCode)}
                </p>
                <p className="mt-1 max-w-[140px] text-right text-[11px] leading-snug text-neutral-400">
                  {weather.address}
                </p>
              </>
            ) : (
              <p className="text-xs text-neutral-400">暂无法获取天气</p>
            )}
          </div>
        </div>
      </section>

      {/* 今日提醒 */}
      <section className="mb-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Bell size={14} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-900">今日提醒</h2>
        </div>
        {settingsLoading ? (
          <p className="text-xs text-neutral-400">加载提醒中…</p>
        ) : reminders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center">
            <p className="text-sm text-neutral-500">今天暂无特殊提醒</p>
            <Link to="/settings/birthdays" className="mt-1 inline-block text-xs text-neutral-700 underline">
              去添加生日与活动
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
              >
                <span
                  className={[
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    r.type === 'birthday' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600',
                  ].join(' ')}
                >
                  {r.type === 'birthday' ? <Cake size={16} /> : <Sparkles size={16} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{r.title}</p>
                  {r.subtitle && (
                    <p className="mt-0.5 text-xs text-neutral-500">{r.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 今日穿搭推荐 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">今日穿搭推荐</h2>
          {weather && (
            <span className="text-xs text-neutral-400">基于 {weather.temperature}°C</span>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400">加载衣橱中…</p>
        ) : !weather ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            无法获取气温，请检查定位权限后刷新
          </p>
        ) : recommended.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center">
            <p className="text-sm text-neutral-500">暂无匹配的推荐单品</p>
            <Link to="/add" className="mt-2 inline-block text-xs text-neutral-900 underline">
              去添加衣物并设置穿着温度
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recommended.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-neutral-900">{item.name}</p>
                  <p className="text-[10px] text-neutral-400">
                    {CATEGORY_LABELS[item.category]}
                    {item.tempMin != null && item.tempMax != null && (
                      <span> · {item.tempMin}~{item.tempMax}°C</span>
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
