import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUserInspectionData } from "../../services/users"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  User, 
  Mail,  
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Key, 
  Image as ImageIcon,
  AlertTriangle,
  Info,
  Eye,
  Lock
} from "lucide-react"

const UserInspection = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserInspectionData(userId)
        if (response.success) {
          setUserData(response.data)
        } else {
          setError(response.message || "Failed to fetch user data")
        }
      } catch (err) {
        console.error("Error fetching user inspection data:", err)
        setError("Failed to load user data")
        toast.error("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleBack = () => {
    navigate("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full absolute top-2 left-2 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading User Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { user, inspectedBy } = userData
  const { basicInfo, accountStatus, otpInfo, timestamps, securityInfo } = user

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6">
      <div className="max-w-3xl md:max-w-5xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <motion.button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 border border-gray-200/60 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
              whileHover={{ scale: 1.04, x: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              User Inspection
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">Account details & security overview</p>
          </div>
        </motion.div>

        {/* User Profile Header */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/60 shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <img
                src={
                  basicInfo.profileImage || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(basicInfo.name)}&background=random`
                }
                alt={basicInfo.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
              />
              <div className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 ${accountStatus.isVerified ? 'bg-green-500' : 'bg-red-500'} border-2 border-white rounded-full`}></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{basicInfo.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm mb-0.5">{basicInfo.email}</p>
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Phone: {basicInfo.number || 'Not provided'}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  basicInfo.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {basicInfo.role}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  accountStatus.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accountStatus.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right mt-2 sm:mt-0">
              <p className="text-xs text-gray-400 mb-0.5">User ID</p>
              <p className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{basicInfo.id}</p>
            </div>
          </div>
        </motion.div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Account Status */}
          <motion.div
            className="bg-white/90 rounded-xl border border-gray-200/60 shadow p-3 sm:p-4"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Account Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Email Verified
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  accountStatus.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {accountStatus.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <Lock className="w-4 h-4 mr-1 text-orange-500" />
                  Failed Logins
                </span>
                <span className="font-semibold text-xs sm:text-sm">{accountStatus.failedLoginAttempts}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                  Account Locked
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  accountStatus.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {accountStatus.isLocked ? 'Yes' : 'No'}
                </span>
              </div>
              {accountStatus.lockUntil && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-red-50 rounded-lg border border-red-100">
                  <span className="flex items-center text-red-700 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    Locked Until
                  </span>
                  <span className="text-xs font-mono">{new Date(accountStatus.lockUntil).toLocaleString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Security Information */}
          <motion.div
            className="bg-white/90 rounded-xl border border-gray-200/60 shadow p-3 sm:p-4"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' }}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Key className="w-5 h-5 mr-2 text-purple-600" />
              Security Info
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  Password Set
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  securityInfo.hasPassword ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {securityInfo.hasPassword ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <Key className="w-4 h-4 mr-1 text-blue-500" />
                  Has Refresh Token
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  accountStatus.hasRefreshToken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {accountStatus.hasRefreshToken ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                  Reset Token Active
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  accountStatus.hasResetToken ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {accountStatus.hasResetToken ? 'Yes' : 'No'}
                </span>
              </div>
              {securityInfo.profileImageId && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                  <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                    <ImageIcon className="w-4 h-4 mr-1 text-indigo-500" />
                    Profile Image ID
                  </span>
                  <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                    {securityInfo.profileImageId.slice(-8)}...
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* OTP Information */}
          <motion.div
            className="bg-white/90 rounded-xl border border-gray-200/60 shadow p-3 sm:p-4"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.29, ease: 'easeOut' }}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-green-600" />
              OTP Info
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                  <Key className="w-4 h-4 mr-1 text-blue-500" />
                  Active OTP
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  otpInfo.hasActiveOTP ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {otpInfo.hasActiveOTP ? 'Yes' : 'No'}
                </span>
              </div>
              {otpInfo.otpExpiry && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                  <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 mr-1 text-orange-500" />
                    OTP Expires
                  </span>
                  <span className="text-xs font-mono">{new Date(otpInfo.otpExpiry).toLocaleString()}</span>
                </div>
              )}
              {otpInfo.isOTPExpired !== null && (
                <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg">
                  <span className="flex items-center text-gray-700 text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                    OTP Expired
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                    otpInfo.isOTPExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {otpInfo.isOTPExpired ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Timestamps */}
          <motion.div
            className="bg-white/90 rounded-xl border border-gray-200/60 shadow p-3 sm:p-4"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.36, ease: 'easeOut' }}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Account Timeline
            </h3>
            <div className="space-y-2">
              <div className="px-2 py-1.5 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="flex items-center text-gray-700 text-xs font-medium">
                    <Calendar className="w-4 h-4 mr-1 text-green-500" />
                    Created
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-500 ml-5">
                  {new Date(timestamps.createdAt).toLocaleDateString()} at {new Date(timestamps.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="px-2 py-1.5 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="flex items-center text-gray-700 text-xs font-medium">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    Last Updated
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-500 ml-5">
                  {new Date(timestamps.updatedAt).toLocaleDateString()} at {new Date(timestamps.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              {securityInfo.lastPasswordReset && (
                <div className="px-2 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="flex items-center text-orange-700 text-xs font-medium">
                      <Key className="w-4 h-4 mr-1" />
                      Password Reset
                    </span>
                  </div>
                  <p className="text-xs font-mono text-orange-600 ml-5">
                    {new Date(securityInfo.lastPasswordReset).toLocaleDateString()} at {new Date(securityInfo.lastPasswordReset).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Inspection Info */}
        <motion.div
          className="mt-4 sm:mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.43, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-blue-800 gap-1">
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-1" />
              <span>Inspected by <strong>{inspectedBy.adminName}</strong></span>
            </div>
            <span>{new Date(inspectedBy.inspectionTime).toLocaleString()}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UserInspection