import { useState, useEffect } from 'react';
import { getAllDecorations, deleteDecoration } from '../api/decorationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Decorations.css';

const AdminDecorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const data = await getAllDecorations();
        setDecorations(data || []);
      } catch (err) {
        console.error('Failed to fetch decorations:', err);
        toast.error('Failed to load decorations.');
      } finally {
        setLoading(false);
      }
    };

    fetchDecorations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this decoration?')) return;

    try {
      const result = await deleteDecoration(id);
      if (result.success) {
        toast.success(result.message);
        setDecorations(prev => prev.filter(decoration => decoration._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting decoration.');
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
    <div className="mainContainer">
      <div className="decoration-container">
        <h2 className="decorations__title">Available Wedding Decoration Themes</h2>
        <div className="grid">
          {decorations.map(decoration => (
            <div key={decoration._id} className="card decoration-card">
              <img
                src={decoration.image}
                alt={decoration.name}
                className="decoration-card__image"
              />
              <h3 className="decoration-card__title">{decoration.name}</h3>
              <p className="decoration-card__description">{decoration.description}</p>
              <div className="decoration-card__actions">
                <button
                  onClick={() => navigate(`/admin-decorations/edit/${decoration._id}`)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(decoration._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDecorations;
