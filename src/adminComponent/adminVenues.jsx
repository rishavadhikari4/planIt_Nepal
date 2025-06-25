import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteVenue, getAllVenues } from '../api/venueService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Venues.css';

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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="main-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="venue-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="title-bar">
  <h2 className="venues__title">Available Wedding Venues</h2>
  <button
    onClick={() => navigate('/admin-venues/addVenue')}
  >
    + Add Venue
  </button>
</div>


        <div className="grid">
          <AnimatePresence>
            {venues.map((venue) => (
              <motion.div
                key={venue._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: '2rem' }}
              >
                <div className="card venue-card">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="venue-card__image"
                  />
                  <div className="venue-card__content">
                    <h3 className="venue-card__title">{venue.name}</h3>
                    <p className="venue-card__location">{venue.location}</p>
                    <p className="venue-card__description">{venue.description}</p>
                  </div>
                </div>

                <div
                  className="venue-actions"
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    gap: '1rem',
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin-venues/edit/${venue._id}`)}
                    className="edit-button"
                    disabled={deletingId === venue._id}
                  >
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#dc3545' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(venue._id)}
                    className="delete-button"
                    disabled={deletingId === venue._id}
                  >
                    {deletingId === venue._id ? (
                      <div className="small-loader" />
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
