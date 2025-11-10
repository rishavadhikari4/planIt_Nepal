import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { deleteStudio, getAllStudios } from "../../services/studios"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const AdminStudios = () => {
  const [studios, setStudios] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const navigate = useNavigate()

  const fetchStudios = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 8, 
        sortField,
        sortOrder,
        ...filters
      }

      const response = await getAllStudios(params)
      setStudios(response.studios || [])
      setPagination(response.pagination || {})
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to fetch studios:", err)
      // Don't show toast error for empty arrays
      if (!Array.isArray(err.response?.data) || err.response?.data.length > 0) {
        toast.error("Failed to load studios.")
      }
      setStudios([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudios(1)
  }, [sortField, sortOrder])

  const handleSearch = () => {
    const filters = {}
    if (searchTerm.trim()) {
      filters.name = searchTerm.trim()
    }
    fetchStudios(1, filters)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      const filters = {}
      if (searchTerm.trim()) {
        filters.name = searchTerm.trim()
      }
      fetchStudios(page, filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchStudios(1)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this studio?")) return

    setDeletingId(id)
    try {
      const result = await deleteStudio(id)
      if (result.success) {
        toast.success(result.message)
        fetchStudios(currentPage)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete studio.")
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

  // Calculate real stats
  const totalStudios = pagination.totalStudios || studios.length
  const studiosWithPhotos = studios.filter((s) => s.photos && s.photos.length > 0).length

  const stats = [
    { label: "Total Studios", value: totalStudios, icon: Camera, color: "text-blue-600" },
    { label: "Current Page", value: studios.length, icon: Eye, color: "text-green-600" },
    { label: "With Photos", value: studiosWithPhotos, icon: Users, color: "text-yellow-600" },
  ]

  const StudioCard = ({ studio }) => (
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
          src={studio.studioImage || "/placeholder.svg?height=200&width=300"}
          alt={studio.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Services Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            {studio.services?.length || 0} Services
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
          {studio.name}
        </h3>
        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{studio.location || "Location not specified"}</span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {studio.description || "Professional studio services for your special day."}
        </p>

        {/* Services */}
        {studio.services && studio.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {studio.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {service}
              </span>
            ))}
            {studio.services.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{studio.services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Features */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{studio.photos?.length || 0} Photos</span>
          </div>
          <div className="flex items-center">
            <span>{studio.rating}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
           Rs {studio.price?.toLocaleString() || "0"}
          </span>
          <span className="text-gray-500 text-sm ml-1">per session</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/admin-studios/edit/${studio._id}`)}
            disabled={deletingId === studio._id}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDelete(studio._id)}
            disabled={deletingId === studio._id}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {deletingId === studio._id ? (
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
            <p className="text-slate-500 text-xs">Fetching studios...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const noStudios = totalStudios === 0

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
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Studio Management
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your photography and videography studios with our comprehensive studio management system. Add, edit, and organize
            professional studios for your special events.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          className="max-w-7xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
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

        {!noStudios && (
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
                      placeholder="Search studios by name..."
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
                    Showing <span className="font-semibold text-purple-600">{studios.length}</span> of{" "}
                    <span className="font-semibold">{totalStudios}</span> studios
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
                      onClick={() => navigate("/admin-studios/addstudio")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {noStudios ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No studios available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your studio collection by adding your first professional studio.
              </p>
              <button
                onClick={() => navigate("/admin-studios/addstudio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Add Your First Studio</span>
              </button>
            </motion.div>
          ) : studios.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No studios found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <>
              {/* Studios Grid */}
              <div
                className={`grid gap-6 mb-12 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {studios.map((studio, index) => (
                    <motion.div
                      key={studio._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      layout
                    >
                      <StudioCard studio={studio} />
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
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        pageNum === currentPage
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : pageNum === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-purple-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
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

export default AdminStudios