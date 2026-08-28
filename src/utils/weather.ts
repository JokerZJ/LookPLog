export interface WeatherInfo {
  temperature: number
  weatherCode: number
  address: string
}

const DEFAULT_LAT = 31.23
const DEFAULT_LON = 121.47

const WEATHER_LABELS: Record<number, string> = {
  0: '晴',
  1: '少云',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '小雨',
  53: '中雨',
  55: '大雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '阵雨',
  81: '阵雨',
  82: '暴雨',
  95: '雷雨',
}

export function getWeatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? '未知'
}

function formatAddress(address: Record<string, string>): string {
  const parts = [
    address.state || address.province,
    address.city || address.town || address.county,
    address.district || address.suburb || address.borough,
    address.road || address.neighbourhood,
  ].filter(Boolean)
  const unique = [...new Set(parts)]
  return unique.join(' ') || '未知位置'
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('format', 'json')
  url.searchParams.set('accept-language', 'zh-CN')

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'zh-CN' },
  })
  if (!res.ok) throw new Error('获取地址失败')

  const data = await res.json()
  if (data.display_name) {
    const short = formatAddress(data.address ?? {})
    return short || data.display_name.split(',').slice(0, 3).join(' ')
  }
  return '未知位置'
}

export async function fetchWeather(lat: number, lon: number): Promise<Omit<WeatherInfo, 'address'>> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url)
  if (!res.ok) throw new Error('获取气温失败')

  const data = await res.json()
  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
  }
}

export function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => reject(new Error('定位失败')),
      { timeout: 10000, maximumAge: 300000 },
    )
  })
}

export async function fetchTodayWeather(): Promise<WeatherInfo | null> {
  try {
    const coords = await getCurrentPosition()
    const [weather, address] = await Promise.all([
      fetchWeather(coords.latitude, coords.longitude),
      reverseGeocode(coords.latitude, coords.longitude).catch(() => '当前位置'),
    ])
    return { ...weather, address }
  } catch {
    try {
      const [weather, address] = await Promise.all([
        fetchWeather(DEFAULT_LAT, DEFAULT_LON),
        reverseGeocode(DEFAULT_LAT, DEFAULT_LON).catch(() => '上海市'),
      ])
      return { ...weather, address }
    } catch {
      return null
    }
  }
}
