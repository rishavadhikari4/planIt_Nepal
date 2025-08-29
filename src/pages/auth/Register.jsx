"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import { Eye, DoorClosed as EyeClosed, UserPlus, Sparkles, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Register = () => {
  const { signup } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match!")
    } else {
      setError("")
    }
  }, [password, confirmPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (error) return
    setLoading(true)
    try {
      await signup(name, email, phone, password, confirmPassword)
    } catch (err) {
      setError(err.message || "Signup failed.")
    } finally {
      setLoading(false)
    }
  }

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const levels = [
      { text: "Very Weak", color: "text-red-500" },
      { text: "Weak", color: "text-orange-500" },
      { text: "Fair", color: "text-yellow-500" },
      { text: "Good", color: "text-blue-500" },
      { text: "Strong", color: "text-green-500" },
    ]

    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 px-3 sm:px-4 py-4 sm:py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      <motion.div
        className="max-w-sm sm:max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        <motion.div
          className="text-center space-y-2 sm:space-y-3"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.1,
          }}
        >
          <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Us Today
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">Create your account and start planning</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              <p className="text-red-600 font-medium text-center text-sm sm:text-base flex items-center justify-center">
                <XCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.15,
            }}
          >
            <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Full Name
            </label>
            <motion.input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
              required
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.2,
            }}
          >
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Email Address
            </label>
            <motion.input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
              required
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.25,
            }}
          >
            <label htmlFor="number" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Phone Number
            </label>
            <motion.input
              id="number"
              type="text"
              placeholder="Enter your number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
              required
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.3,
            }}
          >
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <motion.input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-800 placeholder-gray-500 pr-10 sm:pr-12 text-sm sm:text-base"
                required
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? (
                    <EyeClosed className="w-4 sm:w-5 h-4 sm:h-5" />
                  ) : (
                    <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                  )}
                </button>
              )}
            </div>
            {password && (
              <motion.div
                className="mt-2 space-y-1 sm:space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 1
                          ? "bg-red-500"
                          : passwordStrength.strength <= 2
                            ? "bg-orange-500"
                            : passwordStrength.strength <= 3
                              ? "bg-yellow-500"
                              : passwordStrength.strength <= 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.35,
            }}
          >
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <motion.input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-gray-800 placeholder-gray-500 pr-16 sm:pr-20 text-sm sm:text-base ${
                  confirmPassword && password === confirmPassword
                    ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                    : confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                }`}
                required
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
              {confirmPassword && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                    aria-label="Toggle Confirm Password Visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="w-4 sm:w-5 h-4 sm:h-5" />
                    ) : (
                      <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                    )}
                  </button>
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    {password === confirmPassword ? (
                      <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={error || loading || !name || !email || !password || !confirmPassword}
            className={`w-full py-3 sm:py-4 rounded-xl text-white font-bold text-sm sm:text-base md:text-lg shadow-lg transition-all duration-200 ${
              error || loading || !name || !email || !password || !confirmPassword
                ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
            }`}
            whileHover={{ scale: error || loading ? 1 : 1.02 }}
            whileTap={{ scale: error || loading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.4,
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Create Account</span>
              </div>
            )}
          </motion.button>
        </form>

        <motion.div
          className="flex items-center justify-center space-x-3 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.45,
          }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
          <span className="text-gray-500 font-medium px-2 sm:px-4 text-xs sm:text-sm">or sign up with</span>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
        </motion.div>

        <motion.button
          type="button"
          className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 hover:border-purple-300 hover:shadow-lg group text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => (window.location.href = "https://wedding-planner-backend-drr8.onrender.com/api/auth/google/")}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.5,
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 sm:w-6 h-5 sm:h-6 group-hover:scale-110 transition-transform duration-200"
          />
          <span>Continue with Google</span>
        </motion.button>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.55,
          }}
        >
          <p className="text-gray-600 text-sm sm:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Log In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
