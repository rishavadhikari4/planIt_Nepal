import { useEffect, useState } from "react";
import { getAllReviews, toggleVerified, deleteReview } from "../services/reviewService";
import { toast } from "react-toastify";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

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

    setDeletingReviewId(id);
    try {
      await deleteReview(id);
      setReviews((prevReviews) => prevReviews.filter((rev) => rev._id !== id));
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <svg
          className="animate-spin h-12 w-12 text-pink-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );

  if (error) return <p className="text-center text-red-600 mt-4">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
            <thead className="bg-pink-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Verified</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map(({ _id, user, rating, comment, verified }) => (
                <tr key={_id} className="hover:bg-pink-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium" data-label="User">
                    {user?.name || "Unknown User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700" data-label="Rating">{rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-label="Comment">{comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center" data-label="Verified">
                    {verified ? (
                      <span className="text-green-600 text-xl">✅</span>
                    ) : (
                      <span className="text-red-600 text-xl">❌</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2" data-label="Actions">
                    <button
                      onClick={() => handleToggleVerified(_id)}
                      className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors
                        ${verified ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      {verified ? "Unverify" : "Verify"}
                    </button>

                    <button
                      onClick={() => handleDeleteReview(_id)}
                      disabled={deletingReviewId === _id}
                      className="px-3 py-1 rounded-md text-sm font-semibold bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingReviewId === _id ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-600 mx-auto"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
