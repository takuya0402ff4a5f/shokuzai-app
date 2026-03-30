import { useState, useMemo } from 'react'
import { FRESH_FROZEN_PAIRS } from '../data/ingredientAliases'
import { INGREDIENTS_DB } from '../data/ingredientsDb'

const DB_CATEGORIES = [
  '野菜・きのこ', '豆腐・大豆', '肉', '魚介', '卵・乳製品',
  '調味料', '乾物・主食', '果物', 'その他', '冷凍',
]

// カテゴリ別の食材名一覧（DB + ユーザー登録食材）
function useIngredientsByCategory(userIngredients) {
  return useMemo(() => {
    const map = {}
    for (const cat of DB_CATEGORIES) map[cat] = new Set()
    for (const item of INGREDIENTS_DB) {
      if (map[item.category]) map[item.category].add(item.name)
    }
    for (const item of userIngredients) {
      const cat = item.category ?? 'その他'
      if (!map[cat]) map[cat] = new Set()
      map[cat].add(item.name)
    }
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]))
  }, [userIngredients])
}

// カテゴリ+食材名 ピッカー
function IngredientPicker({ label, category, name, onCategoryChange, onNameChange, byCategory }) {
  const [showCustom, setShowCustom] = useState(false)
  const names = category ? (byCategory[category] ?? []) : []

  function handleCategoryChange(cat) {
    setShowCustom(false)
    onCategoryChange(cat)
    onNameChange('')
  }

  function handleSelectChange(val) {
    if (val === '__custom__') {
      setShowCustom(true)
      onNameChange('')
    } else {
      setShowCustom(false)
      onNameChange(val)
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      <select
        value={category}
        onChange={e => handleCategoryChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800] bg-white"
      >
        <option value="">カテゴリを選択</option>
        {DB_CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {category && (
        <select
          value={showCustom ? '__custom__' : name}
          onChange={e => handleSelectChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800] bg-white"
        >
          <option value="">食材を選択</option>
          {names.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
          <option value="__custom__">その他（直接入力）</option>
        </select>
      )}
      {category && showCustom && (
        <input
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder={`${label}を入力`}
          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
        />
      )}
    </div>
  )
}

export default function SettingsScreen({
  settings, onUpdate,
  aliases = [], onAddAlias, onRemoveAlias, onUpdateAliasPriority,
  pairPriorities = {}, onUpdatePairPriority,
  alerts = [], onAddAlert, onUpdateAlertThreshold, onRemoveAlert,
  ingredients = [],
}) {
  const byCategory = useIngredientsByCategory(ingredients)

  // カスタム代替フォーム
  const [fromCat, setFromCat] = useState('')
  const [fromName, setFromName] = useState('')
  const [toCat, setToCat] = useState('')
  const [toName, setToName] = useState('')
  const [addPriority, setAddPriority] = useState('from_first')

  // お問い合わせフォーム
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [inquiryContact, setInquiryContact] = useState('')
  const [inquiryState, setInquiryState] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  async function handleInquirySubmit(e) {
    e.preventDefault()
    if (!inquiryMessage.trim()) return
    setInquiryState('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/shushoku.takuya1993@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: '食材管理アプリへのお問い合わせ',
          message: inquiryMessage.trim(),
          contact: inquiryContact.trim() || '（未記入）',
          _template: 'table',
        }),
      })
      if (res.ok) {
        setInquiryState('sent')
        setInquiryMessage('')
        setInquiryContact('')
        setTimeout(() => setInquiryState('idle'), 5000)
      } else {
        setInquiryState('error')
        setTimeout(() => setInquiryState('idle'), 4000)
      }
    } catch {
      setInquiryState('error')
      setTimeout(() => setInquiryState('idle'), 4000)
    }
  }

  // アラートフォーム
  const [alertCat, setAlertCat] = useState('')
  const [alertName, setAlertName] = useState('')
  const [alertThreshold, setAlertThreshold] = useState(20)

  function handleAddAlias() {
    if (!fromName.trim() || !toName.trim()) return
    onAddAlias(fromName.trim(), toName.trim(), addPriority)
    setFromCat(''); setFromName(''); setToCat(''); setToName(''); setAddPriority('from_first')
  }

  function handleAddAlert() {
    if (!alertName.trim()) return
    onAddAlert(alertName.trim(), Number(alertThreshold))
    setAlertCat(''); setAlertName(''); setAlertThreshold(20)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 flex flex-col gap-6">

      {/* 代替対応ペア一覧 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">代替対応ペア</h2>
        <p className="text-xs text-gray-400 mb-3">
          レシピ消込時に自動で代替使用される組み合わせ（双方向）
        </p>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-3">
          {FRESH_FROZEN_PAIRS.map(pair => (
            <div key={pair.fresh} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 flex-1">{pair.fresh}</span>
                <span className="text-xs text-gray-400">↔</span>
                <span className="text-sm text-gray-500 flex-1 text-right">{pair.frozen}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdatePairPriority?.(pair.fresh, 'fresh_first')}
                  className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
                    (pairPriorities[pair.fresh] ?? 'fresh_first') === 'fresh_first'
                      ? 'bg-[#f39800] text-white border-[#f39800]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                  }`}
                >
                  {pair.fresh}優先
                </button>
                <button
                  onClick={() => onUpdatePairPriority?.(pair.fresh, 'frozen_first')}
                  className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
                    (pairPriorities[pair.fresh] ?? 'fresh_first') === 'frozen_first'
                      ? 'bg-[#f39800] text-white border-[#f39800]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                  }`}
                >
                  {pair.frozen}優先
                </button>
              </div>
            </div>
          ))}
          {aliases.map((a, i) => (
            <div key={i} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-800 flex-1 truncate">{a.from}</span>
                <span className="text-xs text-gray-400 shrink-0">↔</span>
                <span className="text-sm text-gray-800 flex-1 text-right truncate">{a.to}</span>
                <button
                  onClick={() => onRemoveAlias(i)}
                  className="text-gray-300 hover:text-[#e83848] transition-colors text-sm leading-none ml-1 shrink-0"
                >✕</button>
              </div>
              {/* 優先度選択 */}
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateAliasPriority?.(i, 'from_first')}
                  className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
                    (a.priority ?? 'from_first') === 'from_first'
                      ? 'bg-[#f39800] text-white border-[#f39800]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                  }`}
                >
                  {a.from}優先
                </button>
                <button
                  onClick={() => onUpdateAliasPriority?.(i, 'to_first')}
                  className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
                    a.priority === 'to_first'
                      ? 'bg-[#f39800] text-white border-[#f39800]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                  }`}
                >
                  {a.to}優先
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* カスタム代替追加フォーム */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-3">
          <p className="text-xs text-gray-500 font-medium">カスタム代替を追加</p>
          <div className="flex gap-3 items-start">
            <IngredientPicker
              label="食材"
              category={fromCat}
              name={fromName}
              onCategoryChange={setFromCat}
              onNameChange={setFromName}
              byCategory={byCategory}
            />
            <span className="text-xs text-gray-400 shrink-0 mt-2">↔</span>
            <IngredientPicker
              label="代替食材"
              category={toCat}
              name={toName}
              onCategoryChange={setToCat}
              onNameChange={setToName}
              byCategory={byCategory}
            />
          </div>
          {/* 優先度選択 */}
          {fromName && toName && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddPriority('from_first')}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                  addPriority === 'from_first'
                    ? 'bg-[#f39800] text-white border-[#f39800]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                }`}
              >
                {fromName}優先
              </button>
              <button
                type="button"
                onClick={() => setAddPriority('to_first')}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                  addPriority === 'to_first'
                    ? 'bg-[#f39800] text-white border-[#f39800]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#f39800]'
                }`}
              >
                {toName}優先
              </button>
            </div>
          )}
          <button
            onClick={handleAddAlias}
            disabled={!fromName.trim() || !toName.trim()}
            className="w-full bg-[#f39800] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#c97f00] disabled:opacity-40 transition-colors"
          >
            追加
          </button>
        </div>
      </section>

      {/* 調味料タブ さしすせそ優先 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">調味料タブの並び順</h2>
        <p className="text-xs text-gray-400 mb-3">
          砂糖・塩・酢・醤油・味噌を一番上に固定表示する
        </p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => onUpdate('condimentSort', true)}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 transition-colors ${
              settings.condimentSort !== false ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              settings.condimentSort !== false ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {settings.condimentSort !== false && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">さしすせそを上位表示</p>
              <p className="text-xs text-gray-400 mt-0.5">砂糖→塩→酢→醤油→味噌の順で固定</p>
            </div>
          </button>
          <button
            onClick={() => onUpdate('condimentSort', false)}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
              settings.condimentSort === false ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              settings.condimentSort === false ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {settings.condimentSort === false && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">登録順に表示</p>
              <p className="text-xs text-gray-400 mt-0.5">追加した順番のまま表示</p>
            </div>
          </button>
        </div>
      </section>

      {/* 買い物アラート設定 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">買い物アラート設定</h2>
        <p className="text-xs text-gray-400 mb-3">
          残量が閾値以下になると買い物リストにサジェスト表示されます
        </p>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-3">
          {alerts.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">設定なし</p>
          )}
          {alerts.map(a => (
            <div key={a.name} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-gray-800 flex-1">{a.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={a.threshold}
                  onChange={e => onUpdateAlertThreshold(a.name, e.target.value)}
                  className="w-14 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f39800]"
                />
                <span className="text-xs text-gray-400">%以下</span>
              </div>
              <button
                onClick={() => onRemoveAlert(a.name)}
                className="text-gray-300 hover:text-[#e83848] transition-colors text-sm leading-none ml-1"
              >✕</button>
            </div>
          ))}
        </div>
        {/* アラート追加フォーム */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-3">
          <p className="text-xs text-gray-500 font-medium">アラートを追加</p>
          <IngredientPicker
            label="食材名"
            category={alertCat}
            name={alertName}
            onCategoryChange={setAlertCat}
            onNameChange={setAlertName}
            byCategory={byCategory}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0">残量が</span>
            <input
              type="number"
              min={1}
              max={100}
              value={alertThreshold}
              onChange={e => setAlertThreshold(e.target.value)}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f39800]"
            />
            <span className="text-xs text-gray-500 shrink-0">% 以下になったらサジェスト</span>
          </div>
          <button
            onClick={handleAddAlert}
            disabled={!alertName.trim()}
            className="w-full bg-[#f39800] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#c97f00] disabled:opacity-40 transition-colors"
          >
            追加
          </button>
        </div>
      </section>

      {/* カレンダー開始曜日 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">週間献立の開始曜日</h2>
        <p className="text-xs text-gray-400 mb-3">カレンダーの左端に表示する曜日</p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => onUpdate('weekStartsOnSunday', false)}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 transition-colors ${
              !settings.weekStartsOnSunday ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              !settings.weekStartsOnSunday ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {!settings.weekStartsOnSunday && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <p className="text-sm font-medium text-gray-800">月曜始まり（月〜日）</p>
          </button>
          <button
            onClick={() => onUpdate('weekStartsOnSunday', true)}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
              settings.weekStartsOnSunday ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              settings.weekStartsOnSunday ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {settings.weekStartsOnSunday && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <p className="text-sm font-medium text-gray-800">日曜始まり（日〜土）</p>
          </button>
        </div>
      </section>

      {/* 残量0%の自動削除 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">残量0%の自動削除</h2>
        <p className="text-xs text-gray-400 mb-3">料理や「使う」操作で残量が0%になった食材の扱い</p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => onUpdate('autoDeleteZero', false)}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 transition-colors ${
              !settings.autoDeleteZero ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              !settings.autoDeleteZero ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {!settings.autoDeleteZero && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">0%のまま残す</p>
              <p className="text-xs text-gray-400 mt-0.5">「使う」操作時に削除確認ダイアログを表示</p>
            </div>
          </button>
          <button
            onClick={() => onUpdate('autoDeleteZero', true)}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
              settings.autoDeleteZero ? 'bg-[#fff8ed]' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              settings.autoDeleteZero ? 'border-[#f39800] bg-[#f39800]' : 'border-gray-300'
            }`}>
              {settings.autoDeleteZero && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">自動で削除する</p>
              <p className="text-xs text-gray-400 mt-0.5">料理・使う操作で0%になると即リストから削除</p>
            </div>
          </button>
        </div>
      </section>

      {/* お問い合わせ */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">お問い合わせ</h2>
        <p className="text-xs text-gray-400 mb-3">ご意見・ご要望・不具合の報告などお気軽にどうぞ</p>
        <form onSubmit={handleInquirySubmit} className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              メッセージ <span className="text-[#e83848]">*</span>
            </label>
            <textarea
              value={inquiryMessage}
              onChange={e => setInquiryMessage(e.target.value)}
              placeholder="ご意見・ご要望・不具合などをご記入ください"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800] resize-none"
            />
          </div>
          <div className="px-4 py-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              返信先メールアドレス（任意）
            </label>
            <input
              type="email"
              value={inquiryContact}
              onChange={e => setInquiryContact(e.target.value)}
              placeholder="返信不要の場合は空欄"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39800]"
            />
          </div>
          <div className="px-4 py-3">
            {inquiryState === 'sent' ? (
              <p className="text-center text-sm text-[#f39800] font-medium py-1">✓ 送信しました！ありがとうございます</p>
            ) : inquiryState === 'error' ? (
              <p className="text-center text-sm text-[#e30f25] font-medium py-1">送信に失敗しました。時間をおいて再試行してください</p>
            ) : (
              <button
                type="submit"
                disabled={!inquiryMessage.trim() || inquiryState === 'sending'}
                className="w-full bg-[#f39800] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#c97f00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {inquiryState === 'sending' ? '送信中...' : '送信する'}
              </button>
            )}
          </div>
        </form>
      </section>

      {/* データ保存について */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-1">データ保存について</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            食材データ・レシピデータ・設定はすべてこの端末のブラウザ（localStorage）に保存されます。
            アプリを削除したり別の端末・ブラウザからアクセスした場合はデータは共有されません。
          </p>
        </div>
      </section>

    </div>
  )
}
