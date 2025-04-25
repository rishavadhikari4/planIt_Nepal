import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
    const { signup } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
        } else {
            setError(""); 
        }
    }, [password, confirmPassword]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return; 
        signup(name, email, password, confirmPassword);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Sign Up to Lagan Gaatho</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
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
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={error}>Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default Register;