import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDish, getAllDishCategories } from "../services/dishService";
import { toast } from "react-toastify";

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Dish</h2>

      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center px-6 py-3 bg-pink-200 text-pink-800 font-semibold rounded-md shadow-sm hover:bg-pink-300 transition"
      >
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Category:</label>
          <select
            name="categorySelect"
            value={isCustomCategory ? 'Other' : formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          >
            <option value="">Select Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        {isCustomCategory && (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Custom Category:</label>
            <input
              type="text"
              name="category"
              placeholder="Enter custom category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium text-gray-700">Dish Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y transition"
          />
        </div>

<div>
  <label className="block mb-2 font-medium text-gray-700">Image:</label>

  {/* Hidden native file input */}
  <input
    type="file"
    onChange={handleFileChange}
    accept="image/*"
    required
    className="hidden"
    id="fileInput"
  />

  {/* Custom button to open file picker */}
  <button
    type="button"
    onClick={() => document.getElementById('fileInput').click()}
    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
  >
    Choose File
  </button>

  {/* Show selected file name */}
  {imageFile && (
    <p className="mt-2 text-gray-600 text-sm truncate max-w-full" title={imageFile.name}>
      Selected file: {imageFile.name}
    </p>
  )}
</div>


        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-4 rounded-md font-semibold text-white transition ${
            loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
          }`}
        >
          {loading ? "Adding..." : "Add Dish"}
        </button>
      </form>
    </div>
  );
};

export default AddDishForm;
