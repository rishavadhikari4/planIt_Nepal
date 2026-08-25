import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import { postReview, getVerifiedReviews } from "../../services/reviews"
import { AuthContext } from "../../context/AuthContext"

const EASE = [0.16, 1, 0.3, 1]

const RATING_WORD = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

const Stars = ({ rating, size = "h-4 w-4" }) => (
  <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? "fill-marigold text-marigold" : "text-line-strong"}`}
        strokeWidth={1.5}
      />
    ))}
  </span>
)

const Review = () => {
  const { isCustomer } = useContext(AuthContext)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = () =>
    getVerifiedReviews()
      .then((res) => setReviews(res?.data || []))
      .catch(() => toast.error("The reviews couldn't be loaded."))

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await postReview({ rating, comment })
      // Reviews are held for staff approval, so say that rather than implying
      // it is already on the page.
      toast.success("Thanks — your review goes live once our team checks it.")
      setRating(0)
      setComment("")
      load()
    } catch {
      toast.error("The review didn't send. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div className="max-w-xl">
          <p className="eyebrow">In their words</p>
          <h2 className="mt-5 text-[clamp(30px,4.5vw,46px)]">
            What people say
            <br />
            <span className="font-normal italic">after the event.</span>
          </h2>
        </div>

        {average && (
          <div className="text-right">
            <p className="amount text-[40px] font-semibold leading-none text-ink">{average}</p>
            <div className="mt-2 flex justify-end">
              <Stars rating={Math.round(Number(average))} />
            </div>
            <p className="amount mt-1.5 text-[12.5px] text-ink-mute">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}
      </motion.div>

      {reviews.length === 0 ? (
        <div className="mt-12 border-y border-line py-16 text-center">
          <p className="text-[17px] text-ink-soft">No reviews published yet.</p>
          <p className="mt-2 text-[14px] text-ink-mute">
            {isCustomer
              ? "If we've run your event, yours could be the first."
              : "Check back after the next season of events."}
          </p>
        </div>
      ) : (
        /* A masonry-ish column layout keeps quotes of different lengths from
           forcing every card to the height of the longest one. */
        <div className="mt-14 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((review, i) => (
            <motion.figure
              key={review._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 5) * 0.06 }}
              className="card mb-5 break-inside-avoid p-6"
            >
              <Stars rating={Number(review.rating) || 0} />

              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                {review.comment}
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gray-100 text-[12px] font-semibold text-ink-soft">
                  {review.user?.profileImage ? (
                    <img src={review.user.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (review.user?.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {review.user?.name || "A customer"}
                  </span>
                  <span className="block text-[12px] text-ink-mute">Booked through PlanIt Nepal</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      )}

      {/* Only customers can leave a review, so the form only exists for them. */}
      {isCustomer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="card mx-auto mt-16 max-w-2xl p-7 sm:p-9"
        >
          <h3 className="text-[22px]">How did we do?</h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
            Your review is read by our team before it goes on the site.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <fieldset>
              <legend className="label">Your rating</legend>
              <div className="flex items-center gap-3">
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHover(star)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                      aria-pressed={rating === star}
                      className="rounded p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          (hover || rating) >= star
                            ? "fill-marigold text-marigold"
                            : "text-line-strong"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[13.5px] font-medium text-ink-soft">
                  {RATING_WORD[hover || rating]}
                </span>
              </div>
            </fieldset>

            <div>
              <label htmlFor="comment" className="label">
                What happened
              </label>
              <textarea
                id="comment"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The venue, the food, the team on the day — whatever stood out."
                className="field resize-y"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!rating || !comment.trim() || submitting}
              className="btn btn-primary w-full py-3"
            >
              {submitting ? (
                <>
                  <span className="loader h-4 w-4 border-white/40 border-t-white" />
                  Sending…
                </>
              ) : !rating ? (
                "Pick a rating first"
              ) : !comment.trim() ? (
                "Add a few words"
              ) : (
                "Send review"
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default Review
