import { useState, useMemo } from 'react'
import { RECIPES_DB, RECIPE_CATEGORIES, RECIPE_SUBCATEGORIES, RECIPE_SUBCATEGORY_MAP, RECIPE_DIFFICULTY_MAP } from '../data/recipesDb'
import { getExpiryStatus } from '../utils/expiry'
import { getCandidateNames } from '../data/ingredientAliases'

const CATEGORY_EMOJI = {
  '朝食':      '🌅',
  '丼・ご飯':  '🍚',
  '麺類':      '🍜',
  '汁物':      '🍲',
  '肉メイン':  '🥩',
  '魚メイン':  '🐟',
  '副菜':      '🥗',
  '卵料理':    '🍳',
  '鍋・煮物':  '🫕',
}

const STATUS_BADGE = {
  ok:      { label: '材料あり',  style: 'bg-[#fef0d4] text-[#c97f00]' },
  partial: { label: '一部不足', style: 'bg-yellow-100 text-yellow-700' },
  none:    { label: '未登録',   style: 'bg-gray-100 text-gray-500' },
}

export default function RecipeScreen({ ingredients, onSelectRecipe, customRecipes = [], onDeleteCustomRecipe, onEditCustomRecipe, favorites = new Set(), onToggleFavorite, onAddToShopping, onCreateRecipe, aliases = [], pairPriorities = {} }) {
  const [query, setQuery] = useState('')
  const [searchByIngredient, setSearchByIngredient] = useState(false)
  const [activeCategory, setActiveCategory] = useState('すべて')
  const [activeSubcategory, setActiveSubcategory] = useState('すべて')
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [favOnly, setFavOnly] = useState(false)
  const [diffFilter, setDiffFilter] = useState(0) // 0=すべて

  const allRecipes = useMemo(() => [...customRecipes, ...RECIPES_DB], [customRecipes])

  const subcategories = RECIPE_SUBCATEGORIES[activeCategory] ?? []

  function handleCategoryChange(cat) {
    setActiveCategory(cat)
    setActiveSubcategory('すべて')
    setUrgentOnly(false)
  }

  // 期限切れ・期限近い食材名セット
  const urgentNames = useMemo(() => {
    const set = new Set()
    for (const i of ingredients) {
      const s = getExpiryStatus(i.expiryDate)
      if (s === 'expired' || s === 'warning') set.add(i.name)
    }
    return set
  }, [ingredients])

  // レシピごとに「期限近い食材の使用数」を計算（エイリアス考慮）
  function countUrgentMatch(recipe) {
    let count = 0
    for (const item of recipe.ingredients) {
      const candidates = getCandidateNames(item.name, aliases, pairPriorities)
      if (candidates.some(n => urgentNames.has(n))) count++
    }
    return count
  }

  // 在庫状況を判定（エイリアス考慮）
  function getStockStatus(recipe) {
    let missing = 0
    let insufficient = 0
    for (const item of recipe.ingredients) {
      const candidates = getCandidateNames(item.name, aliases, pairPriorities)
      const found = ingredients.find(i => candidates.includes(i.name))
      if (!found) { missing++; continue }
      const remaining = found.totalAmount * (found.remainingPercent / 100)
      if (remaining <= 0) insufficient++
    }
    if (missing === recipe.ingredients.length) return 'none'
    if (missing > 0 || insufficient > 0) return 'partial'
    return 'ok'
  }

  const filtered = useMemo(() => {
    let list = allRecipes.filter(r => {
      const matchCat = activeCategory === 'すべて' || r.category === activeCategory
      const matchQ = !query || (
        searchByIngredient
          ? r.ingredients.some(i => i.name.includes(query))
          : r.name.includes(query)
      )
      if (!matchCat || !matchQ) return false
      if (activeSubcategory !== 'すべて') {
        const sub = RECIPE_SUBCATEGORY_MAP[r.id]
        if (sub !== activeSubcategory) return false
      }
      if (urgentOnly && countUrgentMatch(r) === 0) return false
      if (favOnly && !favorites.has(r.id)) return false
      if (diffFilter !== 0 && (RECIPE_DIFFICULTY_MAP[r.id] ?? 2) !== diffFilter) return false
      return true
    })
    // 期限優先モードは消化できる期限近い品数が多い順に並び替え
    if (urgentOnly) {
      list = [...list].sort((a, b) => countUrgentMatch(b) - countUrgentMatch(a))
    }
    return list
  }, [query, searchByIngredient, activeCategory, activeSubcategory, allRecipes, urgentOnly, urgentNames, favOnly, favorites, diffFilter])

  const urgentCount = urgentNames.size

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 期限消化バナー（期限近い食材がある時だけ表示） */}
      {urgentCount > 0 && (
        <button
          onClick={() => { setUrgentOnly(v => !v); setActiveCategory('すべて') }}
          className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b ${
            urgentOnly
              ? 'bg-[#e30f25] text-white border-[#e30f25]'
              : 'bg-[#fef2f2] text-[#be0d1f] border-[#f9bec3] hover:bg-[#fde8ea]'
          }`}
        >
          <span>
            期限切れ・期限近い食材が{urgentCount}品あります
            {urgentOnly ? ' — 絞り込み中' : ' — 使えるレシピを探す'}
          </span>
          {urgentOnly && <span className="ml-auto text-xs opacity-80">解除</span>}
        </button>
      )}

      {/* 検索バー */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-gray-200 flex gap-2">
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchByIngredient ? '食材名で検索（例: 鶏もも肉）' : 'レシピを検索...'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
          />
          <button
            type="button"
            onClick={() => { setSearchByIngredient(v => !v); setQuery('') }}
            className={`self-start text-xs px-2.5 py-1 rounded-full border transition-colors ${
              searchByIngredient
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-500 border-gray-200 hover:border-blue-400'
            }`}
          >
            食材で絞り込む
          </button>
        </div>
        <button
          onClick={() => setFavOnly(v => !v)}
          className={`shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            favOnly
              ? 'bg-red-50 border-[#f28a92] text-[#be0d1f]'
              : 'bg-white border-gray-300 text-gray-400 hover:border-[#f28a92] hover:text-[#e83848]'
          }`}
          aria-label="お気に入りのみ表示"
        >
          {favOnly ? '♥ お気に入り' : '♡ お気に入り'}
        </button>
      </div>

      {/* 難易度フィルター */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2">
        {[
          { value: 0, label: 'すべて' },
          { value: 1, label: '★ 簡単' },
          { value: 2, label: '★★ 普通' },
          { value: 3, label: '★★★ 難しい' },
        ].map(d => (
          <button
            key={d.value}
            onClick={() => setDiffFilter(d.value)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              diffFilter === d.value
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* カテゴリタブ */}
      {!urgentOnly && (
        <div className="bg-white border-b border-gray-200">
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
            {RECIPE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#fef0d4] text-[#c97f00] border-[#f39800]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#f8c875]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* サブカテゴリ（該当カテゴリのみ表示） */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              <button
                onClick={() => setActiveSubcategory('すべて')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  activeSubcategory === 'すべて'
                    ? 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                }`}
              >
                すべて
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    activeSubcategory === sub
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* レシピ一覧 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">
              {urgentOnly ? '期限近い食材を使えるレシピがありません' : 'レシピが見つかりません'}
            </p>
            {query && !urgentOnly && onCreateRecipe && (
              <button
                onClick={() => onCreateRecipe(query)}
                className="mt-4 px-5 py-2.5 bg-[#f39800] text-white rounded-xl text-sm font-medium hover:bg-[#c97f00] transition-colors"
              >
                「{query}」を新規レシピとして登録
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(recipe => {
              const status = getStockStatus(recipe)
              const badge = STATUS_BADGE[status]
              const urgentMatch = countUrgentMatch(recipe)
              const difficulty = RECIPE_DIFFICULTY_MAP[recipe.id] ?? 2
              const diffLabel = difficulty === 1 ? '★' : difficulty === 3 ? '★★★' : '★★'
              const diffColor = difficulty === 1 ? 'text-[#f39800]' : difficulty === 3 ? 'text-[#e83848]' : 'text-yellow-500'
              return (
                <div key={recipe.id} className="relative">
                  <button
                    onClick={() => onSelectRecipe(recipe)}
                    className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-sm transition-all active:scale-95 ${
                      urgentMatch > 0
                        ? 'border-[#f28a92] hover:border-[#e30f25]'
                        : favorites.has(recipe.id)
                          ? 'border-[#f9bec3] hover:border-[#f28a92]'
                          : 'border-gray-200 hover:border-[#f39800]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{recipe.name}</p>
                            {recipe.isCustom && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">自作</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-xs text-gray-400">
                              材料 {recipe.ingredients.length}品 · {recipe.category}
                            </p>
                            <span className={`text-xs font-bold ${diffColor}`}>{diffLabel}</span>
                            {urgentMatch > 0 && (
                              <span className="text-xs text-[#be0d1f] font-medium">
                                {urgentMatch}品が期限近い
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {onAddToShopping && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              recipe.ingredients.forEach(i => onAddToShopping(i.name))
                            }}
                            className="text-xs px-2 py-1 rounded-lg text-gray-300 hover:text-[#f39800] hover:bg-[#fff8ed] transition-colors font-medium"
                            title="全材料を買い物リストへ"
                          >買い物</button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); onToggleFavorite?.(recipe.id) }}
                          className={`text-sm px-1 transition-colors ${favorites.has(recipe.id) ? 'text-[#e30f25]' : 'text-gray-300 hover:text-[#e83848]'}`}
                          aria-label="お気に入り"
                        >
                          {favorites.has(recipe.id) ? '♥' : '♡'}
                        </button>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.style}`}>
                          {badge.label}
                        </span>
                        {recipe.isCustom && (
                          <div className="flex gap-1">
                            {onEditCustomRecipe && (
                              <button
                                onClick={e => { e.stopPropagation(); onEditCustomRecipe(recipe) }}
                                className="text-xs text-gray-400 hover:text-[#f39800] hover:bg-[#fff8ed] transition-colors font-medium px-2 py-1 rounded-lg"
                                aria-label="編集"
                              >
                                編集
                              </button>
                            )}
                            {onDeleteCustomRecipe && (
                              <button
                                onClick={e => { e.stopPropagation(); onDeleteCustomRecipe(recipe.id) }}
                                className="text-xs text-gray-400 hover:text-[#e30f25] hover:bg-red-50 transition-colors font-medium px-2 py-1 rounded-lg"
                                aria-label="削除"
                              >
                                削除
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
