import TaskRow from './TaskRow'
import Section from './Section'

export default function UnscheduledView({ tasks, updateTask, deleteTask, openSheet }) {
  const list = tasks.filter((t) => !t.due_date)
  const open = list.filter((t) => !t.done)
  const done = list.filter((t) => t.done)

  const rowProps = {
    onToggle: (x) => updateTask(x.id, { done: !x.done }),
    onEdit: (x) => openSheet({ task: x }),
    onDelete: (x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id),
    onReschedule: (x, date) => updateTask(x.id, { due_date: date }),
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight leading-none">Later</h2>
      <p className="text-sm text-ink-2 mt-1.5 mb-5">No day set yet. Give one a day to move it onto the calendar.</p>

      <Section>
        <ul>
          {open.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}
          <li>
            <button onClick={() => openSheet({ defaultDate: null })}
              className="w-full flex items-center gap-3 py-2 text-sm text-ink-3 hover:text-violet transition-colors">
              <span className="w-[18px] h-[18px] grid place-items-center text-lg leading-none">+</span> Add task
            </button>
          </li>
        </ul>
      </Section>

      {done.length > 0 && (
        <details className="px-1">
          <summary className="text-sm text-ink-2 cursor-pointer select-none py-1">Completed · {done.length}</summary>
          <ul className="mt-1">{done.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}</ul>
        </details>
      )}
    </div>
  )
}