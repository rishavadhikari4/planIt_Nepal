import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteVenue, getAllVenues } from '../services/venueService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// import '../styles/Venues.css';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getAllVenues();
        setVenues(data || []);
      } catch (err) {
        console.error('Failed to fetch venues:', err);
        toast.error('Failed to load venues.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    setDeletingId(id);
    try {
      const result = await deleteVenue(id);
      if (result.success) {
        toast.success(result.message);
        setVenues(prevVenues => prevVenues.filter(venue => venue._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete venue.');
      console.error(error);
    } finally {
      setDeletingId(null);
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

  return (
<motion.div
  className="min-h-screen p-6"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <motion.div
    className="max-w-7xl mx-auto"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    {/* Title and Add Button */}
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-gray-800">Available Wedding Venues</h2>
      <button
        onClick={() => navigate('/admin-venues/addVenue')}
        className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg transition"
      >
        + Add Venue
      </button>
    </div>

    {/* Venue Cards */}
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {venues.map((venue) => (
          <motion.div
            key={venue._id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
          >
            {/* Venue Card */}
            <div className="overflow-hidden rounded-t-lg">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{venue.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{venue.location}</p>
              <p className="text-gray-700 text-sm">{venue.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 px-4 pb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin-venues/edit/${venue._id}`)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded-md transition"
                disabled={deletingId === venue._id}
              >
                Edit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(venue._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                disabled={deletingId === venue._id}
              >
                {deletingId === venue._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </motion.div>
</motion.div>
  );
};

export default AdminVenues;
