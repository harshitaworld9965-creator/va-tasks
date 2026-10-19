import { toKey, dayLabel } from '../lib/dates'
import TaskRow from './TaskRow'
import Section from './Section'

export default function DoneView({ tasks, updateTask, deleteTask, openSheet }) {
  const done = tasks.filter((t) => t.done)
  const finishedAt = (t) => t.done_at || t.updated_at || t.created_at

  // Group by the day each task was completed, newest first.
  const groups = {}
  for (const t of [...done].sort((a, b) => finishedAt(b).localeCompare(finishedAt(a)))) {
    const key = toKey(new Date(finishedAt(t)))
    ;(groups[key] ??= []).push(t)
  }
  const dayKeys = Object.keys(groups).sort().reverse()

  const rowProps = {
    onToggle: (x) => updateTask(x.id, { done: !x.done }),
    onEdit: (x) => openSheet({ task: x }),
    onDelete: (x) => confirm(`Delete "${x.title}"?`) && deleteTask(x.id),
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight leading-none">Done</h2>
      <p className="text-sm text-ink-2 mt-1.5 mb-5">
        {done.length === 0 ? 'Finished tasks will collect here.' : `${done.length} completed. Tap a circle to bring one back.`}
      </p>

      {dayKeys.map((key) => (
        <Section key={key} title={dayLabel(key)} count={groups[key].length}>
          <ul>{groups[key].map((t) => <TaskRow key={t.id} task={t} showDay {...rowProps} />)}</ul>
        </Section>
      ))}
    </div>
  )
}