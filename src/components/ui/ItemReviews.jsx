import { useContext, useEffect, useState } from "react"
import { Star, BadgeCheck } from "lucide-react"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"
import { getItemReviews, postReview } from "../../services/reviews"
import { Reveal } from "./Motion"

/*
 * What this listing's customers said.
 *
 * There used to be two feedback systems that never met: a star score on the
 * item with no words, and words about the company with no subject. A two-star
 * venue that nobody could explain was the result. This reads the merged one —
 * a review belongs to a thing, and the score is derived from the reviews
 * rather than typed alongside them.
 */

const Stars = ({ value, size = "h-3.5 w-3.5" }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${size} ${n <= value ? "fill-brass text-brass" : "text-line-strong"}`}
        strokeWidth={1.5}
      />
    ))}
  </span>
)

/** The five-bar distribution behind a headline score. */
const Distribution = ({ counts, total }) => (
  <ul className="space-y-1.5">
    {[5, 4, 3, 2, 1].map((score) => {
      const count = counts?.[score] || 0
      const share = total ? (count / total) * 100 : 0
      return (
        <li key={score} className="flex items-center gap-3">
          <span className="amount w-3 t-caption text-ink-mute">{score}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <span
              className="block h-full rounded-full bg-brass transition-[width] duration-700 ease-out"
              style={{ width: `${share}%` }}
            />
          </span>
          <span className="amount w-6 text-right t-caption text-ink-mute">{count}</span>
        </li>
      )
    })}
  </ul>
)

const ItemReviews = ({ itemType, itemId, itemName }) => {
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!itemId) return
    let live = true
    setLoading(true)
    getItemReviews(itemType, itemId)
      .then((result) => live && setData(result))
      .catch(() => {})
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [itemType, itemId])

  const submit = async (event) => {
    event.preventDefault()
    if (!rating) return toast.info("Pick a rating first.")
    if (!comment.trim()) return toast.info("Add a few words about what it was like.")

    setSending(true)
    try {
      const result = await postReview({ rating, comment: comment.trim(), itemType, itemId })
      toast.success(result.message)
      setRating(0)
      setComment("")
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "That didn't send.")
    } finally {
      setSending(false)
    }
  }

  if (loading) return null

  const summary = data?.summary
  const reviews = data?.reviews || []
  const canWrite = isAuthenticated && isCustomer

  // Nothing published and nobody able to write the first one: say nothing
  // rather than print an empty section under a heading.
  if (!reviews.length && !canWrite) return null

  return (
    <Reveal className="mt-14 border-t border-line pt-10">
      <p className="eyebrow">What people said</p>

      {reviews.length > 0 && (
        <div className="mt-6 grid gap-8 sm:grid-cols-[auto_minmax(0,220px)] sm:items-center">
          <div>
            <p className="amount t-display leading-none text-ink">{summary.average}</p>
            <div className="mt-2">
              <Stars value={Math.round(summary.average)} size="h-4 w-4" />
            </div>
            <p className="mt-1.5 t-caption text-ink-mute">
              {summary.total} {summary.total === 1 ? "review" : "reviews"}
            </p>
          </div>
          <Distribution counts={summary.counts} total={summary.total} />
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-9 divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={review._id} className="py-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gray-100 t-caption font-semibold text-ink-soft">
                  {review.user?.profileImage ? (
                    <img src={review.user.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (review.user?.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate t-small font-semibold text-ink">
                    {review.user?.name || "A customer"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Stars value={review.rating} />
                    {/* Only shown when the reviewer has a paid order holding
                        this item, which is the whole point of the badge. */}
                    {review.verifiedBooking && (
                      <span className="inline-flex items-center gap-1 t-caption text-green-700">
                        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                        Booked here
                      </span>
                    )}
                  </span>
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 t-body leading-relaxed text-ink-soft">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {canWrite && (
        <form onSubmit={submit} className="mt-9 max-w-xl">
          <p className="t-body font-semibold text-ink">
            {reviews.length ? "Been here?" : `Be the first to review ${itemName || "this"}`}
          </p>

          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-6 w-6 ${
                    n <= (hover || rating) ? "fill-brass text-brass" : "text-line-strong"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What was it actually like on the day?"
            className="field mt-4 resize-none"
          />

          <button type="submit" disabled={sending} className="btn btn-ghost mt-4">
            {sending ? (
              <>
                <span className="loader h-4 w-4" />
                Sending…
              </>
            ) : (
              "Post review"
            )}
          </button>
          <p className="mt-3 t-caption text-ink-mute">
            Reviews are published once they have been checked.
          </p>
        </form>
      )}
    </Reveal>
  )
}

export default ItemReviews
