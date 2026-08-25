import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, Star } from "lucide-react"
import { toast } from "react-toastify"
import { getUserOrders } from "../../services/orders"
import RatingModal from "../ui/RatingModal"

const rs = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`

const date = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

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
        <h2 className="text-[22px]">No bookings yet</h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
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
        <p className="mt-8 rounded-lg border border-line bg-surface px-5 py-10 text-center text-[14px] text-ink-mute">
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
                      <span className="amount text-[15px] font-semibold text-ink">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold capitalize ${
                          STATUS_TONE[order.status?.toLowerCase()] || STATUS_TONE.draft
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="amount mt-1.5 text-[12.5px] text-ink-mute">
                      Placed {date(order.createdAt)} · {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-soft">{paymentLine(order)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="amount text-[17px] font-semibold text-ink">
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
                              src={item.image || "/placeholder.svg"}
                              alt=""
                              loading="lazy"
                              className="h-16 w-16 shrink-0 rounded-md border border-line object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate text-[14.5px] font-semibold text-ink">
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 text-[12.5px] capitalize text-ink-mute">
                                    {item.itemType}
                                    {item.quantity > 1 && (
                                      <>
                                        {" · "}
                                        <span className="amount">{item.quantity}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                                <span className="amount shrink-0 text-[14px] font-semibold text-ink">
                                  {rs(item.price * item.quantity)}
                                </span>
                              </div>

                              {item.bookedFrom && item.bookedTill && (
                                <p className="amount mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                                  <Calendar className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.75} />
                                  {date(item.bookedFrom)} — {date(item.bookedTill)}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <button
                                  onClick={() => openItem(item)}
                                  className="text-[13px] font-medium text-pine hover:underline"
                                >
                                  View
                                </button>
                                {canRate(order, item) && (
                                  <button
                                    onClick={() =>
                                      setRating({ item, itemType: item.itemType || "venue" })
                                    }
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-marigold-deep hover:underline"
                                  >
                                    <Star className="h-3.5 w-3.5" strokeWidth={2} />
                                    Rate this
                                  </button>
                                )}
                                {rated.has(`${item.itemId}-${item.itemType}`) && (
                                  <span className="text-[13px] text-ink-mute">Rated</span>
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
                            <dt className="text-[12px] text-ink-mute">{label}</dt>
                            <dd className="amount mt-0.5 text-[14px] text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      {(order.paymentTransactionId || order.stripePaymentIntentId) && (
                        <p className="border-t border-line px-5 py-3 text-[12px] text-ink-mute">
                          Transaction:{" "}
                          <span className="amount">
                            {order.paymentTransactionId || order.stripePaymentIntentId}
                          </span>
                        </p>
                      )}

                      {order.status === "draft" && (
                        <div className="border-t border-line bg-gray-50 px-5 py-4">
                          <p className="text-[13.5px] text-ink-soft">
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
