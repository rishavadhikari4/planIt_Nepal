import { useState, useEffect, useContext } from "react"
import { postReview, getVerifiedReviews } from "../../services/reviews"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"

const Review = () => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviews, setReviews] = useState([])
  const { isCustomer } = useContext(AuthContext)

  useEffect(() => {
    getVerifiedReviews()
      .then((res) => {
        if (res?.data) {
          setReviews(res.data)
        }
      })
      .catch(() => {
        toast.error("Failed to fetch reviews.")
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await postReview({ rating, comment })
      toast.success("Review submitted successfully! 🎉")
      setRating(0)
      setComment("")
      getVerifiedReviews().then((res) => {
        if (res?.data) {
          setReviews(res.data) 
        }
      })
    } catch (err) {
      toast.error("Failed to submit review. Please try again.")
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          What Our Clients Say
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Real experiences from clients who trusted us with their special events
        </p>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">💭</span>
          </div>
          <p className="text-xl text-gray-500 mb-2">No reviews yet</p>
          <p className="text-gray-400">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="group bg-gradient-to-br from-white to-purple-50 border border-purple-100/50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            >
              {/* Review Text */}
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 italic">
                "{review.comment}"
              </p>

              {/* Rating Stars */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl mr-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      } transition-colors duration-200`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {review.rating}/5
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {review.user?.profileImage ? (
                    <img
                      src={review.user.profileImage}
                      alt={review.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{review.user?.name}</p>
                  {/* Conditionally show verified status */}
                  {!review.user?.verified && (
                    <p className="text-xs text-green-600 font-medium flex items-center">
                      <span className="mr-1">✓</span>
                      Verified Customer
                    </p>
                  )}
                  {review.user?.verified && (
                    <p className="text-xs text-gray-500">Customer</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Form - Only show if user is logged in */}
      {isCustomer ? (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-white to-purple-50 shadow-2xl rounded-2xl p-8 sm:p-10 border border-purple-100/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Share Your Experience
                </h3>
                <p className="text-gray-600">Help other clients by sharing your event story</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="text-center">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    How was your experience?
                  </label>
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-4xl sm:text-5xl transition-all duration-200 transform hover:scale-125 focus:outline-none ${
                          (hoverRating || rating) >= star
                            ? "text-yellow-400 drop-shadow-lg"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} Star`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {rating > 0 && (
                      <span className="font-medium">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </span>
                    )}
                  </p>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label htmlFor="comment" className="block text-lg font-semibold text-gray-700 mb-3">
                    Tell us about your experience
                  </label>
                  <textarea
                    id="comment"
                    className="w-full p-4 text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about our service, venues, catering, photography, or overall event management experience..."
                    rows={5}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!rating || !comment.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {rating && comment.trim() ? "Submit Review ✨" : "Please rate and comment"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
    </div>
  )
}

export default Review