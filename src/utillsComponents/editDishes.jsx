import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDishById, editDish } from '../services/dishService';
import { toast } from 'react-toastify';
import '../styles/Decorations.css';

const EditDish = () => {
  const { dishId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDishById(dishId);
        if (!data || !data.dish) throw new Error('Dish not found');

        const { dish, categoryId } = data;

        setFormData({
          name: dish.name,
          description: dish.description,
          image: dish.image,
        });

        setCategoryId(categoryId);
      } catch (error) {
        toast.error("Failed to load dish data");
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [dishId]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Cannot update dish: missing category ID");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await editDish(
        categoryId,
        dishId,
        data,
        (successMessage) => {
          toast.success(successMessage);
          navigate('/admin-dishes');
        },
        (errorMessage) => {
          toast.error(errorMessage);
        }
      );
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin-dishes');
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <h2>Edit Dish</h2>

      <button onClick={handleBack} className="back-button">← Back</button>

      <form onSubmit={handleSubmit} className="edit-form">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Current Image:</label>
        {formData.image && (
          <img src={formData.image} alt="Current" className="preview-img" />
        )}

        <label>New Image (optional):</label>
        <input type="file" onChange={handleFileChange} accept="image/*" />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditDish;
