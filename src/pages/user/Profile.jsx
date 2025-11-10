"use client"

import { useEffect, useState, useContext, useRef } from "react"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import {
  Edit3,
  Camera,
  LogOut,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Send,
  Shield,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  fetchLoginUser,
  updateProfilePicture,
  updateProfile,
  deleteAccountOfOwn,
} from "../../services/users"
import { changePassword } from "../../services/auth"
import OrdersComponent from "../../components/user/OrdersComponent"

const UserProfile = () => {
  const { logout, updateUser, sendVerificationMail, verifyMail } = useContext(AuthContext)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Email verification state
  const [sendingVerification, setSendingVerification] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const otpModalRef = useRef(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [fieldToEdit, setFieldToEdit] = useState("")
  const [editValue, setEditValue] = useState("")
  const modalRef = useRef(null)

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const passwordModalRef = useRef(null)

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const deleteModalRef = useRef(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchLoginUser()
        setUser(data)
      } catch (error) {
        console.error("Failed to fetch user:", error)
        toast.error("Failed to load user profile.")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false)
      }
      if (passwordModalRef.current && !passwordModalRef.current.contains(e.target)) {
        setShowPasswordModal(false)
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
        setShowDeleteModal(false)
      }
      if (otpModalRef.current && !otpModalRef.current.contains(e.target)) {
        setShowOtpModal(false)
      }
    }

    if (showModal || showPasswordModal || showDeleteModal || showOtpModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal, showPasswordModal, showDeleteModal, showOtpModal])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good morning"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    if (hour >= 17 && hour < 22) return "Good evening"
    return "Hello"
  }

  const handleLogout = () => {
    logout()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const { image } = await updateProfilePicture(file)
      const updatedUser = { ...user, profileImage: image }
      setUser(updatedUser)
      updateUser(updatedUser)
      toast.success("Profile picture updated!")
    } catch (error) {
      console.error("Error uploading profile image:", error)
      toast.error("Failed to update profile picture.")
    } finally {
      setUploading(false)
    }
  }

  const openEditModal = (field) => {
    setFieldToEdit(field)
    setEditValue(user[field])
    setShowModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      const response = await updateProfile({ [fieldToEdit]: editValue })

      // Update local user state with the correct field name
      const updatedUser = { ...user, [fieldToEdit]: editValue }
      setUser(updatedUser)

      // Update context and localStorage/sessionStorage
      updateUser(updatedUser)

      toast.success(`${fieldToEdit === "number" ? "Phone number" : fieldToEdit} updated successfully!`)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Update failed.")
    } finally {
      setShowModal(false)
    }
  }

  // Email verification functions
  const handleSendVerification = async () => {
    setSendingVerification(true)
    try {
      await sendVerificationMail()
      toast.success("Verification email sent! Please check your inbox.")
      setShowOtpModal(true)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      toast.error("Failed to send verification email. Please try again.")
    } finally {
      setSendingVerification(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP")
      return
    }

    setVerifyingOtp(true)
    try {
      await verifyMail(otp)
      const updatedUser = { ...user, verified: true }
      setUser(updatedUser)
      updateUser(updatedUser)
      toast.success("Email verified successfully!")
      setShowOtpModal(false)
      setOtp("")
    } catch (error) {
      console.error("Failed to verify OTP:", error)
      toast.error("Invalid OTP. Please try again.")
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Password change functions
  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    })
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    })
    setShowPasswordModal(true)
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData

    if (!currentPassword.trim()) {
      toast.error("Current password is required")
      return false
    }

    if (!newPassword.trim()) {
      toast.error("New password is required")
      return false
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long")
      return false
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match")
      return false
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password")
      return false
    }

    return true
  }

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return

    setPasswordLoading(true)
    try {
      const { currentPassword, newPassword, confirmNewPassword } = passwordData
      await changePassword(currentPassword, newPassword, confirmNewPassword)

      toast.success("Password changed successfully!")
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    } catch (error) {
      console.error("Password change error:", error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Delete account functions
  const openDeleteModal = () => {
    setDeletePassword("")
    setShowDeletePassword(false)
    setDeleteConfirmation("")
    setShowDeleteModal(true)
  }

  const validateDeleteForm = () => {
    if (!deletePassword.trim()) {
      toast.error("Password is required to delete your account")
      return false
    }

    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm account deletion')
      return false
    }

    return true
  }

  const handleDeleteAccount = async () => {
    if (!validateDeleteForm()) return

    setDeleteLoading(true)
    try {
      await deleteAccountOfOwn(deletePassword)

      toast.success("Account deleted successfully. We're sorry to see you go!")

      // Clear user data and redirect
      setTimeout(() => {
        logout() // This will clear the auth context
        navigate("/")
      }, 2000)
    } catch (error) {
      console.error("Delete account error:", error)
      toast.error(error.message || "Failed to delete account. Please check your password.")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading your profile...
          </p>
        </motion.div>
      </div>
    )

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl text-gray-600">No user data available</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 py-8 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Greeting */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {getGreeting()}, {user.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-600 text-lg">Welcome to your profile dashboard</p>
          </motion.div>

          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-10">
            {/* Profile Image */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                {user.profileImage ? (
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl border-4 border-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>

                {/* Upload Input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  id="profileImageInput"
                  className="hidden"
                />
                <label
                  htmlFor="profileImageInput"
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-white"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5 text-white" />
                </label>
              </div>

              {uploading && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/90 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </motion.div>
              )}
            </motion.div>

            {/* User Info */}
            <motion.div
              className="flex-1 space-y-6 text-center lg:text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {/* Name */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-xl font-bold text-gray-800">{user.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal("name")}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 text-purple-600 hover:text-purple-700"
                    title="Edit name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Email with Verification Status */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        {user.verified ? (
                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Unverified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-800 break-all">{user.email}</p>
                      {!user.verified && (
                        <button
                          onClick={handleSendVerification}
                          disabled={sendingVerification}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{sendingVerification ? "Sending..." : "Send verification email"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal("email")}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 text-blue-600 hover:text-blue-700"
                    title="Edit email"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-800 break-all">{user.number || "Not provided"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal("number")}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 text-blue-600 hover:text-blue-700"
                    title="Edit Phone"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Orders Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <OrdersComponent user={user} />
        </motion.div>

        {/* Security Settings Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-purple-600" />
            Security Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Password Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Password</p>
                    <p className="text-lg font-semibold text-gray-800">••••••••••••</p>
                    <p className="text-xs text-gray-400 mt-1">Last changed: Never</p>
                  </div>
                </div>
                <button
                  onClick={openPasswordModal}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 text-blue-600 hover:text-blue-700"
                  title="Change password"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delete Account</p>
                    <p className="text-lg font-semibold text-gray-800">Permanently remove</p>
                    <p className="text-xs text-gray-400 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={openDeleteModal}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 text-red-600 hover:text-red-700"
                  title="Delete account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Details Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
            Account Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* User ID */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border border-gray-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{user._id}</p>
                </div>
              </div>
            </div>

            {/* Account Created */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Created</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-100/50 md:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </motion.div>
      </motion.div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={otpModalRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Verify Email
                  </h2>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    We've sent a verification code to your email address. Please enter the code below to verify your account.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-gray-800 text-center text-lg font-mono"
                    placeholder="Enter OTP"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSendVerification}
                    disabled={sendingVerification}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{sendingVerification ? "Resending..." : "Resend code"}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-0 flex space-x-3">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
                  disabled={verifyingOtp}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || !otp.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingOtp ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit {fieldToEdit}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                  {fieldToEdit === "name"
                    ? "Full Name"
                    : fieldToEdit === "email"
                      ? "Email Address"
                      : fieldToEdit === "number"
                        ? "Phone Number"
                        : fieldToEdit}
                </label>
                <input
                  type={fieldToEdit === "email" ? "email" : fieldToEdit === "number" ? "tel" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-800"
                  placeholder={`Enter your ${fieldToEdit === "number" ? "phone number" : fieldToEdit}`}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-0 flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={passwordModalRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </h2>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-800 pr-12"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-800 pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-800 pr-12"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Password Strength:</p>
                    <div className="flex space-x-1">
                      <div
                        className={`h-2 flex-1 rounded ${passwordData.newPassword.length >= 6 ? "bg-green-400" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-2 flex-1 rounded ${passwordData.newPassword.length >= 8 ? "bg-green-400" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-2 flex-1 rounded ${/[A-Z]/.test(passwordData.newPassword) ? "bg-green-400" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-2 flex-1 rounded ${/[0-9]/.test(passwordData.newPassword) ? "bg-green-400" : "bg-gray-300"}`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-0 flex space-x-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing...</span>
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={deleteModalRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Delete Account
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">This action cannot be undone!</h3>
                      <p className="text-sm text-red-700">
                        Deleting your account will permanently remove all your data, including your profile, settings,
                        and any associated information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type "DELETE" to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 text-gray-800"
                    placeholder="Type DELETE to confirm"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter your password to confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 text-gray-800 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                    >
                      {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-0 flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== "DELETE" || !deletePassword.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserProfile
