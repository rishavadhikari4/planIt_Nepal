import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CalendarSearch, MapPin, Users } from "lucide-react"
import { searchAvailability } from "../../services/availability"
import { img, SIZES } from "../../utils/image"
import { formatBS } from "../../utils/nepaliDate"
import { EASE } from "./Motion"

/*
 * "What's free on the twelfth?"
 *
 * The first question anyone asks, and the site could only ever answer it one
 * listing at a time — you had to open a venue to discover it was already
 * taken. This asks it of the whole catalogue at once.
 *
 * The date input is Gregorian because that is what a browser gives us for
 * free and what the server stores; the Bikram Sambat date is echoed under it
 * so the person who was told "12 Mangsir" can see they picked the right day.
 */

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const today = () => new Date().toISOString().slice(0, 10)

const Result = ({ item, type, onOpen }) => (
  <button
    onClick={onOpen}
    className="group flex w-full gap-4 p-4 text-left transition-colors hover:bg-gray-50"
  >
    <img
      src={img(item.venueImage || item.studioImage, { w: SIZES.thumb }) || "/placeholder.svg"}
      alt=""
      loading="lazy"
      className="h-16 w-20 shrink-0 rounded-md border border-line object-cover"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate t-body font-semibold text-ink">{item.name}</span>
      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 t-caption text-ink-mute">
        {item.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {item.location}
          </span>
        )}
        {item.capacity && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" strokeWidth={1.75} />
            Holds <span className="amount">{item.capacity}</span>
          </span>
        )}
        <span className="capitalize">{type}</span>
      </span>
    </span>
    <span className="shrink-0 text-right">
      <span className="amount block t-small font-semibold text-ink">{rs(item.price)}</span>
      <ArrowRight
        className="ml-auto mt-1 h-3.5 w-3.5 text-line-strong transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brass"
        strokeWidth={2}
      />
    </span>
  </button>
)

const DateAvailabilitySearch = ({ className = "" }) => {
  const navigate = useNavigate()
  const [from, setFrom] = useState("")
  const [till, setTill] = useState("")
  const [guests, setGuests] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const search = async (event) => {
    event.preventDefault()
    if (!from) return setError("Pick a date first.")

    setLoading(true)
    setError("")
    try {
      const data = await searchAvailability({
        from,
        till: till || undefined,
        guests: guests || undefined,
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || "That search didn't run. Try again.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const bsFrom = from ? formatBS(new Date(`${from}T00:00:00`)) : null
  const total = (result?.counts.venues || 0) + (result?.counts.studios || 0)
  const taken = (result?.counts.venuesTaken || 0) + (result?.counts.studiosTaken || 0)

  return (
    <div className={`card overflow-hidden ${className}`}>
      <form onSubmit={search} className="p-5 sm:p-6">
        <p className="flex items-center gap-2 t-overline text-ink-mute">
          <CalendarSearch className="h-3.5 w-3.5 text-brass-deep" strokeWidth={2} />
          Check a date
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div>
            <label htmlFor="av-from" className="label">
              From
            </label>
            <input
              id="av-from"
              type="date"
              min={today()}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="av-till" className="label">
              Till <span className="font-normal text-ink-mute">(optional)</span>
            </label>
            <input
              id="av-till"
              type="date"
              min={from || today()}
              value={till}
              onChange={(e) => setTill(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="av-guests" className="label">
              Guests
            </label>
            <input
              id="av-guests"
              type="number"
              min="1"
              inputMode="numeric"
              value={guests}
              onChange={(e) => setGuests(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Any"
              className="field w-full sm:w-24"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-accent w-full sm:w-auto">
            {loading ? <span className="loader h-4 w-4 border-white/40 border-t-white" /> : "Search"}
          </button>
        </div>

        {bsFrom && (
          <p className="mt-2.5 t-caption text-ink-mute">
            That&rsquo;s <span className="font-semibold text-ink-soft">{bsFrom}</span> in Bikram
            Sambat.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2.5 t-caption text-red-700">
            {error}
          </p>
        )}
      </form>

      <AnimatePresence initial={false}>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-line"
          >
            <p className="bg-gray-50 px-5 py-3 t-small text-ink-soft sm:px-6">
              {total === 0 ? (
                <>Nothing is free on those dates.{taken > 0 && ` ${taken} already booked.`}</>
              ) : (
                <>
                  <span className="amount font-semibold text-ink">{total}</span> free
                  {taken > 0 && (
                    <span className="text-ink-mute"> · {taken} already booked</span>
                  )}
                </>
              )}
            </p>

            <div className="max-h-[380px] divide-y divide-line overflow-y-auto">
              {result.venues.map((venue) => (
                <Result
                  key={venue._id}
                  item={venue}
                  type="venue"
                  onOpen={() => navigate(`/venues/${venue._id}`)}
                />
              ))}
              {result.studios.map((studio) => (
                <Result
                  key={studio._id}
                  item={studio}
                  type="studio"
                  onOpen={() => navigate(`/studios/${studio._id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DateAvailabilitySearch
