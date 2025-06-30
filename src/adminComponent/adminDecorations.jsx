import { useState, useEffect } from 'react';
import { getAllDecorations, deleteDecoration } from '../services/decorationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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

    try {
      setDeletingId(id);
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
  className="max-w-7xl mx-auto p-6"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  <div className="decoration-container">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold text-gray-800">Available Wedding Venues</h2>
      <button
        onClick={() => navigate('/admin-decorations/addDecoration')}
        className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
      >
        + Add Decoration
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {decorations.map((decoration, index) => (
        <motion.div
          key={decoration._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={decoration.image}
              alt={decoration.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{decoration.name}</h3>
              <p className="text-gray-600 mt-2">{decoration.description}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => navigate(`/admin-decorations/edit/${decoration._id}`)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded-md transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(decoration._id)}
              disabled={deletingId === decoration._id}
              className={`px-3 py-1 rounded text-white transition ${
                deletingId === decoration._id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {deletingId === decoration._id ? (
                <div
                  className="w-4 h-4 border-2 border-gray-300 border-t-2 border-t-gray-700 rounded-full animate-spin mx-auto"
                ></div>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div>

  );
};

export default AdminDecorations;
