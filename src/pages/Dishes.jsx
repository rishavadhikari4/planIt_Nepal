import React, { useState, useEffect } from 'react';
import {  getAllDishCategories } from '../api/dishService';
import { useCart } from '../context/CartContext'; // Import useCart
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/Dishes.css';  

const Dishes = () => {
  const [categories, setCategories] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Get addToCart from context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getAllDishCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Failed to fetch dishes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDishSelection = (dishName) => {
    setSelectedDishes(prev =>
      prev.includes(dishName)
        ? prev.filter(name => name !== dishName)
        : [...prev, dishName]
    );
  };

 const handleSubmit = () => {
    const token = localStorage.getItem("token");

    // submitDishes(selectedDishes);
    // Add each selected dish to cart
    if(!token){
      toast.info("Please login to Add items to your cart");
      navigate('/login');
      return;
    }
    toast.success("Added to the cart successfully");
    categories.forEach(category => {
      category.dishes.forEach(dish => {
        if (selectedDishes.includes(dish.name)) {
          addToCart({
            name: dish.name,
            image: dish.image,
            quantity: 1,
          });
        }
      });
    });
    setSelectedDishes([]); // Reset all checkboxes after adding to cart
  };

  const DishCard = ({ dish }) => (
    <div className="card dish-card">
      <input
        type="checkbox"
        className="dish-card__checkbox"
        checked={selectedDishes.includes(dish.name)}
        onChange={() => handleDishSelection(dish.name)}
      />
      <img src={dish.image} alt={dish.name} className="dish-card__image" />
      <div className="dish-card__content">
        <h3 className="dish-card__title">{dish.name}</h3>
        <p className="dish-card__description">{dish.description}</p>
      </div>
    </div>
  );

  if (loading) return <div className="loader-container">
    <div className="loader"></div>
  </div>;

  return (
    <div className="container dishes__section">
      {categories.map(category => (
        <div key={category._id}>
          <h2 className="dishes__category">{category.category}</h2>
          <div className="grid">
            {category.dishes.map(dish => (
              <DishCard key={dish._id} dish={dish} />
            ))}
          </div>
        </div>
      ))}
      <div className="dishes__confirm">
        <button
          className="button button--primary"
          onClick={handleSubmit}
          disabled={selectedDishes.length === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Dishes;