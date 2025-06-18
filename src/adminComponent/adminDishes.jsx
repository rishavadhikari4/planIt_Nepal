import { useState, useEffect } from 'react';
import { getAllDishCategories } from '../api/dishService'; 
import '../styles/Dishes.css';  

const AdminDishes = () => {
  const [categories, setCategories] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  return (
    <div className="main-container">
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
      </div>
    </div>
  );
};

export default AdminDishes;
