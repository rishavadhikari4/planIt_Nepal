"use client"

import { useState, useEffect } from "react"
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
  Users,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
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
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1,
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
      stiffness: 300,
      damping: 25,
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
    scale: 1.03,
    y: -8,
    boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 25px 25px -5px rgba(236, 72, 153, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
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
      damping: 25,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30,
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
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const fetchCuisines = async (page = 1, filters = {}) => {
    setLoading(true)
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

  useEffect(() => {
    fetchCuisines(1)
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
        className={`relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border overflow-hidden group ${
          isSelected ? "ring-4 ring-purple-500 border-purple-300" : "border-white/30 hover:border-purple-200"
        }`}
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <motion.img
            src={dish.image || "/placeholder.svg?height=200&width=300&query=delicious dish"}
            alt={dish.name}
            className="w-full h-40 sm:h-48 object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.6,
            }}
          />

          {/* Overlay Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Favorite Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(dishId)
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </motion.button>

          {/* Category Badge */}
          <motion.div
            className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {categoryName}
          </motion.div>

          {/* Selected Overlay */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <motion.div
                  className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <motion.h3
            className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300 text-balance"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {dish.name}
          </motion.h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 text-pretty">
            {dish.description || "A delicious dish perfect for your special celebration."}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
            {dish.servings && (
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{dish.servings} servings</span>
              </div>
            )}
            {dish.prepTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{dish.prepTime} min</span>
              </div>
            )}
            {dish.rating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                <span>{dish.rating}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {dish.price && (
            <div className="mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{dish.price}
              </span>
              <span className="text-gray-500 text-sm ml-1">per serving</span>
            </div>
          )}

          {/* Quantity Controls */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="flex items-center justify-center space-x-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, -1)
                  }}
                  className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-4 h-4 text-purple-600" />
                </motion.button>
                <motion.span
                  className="font-semibold text-purple-600 min-w-[2rem] text-center text-lg"
                  key={quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {quantity}
                </motion.span>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, 1)
                  }}
                  className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Select Button */}
          <motion.button
            onClick={() => handleDishSelection(dish)}
            className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              isSelected
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-600"
            }`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Select Dish</span>
              </>
            )}
          </motion.button>
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
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-12 h-12 border-4 border-pink-200 border-b-pink-600 rounded-full animate-spin animate-reverse"></div>
          </div>
          <motion.p
            className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-balance"
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
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div className="text-center mb-12" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="flex justify-center mb-6" variants={itemVariants}>
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/25"
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
            variants={itemVariants}
          >
            Exquisite Wedding Cuisine
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-pretty"
            variants={itemVariants}
          >
            Delight your guests with our carefully curated selection of gourmet dishes. From appetizers to desserts,
            create a memorable culinary experience for your special day.
          </motion.p>
        </motion.div>

        {!hasDishes ? (
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
              <Utensils className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No dishes available</h3>
            <p className="text-gray-600">Please check back later for our delicious menu options.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="max-w-6xl mx-auto mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/10 border border-white/30 p-8"
                variants={itemVariants}
              >
                {/* Prominent Search Bar */}
                <motion.div className="mb-6" variants={itemVariants}>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <motion.input
                      type="text"
                      placeholder="Search for delicious dishes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-16 pr-6 py-5 text-lg bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder:text-gray-400"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  </div>
                </motion.div>

                {/* Filter Row */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                  variants={itemVariants}
                >
                  {/* Price Range - Min */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <input
                      type="number"
                      placeholder="Min Price (₹)"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
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
                      placeholder="Max Price (₹)"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </motion.div>

                  {/* Category Filter */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-12 pr-8 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      {categoryNames.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
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
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-")
                        setSortField(field)
                        setSortOrder(order)
                      }}
                      className="w-full pl-12 pr-8 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                  <motion.button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-purple-500/25 flex items-center justify-center space-x-3"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search Dishes</span>
                  </motion.button>
                  <motion.button
                    onClick={clearFilters}
                    className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Clear Filters
                  </motion.button>
                </motion.div>

                {/* Selection Summary */}
                <AnimatePresence>
                  {selectedDishes.size > 0 && (
                    <motion.div
                      className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-semibold">
                          {selectedDishes.size} dish{selectedDishes.size > 1 ? "es" : ""} selected
                        </span>
                        <motion.button
                          onClick={() => {
                            setSelectedDishes(new Set())
                            setDishQuantities({})
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear Selection
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results Count */}
                <motion.div className="mt-6 text-center" variants={itemVariants}>
                  <p className="text-gray-600">
                    {isSearchActive ? "Search results: " : "Showing "}
                    <span className="font-semibold text-purple-600">
                      {pagination.totalDishesAcrossAllCuisines || 0}
                    </span>{" "}
                    dishes
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (Page {currentPage} of {pagination.totalPages})
                      </span>
                    )}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

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
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No dishes found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <motion.button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
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
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
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

              {pagination.totalPages > 1 && (
                <motion.div className="flex justify-center items-center space-x-3 mt-12" variants={itemVariants}>
                  <motion.button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>

                  <div className="flex space-x-2">
                    {getPageNumbers().map((pageNumber, index) => (
                      <motion.button
                        key={index}
                        onClick={() => typeof pageNumber === "number" && handlePageChange(pageNumber)}
                        disabled={pageNumber === "..."}
                        className={`w-12 h-12 rounded-2xl font-semibold transition-all duration-300 ${
                          pageNumber === currentPage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/25"
                            : pageNumber === "..."
                              ? "text-gray-400 cursor-not-allowed"
                              : "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-lg"
                        }`}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover={pageNumber !== "..." ? "hover" : "rest"}
                        whileTap={pageNumber !== "..." ? "tap" : "rest"}
                      >
                        {pageNumber}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedDishes.size > 0 && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
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
