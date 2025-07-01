import React, { useState, useEffect } from 'react';
import { getAllDishCategories } from '../services/dishService';
import { useCart } from '../context/CartContext'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dishes = () => {
  const [categories, setCategories] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getAllDishCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Failed to fetch dishes:', err);
        toast.error('Failed to load dishes.');
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
    if (!token) {
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
    setSelectedDishes([]);
  };

  const DishCard = ({ dish }) => {
    const isSelected = selectedDishes.includes(dish.name);

    return (
      <div
        onClick={() => handleDishSelection(dish.name)}
        className={`relative border rounded-2xl shadow transition bg-white p-4 sm:p-6 flex flex-col items-center cursor-pointer hover:shadow-lg ${
          isSelected ? 'ring-4 ring-pink-500' : ''
        }`}
      >
        <input
          type="checkbox"
          className="absolute top-3 right-3 w-6 h-6 accent-pink-600 cursor-pointer"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleDishSelection(dish.name)}
        />
        <img
          src={dish.image}
          alt={dish.name}
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover rounded-lg mb-4 pointer-events-none"
        />
        <div className="text-center pointer-events-none">
          <h3 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-800 mb-2">
            {dish.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">{dish.description}</p>
        </div>
      </div>
    );
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

  const hasDishes = categories.some(category => category.dishes && category.dishes.length > 0);

  return (
    <div className="min-h-screen bg-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!hasDishes ? (
          <p className="text-center text-lg sm:text-xl text-gray-500">No dishes found.</p>
        ) : (
          categories.map(category => (
            <div key={category._id} className="mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-700 mb-6 border-b-2 border-pink-300 pb-2">
                {category.category}
              </h2>
              <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {category.dishes.map(dish => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {hasDishes && (
        <div className="fixed bottom-6 right-6 z-50 max-w-full">
          <button
            className={`w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white shadow-lg ${
              selectedDishes.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700'
            } transition duration-300`}
            onClick={handleSubmit}
            disabled={selectedDishes.length === 0}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default Dishes;
