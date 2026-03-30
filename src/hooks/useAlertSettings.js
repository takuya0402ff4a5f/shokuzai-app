import { useState, useEffect } from 'react'

const KEY = 'shokuzai_alerts'
const DEFAULT_ALERTS = [
  { name: '砂糖', threshold: 20 },
  { name: '塩',   threshold: 20 },
  { name: '酢',   threshold: 20 },
  { name: '醤油', threshold: 20 },
  { name: 'みそ', threshold: 20 },
]

export function useAlertSettings() {
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? JSON.parse(saved) : DEFAULT_ALERTS
    } catch {
      return DEFAULT_ALERTS
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(alerts))
  }, [alerts])

  function addAlert(name, threshold = 20) {
    if (!name.trim()) return
    setAlerts(prev => {
      if (prev.some(a => a.name === name.trim())) return prev
      return [...prev, { name: name.trim(), threshold: Number(threshold) }]
    })
  }

  function updateThreshold(name, threshold) {
    setAlerts(prev =>
      prev.map(a => a.name === name ? { ...a, threshold: Number(threshold) } : a)
    )
  }

  function removeAlert(name) {
    setAlerts(prev => prev.filter(a => a.name !== name))
  }

  return { alerts, addAlert, updateThreshold, removeAlert }
}
