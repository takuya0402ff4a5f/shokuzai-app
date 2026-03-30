import { useState, useEffect } from 'react'

const STORAGE_KEY = 'shokuzai_custom_recipes'

export function useCustomRecipes() {
  const [customRecipes, setCustomRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customRecipes))
  }, [customRecipes])

  function addCustomRecipe(recipe) {
    const newRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    }
    setCustomRecipes(prev => [newRecipe, ...prev])
  }

  function updateCustomRecipe(id, recipe) {
    setCustomRecipes(prev => prev.map(r => r.id === id ? { ...r, ...recipe } : r))
  }

  function deleteCustomRecipe(id) {
    setCustomRecipes(prev => prev.filter(r => r.id !== id))
  }

  return { customRecipes, addCustomRecipe, updateCustomRecipe, deleteCustomRecipe }
}
