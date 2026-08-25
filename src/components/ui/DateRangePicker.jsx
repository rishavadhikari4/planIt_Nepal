import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"]

const startOfDay = (d) => {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const fmt = (d) =>
  d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null

const nights = (from, till) =>
  Math.max(1, Math.round((startOfDay(till) - startOfDay(from)) / 86400000))

/**
 * Two-tap date range picker. Taken dates are disabled and labelled, so the
 * reason a day cannot be picked is visible rather than guessed at.
 * Also renders read-only, for showing a booking calendar.
 */
const DateRangePicker = ({
  onDateSelect,
  onClose,
  bookedDates = [],
  minDate = new Date(),
  readOnly = false,
  title = "Choose your dates",
  className = "",
  showLegend = true,
}) => {
  const [month, setMonth] = useState(() => startOfDay(new Date()))
  const [from, setFrom] = useState(null)
  const [till, setTill] = useState(null)
  const [hovered, setHovered] = useState(null)

  const bookingOn = (date) => {
    const d = startOfDay(date).getTime()
    return (
      bookedDates.find((b) => {
        const s = startOfDay(b.bookedFrom).getTime()
        const e = startOfDay(b.bookedTill).getTime()
        return d >= s && d <= e
      }) || null
    )
  }

  const beforeMin = (date) => startOfDay(date) < startOfDay(minDate)
  const disabled = (date) => !readOnly && (Boolean(bookingOn(date)) || beforeMin(date))

  const pick = (date) => {
    if (readOnly || disabled(date)) return
    if (!from || (from && till)) {
      setFrom(date)
      setTill(null)
    } else if (date >= from) {
      setTill(date)
    } else {
      setFrom(date)
      setTill(null)
    }
  }

  const confirm = () => {
    if (!from || !till) return
    onDateSelect({ from: from.toISOString(), till: till.toISOString() })
    onClose?.()
  }

  const shiftMonth = (by) => {
    const next = new Date(month)
    next.setMonth(next.getMonth() + by)
    setMonth(next)
  }

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingBlanks = new Date(year, monthIndex, 1).getDay()

  // A hovered day previews the range before it is committed.
  const rangeEnd = till || (from && hovered && hovered > from ? hovered : null)

  const grid = (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <p className="text-[15px] font-semibold text-ink">
          {MONTHS[monthIndex]} <span className="amount font-normal text-ink-mute">{year}</span>
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1">
        {DAY_INITIALS.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="pb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-mute"
          >
            {d}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = startOfDay(new Date(year, monthIndex, i + 1))
          const booking = bookingOn(date)
          const isPast = beforeMin(date)
          const isDisabled = !readOnly && (Boolean(booking) || isPast)

          const isFrom = from && date.getTime() === from.getTime()
          const isTill = till && date.getTime() === till.getTime()
          const inRange = from && rangeEnd && date > from && date < rangeEnd

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => pick(date)}
              onMouseEnter={() => setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              title={
                booking
                  ? `Taken — ${booking.itemName || booking.title || "booked"}`
                  : isPast
                    ? "In the past"
                    : undefined
              }
              aria-label={date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              aria-pressed={Boolean(isFrom || isTill)}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center text-[13.5px] transition-colors
                ${inRange ? "bg-crimson-50" : ""}
                ${isFrom ? "rounded-l-md" : ""}
                ${isTill ? "rounded-r-md" : ""}
                ${
                  isFrom || isTill
                    ? "bg-crimson font-semibold text-white"
                    : isDisabled
                      ? "cursor-not-allowed text-line-strong line-through"
                      : "rounded-md text-ink hover:bg-gray-100"
                }`}
            >
              <span className="amount">{i + 1}</span>
              {booking && readOnly && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>

      {showLegend && (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-[12px] text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-crimson" />
            Your dates
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-crimson-50 ring-1 ring-inset ring-line" />
            In between
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-gray-100 ring-1 ring-inset ring-line" />
            Already taken
          </span>
        </div>
      )}
    </>
  )

  /* Read-only: an inline calendar, no dialog around it. */
  if (readOnly && !onClose) {
    return (
      <div className={`card p-5 ${className}`}>
        <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          {title}
        </h3>
        {grid}
        {bookedDates.length === 0 && (
          <p className="mt-4 text-[13px] text-ink-mute">
            Nothing is booked here yet — every date is free.
          </p>
        )}
      </div>
    )
  }

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
        className={`card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none sm:rounded-b-xl ${className}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-[18px]">{title}</h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              {!from
                ? "Tap the first day."
                : !till
                  ? "Now tap the last day."
                  : `${fmt(from)} — ${fmt(till)} · ${nights(from, till)} ${
                      nights(from, till) === 1 ? "day" : "days"
                    }`}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-mute hover:bg-gray-100 hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="p-5">{grid}</div>

        {!readOnly && (
          <div className="flex gap-2 border-t border-line bg-gray-50 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setFrom(null)
                setTill(null)
              }}
              disabled={!from}
              className="btn btn-ghost flex-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!from || !till}
              className="btn btn-primary flex-1"
            >
              {from && till ? "Use these dates" : "Pick two days"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DateRangePicker
