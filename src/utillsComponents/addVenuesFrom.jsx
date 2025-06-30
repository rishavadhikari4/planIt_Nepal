import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addVenue } from "../services/venueService";
import { toast } from "react-toastify";

const AddVenue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.description || !imageFile) {
      toast.error("Please fill in all fields and select an image");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('image', imageFile);

    try {
      await addVenue(
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Venue</h2>

      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center px-6 py-3 bg-pink-200 text-pink-800 font-semibold rounded-md shadow-sm hover:bg-pink-300 transition"
      >
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none transition"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Image:</label>

          {/* Hidden native file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            required
            className="hidden"
          />

          {/* Custom button to open file picker */}
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
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
            loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {loading ? "Adding..." : "Add Venue"}
        </button>
      </form>
    </div>
  );
};

export default AddVenue;
