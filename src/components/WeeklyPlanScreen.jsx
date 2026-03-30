import { useState, useMemo } from 'react'
import { DAYS } from '../hooks/useWeeklyPlan'
import { RECIPES_DB } from '../data/recipesDb'

const SLOTS = [
  { key: 'breakfast', label: '朝' },
  { key: 'lunch',     label: '昼' },
  { key: 'dinner',    label: '夜' },
]

const CATEGORY_EMOJI = {
  '朝食': '🌅', '丼・ご飯': '🍚', '麺類': '🍜', '汁物': '🍲',
  '肉メイン': '🥩', '魚メイン': '🐟', '副菜': '🥗',
  '卵料理': '🍳', '鍋・煮物': '🫕',
}

function emoji(category) {
  return CATEGORY_EMOJI[category] ?? '🍽️'
}

// カレンダーセル
function MealCell({ meals, onClick, hasMissing }) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[60px] rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all p-2 active:scale-95 relative ${
        meals.length > 0
          ? 'border-[#fdd9a0] bg-[#fff8ed] hover:border-[#f39800]'
          : 'border-dashed border-gray-200 bg-white hover:border-[#f8c875] hover:bg-[#fff8ed]'
      }`}
    >
      {meals.length === 0 ? (
        <span className="text-gray-300 text-xl leading-none font-light">+</span>
      ) : meals.length === 1 ? (
        <span className="text-xs text-gray-700 leading-snug w-full text-center font-medium line-clamp-2">
          {meals[0].name}
        </span>
      ) : (
        <>
          <div className="flex flex-col gap-0.5 w-full">
            {meals.slice(0, 2).map(m => (
              <span key={m.id} className="text-[10px] text-gray-600 leading-tight truncate w-full text-center">{m.name}</span>
            ))}
          </div>
          {meals.length > 2 && <span className="text-[10px] text-[#f39800] font-bold leading-none">+{meals.length - 2}</span>}
        </>
      )}
      {hasMissing && meals.length > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e83848] border border-white" />
      )}
    </button>
  )
}

export default function WeeklyPlanScreen({
  plan, ingredients = [], customRecipes = [],
  onAddMeal, onRemoveMealItem, onClearMeal, onClearAll,
  onAddToShopping, onSelectRecipe,
  weekStartsOnSunday = false,
}) {
  const [picking, setPicking] = useState(null) // { day, slot }
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const toastTimerRef = useState(null)

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimerRef[0])
    toastTimerRef[0] = setTimeout(() => setToast(''), 2500)
  }

  const allRecipes = [...customRecipes, ...RECIPES_DB]
  const filtered = query
    ? allRecipes.filter(r => r.name.includes(query))
    : allRecipes

  // 表示順（設定による）
  const displayDays = weekStartsOnSunday
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['月', '火', '水', '木', '金', '土', '日']

  const plannedMealCount = DAYS.reduce((acc, day) =>
    acc + SLOTS.reduce((s, slot) => s + (plan[day]?.[slot.key]?.length ?? 0), 0), 0)

  // あるスロットの不足食材名を返す
  function getMissingForSlot(day, slot) {
    const meals = plan[day]?.[slot] ?? []
    const missing = new Set()
    for (const meal of meals) {
      const recipe = allRecipes.find(r => r.id === meal.id)
      if (!recipe) continue
      for (const ing of recipe.ingredients) {
        const inv = ingredients.find(i => i.name === ing.name)
        if (!inv || inv.remainingPercent <= 0) missing.add(ing.name)
      }
    }
    return [...missing]
  }

  // 特定スロットの不足を買い物リストへ
  function addSlotMissingToShopping(day, slot) {
    const names = getMissingForSlot(day, slot)
    names.forEach(name => onAddToShopping(name))
    showToast(names.length > 0 ? `${names.length}件を買い物リストに追加しました` : '不足食材はありません')
  }

  // 特定日の不足を買い物リストへ
  function addDayMissingToShopping(day) {
    const missing = new Set()
    for (const slot of SLOTS) {
      getMissingForSlot(day, slot.key).forEach(n => missing.add(n))
    }
    missing.forEach(name => onAddToShopping(name))
    showToast(missing.size > 0 ? `${day}曜の${missing.size}件を追加しました` : '不足食材はありません')
  }

  // 全週の不足を買い物リストへ
  function handleAddMissingToShopping() {
    const missing = new Set()
    for (const day of DAYS) {
      for (const slot of SLOTS) {
        getMissingForSlot(day, slot.key).forEach(n => missing.add(n))
      }
    }
    missing.forEach(name => onAddToShopping(name))
    showToast(missing.size > 0 ? `${missing.size}件を買い物リストに追加しました` : '不足食材はありません')
  }

  // 不足食材があるかどうか（セル用）
  const missingMap = useMemo(() => {
    const map = {}
    for (const day of DAYS) {
      map[day] = {}
      for (const slot of SLOTS) {
        map[day][slot.key] = getMissingForSlot(day, slot.key).length > 0
      }
    }
    return map
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, ingredients, allRecipes.length])

  function handlePick(recipe) {
    if (!picking) return
    onAddMeal(picking.day, picking.slot, { id: recipe.id, name: recipe.name, category: recipe.category })
    setQuery('')
  }

  function openPicking(day, slot) {
    setPicking({ day, slot })
    setQuery('')
  }

  function closePicking() {
    setPicking(null)
    setQuery('')
  }

  const slotLabel = picking ? SLOTS.find(s => s.key === picking.slot)?.label ?? '' : ''
  const currentMeals = picking ? (plan[picking.day]?.[picking.slot] ?? []) : []
  const slotMissing = picking ? getMissingForSlot(picking.day, picking.slot) : []

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ヘッダーアクション */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {plannedMealCount > 0 ? (
          onAddToShopping ? (
            <button
              onClick={handleAddMissingToShopping}
              className="text-xs bg-[#e30f25] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#be0d1f] transition-colors"
            >
              週全体の不足を追加
            </button>
          ) : (
            <span className="text-xs text-gray-500">{plannedMealCount}品計画中</span>
          )
        ) : (
          <span className="text-xs text-gray-400">セルをタップしてレシピを追加</span>
        )}
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-[#e30f25] transition-colors"
        >
          リセット
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-24">

        {/* スロットヘッダー */}
        <div className="flex mb-1.5">
          <div className="w-14 shrink-0" />
          {SLOTS.map(slot => (
            <div key={slot.key} className="flex-1 text-center text-xs font-bold text-gray-500 py-1">
              {slot.label}
            </div>
          ))}
        </div>

        {/* 曜日ごとの行 */}
        <div className="flex flex-col gap-1.5">
          {displayDays.map(day => {
            const dayHasMissing = onAddToShopping && SLOTS.some(s => missingMap[day]?.[s.key])
            const hasMeals = SLOTS.some(s => (plan[day]?.[s.key]?.length ?? 0) > 0)
            return (
              <div key={day} className="flex items-stretch gap-1">
                {/* 曜日ラベル */}
                <div className="w-14 shrink-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-xs font-bold text-gray-600">{day}</span>
                  {dayHasMissing && hasMeals && (
                    <button
                      onClick={() => addDayMissingToShopping(day)}
                      className="text-[9px] bg-[#e30f25] text-white font-medium rounded-full px-1.5 py-0.5 leading-none hover:bg-[#be0d1f] transition-colors"
                    >
                      不足追加
                    </button>
                  )}
                </div>
                {/* スロットセル */}
                {SLOTS.map(slot => (
                  <div key={slot.key} className="flex-1">
                    <MealCell
                      meals={plan[day]?.[slot.key] ?? []}
                      onClick={() => openPicking(day, slot.key)}
                      hasMissing={missingMap[day]?.[slot.key] ?? false}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-[#e83848]" />
          <span>食材不足あり</span>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* スロット詳細 & レシピ選択モーダル */}
      {picking && (
        <div
          className="fixed inset-0 bg-black/50 z-20 flex items-end"
          onClick={closePicking}
        >
          <div
            className="bg-white w-full max-w-md mx-auto rounded-t-2xl flex flex-col max-h-[82vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">
                  {picking.day}曜日 {slotLabel}
                </p>
                <div className="flex items-center gap-2">
                  {slotMissing.length > 0 && onAddToShopping && (
                    <button
                      onClick={() => addSlotMissingToShopping(picking.day, picking.slot)}
                      className="text-xs bg-[#e30f25] text-white font-medium px-3 py-1 rounded-full hover:bg-[#be0d1f] transition-colors"
                    >
                      不足({slotMissing.length})を追加
                    </button>
                  )}
                  <button
                    onClick={closePicking}
                    className="text-sm text-[#f39800] font-medium hover:text-[#c97f00] px-2 py-1"
                  >
                    完了
                  </button>
                </div>
              </div>

              {/* 追加済みレシピ一覧 */}
              {currentMeals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentMeals.map(meal => {
                    const fullRecipe = allRecipes.find(r => r.id === meal.id)
                    return (
                      <span
                        key={meal.id}
                        className="inline-flex items-center gap-1 bg-[#fef0d4] border border-[#fdd9a0] text-gray-700 rounded-full pl-2 pr-1 py-1 text-xs"
                      >
                        <span className="max-w-[80px] truncate">{meal.name}</span>
                        {onSelectRecipe && fullRecipe && (
                          <button
                            onClick={() => { onSelectRecipe(fullRecipe); closePicking() }}
                            className="text-[9px] text-[#f39800] hover:text-[#c97f00] leading-none px-0.5 py-0.5 font-medium"
                            title="料理する"
                          >使う</button>
                        )}
                        <button
                          onClick={() => onRemoveMealItem(picking.day, picking.slot, meal.id)}
                          className="text-gray-300 hover:text-[#e83848] leading-none px-0.5 py-0.5"
                        >✕</button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* 検索 */}
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={currentMeals.length > 0 ? 'さらにレシピを追加...' : 'レシピを検索して追加...'}
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
              />
            </div>

            {/* レシピリスト */}
            <div className="overflow-y-auto flex-1">
              {filtered.map(recipe => {
                const isAdded = currentMeals.some(m => m.id === recipe.id)
                return (
                  <button
                    key={recipe.id}
                    onClick={() => handlePick(recipe)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors ${
                      isAdded ? 'bg-[#fff8ed]' : 'hover:bg-[#fff8ed]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{recipe.name}</p>
                      <p className="text-xs text-gray-400">{recipe.category}</p>
                    </div>
                    {isAdded && (
                      <span className="text-[#f39800] text-xs font-medium shrink-0">✓ 追加済み</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
