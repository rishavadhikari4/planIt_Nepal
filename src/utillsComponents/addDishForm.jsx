import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDish, getAllDishCategories } from "../services/dishService";
import { toast } from "react-toastify";
import '../styles/Dishes.css';

const AddDishForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await getAllDishCategories();
        const categoryNames = fetched.map(cat => cat.category);
        setCategories(categoryNames);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categorySelect') {
      if (value === 'Other') {
        setIsCustomCategory(true);
        setFormData(prev => ({ ...prev, category: '' }));
      } else {
        setIsCustomCategory(false);
        setFormData(prev => ({ ...prev, category: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { category, name, description } = formData;

    if (!category || !name || !imageFile) {
      toast.error("Please fill in all required fields and select an image");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('category', category);
    data.append('name', name);
    data.append('description', description);
    data.append('image', imageFile);

    try {
      await addDish(
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
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin-dishes');
  };

  return (
    <div className="edit-container">
      <h2>Add New Dish</h2>
      <button onClick={handleBack} className="back-button" style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="edit-form">
        <label>Category:</label>
        <select
        className="CategorySelect"
          name="categorySelect"
          value={isCustomCategory ? 'Other' : formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
          <option value="Other">Other</option>
        </select>

        {isCustomCategory && (
          <>
            <label>Custom Category:</label>
            <input
              type="text"
              name="category"
              placeholder="Enter custom category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label>Dish Name:</label>
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
        />

        <label>Image:</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Dish"}
        </button>
      </form>
    </div>
  );
};

export default AddDishForm;
