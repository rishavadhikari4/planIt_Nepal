import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";

import "../styles/auth.css";

const Register = () => {
    const { signup } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loader state

    useEffect(() => {
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
        } else {
            setError(""); 
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) return;
        setLoading(true);

        try {
            await signup(name, email, password, confirmPassword);
        } catch (err) {
            setError(err.message || "Signup failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Sign Up to Wedding Planner</h2>
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
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {password && (
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeClosed className="eye-icon" /> : <Eye className="eye-icon" />}
                            </button>
                        )}
                    </div>

                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {confirmPassword && (
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeClosed className="eye-icon" /> : <Eye className="eye-icon" />}
                            </button>
                        )}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={error || loading}>
                        {loading ? <div className="small-loader"></div> : "Sign Up"}
                    </button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default Register;
