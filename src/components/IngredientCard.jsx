import { getExpiryStatus, getExpiryLabel } from '../utils/expiry'
import { formatAmount } from '../utils/units'

const EXPIRY_STYLES = {
  expired: { card: 'border-[#f28a92] bg-red-50',      badge: 'bg-red-100 text-[#be0d1f]' },
  warning: { card: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  ok:      { card: 'border-[#fdd9a0] bg-white',      badge: 'bg-[#fef0d4] text-[#c97f00]' },
  none:    { card: 'border-gray-200 bg-white',       badge: 'bg-gray-100 text-gray-500' },
}

const CATEGORY_EMOJI = {
  '野菜・きのこ': '🥦',
  '豆腐・大豆':   '🫘',
  '肉':           '🥩',
  '魚介':         '🐟',
  '卵・乳製品':   '🥚',
  '調味料':       '🧂',
  '乾物・主食':   '🌾',
  '冷凍':         '🧊',
  'その他':       '📦',
}

function StockBar({ percent }) {
  const color =
    percent > 50 ? 'bg-[#f39800]' :
    percent > 20 ? 'bg-yellow-400' : 'bg-[#e30f25]'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1">
      <div
        className={`${color} h-1 rounded-full transition-all duration-300`}
        style={{ width: `${Math.max(2, percent)}%` }}
      />
    </div>
  )
}

export default function IngredientCard({ ingredient, onDelete, onEdit, onUse, onAddToShopping }) {
  const status = getExpiryStatus(ingredient.expiryDate)
  const styles = EXPIRY_STYLES[status]
  const emoji = CATEGORY_EMOJI[ingredient.category] ?? '📦'
  const isExpired = status === 'expired'

  const percent = ingredient.remainingPercent ?? 100
  const remaining = ingredient.totalAmount * (percent / 100)

  function handleThrowAway() {
    if (confirm(`「${ingredient.name}」を捨てますか？`)) {
      onDelete(ingredient.id)
    }
  }

  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2 ${styles.card}`}>
      {/* 上段: 名前 */}
      <p className="font-semibold text-gray-900 text-sm truncate leading-tight">{ingredient.name}</p>

      {/* 残量バー + % */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 truncate">
            {formatAmount(remaining, ingredient.totalUnit)}
            {ingredient.refAmount && !['g','kg','ml','L'].includes(ingredient.totalUnit) && (
              <span className="text-gray-400">･約{Math.round(remaining * ingredient.refAmount)}{ingredient.refUnit}</span>
            )}
          </span>
          <span className={`text-xs font-bold ml-1 shrink-0 ${
            percent > 50 ? 'text-[#f39800]' :
            percent > 20 ? 'text-yellow-600' : 'text-[#be0d1f]'
          }`}>
            {percent}%
          </span>
        </div>
        <StockBar percent={percent} />
        {ingredient.expiryDate && (
          <span className={`text-xs font-medium ${styles.badge.split(' ')[1]}`}>
            {isExpired ? '期限切れ' : getExpiryLabel(ingredient.expiryDate)}
          </span>
        )}
      </div>

      {/* 下段: 使う・編集・削除まとめて */}
      <div className="flex flex-col gap-1">
        {isExpired ? (
          <button
            onClick={handleThrowAway}
            className="w-full text-xs bg-[#e30f25] text-white px-2 py-1.5 rounded-lg hover:bg-[#be0d1f] transition-colors font-medium text-center"
          >捨てる</button>
        ) : (
          <button
            onClick={() => onUse(ingredient)}
            className="w-full text-xs bg-[#f39800] text-white px-2 py-1.5 rounded-lg hover:bg-[#c97f00] transition-colors font-medium text-center"
          >使う</button>
        )}
        <div className="flex items-center gap-1">
          {onAddToShopping && (
            <button
              onClick={() => onAddToShopping(ingredient.name)}
              className="flex-1 text-xs py-1 rounded-lg text-gray-400 hover:text-[#f39800] hover:bg-[#fff8ed] transition-colors font-medium text-center"
            >買い物</button>
          )}
          <button
            onClick={() => onEdit(ingredient)}
            className="flex-1 text-xs py-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors font-medium text-center"
          >編集</button>
          <button
            onClick={() => onDelete(ingredient.id)}
            className="flex-1 text-xs py-1 rounded-lg text-gray-400 hover:text-[#e30f25] hover:bg-red-50 transition-colors font-medium text-center"
          >削除</button>
        </div>
      </div>
    </div>
  )
}
