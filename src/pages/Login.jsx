import "../styles/auth.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Eye,EyeClosed } from "lucide-react";

import { useState,useContext } from "react";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(email, password); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
 <div className="auth-container">
            <div className="auth-box">
                <h2>Login to Wedding Planner</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
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

                    <button type="submit">Login</button>
                </form>
                <div className="or-divider">
                    <span>or</span>
                </div>
                <button
                    type="button"
                    className="google-login-btn"
                    onClick={() =>
                        window.location.href =
                            "https://wedding-planner-backend-drr8.onrender.com/api/auth/google/"
                    }
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="google-logo"
                    />
                    <span>Login with Google</span>
                </button>
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;