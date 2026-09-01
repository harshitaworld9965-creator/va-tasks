import { useState } from 'react'
import TaskRow from './TaskRow'
import TaskForm from './TaskForm'

export default function UnscheduledView({ tasks, addTask, updateTask, deleteTask }) {
  const list = tasks.filter((t) => !t.due_date)
  const open = list.filter((t) => !t.done)
  const done = list.filter((t) => t.done)
  const [editing, setEditing] = useState(null)

  function save(fields) {
    if (editing === 'new') addTask(fields)
    else updateTask(editing.id, fields)
    setEditing(null)
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight mb-1">Unscheduled</h2>
      <p className="text-ink-2 text-sm mb-6 font-medium">Tasks with no day. Give one a day to move it into the calendar.</p>

      {editing === 'new'
        ? <div className="mb-4"><TaskForm onSave={save} onCancel={() => setEditing(null)} /></div>
        : <button onClick={() => setEditing('new')} className="w-full flex items-center gap-2 text-left font-semibold text-violet bg-violet-soft hover:bg-violet hover:text-white rounded-xl px-4 py-3 mb-4 transition-colors">
            <span className="text-lg leading-none">+</span> Add a task
          </button>}

      {open.length === 0 && editing !== 'new' && <p className="text-ink-3 font-medium text-sm py-10 text-center">No unscheduled tasks.</p>}

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
