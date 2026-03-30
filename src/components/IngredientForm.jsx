import { useState, useEffect, useRef } from 'react'
import { INGREDIENTS_DB, findIngredient, suggestExpiryDate } from '../data/ingredientsDb'

const CATEGORIES = ['野菜・きのこ', '豆腐・大豆', '肉', '魚介', '卵・乳製品', '調味料', '乾物・主食', '果物', '冷凍', 'その他']

const CATEGORY_EMOJI = {
  '野菜・きのこ': '🥦',
  '豆腐・大豆':   '🫘',
  '肉':           '🥩',
  '魚介':         '🐟',
  '卵・乳製品':   '🥚',
  '調味料':       '🧂',
  '乾物・主食':   '🌾',
  '果物':         '🍎',
  '冷凍':         '🧊',
  'その他':       '📦',
}

// カテゴリ別に適切な単位だけ表示
const CATEGORY_UNITS = {
  '野菜・きのこ': ['個', '本', '袋', '束', '玉', '節', '房', 'g', 'kg'],
  '豆腐・大豆':   ['丁', '個', 'g', '袋', 'パック', 'ml'],
  '肉':           ['g', 'kg', '枚', '本', '袋'],
  '魚介':         ['g', '尾', '切れ', '缶', '杯', '本'],
  '卵・乳製品':   ['個', 'g', 'ml', 'L', '枚', 'パック'],
  '調味料':       ['ml', 'L', 'g', '大さじ', '小さじ', 'カップ', '袋', '本'],
  '乾物・主食':   ['g', 'kg', '袋', '箱', '本', '玉', '束', '合'],
  '果物':         ['個', '本', '房', 'パック', 'g', 'kg'],
  '冷凍':         ['g', 'kg', '袋', '個', '本'],
  'その他':       ['個', 'g', 'ml', 'L', '袋', '缶', '本', '瓶', '箱'],
}

const WEIGHT_UNITS = ['g', 'kg', 'ml', 'L']

const EMPTY = {
  name: '',
  category: '野菜・きのこ',
  totalAmount: 1,
  totalUnit: '個',
  expiryDate: '',
  refAmount: '',
  refUnit: 'g',
}

// 合計量 ↔ g 双方向入力コンポーネント
function AmountWithRef({ totalAmount, totalUnit, refAmount, refUnit, onTotalChange }) {
  const [gVal, setGVal] = useState(() =>
    refAmount ? String(Math.round(Number(totalAmount) * Number(refAmount))) : ''
  )
  const isUserEditing = useRef(false)

  // totalAmount が外部変化したとき gVal を追従（ユーザー編集中は無視）
  useEffect(() => {
    if (!isUserEditing.current && refAmount) {
      setGVal(String(Math.round(Number(totalAmount) * Number(refAmount))))
    }
  }, [totalAmount, refAmount])

  function handleGChange(e) {
    const raw = e.target.value
    setGVal(raw)
    isUserEditing.current = true
    const g = Number(raw)
    if (g > 0 && refAmount) {
      onTotalChange(Math.round(g / Number(refAmount) * 10) / 10)
    }
  }

  function handleGBlur() {
    isUserEditing.current = false
    // 入力終了後に正規値に戻す
    if (refAmount) {
      setGVal(String(Math.round(Number(totalAmount) * Number(refAmount))))
    }
  }

  if (!refAmount || WEIGHT_UNITS.includes(totalUnit)) return null

  return (
    <div className="flex items-center gap-2 mt-1.5 bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-400 shrink-0">または合計</span>
      <input
        type="number"
        min="0"
        step="1"
        value={gVal}
        onChange={handleGChange}
        onBlur={handleGBlur}
        className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none min-w-0"
      />
      <span className="text-xs text-gray-400 shrink-0">{refUnit}で入力</span>
    </div>
  )
}

