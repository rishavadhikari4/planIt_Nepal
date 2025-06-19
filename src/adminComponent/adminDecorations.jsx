import { useState, useEffect } from 'react';
import { getAllDecorations, deleteDecoration } from '../api/decorationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Decorations.css';

const AdminDecorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // Track which decoration is deleting
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
      setDeletingId(id); // start loader for this button
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
    } finally {
      setDeletingId(null); // stop loader
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
            <div key={decoration._id} style={{ marginBottom: '2rem' }}>
              {/* Decoration Card */}
              <div className="card decoration-card">
                <img
                  src={decoration.image}
                  alt={decoration.name}
                  className="decoration-card__image"
                />
                <h3 className="decoration-card__title">{decoration.name}</h3>
                <p className="decoration-card__description">{decoration.description}</p>
              </div>

              {/* Buttons outside the card */}
              <div className="decoration-actions" style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => navigate(`/admin-decorations/edit/${decoration._id}`)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(decoration._id)}
                  className="delete-button"
                  disabled={deletingId === decoration._id}
                >
                  {deletingId === decoration._id ? (
                    <div className="small-loader" style={{ width: 16, height: 16, border: '2px solid #f3f3f3', borderTop: '2px solid #555', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  ) : (
                    'Delete'
                  )}
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
