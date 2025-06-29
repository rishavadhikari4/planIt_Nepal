import { useEffect, useState } from "react";
import { getAllReviews, toggleVerified, deleteReview } from "../services/reviewService";
import { toast } from "react-toastify";
import "../styles/adminReview.css";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null); // <-- NEW

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
      setError(null);
    } catch {
      setError("Failed to fetch reviews");
      toast.error("Failed to fetch reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleVerified = async (id) => {
    try {
      await toggleVerified(id);
      setReviews((prevReviews) =>
        prevReviews.map((rev) =>
          rev._id === id ? { ...rev, verified: !rev.verified } : rev
        )
      );
      toast.success("Verified status updated successfully");
    } catch {
      toast.error("Failed to update verified status");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    setDeletingReviewId(id); // <-- SET
    try {
      await deleteReview(id);
      setReviews((prevReviews) => prevReviews.filter((rev) => rev._id !== id));
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingReviewId(null); // <-- RESET
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  if (error) return <p>{error}</p>;

  return (
    <div className="admin-reviews-container">
      <h2>All Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <table className="reviews-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(({ _id, user, rating, comment, verified }) => (
            <tr key={_id} className="review-row">
              <td data-label="User">{user?.name || "Unknown User"}</td>
              <td data-label="Rating">{rating}</td>
              <td data-label="Comment">{comment}</td>
              <td data-label="Verified">{verified ? "✅" : "❌"}</td>
              <td data-label="Actions">
                <button
                  className="btn-toggle"
                  onClick={() => handleToggleVerified(_id)}
                >
                  {verified ? "Unverify" : "Verify"}
                </button>
                        
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteReview(_id)}
                  disabled={deletingReviewId === _id}
                >
                  {deletingReviewId === _id ? (
                    <div className="small-loader"></div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </td>
            </tr>

            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReviews;