function NameCombobox({ category, value, onChange }) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const allItems = INGREDIENTS_DB.filter(item => item.category === category)
  const filtered = query
    ? allItems.filter(item => item.name.includes(query))
    : allItems

  useEffect(() => {
    setQuery(value ?? '')
  }, [value, category])

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
    onChange({ name: val, fromDb: false })
    setOpen(true)
  }

  function handleSelect(item) {
    setQuery(item.name)
    setOpen(false)
    onChange({ name: item.name, fromDb: true, dbItem: item })
  }

  function handleClear() {
    setQuery('')
    onChange({ name: '', fromDb: false })
    setOpen(true)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="選択または検索…"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map(item => (
              <li key={item.name}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[#fff8ed] flex items-center justify-between ${
                    item.name === query ? 'bg-[#fff8ed] text-[#c97f00] font-medium' : 'text-gray-800'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-400">{item.totalUnit}{item.refAmount ? ` (1${item.totalUnit}≈${item.refAmount}${item.refUnit ?? 'g'})` : ''}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2.5 text-sm text-gray-400">
              「{query}」で登録 →&nbsp;
              <button
                type="button"
                onMouseDown={() => { setOpen(false); onChange({ name: query, fromDb: false }) }}
                className="text-[#f39800] font-medium"
              >
                そのまま使う
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function IngredientForm({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY)
  const [autoFilled, setAutoFilled] = useState(false)
  const [lockedUnit, setLockedUnit] = useState(initial ? initial.totalUnit : null)

  useEffect(() => {
    setForm(initial ?? EMPTY)
    setAutoFilled(false)
    setLockedUnit(initial ? initial.totalUnit : null)
  }, [initial])

  function handleCategoryChange(cat) {
    const firstUnit = CATEGORY_UNITS[cat]?.[0] ?? '個'
    setForm(prev => ({ ...prev, category: cat, name: '', totalUnit: firstUnit }))
    setAutoFilled(false)
    setLockedUnit(null)
  }

  function handleNameChange({ name, fromDb, dbItem }) {
    if (fromDb && dbItem) {
      const suggestedExpiry = dbItem.expiryDays ? suggestExpiryDate(dbItem.expiryDays) : ''
      setForm(prev => ({
        ...prev,
        name,
        totalUnit: dbItem.totalUnit,
        expiryDate: prev.expiryDate || suggestedExpiry,
        refAmount: dbItem.refAmount ?? '',
        refUnit: dbItem.refUnit ?? 'g',
      }))
      setAutoFilled(!!dbItem.expiryDays)
      setLockedUnit(dbItem.totalUnit)
    } else {
      setForm(prev => ({ ...prev, name }))
      setAutoFilled(false)
      setLockedUnit(null)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.totalAmount) return
    onSubmit({
      ...form,
      totalAmount: Number(form.totalAmount),
      remainingPercent: initial?.remainingPercent ?? 100,
    })
  }

  const dbItem = findIngredient(form.name)
  const availableUnits = lockedUnit
    ? [lockedUnit]
    : (CATEGORY_UNITS[form.category] ?? ['個', 'g', 'ml'])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`flex flex-col items-center py-2 rounded-xl border text-xs font-medium transition-colors ${
                form.category === cat
                  ? 'bg-[#f39800] text-white border-[#f39800]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#f8c875]'
              }`}
            >
              <span className="text-lg mb-0.5">{CATEGORY_EMOJI[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 食材名（検索付きコンボボックス） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          食材名 <span className="text-[#e30f25]">*</span>
        </label>
        <NameCombobox
          category={form.category}
          value={form.name}
          onChange={handleNameChange}
        />
      </div>

      {/* 合計量 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          合計量（100%の量）<span className="text-[#e30f25]">*</span>
        </label>
        {/* よく買うサイズ（DB の quickAmounts があるとき表示） */}
        {lockedUnit && dbItem?.quickAmounts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {dbItem.quickAmounts.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, totalAmount: v }))}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  Number(form.totalAmount) === v
                    ? 'bg-[#f39800] text-white border-[#f39800]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                }`}
              >
                {v}{form.totalUnit}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <input
            name="totalAmount"
            type="number"
            min="0"
            step="any"
            value={form.totalAmount}
            onChange={e => setForm(prev => ({ ...prev, totalAmount: e.target.value }))}
            placeholder="例: 3、1000、300"
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
          />
          <select
            name="totalUnit"
            value={form.totalUnit}
            onChange={handleChange}
            disabled={!!lockedUnit}
            className={`w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800] ${
              lockedUnit ? 'bg-gray-50 text-gray-500' : ''
            }`}
          >
            {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {/* 合計量 ↔ g 双方向入力 */}
        <AmountWithRef
          totalAmount={form.totalAmount}
          totalUnit={form.totalUnit}
          refAmount={form.refAmount}
          refUnit={form.refUnit}
          onTotalChange={v => setForm(prev => ({ ...prev, totalAmount: v }))}
        />
      </div>

      {/* 参考重量（個・本など単位のときだけ表示） */}
      {!WEIGHT_UNITS.includes(form.totalUnit) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            参考重量（目安）
            <span className="ml-1 text-xs font-normal text-gray-400">1{form.totalUnit}あたり</span>
          </label>
          <div className="flex gap-3 items-center">
            <input
              name="refAmount"
              type="number"
              min="0"
              step="any"
              value={form.refAmount}
              onChange={handleChange}
              placeholder={dbItem?.refAmount ? `例: ${dbItem.refAmount}` : '例: 150'}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
            />
            <select
              name="refUnit"
              value={form.refUnit}
              onChange={handleChange}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
            </select>
          </div>
          {form.refAmount && form.totalAmount && (
            <p className="text-xs text-gray-400 mt-1">
              合計: 約{Math.round(Number(form.totalAmount) * Number(form.refAmount))}{form.refUnit}
            </p>
          )}
        </div>
      )}

      {/* 消費期限 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          消費期限
          {autoFilled && (
            <span className="ml-2 text-xs text-[#f39800] font-normal">農水省目安から自動入力</span>
          )}
        </label>
        <input
          name="expiryDate"
          type="date"
          value={form.expiryDate}
          onChange={e => { handleChange(e); setAutoFilled(false) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
        {dbItem?.expiryDays && !autoFilled && (
          <p className="text-xs text-gray-400 mt-1">目安: 冷蔵で約{dbItem.expiryDays}日</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#c97f00]"
        >
          {initial ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  )
}
