import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUserInspectionData } from "../../services/users"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </motion.button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              User Inspection
            </h1>
            <p className="text-gray-600">Detailed account information and security status</p>
          </div>
        </motion.div>

        {/* User Profile Header */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 lg:p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={
                  basicInfo.profileImage || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(basicInfo.name)}&background=random`
                }
                alt={basicInfo.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
              />
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 ${accountStatus.isVerified ? 'bg-green-500' : 'bg-red-500'} border-4 border-white rounded-full`}></div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{basicInfo.name}</h2>
              <p className="text-gray-600 mb-1">{basicInfo.email}</p>
              <p className="text-gray-600 mb-3">Phone: {basicInfo.number || 'Not provided'}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  basicInfo.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {basicInfo.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  accountStatus.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accountStatus.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{basicInfo.id}</p>
            </div>
          </div>
        </motion.div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Account Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Email Verified
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  accountStatus.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {accountStatus.isVerified ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <Lock className="w-4 h-4 mr-2 text-orange-500" />
                  Failed Login Attempts
                </span>
                <span className="font-semibold">{accountStatus.failedLoginAttempts}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Account Locked
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  accountStatus.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {accountStatus.isLocked ? 'Yes' : 'No'}
                </span>
              </div>

              {accountStatus.lockUntil && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="flex items-center text-red-700">
                    <Clock className="w-4 h-4 mr-2" />
                    Locked Until
                  </span>
                  <span className="text-sm font-mono">{new Date(accountStatus.lockUntil).toLocaleString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Security Information */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Key className="w-6 h-6 mr-2 text-purple-600" />
              Security Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  Password Set
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  securityInfo.hasPassword ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {securityInfo.hasPassword ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <Key className="w-4 h-4 mr-2 text-blue-500" />
                  Has Refresh Token
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  accountStatus.hasRefreshToken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {accountStatus.hasRefreshToken ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                  Reset Token Active
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  accountStatus.hasResetToken ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {accountStatus.hasResetToken ? 'Yes' : 'No'}
                </span>
              </div>

              {securityInfo.profileImageId && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="flex items-center text-gray-700">
                    <ImageIcon className="w-4 h-4 mr-2 text-indigo-500" />
                    Profile Image ID
                  </span>
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                    {securityInfo.profileImageId.slice(-8)}...
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* OTP Information */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-green-600" />
              OTP Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="flex items-center text-gray-700">
                  <Key className="w-4 h-4 mr-2 text-blue-500" />
                  Active OTP
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  otpInfo.hasActiveOTP ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {otpInfo.hasActiveOTP ? 'Yes' : 'No'}
                </span>
              </div>

              {otpInfo.otpExpiry && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    OTP Expires
                  </span>
                  <span className="text-sm font-mono">{new Date(otpInfo.otpExpiry).toLocaleString()}</span>
                </div>
              )}

              {otpInfo.isOTPExpired !== null && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="flex items-center text-gray-700">
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    OTP Expired
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
              Account Timeline
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-gray-700 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    Account Created
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-600 ml-6">
                  {new Date(timestamps.createdAt).toLocaleDateString()} at {new Date(timestamps.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center text-gray-700 text-sm font-medium">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Last Updated
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-600 ml-6">
                  {new Date(timestamps.updatedAt).toLocaleDateString()} at {new Date(timestamps.updatedAt).toLocaleTimeString()}
                </p>
              </div>

              {securityInfo.lastPasswordReset && (
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center text-orange-700 text-sm font-medium">
                      <Key className="w-4 h-4 mr-2" />
                      Password Reset
                    </span>
                  </div>
                  <p className="text-sm font-mono text-orange-600 ml-6">
                    {new Date(securityInfo.lastPasswordReset).toLocaleDateString()} at {new Date(securityInfo.lastPasswordReset).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Inspection Info */}
        <motion.div
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between text-sm text-blue-800">
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2" />
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