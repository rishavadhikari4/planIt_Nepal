import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/*");
      return;
    }
    axios.get("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setAuthorized(true))
      .catch(() => navigate("/*"));
  }, [navigate]);

  return (
    <div className="admin-container" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fff0f6 0%, #ffe0ec 100%)"
    }}>
      <div className="admin-box" style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 4px 32px rgba(255, 128, 171, 0.12), 0 1.5px 8px rgba(0,0,0,0.07)",
        padding: "2.5rem 2rem",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#e75480", marginBottom: "1.5rem" }}>Admin Dashboard</h2>
        <p>Welcome, Admin! Here you can manage users, view reports, and configure settings.</p>
        {/* Add more admin features/components here */}
      </div>
    </div>
  );
};

export default Admin;