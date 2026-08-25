import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, Star, XCircle } from "lucide-react"
import { toast } from "react-toastify"
import { getUserOrders, getCancellationQuote, cancelOrder } from "../../services/orders"
import RatingModal from "../ui/RatingModal"
import Sheet from "../ui/Sheet"
import { formatBoth } from "../../utils/nepaliDate"
import { img, SIZES } from "../../utils/image"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

/* Dates read in Bikram Sambat first, because that is the calendar the
   booking was made in, with the Gregorian date beside it. */
const date = (v) => (v ? formatBoth(v) : "—")

const FILTERS = ["all", "draft", "pending", "confirmed", "processing", "completed", "cancelled"]

const STATUS_TONE = {
  draft: "border-line bg-gray-100 text-ink-soft",
  pending: "border-orange-200 bg-orange-50 text-orange-800",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-purple-200 bg-purple-50 text-purple-700",
  completed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
}

const PROVIDER = { khalti: "Khalti", fonepay: "Fonepay", cash: "Cash after service" }

/* Each dated line carries its own status. A venue can fall through without
   taking the studio with it, which one word for the whole order could not
   express. */
const ITEM_TONE = {
  pending: "border-orange-200 bg-orange-50 text-orange-800",
  confirmed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
}

const REFUND_TONE = {
  due: "border-orange-200 bg-orange-50 text-orange-800",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  refunded: "border-green-200 bg-green-50 text-green-700",
}

/** What the customer still owes, said plainly. */
const paymentLine = (order) => {
  if (order.paymentStatus === "completed") return "Paid in full"
  if (order.paymentStatus === "partial")
    return `${rs(order.paidAmount)} paid · ${rs(order.remainingAmount ?? order.totalAmount - order.paidAmount)} after the event`
  if (order.paymentType === "cash_after_service") return `${rs(order.totalAmount)} on completion`
  return "Not paid yet"
}

