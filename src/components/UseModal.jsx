import { useState } from 'react'
import { getCompatibleUnits, convertToUnit, getUnitGroup, formatAmount } from '../utils/units'

export default function UseModal({ ingredient, onUse, onClose }) {
  const hasRefAmount = !!ingredient.refAmount
  const compatibleUnits = getCompatibleUnits(ingredient.totalUnit, hasRefAmount)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState(ingredient.totalUnit)

  const totalRemaining = ingredient.totalAmount * (ingredient.remainingPercent / 100)

  // count単位でgを選んだとき、refAmountで換算
  function convertUsed(usedAmount, fromUnit) {
    const isCountUnit = getUnitGroup(ingredient.totalUnit) === 'count'
    if (isCountUnit && fromUnit === 'g' && ingredient.refAmount) {
      return usedAmount / ingredient.refAmount
    }
    return convertToUnit(usedAmount, fromUnit, ingredient.totalUnit)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const usedInTotalUnit = convertUsed(Number(amount), unit)
    if (usedInTotalUnit == null || usedInTotalUnit <= 0) return
    const newRemaining = Math.max(0, totalRemaining - usedInTotalUnit)
    const newPercent = Math.round((newRemaining / ingredient.totalAmount) * 100)
    onUse(ingredient.id, newPercent)
    onClose()
  }

  const previewUsed = amount ? convertUsed(Number(amount), unit) : null
  const previewRemaining = previewUsed != null ? Math.max(0, totalRemaining - previewUsed) : null

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md mx-auto rounded-t-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-1">使う量を入力</h2>
        <p className="text-sm text-gray-500 mb-4">
          {ingredient.name}（現在: {formatAmount(totalRemaining, ingredient.totalUnit)}）
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">使う量</label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="例: 1、100"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
              />
            </div>
            {compatibleUnits.length > 1 ? (
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
                >
                  {compatibleUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="w-24 flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">
                  {compatibleUnits[0]}
                </div>
              </div>
            )}
          </div>

          {previewRemaining != null && (
            <div className="bg-[#fff8ed] rounded-lg px-4 py-3 text-sm text-[#c97f00]">
              使用後の残量: <strong>{formatAmount(previewRemaining, ingredient.totalUnit)}</strong>
              （{Math.round((previewRemaining / ingredient.totalAmount) * 100)}%）
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#c97f00]"
            >
              使う
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
