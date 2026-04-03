// 単位グループ（同グループ内で換算可能）
export const UNIT_GROUPS = {
  volume: ['ml', 'L', '大さじ', '小さじ', 'カップ'],
  weight: ['g', 'kg'],
  count: ['個', '本', '枚', '袋', 'パック', '切れ', '丁', '束', '玉', '節', '尾', '杯', '缶', '箱', '瓶', '房', '合'],
}

// ml または g への換算係数
const TO_BASE = {
  // volume → ml
  ml: 1,
  L: 1000,
  大さじ: 15,
  小さじ: 5,
  カップ: 200,
  // weight → g
  g: 1,
  kg: 1000,
  // count → そのまま
  個: 1,
  本: 1,
  枚: 1,
  袋: 1,
  パック: 1,
  切れ: 1,
}

export function getUnitGroup(unit) {
  for (const [group, units] of Object.entries(UNIT_GROUPS)) {
    if (units.includes(unit)) return group
  }
  return 'count'
}

// unit → totalUnit に換算した値を返す（換算不可なら null）
export function convertToUnit(amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount
  const fromGroup = getUnitGroup(fromUnit)
  const toGroup = getUnitGroup(toUnit)
  if (fromGroup !== toGroup) return null
  if (fromGroup === 'count') return amount // 個など：1対1
  return (amount * TO_BASE[fromUnit]) / TO_BASE[toUnit]
}

// 残量から見やすい表示文字列を生成
export function formatAmount(amount, unit) {
  if (amount == null) return ''
  const rounded = Math.round(amount * 10) / 10
  return `${rounded}${unit}`
}

// 全単位リスト（フォーム選択用）
export const ALL_UNITS = [
  ...UNIT_GROUPS.count,
  ...UNIT_GROUPS.weight,
  ...UNIT_GROUPS.volume,
]

// レシピの使用量を食材のtotalUnitに換算する
// 戻り値: number（換算後の量）| null（換算不可）
export function calcDeduction(recipeAmount, recipeUnit, ingredient) {
  // 適量 → 消費なし（0を返す）
  if (recipeUnit === '適量') return 0
  // 少々 → 約0.3g相当として処理
  if (recipeUnit === '少々') {
    const asGram = 0.3 * recipeAmount
    return calcDeduction(asGram, 'g', ingredient)
  }

  const { totalUnit, refAmount } = ingredient
  if (recipeUnit === totalUnit) return recipeAmount
  const converted = convertToUnit(recipeAmount, recipeUnit, totalUnit)
  if (converted != null) return converted
  // g → count（参考重量で換算: 例 150g ÷ 300g/枚 = 0.5枚）
  if (recipeUnit === 'g' && getUnitGroup(totalUnit) === 'count' && refAmount) {
    return recipeAmount / refAmount
  }
  // count → g（参考重量で換算: 例 2個 × 150g/個 = 300g）
  if (getUnitGroup(recipeUnit) === 'count' && totalUnit === 'g' && refAmount) {
    return recipeAmount * refAmount
  }
  // count → kg（参考重量g で換算: 例 1合 × 150g/合 ÷ 1000 = 0.15kg）
  if (getUnitGroup(recipeUnit) === 'count' && totalUnit === 'kg' && refAmount) {
    return recipeAmount * refAmount / 1000
  }
  // kg → count（参考重量g で換算: 例 0.15kg ÷ (150g/合 ÷ 1000) = 1合）
  if (recipeUnit === 'kg' && getUnitGroup(totalUnit) === 'count' && refAmount) {
    return recipeAmount * 1000 / refAmount
  }
  return null
}

// 「使う」ときに選べる単位（実用的なものだけ）
export function getCompatibleUnits(totalUnit, hasRefAmount = false) {
  const group = getUnitGroup(totalUnit)
  if (group === 'volume') return ['ml', '大さじ', '小さじ']
  if (group === 'weight') return ['g']
  // count系: 元の単位 + g（参考重量があるとき）
  const units = [totalUnit]
  if (hasRefAmount) units.push('g')
  return units
}
