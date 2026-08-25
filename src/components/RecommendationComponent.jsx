import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../context/CartContext"
import { getOccasions, getOccasionPackage } from "../services/recommendations"
import { Modal } from "./ui/Admin"
import { Field, Row, CheckboxGroup } from "./ui/FormKit"
import { img, SIZES } from "../utils/image"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const SERVICES = [
  "Wedding Photography",
  "Pre-wedding Shoot",
  "Video Recording",
  "Event Coverage",
  "Portrait Session",
  "Drone Photography",
  "Photo Editing",
  "Album Design",
]

/* One budget and a headcount, not three budgets nobody can invent. The split
   between venue, food and studio comes from the occasion, because a pasni and
   a corporate dinner do not spend the same money in the same places. */
const EMPTY = {
  occasion: "wedding",
  budget: "",
  guestCount: "",
  location: "",
  skipStudio: false,
  preferredServices: [],
}

const STEPS = ["Occasion", "Details", "Your package"]

const Rating = ({ value }) =>
  value ? (
    <span className="inline-flex items-center gap-1 t-caption text-ink-mute">
      <Star className="h-3 w-3 fill-brass text-brass" strokeWidth={1.5} />
      <span className="amount">{value}</span>
    </span>
  ) : null

const PackageRow = ({ image, name, meta, price }) => (
  <li className="flex items-center gap-4 px-5 py-4">
    <img
      src={img(image, { w: SIZES.thumb }) || "/placeholder.svg"}
      alt=""
      loading="lazy"
      className="h-14 w-14 shrink-0 rounded-md border border-line object-cover"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate t-body font-semibold text-ink">{name}</p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 t-caption text-ink-mute">
        {meta}
      </div>
    </div>
    <span className="amount shrink-0 t-small font-semibold text-ink">{rs(price)}</span>
  </li>
)

