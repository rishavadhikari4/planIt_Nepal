import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { toast } from "react-toastify"
import {
  Search,
  Filter,
  MapPin,
  ChefHat,
  Utensils,
  Plus,
  Minus,
  Heart,
  ShoppingCart,
  Star,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getAllCuisines, searchCuisines } from "../../services/cuisines"

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
      const options = {
        page,
        limit: 12,
        sortField: sortField,
        sortOrder: sortOrder,
        ...filters,
      }

      // Add price filters if they exist
      if (priceRange.min) {
        options.minPrice = priceRange.min
      }
      if (priceRange.max) {
        options.maxPrice = priceRange.max
      }

      // Add dish name filter for search
      if (searchTerm.trim()) {
        options.dishName = searchTerm.trim()
      }

      const response = await getAllCuisines(options)
      
      if (response.success) {
        setCuisines(response.cuisines || [])
        setPagination(response.pagination || {})
        setCurrentPage(page)
        setIsSearchActive(false)
      } else {
        throw new Error("Failed to fetch cuisines")
      }
    } catch (err) {
      console.error("Error fetching cuisines:", err)
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
      // Use searchCuisines for text-based search
      if (searchTerm.trim()) {
        const searchOptions = {
          query: searchTerm.trim(),
          limit: 12,
        }

        const response = await searchCuisines(searchOptions)
        
        // Handle search response structure
        setCuisines(response.cuisines || [])
        setPagination({
          totalPages: Math.ceil((response.totalResults || 0) / 12),
          currentPage: 1,
          totalCuisines: response.totalResults || 0,
        })
        setCurrentPage(1)
        setIsSearchActive(true)
      } else {
        // Use regular fetch with filters for other criteria
        const filters = {}
        
        if (priceRange.min) filters.minPrice = priceRange.min
        if (priceRange.max) filters.maxPrice = priceRange.max
        if (selectedCategory !== "all") filters.category = selectedCategory

        await fetchCuisines(page, filters, true)
        setIsSearchActive(Object.keys(filters).length > 0)
      }
    } catch (err) {
      console.error("Error searching cuisines:", err)
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
      isInitialized.current = true
      isInitialFetch.current = false
    }
  }, [])

  // Sort effect - only runs after initialization and skips loading for sort-only changes
  useEffect(() => {
    if (isInitialized.current && !isInitialFetch.current) {
      // Skip loading for sort-only updates
      fetchCuisines(currentPage, {}, true)
    }
  }, [sortField, sortOrder])

  const handleSearch = () => {
    const hasSearchCriteria = searchTerm.trim() || priceRange.min || priceRange.max || selectedCategory !== "all"

    if (hasSearchCriteria) {
      performSearch(1)
    } else {
      setIsSearchActive(false)
      fetchCuisines(1)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.totalPages || 1)) {
      if (isSearchActive && searchTerm.trim()) {
        // For text search, we need to handle pagination differently
        // Since the search API might not support pagination, we'll refetch
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
      const newSelected = new Set(prev)
      if (newSelected.has(dishId)) {
        newSelected.delete(dishId)
        setDishQuantities((prevQty) => {
          const newQty = { ...prevQty }
          delete newQty[dishId]
          return newQty
        })
      } else {
        newSelected.add(dishId)
        setDishQuantities((prevQty) => ({
          ...prevQty,
          [dishId]: 1,
        }))
      }
      return newSelected
    })
  }

  const updateQuantity = (dishId, change) => {
    setDishQuantities((prev) => {
      const newQty = Math.max(1, (prev[dishId] || 1) + change)
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
      toast.error("Please login to add items to cart.")
      navigate("/login")
      return
    }

    let addedCount = 0
    cuisines.forEach((cuisine) => {
      cuisine.dishes?.forEach((dish) => {
        if (selectedDishes.has(dish._id)) {
          const quantity = dishQuantities[dish._id] || 1
          addToCart({
            _id: dish._id,
            name: dish.name,
            price: dish.price,
            quantity: quantity,
            image: dish.dishImage || dish.image,
            type: "cuisine",
            category: cuisine.category,
          })
          addedCount++
        }
      })
    })

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} dish${addedCount > 1 ? "es" : ""} to cart!`)
      setSelectedDishes(new Set())
      setDishQuantities({})
    } else {
      toast.warning("Please select some dishes to add to cart.")
    }
  }

  const getFilteredCuisines = () => {
    return cuisines
      .map((cuisine) => ({
        ...cuisine,
        dishes: (cuisine.dishes || []).filter((dish) => {
          return selectedCategory === "all" || cuisine.category === selectedCategory
        }),
      }))
      .filter((cuisine) => cuisine.dishes.length > 0)
  }

  const filteredCuisines = getFilteredCuisines()
  const categoryNames = ["all", ...new Set(cuisines.map((cuisine) => cuisine.category).filter(Boolean))]

  const DishCard = ({ dish, categoryName }) => {
    const dishId = dish._id
    const isSelected = selectedDishes.has(dishId)
    const isFavorite = favorites.has(dishId)
    const quantity = dishQuantities[dishId] || 1

    return (
      <motion.div
        className={`group bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 overflow-hidden ${
          isSelected
            ? "border-purple-400 shadow-purple-500/25 ring-2 ring-purple-500/30"
            : "border-white/30 hover:border-purple-300 hover:shadow-purple-500/20"
        }`}
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        layout
      >
        {/* Dish Image */}
        <div className="relative overflow-hidden aspect-square">
          <motion.img
            src={dish.dishImage || dish.image || "/placeholder.svg"}
            alt={dish.name}
            className="w-full h-full object-cover"
            variants={imageVariants}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(dishId)
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </motion.button>
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <motion.div
              className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              Selected
            </motion.div>
          )}

          {/* Rating */}
          {dish.rating && (
            <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-800">{dish.rating}</span>
            </div>
          )}
        </div>

        {/* Dish Details */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
              {dish.name}
            </h3>
          </div>

          {dish.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{dish.price?.toLocaleString() || "N/A"}
              </span>
              <span className="text-gray-500 text-sm ml-1">per serving</span>
            </div>
          </div>

          {/* Selection Button */}
          <motion.button
            onClick={() => handleDishSelection(dish)}
            className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
              isSelected
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-600 hover:to-pink-600 hover:text-white"
            }`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isSelected ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Selection</span>
              </>
            )}
          </motion.button>

          {/* Quantity Controls */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="mt-3 flex items-center justify-center space-x-3 bg-purple-50 rounded-xl p-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, -1)
                  }}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="text-lg font-semibold text-purple-600 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, 1)
                  }}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
          }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          <motion.p
            className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            Loading delicious cuisines...
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
            Exquisite Cuisine
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
            {/* Search and Filter Section - Matching Venues.jsx exactly */}
            <motion.div
              className="max-w-6xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-4 sm:p-6 md:p-8">
                {/* Main Search Bar - Full Width */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for delicious dishes by name, cuisine, or ingredients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/70 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  </div>
                  <motion.button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base bg-gray-50/70 border-2 border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base bg-gray-50/70 border-2 border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  />

                  <div className="relative xs:col-span-2 sm:col-span-1">
                    <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 text-sm sm:text-base bg-gray-50/70 border-2 border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      {categoryNames.slice(1).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative xs:col-span-2 sm:col-span-2 lg:col-span-1">
                    <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-")
                        setSortField(field)
                        setSortOrder(order)
                      }}
                      className="w-full pl-10 sm:pl-12 pr-8 py-3 text-sm sm:text-base bg-gray-50/70 border-2 border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  <motion.button
                    onClick={clearFilters}
                    className="xs:col-span-2 sm:col-span-3 lg:col-span-1 bg-gray-100/70 hover:bg-gray-200/70 text-gray-700 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </motion.button>
                </div>

                {/* Results Count */}
                <motion.div
                  className="text-xs sm:text-sm text-gray-600 text-center sm:text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {isSearchActive ? (
                    <span>
                      Search results: <span className="font-semibold text-purple-600">{cuisines.length}</span> cuisines found
                    </span>
                  ) : (
                    <span>
                      Showing <span className="font-semibold text-purple-600">{cuisines.length}</span> cuisines
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Selected Dishes Summary */}
            <AnimatePresence>
              {selectedDishes.size > 0 && (
                <motion.div
                  className="max-w-6xl mx-auto mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-200"
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
                        Total: ₹{Object.values(dishQuantities).reduce((sum, qty) => sum + qty, 0) * 1000}
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

            {/* Cuisines Grid */}
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
                          {cuisine.dishes.length} dishes available
                        </p>
                      </div>
                    </motion.div>

                    {/* Dishes Grid - Matching Venues.jsx grid layout */}
                    <motion.div
                      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
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

            {/* Pagination - Matching Venues.jsx exactly */}
            {(pagination?.totalPages || 1) > 1 && (
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
                      disabled={currentPage === (pagination?.totalPages || 1)}
                      className="p-3 rounded-2xl bg-gray-100/70 hover:bg-gray-200/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={currentPage !== (pagination?.totalPages || 1) ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== (pagination?.totalPages || 1) ? { scale: 0.95 } : {}}
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

      {/* Floating Add to Cart Button */}
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