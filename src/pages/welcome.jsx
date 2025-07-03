import React from "react"

import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { AuthContext } from "../context/AuthContext"
import { Heart, Sparkles, Star, Gift, Calendar, Users, Camera, MapPin, CheckCircle, ArrowRight } from "lucide-react"

const Welcome = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Auto-redirect after welcome sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRedirecting(true)
      setTimeout(() => {
        navigate("/")
      }, 1500)
    }, 4000) // Show welcome for 4 seconds

    return () => clearTimeout(timer)
  }, [navigate])

  // Step progression
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev))
    }, 1200)

    return () => clearInterval(stepTimer)
  }, [])

  const welcomeSteps = [
    {
      icon: Heart,
      title: "Welcome Back!",
      subtitle: `Hello ${user?.name || "Beautiful Bride"}`,
      description: "We're so excited to help you plan your perfect day",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Sparkles,
      title: "Your Dream Wedding Awaits",
      subtitle: "Let's make magic happen",
      description: "Discover venues, vendors, and everything you need",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Star,
      title: "Ready to Begin?",
      subtitle: "Your journey starts now",
      description: "Let's create memories that will last forever",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const features = [
    { icon: Calendar, label: "Plan Events", color: "text-blue-500" },
    { icon: Users, label: "Find Vendors", color: "text-green-500" },
    { icon: Camera, label: "Capture Moments", color: "text-purple-500" },
    { icon: MapPin, label: "Book Venues", color: "text-pink-500" },
    { icon: Gift, label: "Manage Gifts", color: "text-yellow-500" },
  ]

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          className="text-center space-y-6 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Taking you to your dashboard...
            </h2>
            <p className="text-gray-600">Get ready to plan your perfect wedding!</p>
          </div>

          <motion.div
            className="flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Main Welcome Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-12 text-center space-y-8"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Welcome Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
            >
              {/* Icon */}
              <motion.div
                className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r ${welcomeSteps[currentStep].color} rounded-full flex items-center justify-center shadow-2xl`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {React.createElement(welcomeSteps[currentStep].icon, {
                  className: "w-10 h-10 sm:w-12 sm:h-12 text-white",
                })}
              </motion.div>

              {/* Text Content */}
              <div className="space-y-4">
                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {welcomeSteps[currentStep].title}
                </motion.h1>

                <motion.h2
                  className="text-xl sm:text-2xl font-semibold text-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {welcomeSteps[currentStep].subtitle}
                </motion.h2>

                <motion.p
                  className="text-lg text-gray-600 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {welcomeSteps[currentStep].description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <motion.div
            className="flex justify-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-125"
                    : index < currentStep
                      ? "bg-gradient-to-r from-purple-400 to-pink-400"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </motion.div>

          {/* Features Preview */}
          <motion.div
            className="pt-8 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-6">What you can do:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-white/50 transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600 text-center">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Skip Button */}
          <motion.button
            onClick={() => {
              setIsRedirecting(true)
              setTimeout(() => navigate("/"), 500)
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 right-10 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-40"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-20 w-3 h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
    </div>
  )
}

export default Welcome
