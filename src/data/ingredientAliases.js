// 生食材 ↔ 冷凍食材の代替ペア定義
// priority設定 'fresh_first' → 生を先に使う
// priority設定 'frozen_first' → 冷凍を先に使う

export const FRESH_FROZEN_PAIRS = [
  { fresh: 'ブロッコリー',   frozen: '冷凍ブロッコリー' },
  { fresh: 'ほうれん草',     frozen: '冷凍ほうれん草' },
  { fresh: '枝豆',           frozen: '冷凍枝豆' },
]

// 名前に対応するペアを取得
function findPair(name) {
  return FRESH_FROZEN_PAIRS.find(p => p.fresh === name || p.frozen === name) ?? null
}

// priority設定に基づき、消費順に並んだ候補名リストを返す
// 例: getOrderedCandidates('ブロッコリー', 'fresh_first') → ['ブロッコリー', '冷凍ブロッコリー']
// 例: getOrderedCandidates('ブロッコリー', 'frozen_first') → ['冷凍ブロッコリー', 'ブロッコリー']
export function getOrderedCandidates(name, priority = 'fresh_first') {
  const pair = findPair(name)
  if (!pair) return [name]

  const isFresh = pair.fresh === name
  const isFrozenPriority = priority === 'frozen_first'

  // 優先側を先頭に
  if (isFresh && !isFrozenPriority) return [pair.fresh, pair.frozen]
  if (!isFresh && isFrozenPriority) return [pair.frozen, pair.fresh]
  if (isFresh && isFrozenPriority)  return [pair.frozen, pair.fresh]
  return [pair.fresh, pair.frozen]
}

// あるレシピ材料名に対して、在庫から参照すべき名前のリストを返す
// customAliases: [{ from, to, priority: 'from_first'|'to_first' }]
// pairPriorities: { [freshName]: 'fresh_first'|'frozen_first' } 組み込みペアの優先度
export function getCandidateNames(name, customAliases = [], pairPriorities = {}) {
  // 組み込みペア: pairPriorities に従う（デフォルト生優先）
  const pair = findPair(name)
  const builtinPrio = pair ? (pairPriorities[pair.fresh] ?? 'fresh_first') : 'fresh_first'
  const base = getOrderedCandidates(name, builtinPrio)

  const high = [] // nameより優先される候補（先頭へ）
  const low  = [] // nameの後ろに追加される候補（末尾へ）

  for (const a of customAliases) {
    const isFrom = a.from === name
    const isTo   = a.to   === name
    if (!isFrom && !isTo) continue

    const other = isFrom ? a.to : a.from
    const prio  = a.priority ?? 'from_first'
    // name が優先側かどうか
    const nameIsPreferred =
      (isFrom && prio === 'from_first') ||
      (isTo   && prio === 'to_first')

    if (nameIsPreferred) {
      low.push(other)   // name を使い切ってから other を使う
    } else {
      high.push(other)  // other を先に使う
    }
  }

  return [...new Set([...high, ...base, ...low])]
}
