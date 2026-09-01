import { useState } from 'react'
import { toKey, dayLabel } from '../lib/dates'
import TaskRow from './TaskRow'
import TaskForm from './TaskForm'

export default function DoneView({ tasks, updateTask, deleteTask }) {
  const [editing, setEditing] = useState(null)
  const done = tasks.filter((t) => t.done)

  // Most recently completed first.
  const sorted = [...done].sort((a, b) => {
    const ta = a.done_at || a.updated_at || a.created_at
    const tb = b.done_at || b.updated_at || b.created_at
    return tb.localeCompare(ta)
  })

  // Group by the day each task was completed.
  const groups = {}
  for (const t of sorted) {
    const ts = t.done_at || t.updated_at || t.created_at
    const key = toKey(new Date(ts))
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  const dayKeys = Object.keys(groups).sort().reverse()

  function save(fields) { updateTask(editing.id, fields); setEditing(null) }

  if (done.length === 0) return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-2">Done</h2>
      <div className="bg-mint-soft border border-mint/30 rounded-2xl p-6 text-center">
        <p className="font-semibold text-ink">Nothing finished yet.</p>
        <p className="text-ink-2 text-sm mt-1">Every task you complete lands here, newest first.</p>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-1">Done</h2>
      <p className="text-ink-2 text-sm mb-6 font-medium">{done.length} completed task{done.length > 1 ? 's' : ''}. Tap the circle to bring one back.</p>

      {dayKeys.map((key) => (
        <div key={key} className="mb-5">
          <h3 className="font-display text-sm font-bold text-ink-2 mb-2">{dayLabel(key)}</h3>
          <ul>
            {groups[key].map((t) => editing?.id === t.id
              ? <li key={t.id} className="mb-2"><TaskForm initial={t} onSave={save} onCancel={() => setEditing(null)} /></li>
              : <TaskRow key={t.id} task={t} showDay onToggle={(x) => updateTask(x.id, { done: !x.done })} onEdit={setEditing} onDelete={(x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id)} />)}
          </ul>
        </div>
      ))}
    </div>
  )
}
