import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDishCategories, deleteDish, deleteCategory } from '../services/dishService';
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
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <img src={dish.image} alt={dish.name} className="w-full h-36 sm:h-48 object-cover" />
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">{dish.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{dish.description}</p>
      </div>
    </motion.div>
  );

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

  const noDishes =
    categories.length === 0 || categories.every(category => category.dishes.length === 0);

  const AddDishButton = () => (
    <button
      className="mb-6 px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-md shadow-sm transition text-sm sm:text-base"
      onClick={() => navigate('/admin-dishes/addDishes')}
    >
      Add Dish
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        className="flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!noDishes && <AddDishButton />}

        {noDishes ? (
          <div className="text-center mt-20">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">No dishes found</h2>
            <AddDishButton />
          </div>
        ) : (
          <AnimatePresence>
            {categories.map(category =>
              category.dishes.length > 0 && (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                      onClick={() => handleDeleteCategory(category._id)}
                      disabled={deletingCategoryId === category._id}
                    >
                      {deletingCategoryId === category._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid mx-auto"></div>
                      ) : (
                        'Delete Category'
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <AnimatePresence>
                      {category.dishes.map(dish => (
                        <motion.div
                          key={dish._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="relative"
                        >
                          <DishCard dish={dish} />
                          <div className="flex justify-end space-x-2 sm:space-x-3 mt-2">
                            <button
                              className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md transition text-xs sm:text-sm"
                              onClick={() => navigate(`/admin-dishes/edit/${category._id}/${dish._id}`)}
                              disabled={deletingDishId === dish._id}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm"
                              onClick={() => handleDeleteDish(category._id, dish._id)}
                              disabled={deletingDishId === dish._id}
                            >
                              {deletingDishId === dish._id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid mx-auto"></div>
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
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDishes;
