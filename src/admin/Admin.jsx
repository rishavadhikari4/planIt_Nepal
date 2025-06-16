import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AdminHeader from "../adminComponent/adminHeader";

const Admin = () => {
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/*");
    return;
  }
  API.get("/api/auth/verify")
    .then((response) => {
      if (response.data.valid) {
        setAuthorized(true);
      } else {
        navigate("/*"); // invalid user, navigate away
      }
    })
    .catch(() => navigate("/*")); // if token invalid or server error
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
        <p>Welcome, Admin! Here you can manage users, view reports, and configure settings. It is in development....</p>
      </div>
    </div>

  );
};

export default Admin;