import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { fetchLoginUser } from "../services/users";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem("accessToken"));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const showError = (msg) => {
    setError(msg);
    console.error(msg);
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const getNewAccessToken = useCallback(async () => {
    try {
      const { data } = await API.post("/api/auths/refresh-token");
      if (data.success && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setIsAuthenticated(true);
        return data.accessToken;
      }
      throw new Error("No access token returned");
    } catch (err) {
      showError("Session expired. Please login again.");
      logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (accessToken && storedUser) {
      if (isTokenExpired(accessToken)) {
        getNewAccessToken();
        return;
      }
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [getNewAccessToken]);

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

  const signup = async (name, email, number, password, confirmPassword) => {
    setLoading(true);
    try {
      const response = await API.post("/api/auths/signup", {
        name,
        email,
        number,
        password,
        confirmPassword,
      });
      
      if (response.data.success) {
        navigate("/login");
        return response.data;
      }
    } catch (error) {
      showError(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/auths/login", { email, password });
      
      if (data.success && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        
        try {
          const fullUser = await fetchLoginUser();
          localStorage.setItem("user", JSON.stringify(fullUser));
          setUser(fullUser);
        } catch (userError) {
          const decoded = jwtDecode(data.accessToken);
          const basicUser = { 
            id: decoded.id, 
            email: decoded.email, 
            role: decoded.role 
          };
          localStorage.setItem("user", JSON.stringify(basicUser));
          setUser(basicUser);
        }
        
        setIsAuthenticated(true);
        navigate("/welcome");
        return data;
      }
    } catch (error) {
      showError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/auths/admin-login", { email, password });
      
      if (data.success && data.accessToken) {
        sessionStorage.setItem("accessToken", data.accessToken);
        const decoded = jwtDecode(data.accessToken);
        
        if (decoded.role !== "admin") {
          showError("Not authorized as admin");
          throw new Error("Not authorized as admin");
        }
        
        const adminUser = { 
          id: decoded.id, 
          email: decoded.email, 
          role: decoded.role 
        };
        sessionStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        setIsAdmin(true);
        navigate("/admin");
        return data;
      }
    } catch (error) {
      showError(error.response?.data?.message || "Admin login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.post("/api/auths/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setLoading(false);
    navigate("/");
  };

  const adminLogout = async () => {
    setLoading(true);
    try {
      await API.post("/api/auths/logout");
    } catch (error) {
      console.error("Admin logout error:", error);
    }
    
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setLoading(false);
    navigate("/");
  };

  const verifyUser = async () => {
    try {
      const response = await API.get("/api/auths/verify/user");
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "User verification failed");
      throw error;
    }
  };

  const sendVerificationMail = async () => {
    try {
      const response = await API.post("/api/auths/verify/mail");
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to send verification email");
      throw error;
    }
  };

  const verifyMail = async (otp) => {
    try {
      const response = await API.patch("/api/auths/verify/mail", { otp });
      if (response.data.success) {
        const updatedUser = { ...user, verified: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Email verification failed");
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    if (isAdmin) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  };

  const refreshAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleGoogleAuthSuccess = async (accessToken) => {
    try {
      localStorage.setItem("accessToken", accessToken);
      const fullUser = await fetchLoginUser();
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
      setIsAuthenticated(true);
      navigate("/welcome");
    } catch (error) {
      showError("Failed to complete Google authentication");
      console.error(error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        error,
        loading,
        signup,
        login,
        logout,
        adminLogin,
        adminLogout,
        verifyUser,
        sendVerificationMail,
        verifyMail,
        updateUser,
        getNewAccessToken,
        refreshAuth,
        handleGoogleAuthSuccess,
        clearError,
        isCustomer: isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
