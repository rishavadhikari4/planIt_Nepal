import { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Check, Mail, Phone } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const PAYMENT_LABEL = {
  cash_after_service: "Cash after service",
  advance_payment: "Advance payment",
  full_payment: "Paid in full",
}

const PROVIDER_LABEL = { khalti: "Khalti", fonepay: "Fonepay", cash: "Cash" }

function OrderSuccess() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { user } = useContext(AuthContext)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (state?.orderData) setData(state.orderData)
  }, [state])

  const order = data?.order
  const orderId = data?.orderId || order?._id
  const paid = order?.paidAmount || 0
  const remaining = order?.remainingAmount ?? (order ? order.totalAmount - paid : 0)
  const cash = order?.paymentType === "cash_after_service"

  const goToOrders = () => {
    const id = user?._id || user?.id
    navigate(id ? `/user-profile/${id}` : "/")
  }

  /* What actually happens next depends on how they paid. Saying "we'll call
     you" to someone who owes nothing is noise; saying nothing to someone who
     owes Rs 90,000 on the day is worse. */
  const next = cash
    ? [
        ["Confirmation email", "Your booking details are on the way to your inbox."],
        ["We call to confirm", "A planner rings within 24 hours to run through the details."],
        ["Pay on completion", `${rs(order?.totalAmount)} is collected once the event is done.`],
      ]
    : remaining > 0
      ? [
          ["Receipt emailed", "Your payment receipt and booking details are on the way."],
          ["Dates are held", "Your venue and studio dates are locked in against this order."],
          ["Balance after the event", `${rs(remaining)} is collected once the event is done.`],
        ]
      : [
          ["Receipt emailed", "Your payment receipt and booking details are on the way."],
          ["Dates are held", "Your venue and studio dates are locked in against this order."],
          ["Nothing left to pay", "The order is settled in full."],
        ]

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson">
            <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>

          <h1 className="mt-7 text-[36px] sm:text-[44px]">
            {cash ? "Your booking is confirmed." : "Payment received."}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-soft">
            {cash
              ? "Everything on this order is held for you. We collect payment once the event is over."
              : remaining > 0
                ? "Your dates are held. The balance is collected after the event."
                : "Everything is settled — nothing more to pay."}
          </p>
        </motion.div>

        {/* ---------------- The receipt ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="card mt-12 overflow-hidden"
        >
          <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
              Receipt
            </h2>
            <span className="amount text-[12px] text-ink-mute">
              {orderId ? `#${orderId.slice(-8).toUpperCase()}` : "—"}
            </span>
          </div>

          <dl className="divide-y divide-line">
            {[
              ["Order total", rs(order?.totalAmount)],
              [
                "Paid",
                cash ? "Nothing yet" : rs(paid),
              ],
              [
                cash ? "Due after the event" : "Remaining",
                cash ? rs(order?.totalAmount) : remaining > 0 ? rs(remaining) : "Rs 0",
              ],
              [
                "Method",
                data?.provider
                  ? PROVIDER_LABEL[data.provider] || data.provider
                  : PAYMENT_LABEL[order?.paymentType] || "—",
              ],
              [
                "Date",
                new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              ],
              ...(order?.paymentTransactionId
                ? [["Transaction", order.paymentTransactionId]]
                : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                <dt className="text-[14px] text-ink-soft">{label}</dt>
                <dd className="amount truncate text-[14.5px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {order?.items?.length > 0 && (
            <div className="border-t border-line px-5 py-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Booked
              </p>
              <ul className="mt-3 space-y-1.5">
                {order.items.map((item, i) => (
                  <li
                    key={item._id || i}
                    className="flex items-baseline justify-between gap-4 text-[14px]"
                  >
                    <span className="truncate text-ink">
                      {item.name}
                      <span className="text-ink-mute"> · {item.itemType}</span>
                    </span>
                    <span className="amount shrink-0 text-ink-soft">
                      {rs(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* ---------------- What happens next ---------------- */}
        <section className="mt-12">
          <h2 className="eyebrow">What happens next</h2>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {next.map(([title, body], i) => (
              <li key={title} className="flex gap-4 py-4">
                <span className="amount w-6 shrink-0 pt-0.5 text-[12px] font-semibold text-brass-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink">{title}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={goToOrders} className="btn btn-accent">
            View this order
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button onClick={() => navigate("/")} className="btn btn-ghost">
            Back to home
          </button>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-[13.5px]">
          <span className="text-ink-mute">Something wrong with this order?</span>
          <a
            href="mailto:contact@planitnepal.com"
            className="inline-flex items-center gap-1.5 text-crimson no-underline hover:underline"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
            contact@planitnepal.com
          </a>
          <a
            href="tel:+9779876543345"
            className="inline-flex items-center gap-1.5 text-crimson no-underline hover:underline"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
            +977 987 654 3345
          </a>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
