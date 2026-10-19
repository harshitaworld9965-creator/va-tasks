import { useEffect, useRef, useState } from 'react'
import { today, addDays, fromKey, fmtTime } from '../lib/dates'
import { parseQuick } from '../lib/parseQuick'

const niceDate = (key) => {
  if (!key) return 'No date'
  if (key === today()) return 'Today'
  if (key === addDays(today(), 1)) return 'Tomorrow'
  return fromKey(key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

// One sheet for both adding and editing.
// Adding: type naturally ("Call bank kal 10am") and the day/time are picked up as you type.
// Editing: the title is kept exactly as written; change the day/time with the chips.
export default function TaskSheet({ task, defaultDate, onSave, onDelete, onClose }) {
  const editing = Boolean(task)
  const [text, setText] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [showNotes, setShowNotes] = useState(Boolean(task?.notes))
  // undefined = not touched by hand, so the typed text decides
  const [pickedDate, setPickedDate] = useState(editing ? task.due_date : undefined)
  const [pickedTime, setPickedTime] = useState(editing ? task.reminder_time?.slice(0, 5) ?? null : undefined)
  const [showTime, setShowTime] = useState(false)
  const inputRef = useRef(null)

  const parsed = editing ? { title: text, date: null, time: null } : parseQuick(text)
  const date = pickedDate !== undefined ? pickedDate : parsed.date ?? defaultDate ?? null
  const time = pickedTime !== undefined ? pickedTime : parsed.time
  const title = parsed.title || text.trim()

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    if (!title) return
    onSave({
      title,
      notes: notes.trim() || null,
      due_date: date,
      reminder_time: date && time ? time : null,
    })
  }

  const chip = (active) =>
    `text-xs font-medium rounded-full px-3 py-1.5 border transition-colors whitespace-nowrap ${
      active ? 'bg-violet text-white border-violet' : 'bg-card text-ink-2 border-line hover:border-ink-3'}`

  const tomorrow = addDays(today(), 1)
  const customDate = date && date !== today() && date !== tomorrow

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />

      <form onSubmit={submit}
        className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="sm:hidden mx-auto -mt-2 mb-3 w-10 h-1 rounded-full bg-line" />

        <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={editing ? 'Task' : 'e.g. Call bank kal 10am'}
          className="w-full text-lg font-medium text-ink placeholder:text-ink-3 bg-transparent"
          style={{ outline: 'none' }} />

        {!editing && (parsed.date || parsed.time) && (
          <p className="text-xs text-violet mt-1">
            Picked up: {[parsed.date && niceDate(parsed.date), parsed.time && fmtTime(parsed.time)].filter(Boolean).join(' · ')}
          </p>
        )}

        {showNotes ? (
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2}
            className="w-full mt-3 text-sm bg-canvas rounded-xl px-3 py-2 resize-none"
            style={{ outline: 'none' }} />
        ) : (
          <button type="button" onClick={() => setShowNotes(true)} className="mt-2 text-xs text-ink-3 hover:text-ink">+ Add note</button>
        )}

        {/* Day */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto -mx-5 px-5 pb-1">
          <button type="button" className={chip(date === today())} onClick={() => setPickedDate(today())}>Today</button>
          <button type="button" className={chip(date === tomorrow)} onClick={() => setPickedDate(tomorrow)}>Tomorrow</button>
          <label className={`${chip(customDate)} relative cursor-pointer`}>
            📅 {customDate ? niceDate(date) : 'Pick date'}
            <input type="date" value={date ?? ''} onChange={(e) => setPickedDate(e.target.value || null)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <button type="button" className={chip(!date)} onClick={() => setPickedDate(null)}>No date</button>
        </div>

        {/* Reminder time */}
        {date && (
          <div className="flex items-center gap-2 mt-2.5">
            {time && !showTime ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-soft text-amber-ink rounded-full pl-3 pr-1.5 py-1">
                <button type="button" onClick={() => setShowTime(true)}>⏰ {fmtTime(time)}</button>
                <button type="button" aria-label="Remove reminder" onClick={() => setPickedTime(null)}
                  className="w-5 h-5 grid place-items-center rounded-full hover:bg-amber/30">×</button>
              </span>
            ) : showTime ? (
              <input type="time" autoFocus value={time ?? ''} onChange={(e) => setPickedTime(e.target.value || null)}
                onBlur={() => setShowTime(false)}
                className="text-sm border border-line rounded-lg px-2 py-1" />
            ) : (
              <button type="button" onClick={() => setShowTime(true)} className="text-xs text-ink-3 hover:text-ink">⏰ Add reminder time</button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-5">
          {editing && (
            <button type="button" onClick={() => onDelete(task)} className="text-sm text-coral-ink hover:underline">Delete</button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink-2 hover:text-ink px-3 py-2">Cancel</button>
          <button disabled={!title}
            className="text-sm font-semibold bg-violet hover:bg-violet-2 disabled:opacity-40 text-white rounded-xl px-5 py-2.5 transition-colors">
            {editing ? 'Save' : 'Add task'}
          </button>
        </div>
      </form>
    </div>
  )
}