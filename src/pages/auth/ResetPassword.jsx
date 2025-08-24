import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { postResetPassword } from "../../services/auth"
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  ArrowLeft,
  Sparkles,
  Heart,
  AlertTriangle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ResetPassword = () => {
  const { resetToken } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  // Password strength validation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const levels = [
      { text: "Very Weak", color: "text-red-500", bgColor: "bg-red-500" },
      { text: "Weak", color: "text-orange-500", bgColor: "bg-orange-500" },
      { text: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500" },
      { text: "Good", color: "text-blue-500", bgColor: "bg-blue-500" },
      { text: "Strong", color: "text-green-500", bgColor: "bg-green-500" },
    ]

    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  // Check if passwords match
  useEffect(() => {
    if (confirmNewPassword) {
      setPasswordsMatch(newPassword === confirmNewPassword)
    } else {
      setPasswordsMatch(true)
    }
  }, [newPassword, confirmNewPassword])

  // Validate token on component mount
  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false)
      toast.error("Invalid reset link. Please request a new password reset.")
    }
  }, [resetToken])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!passwordsMatch) {
      toast.error("Passwords do not match!")
      return
    }

    if (passwordStrength.strength < 3) {
      toast.error("Please choose a stronger password!")
      return
    }

    setLoading(true)

    try {
      const response = await postResetPassword(resetToken, newPassword, confirmNewPassword)
      toast.success(response.message || "Password reset successfully!")
      setIsSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      toast.error(error.message || "Failed to reset password. Please try again.")
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        setTokenValid(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
          <motion.div
            className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md border border-white/20 text-center"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/login/forgot-password"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block"
            >
              Request New Reset Link
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-2xl"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          🔐
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 text-2xl"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
        >
          🔑
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-2xl"
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
        >
          🛡️
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-2xl"
          animate={{ y: [0, -8, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
        >
          ✨
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen px-4 py-8">
        <motion.div
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md border border-white/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-30 blur-lg"></div>

          {/* Back Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Login
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Header Section */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Key className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Reset Your Password
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Create a new secure password for your wedding planning account
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <motion.div
                        className="mt-3 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-2">
                            {newPassword.length >= 8 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/[A-Z]/.test(newPassword) ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>One uppercase letter</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/[0-9]/.test(newPassword) ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>One number</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 text-gray-800 placeholder-gray-500 ${
                          confirmNewPassword && passwordsMatch
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : confirmNewPassword && !passwordsMatch
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                        }`}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        placeholder="Confirm your new password"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {confirmNewPassword && (
                          <div>
                            {passwordsMatch ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-500 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Match Indicator */}
                    {confirmNewPassword && (
                      <motion.div
                        className="mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`flex items-center space-x-2 text-sm ${
                            passwordsMatch ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {passwordsMatch ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{passwordsMatch ? "Passwords match!" : "Passwords don't match"}</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !passwordsMatch || passwordStrength.strength < 3}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Reset Password</span>
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Security Note */}
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Password Security Tips</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Use a mix of letters, numbers, and symbols. Avoid common words or personal information.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                {/* Success Animation */}
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successfully!</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-700">
                    <strong>Redirecting to login...</strong> You'll be automatically redirected in a few seconds.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Continue to Login</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <p className="text-gray-400 text-xs flex items-center justify-center">
              <Heart className="w-3 h-3 mr-1" />
              Secure password reset for your wedding planning account
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword
