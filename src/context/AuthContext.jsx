/**
 * @module AuthContext
 * @description Authentication context provider for the Wedding Planner application
 * @requires react
 * @requires react-router-dom
 * @requires jwt-decode
 * @requires ../services/api
 * @requires ../services/userService
 */
import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { fetchLoginUser } from "../services/userService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides authentication methods to the application.
 * Handles two separate authentication flows:
 * 1. Regular user authentication (stored in localStorage)
 * 2. Admin authentication (stored in sessionStorage)
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isCustomer, setisCustomer] = useState(!!localStorage.getItem("accessToken"));
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem("accessToken"));
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Displays error messages
   * @param {string} msg - Error message to display
   */
  const showError = (msg) => {
    setError(msg);
    // TODO: Replace with toast/snackbar
    console.error(msg);
  };

  /**
   * Checks if a JWT token has expired
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token has expired, false otherwise
   */
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  /**
   * Requests a new access token using refresh token (stored in HTTP-only cookie)
   * @returns {Promise<string|null>} New access token or null if refresh failed
   */
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

  /**
   * Effect: Check regular user authentication on mount and token refresh
   */
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

  /**
   * Effect: Check admin authentication on route changes
   * Uses sessionStorage for admin tokens (cleared when browser is closed)
   */
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

  /**
   * Effect: Route protection for admin pages
   */
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

  /**
   * Authenticates a regular user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<void>}
   * @throws {Error} If authentication fails
   */
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

  /**
   * Registers a new user
   * @param {string} name - User's full name
   * @param {string} email - User's email
   * @param {string} number - User's phone number
   * @param {string} password - User's password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<void>}
   * @throws {Error} If registration fails
   */
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

  /**
   * Logs out the current user (both customer and admin)
   * @returns {Promise<void>}
   */
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

  /**
   * Authenticates an admin user
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<void>}
   * @throws {Error} If authentication fails
   */
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

  /**
   * Logs out admin user
   * @returns {Promise<void>}
   */
  const adminLogout = async () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setisCustomer(false);
    setIsAdmin(false);
    navigate("/");
  };

  /**
   * Updates user information in state and storage
   * @param {Object} updatedUser - Updated user object
   */
  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  /**
   * Refreshes authentication state after OAuth login or token expiry
   * @returns {Promise<boolean>} Success status
   */

  const refreshAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setisCustomer(true);
    }};

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
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
