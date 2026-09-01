import { useState } from 'react'
import { addDays, today, dayLabel, shortDay, fromKey, isOverdue } from '../lib/dates'
import TaskRow from './TaskRow'
import TaskForm from './TaskForm'

export default function DaysView({ tasks, addTask, updateTask, deleteTask }) {
  const [day, setDay] = useState(today())
  const [editing, setEditing] = useState(null)
  const strip = Array.from({ length: 9 }, (_, i) => addDays(day, i - 4))

  const dayTasks = tasks.filter((t) => t.due_date === day)
  const open = dayTasks.filter((t) => !t.done)
  const done = dayTasks.filter((t) => t.done)
  const overdueCount = tasks.filter(isOverdue).length
  const isToday = day === today()

  function save(fields) {
    if (editing === 'new') addTask(fields)
    else updateTask(editing.id, fields)
    setEditing(null)
  }

  return (
    <div>
      {/* Hero — the loud, characteristic panel */}
      <div className="bg-violet text-white rounded-3xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">{dayLabel(day)}</h2>
            <p className="mt-2 text-white/80 font-medium">
              {open.length === 0 ? 'All clear.' : `${open.length} to do`}{done.length > 0 && ` · ${done.length} done`}
            </p>
          </div>
          {!isToday && (
            <button onClick={() => setDay(today())} className="shrink-0 text-sm font-bold bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 transition-colors">Today</button>
          )}
        </div>
        {isToday && overdueCount > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-coral text-white font-bold text-sm rounded-xl px-3 py-2">
            <span className="text-base">⚠</span>
            {overdueCount} task{overdueCount > 1 ? 's' : ''} slipped past — check the Months tab
          </div>
        )}
      </div>

      {/* Colored week strip */}
      <div className="flex items-center gap-1.5 mb-6 -mx-1 overflow-x-auto pb-1">
        <button onClick={() => setDay(addDays(day, -1))} aria-label="Previous day" className="shrink-0 w-8 h-9 rounded-xl hover:bg-violet-soft text-ink-2 font-bold">‹</button>
        {strip.map((k) => {
          const n = tasks.filter((t) => t.due_date === k && !t.done).length
          const late = k < today() && n > 0
          const active = k === day
          return (
            <button key={k} onClick={() => setDay(k)}
              className={`shrink-0 w-12 py-2 rounded-2xl flex flex-col items-center transition-colors
                ${active ? 'bg-ink text-white' : 'bg-card border border-line hover:border-violet'}`}>
              <span className={`text-[10px] font-bold ${active ? 'text-white/60' : 'text-ink-3'}`}>{shortDay(k)}</span>
              <span className="font-display text-lg font-extrabold leading-tight">{fromKey(k).getDate()}</span>
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${n === 0 ? 'bg-transparent' : active ? 'bg-white' : late ? 'bg-coral' : 'bg-violet'}`} />
            </button>
          )
        })}
        <button onClick={() => setDay(addDays(day, 1))} aria-label="Next day" className="shrink-0 w-8 h-9 rounded-xl hover:bg-violet-soft text-ink-2 font-bold">›</button>
      </div>

      {editing === 'new'
        ? <div className="mb-4"><TaskForm defaultDate={day} onSave={save} onCancel={() => setEditing(null)} /></div>
        : <button onClick={() => setEditing('new')} className="w-full flex items-center gap-2 text-left font-semibold text-violet bg-violet-soft hover:bg-violet hover:text-white rounded-xl px-4 py-3 mb-4 transition-colors">
            <span className="text-lg leading-none">+</span> Add a task for this day
          </button>}

      {dayTasks.length === 0 && editing !== 'new' && (
        <p className="text-ink-3 font-medium text-sm py-10 text-center">Nothing planned yet. Add the first thing above.</p>
      )}

      <ul>
        {open.map((t) => editing?.id === t.id
          ? <li key={t.id} className="mb-2"><TaskForm initial={t} onSave={save} onCancel={() => setEditing(null)} /></li>
          : <TaskRow key={t.id} task={t} onToggle={(x) => updateTask(x.id, { done: !x.done })} onEdit={setEditing} onDelete={(x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id)} />)}
      </ul>

      {done.length > 0 && (
        <details className="mt-3">
          <summary className="text-sm font-bold text-ink-2 cursor-pointer select-none py-1">Done ({done.length})</summary>
          <ul className="mt-2">
            {done.map((t) => <TaskRow key={t.id} task={t} onToggle={(x) => updateTask(x.id, { done: !x.done })} onEdit={setEditing} onDelete={(x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id)} />)}
          </ul>
        </details>
      )}
    </div>
  )
}
