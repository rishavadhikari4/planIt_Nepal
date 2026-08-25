import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MapPin, Star, Users, X } from "lucide-react"
import { toast } from "react-toastify"
import { getAllVenues, searchVenues } from "../../services/venues"
import {
  CatalogHeader,
  CatalogToolbar,
  RangeFilter,
  CardSkeleton,
  EmptyState,
  Pagination,
  rs,
} from "../../components/ui/Catalog"

const SORTS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "capacity-desc", label: "Largest capacity" },
  { value: "capacity-asc", label: "Smallest capacity" },
  { value: "name-asc", label: "Name: A to Z" },
]

const PER_PAGE = 12

const Venues = () => {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [preview, setPreview] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  const [searchTerm, setSearchTerm] = useState("")
  const [price, setPrice] = useState({ min: "", max: "" })
  const [capacity, setCapacity] = useState({ min: "", max: "" })
  const [location, setLocation] = useState("")
  const [sort, setSort] = useState("createdAt-desc")

  const [sortField, sortOrder] = sort.split("-")
  const hasFilters = Boolean(
    searchTerm.trim() || price.min || price.max || capacity.min || capacity.max || location.trim(),
  )

  const load = async (nextPage = 1, useFilters = hasFilters) => {
    setLoading(true)
    try {
      const base = { page: nextPage, limit: PER_PAGE, sortField, sortOrder }
      let response

      if (useFilters) {
        response = await searchVenues({
          ...base,
          ...(searchTerm.trim() && { q: searchTerm.trim() }),
          ...(price.min && { minPrice: price.min }),
          ...(price.max && { maxPrice: price.max }),
          ...(capacity.min && { minCapacity: capacity.min }),
          ...(capacity.max && { maxCapacity: capacity.max }),
          ...(location.trim() && { location: location.trim() }),
        })
      } else {
        response = await getAllVenues(base)
      }

      setVenues(response.venues || [])
      setPagination(response.pagination || {})
      setPage(nextPage)
      setSearching(useFilters)
    } catch {
      toast.error("We couldn't load the venues. Please try again.")
      setVenues([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  // Sorting re-runs the current query rather than dropping you back to page one
  // of an unfiltered list.
  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const clear = () => {
    setSearchTerm("")
    setPrice({ min: "", max: "" })
    setCapacity({ min: "", max: "" })
    setLocation("")
    load(1, false)
  }

  const toggleFavorite = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const changePage = (n) => {
    load(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <CatalogHeader
          step="01"
          title="Venues"
          blurb="The venue fixes your date, so it's the first thing to lock in. Halls, lawns and conference floors across Nepal, with what each one holds and what it costs."
          count={pagination?.totalVenues}
          countLabel="venues"
          searching={searching}
        />

        <CatalogToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={() => load(1)}
          placeholder="Search venues by name or area"
          sortValue={sort}
          onSortChange={setSort}
          sortOptions={SORTS}
          onClear={clear}
          hasFilters={hasFilters}
        >
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={location}
              placeholder="Area"
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(1)}
              aria-label="Area"
              className="field w-[9rem] pl-9"
            />
          </div>
          <RangeFilter label="Price" value={price} onChange={setPrice} />
          <RangeFilter label="Guests" value={capacity} onChange={setCapacity} />
        </CatalogToolbar>

        <div className="mt-10">
          {loading ? (
            <CardSkeleton />
          ) : venues.length === 0 ? (
            <EmptyState
              title="No venues match that"
              body={
                searching
                  ? "Try a wider price range, a different area, or fewer guests."
                  : "There are no venues listed right now. Check back shortly."
              }
              action={searching ? "Clear the filters" : undefined}
              onAction={clear}
            />
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {venues.map((venue, i) => (
                  <motion.article
                    key={venue._id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 7) * 0.05 }}
                    className="card card-hover group relative flex flex-col overflow-hidden"
                  >
                    {/* The whole card is the target, not just a button at the bottom. */}
                    <button
                      onClick={() => navigate(`/venues/${venue._id}`)}
                      className="relative block aspect-[4/5] w-full overflow-hidden bg-gray-100 text-left"
                      aria-label={`View ${venue.name}`}
                    >
                      <img
                        src={venue.venueImage || "/placeholder.svg"}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                      />
                      {venue.rating && (
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-crimson-deep/85 px-1.5 py-0.5 t-caption font-semibold text-white">
                          <Star className="h-3 w-3 fill-brass text-brass" />
                          <span className="amount">{venue.rating}</span>
                        </span>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(venue._id)
                      }}
                      aria-pressed={favorites.has(venue._id)}
                      aria-label={
                        favorites.has(venue._id)
                          ? `Remove ${venue.name} from your shortlist`
                          : `Add ${venue.name} to your shortlist`
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink-soft transition-colors hover:text-red-600"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.has(venue._id) ? "fill-red-600 text-red-600" : ""}`}
                        strokeWidth={1.75}
                      />
                    </button>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 t-body font-semibold leading-snug text-ink">
                        {venue.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 t-caption text-ink-mute">
                        {venue.location && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{venue.location}</span>
                          </span>
                        )}
                        {venue.capacity && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                            <span className="amount">{venue.capacity}</span> guests
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                        <p>
                          <span className="amount block t-lead font-semibold text-ink">
                            {venue.price ? rs(venue.price) : "On request"}
                          </span>
                          {venue.price && (
                            <span className="t-caption text-ink-mute">per event</span>
                          )}
                        </p>
                        <button
                          onClick={() => setPreview(venue)}
                          className="t-small font-medium text-crimson hover:underline"
                        >
                          Quick look
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={pagination?.totalPages} onChange={changePage} />
      </div>

      {/* ---------------- Quick look ---------------- */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-crimson-deep/50 p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={preview.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-b-none sm:rounded-b-xl"
            >
              <div className="relative">
                <img
                  src={preview.venueImage || "/placeholder.svg"}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
                <button
                  onClick={() => setPreview(null)}
                  aria-label="Close"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-soft hover:text-ink"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="p-6">
                <h2 className="t-title">{preview.name}</h2>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 t-small text-ink-mute">
                  {preview.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" strokeWidth={1.75} />
                      {preview.location}
                    </span>
                  )}
                  {preview.capacity && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" strokeWidth={1.75} />
                      Holds <span className="amount">{preview.capacity}</span>
                    </span>
                  )}
                </div>

                <p className="mt-5 t-body leading-relaxed text-ink-soft">
                  {preview.description || "No description has been added for this venue yet."}
                </p>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
                  <p>
                    <span className="amount block t-title font-semibold text-ink">
                      {preview.price ? rs(preview.price) : "On request"}
                    </span>
                    {preview.price && <span className="t-caption text-ink-mute">per event</span>}
                  </p>
                  <button
                    onClick={() => navigate(`/venues/${preview._id}`)}
                    className="btn btn-accent"
                  >
                    See dates and book
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Venues
