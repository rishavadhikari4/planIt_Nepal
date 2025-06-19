import "../styles/auth.css";
import { AuthContext } from "../context/AuthContext";
import { useState, useContext } from "react";

const AdminLogin = () => {
  const { adminLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <-- NEW

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // <-- START LOADING

    try {
      await adminLogin(email, password);
      console.log("Login successful");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // <-- STOP LOADING
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login to Admin Panel</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              <div
                className="small-loader"
              ></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
