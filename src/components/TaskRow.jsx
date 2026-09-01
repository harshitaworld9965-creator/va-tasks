import { fmtTime, isOverdue, dayLabel } from '../lib/dates'

export default function TaskRow({ task, showDay, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task)
  const accent = task.done ? 'border-l-mint' : overdue ? 'border-l-coral' : 'border-l-violet'

  return (
    <li className={`group relative flex items-start gap-3 bg-card border border-line border-l-4 ${accent} rounded-xl px-3.5 py-3 mb-2 transition-colors hover:border-violet/60 ${task.done ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(task)} aria-label={task.done ? 'Mark not done' : 'Mark done'}
        className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 grid place-items-center transition-all
          ${task.done ? 'bg-mint border-mint scale-100' : overdue ? 'border-coral hover:bg-coral-soft' : 'border-ink-3 hover:border-violet hover:bg-violet-soft'}`}>
        {task.done && <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.4"><path d="M2 6.5l2.6 2.6L10 3.5" /></svg>}
      </button>

      <button onClick={() => onEdit(task)} className="flex-1 min-w-0 text-left">
        <div className={`font-semibold leading-snug ${task.done ? 'line-through' : ''}`}>{task.title}</div>
        {task.notes && <div className="text-sm text-ink-2 mt-0.5 line-clamp-2">{task.notes}</div>}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {showDay && task.due_date && (
            <span className="text-xs font-semibold text-violet bg-violet-soft rounded-md px-1.5 py-0.5">{dayLabel(task.due_date)}</span>
          )}
          {task.reminder_time && (
            <span className="text-xs font-semibold text-amber-ink bg-amber-soft rounded-md px-1.5 py-0.5">⏰ {fmtTime(task.reminder_time)}</span>
          )}
          {overdue && !task.done && (
            <span className="text-xs font-bold text-coral-ink bg-coral-soft rounded-md px-1.5 py-0.5">Overdue</span>
          )}
        </div>
      </button>

      <button onClick={() => onDelete(task)} aria-label="Delete task"
        className="shrink-0 w-6 h-6 rounded-md grid place-items-center text-ink-3 hover:text-coral-ink hover:bg-coral-soft opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all text-lg leading-none">×</button>
    </li>
  )
}
