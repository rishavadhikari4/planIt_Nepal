import { useState, useEffect, useContext } from 'react';
import { postReview, getVerifiedReviews } from '../services/reviewService';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Review = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    getVerifiedReviews().then(setReviews);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postReview({ rating, comment });
      toast.success('Review submitted successfully! 🎉');
      setRating(0);
      setComment('');
      getVerifiedReviews().then(setReviews);
    } catch (err) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold text-center mb-10 text-pink-600">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No reviews yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-xl shadow-lg p-6 bg-white hover:animate-spin-slow transition-transform duration-1000"
            >
              <p className="text-gray-800 italic text-lg mb-3">"{review.comment}"</p>
              <div className="text-yellow-500 text-xl mb-2">
                {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
              </div>
              <p className="text-md text-gray-500 font-semibold">- {review.user.name}</p>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white shadow-xl rounded-xl p-8"
        >
          <h3 className="text-2xl font-semibold mb-5 text-gray-800">Leave a Review</h3>

          <div className="flex mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-4xl cursor-pointer transition ${
                  (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="w-full p-4 text-lg border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your thoughts..."
            rows={4}
          />

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-5 rounded-lg text-lg font-medium transition"
          >
            Submit Review
          </button>
        </form>
      ) : (
        <p className="text-center text-lg text-gray-600 mt-6">
          You must be <span className="font-bold text-pink-600">logged in</span> to leave a review.
        </p>
      )}
    </div>
  );
};

export default Review;
