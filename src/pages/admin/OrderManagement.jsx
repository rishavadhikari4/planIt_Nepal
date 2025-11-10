import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Eye,
  Filter,
  Search,
  Download,
  Menu,
  X,
  ChevronDown,
  IndianRupee,
  CreditCard,
} from "lucide-react"
import { getAllOrders, updateOrderStatus } from "../../services/orders"
import { toast } from "react-toastify"

const AdminOrderList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getAllOrders()
        console.log("Full API Response:", response)
        
        // Handle your specific API response structure
        let ordersData = []
        let paginationData = null
        
        if (response?.orders && Array.isArray(response.orders)) {
          // Direct response from service
          ordersData = response.orders
          paginationData = response.pagination
        } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
          // Nested response structure
          ordersData = response.data.orders
          paginationData = response.data.pagination
        } else if (Array.isArray(response)) {
          // Simple array response
          ordersData = response
        } else {
          console.error("Unexpected response structure:", response)
          setError("Invalid data structure received from server")
          return
        }

        console.log("Processed orders data:", ordersData)
        setOrders(ordersData)
        setPagination(paginationData)
        
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(`Failed to fetch orders: ${err.message}`)
        setOrders([]) // Ensure orders is always an array
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  ]

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updatingOrderId) return

    setUpdatingOrderId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)),
      )

      toast.success(`Order status updated to ${newStatus}`)
      setOpenDropdownId(null)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`)
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((option) => option.value === status?.toLowerCase())
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
      case "confirmed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
      case "processing":
        return <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
      case "cancelled":
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
      default:
        return <Package className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getItemTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "venue":
        return "🏛️"
      case "dish":
        return "🍽️"
      case "studio":
        return "📸"
      default:
        return "📦"
    }
  }

  // Ensure orders is always an array before filtering
  const safeOrders = Array.isArray(orders) ? orders : []
  
  const filteredOrders = safeOrders.filter((order) => {
    if (!order) return false
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      order.userId?.name?.toLowerCase().includes(searchLower) ||
      order.userId?.email?.toLowerCase().includes(searchLower) ||
      order._id?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = [
    { 
      label: "Total Orders", 
      value: pagination?.totalOrders || safeOrders.length, 
      color: "from-blue-500 to-blue-600", 
      icon: Package 
    },
    {
      label: "Pending",
      value: safeOrders.filter((o) => o.status === "pending").length,
      color: "from-yellow-500 to-yellow-600",
      icon: Clock,
    },
    {
      label: "Confirmed", 
      value: safeOrders.filter((o) => o.status === "confirmed").length,
      color: "from-blue-500 to-blue-600",
      icon: CheckCircle,
    },
    {
      label: "Completed",
      value: safeOrders.filter((o) => o.status === "completed").length,
      color: "from-green-500 to-green-600",
      icon: CheckCircle,
    },
    {
      label: "Processing",
      value: safeOrders.filter((o) => o.status === "processing").length,
      color: "from-purple-500 to-purple-600",
      icon: Truck,
    },
  ]

  // Status Dropdown Component
  const StatusDropdown = ({ order }) => {
    const currentStatus = order.status || "pending"
    const isOpen = openDropdownId === order._id
    const isUpdating = updatingOrderId === order._id

    return (
      <div className="relative">
        <div
          onClick={() => !isUpdating && setOpenDropdownId(isOpen ? null : order._id)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusColor(
            currentStatus,
          )} ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:shadow-md cursor-pointer"}`}
        >
          {isUpdating ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            getStatusIcon(currentStatus)
          )}
          <span className="hidden xs:inline capitalize">{currentStatus}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]"
            >
              <div className="py-1">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(order._id, status.value)}
                    disabled={status.value === currentStatus || isUpdating}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${
                      status.value === currentStatus ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    {getStatusIcon(status.value)}
                    <span className="capitalize">{status.label}</span>
                    {status.value === currentStatus && <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest(".relative")) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openDropdownId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Loading Orders</h3>
          <p className="text-sm sm:text-base text-gray-500">Please wait while we fetch the latest orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2">Error Loading Orders</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Order Management</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Track and manage all customer orders
              {pagination && (
                <span className="ml-2 text-purple-600">
                  ({pagination.totalOrders} total orders)
                </span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-sm"
          >
            {showMobileFilters ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="font-medium">{showMobileFilters ? "Hide Filters" : "Show Filters & Search"}</span>
          </button>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm transition-all duration-300 ${
            showMobileFilters ? "block" : "hidden sm:block"
          }`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-white/90 rounded-xl p-3 border border-slate-200/50 shadow flex items-center gap-2"
            >
              <stat.icon className="w-4 h-4" />
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            className="flex-1 p-2 rounded-lg border border-slate-200/50 bg-slate-50/80 text-sm"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 rounded-lg border border-slate-200/50 bg-slate-50/80 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 p-6 sm:p-8 lg:p-12 text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here once customers start placing them."}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                              Order #{order._id?.slice(-6).toUpperCase()}
                            </h3>
                            <StatusDropdown order={order} />
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{order.userId?.name || "Unknown User"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{order.userId?.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Order total and payment info */}
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-green-600 mb-1">
                            ${order.totalAmount?.toLocaleString() || '0'}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                              <CreditCard className="w-3 h-3" />
                              <span>Payment: {order.paymentStatus}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.paymentType === 'cash_after_service' ? 'Cash After Service' : order.paymentType}
                            </div>
                            {order.remainingAmount > 0 && (
                              <div className="text-xs text-orange-600">
                                Remaining: ${order.remainingAmount?.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* View button */}
                        <button 
                          onClick={() => handleViewOrder(order._id)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <h4 className="font-medium text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <Package className="w-4 h-4" />
                      Order Items ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, itemIndex) => (
                          <motion.div
                            key={item._id || itemIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.1 }}
                            className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50/80 rounded-lg sm:rounded-xl hover:bg-gray-100/80 transition-colors duration-200"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg"
                                }}
                              />
                              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                {item.quantity}
                              </div>
                              <div className="absolute -bottom-1 -left-1 text-lg">
                                {getItemTypeIcon(item.itemType)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 truncate mb-1 text-sm sm:text-base">
                                {item.name}
                              </h5>
                              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-gray-600">
                                <span>Type: {item.itemType}</span>
                                <span>Qty: {item.quantity}</span>
                                {item.price && (
                                  <span className="font-medium text-green-600">
                                    ${(item.price * item.quantity).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {/* Show booking dates if available */}
                              {item.bookedFrom && item.bookedTill && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(item.bookedFrom).toLocaleDateString()} - {new Date(item.bookedTill).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {/* Show booking status if available */}
                              {item.bookingStatus && item.itemType !== 'dish' && (
                                <div className="mt-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.bookingStatus)}`}>
                                    {getStatusIcon(item.bookingStatus)}
                                    Booking: {item.bookingStatus}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                          No items found in this order
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination Info */}
        {pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 text-center"
          >
            <p className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages} 
              <span className="mx-2">•</span>
              {pagination.totalOrders} total orders
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminOrderList
