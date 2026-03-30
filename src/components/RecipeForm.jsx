import { useState, useEffect, useRef, useMemo } from 'react'
import { RECIPE_CATEGORIES } from '../data/recipesDb'
import { INGREDIENTS_DB } from '../data/ingredientsDb'
import { ALL_UNITS } from '../utils/units'

const EMPTY_ROW = { name: '', amount: '1', unit: '個' }

// 食材名コンボボックス（DB + 在庫横断検索）
function NameCombobox({ value, stockIngredients, onChange }) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // DB全品目 + ユーザー在庫をマージ
  const allCandidates = useMemo(() => {
    const map = new Map()
    for (const i of INGREDIENTS_DB) {
      map.set(i.name, { name: i.name, unit: i.totalUnit, inStock: false })
    }
    for (const i of stockIngredients) {
      if (map.has(i.name)) {
        map.get(i.name).inStock = true
      } else {
        map.set(i.name, { name: i.name, unit: i.totalUnit, inStock: true })
      }
    }
    return [...map.values()]
  }, [stockIngredients])

  const filtered = query.length >= 1
    ? allCandidates.filter(c => c.name.includes(query)).slice(0, 20)
    : []

  useEffect(() => { setQuery(value ?? '') }, [value])

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    onChange({ name: val, unit: null })
    setOpen(true)
  }

  function handleSelect(item) {
    setQuery(item.name)
    setOpen(false)
    onChange({ name: item.name, unit: item.unit })
  }

  function handleClear() {
    setQuery('')
    onChange({ name: '', unit: null })
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 1 && setOpen(true)}
          placeholder="食材名を入力（例：鶏もも肉）"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(item => (
            <li key={item.name}>
              <button
                type="button"
                onMouseDown={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[#fff8ed] flex items-center justify-between ${
                  item.name === query ? 'bg-[#fff8ed]' : ''
                }`}
              >
                <span className={item.name === query ? 'text-[#c97f00] font-medium' : 'text-gray-800'}>
                  {item.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {item.inStock && (
                    <span className="text-[9px] text-[#f39800] bg-[#fff8ed] border border-[#fdd9a0] px-1.5 py-0.5 rounded">在庫あり</span>
                  )}
                  <span className="text-xs text-gray-400">{item.unit}</span>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && query && (
            <li className="px-3 py-2.5 text-sm text-gray-400">
              「{query}」—&nbsp;
              <button
                type="button"
                onMouseDown={() => { setOpen(false); onChange({ name: query, unit: null }) }}
                className="text-[#f39800] font-medium"
              >そのまま使う</button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// 1材料行
function IngredientRow({ row, idx, onChange, onRemove, showRemove, stockIngredients }) {
  function handleNameChange({ name, unit }) {
    onChange(idx, unit ? { name, unit } : { name })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
      <NameCombobox
        value={row.name}
        stockIngredients={stockIngredients}
        onChange={handleNameChange}
      />
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={row.amount}
          onChange={e => onChange(idx, { amount: e.target.value })}
          min="0"
          step="any"
          placeholder="量"
          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
        <select
          value={row.unit}
          onChange={e => onChange(idx, { unit: e.target.value })}
          className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        >
          {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="text-gray-400 hover:text-[#e30f25] transition-colors text-lg leading-none px-1"
          >×</button>
        )}
      </div>
    </div>
  )
}

function toRows(ingredients) {
  return ingredients.map(i => ({
    name: i.name,
    amount: String(i.amount),
    unit: i.unit,
  }))
}

export default function RecipeForm({ onSubmit, onCancel, initial, ingredients = [] }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? RECIPE_CATEGORIES[1])
  const [rows, setRows] = useState(
    initial?.ingredients?.length
      ? toRows(initial.ingredients)
      : [{ ...EMPTY_ROW }]
  )

  function addRow() {
    setRows(prev => [...prev, { ...EMPTY_ROW }])
  }

  function removeRow(idx) {
    setRows(prev => prev.filter((_, i) => i !== idx))
  }

  function updateRow(idx, patch) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const validRows = rows.filter(r => r.name.trim() && r.amount !== '')
    if (validRows.length === 0) return
    const recipeIngredients = validRows.map(r => ({
      name: r.name.trim(),
      amount: parseFloat(r.amount) || 1,
      unit: r.unit,
    }))
    onSubmit({ name: name.trim(), category, servings: 1, ingredients: recipeIngredients })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* レシピ名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">レシピ名</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例：トマト卵炒め"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        >
          {RECIPE_CATEGORIES.filter(c => c !== 'すべて').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 材料リスト */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">材料（1人前）</label>
        <div className="flex flex-col gap-3">
          {rows.map((row, idx) => (
            <IngredientRow
              key={idx}
              row={row}
              idx={idx}
              onChange={updateRow}
              onRemove={removeRow}
              showRemove={rows.length > 1}
              stockIngredients={ingredients}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-3 w-full py-2 border border-dashed border-[#f39800] rounded-xl text-sm text-[#f39800] hover:bg-[#fff8ed] transition-colors"
        >
          + 材料を追加
        </button>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-[#f39800] rounded-xl text-sm font-medium text-white hover:bg-[#c97f00]"
        >
          {initial?.id ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}
