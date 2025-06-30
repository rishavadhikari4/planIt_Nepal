import React, { useState, useEffect } from 'react';
import { getAllDecorations } from '../services/decorationService';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { toast } from 'react-toastify';

const Decorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Get addToCart from context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const data = await getAllDecorations();
        setDecorations(data);
      } catch (err) {
        console.error('Failed to fetch decorations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecorations();
  }, []);

const handleSubmit = async () => {
  const token = localStorage.getItem("token");
  if(!token){
    toast.info("Please login to add items to the cart");
    navigate("/login");
    return;
  }
  if (selectedDecoration) {
    // await chooseDecoration(selectedDecoration);
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
    setSelectedDecoration(null); // Reset the selection after adding to cart
  }
};     

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );

  return (
<div className="max-w-8xl mx-auto px-4 py-10 bg-pink-100 min-h-screen">
  <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
    Wedding Decoration Themes
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {decorations.map((decoration) => (
      <div
        key={decoration._id}
        className={`border rounded-2xl shadow-md transition cursor-pointer hover:shadow-xl p-6 text-center ${
          selectedDecoration === decoration.name ? 'ring-4 ring-pink-500' : ''
        }`}
        onClick={() => setSelectedDecoration(decoration.name)}
      >
        <img
          src={decoration.image}
          alt={decoration.name}
          className="w-full h-56 object-cover rounded-lg mb-6"
        />
        <h3 className="text-2xl font-bold text-gray-800">{decoration.name}</h3>
        <p className="text-base text-gray-600 my-4 leading-relaxed">{decoration.description}</p>
        <div className="mt-4">
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
            className="ml-3 text-lg text-gray-700 font-medium"
          >
            Select this theme
          </label>
        </div>
      </div>
    ))}
  </div>

  <div className="mt-12 flex justify-center">
    <button
      className="px-8 py-4 bg-pink-600 text-xl font-semibold text-white rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
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