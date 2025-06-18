import { useEffect, useState } from "react";
import { getAllReviews, toggleVerified, deleteReview } from "../api/reviewService"; // adjust path
import { toast } from "react-toastify";
import "../styles/adminReview.css"; // import the external CSS

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    try {
      await deleteReview(id);
      setReviews((prevReviews) => prevReviews.filter((rev) => rev._id !== id));
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  if (loading) return <p>Loading reviews...</p>;
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
                <td>{user?.name || "Unknown User"}</td>
                <td>{rating}</td>
                <td>{comment}</td>
                <td>{verified ? "✅" : "❌"}</td>
                <td>
                  <button
                    className="btn-toggle"
                    onClick={() => handleToggleVerified(_id)}
                  >
                    {verified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteReview(_id)}
                  >
                    Delete
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
