// All dates are handled as 'YYYY-MM-DD' strings in local time to avoid timezone drift.

export function toKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today() {
  return toKey(new Date())
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, n) {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export function monthKey(dateKey) {
  return dateKey.slice(0, 7)
}

export function monthLabel(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function dayLabel(key) {
  const d = fromKey(key)
  const t = today()
  if (key === t) return 'Today'
  if (key === addDays(t, 1)) return 'Tomorrow'
  if (key === addDays(t, -1)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function shortDay(key) {
  return fromKey(key).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2)
}

export function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hh = h % 12 || 12
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}

export function isOverdue(task) {
  return !task.done && task.due_date && task.due_date < today()
}
