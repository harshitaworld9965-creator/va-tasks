import { useState } from 'react'
import { addDays, today, shortDay, fromKey } from '../lib/dates'
import TaskRow from './TaskRow'
import Section from './Section'

const PREVIEW = 3 // carried-over tasks shown before "Show all"

export default function DaysView({ tasks, updateTask, deleteTask, openSheet }) {
  const [day, setDay] = useState(today())
  const [showAllCarried, setShowAllCarried] = useState(false)
  const isToday = day === today()
  const strip = Array.from({ length: 7 }, (_, i) => addDays(day, i - 3))

  const dayTasks = tasks.filter((t) => t.due_date === day)
  const open = dayTasks.filter((t) => !t.done)
  const done = dayTasks.filter((t) => t.done)
  const carried = isToday ? tasks.filter((t) => !t.done && t.due_date && t.due_date < today()) : []
  const carriedShown = showAllCarried ? carried : carried.slice(0, PREVIEW)

  const rowProps = {
    onToggle: (x) => updateTask(x.id, { done: !x.done }),
    onEdit: (x) => openSheet({ task: x }),
    onDelete: (x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id),
    onReschedule: (x, date) => updateTask(x.id, { due_date: date }),
  }
  const moveAll = (date) => carried.forEach((t) => updateTask(t.id, { due_date: date }))

  const heading = isToday ? 'Today' : fromKey(day).toLocaleDateString('en-IN', { weekday: 'long' })
  const sub = fromKey(day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

  return (
    <div>
      {/* Title left, week strip right */}
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

      {/* The day's own tasks first */}
      <Section title="To do" count={open.length}>
        <ul>
          {open.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}
          <li>
            <button onClick={() => openSheet({ defaultDate: day })}
              className="w-full flex items-center gap-3 py-2 text-sm text-ink-3 hover:text-violet transition-colors">
              <span className="w-[18px] h-[18px] grid place-items-center text-lg leading-none">+</span> Add task
            </button>
          </li>
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
          <ul>{carriedShown.map((t) => <TaskRow key={t.id} task={t} carried {...rowProps} />)}</ul>
          {carried.length > PREVIEW && (
            <button onClick={() => setShowAllCarried(!showAllCarried)}
              className="w-full text-center text-xs font-medium text-coral-ink py-2 hover:underline">
              {showAllCarried ? 'Show less' : `Show all ${carried.length}`}
            </button>
          )}
        </Section>
      )}

      {done.length > 0 && (
        <details className="px-1">
          <summary className="text-sm text-ink-2 cursor-pointer select-none py-1">Completed · {done.length}</summary>
          <ul className="mt-1">{done.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}</ul>
        </details>
      )}
    </div>
  )
}