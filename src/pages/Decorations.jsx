import React, { useState, useEffect } from 'react';
import { getAllDecorations } from '../services/decorationService';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { toast } from 'react-toastify';

const Decorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const data = await getAllDecorations();
        setDecorations(data);
      } catch (err) {
        console.error('Failed to fetch decorations:', err);
        toast.error('Failed to load decorations.');
      } finally {
        setLoading(false);
      }
    };
    fetchDecorations();
  }, []);

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to add items to the cart");
      navigate("/login");
      return;
    }

    if (selectedDecoration) {
      toast.success("Added to the cart successfully");
      const decoration = decorations.find(d => d.name === selectedDecoration);
      if (decoration) {
        addToCart({
          name: decoration.name,
          price: decoration.price || 0,
          image: decoration.image,
          quantity: 1,
        });
      }
      setSelectedDecoration(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-pink-100">
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
    <div className="min-h-screen bg-pink-100 py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-10">
        Wedding Decoration Themes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {decorations.map((decoration) => (
          <div
            key={decoration._id}
            className={`border rounded-2xl shadow-md transition cursor-pointer hover:shadow-xl p-5 sm:p-6 text-center bg-white ${
              selectedDecoration === decoration.name ? 'ring-4 ring-pink-500' : ''
            }`}
            onClick={() => setSelectedDecoration(decoration.name)}
          >
            <img
              src={decoration.image}
              alt={decoration.name}
              className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{decoration.name}</h3>
            <p className="text-sm sm:text-base text-gray-600 my-3">{decoration.description}</p>

            <div className="mt-4 flex items-center justify-center">
              <input
                type="radio"
                id={`decoration-${decoration._id}`}
                name="decoration"
                value={decoration.name}
                checked={selectedDecoration === decoration.name}
                onChange={() => setSelectedDecoration(decoration.name)}
                onClick={(e) => e.stopPropagation()}
                className="accent-pink-600 w-5 h-5"
              />
              <label
                htmlFor={`decoration-${decoration._id}`}
                className="ml-2 text-sm sm:text-base text-gray-700 font-medium"
              >
                Select this theme
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] px-6 py-3 sm:py-4 text-white text-sm sm:text-base md:text-lg font-semibold rounded-full bg-pink-600 hover:bg-pink-700 transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!selectedDecoration}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Decorations;
