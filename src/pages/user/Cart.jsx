import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Minus, Plus, Trash2, Users } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../context/CartContext"
import { createOrder } from "../../services/orders"
import { img, SIZES } from "../../utils/image"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

/* Cart entries have used both labels over the life of this codebase. */
const isDish = (type) => type === "dish" || type === "cuisine"

/* The cart mirrors the plan card on the home page: the same three slots, in the
   same order, so what you are assembling never changes shape as you move
   through the product. */
const GROUPS = [
  { key: "venue", step: "01", label: "Venue", empty: "No venue yet", path: "/venues", match: (t) => t === "venue" },
  { key: "catering", step: "02", label: "Catering", empty: "No dishes yet", path: "/cuisines", match: (t) => t === "dish" || t === "cuisine" },
  { key: "studio", step: "03", label: "Studio", empty: "No studio yet", path: "/studios", match: (t) => t === "studio" },
]

const Cart = () => {
  const { cartItems, removeFromCart, fetchCartItems, updateQuantity } = useCart()
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  /* Catering is sold per plate, so the headcount is what the dish lines are
     actually multiplied by. It is remembered across visits because nobody
     wants to re-type it every time they come back to the cart. */
  const [guests, setGuests] = useState(() => {
    const saved = Number(localStorage.getItem("guestCount"))
    return Number.isInteger(saved) && saved > 0 ? String(saved) : ""
  })
  const navigate = useNavigate()

  useEffect(() => {
    // fetchCartItems reads straight from context today, but wrapping it keeps
    // this correct if it ever starts returning a promise.
    Promise.resolve(fetchCartItems()).finally(() => setLoading(false))
  }, [])

  const headcount = Number(guests) > 0 ? Number(guests) : null

  /* A dish line costs one plate per guest once a headcount is set; before
     that it falls back to whatever quantity the cart holds. Venues and
     studios are priced per booking and ignore the headcount entirely. */
  const lineQuantity = (item) =>
    isDish(item.type) && headcount ? headcount : item.quantity

  const lineTotal = (item) => item.price * lineQuantity(item)
  const total = cartItems.reduce((sum, i) => sum + lineTotal(i), 0)

  /* The room has to hold the party. Warned about here rather than discovered
     at checkout, where the server rejects it. */
  const venue = cartItems.find((i) => i.type === "venue")
  const overCapacity =
    headcount && venue?.capacity && headcount > Number(venue.capacity) ? venue : null

  const handleCheckout = async () => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Log in to continue to payment.")
      return navigate("/login")
    }

    setCheckingOut(true)
    try {
      const items = cartItems.map((item) => ({
        itemId: item._id,
        itemType: item.type,
        quantity: item.quantity,
        // Only venues and studios are booked against dates.
        ...(item.bookingDates && (item.type === "venue" || item.type === "studio")
          ? { bookedFrom: item.bookingDates.from, bookedTill: item.bookingDates.till }
          : {}),
      }))

      const { order } = await createOrder(items, headcount)
      if (!order) throw new Error("The order could not be created")
      navigate(`/payment/${order._id}`, { state: { orderData: order } })
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't create your order. Try again.")
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ink-mute">
          <span className="loader" />
          <span className="t-small">Loading your cart…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <p className="eyebrow">Your plan</p>
        <h1 className="mt-5 t-display">Everything you&rsquo;ve chosen</h1>

        {cartItems.length === 0 ? (
          <div className="card mt-12 px-6 py-16 text-center">
            <h2 className="t-heading">Nothing here yet</h2>
            <p className="mx-auto mt-3 max-w-[42ch] t-body leading-relaxed text-ink-soft">
              Start with a venue — it fixes the date, and everything else is booked around it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/venues")} className="btn btn-accent">
                Browse venues
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <button onClick={() => navigate("/cuisines")} className="btn btn-ghost">
                Browse catering
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            {/* ---------------- Items, grouped by slot ---------------- */}
            <div className="space-y-10">
              {GROUPS.map((group) => {
                const items = cartItems.filter((i) => group.match(i.type))
                return (
                  <section key={group.key}>
                    <div className="flex items-baseline justify-between border-b border-line pb-3">
                      <h2 className="flex items-baseline gap-3 font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
                        <span className="text-brass-deep">{group.step}</span>
                        {group.label}
                      </h2>
                      <button
                        onClick={() => navigate(group.path)}
                        className="t-small font-medium text-crimson hover:underline"
                      >
                        {items.length ? "Add more" : "Browse"}
                      </button>
                    </div>

                    {items.length === 0 ? (
                      <p className="py-6 t-small text-ink-mute">{group.empty}</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <motion.li
                              key={item._id}
                              layout
                              exit={{ opacity: 0, height: 0 }}
                              className="group flex gap-4 py-6"
                            >
                              <img
                                src={img(item.image, { w: SIZES.thumb }) || "/placeholder.svg"}
                                alt=""
                                className="h-24 w-24 shrink-0 rounded-md border border-line object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <h3 className="truncate t-body font-semibold text-ink">
                                      {item.name}
                                    </h3>
                                    {item.category && (
                                      <p className="mt-0.5 t-small text-ink-mute">{item.category}</p>
                                    )}
                                  </div>
                                  <span className="amount shrink-0 t-body font-semibold text-ink">
                                    {rs(lineTotal(item))}
                                  </span>
                                </div>

                                {item.bookingDates && (item.type === "venue" || item.type === "studio") && (
                                  <p className="mt-2 inline-flex items-center gap-1.5 t-caption text-ink-soft">
                                    <Calendar className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.75} />
                                    <span className="amount">
                                      {new Date(item.bookingDates.from).toLocaleDateString("en-GB")} —{" "}
                                      {new Date(item.bookingDates.till).toLocaleDateString("en-GB")}
                                    </span>
                                  </p>
                                )}

                                <div className="mt-4 flex items-center gap-4">
                                  {/* Once a headcount is set it decides how many
                                      plates, so a per-dish stepper would be two
                                      controls fighting over one number. */}
                                  {isDish(item.type) && headcount ? (
                                    <span className="inline-flex items-center gap-2 rounded-md border border-line bg-gray-50 px-3 py-1.5 t-small text-ink-soft">
                                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                                      <span className="amount font-semibold text-ink">{headcount}</span>
                                      plates
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center rounded-md border border-line">
                                      <button
                                        onClick={() =>
                                          updateQuantity(item._id, Math.max(1, item.quantity - 1))
                                        }
                                        disabled={item.quantity <= 1}
                                        aria-label={`Reduce quantity of ${item.name}`}
                                        className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:bg-gray-100 disabled:opacity-35"
                                      >
                                        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                                      </button>
                                      <span className="amount w-9 text-center t-small font-semibold">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        aria-label={`Increase quantity of ${item.name}`}
                                        className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:bg-gray-100"
                                      >
                                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="inline-flex items-center gap-1.5 t-small text-ink-mute transition-colors hover:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>

            {/* ---------------- Summary ---------------- */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card overflow-hidden">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    Summary
                  </h2>
                </div>

                {/* Headcount, above the totals it changes. */}
                <div className="border-b border-line px-5 py-4">
                  <label htmlFor="guests" className="label">
                    How many guests?
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="guests"
                      type="number"
                      min="1"
                      max="100000"
                      inputMode="numeric"
                      value={guests}
                      onChange={(e) => {
                        const next = e.target.value.replace(/[^0-9]/g, "")
                        setGuests(next)
                        if (next) localStorage.setItem("guestCount", next)
                        else localStorage.removeItem("guestCount")
                      }}
                      placeholder="e.g. 200"
                      className="field w-28"
                    />
                    <p className="t-caption leading-snug text-ink-mute">
                      {headcount
                        ? `Catering is charged per plate, so this sets the food total.`
                        : `Set this and every dish is counted per head.`}
                    </p>
                  </div>
                  {overCapacity && (
                    <p role="alert" className="mt-2.5 t-caption leading-relaxed text-red-700">
                      {overCapacity.name} holds {overCapacity.capacity}. Lower the headcount or
                      choose a larger venue.
                    </p>
                  )}
                </div>

                <div className="space-y-3 px-5 py-4">
                  {GROUPS.map((group) => {
                    const items = cartItems.filter((i) => group.match(i.type))
                    if (!items.length) return null
                    const sum = items.reduce((s, i) => s + lineTotal(i), 0)
                    return (
                      <div key={group.key} className="flex items-baseline justify-between t-small">
                        <span className="text-ink-soft">
                          {group.label}
                          <span className="text-ink-mute">
                            {" · "}
                            {group.key === "catering" && headcount
                              ? `${items.length} × ${headcount}`
                              : items.length}
                          </span>
                        </span>
                        <span className="amount text-ink">{rs(sum)}</span>
                      </div>
                    )
                  })}

                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <span className="t-body font-semibold text-ink">Total</span>
                    <span className="amount t-heading font-semibold text-ink">{rs(total)}</span>
                  </div>
                  <p className="t-caption text-ink-mute">
                    Or hold your dates with {rs(Math.round(total * 0.25))} now.
                  </p>
                </div>

                <div className="border-t border-line bg-gray-50 px-5 py-4">
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || Boolean(overCapacity)}
                    className="btn btn-accent w-full py-3.5"
                  >
                    {checkingOut ? (
                      <>
                        <span className="loader h-4 w-4 border-white/40 border-t-white" />
                        Creating your order…
                      </>
                    ) : (
                      <>
                        Continue to payment
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-center t-caption text-ink-mute">
                    You choose how to pay on the next screen.
                  </p>
                </div>
              </div>

              <button onClick={() => navigate("/")} className="btn btn-quiet mt-4 w-full">
                Keep browsing
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
