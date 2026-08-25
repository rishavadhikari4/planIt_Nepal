import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { fetchUsers, deleteUser } from "../../services/users"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  Table,
  Td,
  TableSkeleton,
  AdminError,
  StatusBadge,
  ConfirmDialog,
  formatDate,
} from "../../components/ui/Admin"

const FILTERS = [
  { value: "all", label: "All customers" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "new", label: "Joined this month" },
]

const joinedThisMonth = (user) => {
  if (!user.createdAt) return false
  const joined = new Date(user.createdAt)
  const now = new Date()
  return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear()
}

const AdminUserList = ({ embedded }) => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setError("The customer list didn't load.")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(pendingDelete._id)
      setUsers((list) => list.filter((u) => u._id !== pendingDelete._id))
      toast.success(`${pendingDelete.name || "The account"} was deleted.`)
      setPendingDelete(null)
    } catch {
      toast.error("The account couldn't be deleted.")
    } finally {
      setDeleting(false)
    }
  }

  const term = search.trim().toLowerCase()
  const visible = users.filter((u) => {
    const matchesSearch =
      !term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && u.isActive !== false) ||
      (filter === "inactive" && u.isActive === false) ||
      (filter === "new" && joinedThisMonth(u))
    return matchesSearch && matchesFilter
  })

  const body = (
    <>
      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search by name or email">
        <FilterSelect value={filter} onChange={setFilter} options={FILTERS} label="Customers" />
      </AdminToolbar>

      {error ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <>
          <Table
            head={["Customer", "Email", "Joined", "Status", { label: "", align: "right" }]}
          >
            {loading ? (
              <TableSkeleton columns={5} />
            ) : visible.length === 0 ? (
              <tr>
                <Td colSpan={5} className="py-10 text-center text-ink-mute">
                  {users.length === 0
                    ? "No customers have signed up yet."
                    : "No customers match that search."}
                </Td>
              </tr>
            ) : (
              visible.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-gray-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gray-100 t-caption font-semibold text-ink-soft">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (user.name || "?").charAt(0).toUpperCase()
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{user.name || "Unnamed"}</span>
                        {user.number && (
                          <span className="amount block t-caption text-ink-mute">{user.number}</span>
                        )}
                      </span>
                    </div>
                  </Td>

                  <Td className="amount max-w-[220px] truncate text-ink-soft">{user.email}</Td>

                  <Td className="amount whitespace-nowrap text-ink-soft">
                    {formatDate(user.createdAt)}
                  </Td>

                  <Td>
                    <StatusBadge status={user.isActive === false ? "blocked" : "active"}>
                      {user.isActive === false ? "Inactive" : "Active"}
                    </StatusBadge>
                  </Td>

                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/admin/users/inspect/${user._id}`)}
                        className="t-small font-medium text-crimson hover:underline"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setPendingDelete(user)}
                        className="t-small font-medium text-ink-mute hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </Table>

          {!loading && visible.length > 0 && (
            <p className="amount mt-4 t-caption text-ink-mute">
              Showing {visible.length} of {users.length} customers
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this account?"
        body={`${pendingDelete?.name || "This account"} (${pendingDelete?.email || "no email"}) will be removed permanently, along with their access to any orders they placed. This cannot be undone.`}
        confirmLabel="Delete account"
      />
    </>
  )

  if (embedded) return body

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Customers"
        description="Everyone with an account. Open a customer to see their orders and activity."
      />
      {body}
    </AdminPage>
  )
}

export default AdminUserList
