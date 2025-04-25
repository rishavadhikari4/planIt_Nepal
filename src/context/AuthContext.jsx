import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <-- import useLocation
import API from "../api/api";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();
    const location = useLocation(); // <-- get location

    // Update isAuthenticated on every route change
    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem('token'));
    }, [location]); // <-- depend on location

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
    
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data:", error);
                localStorage.removeItem("user");
                setUser(null);
            }
        }
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post("/api/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            const decodedToken = jwtDecode(data.token);
            const user = { id: decodedToken.id, name: decodedToken.name, email: decodedToken.email };
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true); // <-- update state
            navigate("/");  
        } catch (error) {
            console.error("Login failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };
    
    const signup = async (name, email, password, confirmPassword) => {
        try {
            const { data } = await API.post("/api/auth/register", { name, email, password, confirmPassword });
            const decodedToken = jwtDecode(data.token);
            const user = { id: decodedToken.id, name: decodedToken.name, email: decodedToken.email };
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user); 
            setIsAuthenticated(true); // <-- update state
            navigate("/");
        } catch (error) {
            console.error("Signup failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "signup failed");
        }
    };
    
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/");
    };
    
    const adminLogin = async (email, password) => {
        try {
            const { data } = await API.post("/api/auth/adminLogin", { email, password });
            localStorage.setItem("token", data.token);
            const decodedToken = jwtDecode(data.token);
            const user = { email: decodedToken.email };
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true); // <-- update state
            navigate("/admin");  
        } catch (error) {
            console.error("Login failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout, adminLogin }}>
            {children}
        </AuthContext.Provider>
    );
};