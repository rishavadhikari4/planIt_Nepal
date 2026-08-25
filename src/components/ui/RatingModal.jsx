import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import { rateVenue, rateStudio, rateDish } from "../../services/reviews"
import { Modal } from "./Admin"

const RATING_WORD = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

const RATERS = {
  venue: rateVenue,
  studio: rateStudio,
  dish: rateDish,
  cuisine: rateDish,
}

const NOUN = { venue: "venue", studio: "studio", dish: "dish", cuisine: "dish" }

const RatingModal = ({ isOpen, onClose, item, itemType, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // The parent can hold a null item while the modal animates shut.
  if (!isOpen || !item) return null

  const noun = NOUN[itemType] || "booking"

  const close = () => {
    setRating(0)
    setHover(0)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const rate = RATERS[itemType]
    if (!rate) return toast.error("This item can't be rated.")

    setSubmitting(true)
    try {
      const response = await rate(item.itemId, rating)
      toast.success(response.message || "Thanks — your rating is saved.")
      onRatingSubmitted?.(item.itemId, rating)
      close()
    } catch (error) {
      toast.error(error.message || "The rating didn't save. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={`Rate this ${noun}`}
      description="Ratings help other people choose. Only you can rate what you've booked."
      width="max-w-md"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 rounded-lg border border-line bg-gray-50 p-4">
          <img
            src={item.image || item.dishImage || item.venueImage || "/placeholder.svg"}
            alt=""
            className="h-14 w-14 shrink-0 rounded-md border border-line object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{item.name}</p>
            <p className="text-[13px] capitalize text-ink-mute">{noun}</p>
          </div>
        </div>

        <fieldset className="mt-7">
          <legend className="label">Your rating</legend>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                  aria-pressed={rating === star}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hover || rating) ? "fill-marigold text-marigold" : "text-line-strong"
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

        <div className="mt-8 flex justify-end gap-2">
          <button type="button" onClick={close} disabled={submitting} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={submitting || rating === 0} className="btn btn-primary">
            {submitting ? (
              <>
                <span className="loader h-4 w-4 border-white/40 border-t-white" />
                Saving…
              </>
            ) : rating === 0 ? (
              "Pick a rating"
            ) : (
              "Save rating"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default RatingModal
