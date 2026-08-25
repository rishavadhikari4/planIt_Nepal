import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import { getAllReviews, toggleVerified, deleteReview } from "../../services/reviews"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  StatGrid,
  Stat,
  AdminEmpty,
  AdminError,
  StatusBadge,
  ConfirmDialog,
  formatDate,
} from "../../components/ui/Admin"

const FILTERS = [
  { value: "all", label: "All reviews" },
  { value: "unverified", label: "Awaiting review" },
  { value: "verified", label: "Published" },
]

const Stars = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < rating ? "fill-brass text-brass" : "text-line-strong"
        }`}
        strokeWidth={1.5}
      />
    ))}
  </span>
)

const AdminReviews = ({ embedded }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      setError("The reviews didn't load.")
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const publish = async (review) => {
    setToggling(review._id)
    const previous = reviews
    setReviews((list) =>
      list.map((r) => (r._id === review._id ? { ...r, verified: !r.verified } : r)),
    )
    try {
      await toggleVerified(review._id)
      toast.success(review.verified ? "Review hidden from the site." : "Review published.")
    } catch {
      setReviews(previous)
      toast.error("That didn't save. The review is unchanged.")
    } finally {
      setToggling(null)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteReview(pendingDelete._id)
      setReviews((list) => list.filter((r) => r._id !== pendingDelete._id))
      toast.success("Review deleted.")
      setPendingDelete(null)
    } catch {
      toast.error("The review couldn't be deleted.")
    } finally {
      setDeleting(false)
    }
  }

  const term = search.trim().toLowerCase()
  const visible = reviews.filter((r) => {
    const matchesSearch =
      !term || r.user?.name?.toLowerCase().includes(term) || r.comment?.toLowerCase().includes(term)
    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && r.verified) ||
      (filter === "unverified" && !r.verified)
    return matchesSearch && matchesFilter
  })

  const waiting = reviews.filter((r) => !r.verified).length
  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : "—"

  const body = (
    <>
      <div className="mt-6">
        <StatGrid>
          <Stat label="Total reviews" value={reviews.length} loading={loading} error={error} />
          <Stat
            label="Awaiting review"
            value={waiting}
            hint={waiting ? "Not visible on the site yet" : "Nothing waiting"}
            loading={loading}
            error={error}
          />
          <Stat
            label="Published"
            value={reviews.length - waiting}
            loading={loading}
            error={error}
          />
          <Stat label="Average rating" value={average} loading={loading} error={error} />
        </StatGrid>
      </div>

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search by customer or wording">
        <FilterSelect value={filter} onChange={setFilter} options={FILTERS} label="Reviews" />
      </AdminToolbar>

      {error ? (
        <AdminError message={error} onRetry={load} />
      ) : loading ? (
        <div className="mt-6 space-y-px overflow-hidden rounded-lg border border-line bg-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface p-5" aria-hidden>
              <span className="block h-3.5 w-40 animate-pulse rounded bg-gray-100" />
              <span className="mt-3 block h-3 w-full animate-pulse rounded bg-gray-100" />
              <span className="mt-2 block h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <AdminEmpty
          title={reviews.length === 0 ? "No reviews yet" : "Nothing matches that"}
          body={
            reviews.length === 0
              ? "Reviews customers leave after an event will appear here for you to publish."
              : "Try a different search or filter."
          }
          action={reviews.length > 0 ? "Show all reviews" : undefined}
          onAction={() => {
            setSearch("")
            setFilter("all")
          }}
        />
      ) : (
        <ul className="mt-6 space-y-px overflow-hidden rounded-lg border border-line bg-line">
          {visible.map((review) => (
            <li key={review._id} className="bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="t-body font-semibold text-ink">
                      {review.user?.name || "Anonymous"}
                    </span>
                    <Stars rating={Number(review.rating) || 0} />
                    <StatusBadge status={review.verified ? "verified" : "unverified"}>
                      {review.verified ? "Published" : "Awaiting review"}
                    </StatusBadge>
                  </div>
                  <p className="amount mt-1 t-caption text-ink-mute">
                    {formatDate(review.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => publish(review)}
                    disabled={toggling === review._id}
                    className="t-small font-medium text-crimson hover:underline disabled:opacity-50"
                  >
                    {toggling === review._id
                      ? "Saving…"
                      : review.verified
                        ? "Hide from site"
                        : "Publish"}
                  </button>
                  <button
                    onClick={() => setPendingDelete(review)}
                    className="t-small font-medium text-ink-mute hover:text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {review.comment && (
                <p className="mt-3 max-w-[80ch] t-small leading-relaxed text-ink-soft">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this review?"
        body={`The review from ${pendingDelete?.user?.name || "this customer"} will be removed permanently. If you only want it off the site, hide it instead.`}
        confirmLabel="Delete review"
      />
    </>
  )

  if (embedded) return body

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Reviews"
        description="Reviews stay hidden until you publish them. Nothing here is visible to customers by default."
      />
      {body}
    </AdminPage>
  )
}

export default AdminReviews
