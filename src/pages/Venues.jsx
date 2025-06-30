import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVenues } from '../services/venueService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Venues = () => {
  const [venues, setVenues] = useState([]);
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
    toast.success("Added to the cart successfully");
    addToCart({
      name: venue.name,
      image: venue.image,
      quantity: 1,
    });
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
  <div className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-pink-100 min-h-screen">
    <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
      Our Wedding Venues
    </h2>

    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {venues.map((venue) => (
        <div
          key={venue._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          style={{ height: '24rem' }}
        >
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-1/2 object-cover"
          />
          <div className="p-6 flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-2xl font-semibold text-pink-600 mb-3">
                {venue.name}
              </h3>
              <p className="text-gray-600 text-base mb-2">{venue.location}</p>
              <p className="text-gray-700 text-base line-clamp-3">
                {venue.description}
              </p>
            </div>
            <button
              onClick={() => handleSelect(venue)}
              className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
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
