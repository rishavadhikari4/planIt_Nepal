import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar } from "lucide-react"
import { toast } from "react-toastify"
import { getOrderById, updateOrderStatus } from "../../services/orders"
import {
  AdminPage,
  BackLink,
  AdminHeading,
  DetailCard,
  DetailRows,
  StatusBadge,
  AdminLoading,
  AdminError,
  rs,
  formatDate,
  formatDateTime,
} from "../../components/ui/Admin"

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
                      src={item.image || "/placeholder.svg"}
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
    </AdminPage>
  )
}

export default OrderDetails
