"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllVenues, searchVenues } from "../../services/venues"
import { toast } from "react-toastify"
import { MapPin, Users, Star, Heart, Search, Filter,Landmark, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(null)

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

  const cardVariants = {
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
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }

  const hoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
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
    },
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 30,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }

  const fetchVenues = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 12,
        sortField,
        sortOrder,
        ...filters,
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
        sortOrder,
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
    const hasSearchCriteria =
      searchTerm.trim() ||
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
      if (current > 4) pageNumbers.push("...")
    }

    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pageNumbers.push(i)
    }

    if (current < totalPages - 2) {
      if (current < totalPages - 3) pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }
    return pageNumbers
  }

  if (loading)
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
            Loading stunning venues...
          </motion.p>
        </motion.div>
      </div>
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
        {/* Header Section */}
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
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
              <Landmark className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Premium Event Venues
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Discover the perfect setting for your special event. From elegant ballrooms to stunning outdoor spaces, find
            venues that will make your celebration unforgettable.
          </motion.p>
        </motion.div>

        {/* Search and Filter Section */}
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
                  placeholder="Search Venues by name, location, or specialty..."
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
                <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 text-sm sm:text-base bg-gray-50/70 border-2 border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
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
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="capacity-asc">Capacity: Low to High</option>
                  <option value="capacity-desc">Capacity: High to Low</option>
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
                  Search results: <span className="font-semibold text-purple-600">{pagination?.totalVenues || 0}</span>{" "}
                  venues found
                </span>
              ) : (
                <span>
                  Showing <span className="font-semibold text-purple-600">{pagination?.totalVenues || 0}</span> venues
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Venues Grid */}
        <div className="max-w-7xl mx-auto">
          {venues.length === 0 ? (
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
                <Search className="w-16 h-16 text-gray-400" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-6">No Venues Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {isSearchActive
                  ? "Try adjusting your search criteria or filters"
                  : "It looks like there are no venues available at the moment"}
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
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {venues.map((venue, index) => (
                    <motion.div
                      key={venue._id}
                      className="group bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden transition-all duration-500"
                      variants={cardVariants}
                      whileHover={hoverVariants.hover}
                      layout
                    >
                      {/* Venue Image */}
                      <div className="relative overflow-hidden h-32 xs:h-40 sm:h-48 md:h-56">
                        <motion.img
                          src={venue.venueImage || "/placeholder.svg"}
                          alt={venue.name}
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
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(venue._id)
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart
                              className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-200 ${
                                favorites.has(venue._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            />
                          </motion.button>

                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPreview(venue)
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600 hover:text-purple-600 transition-colors duration-200" />
                          </motion.button>
                        </div>

                        {/* Venue Rating */}
                        {venue.rating && (
                          <motion.div
                            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-2 shadow-lg">
                              <span className="text-xs sm:text-sm font-semibold text-gray-800">{venue.rating}</span>
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Venue Details */}
                      <div className="p-3 sm:p-4 md:p-6">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                            {venue.name}
                          </h3>
                        </div>

                        {venue.location && (
                          <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{venue.location}</span>
                          </div>
                        )}

                        <p className="hidden sm:block text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {venue.description || "A beautiful venue perfect for your special event."}
                        </p>

                        {venue.capacity && (
                          <div className="mb-2 sm:mb-4">
                            <div className="flex items-center text-gray-500">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="text-xs">{venue.capacity} guests</span>
                            </div>
                          </div>
                        )}

                        {venue.price && (
                          <div className="mb-3 sm:mb-4">
                            <span className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              Rs {venue.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm ml-1">per event</span>
                          </div>
                        )}

                        {/* View Details Button */}
                        <motion.button
                          onClick={() => navigate(`/venues/${venue._id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-1 sm:space-x-2"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm md:text-base">View Details</span>
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
        {/* Enhanced Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(null)}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <motion.img
                    src={showPreview.venueImage || "/placeholder.svg"}
                    alt={showPreview.name}
                    className="w-full h-48 sm:h-64 object-cover rounded-t-2xl sm:rounded-t-3xl"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.button
                    onClick={() => setShowPreview(null)}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                <motion.div
                  className="p-4 sm:p-6 md:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 pr-4">{showPreview.name}</h2>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(showPreview._id)
                      }}
                      className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          favorites.has(showPreview._id) ? "text-red-500 fill-red-500" : "text-gray-600"
                        }`}
                      />
                    </motion.button>
                  </div>

                  {showPreview.location && (
                    <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base md:text-lg">{showPreview.location}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg">
                    {showPreview.description || "A beautiful venue perfect for your special event."}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {showPreview.price && (
                      <div className="text-left sm:text-right">
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${showPreview.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">per event</span>
                      </div>
                    )}
                    <motion.button
                      onClick={() => {
                        navigate(`/venues/${showPreview._id}`)
                        setShowPreview(null)
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">View Details</span>
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

export default Venues
