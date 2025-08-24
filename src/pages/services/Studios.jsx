import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { toast } from "react-toastify"

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

  const fetchStudios = async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...filters
      })

      const response = await fetch(`/api/studios?${queryParams}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setStudios(data.data.studios || [])
        setPagination({
          totalStudios: data.data.pagination?.totalStudios || 0,
          totalPages: data.data.pagination?.totalPages || 1,
          currentPage: data.data.pagination?.currentPage || 1,
          hasNextPage: data.data.pagination?.hasNextPage || false,
          hasPrevPage: data.data.pagination?.hasPrevPage || false
        })
      } else {
        setStudios([])
        setPagination({
          totalStudios: 0,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      }
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
      
      const searchParams = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        sortBy: sortField,
        sortOrder: sortOrder
      })

      if (priceRange.min) searchParams.append("minPrice", priceRange.min)
      if (priceRange.max) searchParams.append("maxPrice", priceRange.max)
      if (locationFilter) searchParams.append("location", locationFilter)

      const response = await fetch(`/api/studios/search?${searchParams}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setStudios(data.data.studios || [])
        setPagination({
          totalStudios: data.data.pagination?.totalStudios || 0,
          totalPages: data.data.pagination?.totalPages || 1,
          currentPage: data.data.pagination?.currentPage || 1,
          hasNextPage: data.data.pagination?.hasNextPage || false,
          hasPrevPage: data.data.pagination?.hasPrevPage || false
        })
      } else {
        setStudios([])
        setPagination({
          totalStudios: 0,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      }
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
      fetchStudios(page, {
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
        ...(locationFilter && { location: locationFilter })
      })
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
      toast.success("Added to favorites! ❤️")
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
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading studios...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-pink-100/10 rounded-full blur-3xl"></div>
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
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Photography Studios
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Capture your precious moments with professional photography studios that specialize in creating timeless wedding memories
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search studios by name, location, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Price Range */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortField(field)
                    setSortOrder(order)
                  }}
                  className="w-full pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isSearchActive ? (
                  <span>Search results: {pagination?.totalStudios || 0} studios found</span>
                ) : (
                  <span>Showing {pagination?.totalStudios || 0} studios</span>
                )}
              </div>
              
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Studios Grid/List */}
        <div className="max-w-7xl mx-auto">
          {studios.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No Studios Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {isSearchActive 
                  ? "Try adjusting your search criteria or filters"
                  : "It looks like there are no studios available at the moment"
                }
              </p>
              {isSearchActive && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                : "space-y-6"
              }>
                <AnimatePresence>
                  {studios.map((studio, index) => (
                    <motion.div
                      key={studio._id}
                      className={`group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      layout
                    >
                      {/* Studio Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-64 h-48" : "h-48 sm:h-56"
                      }`}>
                        <img
                          src={studio.studioImage || "/placeholder.svg"}
                          alt={studio.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(studio._id)
                            }}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors duration-200 ${
                                favorites.has(studio._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            />
                          </button>

                          {/* Preview Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPreview(studio)
                            }}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <Eye className="w-5 h-5 text-gray-600 hover:text-purple-600 transition-colors duration-200" />
                          </button>
                        </div>

                        {/* Studio Rating */}
                        {studio.rating && (
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-gray-800">{studio.rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Studio Details */}
                      <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2">
                            {studio.name}
                          </h3>
                        </div>

                        {/* Location */}
                        {studio.location && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm">{studio.location}</span>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {studio.description || "Professional photography studio specializing in wedding photography"}
                        </p>

                        {/* Services */}
                        {studio.services && studio.services.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {studio.services.slice(0, 2).map((service, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                                >
                                  {service}
                                </span>
                              ))}
                              {studio.services.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{studio.services.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            <span>{studio.likes || "24"} likes</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                            <span>{studio.rating || "4.9"}</span>
                          </div>
                        </div>

                        {/* Price */}
                        {studio.price && (
                          <div className="mb-4">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              ${studio.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">per session</span>
                          </div>
                        )}

                        {/* View Details Button */}
                        <button
                          onClick={() => navigate(`/studios/${studio._id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {(pagination?.totalPages || 1) > 1 && (
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2">
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && handlePageChange(page)}
                    disabled={typeof page !== "number"}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      page === currentPage
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : typeof page === "number"
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "text-gray-400 cursor-default"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (pagination?.totalPages || 1)}
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(null)}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={showPreview.studioImage || "/placeholder.svg"}
                    alt={showPreview.name}
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                  <button
                    onClick={() => setShowPreview(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{showPreview.name}</h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(showPreview._id)
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(showPreview._id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>

                  {showPreview.location && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{showPreview.location}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {showPreview.description || "Professional photography studio specializing in wedding photography"}
                  </p>

                  {/* Services in preview */}
                  {showPreview.services && showPreview.services.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Services:</h3>
                      <div className="flex flex-wrap gap-2">
                        {showPreview.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {showPreview.price && (
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${showPreview.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">per session</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        navigate(`/studios/${showPreview._id}`)
                        setShowPreview(null)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Studios
