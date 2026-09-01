import { useState } from 'react'
import { isOverdue, monthKey, monthLabel } from '../lib/dates'
import TaskRow from './TaskRow'
import TaskForm from './TaskForm'

export default function MonthsView({ tasks, updateTask, deleteTask }) {
  const overdue = tasks.filter(isOverdue)
  const groups = {}
  for (const t of overdue) (groups[monthKey(t.due_date)] ??= []).push(t)
  const months = Object.keys(groups).sort().reverse()
  const [openMonth, setOpenMonth] = useState(months[0] ?? null)
  const [editing, setEditing] = useState(null)

  function save(fields) { updateTask(editing.id, fields); setEditing(null) }

  if (overdue.length === 0) return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-2">Months</h2>
      <div className="bg-mint-soft border border-mint/30 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-1">✓</div>
        <p className="font-semibold text-ink">Everything's caught up.</p>
        <p className="text-ink-2 text-sm mt-1">Unfinished tasks from past days would collect here, grouped by month.</p>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-1">Months</h2>
      <p className="text-ink-2 text-sm mb-6 font-medium">{overdue.length} unfinished task{overdue.length > 1 ? 's' : ''} from past days. They still show on their original day too.</p>

      <ul className="space-y-3">
        {months.map((m) => {
          const list = groups[m]
          const open = openMonth === m
          return (
            <li key={m} className="bg-card border border-line rounded-2xl overflow-hidden">
              <button onClick={() => setOpenMonth(open ? null : m)} className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-canvas transition-colors">
                <span className="font-display text-lg font-bold">{monthLabel(m)}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-bold text-coral-ink bg-coral-soft rounded-full px-2.5 py-0.5">{list.length}</span>
                  <span className={`text-ink-3 font-bold transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                </span>
              </button>
              {open && (
                <ul className="px-3 pb-3">
                  {list.map((t) => editing?.id === t.id
                    ? <li key={t.id} className="mb-2"><TaskForm initial={t} onSave={save} onCancel={() => setEditing(null)} /></li>
                    : <TaskRow key={t.id} task={t} showDay onToggle={(x) => updateTask(x.id, { done: !x.done })} onEdit={setEditing} onDelete={(x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id)} />)}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
