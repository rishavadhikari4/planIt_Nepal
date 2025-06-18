import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { editDecoration, getOneDecoration } from '../api/decorationService';
import { toast } from 'react-toastify';
import '../styles/Decorations.css';

const EditDecoration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecoration = async () => {
      try {
        const decoration = await getOneDecoration(id);
        if (decoration) {
          const { name, description, image } = decoration;
          setFormData({ name, description, image });
        } else {
          toast.error("Decoration not found");
        }
      } catch (err) {
        toast.error("Failed to load decoration data");
      } finally {
        setLoading(false); 
      }
    };

    fetchDecoration();
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
    data.append('description', formData.description);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await editDecoration(
        id,
        data,
        (successMessage) => {
          toast.success(successMessage);
          navigate('/admin-decorations');
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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <h2>Edit Decoration</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

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

export default EditDecoration;
