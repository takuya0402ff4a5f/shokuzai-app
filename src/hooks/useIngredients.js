import { useState, useEffect } from 'react'
import { calcDeduction } from '../utils/units'
import { getCandidateNames } from '../data/ingredientAliases'

const STORAGE_KEY = 'shokuzai_ingredients'

export function useIngredients(autoDeleteZero = false) {
  const [ingredients, setIngredients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients))
  }, [ingredients])

  function addIngredient(ingredient) {
    setIngredients(prev => {
      const existing = prev.find(item => item.name === ingredient.name)
      if (existing) {
        // 新規量を既存のtotalUnitに換算する
        // まず既存のrefAmountで試み、ダメなら新規のrefAmountで試みる
        let newAmountInExistingUnit = calcDeduction(ingredient.totalAmount, ingredient.totalUnit, existing)
        if (newAmountInExistingUnit == null && ingredient.refAmount) {
          const bridge = { ...existing, refAmount: ingredient.refAmount }
          newAmountInExistingUnit = calcDeduction(ingredient.totalAmount, ingredient.totalUnit, bridge)
        }
        if (newAmountInExistingUnit == null) {
          // 単位換算できない場合は別エントリとして追加
          const newItem = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...ingredient,
          }
          return [newItem, ...prev]
        }
        const existingRemaining = existing.totalAmount * (existing.remainingPercent / 100)
        const newTotal = existingRemaining + newAmountInExistingUnit
        const earlierExpiry = existing.expiryDate && ingredient.expiryDate
          ? (existing.expiryDate < ingredient.expiryDate ? existing.expiryDate : ingredient.expiryDate)
          : (existing.expiryDate || ingredient.expiryDate)
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, totalAmount: newTotal, remainingPercent: 100, expiryDate: earlierExpiry }
            : item
        )
      }
      const newItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...ingredient,
      }
      return [newItem, ...prev]
    })
  }

  function updateIngredient(id, updates) {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  function deleteIngredient(id) {
    setIngredients(prev => prev.filter(item => item.id !== id))
  }

  function consumeIngredient(id, newPercent) {
    if (newPercent <= 0) {
      if (autoDeleteZero) {
        setIngredients(prev => prev.filter(item => item.id !== id))
      } else if (confirm('使い切りました。リストから削除しますか？')) {
        setIngredients(prev => prev.filter(item => item.id !== id))
      } else {
        setIngredients(prev =>
          prev.map(item => (item.id === id ? { ...item, remainingPercent: 0 } : item))
        )
      }
    } else {
      setIngredients(prev =>
        prev.map(item => (item.id === id ? { ...item, remainingPercent: newPercent } : item))
      )
    }
  }

  // レシピの材料を一括消込（エイリアス対応）
  // recipeIngredients: [{ name, amount, unit }]
  // multiplier: 人数倍率
  // customAliases: [{ from, to, priority }]
  function bulkConsumeIngredients(recipeIngredients, multiplier = 1, customAliases = [], pairPriorities = {}) {
    setIngredients(prev => {
      let updated = [...prev]

      for (const item of recipeIngredients) {
        // 適量はスキップ（消費なし）
        if (item.unit === '適量') continue

        let remainingToConsume = item.amount * multiplier // まだ消費すべき量（item.unit単位）

        // ペアごとの優先設定に基づいた消費候補リスト
        const candidates = getCandidateNames(item.name, customAliases, pairPriorities)
          .map(name => updated.find(i => i.name === name))
          .filter(Boolean)

        for (const ingredient of candidates) {
          if (remainingToConsume <= 0) break

          const deductInTotalUnit = calcDeduction(remainingToConsume, item.unit, ingredient)
          if (deductInTotalUnit == null || deductInTotalUnit <= 0) continue

          const totalRemaining = ingredient.totalAmount * (ingredient.remainingPercent / 100)

          if (deductInTotalUnit <= totalRemaining) {
            // このエントリで全量まかなえる
            const newRemaining = totalRemaining - deductInTotalUnit
            const newPercent = Math.round((newRemaining / ingredient.totalAmount) * 100)
            updated = updated.map(i =>
              i.id === ingredient.id ? { ...i, remainingPercent: newPercent } : i
            )
            remainingToConsume = 0
          } else {
            // 在庫が足りない → 全部使い切り、残りを次のエントリへ
            const fractionCovered = totalRemaining / deductInTotalUnit
            updated = updated.map(i =>
              i.id === ingredient.id ? { ...i, remainingPercent: 0 } : i
            )
            remainingToConsume = remainingToConsume * (1 - fractionCovered)
          }
        }
      }

      if (autoDeleteZero) {
        return updated.filter(i => i.remainingPercent > 0)
      }
      return updated
    })
  }

  return { ingredients, addIngredient, updateIngredient, deleteIngredient, consumeIngredient, bulkConsumeIngredients }
}
