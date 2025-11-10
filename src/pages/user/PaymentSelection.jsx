import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCreditCard, FaMoneyBill, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { CartContext } from '../../context/CartContext'
import { AuthContext } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { startPayment } from '../../services/payments'
import { getOrderById } from '../../services/orders'

function PaymentSelection() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const location = useLocation()
  const { clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  
  const [selectedPayment, setSelectedPayment] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [fetchingOrder, setFetchingOrder] = useState(true)

  // Always fetch order details from API using orderService
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          throw new Error('No order ID provided')
        }

        const order = await getOrderById(orderId)
        if (order) {
          setOrderData(order)
        } else {
          throw new Error('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
        navigate('/user-profile')
      } finally {
        setFetchingOrder(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, navigate])

  // Calculate totals from order data
  const totalAmount = orderData?.totalAmount || 0
  const advanceAmount = Math.round(totalAmount * 0.25)

  const handlePaymentSelection = async (paymentType) => {
    if (!user) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }

    if (!orderId) {
      toast.error('Order ID missing!')
      return
    }

    setLoading(true)
    setSelectedPayment(paymentType)

    try {
      let paymentAmount = null

      if (paymentType === 'full') {
        paymentAmount = 'full_payment'
      } else if (paymentType === 'advance') {
        paymentAmount = '25_percent'
      }
      // For cash payment, paymentAmount remains null

      console.log('Starting payment:', { orderId, paymentAmount })
      
      const response = await startPayment(orderId, paymentAmount)

      if (response.success) {
        if (paymentType === 'cash') {
          // For cash payment after service - redirect to success page
          toast.success('Order confirmed! Payment will be collected after service. 🎉')
          clearCart()
          
          // Redirect to OrderSuccess page with order data
          navigate('/order-success', { 
            state: { 
              orderData: {
                orderId: response.order._id,
                order: response.order,
                paymentType: 'cash_after_service',
                totalAmount: response.order.totalAmount,
                message: 'Order confirmed successfully!'
              }
            }
          })
        } else {
          // For Stripe payments
          if (response.sessionUrl && response.sessionId) {
            toast.success('Redirecting to secure payment gateway...', {
              autoClose: 2000
            })
            
            localStorage.setItem('stripe_session_id', response.sessionId)
            localStorage.setItem('payment_type', paymentType)
            localStorage.setItem('order_id', orderId)
            
            clearCart()
            
            setTimeout(() => {
              window.location.href = response.sessionUrl
            }, 2000)
          } else {
            throw new Error('Payment session not created properly')
          }
        }
      } else {
        throw new Error(response.message || 'Failed to start payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
      setSelectedPayment('')
    }
  }

  // Loading state while fetching order
  if (fetchingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => navigate('/user-profile')}
            className="mr-4 p-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-all duration-300"
            disabled={loading}
          >
            <FaArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Complete Payment for Draft Order
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Options */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose Payment Option</h2>
              
              <div className="space-y-4">
                {/* Full Payment */}
                <motion.div
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    selectedPayment === 'full' 
                      ? 'border-purple-400 bg-purple-50/50' 
                      : 'border-white/30 bg-white/20 hover:border-purple-300'
                  }`}
                  onClick={() => !loading && handlePaymentSelection('full')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <FaCreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Full Payment</h3>
                        <p className="text-gray-600 text-sm">Pay complete amount now via card</p>
                        <p className="text-green-600 font-medium">💳 Secure Stripe checkout</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">Rs {totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-green-600">Complete payment</p>
                    </div>
                  </div>
                  {loading && selectedPayment === 'full' && (
                    <div className="mt-4 flex items-center justify-center text-purple-600">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Creating payment session...</span>
                    </div>
                  )}
                </motion.div>

                {/* Advance Payment */}
                <motion.div
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    selectedPayment === 'advance'
                      ? 'border-purple-400 bg-purple-50/50'
                      : 'border-white/30 bg-white/20 hover:border-purple-300'
                  }`}
                  onClick={() => !loading && handlePaymentSelection('advance')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <FaCreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Advance Payment (25%)</h3>
                        <p className="text-gray-600 text-sm">Pay 25% now, rest after service</p>
                        <p className="text-blue-600 font-medium">💳 Secure your booking</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">Rs {advanceAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Remaining:Rs {(totalAmount - advanceAmount).toLocaleString()}</p>
                    </div>
                  </div>
                  {loading && selectedPayment === 'advance' && (
                    <div className="mt-4 flex items-center justify-center text-purple-600">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Creating payment session...</span>
                    </div>
                  )}
                </motion.div>

                {/* Cash After Service */}
                <motion.div
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    selectedPayment === 'cash'
                      ? 'border-purple-400 bg-purple-50/50'
                      : 'border-white/30 bg-white/20 hover:border-purple-300'
                  }`}
                  onClick={() => !loading && handlePaymentSelection('cash')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <FaMoneyBill className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Cash After Service</h3>
                        <p className="text-gray-600 text-sm">Pay when service is completed</p>
                        <p className="text-orange-600 font-medium">💰 No advance required</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">Rs {totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Pay after service</p>
                    </div>
                  </div>
                  {loading && selectedPayment === 'cash' && (
                    <div className="mt-4 flex items-center justify-center text-purple-600">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Confirming your order...</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-700">
                  <FaCheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">Secure Payment Processing</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  All card payments are processed securely through Stripe. Your payment information is never stored on our servers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white/30 rounded-lg">
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-xs">#{orderId?.slice(-8)}</p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <p className="text-sm font-medium text-yellow-800">Draft Order</p>
                  </div>
                  <p className="text-xs text-yellow-700">
                    This order is currently in draft status. Complete payment to confirm your booking.
                  </p>
                </div>
                
                {/* Show order items if available */}
                {orderData?.items && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-white/20 rounded">
                        <div>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-600 capitalize">{item.itemType}</p>
                        </div>
                        <span className="font-medium">Rs {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-3 font-bold text-lg">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-purple-600">Rs {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>25% Advance Option</span>
                  <span>Rs {advanceAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <h4 className="font-medium text-gray-800 mb-2">✨ What's Included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure payment processing</li>
                  <li>• Instant order confirmation</li>
                  <li>• Email receipt & details</li>
                  <li>• 24/7 customer support</li>
                  <li>• Order tracking in profile</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSelection