import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
    
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data:", error);
                sessionStorage.removeItem("user");
                setUser(null);
            }
        }
    }, []);
    const login = async (email, password) => {
        try {
            const { data } = await API.post("/api/auth/login", { email, password });
            
            sessionStorage.setItem("token", data.token);
            const decodedToken = jwtDecode(data.token);

            const user = { id: decodedToken.id, name: decodedToken.name, email: decodedToken.email };
            
            sessionStorage.setItem("user", JSON.stringify(user));
            setUser(user);
    
            navigate("/");  
        } catch (error) {
            console.error("Login failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };
    
    const signup = async (name, email, password, confirmPassword) => {
        try {
            const { data } = await API.post("/api/auth/register", { name, email, password, confirmPassword });
            sessionStorage.setItem("token", data.token);
            const decodedToken = jwtDecode(data.token);
    
            const user = { id: decodedToken.id, name: decodedToken.name, email: decodedToken.email };
            
            sessionStorage.setItem("user", JSON.stringify(user));
            setUser(user); 
    
            navigate("/");
        } catch (error) {
            console.error("Signup failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "signup failed");
        }
    };
    
    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
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
    
            navigate("/admin");  
        } catch (error) {
            console.error("Login failed", error.response?.data?.message);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };


    return (
        <AuthContext.Provider value={{ user, signup, login, logout, adminLogin }}>
            {children}
        </AuthContext.Provider>
    );
};