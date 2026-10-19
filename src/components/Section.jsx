// A white card with a small heading. tone="coral" gives the soft pink "overdue" look.
export default function Section({ title, count, tone = 'ink', action, children }) {
  const color = tone === 'coral' ? 'text-coral-ink' : 'text-ink'
  const surface = tone === 'coral' ? 'bg-[#FFF7F6] border-coral/15' : 'bg-card border-line'
  return (
    <section className={`rounded-2xl border ${surface} px-4 pt-3.5 pb-2 mb-4`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mb-1.5">
          {title && (
            <h3 className={`text-sm font-semibold whitespace-nowrap ${color}`}>
              {title}{count > 0 && <span className="ml-1.5 font-normal text-ink-3">{count}</span>}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}