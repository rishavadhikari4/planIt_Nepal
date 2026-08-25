import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Undo2 } from "lucide-react"
import { toast } from "react-toastify"
import {
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  settleRefund,
} from "../../services/orders"
import {
  AdminPage,
  BackLink,
  AdminHeading,
  DetailCard,
  DetailRows,
  StatusBadge,
  AdminLoading,
  AdminError,
  Modal,
  rs,
  formatDate,
  formatDateTime,
} from "../../components/ui/Admin"
import { img, SIZES } from "../../utils/image"

const STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"]

const PROVIDER = { khalti: "Khalti", fonepay: "Fonepay", cash: "Cash after service" }

const PAYMENT_TYPE = {
  cash_after_service: "Cash after service",
  advance_payment: "Advance payment",
}

/** The order endpoint nests its payload three different ways. */
const unwrap = (r) => r?.order || r?.data?.order || r || null

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [movingItem, setMovingItem] = useState(null)
  const [refunding, setRefunding] = useState(false)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReference, setRefundReference] = useState("")
  const [settling, setSettling] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const found = unwrap(await getOrderById(orderId))
      if (!found?._id) throw new Error("Order not found")
      setOrder(found)
    } catch (err) {
      setError(err.response?.data?.message || "This order didn't load.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const changeStatus = async (next) => {
    setSaving(true)
    const previous = order.status
    setOrder((o) => ({ ...o, status: next }))
    try {
      await updateOrderStatus(order._id, next)
      toast.success(`Order marked ${next}.`)
    } catch {
      setOrder((o) => ({ ...o, status: previous }))
      toast.error("The status didn't save. The order is unchanged.")
    } finally {
      setSaving(false)
    }
  }

  /* One line at a time. The order-wide status could never say that the venue
     was confirmed while the studio fell through. */
  const changeItemStatus = async (item, bookingStatus) => {
    setMovingItem(item._id)
    try {
      const result = await updateOrderItemStatus(order._id, item._id, bookingStatus)
      setOrder(result.data.order)
      toast.success(result.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "That didn't save.")
    } finally {
      setMovingItem(null)
    }
  }

  const recordRefund = async () => {
    setSettling(true)
    try {
      const result = await settleRefund(order._id, {
        amount: refundAmount === "" ? undefined : Number(refundAmount),
        reference: refundReference,
      })
      setOrder(result.data.order)
      toast.success("Refund recorded.")
      setRefunding(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "The refund didn't save.")
    } finally {
      setSettling(false)
    }
  }

  if (loading) return <AdminLoading label="Loading the order…" />

  if (error || !order) {
    return (
      <AdminPage>
        <BackLink to="/admin-orders">Back to orders</BackLink>
        <AdminError message={error || "This order no longer exists."} onRetry={load} />
      </AdminPage>
    )
  }

  const customerId = order.userId?._id || order.userId?.id || order.userId
  const paid = order.paidAmount || 0
  const outstanding = order.totalAmount - paid
  const bookings = (order.items || []).filter((i) => i.bookedFrom && i.bookedTill)

  return (
    <AdminPage>
      <BackLink to="/admin-orders">Back to orders</BackLink>

      <AdminHeading
        eyebrow="Order"
        title={`#${order._id?.slice(-8).toUpperCase()}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
      >
        <label htmlFor="order-status" className="sr-only">
          Order status
        </label>
        <select
          id="order-status"
          value={order.status}
          disabled={saving}
          onChange={(e) => changeStatus(e.target.value)}
          className="field w-auto cursor-pointer pr-8 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {saving && <span className="loader" />}
      </AdminHeading>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ---------------- What was booked ---------------- */}
        <div className="space-y-6">
          <DetailCard title={`Items · ${order.items?.length || 0}`}>
            {order.items?.length ? (
              <ul className="divide-y divide-line">
                {order.items.map((item, i) => (
                  <li key={item._id || i} className="flex gap-4 px-5 py-4">
                    <img
                      src={img(item.image, { w: SIZES.thumb }) || "/placeholder.svg"}
                      alt=""
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-md border border-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate t-body font-semibold text-ink">{item.name}</p>
                          <p className="mt-0.5 t-caption capitalize text-ink-mute">
                            {item.itemType}
                            {item.quantity > 1 && (
                              <>
                                {" · "}
                                <span className="amount">{item.quantity}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <span className="amount shrink-0 t-small font-semibold text-ink">
                          {rs(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {item.bookingStatus && <StatusBadge status={item.bookingStatus} />}
                        {item.bookedFrom && item.bookedTill && (
                          <span className="amount inline-flex items-center gap-1.5 t-caption text-ink-soft">
                            <Calendar className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.75} />
                            {formatDate(item.bookedFrom)} — {formatDate(item.bookedTill)}
                          </span>
                        )}
                      </div>

                      {item.statusNote && (
                        <p className="mt-1.5 t-caption leading-relaxed text-ink-soft">
                          {item.statusNote}
                        </p>
                      )}

                      {/* Only dated lines have a booking status; a dish is
                          not held against a day. */}
                      {item.bookingStatus && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {["pending", "confirmed", "cancelled"].map((next) => (
                            <button
                              key={next}
                              onClick={() => changeItemStatus(item, next)}
                              disabled={movingItem === item._id || item.bookingStatus === next}
                              className={`rounded-full border px-2.5 py-1 t-caption font-semibold capitalize transition-colors active:scale-95 disabled:cursor-not-allowed ${
                                item.bookingStatus === next
                                  ? "border-crimson bg-crimson-50 text-crimson opacity-100"
                                  : "border-line text-ink-mute hover:border-ink-mute hover:text-ink"
                              }`}
                            >
                              {next}
                            </button>
                          ))}
                          {movingItem === item._id && <span className="loader h-3.5 w-3.5" />}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 t-small text-ink-mute">This order has no items.</p>
            )}
          </DetailCard>

          {bookings.length > 0 && (
            <DetailCard title="Dates held">
              <ul className="divide-y divide-line">
                {bookings.map((item, i) => (
                  <li
                    key={item._id || i}
                    className="flex items-baseline justify-between gap-4 px-5 py-3"
                  >
                    <span className="min-w-0 truncate t-small text-ink">
                      {item.name}
                      <span className="capitalize text-ink-mute"> · {item.itemType}</span>
                    </span>
                    <span className="amount shrink-0 t-small text-ink-soft">
                      {formatDate(item.bookedFrom)} — {formatDate(item.bookedTill)}
                    </span>
                  </li>
                ))}
              </ul>
            </DetailCard>
          )}
        </div>

        {/* ---------------- Money and customer ---------------- */}
        <div className="space-y-6">
          <DetailCard title="Payment">
            <DetailRows
              rows={[
                ["Order total", rs(order.totalAmount), true],
                ["Paid", paid ? rs(paid) : "Nothing yet", true],
                [
                  "Outstanding",
                  outstanding > 0 ? rs(outstanding) : "Nothing owed",
                  true,
                ],
                ["Status", <StatusBadge key="s" status={order.paymentStatus} />],
                [
                  "Method",
                  order.paymentProvider
                    ? PROVIDER[order.paymentProvider] || order.paymentProvider
                    : PAYMENT_TYPE[order.paymentType] || "—",
                ],
                order.paidAt && ["Paid on", formatDateTime(order.paidAt), true],
                (order.paymentTransactionId || order.stripePaymentIntentId) && [
                  "Transaction",
                  order.paymentTransactionId || order.stripePaymentIntentId,
                  true,
                ],
              ]}
            />
          </DetailCard>

          {/* Refunds. Neither Khalti nor Fonepay refunds over their public API,
              so cancelling records what is owed and this is where a human
              says the money has actually gone back. */}
          {order.refundStatus && order.refundStatus !== "none" && (
            <DetailCard
              title="Refund"
              action={
                order.refundStatus !== "refunded" && (
                  <button
                    onClick={() => {
                      setRefundAmount("")
                      setRefundReference("")
                      setRefunding(true)
                    }}
                    className="t-small font-medium text-crimson hover:underline"
                  >
                    Record payout
                  </button>
                )
              }
            >
              <DetailRows
                rows={[
                  ["Status", <StatusBadge key="r" status={order.refundStatus} />],
                  order.refundedAmount > 0 && ["Returned", rs(order.refundedAmount), true],
                  order.refundedAt && ["Paid back", formatDateTime(order.refundedAt), true],
                  order.refundReference && ["Reference", order.refundReference, true],
                ]}
              />
            </DetailCard>
          )}

          {order.status === "cancelled" && (
            <DetailCard title="Cancellation">
              <DetailRows
                rows={[
                  order.cancelledAt && ["Cancelled", formatDateTime(order.cancelledAt), true],
                  order.cancelledBy && ["By", order.cancelledBy],
                  order.cancellationReason && ["Reason", order.cancellationReason],
                ]}
              />
            </DetailCard>
          )}

          <DetailCard
            title="Customer"
            action={
              customerId && (
                <button
                  onClick={() => navigate(`/admin/users/inspect/${customerId}`)}
                  className="t-small font-medium text-crimson hover:underline"
                >
                  Inspect
                </button>
              )
            }
          >
            <DetailRows
              rows={[
                ["Name", order.userId?.name || "Unknown"],
                ["Email", order.userId?.email || "—", true],
                order.userId?.number && ["Phone", order.userId.number, true],
              ]}
            />
            {order.userId?.email && (
              <div className="border-t border-line px-5 py-3">
                <a
                  href={`mailto:${order.userId.email}?subject=${encodeURIComponent(
                    `Your PlanIt Nepal order #${order._id.slice(-8).toUpperCase()}`,
                  )}`}
                  className="t-small font-medium text-crimson no-underline hover:underline"
                >
                  Email this customer
                </a>
              </div>
            )}
          </DetailCard>
        </div>
      </div>
      <Modal
        open={refunding}
        onClose={() => !settling && setRefunding(false)}
        title="Record a refund"
        description={`Order #${order._id?.slice(-8).toUpperCase()} · ${rs(paid)} was taken`}
        width="max-w-md"
      >
        <p className="t-body leading-relaxed text-ink-soft">
          This records money you have already sent back. It does not move any funds — the gateways
          do not refund over their API, so the transfer happens outside this system.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="refund-amount" className="label">
              Amount returned
            </label>
            <input
              id="refund-amount"
              type="number"
              min="0"
              max={paid}
              inputMode="numeric"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="Leave blank for the full policy amount"
              className="field amount"
            />
          </div>
          <div>
            <label htmlFor="refund-ref" className="label">
              Reference <span className="font-normal text-ink-mute">(optional)</span>
            </label>
            <input
              id="refund-ref"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
              placeholder="Bank transfer ID, cheque number…"
              className="field"
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button onClick={() => setRefunding(false)} disabled={settling} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={recordRefund} disabled={settling} className="btn btn-accent">
            {settling ? (
              <>
                <span className="loader h-4 w-4 border-white/40 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                <Undo2 className="h-4 w-4" strokeWidth={2} />
                Record refund
              </>
            )}
          </button>
        </div>
      </Modal>
    </AdminPage>
  )
}

export default OrderDetails