const OrdersComponent = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(new Set())
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [rating, setRating] = useState(null) // { item, itemType }
  const [rated, setRated] = useState(new Set())
  /* { order, quote } — the quote is fetched before the dialog opens so the
     customer sees what they get back before deciding, not after. */
  const [cancelling, setCancelling] = useState(null)
  const [reason, setReason] = useState("")
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let live = true
    getUserOrders()
      .then((data) => live && setOrders(Array.isArray(data) ? data : []))
      .catch(() => live && toast.error("Your orders didn't load. Try refreshing."))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const canRate = (order, item) =>
    order.status?.toLowerCase() === "completed" && !rated.has(`${item.itemId}-${item.itemType}`)

  /* Cancelling is only possible while there is still something to cancel. */
  const canCancel = (order) =>
    !["cancelled", "completed"].includes(order.status?.toLowerCase())

  const startCancel = async (order) => {
    setCancelling({ order, quote: null })
    setReason("")
    try {
      const quote = await getCancellationQuote(order._id)
      setCancelling({ order, quote })
    } catch {
      toast.error("We couldn't work out the refund. Try again in a moment.")
      setCancelling(null)
    }
  }

  const confirmCancel = async () => {
    if (!reason.trim()) return toast.info("Tell us briefly why you're cancelling.")
    setConfirming(true)
    try {
      const result = await cancelOrder(cancelling.order._id, reason.trim())
      toast.success(result.message)
      setOrders((current) =>
        current.map((o) => (o._id === cancelling.order._id ? result.data.order : o)),
      )
      setCancelling(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "That didn't go through.")
    } finally {
      setConfirming(false)
    }
  }

  const openItem = (item) => {
    const type = item.itemType?.toLowerCase()
    if (type === "venue") return navigate(`/venues/${item.itemId}`)
    if (type === "studio") return navigate(`/studios/${item.itemId}`)
    if (type === "dish" || type === "cuisine") return navigate("/cuisines")
    toast.info("There's no page for this item.")
  }

  const term = search.trim().toLowerCase()
  const visible = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status?.toLowerCase() === filter
    const matchesSearch =
      !term ||
      order._id?.toLowerCase().includes(term) ||
      order.items?.some((i) => i.name?.toLowerCase().includes(term))
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-px overflow-hidden rounded-lg border border-line bg-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface p-5" aria-hidden>
            <span className="block h-4 w-36 animate-pulse rounded bg-gray-100" />
            <span className="mt-3 block h-3 w-52 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <h2 className="t-heading">No bookings yet</h2>
        <p className="mx-auto mt-3 max-w-[44ch] t-body leading-relaxed text-ink-soft">
          Start with a venue — it fixes your date, and the catering and studio are booked around it.
        </p>
        <button onClick={() => navigate("/venues")} className="btn btn-accent mt-8">
          Browse venues
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your orders by ID or item"
          aria-label="Search your orders"
          className="field flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by status"
          className="field w-auto cursor-pointer pr-8 capitalize"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All orders" : f}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-surface px-5 py-10 text-center t-small text-ink-mute">
          No orders match that.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((order) => {
            const isOpen = expanded.has(order._id)
            return (
              <li key={order._id} className="card overflow-hidden">
                <button
                  onClick={() => toggle(order._id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="amount t-body font-semibold text-ink">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 t-caption font-semibold capitalize ${
                          STATUS_TONE[order.status?.toLowerCase()] || STATUS_TONE.draft
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="amount mt-1.5 t-caption text-ink-mute">
                      Placed {date(order.createdAt)} · {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"}
                    </p>
                    <p className="mt-1 t-small text-ink-soft">{paymentLine(order)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="amount t-lead font-semibold text-ink">
                      {rs(order.totalAmount)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-ink-mute transition-transform ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden border-t border-line"
                    >
                      <ul className="divide-y divide-line">
                        {order.items?.map((item, i) => (
                          <li key={item._id || i} className="flex gap-4 p-5">
                            <img
                              src={img(item.image, { w: SIZES.thumb }) || "/placeholder.svg"}
                              alt=""
                              loading="lazy"
                              className="h-16 w-16 shrink-0 rounded-md border border-line object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate t-body font-semibold text-ink">
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-2 t-caption capitalize text-ink-mute">
                                    <span>
                                      {item.itemType}
                                      {item.quantity > 1 && (
                                        <>
                                          {" · "}
                                          <span className="amount">{item.quantity}</span>
                                        </>
                                      )}
                                    </span>
                                    {item.bookingStatus && (
                                      <span
                                        className={`inline-flex items-center rounded-full border px-2 py-px t-caption font-semibold ${
                                          ITEM_TONE[item.bookingStatus] || ITEM_TONE.pending
                                        }`}
                                      >
                                        {item.bookingStatus}
                                      </span>
                                    )}
                                  </p>
                                  {item.statusNote && (
                                    <p className="mt-1 t-caption leading-relaxed text-ink-soft">
                                      {item.statusNote}
                                    </p>
                                  )}
                                </div>
                                <span className="amount shrink-0 t-small font-semibold text-ink">
                                  {rs(item.price * item.quantity)}
                                </span>
                              </div>

                              {item.bookedFrom && item.bookedTill && (
                                <p className="amount mt-2 inline-flex items-center gap-1.5 t-caption text-ink-soft">
                                  <Calendar className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.75} />
                                  {date(item.bookedFrom)} — {date(item.bookedTill)}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <button
                                  onClick={() => openItem(item)}
                                  className="t-small font-medium text-crimson hover:underline"
                                >
                                  View
                                </button>
                                {canRate(order, item) && (
                                  <button
                                    onClick={() =>
                                      setRating({ item, itemType: item.itemType || "venue" })
                                    }
                                    className="inline-flex items-center gap-1.5 t-small font-medium text-brass-deep hover:underline"
                                  >
                                    <Star className="h-3.5 w-3.5" strokeWidth={2} />
                                    Rate this
                                  </button>
                                )}
                                {rated.has(`${item.itemId}-${item.itemType}`) && (
                                  <span className="t-small text-ink-mute">Rated</span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <dl className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
                        {[
                          ["Total", rs(order.totalAmount)],
                          ["Paid", order.paidAmount ? rs(order.paidAmount) : "Nothing yet"],
                          [
                            "Method",
                            order.paymentProvider
                              ? PROVIDER[order.paymentProvider] || order.paymentProvider
                              : order.paymentType === "cash_after_service"
                                ? "Cash after service"
                                : "—",
                          ],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-surface px-5 py-3.5">
                            <dt className="t-caption text-ink-mute">{label}</dt>
                            <dd className="amount mt-0.5 t-small text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      {(order.paymentTransactionId || order.stripePaymentIntentId) && (
                        <p className="border-t border-line px-5 py-3 t-caption text-ink-mute">
                          Transaction:{" "}
                          <span className="amount">
                            {order.paymentTransactionId || order.stripePaymentIntentId}
                          </span>
                        </p>
                      )}

                      {order.status === "cancelled" && (
                        <div className="border-t border-line bg-gray-50 px-5 py-4">
                          <p className="t-small text-ink-soft">
                            Cancelled {date(order.cancelledAt)}
                            {order.cancellationReason ? ` — ${order.cancellationReason}` : ""}
                          </p>
                          {order.refundStatus && order.refundStatus !== "none" && (
                            <p className="mt-2 inline-flex items-center gap-2 t-caption">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-px font-semibold capitalize ${
                                  REFUND_TONE[order.refundStatus] || REFUND_TONE.due
                                }`}
                              >
                                Refund {order.refundStatus}
                              </span>
                              {order.refundStatus === "refunded" && (
                                <span className="amount text-ink-soft">
                                  {rs(order.refundedAmount)} returned {date(order.refundedAt)}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {canCancel(order) && order.status !== "draft" && (
                        <div className="border-t border-line px-5 py-4">
                          <button
                            onClick={() => startCancel(order)}
                            className="inline-flex items-center gap-1.5 t-small font-medium text-ink-mute transition-colors hover:text-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Cancel this booking
                          </button>
                        </div>
                      )}

                      {order.status === "draft" && (
                        <div className="border-t border-line bg-gray-50 px-5 py-4">
                          <p className="t-small text-ink-soft">
                            This order isn&rsquo;t confirmed yet — choose how to pay to hold your
                            dates.
                          </p>
                          <button
                            onClick={() => navigate(`/payment/${order._id}`)}
                            className="btn btn-accent mt-3"
                          >
                            Complete payment
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      )}

      {/* Cancelling names the money before it asks for the decision. */}
      <Sheet
        open={Boolean(cancelling)}
        onClose={() => !confirming && setCancelling(null)}
        title="Cancel this booking"
        heading="Cancel this booking"
        description={cancelling ? `Order #${cancelling.order._id.slice(-8).toUpperCase()}` : ""}
        width="max-w-md"
      >
        <div className="p-6">
          {!cancelling?.quote ? (
            <div className="flex items-center gap-3 py-6 text-ink-mute">
              <span className="loader" />
              <span className="t-small">Working out your refund…</span>
            </div>
          ) : (
            <>
              <dl className="divide-y divide-line border-y border-line">
                <div className="flex items-baseline justify-between py-3">
                  <dt className="t-small text-ink-soft">You have paid</dt>
                  <dd className="amount t-body text-ink">{rs(cancelling.quote.paidAmount)}</dd>
                </div>
                <div className="flex items-baseline justify-between py-3">
                  <dt className="t-small text-ink-soft">Comes back to you</dt>
                  <dd className="amount t-heading font-semibold text-ink">
                    {rs(cancelling.quote.refundAmount)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 t-caption leading-relaxed text-ink-mute">
                {cancelling.quote.policy}
                {cancelling.quote.eventDate
                  ? ` Your event is on ${date(cancelling.quote.eventDate)}.`
                  : ""}
              </p>

              <label htmlFor="cancel-reason" className="label mt-6">
                Why are you cancelling?
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="The date moved, the guest list changed…"
                className="field resize-none"
              />

              <div className="mt-7 flex justify-end gap-2">
                <button
                  onClick={() => setCancelling(null)}
                  disabled={confirming}
                  className="btn btn-ghost"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={confirming}
                  className="btn border-red-600 bg-red-600 text-white hover:bg-red-700"
                >
                  {confirming ? (
                    <>
                      <span className="loader h-4 w-4 border-white/40 border-t-white" />
                      Cancelling…
                    </>
                  ) : (
                    "Cancel booking"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Sheet>

      <RatingModal
        isOpen={Boolean(rating)}
        onClose={() => setRating(null)}
        item={rating?.item}
        itemType={rating?.itemType}
        onRatingSubmitted={(itemId) => {
          setRated((prev) => new Set([...prev, `${itemId}-${rating.itemType}`]))
          setRating(null)
        }}
      />
    </div>
  )
}

export default OrdersComponent
