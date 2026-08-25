import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Minus, Plus, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../context/CartContext"
import { createOrder } from "../../services/orders"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

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
  const navigate = useNavigate()

  useEffect(() => {
    // fetchCartItems reads straight from context today, but wrapping it keeps
    // this correct if it ever starts returning a promise.
    Promise.resolve(fetchCartItems()).finally(() => setLoading(false))
  }, [])

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

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

      const { order } = await createOrder(items)
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
                                src={item.image || "/placeholder.svg"}
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
                                    {rs(item.price * item.quantity)}
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

                <div className="space-y-3 px-5 py-4">
                  {GROUPS.map((group) => {
                    const items = cartItems.filter((i) => group.match(i.type))
                    if (!items.length) return null
                    const sum = items.reduce((s, i) => s + i.price * i.quantity, 0)
                    return (
                      <div key={group.key} className="flex items-baseline justify-between t-small">
                        <span className="text-ink-soft">
                          {group.label}
                          <span className="text-ink-mute"> · {items.length}</span>
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
                    disabled={checkingOut}
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
