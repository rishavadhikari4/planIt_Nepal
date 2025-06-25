import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addVenue } from "../api/venueService";
import { toast } from "react-toastify";
import '../styles/Venues.css'

const AddVenue = () => {
  const navigate = useNavigate();

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
    <div className="edit-container">

      <h2>Add New Venue</h2>
      <button onClick={handleBack} className="back-button" style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="edit-form">
        <label>Name:</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />

        <label>Location:</label>
        <input 
          type="text" 
          name="location" 
          value={formData.location} 
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

        <label>Image:</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*" 
          required 
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Venue"}
        </button>
      </form>
    </div>
  );
};

export default AddVenue;
