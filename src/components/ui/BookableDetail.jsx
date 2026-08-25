import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Heart, MapPin, Star, Users, X } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../context/CartContext"
import DateRangePicker from "./DateRangePicker"
import { EASE, Reveal, Stagger, Item, Magnetic } from "./Motion"

/*
 * Venues and studios are the same booking page with different nouns.
 *
 * The photograph leads at full width — most listings carry a single image, and
 * a five-cell gallery grid holding one picture looked broken. Everything below
 * it is a two-column read: the description and the dates on the left, the
 * price and the one action pinned on the right.
 */

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

const days = (from, till) => Math.max(1, Math.round((new Date(till) - new Date(from)) / 86400000))

const BookableDetail = ({
  id,
  noun,
  backPath,
  backLabel,
  imageKey,
  fetchOne,
  unwrap,
  facts,
}) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const reduced = useReducedMotion()

  const [item, setItem] = useState(null)
  const [bookedDates, setBookedDates] = useState([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dates, setDates] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 110])
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.12])

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
    ? [item[imageKey], ...(Array.isArray(item.photos) ? item.photos.map((p) => p.image) : [])].filter(Boolean)
    : []
  const extras = images.slice(1)

  const addToPlan = () => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Log in to add this to your cart.")
      return navigate("/login")
    }
    if (!dates) return setPickerOpen(true)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="h-[58vh] w-full animate-pulse bg-gray-100" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="h-10 w-1/2 animate-pulse rounded bg-gray-100" aria-hidden />
          <div className="mt-5 h-4 w-1/3 animate-pulse rounded bg-gray-100" aria-hidden />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5">
        <div className="card max-w-md p-9 text-center">
          <span className="ornament mx-auto mb-7 max-w-[100px]" aria-hidden>
            <span />
          </span>
          <h1 className="t-title">We couldn&rsquo;t find that {noun}</h1>
          <p className="mt-4 t-body text-ink-soft">
            It may have been taken down. Browse what&rsquo;s available instead.
          </p>
          <button onClick={() => navigate(backPath)} className="btn btn-accent mt-8 w-full">
            {backLabel}
          </button>
        </div>
      </div>
    )
  }

  const rows = facts(item).filter(([, v]) => v !== undefined && v !== null && v !== "")

  return (
    <div className="min-h-screen bg-paper">
      {/* ================= Hero ================= */}
      <section className="relative isolate h-[58vh] min-h-[420px] w-full overflow-hidden bg-crimson-deep sm:h-[66vh]">
        <motion.div
          className="absolute inset-0"
          style={reduced ? undefined : { y: heroY, scale: heroScale }}
        >
          <motion.img
            src={images[0] || "/placeholder.svg"}
            alt=""
            initial={reduced ? false : { scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* Weighted to the lower left, so the top of the photograph breathes. */}
        <div className="absolute inset-0 bg-gradient-to-t from-crimson-deep via-crimson-deep/45 to-crimson-deep/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-crimson-deep/70 to-transparent" />

        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 t-small font-medium text-white/75 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {backLabel}
          </button>

          <Stagger className="max-w-3xl pb-2" amount={0.1}>
            <Item as="p" className="t-overline text-brass-lift">
              {noun === "venue" ? "Venue" : "Studio"}
              {item.location ? ` · ${item.location}` : ""}
            </Item>
            <Item as="h1" className="mt-4 font-display t-hero text-white">
              {item.name}
            </Item>
            <Item className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 t-small text-white/70">
              {item.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                  {item.location}
                </span>
              )}
              {item.capacity && (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" strokeWidth={1.75} />
                  Holds <span className="amount">{item.capacity}</span>
                </span>
              )}
              {item.rating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 fill-brass-lift text-brass-lift" strokeWidth={1.5} />
                  <span className="amount">{item.rating}</span>
                </span>
              )}
              <span className="amount">{rs(item.price)} per event</span>
            </Item>
          </Stagger>
        </div>

        <button
          onClick={() => setFavorite((v) => !v)}
          aria-pressed={favorite}
          aria-label={favorite ? "Remove from shortlist" : "Add to shortlist"}
          className="absolute right-5 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/80 backdrop-blur-sm transition-colors duration-300 hover:border-white/50 hover:text-white sm:right-6 sm:top-8 lg:right-8"
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-white text-white" : ""}`} strokeWidth={1.75} />
        </button>
      </section>

      {/* ================= Body ================= */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div>
            {item.description && (
              <Reveal>
                <p className="eyebrow">About this {noun}</p>
                <p className="mt-6 max-w-[58ch] whitespace-pre-wrap t-lead text-ink-soft">
                  {item.description}
                </p>
              </Reveal>
            )}

            {rows.length > 0 && (
              <Reveal className="mt-14">
                <p className="eyebrow">At a glance</p>
                <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
                  {rows.map(([label, value]) => (
                    <div key={label} className="bg-surface px-5 py-4">
                      <dt className="t-caption text-ink-mute">{label}</dt>
                      <dd className="amount mt-1.5 t-body text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            {/* The gallery only appears when there is actually a gallery. */}
            {extras.length > 0 && (
              <Reveal className="mt-14">
                <p className="eyebrow">More photographs</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {extras.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setLightbox(i + 1)}
                      aria-label={`Open photo ${i + 2}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-gray-100"
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
                      />
                      <span className="absolute inset-0 bg-crimson-deep/0 transition-colors duration-500 group-hover:bg-crimson-deep/20" />
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal className="mt-14">
              <p className="eyebrow">Availability</p>
              <p className="mt-6 max-w-[52ch] t-body text-ink-soft">
                {bookedDates.length === 0
                  ? "Every date is open. Pick the days you want and we'll hold them once the order is paid."
                  : `${totalBookings || bookedDates.length} ${(totalBookings || bookedDates.length) === 1 ? "booking is" : "bookings are"} already held here — crossed-out days are taken.`}
              </p>
              <div className="mt-7 max-w-sm">
                <DateRangePicker readOnly bookedDates={bookedDates} title="This month" showLegend={false} />
              </div>
            </Reveal>
          </div>

          {/* ---------- Booking panel ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="card overflow-hidden"
            >
              <div className="border-b border-line px-6 py-5">
                <p className="amount t-title text-ink">{item.price ? rs(item.price) : "On request"}</p>
                {item.price && <p className="mt-1 t-caption text-ink-mute">per event</p>}
              </div>

              <div className="px-6 py-6">
                <button
                  onClick={() => setPickerOpen(true)}
                  className={`flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-300 ${
                    dates ? "border-crimson bg-crimson-50" : "border-line-strong hover:border-ink-mute"
                  }`}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1">
                    <span className="block t-caption text-ink-mute">Your dates</span>
                    <span className="amount block truncate t-small text-ink">
                      {dates ? `${fmt(dates.from)} — ${fmt(dates.till)}` : "Not chosen yet"}
                    </span>
                  </span>
                  {dates && <Check className="h-4 w-4 shrink-0 text-crimson" strokeWidth={2.5} />}
                </button>

                {dates && (
                  <p className="amount mt-3 t-caption text-ink-mute">
                    {days(dates.from, dates.till)} {days(dates.from, dates.till) === 1 ? "day" : "days"} held
                  </p>
                )}

                <Magnetic strength={0.12} className="mt-5 w-full">
                  <button onClick={addToPlan} className="btn btn-accent w-full">
                    {dates ? "Add to my plan" : "Choose dates"}
                  </button>
                </Magnetic>

                <p className="mt-4 text-center t-caption leading-relaxed text-ink-mute">
                  Adding this holds nothing yet — you confirm at checkout.
                </p>
              </div>

              <div className="border-t border-line bg-gray-50 px-6 py-4">
                <p className="t-caption leading-relaxed text-ink-mute">
                  Pay a quarter down to hold the date, or settle in full. Cash after the event is
                  also fine.
                </p>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

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

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-crimson-deep/96 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close gallery"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
                  className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:left-8"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox((i) => (i + 1) % images.length)
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-8"
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={2} />
                </button>
              </>
            )}

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              src={images[lightbox]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-full rounded-lg object-contain"
            />

            <p className="amount absolute bottom-6 t-small text-white/55">
              {lightbox + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookableDetail
