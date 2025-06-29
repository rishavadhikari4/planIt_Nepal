import React, { useState, useEffect } from 'react';
import { getAllDecorations } from '../services/decorationService';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { toast } from 'react-toastify';
import '../styles/Decorations.css';

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
    <div className="decoration-container">
      <h2 className="decorations__title">Wedding Decoration Themes</h2>
      <div className="grid">
        {decorations.map((decoration) => (
          <div key={decoration._id} className="card decoration-card">
            <img
              src={decoration.image}
              alt={decoration.name}
              className="decoration-card__image"
            />
            <h3 className="decoration-card__title">{decoration.name}</h3>
            <p className="decoration-card__description">{decoration.description}</p>
            <div className="decoration-card__radio">
              <input
                type="radio"
                id={`decoration-${decoration._id}`}
                name="decoration"
                value={decoration.name}
                checked={selectedDecoration === decoration.name}
                onChange={() => setSelectedDecoration(decoration.name)}
              />
              <label htmlFor={`decoration-${decoration._id}`}>Select this theme</label>
            </div>
          </div>
        ))}
      </div>
      <div className="decorations__confirm">
        <button
          className="button button--primary"
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