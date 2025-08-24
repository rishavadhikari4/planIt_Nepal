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
  ChevronRight
} from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { getAllCuisines, searchCuisines } from "../../services/cuisines"
import { useCart } from "../../context/CartContext"

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
        ...filters
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
        sortOrder
      }

      if (searchTerm.trim()) {
        searchOptions.search = searchTerm.trim()
      }

      if (priceRange.min) {
        searchOptions.minPrice = parseFloat(priceRange.min)
      }
      if (priceRange.max) {
        searchOptions.maxPrice = parseFloat(priceRange.max)
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
    const hasSearchCriteria = searchTerm.trim() || 
                             priceRange.min || 
                             priceRange.max

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
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (currentPageNum >= totalPages - 3) {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i)
      } else {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) pageNumbers.push(i)
        pageNumbers.push('...')
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
              quantity: quantity
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
        className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border transition-all duration-500 overflow-hidden group ${
          isSelected ? "ring-4 ring-purple-500 border-purple-300" : "border-white/20 hover:border-purple-200"
        }`}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={dish.image || "/placeholder.svg?height=200&width=300"}
            alt={dish.name}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(dishId)
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            {categoryName}
          </div>

          {/* Selected Overlay */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
            {dish.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
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
            <div className="mb-3">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{dish.price}
              </span>
              <span className="text-gray-500 text-sm ml-1">per serving</span>
            </div>
          )}

          {/* Quantity Controls */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="flex items-center justify-center space-x-3 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, -1)
                  }}
                  className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Minus className="w-4 h-4 text-purple-600" />
                </button>
                <span className="font-semibold text-purple-600 min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(dishId, 1)
                  }}
                  className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Select Button */}
          <button
            onClick={() => handleDishSelection(dish)}
            className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              isSelected
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-600"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Select Dish</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading delicious dishes...
          </p>
        </motion.div>
      </div>
    )
  }

  const hasDishes = cuisines.some((cuisine) => cuisine.dishes && Array.isArray(cuisine.dishes) && cuisine.dishes.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Exquisite Wedding Cuisine
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Delight your guests with our carefully curated selection of gourmet dishes. From appetizers to desserts,
            create a memorable culinary experience for your special day.
          </p>
        </motion.div>

        {!hasDishes ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
              <Utensils className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No dishes available</h3>
            <p className="text-gray-600">Please check back later for our delicious menu options.</p>
          </motion.div>
        ) : (
          <>
            {/* Search and Filter Section */}
            <motion.div
              className="max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search dishes by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Price Range - Min */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Price Range - Max */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Category Filter */}
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer min-w-[200px]"
                    >
                      {categoryNames.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-')
                        setSortField(field)
                        setSortOrder(order)
                      }}
                      className="w-full pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSearch}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={clearFilters}
                      className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Selection Summary */}
                {selectedDishes.size > 0 && (
                  <motion.div
                    className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-semibold">
                        {selectedDishes.size} dish{selectedDishes.size > 1 ? "es" : ""} selected
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDishes(new Set())
                          setDishQuantities({})
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Results Count */}
                <div className="mt-4 text-center">
                  <p className="text-gray-600">
                    {isSearchActive ? "Search results: " : "Showing "}
                    <span className="font-semibold text-purple-600">{pagination.totalDishesAcrossAllCuisines || 0}</span> dishes
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (Page {currentPage} of {pagination.totalPages})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cuisines and Dishes */}
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {filteredCuisines.length === 0 ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No dishes found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                filteredCuisines.map((cuisine, cuisineIndex) => (
                  <motion.div
                    key={cuisine._id}
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: cuisineIndex * 0.1, duration: 0.6 }}
                  >
                    {/* Cuisine Header */}
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                        <Utensils className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {cuisine.category.charAt(0).toUpperCase() + cuisine.category.slice(1)}
                        </h2>
                        <p className="text-gray-600">
                          {cuisine.dishes.length} of {cuisine.dishesMetadata?.totalDishes || cuisine.dishes.length} dishes
                          {cuisine.dishesMetadata && (
                            <span className="ml-2">
                              (Page {cuisine.dishesMetadata.currentPage} of {cuisine.dishesMetadata.totalPages})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Dishes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {cuisine.dishes.map((dish, dishIndex) => (
                          <motion.div
                            key={dish._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: dishIndex * 0.05, duration: 0.4 }}
                            layout
                          >
                            <DishCard dish={dish} categoryName={cuisine.category} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <motion.div
                  className="flex justify-center items-center space-x-2 mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                      disabled={pageNumber === '...'}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        pageNumber === currentPage
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                          : pageNumber === '...'
                          ? "cursor-default"
                          : "bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-purple-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
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
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Add {selectedDishes.size} to Cart</span>
              <div className="bg-white/20 rounded-full px-2 py-1 text-sm">
                {Object.values(dishQuantities).reduce((sum, qty) => sum + qty, 0)}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cuisines
