import React, { useState } from "react";
import { postForgotEmail } from "../services/passwordService"; // Adjust path as needed
import "../styles/forgotPassword.css"; // Import CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const data = await postForgotEmail(email);
      setMessage(data.message || "Reset email sent successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="forgot-form">
          <label htmlFor="email" className="forgot-label">Email Address</label>
          <input
            type="email"
            id="email"
            className="forgot-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {message && <p className="forgot-message success">{message}</p>}
        {error && <p className="forgot-message error">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
