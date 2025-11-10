import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion"
import { 
  Search, 
  MapPin, 
  Star, 
  Camera, 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List, 
  Heart, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"
import { toast } from "react-toastify"
import { getAllStudios, searchStudios } from "../../services/studios"

const Studios = () => {
  const [studios, setStudios] = useState([])
  const [pagination, setPagination] = useState({
    totalStudios: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [locationFilter, setLocationFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showPreview, setShowPreview] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const navigate = useNavigate()

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  const hoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const imageVariants = {
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98
    }
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 30,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  const fetchStudios = async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      
      const params = {
        page,
        limit: 12, 
        sortField,
        sortOrder,
        ...filters
      }

      if (priceRange.min) params.minPrice = priceRange.min
      if (priceRange.max) params.maxPrice = priceRange.max
      if (locationFilter) params.location = locationFilter

      const response = await getAllStudios(params)
      
      setStudios(response.studios || [])
      
      const paginationData = response.pagination || {}
      setPagination({
        totalStudios: paginationData.totalStudios || response.studios?.length || 0,
        totalPages: paginationData.totalPages || 1,
        currentPage: paginationData.currentPage || page,
        hasNextPage: paginationData.hasNextPage || false,
        hasPrevPage: paginationData.hasPrevPage || false
      })
      
      setCurrentPage(page)
      setIsSearchActive(false)
    } catch (error) {
      console.error("Error fetching studios:", error)
      toast.error("Failed to load studios")
      setStudios([])
      setPagination({
        totalStudios: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      })
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (page = 1) => {
    if (!searchTerm.trim()) {
      setIsSearchActive(false)
      fetchStudios(page)
      return
    }

    try {
      setLoading(true)
      setIsSearchActive(true)
      
      const searchOptions = {
        q: searchTerm,
        page,
        limit: 12,
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
        ...(locationFilter && { location: locationFilter })
      }

      const response = await searchStudios(searchOptions)
      
      setStudios(response.studios || [])
      
      const paginationData = response.pagination || {}
      setPagination({
        totalStudios: paginationData.totalStudios || response.studios?.length || 0,
        totalPages: paginationData.totalPages || 1,
        currentPage: paginationData.currentPage || page,
        hasNextPage: paginationData.hasNextPage || false,
        hasPrevPage: paginationData.hasPrevPage || false
      })
      
      setCurrentPage(page)
    } catch (error) {
      console.error("Error searching studios:", error)
      toast.error("Search failed. Please try again.")
      setStudios([])
      setPagination({
        totalStudios: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudios(1)
  }, [sortField, sortOrder])

  const handleSearch = () => {
    setCurrentPage(1)
    performSearch(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    if (isSearchActive) {
      performSearch(page)
    } else {
      const filters = {}
      if (priceRange.min) filters.minPrice = priceRange.min
      if (priceRange.max) filters.maxPrice = priceRange.max
      if (locationFilter) filters.location = locationFilter
      
      fetchStudios(page, filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange({ min: "", max: "" })
    setLocationFilter("")
    setCurrentPage(1)
    setIsSearchActive(false)
    fetchStudios(1)
  }

  const toggleFavorite = (studioId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(studioId)) {
      newFavorites.delete(studioId)
      toast.success("Removed from favorites")
    } else {
      newFavorites.add(studioId)
      toast.success("Added to favorites!")
    }
    setFavorites(newFavorites)
  }

  const getPageNumbers = () => {
    const totalPages = pagination?.totalPages || 1
    const current = currentPage
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index) => rangeWithDots.indexOf(item) === index)
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
            stiffness: 100
          }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.p 
            className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Loading studios...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Enhanced Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
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
              damping: 15
            }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
              <Camera className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Photography Studios
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Capture your precious moments with professional photography studios that specialize in creating timeless wedding memories
          </motion.p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.5, 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search studios by name, location, or specialty..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50/70 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50/70 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              />

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/70 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortField(field)
                    setSortOrder(order)
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-gray-50/70 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              <motion.button
                onClick={clearFilters}
                className="bg-gray-100/70 hover:bg-gray-200/70 text-gray-700 px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </motion.button>
            </div>

            {/* View Mode Toggle and Stats */}
            <div className="flex items-center justify-between">
              <motion.div 
                className="text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {isSearchActive ? (
                  <span>Search results: <span className="font-semibold text-purple-600">{pagination?.totalStudios || 0}</span> studios found</span>
                ) : (
                  <span>Showing <span className="font-semibold text-purple-600">{pagination?.totalStudios || 0}</span> studios</span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Studios Grid/List */}
        <div className="max-w-7xl mx-auto">
          {studios.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.6, 
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
            >
              <motion.div 
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Camera className="w-16 h-16 text-gray-400" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No Studios Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {isSearchActive 
                  ? "Try adjusting your search criteria or filters"
                  : "It looks like there are no studios available at the moment"
                }
              </p>
              {isSearchActive && (
                <motion.button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Clear Search
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                : "space-y-6"
              }>
                <AnimatePresence mode="popLayout">
                  {studios.map((studio, index) => (
                    <motion.div
                      key={studio._id}
                      className={`group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden transition-all duration-500 ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                      variants={cardVariants}
                      whileHover={hoverVariants.hover}
                      layout
                    >
                      {/* Studio Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-64 h-48" : "h-48 sm:h-56"
                      }`}>
                        <motion.img
                          src={studio.studioImage || "/placeholder.svg"}
                          alt={studio.name}
                          className="w-full h-full object-cover"
                          variants={imageVariants}
                        />

                        {/* Enhanced Overlay Gradient */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Action Buttons with better positioning */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(studio._id)
                            }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors duration-200 ${
                                favorites.has(studio._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            />
                          </motion.button>

                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPreview(studio)
                            }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-5 h-5 text-gray-600 hover:text-purple-600 transition-colors duration-200" />
                          </motion.button>
                        </div>

                        {/* Studio Rating */}
                        {studio.rating && (
                          <motion.div 
                            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                              <span className="text-sm font-semibold text-gray-800">{studio.rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Studio Details */}
                      <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                            {studio.name}
                          </h3>
                        </div>

                        {studio.location && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm">{studio.location}</span>
                          </div>
                        )}

                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {studio.description || "Professional photography studio specializing in wedding photography"}
                        </p>

                        {studio.services && studio.services.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {studio.services.slice(0, 2).map((service, idx) => (
                                <motion.span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-100/80 text-purple-600 text-xs rounded-full"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {service}
                                </motion.span>
                              ))}
                              {studio.services.length > 2 && (
                                <span className="px-3 py-1 bg-gray-100/80 text-gray-600 text-xs rounded-full">
                                  +{studio.services.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {studio.price && (
                          <div className="mb-4">
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              Rs {studio.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">per session</span>
                          </div>
                        )}

                        {/* View Details Button */}
                        <motion.button
                          onClick={() => navigate(`/studios/${studio._id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {(pagination?.totalPages || 1) > 1 && (
          <motion.div
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.8, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
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

        {/* Enhanced Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(null)}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <motion.img
                    src={showPreview.studioImage || "/placeholder.svg"}
                    alt={showPreview.name}
                    className="w-full h-64 object-cover rounded-t-3xl"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.button
                    onClick={() => setShowPreview(null)}
                    className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                
                <motion.div 
                  className="p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{showPreview.name}</h2>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(showPreview._id)
                      }}
                      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          favorites.has(showPreview._id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </motion.button>
                  </div>

                  {showPreview.location && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                      <span className="text-lg">{showPreview.location}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {showPreview.description || "Professional photography studio specializing in wedding photography"}
                  </p>

                  {/* Services in preview */}
                  {showPreview.services && showPreview.services.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg">Services:</h3>
                      <div className="flex flex-wrap gap-2">
                        {showPreview.services.map((service, idx) => (
                          <motion.span
                            key={idx}
                            className="px-4 py-2 bg-purple-100 text-purple-600 text-sm rounded-full"
                            whileHover={{ scale: 1.05 }}
                          >
                            {service}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {showPreview.price && (
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Rs {showPreview.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">per session</span>
                      </div>
                    )}
                    <motion.button
                      onClick={() => {
                        navigate(`/studios/${showPreview._id}`)
                        setShowPreview(null)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Details</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Studios