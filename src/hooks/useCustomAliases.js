import { useState, useEffect } from 'react'

const KEY = 'shokuzai_custom_aliases'

export function useCustomAliases() {
  const [aliases, setAliases] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (!saved) return []
      // 旧フォーマット ({ from, to }) も priority デフォルト補完
      return JSON.parse(saved).map(a => ({ priority: 'from_first', ...a }))
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(aliases))
  }, [aliases])

  function addAlias(from, to, priority = 'from_first') {
    if (!from.trim() || !to.trim()) return
    setAliases(prev => [...prev, { from: from.trim(), to: to.trim(), priority }])
  }

  function removeAlias(index) {
    setAliases(prev => prev.filter((_, i) => i !== index))
  }

  function updateAliasPriority(index, priority) {
    setAliases(prev => prev.map((a, i) => i === index ? { ...a, priority } : a))
  }

  return { aliases, addAlias, removeAlias, updateAliasPriority }
}
