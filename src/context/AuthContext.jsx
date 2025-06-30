import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { fetchLoginUser } from "../services/userService";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem("token"));

  const navigate = useNavigate();
  const location = useLocation();

  // Regular user authentication check (localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.warn("User token expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          navigate("/");
          return;
        }

        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("User token decode error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/");
      }
    }
  }, [navigate]);

  // Admin authentication check (sessionStorage) on route change
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (
          decodedToken.exp < currentTime ||
          decodedToken.role !== "admin"
        ) {
          // Invalid or expired token or not admin role
          setIsAdmin(false);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          if (location.pathname.startsWith("/admin")) {
            navigate("/admin-login");
          }
          return;
        }

        // Valid admin token
        setIsAdmin(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        setIsAdmin(false);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        if (location.pathname.startsWith("/admin")) {
          navigate("/admin-login");
        }
      }
    } else {
      setIsAdmin(false);
      if (location.pathname.startsWith("/admin")) {
        navigate("/admin-login");
      }
    }
  }, [location.pathname, navigate]);

  // Redirect logic for admin routes and login page
  useEffect(() => {
    if (isAdmin && location.pathname === "/admin-login") {
      navigate("/admin");
    }

    if (
      location.pathname.startsWith("/admin") &&
      location.pathname !== "/admin-login" &&
      !isAdmin
    ) {
      navigate("/*");
    }
  }, [isAdmin, location.pathname, navigate]);

  // Regular user login
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      const fullUser = await fetchLoginUser();

      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  // User signup
  const signup = async (name, email, password, confirmPassword) => {
    try {
      const { data } = await API.post("/api/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });
      const decodedToken = jwtDecode(data.token);
      const user = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  // User logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      const { data } = await API.post("/api/auth/adminLogin", { email, password });
      sessionStorage.setItem("token", data.token);
      const decodedToken = jwtDecode(data.token);

      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized as admin");
      }

      const user = { email: decodedToken.email };
      sessionStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(true);
      navigate("/admin");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Admin login failed");
    }
  };

  // Admin logout
  const adminLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate("/admin-login");
  };

  const refreshAuth = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        signup,
        login,
        logout,
        adminLogin,
        adminLogout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
