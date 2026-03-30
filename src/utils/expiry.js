export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry - today) / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= 2) return 'warning'
  return 'ok'
}

export function getExpiryLabel(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}日超過`
  if (days === 0) return '今日まで'
  if (days === 1) return '明日まで'
  return `あと${days}日`
}
