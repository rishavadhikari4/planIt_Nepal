"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles,  
  MapPin, 
  Users, 
  Camera, 
  Utensils, 
  Building2,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  X,
  ArrowRight,
  PiggyBank,
  Award,
  Target,
  ShoppingCart
} from "lucide-react"
import { toast } from "react-toastify"
import { getWeddingPackageRecommendation } from "../services/recommendations"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

const RecommendationComponent = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [formData, setFormData] = useState({
    venueBudget: "",
    studioBudget: "",
    foodBudget: "",
    location: "",
    guestCount: "",
    preferredServices: []
  })

  const services = [
    'Wedding Photography',
    'Pre-wedding Shoot', 
    'Video Recording',
    'Event Coverage',
    'Portrait Session',
    'Drone Photography',
    'Photo Editing',
    'Album Design'
  ]

  // Add useEffect to debug formData changes
  useEffect(() => {
  }, [formData])

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 30,
      transition: { duration: 0.2 }
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.3 }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(service)
        ? prev.preferredServices.filter(s => s !== service)
        : [...prev.preferredServices, service]
    }))
  }

  const validateStep1 = () => {
    // No validation needed for step 1 anymore since all fields are optional
    return true
  }

  const handleNextStep = () => {
    console.log('Next button clicked, current formData:', formData)
    if (validateStep1()) {
      setStep(2)
      toast.success("Moving to preferences step")
    }
  }

  const handleGetRecommendations = async () => {
    setLoading(true)
    try {
      console.log('Sending recommendation request with data:', formData)
      
      // Calculate total budget from individual budgets
      const totalBudget = (parseFloat(formData.venueBudget || 0) + 
                          parseFloat(formData.studioBudget || 0) + 
                          parseFloat(formData.foodBudget || 0)) || 100000; // Default if no budgets specified
      
      const requestData = {
        totalBudget: totalBudget.toString(),
        venueBudget: formData.venueBudget,
        studioBudget: formData.studioBudget,
        foodBudget: formData.foodBudget,
        location: formData.location,
        guestCount: formData.guestCount,
        preferredServices: formData.preferredServices.join(',')
      }
      
      const response = await getWeddingPackageRecommendation(requestData)
      
      console.log('Recommendation response:', response)
      if (response.success) {
        setRecommendations(response.data)
        setStep(3)
        toast.success("Perfect package recommendations found! 🎉")
      }
    } catch (error) {
      console.error('Recommendation error:', error)
      toast.error(error.message || "Failed to get recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPackageToCart = () => {
    if (!recommendations) return

    const packageItems = []
    
    // Add venue if available
    if (recommendations.package.venue) {
      packageItems.push({
        _id: recommendations.package.venue._id,
        name: recommendations.package.venue.name,
        price: recommendations.package.venue.price,
        image: recommendations.package.venue.venueImage,
        type: "venue"
      })
    }

    // Add studio if available
    if (recommendations.package.studio) {
      packageItems.push({
        _id: recommendations.package.studio._id,
        name: recommendations.package.studio.name,
        price: recommendations.package.studio.price,
        image: recommendations.package.studio.studioImage,
        type: "studio"
      })
    }

    // Add dishes
    recommendations.package.dishes.forEach(dish => {
      packageItems.push({
        _id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        type: "cuisine",
        category: dish.category
      })
    })

    // Add all items to cart with recommendation package flag
    let successCount = 0;
    packageItems.forEach(item => {
      const isVenueOrStudio = item.type === "venue" || item.type === "studio";
      const success = addToCart(item, null, true, isVenueOrStudio); // silent mode for individual items
      if (success) successCount++;
    })
    
    if (successCount > 0) {
      toast.success(`Added ${successCount} items from recommended package to cart! 🛒`);
      onClose()
      navigate('/cart')
    } else {
      toast.error("Failed to add package items to cart. Please try again.");
    }
  }

  const renderStep1 = () => (
    <motion.div
      key="step1"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Budget Planning</h3>
        <p className="text-gray-600">Tell us your budget for each service (all optional)</p>
      </div>

      {/* Budget Distribution */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 mb-3">
          Service Budgets (Optional)
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Budget</label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={formData.venueBudget}
                onChange={(e) => handleInputChange('venueBudget', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photography Budget</label>
              <input
                type="number"
                placeholder="e.g., 30000"
                value={formData.studioBudget}
                onChange={(e) => handleInputChange('studioBudget', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Utensils className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Budget</label>
              <input
                type="number"
                placeholder="e.g., 25000"
                value={formData.foodBudget}
                onChange={(e) => handleInputChange('foodBudget', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleNextStep}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Next: Preferences</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      key="step2"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Preferences</h3>
        <p className="text-gray-600">Help us personalize your wedding package</p>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Preferred Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter city or area"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Guest Count */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Expected Guest Count
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            placeholder="Number of guests"
            value={formData.guestCount}
            onChange={(e) => handleInputChange('guestCount', e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Photography Services */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Preferred Photography Services
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {services.map(service => (
            <motion.button
              key={service}
              onClick={() => handleServiceToggle(service)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                formData.preferredServices.includes(service)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {service}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <motion.button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Get Recommendations</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )

  const renderStep3 = () => {
    if (!recommendations) return null

    const { package: pkg, budgetAnalysis, insights } = recommendations

    return (
      <motion.div
        key="step3"
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Perfect Package</h3>
          <p className="text-gray-600">Curated just for your dream wedding</p>
        </div>

        {/* Package Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">Package Total</h4>
            <div className="text-right">
              <div className="text-xl font-bold text-purple-600">
                Rs {pkg.totalPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {budgetAnalysis.budgetUtilization}% of budget used
              </div>
            </div>
          </div>
          
          {budgetAnalysis.savings > 0 && (
            <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-2">
              <PiggyBank className="w-4 h-4 mr-2" />
              <span className="font-semibold text-sm">
                You saveRs {budgetAnalysis.savings?.toLocaleString()}!
              </span>
            </div>
          )}
        </div>

        {/* Package Items */}
        <div className="space-y-3">
          {/* Venue */}
          {pkg.venue && (
            <motion.div
              className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
              whileHover={{ scale: 1.01, y: -1 }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={pkg.venue.venueImage || "/placeholder.svg"}
                  alt={pkg.venue.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building2 className="w-3 h-3 text-purple-500" />
                    <h5 className="font-semibold text-sm text-gray-800 truncate">{pkg.venue.name}</h5>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{pkg.venue.location}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-purple-600 font-semibold text-sm">
                      Rs {pkg.venue.price?.toLocaleString()}
                    </span>
                    {pkg.venue.rating && (
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs">{pkg.venue.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate(`/venues/${pkg.venue._id}`)}
                  className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Studio */}
          {pkg.studio && (
            <motion.div
              className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
              whileHover={{ scale: 1.01, y: -1 }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={pkg.studio.studioImage || "/placeholder.svg"}
                  alt={pkg.studio.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Camera className="w-3 h-3 text-purple-500" />
                    <h5 className="font-semibold text-sm text-gray-800 truncate">{pkg.studio.name}</h5>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{pkg.studio.location}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-purple-600 font-semibold text-sm">
                      Rs {pkg.studio.price?.toLocaleString()}
                    </span>
                    {pkg.studio.rating && (
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs">{pkg.studio.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate(`/studios/${pkg.studio._id}`)}
                  className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Dishes */}
          {pkg.dishes && pkg.dishes.length > 0 && (
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Utensils className="w-3 h-3 text-purple-500" />
                <h5 className="font-semibold text-sm text-gray-800">
                  Recommended Dishes ({pkg.dishes.length} items)
                </h5>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {pkg.dishes.map((dish, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-2">
                      <img
                        src={dish.image || "/placeholder.svg"}
                        alt={dish.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-xs">{dish.name}</div>
                        <div className="text-xs text-gray-500">{dish.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-purple-600 font-semibold text-xs">
                        Rs {dish.price?.toLocaleString()}
                      </span>
                      {dish.rating && (
                        <div className="flex items-center">
                          <Star className="w-2 h-2 text-yellow-400 fill-current mr-0.5" />
                          <span className="text-xs">{dish.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Insights - Compact */}
        {((insights.benefits && insights.benefits.length > 0) || (insights.recommendations && insights.recommendations.length > 0)) && (
          <div className="space-y-2">
            {insights.benefits && insights.benefits.length > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-1 flex items-center text-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Benefits
                </h5>
                <ul className="space-y-0.5">
                  {insights.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="text-xs text-green-700 flex items-center">
                      <div className="w-1 h-1 bg-green-500 rounded-full mr-1" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <h5 className="font-semibold text-amber-800 mb-1 flex items-center text-sm">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Tips
                </h5>
                <ul className="space-y-0.5">
                  {insights.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="text-xs text-amber-700 flex items-center">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mr-1" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-2">
          <motion.button
            onClick={() => setStep(2)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Modify
          </motion.button>
          <motion.button
            onClick={handleAddPackageToCart}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Wedding Package Recommender</h2>
                <p className="text-purple-100 text-sm">Step {step} of 3</p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 bg-white/20 rounded-full h-1.5">
              <motion.div
                className="bg-white rounded-full h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RecommendationComponent