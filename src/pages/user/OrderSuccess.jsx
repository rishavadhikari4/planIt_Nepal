import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaSpinner, FaArrowRight } from 'react-icons/fa'
import { MdEmail, MdPhone, MdLocationOn, MdSchedule } from 'react-icons/md'

function OrderSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(5)
  const [orderData, setOrderData] = useState(null)

  // Get order data from location state
  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData)
    }
  }, [location.state])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      navigate('/', {
        state: {
          message: 'Order confirmed successfully!',
          orderId: orderData?.orderId || orderData?.order?._id,
          showSuccessMessage: true
        }
      })
    }
  }, [countdown, navigate, orderData])

  const handleGoToDashboard = () => {
    navigate('/', {
      state: {
        message: 'Order confirmed successfully!',
        orderId: orderData?.orderId || orderData?.order?._id,
        showSuccessMessage: true
      }
    })
  }

  const getPaymentTypeText = (paymentType) => {
    switch (paymentType) {
      case 'cash_after_service':
        return 'Cash After Service'
      case 'advance_payment':
        return 'Advance Payment (25%)'
      case 'full_payment':
        return 'Full Payment'
      default:
        return 'Payment Pending'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <FaCheckCircle className="text-4xl text-white" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎉 Order Confirmed Successfully!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for choosing us for your special day!
          </p>
        </motion.div>

        {/* Order Details */}
        {orderData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Order Summary</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">#</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono text-sm font-semibold">
                      #{(orderData.orderId || orderData.order?._id)?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">Rs </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-green-600">
                     Rs {(orderData.order?.totalAmount || orderData.totalAmount)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">💳</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-semibold">
                      {getPaymentTypeText(orderData.order?.paymentType || orderData.paymentType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <MdSchedule className="text-orange-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-semibold">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* What happens next */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center">
            <span className="mr-2">✨</span>
            What happens next?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <MdEmail className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Confirmation</p>
                <p className="text-xs">Order details sent to your email</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MdPhone className="text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Team Contact</p>
                <p className="text-xs">Our team will call you within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MdSchedule className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Order Tracking</p>
                <p className="text-xs">Monitor progress in your profile</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MdLocationOn className="text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Service Delivery</p>
                <p className="text-xs">On-time delivery as scheduled</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="space-y-4"
        >
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <FaArrowRight className="ml-2" />
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Automatically redirecting to dashboard in
            </p>
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                key={countdown}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
              >
                {countdown}
              </motion.div>
              <span className="text-sm text-gray-600">seconds</span>
            </div>
          </div>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500 mb-2">Need help with your order?</p>
          <div className="flex justify-center space-x-4 text-xs">
            <a href="mailto:support@weddingplanner.com" className="text-blue-600 hover:text-blue-700 transition-colors">
              📧 Email Support
            </a>
            <span className="text-gray-300">•</span>
            <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700 transition-colors">
              📞 Call Support
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default OrderSuccess