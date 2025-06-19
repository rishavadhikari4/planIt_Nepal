import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDishCategories, deleteDish, deleteCategory } from '../api/dishService'; 
import '../styles/Dishes.css';  
import { toast } from 'react-toastify';

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
            prevCategories.map(category => {
              if (category._id === categoryId) {
                return {
                  ...category,
                  dishes: category.dishes.filter(d => d._id !== dishId)
                };
              }
              return category;
            })
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

  // New: Handle delete category
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

  // Simplified DishCard without buttons
  const DishCard = ({ dish }) => (
    <div className="card dish-card">
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
              {category.dishes.map(dish => (
                <div key={dish._id} style={{ marginBottom: '1.5rem' }}>
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDishes;
