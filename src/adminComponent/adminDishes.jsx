import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDishCategories, deleteDish, deleteCategory } from '../services/dishService';
import '../styles/Dishes.css';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDishes = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingDishId, setDeletingDishId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getAllDishCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        toast.error(err);
        console.error('Failed to fetch dishes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteDish = async (categoryId, dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;

    setDeletingDishId(dishId);
    try {
      await deleteDish(
        categoryId,
        dishId,
        (successMessage) => {
          setCategories(prevCategories =>
            prevCategories
              .map(category => {
                if (category._id === categoryId) {
                  const updatedDishes = category.dishes.filter(d => d._id !== dishId);
                  return { ...category, dishes: updatedDishes };
                }
                return category;
              })
              .filter(category => category.dishes.length > 0)
          );
          toast.success(successMessage);
        },
        (errorMessage) => {
          toast.error(errorMessage);
        }
      );
    } catch (error) {
      alert('Something went wrong while deleting the dish.');
    } finally {
      setDeletingDishId(null);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setDeletingCategoryId(categoryId);
    try {
      await deleteCategory(
        categoryId,
        (successMessage) => {
          setCategories(prevCategories =>
            prevCategories.filter(category => category._id !== categoryId)
          );
          toast.success(successMessage);
        },
        (errorMessage) => {
          toast.error(errorMessage);
        }
      );
    } catch (error) {
      alert('Something went wrong while deleting the category.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const DishCard = ({ dish }) => (
    <motion.div
      className="card dish-card"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <img src={dish.image} alt={dish.name} className="dish-card__image" />
      <div className="dish-card__content">
        <h3 className="dish-card__title">{dish.name}</h3>
        <p className="dish-card__description">{dish.description}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const noDishes =
    categories.length === 0 || categories.every(category => category.dishes.length === 0);

  // Add Dish Button component
  const AddDishButton = () => (
    <button
      className="add-dish-button"
      onClick={() => navigate('/admin-dishes/addDishes')}>
      Add Dish
    </button>
  );

  return (
    <div className="main-container">
      <motion.div
        className="container dishes__section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Show Add Dish button at top only if dishes exist */}
        {!noDishes && <AddDishButton />}

        {noDishes ? (
          <div className="no-dishes-found" style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h2>No dishes found</h2>
            {/* Add Dish button centered when no dishes */}
            <AddDishButton />
          </div>
        ) : (
          <AnimatePresence>
            {categories.map(category => (
              category.dishes.length > 0 && (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="dishes__category">{category.category}</h2>
                    <button
                      className="delete-category-button"
                      onClick={() => handleDeleteCategory(category._id)}
                      disabled={deletingCategoryId === category._id}
                    >
                      {deletingCategoryId === category._id ? (
                        <div className="loader-small"></div>
                      ) : (
                        'Delete Category'
                      )}
                    </button>
                  </div>

                  <div className="grid">
                    <AnimatePresence>
                      {category.dishes.map(dish => (
                        <motion.div
                          key={dish._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginBottom: '1.5rem' }}
                        >
                          <DishCard dish={dish} />
                          <div className="dish-actions">
                            <button
                              className="edit-button"
                              onClick={() => navigate(`/admin-dishes/edit/${category._id}/${dish._id}`)}
                              disabled={deletingDishId === dish._id}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteDish(category._id, dish._id)}
                              disabled={deletingDishId === dish._id}
                            >
                              {deletingDishId === dish._id ? (
                                <div className="loader-small"></div>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDishes;
