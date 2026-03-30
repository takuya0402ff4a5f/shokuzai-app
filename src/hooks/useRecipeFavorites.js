import { useState, useEffect } from 'react'

const KEY = 'shokuzai_favorites'

export function useRecipeFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...favorites]))
  }, [favorites])

  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return { favorites, toggleFavorite }
}
