import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { editVenue, getOneVenue } from "../api/venueService";
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
    <div className="edit-container">

      <h2>Edit Venue</h2>
      <button onClick={handleBack} className="back-button" style={{ marginBottom: '1rem' }}>
        ← Back
      </button>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Current Image:</label>
        {formData.image && <img src={formData.image} alt="Current" className="preview-img" />}

        <label>New Image (optional):</label>
        <input type="file" onChange={handleFileChange} accept="image/*" />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditVenue;
