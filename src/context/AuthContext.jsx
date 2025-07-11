import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { fetchLoginUser } from "../services/userService";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(
  !!localStorage.getItem("accessToken") || !!sessionStorage.getItem("accessToken")
);

  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem("accessToken"));

  const navigate = useNavigate();
  const location = useLocation();

  // Regular user authentication check (localStorage)
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      try {
        const decodedaccessToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedaccessToken.exp < currentTime) {
          console.warn("User accessToken expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          navigate("/");
          return;
        }

        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("User accessToken decode error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/");
      }
    }
  }, [navigate]);

  // Admin authentication check (sessionStorage) on route change
  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const decodedaccessToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (
          decodedaccessToken.exp < currentTime ||
          decodedaccessToken.role !== "admin"
        ) {
          // Invalid or expired accessToken or not admin role
          setIsAdmin(false);
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          if (location.pathname.startsWith("/admin")) {
            navigate("/admin-login");
          }
          return;
        }

        // Valid admin accessToken
        setIsAdmin(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        setIsAdmin(false);
        sessionStorage.removeItem("accessToken");
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
      localStorage.setItem("accessToken", data.accessToken);
      const fullUser = await fetchLoginUser();

      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
      setIsAuthenticated(true);
      navigate("/welcome");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  // User signup
  const signup = async (name, email,number, password, confirmPassword) => {
    try {
      const { data } = await API.post("/api/auth/register", {
        name,
        email,
        number,
        password,
        confirmPassword,
      });

      localStorage.setItem("accessToken", data.accessToken);
      const fullUser = await fetchLoginUser();


      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  // User logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      const { data } = await API.post("/api/auth/adminLogin", { email, password });
      sessionStorage.setItem("accessToken", data.accessToken);
      const decodedaccessToken = jwtDecode(data.accessToken);

      if (decodedaccessToken.role !== "admin") {
        throw new Error("Not authorized as admin");
      }

      const user = { email: decodedaccessToken.email };
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
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate("/");
  };

  const refreshAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  };

const updateUser = (updatedUser) => {
  localStorage.setItem("user", JSON.stringify(updatedUser));
  setUser(updatedUser);
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
        refreshAuth,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
