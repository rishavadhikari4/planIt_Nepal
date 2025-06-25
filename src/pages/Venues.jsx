import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVenues } from '../api/venueService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/Venues.css';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
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

  const handleSelect = async (venue) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Please login to add items to your cart.");
      navigate('/login');
      return;
    }
    setSelectedVenue(venue.name);
    toast.success("Added to the cart successfully");
    addToCart({
      name: venue.name,
      image: venue.image,
      quantity: 1,
    });
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );

  return (
    <div className="container">
      <h2 className="venues__title_customer">Our Wedding Venues</h2>
      <div className="grid">
        {venues.map((venue) => (
          <div key={venue._id} className="card venue-card">
            <img src={venue.image} alt={venue.name} className="venue-card__image" />
            <div className="venue-card__content">
              <h3 className="venue-card__title">{venue.name}</h3>
              <p className="venue-card__location">{venue.location}</p>
              <p className="venue-card__description">{venue.description}</p>
              <button
                className="button button--primary"
                onClick={() => handleSelect(venue)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Venues;