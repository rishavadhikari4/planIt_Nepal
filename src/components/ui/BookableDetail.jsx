import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Heart, MapPin, Star, Users, X } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../context/CartContext"
import DateRangePicker from "./DateRangePicker"

/*
 * Venues and studios are the same booking page with different nouns: a gallery,
 * some facts, a date range, and one button that puts it in the cart. This holds
 * that page once; each route supplies its vocabulary and its fetcher.
 */

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

const days = (from, till) =>
  Math.max(1, Math.round((new Date(till) - new Date(from)) / 86400000))

const BookableDetail = ({
  id,
  noun, // "venue" | "studio"
  backPath,
  backLabel,
  imageKey, // "venueImage"
  fetchOne,
  unwrap, // (response) => { item, bookedDates, totalBookings }
  facts, // (item) => [[label, value], ...]
}) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [item, setItem] = useState(null)
  const [bookedDates, setBookedDates] = useState([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dates, setDates] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [lightbox, setLightbox] = useState(null) // index

  useEffect(() => {
    let live = true
    setLoading(true)
    fetchOne(id)
      .then((response) => {
        if (!live) return
        const { item: found, bookedDates: booked, totalBookings: count } = unwrap(response)
        if (!found) throw new Error("not found")
        setItem(found)
        setBookedDates(booked || [])
        setTotalBookings(count || 0)
      })
      .catch(() => live && setError(`This ${noun} couldn't be loaded.`))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const images = item
    ? [item[imageKey], ...(Array.isArray(item.photos) ? item.photos.map((p) => p.image) : [])].filter(
        Boolean,
      )
    : []

  const addToPlan = () => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Log in to add this to your cart.")
      return navigate("/login")
    }
    if (!dates) {
      setPickerOpen(true)
      return
    }
    addToCart(
      {
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item[imageKey],
        type: noun,
        description: item.description,
        location: item.location,
        capacity: item.capacity,
        quantity: 1,
      },
      dates,
    )
  }

  /* ---------- states ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="aspect-[16/9] animate-pulse rounded-xl bg-gray-100" aria-hidden />
          <div className="mt-8 h-9 w-1/2 animate-pulse rounded bg-gray-100" aria-hidden />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-gray-100" aria-hidden />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-[22px]">We couldn&rsquo;t find that {noun}</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
            It may have been removed. Browse what&rsquo;s available instead.
          </p>
          <button onClick={() => navigate(backPath)} className="btn btn-primary mt-7 w-full">
            {backLabel}
          </button>
        </div>
      </div>
    )
  }

  const rows = facts(item).filter(([, value]) => value !== undefined && value !== null && value !== "")

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <button onClick={() => navigate(backPath)} className="btn btn-quiet -ml-2.5 mb-6">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {backLabel}
        </button>

        {/* ---------- Gallery ---------- */}
        <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
          <button
            onClick={() => setLightbox(0)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-gray-100 sm:col-span-2 sm:row-span-2 sm:aspect-auto"
            aria-label="Open gallery"
          >
            <img
              src={images[0] || "/placeholder.svg"}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </button>

          {images.slice(1, 5).map((src, i) => (
            <button
              key={src + i}
              onClick={() => setLightbox(i + 1)}
              className="group relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-line bg-gray-100 sm:block"
              aria-label={`Open photo ${i + 2}`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {i === 3 && images.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-pine-deep/70 text-[15px] font-semibold text-white">
                  +{images.length - 5} more
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          {/* ---------- Details ---------- */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[clamp(28px,4.5vw,40px)]">{item.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-soft">
                  {item.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-ink-mute" strokeWidth={1.75} />
                      {item.location}
                    </span>
                  )}
                  {item.capacity && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-ink-mute" strokeWidth={1.75} />
                      Holds <span className="amount">{item.capacity}</span>
                    </span>
                  )}
                  {item.rating && (
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-marigold text-marigold" strokeWidth={1.5} />
                      <span className="amount">{item.rating}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setFavorite((v) => !v)}
                aria-pressed={favorite}
                aria-label={favorite ? "Remove from shortlist" : "Add to shortlist"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:text-red-600"
              >
                <Heart
                  className={`h-4 w-4 ${favorite ? "fill-red-600 text-red-600" : ""}`}
                  strokeWidth={1.75}
                />
              </button>
            </div>

            {item.description && (
              <p className="mt-7 max-w-[62ch] whitespace-pre-wrap text-[16px] leading-relaxed text-ink-soft">
                {item.description}
              </p>
            )}

            {rows.length > 0 && (
              <section className="mt-10">
                <h2 className="eyebrow">Details</h2>
                <dl className="mt-5 divide-y divide-line border-y border-line">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 py-3.5">
                      <dt className="text-[14px] text-ink-soft">{label}</dt>
                      <dd className="amount text-right text-[14px] text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Availability is the real question on this page, so it gets a
                calendar rather than a sentence. */}
            <section className="mt-12">
              <h2 className="eyebrow">Availability</h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
                {bookedDates.length === 0
                  ? "Nothing is booked yet — every date is free."
                  : `${totalBookings || bookedDates.length} ${
                      (totalBookings || bookedDates.length) === 1 ? "booking" : "bookings"
                    } already held. Crossed-out days are taken.`}
              </p>
              <div className="mt-5 max-w-sm">
                <DateRangePicker
                  readOnly
                  bookedDates={bookedDates}
                  title="Taken dates"
                  showLegend={false}
                />
              </div>
            </section>
          </div>

          {/* ---------- Booking panel ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <p className="amount text-[26px] font-semibold text-ink">
                  {item.price ? rs(item.price) : "On request"}
                </p>
                {item.price && <p className="text-[12.5px] text-ink-mute">per event</p>}
              </div>

              <div className="px-5 py-5">
                <button
                  onClick={() => setPickerOpen(true)}
                  className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                    dates ? "border-pine bg-pine-50" : "border-line-strong hover:border-ink-mute"
                  }`}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-ink-mute">Your dates</span>
                    <span className="amount block truncate text-[13.5px] text-ink">
                      {dates ? `${fmt(dates.from)} — ${fmt(dates.till)}` : "Not chosen yet"}
                    </span>
                  </span>
                  {dates && <Check className="h-4 w-4 shrink-0 text-pine" strokeWidth={2.5} />}
                </button>

                {dates && (
                  <p className="amount mt-2.5 text-[12.5px] text-ink-mute">
                    {days(dates.from, dates.till)} {days(dates.from, dates.till) === 1 ? "day" : "days"}
                  </p>
                )}

                <button onClick={addToPlan} className="btn btn-accent mt-5 w-full py-3">
                  {dates ? "Add to my plan" : "Choose dates"}
                </button>

                <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-mute">
                  Adding this holds nothing yet — you confirm at checkout.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- Date picker ---------- */}
      {pickerOpen && (
        <DateRangePicker
          bookedDates={bookedDates}
          onClose={() => setPickerOpen(false)}
          onDateSelect={(picked) => {
            setDates(picked)
            toast.success("Dates set. Add it to your plan when you're ready.")
          }}
          title={`Choose your ${noun} dates`}
        />
      )}

      {/* ---------- Lightbox ---------- */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/95 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close gallery"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox((i) => (i - 1 + images.length) % images.length)
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox((i) => (i + 1) % images.length)
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={2} />
                </button>
              </>
            )}

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={images[lightbox]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />

            <p className="amount absolute bottom-5 text-[13px] text-white/60">
              {lightbox + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookableDetail
