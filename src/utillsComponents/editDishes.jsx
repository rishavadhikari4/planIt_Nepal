import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDishById, editDish } from '../services/dishService';
import { toast } from 'react-toastify';

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-4xl font-semibold mb-6 text-gray-800">Edit Dish</h2>

      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center px-4 py-2 bg-pink-200 text-pink-800 font-semibold rounded-md shadow-sm hover:bg-pink-300 transition text-lg"
      >
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-lg">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-lg"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700 text-lg">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none transition text-lg"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700 text-lg">Current Image:</label>
          {formData.image && (
            <img
              src={formData.image}
              alt="Current"
              className="w-full h-auto rounded-md border border-gray-300 object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">New Image (optional):</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-pink-500 hover:file:bg-pink-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-4 rounded-md font-semibold text-white transition ${
            loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
          } text-lg`}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default EditDish;
