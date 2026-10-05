import { useState } from 'react'
import { addDays, today, shortDay, fromKey } from '../lib/dates'
import TaskRow from './TaskRow'
import TaskForm from './TaskForm'

function Section({ title, count, tone = 'ink', children, action }) {
  const color = tone === 'coral' ? 'text-coral-ink' : 'text-ink'
  const surface = tone === 'coral' ? 'bg-[#FFF7F6] border-coral/15' : 'bg-card border-line'
  return (
    <section className={`rounded-2xl border ${surface} px-4 pt-3.5 pb-2 mb-4`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mb-1.5">
        <h3 className={`text-sm font-semibold whitespace-nowrap ${color}`}>
          {title}{count > 0 && <span className="ml-1.5 font-normal text-ink-3">{count}</span>}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function DaysView({ tasks, addTask, updateTask, deleteTask }) {
  const [day, setDay] = useState(today())
  const [editing, setEditing] = useState(null)
  const isToday = day === today()
  const strip = Array.from({ length: 7 }, (_, i) => addDays(day, i - 3))

  const dayTasks = tasks.filter((t) => t.due_date === day)
  const open = dayTasks.filter((t) => !t.done)
  const done = dayTasks.filter((t) => t.done)
  const carried = isToday ? tasks.filter((t) => !t.done && t.due_date && t.due_date < today()) : []

  function save(fields) {
    if (editing === 'new') addTask(fields)
    else updateTask(editing.id, fields)
    setEditing(null)
  }
  const rowProps = {
    onToggle: (x) => updateTask(x.id, { done: !x.done }),
    onEdit: setEditing,
    onDelete: (x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id),
    onReschedule: (task, date) => updateTask(task.id, { due_date: date }),
  }
  function moveAll(date) {
    carried.forEach((t) => updateTask(t.id, { due_date: date }))
  }

  const renderRow = (t, extra = {}) => editing?.id === t.id
    ? <li key={t.id} className="py-2"><TaskForm initial={t} onSave={save} onCancel={() => setEditing(null)} /></li>
    : <TaskRow key={t.id} task={t} {...rowProps} {...extra} />

  const heading = isToday ? 'Today' : fromKey(day).toLocaleDateString('en-IN', { weekday: 'long' })
  const sub = fromKey(day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

  return (
    <div>
      {/* Compact header: title left, week strip right */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight leading-none">{heading}</h2>
          <p className="text-sm text-ink-2 mt-1.5">
            {sub} · {open.length === 0 ? 'nothing left' : `${open.length} to do`}
            {!isToday && <button onClick={() => setDay(today())} className="ml-2 text-violet font-medium hover:text-violet-2">Back to today</button>}
          </p>
        </div>

        <div className="flex items-center">
          <button onClick={() => setDay(addDays(day, -7))} aria-label="Previous week" className="w-7 h-9 text-ink-3 hover:text-ink">‹</button>
          {strip.map((k) => {
            const active = k === day
            const isNow = k === today()
            const n = tasks.filter((t) => t.due_date === k && !t.done).length
            const late = k < today() && n > 0
            return (
              <button key={k} onClick={() => setDay(k)} className="w-10 flex flex-col items-center py-1 group">
                <span className={`text-[11px] ${active ? 'text-violet font-semibold' : 'text-ink-3'}`}>{shortDay(k)}</span>
                <span className={`mt-0.5 w-8 h-8 grid place-items-center rounded-full text-sm font-semibold transition-colors
                  ${active ? 'bg-violet text-white' : isNow ? 'text-violet' : 'text-ink group-hover:bg-violet-soft'}`}>
                  {fromKey(k).getDate()}
                </span>
                <span className={`mt-0.5 w-1 h-1 rounded-full ${n === 0 || active ? 'bg-transparent' : late ? 'bg-coral' : 'bg-ink-3'}`} />
              </button>
            )
          })}
          <button onClick={() => setDay(addDays(day, 7))} aria-label="Next week" className="w-7 h-9 text-ink-3 hover:text-ink">›</button>
        </div>
      </div>

      {/* The day's own tasks come first — that's what you open the app for */}
      <Section title="To do" count={open.length}>
        <ul>
          {open.map((t) => renderRow(t))}
          {editing === 'new'
            ? <li className="py-2"><TaskForm defaultDate={day} onSave={save} onCancel={() => setEditing(null)} /></li>
            : (
              <li>
                <button onClick={() => setEditing('new')} className="w-full flex items-center gap-3 py-2 text-sm text-ink-3 hover:text-violet transition-colors">
                  <span className="w-[18px] h-[18px] grid place-items-center text-lg leading-none">+</span> Add task
                </button>
              </li>
            )}
        </ul>
      </Section>

      {carried.length > 0 && (
        <Section title="Carried over" count={carried.length} tone="coral"
          action={
            <div className="flex items-center gap-1 text-xs">
              <span className="text-ink-3 mr-1 whitespace-nowrap">Move all to</span>
              <button onClick={() => moveAll(today())}
                className="font-medium text-coral-ink bg-card border border-coral/25 rounded-md px-2 py-0.5 hover:bg-coral-soft transition-colors">Today</button>
              <button onClick={() => moveAll(addDays(today(), 1))}
                className="font-medium text-coral-ink bg-card border border-coral/25 rounded-md px-2 py-0.5 hover:bg-coral-soft transition-colors">Tomorrow</button>
            </div>
          }>
          <ul>{carried.map((t) => renderRow(t, { carried: true }))}</ul>
        </Section>
      )}

      {done.length > 0 && (
        <details className="px-1">
          <summary className="text-sm text-ink-2 cursor-pointer select-none py-1">Completed · {done.length}</summary>
          <ul className="mt-1">{done.map((t) => renderRow(t))}</ul>
        </details>
      )}
    </div>
  )
}