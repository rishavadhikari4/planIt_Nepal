import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { fetchLoginUser } from "../services/userService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isCustomer, setisCustomer] = useState(!!localStorage.getItem("accessToken")
  );
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem("accessToken"));
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper: Show error (replace with your toast/snackbar)
  const showError = (msg) => {
    setError(msg);
    // TODO: Replace with toast/snackbar
    console.error(msg);
  };

  // Helper: Check token expiry
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Automatic token refresh
  const getNewAccessToken = useCallback(async () => {
    try {
      const { data } = await API.post("/api/auth/refresh-token");
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setisCustomer(true);
        return data.accessToken;
      }
      throw new Error("No access token returned");
    } catch (err) {
      showError("Session expired. Please login again.");
      logout();
      return null;
    }
  }, []);

  // Regular user authentication check
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      if (isTokenExpired(accessToken)) {
        getNewAccessToken();
        return;
      }
      setUser(JSON.parse(storedUser));
      setisCustomer(true);
    } else {
      setUser(null);
      setisCustomer(false);
    }
  }, [getNewAccessToken]);

  // Admin authentication check
  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime || decoded.role !== "admin") {
          setIsAdmin(false);
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("user");
          setUser(null);
          setisCustomer(false);
          if (location.pathname.startsWith("/admin")) {
            navigate("/admin-login");
          }
          return;
        }
        setIsAdmin(true);
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
        setIsAdmin(false);
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        setUser(null);
        setisCustomer(false);
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
      setisCustomer(true);
      navigate("/welcome");
    } catch (error) {
      showError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // User signup
  const signup = async (name, email, number, password, confirmPassword) => {
    try {
      await API.post("/api/auth/register", {
        name,
        email,
        number,
        password,
        confirmPassword,
      });
      navigate("/login");
    } catch (error) {
      showError(error.response?.data?.message || "Signup failed");
      throw error;
    }
  };

  // User logout
  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
    } catch (error) {
      showError(error.response?.data?.message || "Logout failed");
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setisCustomer(false);
    setIsAdmin(false);
    navigate("/");
  };

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      const { data } = await API.post("/api/auth/adminLogin", { email, password });
      sessionStorage.setItem("accessToken", data.accessToken);
      const decoded = jwtDecode(data.accessToken);
      if (decoded.role !== "admin") {
        showError("Not authorized as admin");
        throw new Error("Not authorized as admin");
      }
      const user = { email: decoded.email };
      sessionStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setisCustomer(true);
      setIsAdmin(true);
      navigate("/admin");
    } catch (error) {
      showError(error.response?.data?.message || "Admin login failed");
      throw error;
    }
  };

  // Admin logout
  const adminLogout = async () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setisCustomer(false);
    setIsAdmin(false);
    navigate("/");
  };

  // Update user info
  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Expose context
  return (
    <AuthContext.Provider
      value={{
        user,
        isCustomer,
        isAdmin,
        error,
        signup,
        login,
        logout,
        adminLogin,
        adminLogout,
        updateUser,
        getNewAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
