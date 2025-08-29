"use client"

import { AuthContext } from "../../context/AuthContext"
import { useState, useContext } from "react"
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const AdminLogin = () => {
  const { adminLogin } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
        mass: 0.6,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 140,
        damping: 12,
        mass: 0.5,
      },
    },
  }

  const buttonVariants = {
    idle: { scale: 1, boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)" },
    hover: {
      scale: 1.01,
      boxShadow: "0 12px 35px rgba(59, 130, 246, 0.35)",
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    tap: {
      scale: 0.99,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await adminLogin(email, password)
      console.log("Login successful")
    } catch (err) {
      setError(err.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-950 to-black px-3 sm:px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-500/12 to-indigo-600/12 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-indigo-600/12 to-purple-600/12 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]"></div>

      <motion.div
        className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full relative z-10 overflow-hidden mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-blue-400/15 to-indigo-500/15 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-xl"></div>

        <motion.div className="text-center mb-6 sm:mb-8" variants={itemVariants}>
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl"
            whileHover={{
              scale: 1.05,
              rotate: 5,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-gray-300 text-sm sm:text-base font-medium">Secure dashboard access</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/15 border border-red-400/25 rounded-xl sm:rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                </motion.div>
                <p className="text-red-300 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-gray-200 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors duration-300" />
              <motion.input
                type="email"
                id="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white/8 border border-white/15 rounded-xl sm:rounded-2xl text-white text-base placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 focus:backdrop-blur-3xl hover:bg-white/10"
                whileFocus={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                required
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm sm:text-base font-semibold text-gray-200 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors duration-300" />
              <motion.input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-white/8 border border-white/15 rounded-xl sm:rounded-2xl text-white text-base placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 focus:backdrop-blur-3xl hover:bg-white/10"
                whileFocus={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 overflow-hidden relative"
            variants={buttonVariants}
            initial="idle"
            whileHover={loading ? "idle" : "hover"}
            whileTap={loading ? "idle" : "tap"}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Access Dashboard</span>
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-500/15 border border-blue-400/25 rounded-xl sm:rounded-2xl backdrop-blur-sm"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-blue-200">Enterprise Security</p>
              <p className="text-xs sm:text-sm text-blue-300/80 mt-0.5">Protected with advanced encryption</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="mt-4 sm:mt-6 text-center" variants={itemVariants}>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">© 2024 Wedding Planner Admin</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
