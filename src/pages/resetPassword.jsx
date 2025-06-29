import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postResetPassword } from '../services/passwordService';
import '../styles/forgotPassword.css'; // Reuse the same styles

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await postResetPassword(resetToken, newPassword, confirmNewPassword);
      toast.success(response.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="forgot-form">
          <label className="forgot-label">New Password</label>
          <input
            type="password"
            className="forgot-input"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />

          <label className="forgot-label">Confirm New Password</label>
          <input
            type="password"
            className="forgot-input"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