const RecommendationComponent = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [occasions, setOccasions] = useState([])

  /* The occasions come from the server so this list cannot drift from the one
     the planner actually knows how to build for. */
  useEffect(() => {
    if (!isOpen || occasions.length) return
    let live = true
    getOccasions()
      .then((list) => live && setOccasions(list))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [isOpen, occasions.length])

  const chosen = occasions.find((o) => o.id === form.occasion)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const reset = () => {
    setStep(0)
    setForm(EMPTY)
    setResult(null)
    onClose()
  }

  const fetchPackage = async () => {
    const budget = Number(form.budget)
    if (!Number.isFinite(budget) || budget < 10000) {
      return toast.info("Give a total budget of at least Rs 10,000.")
    }

    setLoading(true)
    try {
      const data = await getOccasionPackage({
        occasion: form.occasion,
        budget,
        guests: Number(form.guestCount) || chosen?.typicalGuests || 100,
        location: form.location,
        skipStudio: form.skipStudio,
      })
      setResult(data)
      setStep(2)
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "We couldn't build a package from that. Try widening the budget.",
      )
    } finally {
      setLoading(false)
    }
  }

  const addPackage = () => {
    const pkg = result?.package
    if (!pkg) return

    const items = [
      pkg.venue && {
        _id: pkg.venue._id,
        name: pkg.venue.name,
        price: pkg.venue.price,
        image: pkg.venue.venueImage,
        type: "venue",
      },
      pkg.studio && {
        _id: pkg.studio._id,
        name: pkg.studio.name,
        price: pkg.studio.price,
        image: pkg.studio.studioImage,
        type: "studio",
      },
      ...(pkg.dishes || []).map((dish) => ({
        _id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        type: "cuisine",
        category: dish.category,
      })),
    ].filter(Boolean)

    let added = 0
    items.forEach((item) => {
      const needsDates = item.type === "venue" || item.type === "studio"
      if (addToCart(item, null, true, needsDates)) added++
    })

    if (added === 0) {
      return toast.error("Nothing could be added. Try again, or add the items yourself.")
    }

    toast.success(`${added} ${added === 1 ? "item" : "items"} added to your cart.`)
    reset()
    navigate("/cart")
  }

  const pkg = result?.package
  const insights = result?.insights

  return (
    <Modal
      open={isOpen}
      onClose={reset}
      title="Plan my event"
      description="Tell us the occasion and the budget. We'll split it and pick the rest."
      width="max-w-2xl"
    >
      {/* Step indicator — the same numbered thread used across the product. */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full t-caption font-semibold ${
                i < step
                  ? "bg-crimson text-white"
                  : i === step
                    ? "border border-brass bg-brass-soft text-brass-deep"
                    : "border border-line-strong text-ink-mute"
              }`}
            >
              {i < step ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={`hidden t-caption sm:block ${
                i === step ? "font-semibold text-ink" : "text-ink-mute"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {/* ---------------- Step 1: budget ---------------- */}
        {step === 0 && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            <div>
              <p className="label">What are you planning?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(occasions.length ? occasions : [{ id: "wedding", label: "Wedding", note: "" }]).map(
                  (occasion) => {
                    const active = form.occasion === occasion.id
                    return (
                      <button
                        key={occasion.id}
                        type="button"
                        onClick={() => set("occasion", occasion.id)}
                        aria-pressed={active}
                        className={`rounded-md border p-3.5 text-left transition-colors ${
                          active
                            ? "border-crimson bg-crimson-50"
                            : "border-line hover:border-ink-mute"
                        }`}
                      >
                        <span className="block t-small font-semibold text-ink">{occasion.label}</span>
                        {occasion.note && (
                          <span className="mt-0.5 block t-caption leading-snug text-ink-mute">
                            {occasion.note}
                          </span>
                        )}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <Row>
              <Field
                id="budget"
                label="Total budget"
                hint="One figure. We split it across the three."
              >
                <input
                  id="budget"
                  type="number"
                  min="10000"
                  inputMode="numeric"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  placeholder="400000"
                  className="field amount"
                />
              </Field>
              <Field
                id="guestCount"
                label="Guests"
                hint={
                  chosen?.typicalGuests
                    ? `A ${chosen.label.toLowerCase()} is usually around ${chosen.typicalGuests}.`
                    : "Catering is priced per plate."
                }
              >
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  placeholder={String(chosen?.typicalGuests || 150)}
                  className="field amount"
                />
              </Field>
            </Row>

            <div className="flex justify-end gap-2 border-t border-line pt-6">
              <button onClick={reset} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={() => setStep(1)} className="btn btn-primary group">
                Next
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------------- Step 2: preferences ---------------- */}
        {step === 1 && (
          <motion.div
            key="prefs"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <Field id="location" label="Preferred area" hint="Leave blank to search everywhere.">
              <input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Lalitpur"
                className="field"
              />
            </Field>

            {/* Not every occasion wants a photographer. Dropping the studio
                gives its share of the budget back to the venue and the food
                rather than losing it. */}
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line p-4 transition-colors hover:border-ink-mute">
              <input
                type="checkbox"
                checked={form.skipStudio}
                onChange={(e) => set("skipStudio", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-crimson"
              />
              <span>
                <span className="block t-small font-semibold text-ink">
                  No photographer needed
                </span>
                <span className="mt-0.5 block t-caption leading-snug text-ink-mute">
                  Its share of the budget goes to the venue and the catering instead.
                </span>
              </span>
            </label>

            <CheckboxGroup
              label="Studio services you want"
              options={SERVICES}
              value={form.preferredServices}
              onChange={(preferredServices) => set("preferredServices", preferredServices)}
              hint="Pick none and we'll match on price alone."
              disabled={form.skipStudio}
            />

            <div className="flex justify-between gap-2 border-t border-line pt-6">
              <button onClick={() => setStep(0)} className="btn btn-quiet">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <button onClick={fetchPackage} disabled={loading} className="btn btn-accent">
                {loading ? (
                  <>
                    <span className="loader h-4 w-4 border-white/40 border-t-white" />
                    Building your package…
                  </>
                ) : (
                  "Build my package"
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------------- Step 3: the package ---------------- */}
        {step === 2 && pkg && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="t-small text-ink-mute">Package total</p>
                <p className="amount mt-1 t-title font-semibold text-ink">
                  {rs(pkg.totalPrice)}
                </p>
              </div>
              {insights && (
                <div className="text-right">
                  <p
                    className={`amount t-small font-semibold ${
                      insights.withinBudget ? "text-green-700" : "text-orange-800"
                    }`}
                  >
                    {insights.withinBudget
                      ? `${rs(insights.difference)} under budget`
                      : `${rs(Math.abs(insights.difference))} over`}
                  </p>
                  <p className="amount mt-0.5 t-caption text-ink-mute">
                    {insights.utilization}% of your budget
                  </p>
                </div>
              )}
            </div>

            <ul className="divide-y divide-line rounded-lg border border-line">
              {pkg.venue && (
                <PackageRow
                  image={pkg.venue.venueImage}
                  name={pkg.venue.name}
                  price={pkg.venue.price}
                  meta={
                    <>
                      <span>Venue</span>
                      {pkg.venue.location && <span>{pkg.venue.location}</span>}
                      <Rating value={pkg.venue.rating} />
                    </>
                  }
                />
              )}

              {pkg.studio && (
                <PackageRow
                  image={pkg.studio.studioImage}
                  name={pkg.studio.name}
                  price={pkg.studio.price}
                  meta={
                    <>
                      <span>Studio</span>
                      {pkg.studio.location && <span>{pkg.studio.location}</span>}
                      <Rating value={pkg.studio.rating} />
                    </>
                  }
                />
              )}

              {(pkg.dishes || []).map((dish) => (
                <PackageRow
                  key={dish._id}
                  image={dish.image}
                  name={dish.name}
                  price={dish.price}
                  meta={
                    <>
                      <span>{dish.category || "Dish"}</span>
                      <span>per plate</span>
                      <Rating value={dish.rating} />
                    </>
                  }
                />
              ))}
            </ul>

            {/* The number people actually miss: a plate price is small, and
                two hundred of them is not. */}
            {pkg.platePrice > 0 && (
              <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-line bg-gray-50 px-4 py-3 t-small text-ink-soft">
                <span>
                  Catering: <span className="amount text-ink">{rs(pkg.platePrice)}</span> a plate ×{" "}
                  <span className="amount text-ink">{result.guests}</span> guests
                </span>
                <span className="amount font-semibold text-ink">{rs(pkg.cateringTotal)}</span>
              </p>
            )}

            {insights?.notes?.length > 0 && (
              <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="t-small font-semibold text-orange-800">Worth knowing</p>
                <ul className="mt-2 space-y-1.5">
                  {insights.notes.slice(0, 3).map((note, i) => (
                    <li key={i} className="t-small leading-relaxed text-orange-800/85">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-6 t-caption leading-relaxed text-ink-mute">
              Venues and studios still need dates — pick those in your cart before checking out.
            </p>

            <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-6">
              <button onClick={() => setStep(1)} className="btn btn-quiet">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Change my answers
              </button>
              <button onClick={addPackage} className="btn btn-accent group">
                Add all to cart
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

export default RecommendationComponent
