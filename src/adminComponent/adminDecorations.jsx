import { useState, useEffect } from 'react';
import { getAllDecorations, deleteDecoration } from '../services/decorationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDecorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const data = await getAllDecorations();
        setDecorations(data || []);
      } catch (err) {
        console.error('Failed to fetch decorations:', err);
        toast.error('Failed to load decorations.');
      } finally {
        setLoading(false);
      }
    };
    fetchDecorations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this decoration?')) return;
    setDeletingId(id);
    try {
      const result = await deleteDecoration(id);
      if (result.success) {
        toast.success(result.message);
        setDecorations(prev => prev.filter(decoration => decoration._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting decoration.');
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
      className="min-h-screen p-4 sm:p-6"
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
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
            Available Wedding Decorations
          </h2>
          <button
            onClick={() => navigate('/admin-decorations/addDecoration')}
            className="bg-pink-600 hover:bg-pink-700 text-white text-sm sm:text-base px-4 sm:px-5 py-2 rounded-lg transition"
          >
            + Add Decoration
          </button>
        </div>

        {/* Decoration Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
          <AnimatePresence>
            {decorations.map((decoration) => (
              <motion.div
                key={decoration._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
              >
                {/* Decoration Card */}
                <div className="overflow-hidden rounded-t-lg">
                  <img
                    src={decoration.image}
                    alt={decoration.name}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-1">
                    {decoration.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-1">
                    {decoration.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 px-3 sm:px-4 pb-3 sm:pb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin-decorations/edit/${decoration._id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-3 py-1 rounded-md transition"
                    disabled={deletingId === decoration._id}
                  >
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(decoration._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition"
                    disabled={deletingId === decoration._id}
                  >
                    {deletingId === decoration._id ? (
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

export default AdminDecorations;
