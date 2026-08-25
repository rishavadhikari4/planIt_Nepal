import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getContacts, deleteContactById } from "../../services/contact"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  StatusBadge,
  Table,
  Td,
  TableSkeleton,
  AdminEmpty,
  AdminError,
  ConfirmDialog,
  formatDate,
} from "../../components/ui/Admin"
import { Pagination } from "../../components/ui/Catalog"

const SUBJECTS = [
  { value: "", label: "All enquiries" },
  { value: "wedding-planning", label: "Wedding" },
  { value: "corporate-event", label: "Corporate event" },
  { value: "birthday-party", label: "Birthday" },
  { value: "anniversary-celebration", label: "Anniversary" },
  { value: "graduation-party", label: "Graduation" },
  { value: "baby-shower", label: "Baby shower / Pasni" },
  { value: "conference-seminar", label: "Conference or seminar" },
  { value: "photography-inquiry", label: "Photography only" },
  { value: "catering-inquiry", label: "Catering only" },
  { value: "venue-rental", label: "Venue only" },
  { value: "pricing-inquiry", label: "Pricing" },
  { value: "others", label: "Something else" },
]

/* The queue states, and what each is called on screen. */
const STATUS_FILTERS = [
  { value: "", label: "Any status" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "Working on it" },
  { value: "answered", label: "Answered" },
  { value: "closed", label: "Closed" },
]

const STATUS_LABELS = {
  new: "New",
  in_progress: "Working on it",
  answered: "Answered",
  closed: "Closed",
}

const subjectLabel = (value) =>
  SUBJECTS.find((s) => s.value === value)?.label || value || "Not specified"

/** Budgets arrive as "50000-100000" or "1000000+". */
const budgetLabel = (value) => {
  if (!value) return "—"
  const fmt = (n) => Number(n).toLocaleString("en-IN")
  if (value.endsWith("+")) return `Over Rs ${fmt(value.slice(0, -1))}`
  const [min, max] = value.split("-")
  return max ? `Rs ${fmt(min)} – ${fmt(max)}` : `Rs ${fmt(min)}`
}

const PER_PAGE = 10

const AdminContact = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [subject, setSubject] = useState("")
  /* Filtered here rather than on the server: the list is already paged and
     the queue view is about what is still open, not about the whole history. */
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (nextPage = page, nextSubject = subject) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getContacts({ page: nextPage, limit: PER_PAGE, subject: nextSubject || "" })
      if (!res?.success) throw new Error(res?.message || "The enquiries didn't load.")

      const list = Array.isArray(res.contacts) ? res.contacts : res.data?.contacts || []
      const count = res.total ?? res.data?.total ?? list.length
      setContacts(list)
      setTotal(Number(count) || 0)
      setTotalPages(
        Number(res.pages ?? res.data?.pages) || Math.max(1, Math.ceil(count / PER_PAGE)),
      )
      setPage(Number(res.page ?? res.data?.page) || nextPage)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "The enquiries didn't load.")
      setContacts([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1, subject)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const res = await deleteContactById(pendingDelete._id)
      if (res?.success === false) throw new Error(res.message)
      setContacts((list) => list.filter((c) => c._id !== pendingDelete._id))
      setTotal((n) => Math.max(0, n - 1))
      toast.success("Enquiry deleted.")
      setPendingDelete(null)
    } catch (err) {
      toast.error(err.message || "The enquiry couldn't be deleted.")
    } finally {
      setDeleting(false)
    }
  }

  // The endpoint filters by subject; the search box narrows what came back.
  const term = search.trim().toLowerCase()
  const visible = contacts.filter((c) => {
    const matchesTerm =
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.message?.toLowerCase().includes(term)
    const matchesStatus = !status || (c.status || "new") === status
    return matchesTerm && matchesStatus
  })

  const open = contacts.filter((c) => !["answered", "closed"].includes(c.status || "new")).length

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Enquiries"
        description="Messages from the contact form. Open one to read it in full and reply."
        count={total}
        countLabel="enquiries"
      />

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search by name, email or wording">
        <FilterSelect value={subject} onChange={setSubject} options={SUBJECTS} label="Enquiries" />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_FILTERS} label="Any status" />
      </AdminToolbar>

      {open > 0 && (
        <p className="mt-4 t-small text-ink-soft">
          <span className="amount font-semibold text-ink">{open}</span> still waiting for a reply.
        </p>
      )}

      {error ? (
        <AdminError message={error} onRetry={() => load(page)} />
      ) : !loading && visible.length === 0 ? (
        <AdminEmpty
          title={contacts.length === 0 ? "No enquiries here" : "Nothing matches that"}
          body={
            contacts.length === 0
              ? "Messages sent through the contact form on the site will land here."
              : "Try a different search, or widen the occasion filter."
          }
          action={term || subject || status ? "Clear filters" : undefined}
          onAction={() => {
            setSearch("")
            setSubject("")
            setStatus("")
          }}
        />
      ) : (
        <>
          <Table head={["From", "Occasion", "Status", "Budget", "Received", { label: "", align: "right" }]}>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : (
              visible.map((contact) => (
                <tr key={contact._id} className="transition-colors hover:bg-gray-50">
                  <Td>
                    <span className="block font-medium">{contact.name || "No name"}</span>
                    <span className="amount block truncate t-caption text-ink-mute">
                      {contact.email}
                    </span>
                    {contact.message && (
                      <span className="mt-1 block max-w-[38ch] truncate t-caption text-ink-soft">
                        {contact.message}
                      </span>
                    )}
                  </Td>

                  <Td className="text-ink-soft">{subjectLabel(contact.subject)}</Td>

                  <Td>
                    <StatusBadge status={contact.status || "new"}>
                      {STATUS_LABELS[contact.status || "new"]}
                    </StatusBadge>
                  </Td>

                  <Td className="amount whitespace-nowrap text-ink-soft">
                    {budgetLabel(contact.budget)}
                  </Td>

                  <Td className="amount whitespace-nowrap text-ink-soft">
                    {formatDate(contact.createdAt)}
                  </Td>

                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/admin-contact/${contact._id}`)}
                        className="t-small font-medium text-crimson hover:underline"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => setPendingDelete(contact)}
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

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(n) => {
              load(n)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this enquiry?"
        body={`The message from ${pendingDelete?.name || "this person"} will be removed permanently. If you haven't replied yet, copy their email first: ${pendingDelete?.email || "—"}`}
        confirmLabel="Delete enquiry"
      />
    </AdminPage>
  )
}

export default AdminContact
