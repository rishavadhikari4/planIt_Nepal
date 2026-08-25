import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../context/CartContext"
import { getWeddingPackageRecommendation } from "../services/recommendations"
import { Modal } from "./ui/Admin"
import { Field, Row, CheckboxGroup } from "./ui/FormKit"

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

const EMPTY = {
  venueBudget: "",
  studioBudget: "",
  foodBudget: "",
  location: "",
  guestCount: "",
  preferredServices: [],
}

const STEPS = ["Budget", "Preferences", "Your package"]

const Rating = ({ value }) =>
  value ? (
    <span className="inline-flex items-center gap-1 text-[12px] text-ink-mute">
      <Star className="h-3 w-3 fill-brass text-brass" strokeWidth={1.5} />
      <span className="amount">{value}</span>
    </span>
  ) : null

const PackageRow = ({ image, name, meta, price }) => (
  <li className="flex items-center gap-4 px-5 py-4">
    <img
      src={image || "/placeholder.svg"}
      alt=""
      loading="lazy"
      className="h-14 w-14 shrink-0 rounded-md border border-line object-cover"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[14.5px] font-semibold text-ink">{name}</p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-mute">
        {meta}
      </div>
    </div>
    <span className="amount shrink-0 text-[14px] font-semibold text-ink">{rs(price)}</span>
  </li>
)

const RecommendationComponent = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const reset = () => {
    setStep(0)
    setForm(EMPTY)
    setResult(null)
    onClose()
  }

  const fetchPackage = async () => {
    setLoading(true)
    try {
      // The API wants one total; an unspecified budget falls back to a sane default.
      const total =
        Number(form.venueBudget || 0) + Number(form.studioBudget || 0) + Number(form.foodBudget || 0) ||
        100000

      const response = await getWeddingPackageRecommendation({
        totalBudget: String(total),
        venueBudget: form.venueBudget,
        studioBudget: form.studioBudget,
        foodBudget: form.foodBudget,
        location: form.location,
        guestCount: form.guestCount,
        preferredServices: form.preferredServices.join(","),
      })

      if (!response.success) throw new Error(response.message)
      setResult(response.data)
      setStep(2)
    } catch (error) {
      toast.error(error.message || "We couldn't build a package from that. Try widening the budget.")
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
  const analysis = result?.budgetAnalysis
  const insights = result?.insights

  return (
    <Modal
      open={isOpen}
      onClose={reset}
      title="Build my package"
      description="Tell us the shape of your event and we'll put a whole plan together."
      width="max-w-2xl"
    >
      {/* Step indicator — the same numbered thread used across the product. */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
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
              className={`hidden text-[12.5px] sm:block ${
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
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Every field here is optional. Fill in what you know and we&rsquo;ll work around the
              rest.
            </p>

            <Row>
              <Field id="venueBudget" label="Venue budget" hint="In rupees.">
                <input
                  id="venueBudget"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.venueBudget}
                  onChange={(e) => set("venueBudget", e.target.value)}
                  placeholder="80000"
                  className="field amount"
                />
              </Field>
              <Field id="foodBudget" label="Catering budget" hint="In rupees.">
                <input
                  id="foodBudget"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.foodBudget}
                  onChange={(e) => set("foodBudget", e.target.value)}
                  placeholder="60000"
                  className="field amount"
                />
              </Field>
            </Row>

            <Row>
              <Field id="studioBudget" label="Studio budget" hint="In rupees.">
                <input
                  id="studioBudget"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.studioBudget}
                  onChange={(e) => set("studioBudget", e.target.value)}
                  placeholder="40000"
                  className="field amount"
                />
              </Field>
              <Field id="guestCount" label="Guests" hint="Drives the catering count.">
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  placeholder="150"
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

            <CheckboxGroup
              label="Studio services you want"
              options={SERVICES}
              value={form.preferredServices}
              onChange={(preferredServices) => set("preferredServices", preferredServices)}
              hint="Pick none and we'll match on price alone."
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
                <p className="text-[13.5px] text-ink-mute">Package total</p>
                <p className="amount mt-1 text-[30px] font-semibold text-ink">
                  {rs(pkg.totalPrice)}
                </p>
              </div>
              {analysis && (
                <div className="text-right">
                  {analysis.savings > 0 && (
                    <p className="amount text-[14px] font-semibold text-green-700">
                      {rs(analysis.savings)} under budget
                    </p>
                  )}
                  {analysis.budgetUtilization && (
                    <p className="amount mt-0.5 text-[12.5px] text-ink-mute">
                      {analysis.budgetUtilization}% of your budget
                    </p>
                  )}
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
                      <Rating value={dish.rating} />
                    </>
                  }
                />
              ))}
            </ul>

            {(insights?.benefits?.length > 0 || insights?.recommendations?.length > 0) && (
              <div className="mt-6 space-y-4">
                {insights.benefits?.length > 0 && (
                  <div>
                    <p className="eyebrow">Why this works</p>
                    <ul className="mt-3 space-y-1.5">
                      {insights.benefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="text-[13.5px] leading-relaxed text-ink-soft">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.recommendations?.length > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-[13px] font-semibold text-orange-800">Worth considering</p>
                    <ul className="mt-2 space-y-1.5">
                      {insights.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="text-[13px] leading-relaxed text-orange-800/85">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-[12.5px] leading-relaxed text-ink-mute">
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
