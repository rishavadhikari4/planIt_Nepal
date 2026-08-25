import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Sparkles } from "lucide-react"
import Review from "./Review.jsx"
import ContactForm from "../../components/forms/ContactForm"
import RecommendationComponent from "../../components/RecommendationComponent"
import { AuthContext } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"

/* A booking is three decisions in a fixed order: the venue fixes the date,
   catering follows the venue, the studio follows both. The numbering on this
   page encodes that order — it is not ornament. */
const STEPS = [
  {
    step: "01",
    label: "Venue",
    path: "/venues",
    headline: "Where it happens",
    body: "Banquet halls, garden lawns, party palaces and conference floors. Availability is shown by date, so you book the room and the day together.",
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
    body: "Photo and video teams with published rates and sample work. Book them for the same dates as the venue in a single pass.",
    match: (t) => t === "studio",
  },
]

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const { cartItems } = useCart()
  const [showRecommendations, setShowRecommendations] = useState(false)

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const filled = STEPS.filter((s) => cartItems.some((i) => s.match(i.type))).length

  const slotFor = (step) => {
    const items = cartItems.filter((i) => step.match(i.type))
    if (items.length === 0) return null
    if (items.length === 1) return items[0].name
    return `${items.length} selected`
  }

  return (
    <div className="bg-paper">
      {/* ================= Hero =================
          The thesis: this product is a plan with three slots. Show the actual
          plan, filled in with whatever the person has already chosen. */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div initial="hidden" animate="visible" variants={reveal}>
            <p className="eyebrow">Event planning · Nepal</p>

            <h1 className="mt-6 text-[40px] leading-[1.02] sm:text-[56px] lg:text-[64px]">
              The venue, the food,
              <br />
              and the camera.
              <br />
              <span className="text-ink-mute">One date, one checkout.</span>
            </h1>

            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
              PlanIt Nepal puts the three bookings every event needs on a single order. Compare
              real prices, hold your dates, and settle up with Khalti, Fonepay, or cash after the
              event.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {isAuthenticated && isCustomer ? (
                <button onClick={() => setShowRecommendations(true)} className="btn btn-accent h-12 px-6">
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Build my package
                </button>
              ) : (
                <button onClick={() => navigate("/venues")} className="btn btn-accent h-12 px-6">
                  Start with a venue
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
              <button onClick={() => navigate("/cuisines")} className="btn btn-ghost h-12 px-6">
                Browse catering
              </button>
            </div>
          </motion.div>

          {/* ---------- The plan card: signature element ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:sticky lg:top-24"
          >
            <div className="card overflow-hidden">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  Your plan
                </h2>
                <span className="amount text-[12px] text-ink-mute">
                  {filled} of 3 chosen
                </span>
              </div>

              <div className="divide-y divide-line">
                {STEPS.map((step) => {
                  const chosen = slotFor(step)
                  return (
                    <button
                      key={step.step}
                      onClick={() => navigate(step.path)}
                      className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          chosen
                            ? "border-pine bg-pine text-white"
                            : "border-line-strong font-mono text-ink-mute"
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
                        className="h-4 w-4 shrink-0 text-line-strong transition-colors group-hover:text-marigold"
                        strokeWidth={2}
                      />
                    </button>
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
                  className="btn btn-primary mt-4 w-full"
                >
                  {cartItems.length ? "Review and pay" : "Start with a venue"}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
                <p className="mt-3 text-center text-[12px] text-ink-mute">
                  Nothing is charged until you choose how to pay.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= The three services ================= */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
          >
            <p className="eyebrow">What you book here</p>
            <h2 className="mt-5 max-w-[20ch] text-[32px] sm:text-[42px]">
              Three decisions, in the order they actually happen.
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.button
                key={step.step}
                onClick={() => navigate(step.path)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal}
                transition={{ delay: i * 0.07 }}
                className="group flex flex-col items-start bg-surface p-7 text-left transition-colors hover:bg-gray-50 sm:p-9"
              >
                <span className="amount text-[12px] font-semibold tracking-[0.16em] text-marigold-deep">
                  {step.step}
                </span>
                <h3 className="mt-5 text-[22px] font-semibold text-ink">{step.headline}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
                <span className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-pine">
                  Browse {step.label.toLowerCase()}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= How paying works ================= */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Paying</p>
            <h2 className="mt-5 text-[32px] sm:text-[40px]">Pay the way you already pay.</h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
              Hold your dates with a 25% advance, settle the full amount up front, or pay in cash
              once the event is over. Your booking is confirmed the moment the payment clears.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {[
              {
                name: "Khalti",
                detail: "Khalti wallet, mobile banking, connectIPS and cards, through Khalti's checkout.",
              },
              {
                name: "Fonepay",
                detail: "Pay straight from your bank account or mobile banking app over the Fonepay network.",
              },
              {
                name: "Cash after service",
                detail: "Confirm the order now and hand over payment once the event is done. No advance.",
              },
            ].map((m) => (
              <div key={m.name} className="bg-surface p-6">
                <h3 className="text-[16px] font-semibold text-ink">{m.name}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-mute">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Reviews ================= */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Review />
        </div>
      </section>

      {/* ================= Contact ================= */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Talk to us</p>
            <h2 className="mt-5 text-[32px] sm:text-[40px]">
              Tell us the date. We&rsquo;ll tell you what&rsquo;s free.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
              Send the details of your event and our planners will come back within a day with
              venues, menus and studios that are actually available on it.
            </p>

            <div className="mt-10 divide-y divide-line border-y border-line">
              <a
                href="mailto:contact@planitnepal.com"
                className="flex items-center gap-4 py-5 no-underline transition-colors hover:text-pine"
              >
                <Mail className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                <span className="flex-1">
                  <span className="block text-[12.5px] text-ink-mute">Email</span>
                  <span className="amount text-[15px] text-ink">contact@planitnepal.com</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-line-strong" strokeWidth={2} />
              </a>
              <a
                href="tel:+9779876543345"
                className="flex items-center gap-4 py-5 no-underline transition-colors hover:text-pine"
              >
                <Phone className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                <span className="flex-1">
                  <span className="block text-[12.5px] text-ink-mute">Phone</span>
                  <span className="amount text-[15px] text-ink">+977 987 654 3345</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-line-strong" strokeWidth={2} />
              </a>
            </div>
          </div>

          <ContactForm
            title="Quick contact"
            description="Tell us about your event and we'll get back to you within 24 hours."
            compact
          />
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-pine-deep text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-[26px] font-semibold tracking-[-0.03em]">PlanIt Nepal</p>
              <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-white/55">
                Venues, catering and studios for events across Nepal, booked on one order.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[14px] sm:grid-cols-1">
              {STEPS.map((s) => (
                <button
                  key={s.path}
                  onClick={() => navigate(s.path)}
                  className="text-left text-white/60 transition-colors hover:text-white"
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => navigate("/contact")}
                className="text-left text-white/60 transition-colors hover:text-white"
              >
                About us
              </button>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-white/45 sm:flex-row sm:justify-between">
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
