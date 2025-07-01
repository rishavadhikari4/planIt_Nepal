"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { getAllOrders } from "../services/orderService"

const AdminOrderList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrders()
        setOrders(ordersData)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch orders.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()

  }, [])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: "Total Orders", value: orders.length, color: "from-blue-500 to-blue-600", icon: Package },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      color: "from-yellow-500 to-yellow-600",
      icon: Clock,
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "completed").length,
      color: "from-green-500 to-green-600",
      icon: CheckCircle,
    },
    {
      label: "Processing",
      value: orders.filter((o) => o.status === "processing").length,
      color: "from-purple-500 to-purple-600",
      icon: Truck,
    },
  ]

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
            <p className="text-sm sm:text-base text-gray-600">Track and manage all customer orders in one place</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base">
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
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
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-gray-500 text-xs sm:text-sm lg:text-base">{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
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
                              Order #{order._id.toUpperCase()}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status || "pending",
                              )} w-fit`}
                            >
                              {getStatusIcon(order.status || "pending")}
                              <span className="hidden xs:inline">{order.status || "Pending"}</span>
                            </span>
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
                      <div className="flex items-center justify-end sm:justify-start gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 text-sm">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
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
                      {order.items?.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.1 }}
                          className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50/80 rounded-lg sm:rounded-xl hover:bg-gray-100/80 transition-colors duration-200"
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.image || "/placeholder.svg?height=60&width=60"}
                              alt={item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=60&width=60"
                              }}
                            />
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-800 truncate mb-1 text-sm sm:text-base">
                              {item.name}
                            </h5>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-gray-600">
                              <span>Qty: {item.quantity}</span>
                              {item.price && (
                                <span className="font-medium text-green-600">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )) || (
                        <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                          No items found in this order
                        </div>
                      )}
                    </div>

                    {/* Order Total */}
                    {order.total && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">Order Total:</span>
                          <span className="text-lg sm:text-xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrderList
