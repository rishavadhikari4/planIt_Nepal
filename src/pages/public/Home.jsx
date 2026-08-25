import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Sparkles } from "lucide-react"
import Review from "./Review.jsx"
import ContactForm from "../../components/forms/ContactForm"
import RecommendationComponent from "../../components/RecommendationComponent"
import { AuthContext } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { getAllVenues } from "../../services/venues"
import { getAllStudios } from "../../services/studios"

/* A booking is three decisions in a fixed order: the venue fixes the date,
   catering follows the venue, the studio follows both. The numbering across
   this page encodes that order — it is not ornament. */
const STEPS = [
  {
    step: "01",
    label: "Venue",
    path: "/venues",
    headline: "Where it happens",
    body: "Banquet halls, garden lawns, party palaces and conference floors. Availability shows by date, so you book the room and the day in one move.",
    match: (t) => t === "venue",
  },
  {
    step: "02",
    label: "Catering",
    path: "/cuisines",
    headline: "What everyone eats",
    body: "Build the menu dish by dish — Newari khaja sets, veg and non-veg thalis, continental spreads. Priced per plate, counted against your headcount.",
    match: (t) => t === "dish" || t === "cuisine",
  },
  {
    step: "03",
    label: "Studio",
    path: "/studios",
    headline: "Who records it",
    body: "Photo and video teams with published rates and sample work, booked against the same dates as your venue.",
    match: (t) => t === "studio",
  },
]

/* ---------- motion ---------- */

const EASE = [0.16, 1, 0.3, 1]

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, staggerChildren: 0.08 },
  },
}

const childReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/** The headline arrives a line at a time — one orchestrated moment on load. */
const HeroLine = ({ children, delay, reduced }) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span
      className="block"
      initial={reduced ? false : { y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  </span>
)

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const { cartItems } = useCart()
  const reduced = useReducedMotion()
  const [showRecommendations, setShowRecommendations] = useState(false)

  /* The image band and the step rows show real inventory rather than stock
     photography — the landing page is a live shopfront, and it stays current
     without anyone maintaining it. */
  const [venues, setVenues] = useState([])
  const [studios, setStudios] = useState([])

  useEffect(() => {
    let live = true
    getAllVenues({ limit: 10, sortField: "createdAt", sortOrder: "desc" })
      .then((r) => live && setVenues(r.venues || []))
      .catch(() => {})
    getAllStudios({ limit: 6, sortField: "createdAt", sortOrder: "desc" })
      .then((r) => live && setStudios(r.studios || []))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const filled = STEPS.filter((s) => cartItems.some((i) => s.match(i.type))).length

  const slotFor = (step) => {
    const items = cartItems.filter((i) => step.match(i.type))
    if (items.length === 0) return null
    if (items.length === 1) return items[0].name
    return `${items.length} selected`
  }

  const bandImages = [
    ...venues.map((v) => ({ src: v.venueImage, label: v.name, sub: v.location, to: `/venues/${v._id}` })),
    ...studios.map((s) => ({ src: s.studioImage, label: s.name, sub: s.location, to: `/studios/${s._id}` })),
  ].filter((i) => i.src)

  const hero = bandImages[0]
  const payingImage = bandImages[2]?.src || bandImages[1]?.src || hero?.src

  const stepImage = (i) =>
    i === 0 ? venues[0]?.venueImage : i === 2 ? studios[0]?.studioImage : venues[1]?.venueImage

  return (
    <div className="bg-paper">
      {/* ======================= Hero =======================
          Type first, at full width, then the plate and the plan card beneath
          it. The old two-column split cramped both halves; this lets the
          headline be the size it wants to be and gives the photograph room. */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <motion.p
            className="eyebrow"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Event planning · Nepal
          </motion.p>

          <h1 className="mt-8 max-w-[15ch] text-[clamp(44px,8.5vw,92px)] font-semibold leading-[0.92] tracking-[-0.035em]">
            <HeroLine delay={0.18} reduced={reduced}>Book the venue,</HeroLine>
            <HeroLine delay={0.28} reduced={reduced}>the food, and</HeroLine>
            <HeroLine delay={0.38} reduced={reduced}>
              <span className="font-normal italic">the camera.</span>
            </HeroLine>
          </h1>

          {/* The brass thread draws itself under the headline. */}
          <span className="thread-draw mt-9 block h-px w-28 bg-brass" />

          <div className="mt-9 grid gap-8 sm:grid-cols-[minmax(0,46ch)_auto] sm:items-end sm:justify-between sm:gap-12">
            <motion.p
              className="text-[17px] leading-relaxed text-ink-soft"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            >
              One date, one order, one checkout. Compare real prices across Nepal, hold your dates
              with a quarter down, and settle with Khalti, Fonepay, or cash after the event.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.72 }}
            >
              {isAuthenticated && isCustomer ? (
                <button
                  onClick={() => setShowRecommendations(true)}
                  className="btn btn-accent h-12 px-6"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Build my package
                </button>
              ) : (
                <button onClick={() => navigate("/venues")} className="btn btn-accent group h-12 px-6">
                  Start with a venue
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
              )}
              <button onClick={() => navigate("/cuisines")} className="btn btn-ghost h-12 px-6">
                Browse catering
              </button>
            </motion.div>
          </div>
        </div>

        {/* ---------- The plate, and the plan card beside it ---------- */}
        <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-start lg:gap-8">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            >
              {hero ? (
                <button
                  onClick={() => navigate(hero.to)}
                  className="plate group block aspect-[4/3] w-full sm:aspect-[16/10]"
                  aria-label={`View ${hero.label}`}
                >
                  <img
                    src={hero.src}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                  {/* A plate carries its caption, the way a bound-in photograph does. */}
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-crimson-deep/90 via-crimson-deep/40 to-transparent p-5 pt-16 text-left sm:p-7 sm:pt-24">
                    <span className="min-w-0">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-brass-lift">
                        Now on PlanIt
                      </span>
                      <span className="mt-1.5 block truncate font-display text-[22px] text-white sm:text-[26px]">
                        {hero.label}
                      </span>
                      {hero.sub && (
                        <span className="mt-0.5 block truncate text-[13px] text-white/60">
                          {hero.sub}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight
                      className="hidden h-5 w-5 shrink-0 text-white/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass-lift sm:block"
                      strokeWidth={1.75}
                    />
                  </span>
                </button>
              ) : (
                /* Before any inventory loads, the plate holds the wordmark
                   rather than a grey box. */
                <div className="plate flex aspect-[4/3] w-full items-center justify-center bg-crimson-deep sm:aspect-[16/10]">
                  <p className="font-display text-[clamp(28px,5vw,52px)] text-white/12">
                    PlanIt Nepal
                  </p>
                </div>
              )}
            </motion.div>

            {/* ---------- The plan card: the signature ---------- */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.48 }}
            >
              <div className="card overflow-hidden">
                <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                  <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
                    Your plan
                  </h2>
                  <span className="amount text-[12px] text-ink-mute">{filled} of 3 chosen</span>
                </div>

                <div className="divide-y divide-line">
                  {STEPS.map((step, i) => {
                    const chosen = slotFor(step)
                    return (
                      <motion.button
                        key={step.step}
                        onClick={() => navigate(step.path)}
                        initial={reduced ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.68 + i * 0.09 }}
                        className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors ${
                            chosen
                              ? "border-crimson bg-crimson text-white"
                              : "border-line-strong font-mono text-ink-mute group-hover:border-brass group-hover:text-brass-deep"
                          }`}
                        >
                          {chosen ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.step}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-ink">{step.label}</span>
                          <span
                            className={`block truncate text-[13.5px] ${
                              chosen ? "text-ink-soft" : "text-ink-mute"
                            }`}
                          >
                            {chosen || "Nothing chosen yet"}
                          </span>
                        </span>

                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-line-strong transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass"
                          strokeWidth={2}
                        />
                      </motion.button>
                    )
                  })}
                </div>

                <div className="border-t border-line bg-gray-50 px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13.5px] text-ink-soft">Running total</span>
                    <span className="amount text-[20px] font-semibold text-ink">
                      Rs {total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(cartItems.length ? "/cart" : "/venues")}
                    className="btn btn-primary group mt-4 w-full"
                  >
                    {cartItems.length ? "Review and pay" : "Start with a venue"}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </button>
                  <p className="mt-3 text-center text-[12px] text-ink-mute">
                    Nothing is charged until you choose how to pay.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---------- Live inventory band ---------- */}
        {bandImages.length > 0 && (
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="marquee relative mt-16 overflow-hidden border-y border-line bg-surface py-5 sm:mt-24"
            style={{ "--marquee-duration": `${Math.max(40, bandImages.length * 7)}s` }}
          >
            {/* Feathered edges so the strip reads as continuous, not clipped. */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper to-transparent sm:w-28" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper to-transparent sm:w-28" />

            <div className="marquee-track gap-4 px-2">
              {[...bandImages, ...bandImages].map((item, i) => (
                <button
                  key={`${item.label}-${i}`}
                  onClick={() => navigate(item.to)}
                  aria-hidden={i >= bandImages.length}
                  tabIndex={i >= bandImages.length ? -1 : 0}
                  className="group relative h-40 w-64 shrink-0 overflow-hidden rounded-lg border border-line sm:h-48 sm:w-80"
                >
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-crimson-deep/85 to-transparent p-3 text-left">
                    <span className="block truncate text-[13.5px] font-semibold text-white">
                      {item.label}
                    </span>
                    {item.sub && (
                      <span className="block truncate text-[11.5px] text-white/70">{item.sub}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ======================= The three steps ======================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={sectionReveal}
          className="max-w-2xl"
        >
          <motion.p variants={childReveal} className="eyebrow">
            What you book here
          </motion.p>
          <motion.h2 variants={childReveal} className="mt-5 text-[clamp(30px,4.5vw,46px)]">
            Three decisions, in the order they actually happen.
          </motion.h2>
        </motion.div>

        {/* Alternating editorial rows rather than three identical tiles. */}
        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
          {STEPS.map((step, i) => {
            const image = stepImage(i)
            const flip = i % 2 === 1
            return (
              <motion.article
                key={step.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={sectionReveal}
                className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16"
              >
                <motion.button
                  variants={childReveal}
                  onClick={() => navigate(step.path)}
                  aria-label={`Browse ${step.label.toLowerCase()}`}
                  className={`plate group block aspect-[5/4] w-full ${flip ? "lg:order-2" : ""}`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-crimson-deep">
                      <span className="font-display text-[64px] text-white/15">{step.step}</span>
                    </span>
                  )}

                  {/* The step number sits on the image like a plate number. */}
                  <span className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-brass/40 bg-paper font-mono text-[13px] font-semibold text-brass-deep">
                    {step.step}
                  </span>
                </motion.button>

                <div className={flip ? "lg:order-1" : ""}>
                  <motion.h3
                    variants={childReveal}
                    className="font-display text-[clamp(26px,3.6vw,38px)] leading-[1.05] tracking-[-0.02em]"
                  >
                    {step.headline}
                  </motion.h3>
                  <motion.p
                    variants={childReveal}
                    className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft"
                  >
                    {step.body}
                  </motion.p>
                  <motion.button
                    variants={childReveal}
                    onClick={() => navigate(step.path)}
                    className="group mt-7 inline-flex items-center gap-2 border-b-2 border-brass pb-1 text-[15px] font-semibold text-ink"
                  >
                    Browse {step.label.toLowerCase()}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </motion.button>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* The single ornament in the system: a brass rule broken by a lozenge,
          closing the three steps. It appears once on the page and nowhere
          else. */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <div className="ornament" aria-hidden>
          <span />
        </div>
      </div>

      {/* ======================= Paying ======================= */}
      <section className="relative isolate overflow-hidden border-y border-line bg-crimson-deep text-white">
        {/* A real event photograph sits behind the crimson, dimmed almost to
            texture. It gives the panel depth without competing with the type. */}
        {payingImage && (
          <img
            src={payingImage}
            alt=""
            aria-hidden
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.14]"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-crimson-deep via-crimson-deep/85 to-crimson-deep/55" />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionReveal}
            className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"
          >
            <div>
              <motion.p
                variants={childReveal}
                className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50"
              >
                <span className="h-px w-7 bg-brass" />
                Paying
              </motion.p>
              <motion.h2
                variants={childReveal}
                className="mt-5 font-display text-[clamp(30px,4.5vw,46px)] leading-[1.05] tracking-[-0.025em] text-white"
              >
                Pay the way you
                <br />
                <span className="font-normal italic">already pay.</span>
              </motion.h2>
              <motion.p
                variants={childReveal}
                className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-white/60"
              >
                Hold your dates with 25% down, settle in full up front, or pay in cash once the event
                is over. Your booking confirms the moment the payment clears.
              </motion.p>
            </div>

            <motion.ul
              variants={childReveal}
              className="divide-y divide-white/10 border-y border-white/10"
            >
              {[
                { name: "Khalti", dot: "#8B5FBF", detail: "Khalti wallet, mobile banking, connectIPS and cards." },
                { name: "Fonepay", dot: "#E8536A", detail: "Straight from your bank account over the Fonepay network." },
                { name: "Cash after service", dot: "#DCC369", detail: "Confirm now, hand over payment once the event is done." },
              ].map((m) => (
                <li key={m.name} className="flex items-start gap-4 py-6">
                  <span
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: m.dot }}
                    aria-hidden
                  />
                  <span>
                    <span className="block text-[17px] font-semibold text-white">{m.name}</span>
                    <span className="mt-1 block text-[14px] leading-relaxed text-white/55">
                      {m.detail}
                    </span>
                  </span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ======================= Reviews ======================= */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Review />
        </div>
      </section>

      {/* ======================= Contact ======================= */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionReveal}
            className="grid gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <div>
              <motion.p variants={childReveal} className="eyebrow">
                Talk to us
              </motion.p>
              <motion.h2 variants={childReveal} className="mt-5 text-[clamp(30px,4.5vw,46px)]">
                Tell us the date.
                <br />
                <span className="font-normal italic">We&rsquo;ll tell you what&rsquo;s free.</span>
              </motion.h2>
              <motion.p
                variants={childReveal}
                className="mt-6 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft"
              >
                Send the details of your event and our planners come back within a day with venues,
                menus and studios that are actually available on it.
              </motion.p>

              <motion.div
                variants={childReveal}
                className="mt-10 divide-y divide-line border-y border-line"
              >
                <a
                  href="mailto:contact@planitnepal.com"
                  className="group flex items-center gap-4 py-5 no-underline"
                >
                  <Mail className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="flex-1">
                    <span className="block text-[12.5px] text-ink-mute">Email</span>
                    <span className="amount text-[15px] text-ink">contact@planitnepal.com</span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-line-strong transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass"
                    strokeWidth={2}
                  />
                </a>
                <a href="tel:+9779876543345" className="group flex items-center gap-4 py-5 no-underline">
                  <Phone className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="flex-1">
                    <span className="block text-[12.5px] text-ink-mute">Phone</span>
                    <span className="amount text-[15px] text-ink">+977 987 654 3345</span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-line-strong transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass"
                    strokeWidth={2}
                  />
                </a>
              </motion.div>
            </div>

            <motion.div variants={childReveal}>
              <ContactForm
                title="Quick contact"
                description="Tell us about your event and we'll get back to you within 24 hours."
                compact
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================= Footer ======================= */}
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-[28px] font-semibold tracking-[-0.03em] text-crimson-deep">
                PlanIt Nepal
              </p>
              <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-ink-mute">
                Venues, catering and studios for events across Nepal, booked on one order.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-x-14 gap-y-2.5 text-[14px] sm:grid-cols-1">
              {[...STEPS.map((s) => ({ label: s.label, path: s.path })), { label: "About us", path: "/contact" }].map(
                (link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="text-left text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </button>
                ),
              )}
            </nav>
          </div>

          {/* An oversized wordmark closes the page rather than a thin legal line. */}
          <p
            aria-hidden
            className="mt-16 select-none font-display text-[clamp(56px,15vw,180px)] font-semibold leading-[0.8] tracking-[-0.05em] text-line"
          >
            PlanIt Nepal
          </p>

          <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-ink-mute sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} PlanIt Nepal. All rights reserved.</p>
            <p className="amount">Kathmandu, Nepal</p>
          </div>
        </div>
      </footer>

      <RecommendationComponent
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
      />
    </div>
  )
}

export default Home
