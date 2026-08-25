import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MapPin, Star, X } from "lucide-react"
import { toast } from "react-toastify"
import { getAllStudios, searchStudios } from "../../services/studios"
import {
  CatalogHeader,
  CatalogToolbar,
  RangeFilter,
  CardSkeleton,
  EmptyState,
  Pagination,
  rs,
} from "../../components/ui/Catalog"
import Sheet, { useLingering } from "../../components/ui/Sheet"

const SORTS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
]

const PER_PAGE = 12

/** Studios list services as an array or a comma string depending on the record. */
const serviceList = (studio) =>
  Array.isArray(studio.services)
    ? studio.services
    : typeof studio.services === "string"
      ? studio.services.split(",").map((s) => s.trim()).filter(Boolean)
      : []

const Studios = () => {
  const navigate = useNavigate()
  const [studios, setStudios] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [preview, setPreview] = useState(null)
  // Keeps the panel populated through its exit animation.
  const shown = useLingering(preview)
  const [favorites, setFavorites] = useState(new Set())

  const [searchTerm, setSearchTerm] = useState("")
  const [price, setPrice] = useState({ min: "", max: "" })
  const [location, setLocation] = useState("")
  const [sort, setSort] = useState("createdAt-desc")

  const [sortField, sortOrder] = sort.split("-")
  const hasFilters = Boolean(searchTerm.trim() || price.min || price.max || location.trim())

  const load = async (nextPage = 1, useFilters = hasFilters) => {
    setLoading(true)
    try {
      const base = { page: nextPage, limit: PER_PAGE, sortField, sortOrder }
      const response = useFilters
        ? await searchStudios({
            ...base,
            ...(searchTerm.trim() && { q: searchTerm.trim() }),
            ...(price.min && { minPrice: price.min }),
            ...(price.max && { maxPrice: price.max }),
            ...(location.trim() && { location: location.trim() }),
          })
        : await getAllStudios(base)

      setStudios(response.studios || [])
      setPagination(response.pagination || {})
      setPage(nextPage)
      setSearching(useFilters)
    } catch {
      toast.error("We couldn't load the studios. Please try again.")
      setStudios([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const clear = () => {
    setSearchTerm("")
    setPrice({ min: "", max: "" })
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
          step="03"
          title="Studios"
          blurb="Photo and video teams with published rates and the work they actually shoot. Book them for the same dates as your venue."
          count={pagination?.totalStudios}
          countLabel="studios"
          searching={searching}
        />

        <CatalogToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={() => load(1)}
          placeholder="Search studios"
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
        </CatalogToolbar>

        <div className="mt-10">
          {loading ? (
            <CardSkeleton />
          ) : studios.length === 0 ? (
            <EmptyState
              title="No studios match that"
              body={
                searching
                  ? "Try a wider price range or a different area."
                  : "There are no studios listed right now. Check back shortly."
              }
              action={searching ? "Clear the filters" : undefined}
              onAction={clear}
            />
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {studios.map((studio, i) => {
                  const services = serviceList(studio)
                  return (
                    <motion.article
                      key={studio._id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 7) * 0.05 }}
                      className="card card-hover group relative flex flex-col overflow-hidden"
                    >
                      <button
                        onClick={() => navigate(`/studios/${studio._id}`)}
                        className="relative block aspect-[4/5] w-full overflow-hidden bg-gray-100 text-left"
                        aria-label={`View ${studio.name}`}
                      >
                        <span className="absolute inset-0 z-10 bg-crimson-deep/0 transition-colors duration-500 group-hover:bg-crimson-deep/15" />
                        <img
                          src={studio.studioImage || "/placeholder.svg"}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                        />
                        {studio.rating && (
                          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-crimson-deep/85 px-1.5 py-0.5 t-caption font-semibold text-white">
                            <Star className="h-3 w-3 fill-brass text-brass" />
                            <span className="amount">{studio.rating}</span>
                          </span>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(studio._id)
                        }}
                        aria-pressed={favorites.has(studio._id)}
                        aria-label={
                          favorites.has(studio._id)
                            ? `Remove ${studio.name} from your shortlist`
                            : `Add ${studio.name} to your shortlist`
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink-soft transition-colors hover:text-red-600"
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.has(studio._id) ? "fill-red-600 text-red-600" : ""}`}
                          strokeWidth={1.75}
                        />
                      </button>

                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 t-body font-semibold leading-snug text-ink">
                          {studio.name}
                        </h3>

                        {studio.location && (
                          <p className="mt-2 inline-flex min-w-0 items-center gap-1 t-caption text-ink-mute">
                            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{studio.location}</span>
                          </p>
                        )}

                        {services.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {services.slice(0, 2).map((s) => (
                              <li key={s} className="chip">
                                {s}
                              </li>
                            ))}
                            {services.length > 2 && (
                              <li className="chip">+{services.length - 2}</li>
                            )}
                          </ul>
                        )}

                        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                          <p>
                            <span className="amount block t-lead font-semibold text-ink">
                              {studio.price ? rs(studio.price) : "On request"}
                            </span>
                            {studio.price && <span className="t-caption text-ink-mute">per event</span>}
                          </p>
                          <button
                            onClick={() => setPreview(studio)}
                            className="t-small font-medium text-crimson hover:underline"
                          >
                            Quick look
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={pagination?.totalPages} onChange={changePage} />
      </div>

      {/* ---------------- Quick look ---------------- */}
      <Sheet
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={shown?.name}
        width="max-w-xl"
      >
        {shown && (
          <>
            <div className="relative">
              <img
                src={shown.studioImage || "/placeholder.svg"}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
              <button
                onClick={() => setPreview(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-soft transition-colors hover:text-ink active:scale-95"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6">
              <h2 className="t-title">{shown.name}</h2>

              {shown.location && (
                <p className="mt-3 inline-flex items-center gap-1.5 t-small text-ink-mute">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                  {shown.location}
                </p>
              )}

              {serviceList(shown).length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {serviceList(shown).map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-5 t-body leading-relaxed text-ink-soft">
                {shown.description || "No description has been added for this studio yet."}
              </p>

              <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
                <p>
                  <span className="amount block t-title font-semibold text-ink">
                    {shown.price ? rs(shown.price) : "On request"}
                  </span>
                  {shown.price && <span className="t-caption text-ink-mute">per event</span>}
                </p>
                <button onClick={() => navigate(`/studios/${shown._id}`)} className="btn btn-accent">
                  See dates and book
                </button>
              </div>
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}

export default Studios
