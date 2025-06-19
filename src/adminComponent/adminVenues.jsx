import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteVenue, getAllVenues } from '../api/venueService';
import { toast } from 'react-toastify';
import '../styles/Venues.css';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // Track which venue is deleting
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

    setDeletingId(id); // Start deleting loader

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
      setDeletingId(null); // Stop deleting loader
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
    <div className="main-container">
      <div className="venue-container">
        <h2 className="venues__title">Available Wedding Venues</h2>
        <div className="grid">
          {venues.map((venue) => (
            <div key={venue._id} style={{ marginBottom: '2rem' }}>
              {/* Venue Card */}
              <div className="card venue-card">
                <img src={venue.image} alt={venue.name} className="venue-card__image" />
                <div className="venue-card__content">
                  <h3 className="venue-card__title">{venue.name}</h3>
                  <p className="venue-card__location">{venue.location}</p>
                  <p className="venue-card__description">{venue.description}</p>
                </div>
              </div>

              {/* Buttons outside the card */}
              <div
                className="venue-actions"
                style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}
              >
                <button
                  onClick={() => navigate(`/admin-venues/edit/${venue._id}`)}
                  className="edit-button"
                  disabled={deletingId === venue._id} // Disable edit while deleting
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(venue._id)}
                  className="delete-button"
                  disabled={deletingId === venue._id} // Disable button while deleting
                >
                  {deletingId === venue._id ? (
                    <div className="small-loader" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminVenues;
