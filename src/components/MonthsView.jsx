import { useState } from 'react'
import { isOverdue, monthKey, monthLabel } from '../lib/dates'
import TaskRow from './TaskRow'

export default function MonthsView({ tasks, updateTask, deleteTask, openSheet }) {
  const overdue = tasks.filter(isOverdue)
  const groups = {}
  for (const t of overdue) (groups[monthKey(t.due_date)] ??= []).push(t)
  const months = Object.keys(groups).sort().reverse()
  const [openMonth, setOpenMonth] = useState(months[0] ?? null)

  const rowProps = {
    onToggle: (x) => updateTask(x.id, { done: !x.done }),
    onEdit: (x) => openSheet({ task: x }),
    onDelete: (x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id),
    onReschedule: (x, date) => updateTask(x.id, { due_date: date }),
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight leading-none">Months</h2>
      <p className="text-sm text-ink-2 mt-1.5 mb-5">
        {overdue.length === 0 ? 'Nothing slipped. Everything is caught up.' : `${overdue.length} unfinished from past days, by month`}
      </p>

      <div className="space-y-3">
        {months.map((m) => {
          const list = groups[m]
          const open = openMonth === m
          return (
            <section key={m} className="bg-card border border-line rounded-2xl">
              <button onClick={() => setOpenMonth(open ? null : m)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <span className="text-sm font-semibold">{monthLabel(m)}</span>
                <span className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-coral-ink">{list.length} open</span>
                  <span className={`text-ink-3 transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                </span>
              </button>
              {open && (
                <ul className="px-4 pb-2 -mt-1">
                  {list.map((t) => <TaskRow key={t.id} task={t} showDay {...rowProps} />)}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}