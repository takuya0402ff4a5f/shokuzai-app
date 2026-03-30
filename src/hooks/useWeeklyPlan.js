import { useState, useEffect } from 'react'

const KEY = 'shokuzai_weekly_plan'
export const DAYS = ['月', '火', '水', '木', '金', '土', '日']

function emptyPlan() {
  return Object.fromEntries(DAYS.map(d => [d, { breakfast: [], lunch: [], dinner: [] }]))
}

// 旧形式（null or 単一オブジェクト）を配列に変換
function migrate(raw) {
  return DAYS.reduce((acc, day) => {
    acc[day] = {}
    for (const slot of ['breakfast', 'lunch', 'dinner']) {
      const val = raw[day]?.[slot]
      if (!val) acc[day][slot] = []
      else if (Array.isArray(val)) acc[day][slot] = val
      else acc[day][slot] = [val]
    }
    return acc
  }, {})
}

export function useWeeklyPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? migrate(JSON.parse(saved)) : emptyPlan()
    } catch {
      return emptyPlan()
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(plan))
  }, [plan])

  function addMeal(day, slot, recipe) {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: [...(prev[day]?.[slot] ?? []), { id: recipe.id, name: recipe.name, category: recipe.category }],
      },
    }))
  }

  function removeMealItem(day, slot, recipeId) {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: (prev[day]?.[slot] ?? []).filter(m => m.id !== recipeId),
      },
    }))
  }

  function clearMeal(day, slot) {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: [] },
    }))
  }

  function clearAll() {
    setPlan(emptyPlan())
  }

  return { plan, addMeal, removeMealItem, clearMeal, clearAll }
}
