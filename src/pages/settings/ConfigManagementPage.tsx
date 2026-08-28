import { useEffect, useState, type FormEvent } from 'react'
import { SettingsBackHeader } from '../../components/settings/SettingsBackHeader'
import { useClothing } from '../../contexts/ClothingContext'
import { useSettings } from '../../contexts/SettingsContext'
import { buildSavingsConfigFromInputs, getGreatGainThreshold } from '../../utils/savings'

export function ConfigManagementPage() {
  const { profile, loading: settingsLoading, updateProfile } = useSettings()
  const { savingsConfig, loading: clothingLoading, updateSavingsConfig } = useClothing()
  const [days, setDays] = useState(3)
  const [greatGainThreshold, setGreatGainThreshold] = useState(1)
  const [extraWearSavings, setExtraWearSavings] = useState(20)
  const [tip, setTip] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setDays(profile.birthdayRemindDays)
  }, [profile.birthdayRemindDays])

  useEffect(() => {
    setGreatGainThreshold(getGreatGainThreshold(savingsConfig))
    setExtraWearSavings(savingsConfig.extraWearSavings)
  }, [savingsConfig])

  const loading = settingsLoading || clothingLoading

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (greatGainThreshold <= 0) {
      setTip('血赚均价上限需大于 0')
      return
    }
    if (extraWearSavings <= 0) {
      setTip('每次省钱额度需大于 0')
      return
    }

    setSubmitting(true)
    setTip('')
    try {
      await updateProfile({ birthdayRemindDays: days })
      await updateSavingsConfig(
        buildSavingsConfigFromInputs(greatGainThreshold, extraWearSavings, savingsConfig),
      )
      setTip('配置已保存')
    } catch (err) {
      setTip(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-400">加载中…</div>
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <SettingsBackHeader title="配置管理" subtitle="CONFIG" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-medium text-neutral-900">生日提前提醒</h2>
          <p className="mb-4 text-xs leading-relaxed text-neutral-500">
            设置后在首页提前显示「N 天后是 XX 的生日」。生日当天始终会提醒，不受此配置影响。
          </p>

          <label className="mb-2 block text-xs text-neutral-500">提前天数（0–30 天）</label>
          <div className="mb-4 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex-1 accent-neutral-900"
            />
            <span className="w-12 text-center text-lg font-semibold text-neutral-900">{days}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[0, 1, 3, 7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={[
                  'rounded-full px-3 py-1 text-xs',
                  days === d
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-200 text-neutral-500',
                ].join(' ')}
              >
                {d === 0 ? '仅当天' : `${d} 天`}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-medium text-neutral-900">省钱配置</h2>
          <p className="mb-4 text-xs leading-relaxed text-neutral-500">
            均价低于血赚上限时进入「血赚」状态；此后每多穿一次，按下方额度累计省钱。
          </p>

          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs text-neutral-500">血赚均价上限（元/次）</span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={greatGainThreshold}
                onChange={(e) => setGreatGainThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-neutral-500">血赚后每穿一次省钱（元）</span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={extraWearSavings}
                onChange={(e) => setExtraWearSavings(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
              />
            </label>
          </div>

          <p className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
            示例：购买价 ¥100、血赚上限 ¥1/次，穿着 {Math.floor(100 / greatGainThreshold) + 1}{' '}
            次进入血赚；之后每穿一次累计省 ¥{extraWearSavings}。
          </p>
        </section>

        {tip && <p className="text-xs text-neutral-600">{tip}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? '保存中…' : '保存配置'}
        </button>
      </form>
    </div>
  )
}
