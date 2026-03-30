import { useState, useRef, useEffect } from 'react'
import { searchIngredients, INGREDIENTS_DB } from '../data/ingredientsDb'

const CATEGORY_ORDER = ['野菜', '肉', '魚', '乳製品', '調味料', '冷凍', 'その他']

function groupByCategory(items) {
  const groups = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

export default function IngredientCombobox({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setQuery(value ?? '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isFiltering = query.length > 0
  const suggestions = isFiltering ? searchIngredients(query) : []
  const grouped = !isFiltering ? groupByCategory(INGREDIENTS_DB) : null

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    setOpen(true)
  }

  function handleFocus() {
    setOpen(true)
  }

  function handleSelect(item) {
    setQuery(item.name)
    setOpen(false)
    onSelect(item)
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={handleFocus}
        placeholder="タップして選ぶ、または入力して検索"
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
      />

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isFiltering ? (
            // 検索中: フラットリスト
            suggestions.length > 0 ? (
              <ul>
                {suggestions.map(item => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#fff8ed] flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.category} · {item.totalUnit}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-3 text-sm text-gray-400">該当なし。そのまま入力できます</p>
            )
          ) : (
            // 未入力: カテゴリ別グループ表示
            CATEGORY_ORDER.map(cat => {
              const items = grouped[cat]
              if (!items) return null
              return (
                <div key={cat}>
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">
                    {cat}
                  </p>
                  <ul>
                    {items.map(item => (
                      <li key={item.name}>
                        <button
                          type="button"
                          onMouseDown={() => handleSelect(item)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#fff8ed] flex items-center justify-between"
                        >
                          <span className="text-gray-800">{item.name}</span>
                          <span className="text-xs text-gray-400">{item.totalUnit}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
