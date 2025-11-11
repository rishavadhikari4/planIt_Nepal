"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  Phone,
  Eye,
  Edit,
  Download,
  FileText,
} from "lucide-react"
import { toast } from "react-toastify"
import { getOrderById, updateOrderStatus } from "../../services/orders"
import DateRangePicker from "../../components/ui/DateRangePicker"

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  ]

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID not provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await getOrderById(orderId)
        console.log("Order details response:", response)
        
        if (response && response.order) {
          setOrder(response.order)
        } else if (response && response.data && response.data.order) {
          setOrder(response.data.order)
        } else if (response) {
          setOrder(response)
        } else {
          setError("Order not found")
        }
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError(`Failed to load order details: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const handleStatusUpdate = async (newStatus) => {
    if (!order || updatingStatus) return

    setUpdatingStatus(true)
    try {
      await updateOrderStatus(order._id, newStatus)
      setOrder(prev => ({ ...prev, status: newStatus }))
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleViewCustomerProfile = () => {
    if (order?.userId?._id) {
      navigate(`/admin/users/inspect/${order.userId._id}`)
    } else if (order?.userId?.id) {
      navigate(`/admin/users/inspect/${order.userId.id}`)
    } else if (order?.userId) {
      // If userId is just a string ID
      navigate(`/admin/users/inspect/${order.userId}`)
    } else {
      toast.error("Customer information not available")
    }
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status?.toLowerCase())
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "processing":
        return <Truck className="w-4 h-4" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
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

  const getItemTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "venue":
        return "#8B5CF6" // Purple
      case "studio":
        return "#EC4899" // Pink
      case "dish":
        return "#10B981" // Green
      default:
        return "#6B7280" // Gray
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  // Extract booking dates for calendar with enhanced information
  const getBookingDatesForCalendar = () => {
    if (!order || !order.items) return []
    
    return order.items
      .filter(item => item.bookedFrom && item.bookedTill)
      .map((item, index) => ({
        bookedFrom: item.bookedFrom, 
        bookedTill: item.bookedTill,
        title: `${item.name}`,
        subtitle: `${getItemTypeIcon(item.itemType)} ${item.itemType}`,
        color: getItemTypeColor(item.itemType),
        id: `booking-${index}`,
        itemType: item.itemType,
        itemName: item.name
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading order details...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Back to Orders
          </button>
        </motion.div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    )
  }

  const bookingDatesForCalendar = getBookingDatesForCalendar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Orders</span>
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Created on {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </div>
              
              {/* Status Update Dropdown */}
              <div className="relative">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {updatingStatus && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-purple-600" />
                Order Items ({order.items?.length || 0})
              </h2>
              
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {item.quantity}
                        </div>
                        <div className="absolute -bottom-1 -left-1 text-2xl">
                          {getItemTypeIcon(item.itemType)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {item.name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Type:</span> {item.itemType}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> ${item.price?.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Total:</span> ${(item.price * item.quantity)?.toLocaleString()}
                          </div>
                        </div>
                        
                        {/* Booking Details for Venues/Studios */}
                        {(item.itemType === 'venue' || item.itemType === 'studio') && item.bookedFrom && item.bookedTill && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-800">Booking Period</span>
                              <div 
                                className="w-3 h-3 rounded-full ml-2" 
                                style={{ backgroundColor: getItemTypeColor(item.itemType) }}
                                title={`${item.itemType} booking`}
                              ></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-blue-700 font-medium">From:</span> {formatDateOnly(item.bookedFrom)}
                              </div>
                              <div>
                                <span className="text-blue-700 font-medium">To:</span> {formatDateOnly(item.bookedTill)}
                              </div>
                            </div>
                            {item.bookingStatus && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.bookingStatus)}`}>
                                  {getStatusIcon(item.bookingStatus)}
                                  Booking: {item.bookingStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No items found in this order
                  </div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Booking Calendar with Item Identification */}
            {bookingDatesForCalendar.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-purple-600" />
                    Booking Calendar
                  </h2>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">Legend:</span>
                    {bookingDatesForCalendar.map((booking, index) => (
                      <div key={booking.id} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: booking.color }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {booking.subtitle} {booking.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <DateRangePicker
                  bookedDates={bookingDatesForCalendar}
                  readOnly={true}
                  showItemDetails={true}
                  className="bg-transparent border-none shadow-none"
                />
                
                {/* Booking Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Booking Summary:</h3>
                  <div className="space-y-2">
                    {bookingDatesForCalendar.map((booking, index) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: booking.color }}
                          ></div>
                          <div>
                            <span className="font-medium text-gray-800">{booking.title}</span>
                            <span className="text-sm text-gray-600 ml-2">({booking.itemType})</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateOnly(booking.bookedFrom)} - {formatDateOnly(booking.bookedTill)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-purple-600" />
                Payment Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-600 mb-1">Payment Type</span>
                    <p className="text-gray-800 font-semibold">
                      {order.paymentType === 'cash_after_service' ? 'Cash After Service' : order.paymentType}
                    </p>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-600 mb-1">Payment Status</span>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      <CreditCard className="w-3 h-3" />
                      {order.paymentStatus}
                    </div>
                  </div>

                  {order.stripePaymentIntentId && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600 mb-1">Stripe Payment ID</span>
                      <p className="text-gray-800 font-mono text-sm">{order.stripePaymentIntentId}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-800">${order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Paid Amount:</span>
                      <span className="text-lg font-semibold text-green-600">${order.paidAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Remaining Amount:</span>
                      <span className="text-lg font-semibold text-orange-600">${order.remainingAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-purple-600" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-600 mb-1">Name</span>
                  <p className="text-gray-800 font-semibold">{order.userId?.name || 'Unknown User'}</p>
                </div>
                
                <div>
                  <span className="block text-sm font-medium text-gray-600 mb-1">Email</span>
                  <p className="text-gray-800">{order.userId?.email || 'No email provided'}</p>
                </div>
                
                {order.userId?.number && (
                  <div>
                    <span className="block text-sm font-medium text-gray-600 mb-1">Phone</span>
                    <p className="text-gray-800">{order.userId.number}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleViewCustomerProfile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    View Customer Profile
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-purple-600" />
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{order._id?.slice(-8).toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{order.items?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm">{formatDateOnly(order.createdAt)}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                  Send Email Update
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors duration-200">
                  <Phone className="w-4 h-4" />
                  Call Customer
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors duration-200">
                  <Edit className="w-4 h-4" />
                  Add Note
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails