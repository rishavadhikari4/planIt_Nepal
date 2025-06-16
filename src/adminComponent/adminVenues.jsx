import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteVenue, getAllVenues } from '../api/venueService';
import { toast } from 'react-toastify';
import '../styles/Venues.css';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getAllVenues();
        setVenues(data);
      } catch (err) {
        console.error('Failed to fetch venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this decoration?')) return;
  
            const result = await deleteVenue(id);
    
      if (result.success) {
            toast.success(result.message);
            setVenues(venues.filter(venue => venue._id !== id));
    } else {
      toast.error(result.message);
    }
  };


  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );

  return (
    <div className="main-container">
    <div className="venue-container">
      <h2 className="venues__title">Available Wedding Venues</h2>
      <div className="grid">
        {venues.map((venue) => (
          <div key={venue._id} className="card venue-card">
            <img src={venue.image} alt={venue.name} className="venue-card__image" />
            <div className="venue-card__content">
              <h3 className="venue-card__title">{venue.name}</h3>
              <p className="venue-card__location">{venue.location}</p>
              <p className="venue-card__description">{venue.description}</p>

              <div className="venue-card__actions">
                <button onClick={() => navigate(`/admin-venues/edit/${venue._id}`)} className='edit-btn'>
                      Edit
                </button>

                <button onClick={() => handleDelete(venue._id)} className="delete-btn">Delete</button>
              </div>     
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default AdminVenues;