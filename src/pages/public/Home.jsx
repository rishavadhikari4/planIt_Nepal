import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Sparkles } from "lucide-react"
import Review from "./Review.jsx"
import ContactForm from "../../components/forms/ContactForm"
import RecommendationComponent from "../../components/RecommendationComponent"
import { AuthContext } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { getAllVenues } from "../../services/venues"
import { getAllStudios } from "../../services/studios"
import {
  EASE,
  Reveal,
  Stagger,
  Item,
  RevealLines,
  ImageReveal,
  Parallax,
  Magnetic,
  CountUp,
  Marquee,
} from "../../components/ui/Motion"

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

/* The occasions this company actually runs, named the way families name them
   rather than translated into "event categories". */
const OCCASIONS = [
  ["Weddings", "Bibaha, reception and the days either side"],
  ["Bratabandha", "The full ceremony, and the bhoj that follows"],
  ["Pasni", "Rice-feeding, kept small and kept warm"],
  ["Mehendi & Sangeet", "The loud night before the quiet morning"],
  ["Corporate", "Conferences, launches, annual dinners"],
  ["Anniversaries", "Milestones that deserve the good room"],
]

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const { cartItems } = useCart()
  const reduced = useReducedMotion()
  const [showRecommendations, setShowRecommendations] = useState(false)

  /* Photography on this page is the real inventory, not stock — the landing
     page is a live shopfront and stays current without anyone maintaining it. */
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

  /* The hero photograph drifts and dims as it leaves, so the page reads as one
     continuous surface rather than a stack of panels. */
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 700], [0, 90])
  const heroScale = useTransform(scrollY, [0, 700], [1, 1.08])
  const heroFade = useTransform(scrollY, [0, 520], [1, 0.35])

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const filled = STEPS.filter((s) => cartItems.some((i) => s.match(i.type))).length

  const slotFor = (step) => {
    const items = cartItems.filter((i) => step.match(i.type))
    if (items.length === 0) return null
    if (items.length === 1) return items[0].name
    return `${items.length} selected`
  }

  const band = [
    ...venues.map((v) => ({ src: v.venueImage, label: v.name, sub: v.location, to: `/venues/${v._id}` })),
    ...studios.map((s) => ({ src: s.studioImage, label: s.name, sub: s.location, to: `/studios/${s._id}` })),
  ].filter((i) => i.src)

  const hero = band[0]
  const payingImage = band[2]?.src || band[1]?.src || hero?.src
  const occasionImage = band[1]?.src || band[0]?.src
  const stepImage = (i) =>
    i === 0 ? venues[0]?.venueImage : i === 2 ? studios[0]?.studioImage : venues[1]?.venueImage

  return (
    <div className="bg-paper">
      {/* ======================= Hero =======================
          Full-bleed photography with the headline over it. The previous
          version put a small type block beside a small picture and left a
          void between them; an event planner has to lead with the room. */}
      <section className="relative isolate h-[86vh] min-h-[560px] w-full overflow-hidden bg-crimson-deep">
        {hero ? (
          <motion.div
            className="absolute inset-0"
            style={reduced ? undefined : { y: heroY, scale: heroScale }}
          >
            <motion.img
              src={hero.src}
              alt=""
              initial={reduced ? false : { scale: 1.18, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: EASE }}
              className="h-full w-full object-cover"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-crimson-deep" />
        )}

        {/* Weighted low and left so the type sits on the darkest part. */}
        <div className="absolute inset-0 bg-gradient-to-t from-crimson-deep via-crimson-deep/55 to-crimson-deep/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-crimson-deep/80 via-crimson-deep/25 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <motion.p
            className="t-overline text-brass-lift"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            Weddings &amp; events · Nepal
          </motion.p>

          <RevealLines
            as="h1"
            inView={false}
            delay={0.5}
            className="mt-6 max-w-[14ch] t-hero text-white"
            lines={["Some days you", "only get once."]}
          />

          <motion.div
            className="mt-8 grid max-w-4xl gap-7 sm:grid-cols-[minmax(0,44ch)_auto] sm:items-end sm:gap-12"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1 }}
          >
            <p className="t-lead text-white/75">
              The venue, the food and the camera — arranged on one order, with real prices and real
              availability across Nepal.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                {isAuthenticated && isCustomer ? (
                  <button onClick={() => setShowRecommendations(true)} className="btn btn-accent px-7">
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                    Plan my event
                  </button>
                ) : (
                  <button onClick={() => navigate("/venues")} className="btn btn-accent group px-7">
                    Start with a venue
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </button>
                )}
              </Magnetic>
              <button
                onClick={() => navigate("/cuisines")}
                className="btn border-white/30 bg-transparent text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/10"
              >
                Browse catering
              </button>
            </div>
          </motion.div>

          {hero && (
            <motion.button
              onClick={() => navigate(hero.to)}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="group mt-10 inline-flex w-fit items-center gap-2.5 border-t border-white/20 pt-4 text-left t-caption text-white/50 transition-colors duration-300 hover:text-white/80"
            >
              <span className="t-overline">Pictured</span>
              <span className="t-small text-white/80">{hero.label}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </motion.button>
          )}
        </div>
      </section>

      {/* ---------- The plan card, lifted onto the fold ---------- */}
      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="hidden lg:block" />
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.1 }}
          >
            <div className="card overflow-hidden shadow-xl">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                <h2 className="t-overline text-ink-mute">Your plan</h2>
                <span className="amount t-caption text-ink-mute">{filled} of 3 chosen</span>
              </div>

              <div className="divide-y divide-line">
                {STEPS.map((step) => {
                  const chosen = slotFor(step)
                  return (
                    <button
                      key={step.step}
                      onClick={() => navigate(step.path)}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-300 hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border t-caption transition-colors duration-300 ${
                          chosen
                            ? "border-crimson bg-crimson text-white"
                            : "border-line-strong font-mono text-ink-mute group-hover:border-brass group-hover:text-brass-deep"
                        }`}
                      >
                        {chosen ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.step}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block t-body font-semibold text-ink">{step.label}</span>
                        <span
                          className={`block truncate t-small ${chosen ? "text-ink-soft" : "text-ink-mute"}`}
                        >
                          {chosen || "Nothing chosen yet"}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-line-strong transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brass"
                        strokeWidth={2}
                      />
                    </button>
                  )
                })}
              </div>

              <div className="border-t border-line bg-gray-50 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="t-small text-ink-soft">Running total</span>
                  <span className="amount t-heading text-ink">Rs {total.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => navigate(cartItems.length ? "/cart" : "/venues")}
                  className="btn btn-primary group mt-4 w-full"
                >
                  {cartItems.length ? "Review and pay" : "Start with a venue"}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Live inventory band ---------- */}
      {band.length > 0 && (
        <div className="relative mt-16 border-y border-line bg-surface py-6 sm:mt-20">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-paper to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-paper to-transparent sm:w-32" />

          <Marquee speed={34} gap="1.25rem" className="px-2">
            {band.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="group relative h-52 w-72 shrink-0 overflow-hidden rounded-lg border border-line sm:h-64 sm:w-96"
              >
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-crimson-deep/0 transition-colors duration-500 group-hover:bg-crimson-deep/25" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-crimson-deep/90 to-transparent p-4 pt-12 text-left">
                  <span className="block truncate t-body font-semibold text-white">{item.label}</span>
                  {item.sub && <span className="block truncate t-caption text-white/65">{item.sub}</span>}
                </span>
              </button>
            ))}
          </Marquee>
        </div>
      )}

      {/* ======================= Occasions ======================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Stagger className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
          <div>
            <Item as="p" className="eyebrow">
              What we run
            </Item>
            <Item as="h2" className="mt-5 t-display">
              Every occasion that
              <br />
              <span className="t-turn">fills a room.</span>
            </Item>
            <Item as="p" className="mt-6 max-w-[38ch] t-body text-ink-soft">
              Two hundred events since 2020, from eighty-guest pasni to nine-hundred-guest
              receptions. The list below is what we book most.
            </Item>

            <Item className="mt-10 flex gap-10 border-t border-line pt-8">
              <div>
                <p className="amount t-display text-crimson">
                  <CountUp to={200} suffix="+" />
                </p>
                <p className="mt-1 t-caption text-ink-mute">Events run</p>
              </div>
              <div>
                <p className="amount t-display text-crimson">
                  <CountUp to={25} suffix="%" />
                </p>
                <p className="mt-1 t-caption text-ink-mute">Holds your dates</p>
              </div>
            </Item>

            {/* The list opposite runs longer than this column; a photograph
                carries the rest of the height rather than leaving a void. */}
            {occasionImage && (
              <Item className="mt-10 hidden lg:block">
                <Parallax distance={20}>
                  <div className="plate aspect-[4/5] w-full">
                    <ImageReveal
                      src={occasionImage}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-[1600ms] ease-out hover:scale-[1.04]"
                    />
                  </div>
                </Parallax>
              </Item>
            )}
          </div>

          <Item as="ul" className="divide-y divide-line border-y border-line">
            {OCCASIONS.map(([name, detail], i) => (
              <li key={name}>
                <button
                  onClick={() => navigate("/contact")}
                  className="group flex w-full items-baseline gap-6 py-5 text-left"
                >
                  <span className="amount w-7 shrink-0 t-caption font-semibold text-brass-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block t-heading text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                      {name}
                    </span>
                    <span className="mt-1 block t-small text-ink-mute">{detail}</span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 -translate-x-1 text-line-strong opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-brass group-hover:opacity-100"
                    strokeWidth={2}
                  />
                </button>
              </li>
            ))}
          </Item>
        </Stagger>
      </section>

      {/* ======================= The three steps ======================= */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">How a booking works</p>
            <h2 className="mt-5 t-display">
              Three decisions, in the
              <br />
              <span className="t-turn">order they happen.</span>
            </h2>
          </Reveal>

          <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
            {STEPS.map((step, i) => {
              const image = stepImage(i)
              const flip = i % 2 === 1
              return (
                <Stagger
                  key={step.step}
                  as="article"
                  className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"
                >
                  <Item className={flip ? "lg:order-2" : ""}>
                    <Parallax distance={26}>
                      <button
                        onClick={() => navigate(step.path)}
                        aria-label={`Browse ${step.label.toLowerCase()}`}
                        className="plate group block aspect-[4/3] w-full sm:aspect-[4/3]"
                      >
                        {image ? (
                          <ImageReveal
                            src={image}
                            className="h-full w-full"
                            imgClassName="transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-crimson-deep">
                            <span className="font-display t-display text-white/15">{step.step}</span>
                          </span>
                        )}
                        <span className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-brass/40 bg-paper font-mono t-small font-semibold text-brass-deep">
                          {step.step}
                        </span>
                      </button>
                    </Parallax>
                  </Item>

                  <div className={flip ? "lg:order-1" : ""}>
                    <Item as="h3" className="font-display t-title">
                      {step.headline}
                    </Item>
                    <Item as="p" className="mt-4 max-w-[44ch] t-body text-ink-soft">
                      {step.body}
                    </Item>
                    <Item>
                      <button
                        onClick={() => navigate(step.path)}
                        className="group relative mt-8 inline-flex items-center gap-2 pb-1.5 t-body font-semibold text-ink"
                      >
                        Browse {step.label.toLowerCase()}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                          strokeWidth={2}
                        />
                        {/* The rule under a link draws itself on hover, the
                            same gesture as the thread under the headline. */}
                        <span className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-100 bg-brass transition-transform duration-500 ease-out group-hover:scale-x-0" />
                        <span className="absolute inset-x-0 bottom-0 h-[1.5px] origin-right scale-x-0 bg-crimson transition-transform delay-200 duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
                      </button>
                    </Item>
                  </div>
                </Stagger>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================= Paying ======================= */}
      <section className="relative isolate overflow-hidden border-y border-line bg-crimson-deep text-white">
        {payingImage && (
          <motion.img
            src={payingImage}
            alt=""
            aria-hidden
            initial={reduced ? false : { scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 2, ease: EASE }}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.14]"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-crimson-deep via-crimson-deep/85 to-crimson-deep/55" />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Stagger className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <Item as="p" className="inline-flex items-center gap-3 t-overline text-white/50">
                <span className="h-px w-7 bg-brass" />
                Paying
              </Item>
              <Item as="h2" className="mt-5 font-display t-display text-white">
                Pay the way you
                <br />
                <span className="t-turn">already pay.</span>
              </Item>
              <Item as="p" className="mt-6 max-w-[40ch] t-body text-white/60">
                Hold your dates with 25% down, settle in full up front, or pay in cash once the day
                is over. Your booking confirms the moment the payment clears.
              </Item>
            </div>

            <Item as="ul" className="divide-y divide-white/10 border-y border-white/10">
              {[
                { name: "Khalti", dot: "#8B5FBF", detail: "Khalti wallet, mobile banking, connectIPS and cards." },
                { name: "Fonepay", dot: "#E8536A", detail: "Straight from your bank account over the Fonepay network." },
                { name: "Cash after service", dot: "#DCC369", detail: "Confirm now, hand over payment once the day is done." },
              ].map((m) => (
                <li key={m.name} className="group flex items-start gap-4 py-6">
                  <span
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-500 group-hover:scale-150"
                    style={{ background: m.dot }}
                    aria-hidden
                  />
                  <span>
                    <span className="block t-lead font-semibold text-white">{m.name}</span>
                    <span className="mt-1 block t-small text-white/55">{m.detail}</span>
                  </span>
                </li>
              ))}
            </Item>
          </Stagger>
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
          <Stagger className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <Item as="p" className="eyebrow">
                Talk to us
              </Item>
              <Item as="h2" className="mt-5 t-display">
                Tell us the date.
                <br />
                <span className="t-turn">We&rsquo;ll tell you what&rsquo;s free.</span>
              </Item>
              <Item as="p" className="mt-6 max-w-[42ch] t-body text-ink-soft">
                Send the details of your event and our planners come back within a day with venues,
                menus and studios that are actually available on it.
              </Item>

              <Item className="mt-10 divide-y divide-line border-y border-line">
                {[
                  { Icon: Mail, label: "Email", value: "contact@planitnepal.com", href: "mailto:contact@planitnepal.com" },
                  { Icon: Phone, label: "Phone", value: "+977 987 654 3345", href: "tel:+9779876543345" },
                ].map(({ Icon, label, value, href }) => (
                  <a key={label} href={href} className="group flex items-center gap-4 py-5 no-underline">
                    <Icon
                      className="h-4 w-4 shrink-0 text-ink-mute transition-colors duration-300 group-hover:text-crimson"
                      strokeWidth={1.75}
                    />
                    <span className="flex-1">
                      <span className="block t-caption text-ink-mute">{label}</span>
                      <span className="amount t-body text-ink">{value}</span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-line-strong transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brass"
                      strokeWidth={2}
                    />
                  </a>
                ))}
              </Item>
            </div>

            <Item>
              <ContactForm
                title="Quick contact"
                description="Tell us about your event and we'll get back to you within 24 hours."
                compact
              />
            </Item>
          </Stagger>
        </div>
      </section>

      {/* ======================= Footer ======================= */}
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display t-title text-crimson-deep">PlanIt Nepal</p>
              <p className="mt-3 max-w-[34ch] t-small text-ink-mute">
                Venues, catering and studios for events across Nepal, booked on one order.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-x-14 gap-y-2.5 t-small sm:grid-cols-1">
              {[...STEPS.map((s) => ({ label: s.label, path: s.path })), { label: "About us", path: "/contact" }].map(
                (link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="w-fit text-left text-ink-soft transition-colors duration-300 hover:text-crimson"
                  >
                    {link.label}
                  </button>
                ),
              )}
            </nav>
          </div>

          <Reveal amount={0.1} y={40}>
            <p
              aria-hidden
              className="mt-16 select-none font-display text-[clamp(56px,15vw,180px)] font-semibold leading-[0.8] tracking-[-0.05em] text-line"
            >
              PlanIt Nepal
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 t-caption text-ink-mute sm:flex-row sm:justify-between">
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
