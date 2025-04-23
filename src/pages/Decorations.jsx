import React, { useState, useEffect } from 'react';
import { chooseDecoration, getAllDecorations } from '../api/services';
import '../styles/Decorations.css';

const Decorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [selectedDecoration, setSelectedDecoration] = useState(null);

  useEffect(() => {
    const fetchDecorations = async () => {
      const data = await getAllDecorations();
      setDecorations(data);
    };
    fetchDecorations();
  }, []);

  const handleSubmit = async () => {
    if (selectedDecoration) {
      await chooseDecoration(selectedDecoration);
    }
  };

  return (
    <div className="container">
      <h2 className="decorations__title">Wedding Decoration Themes</h2>
      <div className="grid">
        {decorations.map((decoration) => (
          <div key={decoration._id} className="card decoration-card">
            <img
              src={decoration.image}
              alt={decoration.name}
              className="decoration-card__image"
            />
            <h3 className="decoration-card__title">{decoration.name}</h3>
            <p className="decoration-card__description">{decoration.description}</p>
            <div className="decoration-card__radio">
              <input
                type="radio"
                id={`decoration-${decoration._id}`}
                name="decoration"
                value={decoration._id}
                checked={selectedDecoration === decoration._id}
                onChange={() => setSelectedDecoration(decoration._id)}
              />
              <label htmlFor={`decoration-${decoration._id}`}>Select this theme</label>
            </div>
          </div>
        ))}
      </div>
      <div className="decorations__confirm">
        <button
          className="button button--primary"
          onClick={handleSubmit}
          disabled={!selectedDecoration}
        >
          Confirm Decoration Theme
        </button>
      </div>
    </div>
  );
};

export default Decorations;
