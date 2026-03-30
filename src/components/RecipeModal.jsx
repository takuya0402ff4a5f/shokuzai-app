import { useState } from 'react'
import { calcDeduction, formatAmount } from '../utils/units'
import { INGREDIENTS_DB } from '../data/ingredientsDb'
import { getCandidateNames } from '../data/ingredientAliases'

const MULTIPLIERS = [
  { label: '0.5人前', value: 0.5 },
  { label: '1人前',   value: 1   },
  { label: '2人前',   value: 2   },
]

function isCondiment(name) {
  const db = INGREDIENTS_DB.find(i => i.name === name)
  return db?.category === '調味料'
}

export default function RecipeModal({ recipe, ingredients, onCook, onClose, onAddIngredients, onAddToShopping, onQuickAddIngredient, aliases = [], pairPriorities = {} }) {
  const [multiplier, setMultiplier] = useState(1)
  const [tab, setTab] = useState('cook') // 'cook' | 'add'

  // 「食材を追加」タブ用チェック状態（調味料はデフォルトOFF）
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(recipe.ingredients.map(i => [i.name, !isCondiment(i.name)]))
  )

  // 在庫状況を計算（エイリアス考慮）
  function getItemStatus(item) {
    const candidates = getCandidateNames(item.name, aliases, pairPriorities)
    const ingredient = ingredients.find(i => candidates.includes(i.name))
    const needed = item.amount * multiplier
    if (!ingredient) return { status: 'missing', needed, remaining: null, after: null }
    const remaining = ingredient.totalAmount * (ingredient.remainingPercent / 100)
    const deduct = calcDeduction(needed, item.unit, ingredient)
    if (deduct == null) return { status: 'missing', needed, remaining, after: null }
    const after = Math.max(0, remaining - deduct)
    const isEnough = deduct <= remaining
    return { status: isEnough ? 'ok' : 'short', needed, remaining, after, ingredient, deduct }
  }

  const itemStatuses = recipe.ingredients.map(item => ({
    ...item,
    ...getItemStatus(item),
  }))

  const hasAnyMissing = itemStatuses.some(i => i.status === 'missing')
  const hasAnyShort   = itemStatuses.some(i => i.status === 'short')

  function handleCook() {
    onCook(recipe.ingredients, multiplier)
    onClose()
  }

  function handleAddIngredients() {
    const selected = recipe.ingredients.filter(i => checked[i.name])
    onAddIngredients(selected, multiplier)
    onClose()
  }

  function formatNeeded(amount, unit) {
    return `${Math.round(amount * 10) / 10}${unit}`
  }

  const selectedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md mx-auto rounded-t-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{recipe.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{recipe.category}</p>

          {/* 人数セレクター */}
          <div className="flex gap-2 mt-3">
            {MULTIPLIERS.map(m => (
              <button
                key={m.value}
                onClick={() => setMultiplier(m.value)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  multiplier === m.value
                    ? 'bg-[#f39800] text-white border-[#f39800]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#f39800]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* タブ */}
          <div className="flex mt-3 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setTab('cook')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === 'cook' ? 'bg-[#f39800] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              在庫チェック
            </button>
            <button
              onClick={() => setTab('add')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === 'add' ? 'bg-[#f39800] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              食材を追加
            </button>
          </div>
        </div>

        {/* 在庫チェックタブ */}
        {tab === 'cook' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-3">
              <p className="text-xs font-medium text-gray-500 mb-2">使用する材料</p>
              <div className="flex flex-col gap-2">
                {itemStatuses.map((item, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2.5 ${
                    item.status === 'ok'    ? 'bg-[#fff8ed]' :
                    item.status === 'short' ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-4 shrink-0 ${
                          item.status === 'ok' ? 'text-[#f39800]' : item.status === 'short' ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {item.status === 'ok' ? '○' : item.status === 'short' ? '△' : '×'}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        item.status === 'ok'    ? 'text-[#c97f00]' :
                        item.status === 'short' ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {formatNeeded(item.needed, item.unit)}
                      </span>
                    </div>
                    {item.status !== 'missing' && item.ingredient && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-7">
                        現在: {formatAmount(item.remaining, item.ingredient.totalUnit)}
                        {item.status === 'ok'
                          ? ` → 使用後: ${formatAmount(item.after, item.ingredient.totalUnit)}`
                          : ' （在庫不足）'
                        }
                      </p>
                    )}
                    {item.status === 'missing' && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-7 flex items-center gap-2">
                        食材リストに未登録
                        {onQuickAddIngredient && (
                          <button
                            onClick={() => { onClose(); onQuickAddIngredient(item.name) }}
                            className="text-[#f39800] font-medium hover:text-[#c97f00] underline underline-offset-2"
                          >+ 登録する</button>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {(hasAnyMissing || hasAnyShort) && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                  {hasAnyShort && '在庫が不足している材料があります。'}
                  {hasAnyMissing && '未登録の材料があります。'}
                  <br />それでも料理した場合は「料理する」を押してください。
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCook}
                className="flex-1 bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#c97f00]"
              >
                料理する
              </button>
            </div>
          </>
        )}

        {/* 食材を追加タブ */}
        {tab === 'add' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-3">
              <p className="text-xs text-gray-400 mb-3">
                追加したい食材にチェックを入れてください。調味料はデフォルトでOFFです。
              </p>
              <div className="flex flex-col gap-2">
                {recipe.ingredients.map((item, i) => {
                  const condiment = isCondiment(item.name)
                  const alreadyHas = ingredients.find(
                    ing => ing.name === item.name && ing.remainingPercent > 0
                  )
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer transition-colors ${
                        checked[item.name] ? 'bg-[#fff8ed] border border-[#fdd9a0]' : 'bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked[item.name] ?? false}
                        onChange={e => setChecked(prev => ({ ...prev, [item.name]: e.target.checked }))}
                        className="w-4 h-4 accent-[#f39800]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          {condiment && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">調味料</span>
                          )}
                          {alreadyHas && (
                            <span className="text-xs text-[#f39800] bg-[#fff8ed] px-1.5 py-0.5 rounded">在庫あり</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatNeeded(item.amount * multiplier, item.unit)}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddIngredients}
                  disabled={selectedCount === 0}
                  className="flex-1 bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#c97f00] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedCount}品を食材に追加
                </button>
              </div>
              {onAddToShopping && (
                <button
                  onClick={() => {
                    const selected = recipe.ingredients.filter(i => checked[i.name])
                    selected.forEach(i => onAddToShopping(i.name))
                    onClose()
                  }}
                  disabled={selectedCount === 0}
                  className="w-full border border-blue-300 text-blue-600 rounded-lg py-2.5 text-sm font-bold hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedCount}品を買い物リストへ
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
