import { ChevronLeft, ChevronRight, Search } from "lucide-react"

/*
 * Shared chrome for the three catalogs (venues, catering, studios). They are
 * the same screen with different nouns, so the header, toolbar, empty state and
 * pagination live here rather than being re-typed three times.
 */

export const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

/** The numbered step ties each catalog back to the plan on the home page. */
export const CatalogHeader = ({ step, title, blurb, count, countLabel, searching }) => (
  <header className="border-b border-line pb-8">
    <p className="eyebrow">
      Step {step} of 3
    </p>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[34px] sm:text-[42px]">{title}</h1>
        <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft">{blurb}</p>
      </div>
      <p className="amount shrink-0 text-[13px] text-ink-mute">
        {searching ? "Matching" : "Showing"} <span className="text-ink">{count ?? 0}</span> {countLabel}
      </p>
    </div>
  </header>
)

/** One search box, the filters beside it, and a reset that only appears when there is something to reset. */
export const CatalogToolbar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  placeholder,
  sortValue,
  onSortChange,
  sortOptions,
  onClear,
  hasFilters,
  children,
}) => (
  <section className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-[6px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={searchTerm}
          placeholder={placeholder}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="field pl-10"
          aria-label={placeholder}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}

        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort by"
          className="field w-auto cursor-pointer pr-8"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button onClick={onSearch} className="btn btn-primary">
          Search
        </button>

        {hasFilters && (
          <button onClick={onClear} className="btn btn-quiet">
            Reset
          </button>
        )}
      </div>
    </div>
  </section>
)

/** A number range reads as two fields with one label, not two orphan inputs. */
export const RangeFilter = ({ label, value, onChange, minPlaceholder = "Min", maxPlaceholder = "Max" }) => (
  <div className="flex items-center gap-1.5" role="group" aria-label={label}>
    <input
      type="number"
      inputMode="numeric"
      min="0"
      placeholder={`${label} ${minPlaceholder.toLowerCase()}`}
      value={value.min}
      onChange={(e) => onChange({ ...value, min: e.target.value })}
      className="field amount w-[7.5rem]"
      aria-label={`${label} ${minPlaceholder.toLowerCase()}`}
    />
    <span className="text-ink-mute" aria-hidden>
      –
    </span>
    <input
      type="number"
      inputMode="numeric"
      min="0"
      placeholder={maxPlaceholder.toLowerCase()}
      value={value.max}
      onChange={(e) => onChange({ ...value, max: e.target.value })}
      className="field amount w-[6rem]"
      aria-label={`${label} ${maxPlaceholder.toLowerCase()}`}
    />
  </div>
)

/** Skeletons keep the grid from collapsing while a page loads. */
export const CardSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card overflow-hidden" aria-hidden>
        <div className="aspect-[4/3] animate-pulse bg-gray-100" />
        <div className="space-y-2.5 p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
)

/** An empty screen is an invitation to act, so it always offers the next move. */
export const EmptyState = ({ title, body, action, onAction }) => (
  <div className="card px-6 py-20 text-center">
    <h2 className="text-[22px]">{title}</h2>
    <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft">{body}</p>
    {action && (
      <button onClick={onAction} className="btn btn-ghost mt-8">
        {action}
      </button>
    )}
  </div>
)

export const Pagination = ({ page, totalPages, onChange }) => {
  if (!totalPages || totalPages <= 1) return null

  const pages = []
  if (page > 3) {
    pages.push(1)
    if (page > 4) pages.push("…")
  }
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i)
  if (page < totalPages - 2) {
    if (page < totalPages - 3) pages.push("…")
    pages.push(totalPages)
  }

  const step = (n) => n >= 1 && n <= totalPages && onChange(n)

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
      <button
        onClick={() => step(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>

      {pages.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={i}
            onClick={() => step(p)}
            aria-current={p === page ? "page" : undefined}
            className={`amount h-9 min-w-9 rounded-md px-2.5 text-[13.5px] transition-colors ${
              p === page
                ? "bg-pine font-semibold text-white"
                : "text-ink-soft hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="px-1.5 text-ink-mute" aria-hidden>
            {p}
          </span>
        ),
      )}

      <button
        onClick={() => step(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </nav>
  )
}
