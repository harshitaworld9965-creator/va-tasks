import { useEffect, useRef, useState } from 'react'
import { fmtTime, isOverdue, today, addDays, fromKey } from '../lib/dates'

const shortDate = (key) => fromKey(key).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export default function TaskRow({ task, showDay, carried, onToggle, onEdit, onDelete, onReschedule }) {
  const overdue = isOverdue(task)
  const alert = overdue || carried
  const orig = task.original_due_date
  const showOrig = orig && orig !== task.due_date
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)

  // Close the menu when clicking anywhere else.
  useEffect(() => {
    if (!menu) return
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenu(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menu])

  function move(date) {
    if (date) onReschedule(task, date)
    setMenu(false)
  }

  // Right-side chip: the one date that matters for this row.
  let chip = null
  if (carried || (showDay && task.due_date)) {
    chip = <span className={alert && !task.done ? 'text-coral-ink' : ''}>{shortDate(task.due_date)}</span>
  }

  return (
    <li className={`group relative flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-canvas transition-colors ${task.done ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(task)} aria-label={task.done ? 'Mark not done' : 'Mark done'}
        className={`shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center transition-colors
          ${task.done ? 'bg-mint border-mint' : alert ? 'border-coral hover:bg-coral-soft' : 'border-ink-3 hover:border-violet'}`}>
        {task.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.6"><path d="M2 6.5l2.6 2.6L10 3.5" /></svg>}
      </button>

      <button onClick={() => onEdit(task)} className="flex-1 min-w-0 text-left">
        <span className={`text-[15px] leading-snug line-clamp-2 ${task.done ? 'line-through text-ink-2' : 'text-ink'}`}>{task.title}</span>
        {(task.notes || showOrig) && (
          <span className="block text-xs text-ink-3 mt-0.5 truncate">
            {task.notes}{task.notes && showOrig && ' · '}{showOrig && `first planned ${shortDate(orig)}`}
          </span>
        )}
      </button>

      <div className="shrink-0 flex items-center gap-2 text-xs text-ink-3 tabular-nums">
        {task.reminder_time && (
          <span className="bg-amber-soft text-amber-ink rounded-md px-1.5 py-0.5">{fmtTime(task.reminder_time)}</span>
        )}
        {chip}
      </div>

      {(onReschedule || onDelete) && (
        <div ref={menuRef} className="relative shrink-0">
          <button onClick={() => setMenu(!menu)} aria-label="More actions"
            className={`w-7 h-7 rounded-md grid place-items-center text-ink-3 hover:text-ink hover:bg-line/60 transition-opacity
              ${menu ? 'opacity-100' : 'sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="13" cy="8" r="1.4" /></svg>
          </button>

          {menu && (
            <div className="absolute right-0 top-8 z-20 w-48 bg-card border border-line rounded-xl shadow-lg p-1 text-sm">
              {!task.done && onReschedule && (
                <>
                  <button onClick={() => move(today())} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-canvas">Move to today</button>
                  <button onClick={() => move(addDays(today(), 1))} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-canvas">Move to tomorrow</button>
                  <label className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg hover:bg-canvas cursor-pointer">
                    Pick a date
                    <input type="date" min={today()} onChange={(e) => move(e.target.value)}
                      className="w-[22px] text-transparent bg-transparent cursor-pointer" aria-label="Pick a date" />
                  </label>
                  <div className="h-px bg-line my-1" />
                </>
              )}
              <button onClick={() => { setMenu(false); onDelete(task) }} className="w-full text-left px-3 py-1.5 rounded-lg text-coral-ink hover:bg-coral-soft">Delete</button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}