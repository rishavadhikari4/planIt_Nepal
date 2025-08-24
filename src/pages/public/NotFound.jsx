"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Home, ArrowLeft, Search, Heart, Sparkles, MapPin, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const NotFound = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)
  const [showCountdown, setShowCountdown] = useState(false)

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  useEffect(() => {
    // Start countdown after 3 seconds
    const timer = setTimeout(() => {
      setShowCountdown(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      navigate("/")
    }
  }, [countdown, showCountdown, navigate])

  const popularPages = [
    { name: "Home", path: "/", icon: Home, description: "Return to homepage" },
    { name: "Venues", path: "/venues", icon: MapPin, description: "Browse wedding venues" },
    { name: "Dishes", path: "/dishes", icon: "🍽️", description: "Explore catering options" },
    { name: "studios", path: "/studios", icon: "🌸", description: "View studio themes" },
    { name: "Contact", path: "/contact", icon: "📞", description: "Get in touch with us" },
  ]

  const floatingElements = [
    { emoji: "💍", delay: 0, x: "10%", y: "20%" },
    { emoji: "💐", delay: 0.5, x: "80%", y: "15%" },
    { emoji: "🎂", delay: 1, x: "15%", y: "70%" },
    { emoji: "🥂", delay: 1.5, x: "85%", y: "75%" },
    { emoji: "💕", delay: 2, x: "50%", y: "10%" },
    { emoji: "🌹", delay: 2.5, x: "90%", y: "45%" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-pink-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Wedding Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl pointer-events-none"
          style={{ left: element.x, top: element.y }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            rotate: [0, 360],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        >
          {element.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main 404 Content */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* 404 Number */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent leading-none">
                404
              </h1>
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <div className="w-32 h-32 border-4 border-purple-300/30 rounded-full"></div>
              </motion.div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                It looks like this page got lost on its way to the altar! Don't worry, we'll help you find your way back
                to planning your perfect wedding.
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">You tried to visit: {location.pathname}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Return Home</span>
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Popular Pages */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center justify-center">
              <Search className="w-6 h-6 mr-2 text-purple-600" />
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularPages.map((page, index) => (
                <motion.button
                  key={page.path}
                  onClick={() => navigate(page.path)}
                  className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      {typeof page.icon === "string" ? (
                        <span className="text-xl">{page.icon}</span>
                      ) : (
                        <page.icon className="w-6 h-6" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                      {page.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{page.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Auto Redirect Countdown */}
          <AnimatePresence>
            {showCountdown && countdown > 0 && (
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg font-semibold">
                    Redirecting to home in{" "}
                    <motion.span
                      key={countdown}
                      className="inline-block text-2xl font-bold"
                      initial={{ scale: 1.5, color: "#fbbf24" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      {countdown}
                    </motion.span>{" "}
                    seconds
                  </span>
                  <Heart className="w-6 h-6" />
                </div>
                <button
                  onClick={() => setShowCountdown(false)}
                  className="mt-3 text-sm text-purple-200 hover:text-white underline transition-colors duration-200"
                >
                  Cancel auto-redirect
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Message */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <p className="text-gray-500 text-sm">
              Lost but not forgotten - every great love story has a few detours! 💕
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
