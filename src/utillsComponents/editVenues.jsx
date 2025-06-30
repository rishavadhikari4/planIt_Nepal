import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { editVenue, getOneVenue } from "../services/venueService";
import { toast } from "react-toastify";

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const venue = await getOneVenue(id);
        if (venue) {
          const { name, location, description, image } = venue;
          setFormData({ name, location, description, image });
        } else {
          toast.error("Venue not found");
        }
      } catch (err) {
        toast.error("Failed to load the venue data");
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('location', formData.location);
    data.append('description', formData.description);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await editVenue(
        id,
        data,
        (successMessage) => {
          toast.success(successMessage);
          navigate('/admin-venues');
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
    navigate('/admin-venues');
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Edit Venue</h2>

      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 font-semibold rounded-md shadow-sm hover:bg-pink-200 transition text-lg"
      >
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Current Image:</label>
          {formData.image && (
            <img
              src={formData.image}
              alt="Current"
              className="mt-2 w-full max-h-60 object-cover rounded"
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

        <div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-md font-semibold transition text-lg"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVenue;
