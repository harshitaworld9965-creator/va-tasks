import { useEffect, useState } from 'react'

const empty = { title: '', notes: '', due_date: '', reminder_time: '' }

export default function TaskForm({ initial, defaultDate, onSave, onCancel }) {
  const [f, setF] = useState(empty)

  useEffect(() => {
    if (initial) setF({
      title: initial.title ?? '',
      notes: initial.notes ?? '',
      due_date: initial.due_date ?? '',
      reminder_time: initial.reminder_time ? initial.reminder_time.slice(0, 5) : '',
    })
    else setF({ ...empty, due_date: defaultDate ?? '' })
  }, [initial, defaultDate])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return
    onSave({
      title: f.title.trim(),
      notes: f.notes.trim() || null,
      due_date: f.due_date || null,
      reminder_time: f.due_date && f.reminder_time ? f.reminder_time : null,
    })
  }

  return (
    <form onSubmit={submit} className="bg-card border-2 border-violet/30 rounded-2xl p-4 shadow-[0_8px_30px_-12px] shadow-violet/40">
      <input autoFocus placeholder="What needs doing?" value={f.title} onChange={set('title')} required
        className="w-full font-display text-xl font-bold placeholder:text-ink-3 placeholder:font-semibold bg-transparent outline-none mb-3" />
      <textarea placeholder="Notes (optional)" value={f.notes} onChange={set('notes')} rows={2}
        className="w-full text-sm bg-canvas rounded-xl px-3 py-2 outline-none resize-none mb-3" />

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-xs font-bold text-ink-2">
          Day
          <input type="date" value={f.due_date} onChange={set('due_date')}
            className="block mt-1 bg-canvas border border-line rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink" />
        </label>
        <label className="text-xs font-bold text-ink-2">
          Reminder
          <input type="time" value={f.reminder_time} onChange={set('reminder_time')} disabled={!f.due_date}
            className="block mt-1 bg-canvas border border-line rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink disabled:opacity-40" />
        </label>
        {f.due_date && (
          <button type="button" onClick={() => setF({ ...f, due_date: '', reminder_time: '' })}
            className="text-xs font-semibold text-ink-2 hover:text-coral-ink underline underline-offset-4 pb-2">No day</button>
        )}
        <div className="flex-1" />
        <button type="button" onClick={onCancel} className="text-sm font-bold text-ink-2 hover:text-ink px-3 py-2">Cancel</button>
        <button className="text-sm font-bold bg-violet hover:bg-violet-2 text-white rounded-xl px-5 py-2 transition-colors">
          {initial ? 'Save' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
