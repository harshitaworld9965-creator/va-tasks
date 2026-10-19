import { today, addDays, toKey, fromKey } from './dates'

// Reads a typed task like "Call bank kal 10am" and pulls out the day and time.
// Understands: today/aaj, tomorrow/kal, parso, weekdays, "25 oct", "oct 25", "25/10",
// and times like "10am", "5:30 pm", "17:00".

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

function nextWeekday(i) {
  const t = fromKey(today())
  let diff = (i - t.getDay() + 7) % 7
  if (diff === 0) diff = 7
  return addDays(today(), diff)
}

function dayMonth(d, m) {
  const year = fromKey(today()).getFullYear()
  let key = toKey(new Date(year, m, d))
  if (key < today()) key = toKey(new Date(year + 1, m, d))
  return key
}

const pad = (n) => String(n).padStart(2, '0')

// Whole day/month names only, so words like "Monitor" or "Marketing" aren't misread.
const DAY_RE = 'sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?'
const MONTH_RE = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?'
const monthIndex = (name) => MONTHS.indexOf(name.slice(0, 3).toLowerCase())

export function parseQuick(text) {
  let s = ` ${text} `
  let date = null
  let time = null

  function take(re, fn) {
    const m = s.match(re)
    if (!m) return null
    const result = fn(m)
    if (result == null) return null
    s = s.replace(m[0], ' ')
    return result
  }

  // Time first, so "10" in "10am" isn't mistaken for a date.
  time =
    take(/\s(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i, (m) => {
      let h = Number(m[1]) % 12
      if (m[3].toLowerCase() === 'pm') h += 12
      const min = Number(m[2] || 0)
      return h < 24 && min < 60 ? `${pad(h)}:${pad(min)}` : null
    }) ??
    take(/\s(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/, (m) => `${pad(Number(m[1]))}:${m[2]}`)

  date =
    take(/\s(?:on\s+)?(?:today|aaj)\b/i, () => today()) ??
    take(/\s(?:on\s+)?(?:day after tomorrow|parso|parson)\b/i, () => addDays(today(), 2)) ??
    take(/\s(?:by\s+|on\s+)?(?:tomorrow|tmrw|tmr|kal)\b/i, () => addDays(today(), 1)) ??
    take(new RegExp(`\\s(?:on\\s+|next\\s+|this\\s+)?(${DAY_RE})\\b`, 'i'), (m) => {
      const i = DAYS.indexOf(m[1].slice(0, 3).toLowerCase())
      return i >= 0 ? nextWeekday(i) : null
    }) ??
    take(new RegExp(`\\s(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_RE})\\b`, 'i'), (m) =>
      dayMonth(Number(m[1]), monthIndex(m[2]))) ??
    take(new RegExp(`\\s(?:on\\s+)?(${MONTH_RE})\\s+(\\d{1,2})\\b`, 'i'), (m) =>
      dayMonth(Number(m[2]), monthIndex(m[1]))) ??
    take(/\s(?:on\s+)?(\d{1,2})\/(\d{1,2})\b/, (m) => {
      const d = Number(m[1]), mo = Number(m[2]) - 1
      return d >= 1 && d <= 31 && mo >= 0 && mo < 12 ? dayMonth(d, mo) : null
    })

  const title = s
    .replace(/\s+([:,.])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[:,\-–\s]+|[:,\-–\s]+$/g, '')
    .replace(/\s+(at|on|by)$/i, '')

  return { title, date, time }
}