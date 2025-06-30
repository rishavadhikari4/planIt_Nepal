import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeClosed } from "lucide-react";
import { useState, useContext } from "react";
import { motion } from "framer-motion";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 px-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-extrabold text-pink-600 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Login to Wedding Planner
        </motion.h2>

        {error && (
          <motion.p
            className="text-center text-red-600 font-semibold bg-red-100 p-3 rounded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition-transform"
            required
            whileFocus={{ scale: 1.02 }}
          />

          <motion.div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 pr-12"
              required
              whileFocus={{ scale: 1.02 }}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-pink-600 hover:text-pink-800 focus:outline-none"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? (
                  <EyeClosed className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold ${
              loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="w-6 h-6 mx-auto border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <motion.div
          className="flex items-center justify-center space-x-2 text-pink-600 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="border-b border-pink-600 w-12"></span>
          <span>or</span>
          <span className="border-b border-pink-600 w-12"></span>
        </motion.div>

        <motion.button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-md border border-pink-600 text-pink-600 font-semibold hover:bg-pink-50 transition"
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            (window.location.href =
              "https://wedding-planner-backend-drr8.onrender.com/api/auth/google/")
          }
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Login with Google</span>
        </motion.button>

        <p className="text-center text-l text-pink-600">
          Don’t have an account?{" "}
          <Link to="/register" className="font-semibold underline hover:text-pink-900">
            Register
          </Link>
        </p>

        <p className="text-center text-l text-pink-600">
          <Link to="/login/forgot-password" className="font-semibold underline hover:text-pink-900">
            Forgot Password?
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
