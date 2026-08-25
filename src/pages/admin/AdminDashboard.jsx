import { useState, useEffect } from "react"
import AdminOrderList from "./OrderManagement"
import AdminUserList from "./UserManagement"
import AdminReviews from "./ReviewManagement"
import { getAllOrders } from "../../services/orders"
import { fetchUsers } from "../../services/users"
import { getAllReviews } from "../../services/reviews"
import { AdminPage, AdminHeading, StatGrid, Stat, rs } from "../../components/ui/Admin"

/* The dashboard used to carry its own sidebar, duplicating the nav already in
   the admin header. It is now what it actually is: a summary strip and three
   panels. */
const PANELS = [
  { id: "orders", label: "Orders", Component: AdminOrderList },
  { id: "users", label: "Customers", Component: AdminUserList },
  { id: "reviews", label: "Reviews", Component: AdminReviews },
]

/** The list endpoints disagree on shape, so unwrap once here. */
const asOrders = (r) =>
  (Array.isArray(r?.orders) && r.orders) ||
  (Array.isArray(r?.data?.orders) && r.data.orders) ||
  (Array.isArray(r) && r) ||
  []

const Admin = () => {
  const [tab, setTab] = useState("orders")
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState({ orders: true, users: true, reviews: true })
  const [failed, setFailed] = useState({ orders: false, users: false, reviews: false })

  /* Each summary loads on its own. One slow endpoint no longer blanks the
     whole dashboard — that tile just keeps its skeleton. */
  useEffect(() => {
    let live = true
    const run = async (key, fn, set) => {
      try {
        const value = await fn()
        if (live) set(value)
      } catch {
        if (live) setFailed((p) => ({ ...p, [key]: true }))
      } finally {
        if (live) setLoading((p) => ({ ...p, [key]: false }))
      }
    }

    run("orders", async () => asOrders(await getAllOrders()), setOrders)
    run("users", async () => {
      const u = await fetchUsers()
      return Array.isArray(u) ? u : []
    }, setUsers)
    run("reviews", async () => {
      const r = await getAllReviews()
      return Array.isArray(r) ? r : []
    }, setReviews)

    return () => {
      live = false
    }
  }, [])

  const revenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  const collected = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0)

  const open = orders.filter((o) => ["pending", "processing", "confirmed"].includes(o.status))

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : "—"

  const Panel = PANELS.find((p) => p.id === tab).Component

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Dashboard"
        description="Where the business stands right now, and the three lists you work from."
      />

      <div className="mt-8">
        <StatGrid>
          <Stat
            label="Revenue from completed events"
            value={rs(revenue)}
            loading={loading.orders}
            error={failed.orders}
          />
          <Stat
            label="Collected so far"
            value={rs(collected)}
            hint="Advances and full payments"
            loading={loading.orders}
            error={failed.orders}
          />
          <Stat
            label="Open orders"
            value={open.length}
            hint="Pending, processing or confirmed"
            loading={loading.orders}
            error={failed.orders}
          />
          <Stat
            label="Average rating"
            value={avgRating}
            hint={reviews.length ? `From ${reviews.length} reviews` : "No reviews yet"}
            loading={loading.reviews}
            error={failed.reviews}
          />
        </StatGrid>
      </div>

      {/* Panel switcher — the brass thread marks the open panel, same as the
          customer-side nav. */}
      <div className="mt-10 border-b border-line">
        <div role="tablist" aria-label="Dashboard panels" className="-mb-px flex gap-1">
          {PANELS.map((panel) => {
            const active = tab === panel.id
            const count =
              panel.id === "orders" ? orders.length : panel.id === "users" ? users.length : reviews.length
            const busy = loading[panel.id]
            return (
              <button
                key={panel.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(panel.id)}
                className={`relative px-4 py-3 text-[14.5px] font-medium transition-colors ${
                  active ? "text-ink" : "text-ink-mute hover:text-ink"
                }`}
              >
                {panel.label}
                {!busy && !failed[panel.id] && (
                  <span className="amount ml-2 text-[12px] text-ink-mute">{count}</span>
                )}
                {active && <span className="absolute inset-x-3 bottom-0 block h-0.5 bg-brass" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2">
        <Panel embedded />
      </div>
    </AdminPage>
  )
}

export default Admin
