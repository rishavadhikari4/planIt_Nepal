import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "react-toastify"
import { AdminPage, AdminHeading, AdminLoading, AdminError } from "../../components/ui/Admin"
import { getAvailabilityCalendar } from "../../services/availability"
import { toBS, BS_MONTHS } from "../../utils/nepaliDate"

/*
 * One month, everything held, across the whole catalogue.
 *
 * "What's free that Saturday?" used to mean opening venue records one at a
 * time, because availability only existed inside a listing. The data was
 * always there — no page ever read across it.
 *
 * The grid is Gregorian because that is what the bookings are stored in, with
 * the Bikram Sambat date under each number: staff answer the phone in BS and
 * type in AD, so both have to be on the same cell.
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const TYPE_TONE = {
  venue: "bg-crimson text-white",
  studio: "bg-brass-deep text-white",
}

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

const AvailabilityCalendar = () => {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => new Date())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState(null)

  const month = monthKey(cursor)

  useEffect(() => {
    let live = true
    setLoading(true)
    setError("")
    getAvailabilityCalendar(month)
      .then((result) => live && setData(result))
      .catch((err) => {
        if (!live) return
        setError(err.response?.data?.message || "The calendar didn't load.")
        toast.error("The calendar didn't load.")
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [month])

  /* The cells, including the blanks that pad the first week. */
  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const m = cursor.getMonth()
    const firstWeekday = new Date(year, m, 1).getDay()
    const daysInMonth = new Date(year, m + 1, 0).getDate()

    const out = Array.from({ length: firstWeekday }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, m, day)
      const key = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      out.push({ day, date, key, bookings: data?.days?.[key] || [] })
    }
    return out
  }, [cursor, data])

  const step = (by) => {
    setSelected(null)
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + by, 1))
  }

  const today = new Date()
  const isToday = (date) => date && date.toDateString() === today.toDateString()

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  const bsStart = toBS(new Date(cursor.getFullYear(), cursor.getMonth(), 1))
  const bsEnd = toBS(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))
  /* A Gregorian month straddles two BS months, so both are named. */
  const bsLabel =
    bsStart && bsEnd
      ? bsStart.month === bsEnd.month
        ? `${BS_MONTHS[bsStart.month - 1]} ${bsStart.year}`
        : `${BS_MONTHS[bsStart.month - 1]}–${BS_MONTHS[bsEnd.month - 1]} ${bsEnd.year}`
      : null

  return (
    <AdminPage>
      <AdminHeading
        title="Availability"
        description="Everything held this month, across venues and studios. Empty days are free."
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-soft transition-colors hover:border-ink-mute hover:text-ink active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="min-w-[190px] text-center">
            <p className="t-heading">{monthLabel}</p>
            {bsLabel && <p className="t-caption text-ink-mute">{bsLabel}</p>}
          </div>
          <button
            onClick={() => step(1)}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-soft transition-colors hover:border-ink-mute hover:text-ink active:scale-95"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button onClick={() => setCursor(new Date())} className="btn btn-quiet ml-1">
            Today
          </button>
        </div>

        <div className="flex items-center gap-4 t-caption text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-crimson" /> Venue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brass-deep" /> Studio
          </span>
          <span className="amount">{data?.total ?? 0} held</span>
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Reading the calendar…" />
      ) : error ? (
        <AdminError message={error} />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 gap-px rounded-t-lg border border-line bg-line">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="bg-gray-50 py-2.5 text-center font-mono t-caption font-semibold uppercase tracking-[0.12em] text-ink-mute"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px rounded-b-lg border border-t-0 border-line bg-line">
                {cells.map((cell, i) => {
                  if (!cell) return <div key={`pad-${i}`} className="min-h-[104px] bg-gray-50/60" />

                  const bs = toBS(cell.date)
                  const isSelected = selected?.key === cell.key
                  return (
                    <button
                      key={cell.key}
                      onClick={() => setSelected(cell.bookings.length ? cell : null)}
                      className={`min-h-[104px] p-2 text-left align-top transition-colors ${
                        isSelected ? "bg-crimson-50" : "bg-surface hover:bg-gray-50"
                      } ${cell.bookings.length ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span className="flex items-baseline justify-between">
                        <span
                          className={`amount t-small font-semibold ${
                            isToday(cell.date)
                              ? "flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                              : "text-ink"
                          }`}
                        >
                          {cell.day}
                        </span>
                        {bs && <span className="amount t-caption text-ink-mute">{bs.day}</span>}
                      </span>

                      <span className="mt-1.5 block space-y-1">
                        {cell.bookings.slice(0, 3).map((booking, n) => (
                          <motion.span
                            key={`${booking.orderId}-${n}`}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(n, 3) * 0.04 }}
                            className={`block truncate rounded px-1.5 py-0.5 t-caption ${
                              TYPE_TONE[booking.itemType] || "bg-gray-100 text-ink"
                            } ${booking.bookingStatus === "pending" ? "opacity-70" : ""}`}
                            title={booking.name}
                          >
                            {booking.name}
                          </motion.span>
                        ))}
                        {cell.bookings.length > 3 && (
                          <span className="block t-caption text-ink-mute">
                            +{cell.bookings.length - 3} more
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* The day's full list, since a cell only has room for three. */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="card mt-6 overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
                <CalendarIcon className="h-4 w-4 text-ink-mute" strokeWidth={1.75} />
                <h2 className="t-body font-semibold text-ink">
                  {selected.date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <span className="amount ml-auto t-caption text-ink-mute">
                  {selected.bookings.length} held
                </span>
              </div>
              <ul className="divide-y divide-line">
                {selected.bookings.map((booking, n) => (
                  <li key={`${booking.orderId}-${n}`}>
                    <button
                      onClick={() => navigate(`/admin/orders/${booking.orderId}`)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-sm ${
                          booking.itemType === "venue" ? "bg-crimson" : "bg-brass-deep"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate t-small font-semibold text-ink">
                          {booking.name}
                        </span>
                        <span className="block t-caption capitalize text-ink-mute">
                          {booking.itemType} · {booking.bookingStatus} · order{" "}
                          <span className="amount">
                            #{String(booking.orderId).slice(-8).toUpperCase()}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </>
      )}
    </AdminPage>
  )
}

export default AvailabilityCalendar
