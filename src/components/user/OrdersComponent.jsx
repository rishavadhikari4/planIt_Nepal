import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  ShoppingBag,
  Package,
  Receipt,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Star,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { getUserOrders } from '../../services/orders'
import RatingModal from '../ui/RatingModal'

const OrdersComponent = ({ user }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState(new Set())
  const [orderFilter, setOrderFilter] = useState('all')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemType, setSelectedItemType] = useState('')
  const [ratedItems, setRatedItems] = useState(new Set())

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await getUserOrders()
        setOrders(ordersData)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrders()
    }
  }, [user])

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getItemTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'venue':
        return '🏛️'
      case 'studio':
        return '📸'
      case 'dish':
      case 'cuisine':
        return '🍽️'
      default:
        return '📦'
    }
  }

  const canRateItem = (order, item) => {
    const itemId = item.itemId 
    return order.status?.toLowerCase() === 'completed' && 
           !ratedItems.has(`${itemId}-${item.itemType}`)
  }

  const handleRateItem = (item, order) => {
    if (!canRateItem(order, item)) {
      toast.error('You can only rate completed orders')
      return
    }

    setSelectedItem(item)
    setSelectedItemType(item.itemType || 'venue')
    setShowRatingModal(true)
  }

  const handleRatingSubmitted = (itemId) => {
    setRatedItems(prev => new Set([...prev, `${itemId}-${selectedItemType}`]))
    toast.success('Thank you for your feedback!')
  }

  const handleViewItem = (item) => {
    const itemType = item.itemType?.toLowerCase()
    const itemId = item.itemId 

    switch (itemType) {
      case 'venue':
        navigate(`/venue-details/${itemId}`)
        break
      case 'studio':
        navigate(`/studio-details/${itemId}`)
        break
      case 'dish':
      case 'cuisine':
        navigate(`/cuisines`)
        break
      default:
        toast.info('Item details not available')
    }
  }

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status?.toLowerCase() === orderFilter.toLowerCase()
    const matchesSearch = order._id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         order.items?.some(item => item.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-purple-600" />
          My Orders ({orders.length})
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or item name..."
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {orderSearchTerm || orderFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {orderSearchTerm || orderFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start planning your dream wedding by placing your first order!'
            }
          </p>
          {!orderSearchTerm && orderFilter === 'all' && (
            <button
              onClick={() => navigate('/venues')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Browse Venues
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              className="bg-white/60 rounded-2xl border border-white/40 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                    <button
                      onClick={() => toggleOrderExpansion(order._id)}
                      className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors duration-200"
                    >
                      {expandedOrders.has(order._id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="font-bold text-purple-600">Rs {order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                    </span>
                  </div>
                  <div className="bg-white/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="font-semibold text-gray-800">{order.items?.length || 0}</p>
                  </div>
                  <div className="bg-white/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                    <p className="font-semibold text-gray-800 text-xs">
                      {order.paymentType === 'cash_after_service' ? 'Cash After Service' :
                       order.paymentType === 'advance_payment' ? 'Advance Payment' :
                       order.paymentType === 'full_payment' ? 'Full Payment' : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Expanded Order Details */}
                <AnimatePresence>
                  {expandedOrders.has(order._id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200/50 pt-4"
                    >
                      {/* Order Items */}
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Order Items ({order.items?.length || 0})
                      </h4>
                      
                      <div className="grid gap-3 mb-4">
                        {order.items?.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between bg-white/40 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                  {getItemTypeIcon(item.itemType)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800">{item.name}</h5>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="capitalize">{item.itemType}</span>
                                  <span>Qty: {item.quantity}</span>
                                  <span className="font-medium text-purple-600">Rs {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                                {(item.itemType === 'venue' || item.itemType === 'studio') && item.bookedFrom && item.bookedTill && (
                                  <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(item.bookedFrom).toLocaleDateString()} - {new Date(item.bookedTill).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Item Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewItem(item)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200"
                                title="View item details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {canRateItem(order, item) && (
                                <button
                                  onClick={() => handleRateItem(item, order)}
                                  className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition-colors duration-200"
                                  title="Rate this item"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              {ratedItems.has(`${item.itemId || item._id || item.id}-${item.itemType}`) && (
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                  <Star className="w-4 h-4 fill-current" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Details */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payment Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="font-semibold text-gray-800">Rs {order.totalAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Paid Amount</p>
                            <p className="font-semibold text-green-600">Rs {order.paidAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Remaining Amount</p>
                            <p className="font-semibold text-orange-600">Rs {order.remainingAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                        {order.stripePaymentIntentId && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-gray-600 text-xs">Payment ID: {order.stripePaymentIntentId}</p>
                          </div>
                        )}
                      </div>

                      {/* Draft Order Payment */}
                      {order.status?.toLowerCase() === 'draft' && (
                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h5 className="font-semibold text-yellow-800 mb-1">Payment Required</h5>
                                <p className="text-sm text-yellow-700">
                                  This order is in draft status. Complete the payment to confirm your booking.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/payment/${order._id}`)}
                            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span>Complete Payment</span>
                            <span className="ml-2 font-bold">Rs {order.remainingAmount?.toLocaleString()}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        item={selectedItem}
        itemType={selectedItemType}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  )
}

export default OrdersComponent