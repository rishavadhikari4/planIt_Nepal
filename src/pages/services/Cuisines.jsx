"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  ChefHat,
  Utensils,
  Heart,
  Plus,
  Minus,
  Check,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { getAllCuisines, searchCuisines } from "../../services/cuisines"
import { useCart } from "../../context/CartContext"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      mass: 0.8,
    },
  },
}

const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 25px 25px -5px rgba(236, 72, 153, 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30,
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

const Cuisines = () => {
  const [cuisines, setCuisines] = useState([])
  const [pagination, setPagination] = useState({})
  const [selectedDishes, setSelectedDishes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState(new Set())
  const [dishQuantities, setDishQuantities] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isSearchActive, setIsSearchActive] = useState(false)
  
  // Add refs to track initialization and prevent double loading
  const isInitialized = useRef(false)
  const isInitialFetch = useRef(true)
  
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const fetchCuisines = async (page = 1, filters = {}, skipLoading = false) => {
    // Only show loading if not skipping and it's not a sort-only update
    if (!skipLoading) {
      setLoading(true)
    }
    
    try {
      const params = {
        page,
        limit: 10,
        sortField,
        sortOrder,
        ...filters,
      }

      const response = await getAllCuisines(params)
      setCuisines(response.cuisines || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
      setIsSearchActive(false)
      
      // Mark as initialized after first successful fetch
      if (isInitialFetch.current) {
        isInitialized.current = true
        isInitialFetch.current = false
      }
    } catch (err) {
      console.error("Failed to fetch cuisines:", err)
      toast.error("Failed to load cuisines. Please try again.")
      setCuisines([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (page = 1) => {
    setLoading(true)
    try {
      const searchOptions = {
        page,
        limit: 10,
        sortField,
        sortOrder,
      }

      if (searchTerm.trim()) {
        searchOptions.search = searchTerm.trim()
      }

      if (priceRange.min) {
        searchOptions.minPrice = Number.parseFloat(priceRange.min)
      }
      if (priceRange.max) {
        searchOptions.maxPrice = Number.parseFloat(priceRange.max)
      }

      const response = await searchCuisines(searchOptions)
      setCuisines(response.cuisines || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
      setIsSearchActive(true)
    } catch (err) {
      console.error("Failed to search cuisines:", err)
      toast.error("Failed to search cuisines. Please try again.")
      setCuisines([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  // Initial load effect - only runs once
  useEffect(() => {
    if (!isInitialized.current) {
      fetchCuisines(1)
    }
  }, [])

  // Sort effect - only runs after initialization and skips loading for sort-only changes
  useEffect(() => {
    if (isInitialized.current && !isInitialFetch.current) {
      // Skip loading screen for sort changes, just update the data quietly
      fetchCuisines(1, {}, true)
    }
  }, [sortField, sortOrder])

  const handleSearch = () => {
    const hasSearchCriteria = searchTerm.trim() || priceRange.min || priceRange.max

    if (hasSearchCriteria) {
      performSearch(1)
    } else {
      fetchCuisines(1)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      if (isSearchActive) {
        performSearch(page)
      } else {
        fetchCuisines(page)
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange({ min: "", max: "" })
    setSelectedCategory("all")
    setCurrentPage(1)
    setIsSearchActive(false)
    fetchCuisines(1)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const totalPages = pagination.totalPages || 1
    const currentPageNum = currentPage

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPageNum <= 4) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i)
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPageNum >= totalPages - 3) {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i)
      } else {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) pageNumbers.push(i)
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const handleDishSelection = (dish) => {
    const dishId = dish._id
    setSelectedDishes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dishId)) {
        newSet.delete(dishId)
        setDishQuantities((prevQty) => {
          const newQty = { ...prevQty }
          delete newQty[dishId]
          return newQty
        })
      } else {
        newSet.add(dishId)
        setDishQuantities((prevQty) => ({ ...prevQty, [dishId]: 1 }))
      }
      return newSet
    })
  }

  const updateQuantity = (dishId, change) => {
    setDishQuantities((prev) => {
      const currentQty = prev[dishId] || 1
      const newQty = Math.max(1, currentQty + change)
      return { ...prev, [dishId]: newQty }
    })
  }

  const toggleFavorite = (dishId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(dishId)) {
      newFavorites.delete(dishId)
      toast.info("Removed from favorites")
    } else {
      newFavorites.add(dishId)
      toast.success("Added to favorites! ❤️")
    }
    setFavorites(newFavorites)
  }

  const handleSubmit = () => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.info("Please login to add items to your cart")
      navigate("/login")
      return
    }

    let addedCount = 0
    cuisines.forEach((cuisine) => {
      if (cuisine.dishes && Array.isArray(cuisine.dishes)) {
        cuisine.dishes.forEach((dish) => {
          if (selectedDishes.has(dish._id)) {
            const quantity = dishQuantities[dish._id] || 1
            const dishToAdd = {
              ...dish,
              type: "dish",
              quantity: quantity,
            }
            const success = addToCart(dishToAdd, null, true)
            if (success !== false) {
              addedCount++
            }
          }
        })
      }
    })

    if (addedCount > 0) {
      toast.success(`Successfully added ${addedCount} dish${addedCount > 1 ? "es" : ""} to cart! ✨`)
      setSelectedDishes(new Set())
      setDishQuantities({})
    } else {
      toast.warning("No dishes were added to cart")
    }
  }

  const getFilteredCuisines = () => {
    return cuisines
      .map((cuisine) => ({
        ...cuisine,
        dishes: (cuisine.dishes || []).filter((dish) => {
          const matchesCategory = selectedCategory === "all" || cuisine.category === selectedCategory
          return matchesCategory
        }),
      }))
      .filter((cuisine) => cuisine.dishes.length > 0)
  }

  const filteredCuisines = getFilteredCuisines()
  const categoryNames = ["all", ...cuisines.map((cuisine) => cuisine.category).filter(Boolean)]

  const DishCard = ({ dish, categoryName }) => {
    const dishId = dish._id
    const isSelected = selectedDishes.has(dishId)
    const isFavorite = favorites.has(dishId)
    const quantity = dishQuantities[dishId] || 1

    return (
      <motion.div
        className={`relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border overflow-hidden group ${
          isSelected ? "ring-2 sm:ring-4 ring-purple-500 border-purple-300" : "border-white/30 hover:border-purple-200"
        }`}
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Image Container - Responsive height */}
        <div className="relative overflow-hidden">
          <motion.img
            src={dish.image || "/placeholder.svg?height=200&width=300&query=delicious dish"}
            alt={dish.name}
            className="w-full h-32 sm:h-40 lg:h-48 object-cover"
            variants={imageVariants}
          />

          {/* Enhanced Overlay Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Favorite Button - Responsive sizing */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(dishId)
            }}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={`w-3 h-3 sm:w-5 sm:h-5 transition-colors duration-200 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </motion.button>

          {/* Enhanced Category Badge - Responsive sizing */}
          <motion.div
            className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {categoryName}
          </motion.div>

          {/* Enhanced Selected Overlay */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content - Responsive padding and text sizes */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Dish Name - Responsive text size */}
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800 mb-1 sm:mb-2 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
            {dish.name}
          </h3>

          {/* Description - Hidden on mobile to save space */}
          <p className="hidden sm:block text-gray-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4 line-clamp-2">
            {dish.description || "A delicious dish that will satisfy your taste buds."}
          </p>

          {/* Price and Rating - Responsive layout */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            {dish.price && (
              <div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${dish.price.toFixed(2)}
                </span>
              </div>
            )}
            {dish.rating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{dish.rating}</span>
              </div>
            )}
          </div>

          {/* Quantity Controls and Select Button - Responsive */}
          <div className="flex items-center justify-between gap-2">
            {/* Quantity Controls - Smaller on mobile */}
            <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  updateQuantity(dishId, Math.max(1, quantity - 1))
                }}
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                whileTap={{ scale: 0.9 }}
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-gray-800 min-w-[24px] sm:min-w-[32px] text-center">
                {quantity}
              </span>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  updateQuantity(dishId, quantity + 1)
                }}
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Select Button - Responsive sizing */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleDishSelection(dish)
              }}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 ${
                isSelected
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isSelected ? (
                <>
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Remove</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Select</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
          }}
        >
          <motion.div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute inset-2 w-8 h-8 border-4 border-pink-200 border-b-pink-600 rounded-full"
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </motion.div>
          <motion.p
            className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            Loading delicious dishes...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  const hasDishes = cuisines.some(
    (cuisine) => cuisine.dishes && Array.isArray(cuisine.dishes) && cuisine.dishes.length > 0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 100,
          }}
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-purple-500/25"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.4)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ChefHat className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Exquisite Wedding Cuisine
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Delight your guests with our carefully curated selection of gourmet dishes. From appetizers to desserts,
            create a memorable culinary experience for your special day.
          </motion.p>
        </motion.div>

        {!hasDishes ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.6,
              duration: 0.6,
              type: "spring",
              stiffness: 100,
            }}
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Utensils className="w-16 h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No dishes available</h3>
            <p className="text-gray-600 text-lg">Please check back later for our delicious menu options.</p>
          </motion.div>
        ) : (
          <>
            {/* Search and Filter Section */}
            <motion.div
              className="max-w-6xl mx-auto mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                    <motion.input
                      type="text"
                      placeholder="Search for delicious dishes by name, cuisine, or ingredients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-5 text-base sm:text-lg bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {/* Price Range - Min */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </motion.div>

                  {/* Price Range - Max */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </motion.div>

                  {/* Cuisine Filter */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-8 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categoryNames.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Sort */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-")
                        setSortField(field)
                        setSortOrder(order)
                      }}
                      className="w-full pl-10 sm:pl-12 pr-8 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <motion.button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Search Dishes</span>
                  </motion.button>
                  <motion.button
                    onClick={clearFilters}
                    className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Clear Filters
                  </motion.button>
                </div>

                <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600">
                    {isSearchActive ? "Search results: " : "Showing "}
                    <span className="font-semibold text-purple-600">{cuisines.length}</span> of{" "}
                    <span className="font-semibold">{pagination.totalCuisines || 0}</span> dishes
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (Page {currentPage} of {pagination.totalPages})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Selection Summary - Responsive */}
            <AnimatePresence>
              {selectedDishes.size > 0 && (
                <motion.div
                  className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-200"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <span className="text-sm sm:text-base font-medium text-purple-800">
                        {selectedDishes.size} dish{selectedDishes.size !== 1 ? "es" : ""} selected
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-purple-600 font-semibold">
                        Total: ₹{selectedDishes.size * 1000} {/* Placeholder for total price */}
                      </span>
                      <motion.button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cuisines and Dishes */}
            <motion.div className="max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
              {filteredCuisines.length === 0 ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.6,
                  }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">No dishes found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <motion.button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Clear Filters
                  </motion.button>
                </motion.div>
              ) : (
                filteredCuisines.map((cuisine, cuisineIndex) => (
                  <motion.div key={cuisine._id} className="mb-16" variants={itemVariants}>
                    <motion.div
                      className="flex items-center mb-8"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <motion.div
                        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-purple-500/25"
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          boxShadow: "0 20px 40px -12px rgba(147, 51, 234, 0.4)",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Utensils className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {cuisine.category.charAt(0).toUpperCase() + cuisine.category.slice(1)}
                        </h2>
                        <p className="text-gray-600">
                          {cuisine.dishes.length} of {cuisine.dishesMetadata?.totalDishes || cuisine.dishes.length}{" "}
                          dishes
                          {cuisine.dishesMetadata && (
                            <span className="ml-2">
                              (Page {cuisine.dishesMetadata.currentPage} of {cuisine.dishesMetadata.totalPages})
                            </span>
                          )}
                        </p>
                      </div>
                    </motion.div>

                    {/* Dishes Grid */}
                    <motion.div
                      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8"
                      variants={containerVariants}
                    >
                      <AnimatePresence>
                        {cuisine.dishes.map((dish, dishIndex) => (
                          <motion.div key={dish._id} variants={itemVariants} layout>
                            <DishCard dish={dish} categoryName={cuisine.category} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {pagination.totalPages > 1 && (
              <motion.div
                className="flex justify-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-3">
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <motion.button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 rounded-2xl bg-gray-100/70 hover:bg-gray-200/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      <motion.button
                        key={index}
                        onClick={() => typeof page === "number" && handlePageChange(page)}
                        disabled={typeof page !== "number"}
                        className={`px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                          page === currentPage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : typeof page === "number"
                              ? "bg-gray-100/70 hover:bg-gray-200/70 text-gray-700"
                              : "text-gray-400 cursor-default"
                        }`}
                        whileHover={typeof page === "number" && page !== currentPage ? { scale: 1.05 } : {}}
                        whileTap={typeof page === "number" && page !== currentPage ? { scale: 0.95 } : {}}
                      >
                        {page}
                      </motion.button>
                    ))}

                    {/* Next Button */}
                    <motion.button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-3 rounded-2xl bg-gray-100/70 hover:bg-gray-200/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={currentPage !== pagination.totalPages ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== pagination.totalPages ? { scale: 0.95 } : {}}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Enhanced floating cart button */}
      <AnimatePresence>
        {selectedDishes.size > 0 && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 1,
            }}
          >
            <motion.button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-3xl font-bold shadow-2xl shadow-purple-500/30 flex items-center space-x-4"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Add {selectedDishes.size} to Cart</span>
              <motion.div
                className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {Object.values(dishQuantities).reduce((sum, qty) => sum + qty, 0)}
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cuisines