import { AlertCircle, ArrowLeft, Search, X } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

/*
 * Shared chrome for the staff side. Twelve management screens were each
 * re-inventing their own header, stat tiles, table, badges and confirm dialog;
 * they all live here now so the admin reads as one tool.
 *
 * The staff side is deliberately denser and plainer than the customer side —
 * it is a workbench, not a shopfront.
 */

export const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

export const formatDate = (value, opts = {}) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", ...opts })
    : "—"

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

/* ------------------------------------------------------------------ *
 * Page frame
 * ------------------------------------------------------------------ */

export const AdminPage = ({ children }) => (
  <div className="min-h-screen bg-paper">
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">{children}</div>
  </div>
)

export const AdminHeading = ({ eyebrow, title, description, count, countLabel, children }) => (
  <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-4 t-display">{title}</h1>
      {description && (
        <p className="mt-2 max-w-[60ch] t-body leading-relaxed text-ink-soft">{description}</p>
      )}
      {count !== undefined && (
        <p className="amount mt-2 t-small text-ink-mute">
          <span className="text-ink">{count}</span> {countLabel}
        </p>
      )}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </header>
)

/** A back link that names where it goes, rather than a bare chevron. */
export const BackLink = ({ to, children }) => {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)} className="btn btn-quiet -ml-2.5 mb-6">
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * Numbers
 * ------------------------------------------------------------------ */

/** Stat tiles share one hairline grid so they read as a single instrument panel. */
export const StatGrid = ({ children }) => (
  <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
    {children}
  </dl>
)

export const Stat = ({ label, value, hint, loading, error }) => (
  <div className="bg-surface px-5 py-4">
    <dt className="t-caption font-medium text-ink-mute">{label}</dt>
    <dd className="amount mt-1.5 t-heading font-semibold text-ink">
      {error ? (
        <span className="t-small font-normal text-red-600">Unavailable</span>
      ) : loading ? (
        <span className="inline-block h-6 w-20 animate-pulse rounded bg-gray-100" />
      ) : (
        value
      )}
    </dd>
    {hint && !loading && !error && <p className="mt-0.5 t-caption text-ink-mute">{hint}</p>}
  </div>
)

/* ------------------------------------------------------------------ *
 * Status
 * ------------------------------------------------------------------ */

/* Status colour is decided once, here, so "confirmed" never means green on one
   screen and blue on the next. */
const TONES = {
  neutral: "border-line bg-gray-100 text-ink-soft",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-orange-200 bg-orange-50 text-orange-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  brand: "border-purple-200 bg-purple-50 text-purple-700",
}

const STATUS_TONE = {
  draft: "neutral",
  pending: "warning",
  processing: "info",
  confirmed: "brand",
  completed: "success",
  cancelled: "danger",
  partial: "warning",
  read: "neutral",
  unread: "info",
  resolved: "success",
  active: "success",
  blocked: "danger",
  verified: "success",
  unverified: "warning",
}

