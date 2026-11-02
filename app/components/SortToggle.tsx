import { filterHref, SORTS, type RaceFilters, type SortKey } from '@/app/lib/filters';

export default function SortToggle({ filters }: { filters: RaceFilters }) {
  return (
    <div className="sort">
      Sort
      <span className="seg">
        {(Object.keys(SORTS) as SortKey[]).map((key) => (
          <a key={key} className={filters.sort === key ? 'on' : undefined} href={filterHref(filters, { sort: key })}>
            {SORTS[key]}
          </a>
        ))}
      </span>
    </div>
  );
}
