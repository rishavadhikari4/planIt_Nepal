import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDish, getAllDishCategories } from '../api/dishService';
import { toast } from 'react-toastify';
import '../styles/Dishes.css';

const AddDishForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.name || !image) {
      toast.error('Please fill all fields and select an image');
      return;
    }

    const data = new FormData();
    data.append('category', formData.category);
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('image', image);

    setUploading(true);
    await addDish(
      data,
      (message) => {
        toast.success(message);
        setFormData({ category: '', name: '', description: '' });
        setIsCustomCategory(false);
        setImage(null);
        document.getElementById('imageInput').value = null;
        navigate('/admin-dishes');
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
    setUploading(false);
  };

  return (
    <div className="add-dish-container">
      <h2>Add New Dish</h2>
      <form className="add-dish-form" onSubmit={handleSubmit}>
        <label>Category:</label>
        <select
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
          <input
            type="text"
            name="category"
            placeholder="Enter custom category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="text"
          name="name"
          placeholder="Dish Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="file"
          accept="image/*"
          id="imageInput"
          onChange={handleImageChange}
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Dish'}
        </button>
      </form>
    </div>
  );
};

export default AddDishForm;
