import  { useState ,useEffect} from 'react';
import { postReview,getAllReviews} from '../api/reviewService';
import { toast } from 'react-toastify';


const Review = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);


  useEffect(() => {
    getAllReviews().then(setReviews);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await postReview({ rating, comment });
      toast.success('Review submitted successfully! 🎉');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (<div>
    <div className="reviews-content">
      <div className="reviews-grid">
        {reviews.map((review, index) => (
          <div className="review" key={`first-${index}`}>
            <p className="review-text">{`"${review.comment}"`}</p>
            <div className="review-stars">{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</div>
            <p className="review-author">{`- ${review.user.name}`}</p>
          </div>
        ))}
      </div>
      <div className="reviews-grid">
        {reviews.map((review, index) => (
          <div className="review" key={`second-${index}`}>
            <p className="review-text">{`"${review.comment}"`}</p>
            <div className="review-stars">{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</div>
            <p className="review-author">{`- ${review.user.name}`}</p>
          </div>
        ))}
      </div>
    </div>
     <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h3>Leave a Review</h3>

      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${((hoverRating || rating) >= star) ? 'filled' : ''}`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        className="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Your thoughts..."
        rows={4}
      />

      <button type="submit" className="review-submit">
        Submit
      </button>
    </form>
    </div>
  );
};

export default Review;