export const StatusBadge = ({ status, tone, children }) => {
  const key = String(status || "").toLowerCase()
  const resolved = tone || STATUS_TONE[key] || "neutral"
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 t-caption font-semibold capitalize ${TONES[resolved]}`}
    >
      {children || status || "unknown"}
    </span>
  )
}

/* ------------------------------------------------------------------ *
 * Toolbar
 * ------------------------------------------------------------------ */

export const AdminToolbar = ({ search, onSearch, placeholder, children }) => (
  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
    {onSearch && (
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="field pl-10"
        />
      </div>
    )}
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
)

export const FilterSelect = ({ value, onChange, options, label }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={label}
    className="field w-auto cursor-pointer pr-8 capitalize"
  >
    {options.map((o) =>
      typeof o === "string" ? (
        <option key={o} value={o}>
          {o === "all" ? `All ${label.toLowerCase()}` : o}
        </option>
      ) : (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ),
    )}
  </select>
)

/* ------------------------------------------------------------------ *
 * Table
 * ------------------------------------------------------------------ */

/** Wide tables scroll inside their own frame; the page never scrolls sideways. */
export const Table = ({ head, children }) => (
  <div className="mt-6 overflow-x-auto rounded-lg border border-line">
    <table className="w-full min-w-[720px] border-collapse text-left">
      <thead>
        <tr className="border-b border-line bg-gray-50">
          {head.map((h) => (
            <th
              key={typeof h === "string" ? h : h.label}
              scope="col"
              className={`whitespace-nowrap px-4 py-3 t-caption font-semibold uppercase tracking-[0.08em] text-ink-mute ${
                typeof h === "object" && h.align === "right" ? "text-right" : ""
              }`}
            >
              {typeof h === "string" ? h : h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line bg-surface">{children}</tbody>
    </table>
  </div>
)

export const Td = ({ children, align, className = "", ...rest }) => (
  <td
    className={`px-4 py-3 align-middle t-small text-ink ${align === "right" ? "text-right" : ""} ${className}`}
    {...rest}
  >
    {children}
  </td>
)

export const TableSkeleton = ({ columns, rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} aria-hidden>
        {Array.from({ length: columns }).map((__, c) => (
          <td key={c} className="px-4 py-3.5">
            <span className="block h-3.5 animate-pulse rounded bg-gray-100" />
          </td>
        ))}
      </tr>
    ))}
  </>
)

/* ------------------------------------------------------------------ *
 * States
 * ------------------------------------------------------------------ */

export const AdminEmpty = ({ title, body, action, onAction }) => (
  <div className="mt-6 rounded-lg border border-line bg-surface px-6 py-16 text-center">
    <h2 className="t-heading">{title}</h2>
    <p className="mx-auto mt-2 max-w-[46ch] t-small leading-relaxed text-ink-soft">{body}</p>
    {action && (
      <button onClick={onAction} className="btn btn-ghost mt-6">
        {action}
      </button>
    )}
  </div>
)

/** Errors say what failed and offer the retry, in the tool's own voice. */
export const AdminError = ({ message, onRetry }) => (
  <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={1.75} />
    <p className="flex-1 t-small text-red-700">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-ghost border-red-200 bg-surface">
        Try again
      </button>
    )}
  </div>
)

export const AdminLoading = ({ label = "Loading…" }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex items-center gap-3 text-ink-mute">
      <span className="loader" />
      <span className="t-small">{label}</span>
    </div>
  </div>
)

/* ------------------------------------------------------------------ *
 * Dialogs
 * ------------------------------------------------------------------ */

export const Modal = ({ open, onClose, title, description, children, width = "max-w-lg" }) => {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-crimson-deep/50 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`card max-h-[90vh] w-full overflow-y-auto rounded-b-none sm:rounded-b-xl ${width}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="t-heading">{title}</h2>
            {description && <p className="mt-1 t-small text-ink-soft">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-mute hover:bg-gray-100 hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/**
 * Destructive actions name the thing being destroyed and say what cannot be
 * undone, rather than asking "Are you sure?".
 */
export const ConfirmDialog = ({ open, onCancel, onConfirm, title, body, confirmLabel, busy }) => (
  <Modal open={open} onClose={busy ? () => {} : onCancel} title={title} width="max-w-md">
    <p className="t-body leading-relaxed text-ink-soft">{body}</p>
    <div className="mt-7 flex justify-end gap-2">
      <button onClick={onCancel} disabled={busy} className="btn btn-ghost">
        Keep it
      </button>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="btn border-red-600 bg-red-600 text-white hover:bg-red-700"
      >
        {busy ? (
          <>
            <span className="loader h-4 w-4 border-white/40 border-t-white" />
            Deleting…
          </>
        ) : (
          confirmLabel
        )}
      </button>
    </div>
  </Modal>
)

/* ------------------------------------------------------------------ *
 * Detail layout
 * ------------------------------------------------------------------ */

export const DetailCard = ({ title, action, children }) => (
  <section className="card overflow-hidden">
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <h2 className="font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
)

export const DetailRows = ({ rows }) => (
  <dl className="divide-y divide-line">
    {rows
      .filter(Boolean)
      .map(([label, value, mono]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-3">
          <dt className="shrink-0 t-small text-ink-soft">{label}</dt>
          <dd className={`min-w-0 truncate text-right t-small text-ink ${mono ? "amount" : ""}`}>
            {value ?? "—"}
          </dd>
        </div>
      ))}
  </dl>
)
