import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const { signup } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 px-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-3xl font-extrabold text-pink-600 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Sign Up to Wedding Planner
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.p
              className="text-center text-red-600 font-semibold bg-red-100 p-3 rounded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
            required
            whileFocus={{ scale: 1.02 }}
          />

          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
            required
            whileFocus={{ scale: 1.02 }}
          />

          <div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition pr-12"
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
                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>

          <div className="relative">
            <motion.input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition pr-12"
              required
              whileFocus={{ scale: 1.02 }}
            />
            {confirmPassword && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-pink-600 hover:text-pink-800 focus:outline-none"
                aria-label="Toggle Confirm Password Visibility"
              >
                {showConfirmPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={error || loading}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3 rounded-md text-white font-semibold transition transform ${
              error || loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 mx-auto border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <motion.p
          className="text-center text-l text-pink-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline hover:text-pink-900 transition-colors"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
