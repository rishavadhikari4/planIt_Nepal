"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllVenues, searchVenues } from "../../services/venues"
import { useCart } from "../../context/CartContext"
import { toast } from "react-toastify"
import { MapPin, Users, Star, ShoppingCart, Heart, Search, Filter, Sparkles, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Venues = () => {
  const [venues, setVenues] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [capacityRange, setCapacityRange] = useState({ min: "", max: "" })
  const [locationFilter, setLocationFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(null)

  const fetchVenues = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 12,
        sortField,
        sortOrder,
        ...filters
      }

      const response = await getAllVenues(params)
      setVenues(response.venues || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
      setIsSearchActive(false)
    } catch (err) {
      console.error("Failed to fetch venues:", err)
      toast.error("Failed to load venues. Please try again.")
      setVenues([])
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
        limit: 12,
        sortField,
        sortOrder
      }

      if (searchTerm.trim()) {
        searchOptions.q = searchTerm.trim()
      }

      if (priceRange.min) {
        searchOptions.minPrice = priceRange.min
      }
      if (priceRange.max) {
        searchOptions.maxPrice = priceRange.max
      }

      if (capacityRange.min) {
        searchOptions.minCapacity = capacityRange.min
      }
      if (capacityRange.max) {
        searchOptions.maxCapacity = capacityRange.max
      }

      if (locationFilter.trim()) {
        searchOptions.location = locationFilter.trim()
      }

      const response = await searchVenues(searchOptions)
      setVenues(response.venues || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
      setIsSearchActive(true)
    } catch (err) {
      console.error("Failed to search venues:", err)
      toast.error("Failed to search venues. Please try again.")
      setVenues([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues(1)
  }, [sortField, sortOrder])

  const handleSearch = () => {
    const hasSearchCriteria = searchTerm.trim() || 
                             priceRange.min || 
                             priceRange.max || 
                             capacityRange.min || 
                             capacityRange.max || 
                             locationFilter.trim()

    if (hasSearchCriteria) {
      performSearch(1)
    } else {
      fetchVenues(1)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      if (isSearchActive) {
        performSearch(page)
      } else {
        const filters = {}
        
        if (searchTerm.trim()) {
          filters.name = searchTerm.trim()
        }
        
        if (priceRange.min) {
          filters.minPrice = priceRange.min
        }
        
        if (priceRange.max) {
          filters.maxPrice = priceRange.max
        }

        fetchVenues(page, filters)
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange({ min: "", max: "" })
    setCapacityRange({ min: "", max: "" })
    setLocationFilter("")
    setCurrentPage(1)
    setIsSearchActive(false)
    fetchVenues(1)
  }

  const handleSelect = async (venue) => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.info("Please login to add items to your cart.")
      navigate("/login")
      return
    }
    toast.success("Added to cart successfully! ✨")
    addToCart({
      name: venue.name,
      price: venue.price,
      image: venue.image,
      quantity: 1,
      type: "venue",
    })
  }

  const toggleFavorite = (venueId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(venueId)) {
      newFavorites.delete(venueId)
      toast.info("Removed from favorites")
    } else {
      newFavorites.add(venueId)
      toast.success("Added to favorites! ❤️")
    }
    setFavorites(newFavorites)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const totalPages = pagination.totalPages || 1
    const current = currentPage

    if (current > 3) {
      pageNumbers.push(1)
      if (current > 4) pageNumbers.push('...')
    }

    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pageNumbers.push(i)
    }

    if (current < totalPages - 2) {
      if (current < totalPages - 3) pageNumbers.push('...')
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  if (loading)
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
            Loading stunning venues...
          </p>
        </motion.div>
      </div>
    )

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
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Premium Event Venues
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the perfect setting for your special event. From elegant ballrooms to stunning outdoor spaces, find venues
            that will make your celebration unforgettable.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            {/* First Row of Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
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

            {/* Second Row of Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Capacity Range - Min */}
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Min Capacity"
                  value={capacityRange.min}
                  onChange={(e) => setCapacityRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              {/* Capacity Range - Max */}
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Max Capacity"
                  value={capacityRange.max}
                  onChange={(e) => setCapacityRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
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
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="capacity-asc">Capacity: Low to High</option>
                  <option value="capacity-desc">Capacity: High to Low</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search Venues</span>
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {isSearchActive ? "Search results: " : "Showing "}
                <span className="font-semibold text-purple-600">{venues.length}</span> of{" "}
                <span className="font-semibold">{pagination.totalVenues || 0}</span> venues
                {pagination.totalPages > 1 && (
                  <span className="ml-2">
                    (Page {currentPage} of {pagination.totalPages})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Venues Grid */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {venues.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No venues found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
                <AnimatePresence>
                  {venues.map((venue, index) => (
                    <motion.div
                      key={venue._id}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      layout
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden">
                        <img
                          src={venue.image || "/placeholder.svg?height=300&width=400"}
                          alt={venue.name}
                          className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                          {/* Favorite Button */}
                          <button
                            onClick={() => toggleFavorite(venue._id)}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors duration-200 ${
                                favorites.has(venue._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            />
                          </button>

                          {/* Preview Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPreview(venue)
                            }}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                          >
                            <Eye className="w-5 h-5 text-gray-600 hover:text-purple-600" />
                          </button>
                        </div>

                        {/* Category Badge */}
                        {venue.category && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            {venue.category}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Venue Name */}
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {venue.name}
                        </h3>

                        {/* Location */}
                        {venue.location && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm">{venue.location}</span>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {venue.description || "A beautiful venue perfect for your special event."}
                        </p>

                        {/* Features */}
                        <div className="flex items-center justify-between mb-4">
                          {venue.capacity && (
                            <div className="flex items-center text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-xs">{venue.capacity} guests</span>
                            </div>
                          )}

                          {venue.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-sm font-semibold text-gray-700">{venue.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        {venue.price && (
                          <div className="mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              ${venue.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">per event</span>
                          </div>
                        )}

                        {/* View Details Button - Replace the Add to Cart button */}
                        <button
                          onClick={() => navigate(`/venues/${venue._id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-5 h-5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <motion.div
                  className="flex justify-center items-center space-x-2 mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {getPageNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                        disabled={pageNum === '...'}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                          pageNum === currentPage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : pageNum === '...'
                            ? "text-gray-400 cursor-not-allowed"
                            : "bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA Section */}
        {venues.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Need Help Choosing?
              </h3>
              <p className="text-gray-600 mb-6">
                Our event planning experts are here to help you find the perfect venue for your special occasion.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Contact Our Experts
              </button>
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
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={showPreview.image || "/placeholder.svg"}
                    alt={showPreview.name}
                    className="w-full h-64 sm:h-80 object-cover rounded-t-2xl"
                  />
                  <button
                    onClick={() => setShowPreview(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✕
                  </button>
                  {/* Category Badge in Preview */}
                  {showPreview.category && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {showPreview.category}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{showPreview.name}</h3>

                  {/* Location */}
                  {showPreview.location && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                      <span className="text-base">{showPreview.location}</span>
                    </div>
                  )}

                  <p className="text-gray-600 leading-relaxed mb-4">
                    {showPreview.description || "A beautiful venue perfect for your special event."}
                  </p>

                  {/* Venue Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {showPreview.capacity && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-2 text-purple-500" />
                        <span>{showPreview.capacity} guests</span>
                      </div>
                    )}
                    {showPreview.rating && (
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-2" />
                        <span className="font-semibold text-gray-700">{showPreview.rating} rating</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Features */}
                  {showPreview.features && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {showPreview.features.map((feature, index) => (
                          <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showPreview.price && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${showPreview.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">per event</span>
                      </div>
                      <button
                        onClick={() => {
                          handleSelect(showPreview)
                          setShowPreview(null)
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Venues