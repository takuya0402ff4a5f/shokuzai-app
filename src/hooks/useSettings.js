import { useState, useEffect } from 'react'

const SETTINGS_KEY = 'shokuzai_settings'

export const DEFAULT_SETTINGS = {
  // 調味料タブでさしすせそを上位表示するか
  condimentSort: true,
  // 週間献立カレンダーの開始曜日
  weekStartsOnSunday: false,
  // 残量0%で自動削除するか
  autoDeleteZero: false,
  // 組み込み代替ペアの優先度（キー: fresh 側の名前）
  pairPriorities: {
    'ブロッコリー': 'fresh_first',
    'ほうれん草':   'fresh_first',
    '枝豆':         'fresh_first',
  },
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (!saved) return DEFAULT_SETTINGS
      const parsed = JSON.parse(saved)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // ネストオブジェクトはデフォルトとマージして欠損キーを補完
        pairPriorities: { ...DEFAULT_SETTINGS.pairPriorities, ...(parsed.pairPriorities ?? {}) },
      }
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return { settings, updateSetting }
}
