import { useState, useMemo } from 'react'
import { formatAmount } from '../utils/units'
import { INGREDIENTS_DB } from '../data/ingredientsDb'

const QUICK_AMOUNTS = {
  'g':    [50, 100, 200, 300, 500],
  'kg':   [0.5, 1, 1.5, 2],
  'ml':   [100, 200, 300, 500, 1000],
  'L':    [0.5, 1, 1.5, 2],
  '個':   [1, 2, 3, 4, 5, 6],
  '本':   [1, 2, 3, 4, 5, 6],
  '袋':   [1, 2, 3],
  '箱':   [1, 2, 3],
  '缶':   [1, 2, 3],
  '束':   [1, 2, 3],
  '枚':   [1, 2, 4, 6, 8, 10],
  '玉':   [1, 2, 3, 4, 5],
  '丁':   [1, 2, 3, 4],
  '切れ': [1, 2, 3, 4, 5, 6],
  '尾':   [1, 2, 3],
  '房':   [1, 2, 3],
}

export default function ShoppingScreen({ ingredients, items, alertSettings = [], onAdd, onToggle, onRemove, onClearChecked, onPurchase }) {
  const [input, setInput] = useState('')
  const [purchaseTarget, setPurchaseTarget] = useState(null) // { id, name, unit }
  const [purchaseAmount, setPurchaseAmount] = useState(1)

  // アラート設定済みの食材で残量が閾値以下のものをサジェスト
  const suggestions = useMemo(() => {
    return alertSettings
      .map(a => {
        const ing = ingredients.find(i => i.name === a.name)
        if (!ing) return null
        const pct = ing.remainingPercent ?? 100
        if (pct > a.threshold) return null
        if (items.some(s => s.name === ing.name && !s.checked)) return null
        return ing
      })
      .filter(Boolean)
  }, [ingredients, items, alertSettings])

  function handleAdd(name) {
    if (!name.trim()) return
    onAdd(name.trim())
    setInput('')
  }

  function openPurchaseModal(item) {
    const dbItem = INGREDIENTS_DB.find(i => i.name === item.name)
    const unit = dbItem?.totalUnit ?? '個'
    const amounts = dbItem?.quickAmounts ?? QUICK_AMOUNTS[unit] ?? [1, 2, 3]
    setPurchaseTarget({ ...item, unit, quickAmounts: amounts })
    setPurchaseAmount(amounts[0] ?? 1)
  }

  function handlePurchaseSkip() {
    onToggle(purchaseTarget.id)
    setPurchaseTarget(null)
  }

  function handlePurchaseAdd() {
    onPurchase(purchaseTarget.name, purchaseAmount, purchaseTarget.unit)
    onToggle(purchaseTarget.id)
    setPurchaseTarget(null)
  }

  const unchecked = items.filter(i => !i.checked)
  const checked   = items.filter(i =>  i.checked)

  const quickAmounts = purchaseTarget?.quickAmounts ?? []

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-20">

      {/* 残量アラートサジェスト */}
      {suggestions.length > 0 && (
        <div className="bg-[#fef2f2] border-b border-[#f9bec3] px-4 py-3">
          <p className="text-xs font-medium text-[#be0d1f] mb-2">
            残量アラート — タップで追加
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(i => (
              <button
                key={i.id}
                onClick={() => onAdd(i.name)}
                className="text-xs bg-white border border-[#f28a92] text-[#be0d1f] px-2.5 py-1 rounded-full hover:bg-[#fde8ea] transition-colors"
              >
                + {i.name}
                <span className="ml-1 text-[#e83848]">
                  {formatAmount(i.totalAmount * (i.remainingPercent / 100), i.totalUnit)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 手動入力 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd(input)}
          placeholder="食材を入力..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
        <button
          onClick={() => handleAdd(input)}
          disabled={!input.trim()}
          className="bg-[#f39800] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c97f00] disabled:opacity-40 transition-colors"
        >
          追加
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {unchecked.length === 0 && checked.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">買い物リストは空です</p>
            <p className="text-sm mt-1">上から食材を追加してください</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">

            {/* 未チェックアイテム */}
            {unchecked.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <button
                  onClick={() => openPurchaseModal(item)}
                  className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 hover:border-[#f39800] transition-colors"
                />
                <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-300 hover:text-[#e83848] transition-colors text-sm leading-none px-1"
                >削除</button>
              </div>
            ))}

            {/* チェック済み */}
            {checked.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-4 mb-1">
                  <p className="text-xs text-gray-400 font-medium">購入済み {checked.length}件</p>
                  <button
                    onClick={onClearChecked}
                    className="text-xs text-gray-400 hover:text-[#e30f25] transition-colors"
                  >
                    まとめて削除
                  </button>
                </div>
                {checked.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                    <button
                      onClick={() => onToggle(item.id)}
                      className="w-5 h-5 rounded-full border-2 border-[#f39800] bg-[#f39800] shrink-0 flex items-center justify-center"
                    >
                      <span className="text-white text-xs leading-none">✓</span>
                    </button>
                    <span className="flex-1 text-sm text-gray-400 line-through">{item.name}</span>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-300 hover:text-[#e83848] transition-colors text-sm leading-none px-1"
                    >削除</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* 購入確認モーダル */}
      {purchaseTarget && (
        <div
          className="fixed inset-0 bg-black/50 z-30 flex items-end"
          onClick={() => setPurchaseTarget(null)}
        >
          <div
            className="bg-white w-full max-w-md mx-auto rounded-t-2xl px-6 pt-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-base font-bold text-gray-900 mb-0.5">
              「{purchaseTarget.name}」を購入
            </p>
            <p className="text-xs text-gray-400 mb-4">数量を選んで食材に追加してください</p>

            {/* クイック選択ボタン */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickAmounts.map(v => (
                <button
                  key={v}
                  onClick={() => setPurchaseAmount(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    purchaseAmount === v
                      ? 'bg-[#f39800] text-white border-[#f39800]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#f39800]'
                  }`}
                >
                  {v}{purchaseTarget.unit}
                </button>
              ))}
            </div>

            {/* 数値直接入力 */}
            <div className="flex items-center gap-2 mb-5">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={purchaseAmount}
                onChange={e => setPurchaseAmount(Number(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
              />
              <span className="text-sm text-gray-500 shrink-0">{purchaseTarget.unit}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePurchaseSkip}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                スキップ
              </button>
              <button
                onClick={handlePurchaseAdd}
                className="flex-1 bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#c97f00]"
              >
                食材に追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
