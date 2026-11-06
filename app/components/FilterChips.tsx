// Active search choices (dark, with ✕ to remove) followed by the toggleable
// status chips. Every chip is a link, so filtering works without JavaScript.
import { STATUS_CHIPS, activeFilterChips, filterHref, toggleStatus, type RaceFilters, type StatusChip } from '@/app/lib/filters';

export default function FilterChips({ filters }: { filters: RaceFilters }) {
  return (
    <div className="chips" aria-label="Filters">
      {activeFilterChips(filters).map((c) => (
        <a key={c.label} className="chip on" href={filterHref(filters, c.clear)} aria-label={`Remove ${c.label}`}>
          {c.label} <span className="x" aria-hidden="true">✕</span>
        </a>
      ))}
      {(Object.keys(STATUS_CHIPS) as StatusChip[]).map((k) => {
        const on = filters.status.includes(k);
        return (
          <a
            key={k}
            className={on ? 'chip on' : 'chip'}
            href={filterHref(filters, { status: toggleStatus(filters.status, k) })}
            aria-current={on ? 'true' : undefined}
          >
            {STATUS_CHIPS[k]}
            {on && <span className="x" aria-hidden="true">✕</span>}
          </a>
        );
      })}
      <a className="chip more" href="#q">More filters</a>
    </div>
  );
}
