import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { deleteVenue, getAllVenues } from "../../services/venues"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Users,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Eye,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const AdminVenues = () => {
  const [venues, setVenues] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const navigate = useNavigate()

  const fetchVenues = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 8,
        sortField,
        sortOrder,
        ...filters
      }

      const response = await getAllVenues(params)
      setVenues(response.venues || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to fetch venues:", err)
      // Don't show toast error for empty arrays
      if (!Array.isArray(err.response?.data) || err.response?.data.length > 0) {
        toast.error("Failed to load venues.")
      }
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
    const filters = {}
    if (searchTerm.trim()) {
      filters.name = searchTerm.trim()
    }
    fetchVenues(1, filters)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      const filters = {}
      if (searchTerm.trim()) {
        filters.name = searchTerm.trim()
      }
      fetchVenues(page, filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchVenues(1)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) return

    setDeletingId(id)
    try {
      const result = await deleteVenue(id);
      if (result.success) {
        toast.success(result.message)
        fetchVenues(currentPage)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete venue.")
      console.error(error)
    } finally {
      setDeletingId(null)
    }
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

  const totalVenues = pagination.totalVenues || venues.length
  const activeVenues = venues.filter((v) => v.status === "active").length
  const pendingVenues = venues.filter((v) => v.status === "pending").length
  const avgRating = 4.8 

  const stats = [
    { label: "Total Venues", value: totalVenues, icon: Building, color: "text-blue-600" },
    { label: "Active Venues", value: activeVenues || totalVenues, icon: Calendar, color: "text-green-600" },
    { label: "Pending Review", value: pendingVenues, icon: Eye, color: "text-yellow-600" },
    { label: "Avg Rating", value: avgRating, icon: Star, color: "text-purple-600" },
  ]

  const VenueCard = ({ venue }) => (
    <motion.div
      className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 overflow-hidden"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={venue.venueImage || "/placeholder.svg?height=200&width=300"}
          alt={venue.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              venue.status === "active"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : venue.status === "pending"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white"
            }`}
          >
            {venue.status || "Active"}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
          {venue.name}
        </h3>

        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{venue.location}</span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {venue.description || "A beautiful venue perfect for your special celebration."}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{venue.capacity || "N/A"} guests</span>
          </div>
          <div className="flex items-center">
            <span>{venue.rating}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${venue.price || "0"}
          </span>
          <span className="text-gray-500 text-sm ml-1">per event</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/admin-venues/edit/${venue._id}`)}
            disabled={deletingId === venue._id}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => handleDelete(venue._id)}
            disabled={deletingId === venue._id}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {deletingId === venue._id ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2">
        <motion.div className="flex flex-col items-center space-y-4 p-4 max-w-xs w-full">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-600 rounded-full absolute top-1.5 left-1.5 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }}></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Loading...</h3>
            <p className="text-slate-500 text-xs">Fetching data</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const noVenues = totalVenues === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Venue Management
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your wedding venues with our comprehensive venue management system. Add, edit, and organize beautiful
            venues for your special day.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          className="max-w-7xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-gray-500 text-xs lg:text-sm">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {!noVenues && (
          <>
            {/* Search and Filter Section */}
            <motion.div
              className="max-w-6xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search venues by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                      className="pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer min-w-[200px]"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
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

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Results Count */}
                  <div className="text-gray-600">
                    Showing <span className="font-semibold text-purple-600">{venues.length}</span> of{" "}
                    <span className="font-semibold">{totalVenues}</span> venues
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (Page {currentPage} of {pagination.totalPages})
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={clearFilters}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => navigate("/admin-venues/addVenue")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Venue</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {noVenues ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No venues available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your venue collection by adding your first beautiful venue.
              </p>
              <button
                onClick={() => navigate("/admin-venues/addVenue")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Add Your First Venue</span>
              </button>
            </motion.div>
          ) : venues.length === 0 ? (
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
            <>
              {/* Venues Grid */}
              <div
                className={`grid gap-6 mb-12 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {venues.map((venue, index) => (
                    <motion.div
                      key={venue._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      layout
                    >
                      <VenueCard venue={venue} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminVenues
