import { useState, useEffect } from 'react'

const KEY = 'shokuzai_shopping'

export function useShoppingList() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  function addItem(name, note = '') {
    setItems(prev => {
      if (prev.some(i => i.name === name && !i.checked)) return prev
      return [...prev, { id: crypto.randomUUID(), name, note, checked: false }]
    })
  }

  function toggleItem(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clearChecked() {
    setItems(prev => prev.filter(i => !i.checked))
  }

  return { items, addItem, toggleItem, removeItem, clearChecked }
}
