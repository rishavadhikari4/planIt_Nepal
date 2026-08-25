import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import { getAllOrders, updateOrderStatus } from "../../services/orders"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  Table,
  Td,
  TableSkeleton,
  AdminEmpty,
  AdminError,
  StatusBadge,
  rs,
  formatDate,
} from "../../components/ui/Admin"

const STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"]

const PROVIDER = { khalti: "Khalti", fonepay: "Fonepay", cash: "Cash" }

/** The orders endpoint has three response shapes in the wild. Unwrap once. */
const unwrap = (r) => ({
  orders:
    (Array.isArray(r?.orders) && r.orders) ||
    (Array.isArray(r?.data?.orders) && r.data.orders) ||
    (Array.isArray(r) && r) ||
    [],
  pagination: r?.pagination || r?.data?.pagination || null,
})

/** Inline status editing: the badge is the control, so there is no separate edit mode. */
const StatusMenu = ({ order, busy, onPick }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const away = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", away)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", away)
      document.removeEventListener("keydown", esc)
    }
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => !busy && setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change status of order ${order._id.slice(-8)}`}
        className="inline-flex items-center gap-1 disabled:opacity-50"
      >
        <StatusBadge status={order.status}>
          {busy ? "Saving…" : order.status || "unknown"}
        </StatusBadge>
        <ChevronDown className="h-3.5 w-3.5 text-ink-mute" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="card absolute left-0 top-8 z-20 w-40 overflow-hidden p-1 shadow-lg"
        >
          {STATUSES.map((s) => (
            <li key={s}>
              <button
                role="option"
                aria-selected={order.status === s}
                onClick={() => {
                  setOpen(false)
                  if (s !== order.status) onPick(s)
                }}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[13px] capitalize hover:bg-gray-100 ${
                  order.status === s ? "font-semibold text-ink" : "text-ink-soft"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const AdminOrderList = ({ embedded }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [saving, setSaving] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { orders: list, pagination: p } = unwrap(await getAllOrders())
      setOrders(list)
      setPagination(p)
    } catch (err) {
      setError(err.response?.data?.message || "The order list didn't load.")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (orderId, next) => {
    setSaving(orderId)
    const previous = orders
    // Show the change straight away, then roll back if the server disagrees.
    setOrders((list) => list.map((o) => (o._id === orderId ? { ...o, status: next } : o)))
    try {
      await updateOrderStatus(orderId, next)
      toast.success(`Order marked ${next}.`)
    } catch {
      setOrders(previous)
      toast.error("The status didn't save. The order is unchanged.")
    } finally {
      setSaving(null)
    }
  }

  const term = search.trim().toLowerCase()
  const visible = orders.filter((o) => {
    if (!o) return false
    const matchesSearch =
      !term ||
      o.userId?.name?.toLowerCase().includes(term) ||
      o.userId?.email?.toLowerCase().includes(term) ||
      o._id?.toLowerCase().includes(term)
    return matchesSearch && (status === "all" || o.status?.toLowerCase() === status)
  })

  const body = (
    <>
      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search by customer, email or order ID">
        <FilterSelect value={status} onChange={setStatus} options={["all", ...STATUSES]} label="Statuses" />
      </AdminToolbar>

      {error ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <>
          <Table
            head={[
              "Order",
              "Customer",
              "Placed",
              "Status",
              "Payment",
              { label: "Total", align: "right" },
              { label: "", align: "right" },
            ]}
          >
            {loading ? (
              <TableSkeleton columns={7} />
            ) : visible.length === 0 ? (
              <tr>
                <Td colSpan={7} className="py-10 text-center text-ink-mute">
                  {orders.length === 0
                    ? "No orders have been placed yet."
                    : "No orders match that search."}
                </Td>
              </tr>
            ) : (
              visible.map((order) => (
                <tr key={order._id} className="transition-colors hover:bg-gray-50">
                  <Td>
                    <span className="amount font-semibold">
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-mute">
                      {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                    </span>
                  </Td>

                  <Td>
                    <span className="block truncate font-medium">
                      {order.userId?.name || "Unknown"}
                    </span>
                    <span className="block truncate text-[12px] text-ink-mute">
                      {order.userId?.email || "No email"}
                    </span>
                  </Td>

                  <Td className="amount whitespace-nowrap text-ink-soft">
                    {formatDate(order.createdAt)}
                  </Td>

                  <Td>
                    <StatusMenu
                      order={order}
                      busy={saving === order._id}
                      onPick={(next) => changeStatus(order._id, next)}
                    />
                  </Td>

                  <Td>
                    <StatusBadge status={order.paymentStatus} />
                    <span className="mt-0.5 block text-[12px] text-ink-mute">
                      {order.paymentProvider
                        ? PROVIDER[order.paymentProvider] || order.paymentProvider
                        : order.paymentType === "cash_after_service"
                          ? "Cash after service"
                          : "—"}
                    </span>
                  </Td>

                  <Td align="right">
                    <span className="amount font-semibold">{rs(order.totalAmount)}</span>
                    {order.paidAmount > 0 && order.paidAmount < order.totalAmount && (
                      <span className="amount mt-0.5 block text-[12px] text-ink-mute">
                        {rs(order.paidAmount)} paid
                      </span>
                    )}
                  </Td>

                  <Td align="right">
                    <button
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="text-[13px] font-medium text-pine hover:underline"
                    >
                      Open
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </Table>

          {!loading && visible.length > 0 && (
            <p className="amount mt-4 text-[12.5px] text-ink-mute">
              Showing {visible.length} of {pagination?.totalOrders || orders.length} orders
            </p>
          )}
        </>
      )}
    </>
  )

  // Rendered both as its own route and as a dashboard panel.
  if (embedded) return body

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Orders"
        description="Every booking, what has been paid, and where it stands. Change a status straight from the badge."
      />
      {body}
    </AdminPage>
  )
}

export default AdminOrderList
