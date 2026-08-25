import { useState, useContext, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"
import { CartContext } from "../../context/CartContext"
import { startPayment, getPaymentMethods } from "../../services/payments"
import { getOrderById } from "../../services/orders"
import PaymentMark from "../../components/ui/PaymentMark"

/* Two decisions, kept apart: how much you are paying now, and what you are
   paying with. The old screen fired the payment the instant you touched an
   option — here nothing leaves until you press the one button that names the
   exact amount. */

const GATEWAYS = [
  {
    id: "khalti",
    name: "Khalti",
    detail: "Khalti wallet, mobile banking, connectIPS or a card.",
  },
  {
    id: "fonepay",
    name: "Fonepay",
    detail: "Straight from your bank account over the Fonepay network.",
  },
]

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

function PaymentSelection() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  const [order, setOrder] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [methods, setMethods] = useState({ khalti: true, fonepay: true, cash: true })
  const [amountChoice, setAmountChoice] = useState("full")
  const [gateway, setGateway] = useState("khalti")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const [fetched, available] = await Promise.all([
          getOrderById(orderId),
          getPaymentMethods().catch(() => null),
        ])
        if (!live) return
        if (!fetched) throw new Error("Order not found")
        setOrder(fetched)
        if (available) {
          setMethods(available)
          // Default to a gateway this deployment can actually reach.
          setGateway(available.khalti ? "khalti" : available.fonepay ? "fonepay" : "khalti")
        }
      } catch {
        if (live) toast.error("We couldn't load this order. Open it again from your cart.")
      } finally {
        if (live) setLoadingOrder(false)
      }
    })()
    return () => {
      live = false
    }
  }, [orderId])

  const total = order?.totalAmount || 0
  const advance = Math.round(total * 0.25)
  const dueNow = amountChoice === "full" ? total : amountChoice === "advance" ? advance : 0

  const OPTIONS = [
    {
      id: "full",
      title: "Pay in full",
      detail: "Settle the whole order now. Nothing is owed on the day.",
      due: total,
      note: "Nothing left to pay",
    },
    {
      id: "advance",
      title: "Pay 25% now",
      detail: "Holds your dates. The rest is collected after the event.",
      due: advance,
      note: `${rs(total - advance)} after the event`,
    },
    {
      id: "cash",
      title: "Cash after service",
      detail: "Confirm the booking now, hand over payment once it's done.",
      due: 0,
      note: `${rs(total)} on completion`,
    },
  ].filter((o) => o.id !== "cash" || methods.cash)

  const handleConfirm = async () => {
    if (!user) {
      toast.info("Log in to complete this payment.")
      return navigate("/login")
    }

    setSubmitting(true)
    try {
      if (amountChoice === "cash") {
        const res = await startPayment(orderId, "cash")
        if (!res.success) throw new Error(res.message)
        clearCart()
        toast.success("Order confirmed. We'll collect payment after the event.")
        return navigate("/order-success", {
          state: {
            orderData: { orderId: res.order._id, order: res.order, paymentType: "cash_after_service" },
          },
        })
      }

      const paymentAmount = amountChoice === "full" ? "full_payment" : "25_percent"
      const res = await startPayment(orderId, gateway, paymentAmount)
      if (!res.success || !res.redirectUrl) throw new Error(res.message || "Payment could not be started")

      // The callback page needs to know which order and gateway it is confirming.
      sessionStorage.setItem("pendingPayment", JSON.stringify({ orderId, provider: gateway }))
      clearCart()
      window.location.href = res.redirectUrl
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "The payment couldn't be started. Try again.",
      )
      setSubmitting(false)
    }
  }

  if (loadingOrder) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ink-mute">
          <span className="loader" />
          <span className="t-small">Loading your order…</span>
        </div>
      </div>
    )
  }

  const gatewayNeeded = amountChoice !== "cash"
  const chosenGateway = GATEWAYS.find((g) => g.id === gateway)

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <button onClick={() => navigate("/cart")} className="btn btn-quiet -ml-2.5 mb-8">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to cart
        </button>

        <p className="eyebrow">Checkout</p>
        <h1 className="mt-5 t-display">How would you like to pay?</h1>
        <p className="mt-4 max-w-[52ch] t-body leading-relaxed text-ink-soft">
          Your order is held as a draft until this is done. Nothing is charged until you press
          confirm.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* ---------------- Decisions ---------------- */}
          <div>
            {/* Step 1 — amount */}
            <section>
              <h2 className="flex items-center gap-3 font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
                <span className="thread" />
                Step 1 · How much now
              </h2>

              <div
                role="radiogroup"
                aria-label="How much to pay now"
                className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line"
              >
                {OPTIONS.map((option) => {
                  const selected = amountChoice === option.id
                  return (
                    <button
                      key={option.id}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAmountChoice(option.id)}
                      disabled={submitting}
                      className={`flex items-start gap-4 p-5 text-left transition-colors disabled:opacity-60 ${
                        selected ? "bg-crimson-50" : "bg-surface hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? "border-crimson bg-crimson" : "border-line-strong"
                        }`}
                      >
                        {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block t-body font-semibold text-ink">{option.title}</span>
                        <span className="mt-1 block t-small leading-relaxed text-ink-soft">
                          {option.detail}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="amount block t-lead font-semibold text-ink">
                          {option.due ? rs(option.due) : "Rs 0"}
                        </span>
                        <span className="mt-0.5 block t-caption text-ink-mute">{option.note}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Step 2 — gateway */}
            {gatewayNeeded && (
              <section className="mt-10">
                <h2 className="flex items-center gap-3 font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  <span className="thread" />
                  Step 2 · What you're paying with
                </h2>

                <div
                  role="radiogroup"
                  aria-label="Payment method"
                  className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2"
                >
                  {GATEWAYS.map((g) => {
                    const available = methods[g.id]
                    const selected = gateway === g.id && available
                    return (
                      <button
                        key={g.id}
                        role="radio"
                        aria-checked={selected}
                        disabled={!available || submitting}
                        onClick={() => setGateway(g.id)}
                        className={`flex flex-col items-start p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          selected ? "bg-crimson-50" : "bg-surface hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex w-full items-center gap-3">
                          {/* You are about to be handed to this company, so
                              you should recognise it before you press pay. */}
                          <PaymentMark id={g.id} />
                          {selected && (
                            <Check className="ml-auto h-4 w-4 text-crimson" strokeWidth={2.5} />
                          )}
                        </span>
                        <span className="mt-3 t-small leading-relaxed text-ink-soft">
                          {available ? g.detail : "Not available right now."}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Confirm */}
            <div className="mt-10 border-t border-line pt-8">
              <button
                onClick={handleConfirm}
                disabled={submitting || (gatewayNeeded && !methods[gateway])}
                className="btn btn-accent h-13 w-full py-4 t-body"
              >
                {submitting ? (
                  <>
                    <span className="loader h-4 w-4 border-white/40 border-t-white" />
                    {amountChoice === "cash" ? "Confirming your order…" : `Opening ${chosenGateway?.name}…`}
                  </>
                ) : amountChoice === "cash" ? (
                  <>
                    Confirm order, pay later
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </>
                ) : (
                  <>
                    Pay {rs(dueNow)} with {chosenGateway?.name}
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>

              <p className="mt-4 flex items-start gap-2 t-caption leading-relaxed text-ink-mute">
                <ShieldCheck className="mt-px h-4 w-4 shrink-0" strokeWidth={1.75} />
                {gatewayNeeded
                  ? `You'll finish on ${chosenGateway?.name}'s own secure page and come straight back here. We never see or store your wallet, bank or card details.`
                  : "Your booking is confirmed straight away. Our team calls to arrange collection after the event."}
              </p>
            </div>
          </div>

          {/* ---------------- Order slip ---------------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                <h2 className="font-mono t-caption font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  Order
                </h2>
                <span className="amount t-caption text-ink-mute">
                  #{orderId?.slice(-8).toUpperCase()}
                </span>
              </div>

              <ul className="divide-y divide-line">
                {order?.items?.map((item, i) => (
                  <li key={item._id || i} className="flex items-baseline gap-3 px-5 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate t-small text-ink">{item.name}</span>
                      <span className="block t-caption capitalize text-ink-mute">
                        {item.itemType}
                        {item.quantity > 1 && ` · ${item.quantity}`}
                      </span>
                    </span>
                    <span className="amount shrink-0 t-small text-ink-soft">
                      {rs(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2.5 border-t border-line px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="t-small text-ink-soft">Order total</span>
                  <span className="amount t-body text-ink">{rs(total)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                  <span className="t-body font-semibold text-ink">Due now</span>
                  <span className="amount t-heading font-semibold text-crimson">{rs(dueNow)}</span>
                </div>
                {dueNow !== total && (
                  <p className="t-caption text-ink-mute">
                    {rs(total - dueNow)} is collected after the event.
                  </p>
                )}
              </div>
            </div>

            <p className="mt-5 t-caption leading-relaxed text-ink-mute">
              A receipt and the full booking details go to your email as soon as this is confirmed.
              You can track the order any time from your profile.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default PaymentSelection
